import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  AlertTriangle,
  Calendar,
  Camera,
  CheckCircle,
  ChevronDown,
  Clock,
  Loader2,
  Paperclip,
  Receipt,
  Timer,
  User,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AnswerCard,
  averageScore,
  isIssue,
  scoreTone,
  type CompletedVisitAnswer,
} from '@/components/missions/CompletedVisitsDialog';
import { AdminVisit, useApproveVisit, useRejectVisit } from '@/hooks/useAdminVisits';
import { buildCompletedVisits, getMissionPhotoSlots, getMissionReceiptCap } from '@/lib/visitAnswers';
import { CURRENCY } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface VisitReviewDialogProps {
  visit: AdminVisit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AnswerSection {
  key: string;
  label: string;
  labelAr?: string;
  answers: CompletedVisitAnswer[];
}

export function VisitReviewDialog({ visit, open, onOpenChange }: VisitReviewDialogProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const approveVisit = useApproveVisit();
  const rejectVisit = useRejectVisit();

  const normalizedVisit = useMemo(() => {
    if (!visit?.mission) return null;
    return buildCompletedVisits(visit.mission, [visit])[0] || null;
  }, [visit]);

  const sections = useMemo<AnswerSection[]>(() => {
    const map = new Map<string, AnswerSection>();
    for (const answer of normalizedVisit?.answers || []) {
      const key = answer.section_id || answer.section || 'general';
      const current = map.get(key);
      if (current) current.answers.push(answer);
      else {
        map.set(key, {
          key,
          label: answer.section || 'General',
          labelAr: answer.section_ar,
          answers: [answer],
        });
      }
    }
    return [...map.values()];
  }, [normalizedVisit]);

  useEffect(() => {
    setShowRejectForm(false);
    setRejectionReason('');
    setOpenSections(sections[0] ? { [sections[0].key]: true } : {});
  }, [visit?.id, sections]);

  if (!visit) return null;

  const photoSlots = getMissionPhotoSlots(visit.mission);
  const receiptCap = getMissionReceiptCap(visit.mission);
  const answers = normalizedVisit?.answers || [];
  const photos = normalizedVisit?.photos || [];
  const overallScore = averageScore(answers);
  const issueCount = answers.filter(isIssue).length;
  const evidenceCount = photos.length
    + answers.reduce((sum, answer) => sum + (answer.attachments || []).length, 0)
    + (normalizedVisit?.receipt_photo ? 1 : 0);
  const isSubmitted = visit.status === 'submitted';
  const answerIndex = new Map(answers.map((answer, index) => [answer, index]));

  const scheduleInfo = visit.scheduled_date
    ? { date: visit.scheduled_date, time: visit.scheduled_time, duration: visit.scheduled_duration }
    : visit.schedule_id && visit.mission?.visit_schedules
      ? (visit.mission.visit_schedules as Array<{ id: string; date?: string; time?: string; duration?: number }>)
          .find((schedule) => schedule.id === visit.schedule_id)
      : null;

  const formatDuration = (minutes?: number | null) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatCurrency = (amount: number) => `${amount.toLocaleString(CURRENCY.locale)} EGP`;

  const handleApprove = async () => {
    await approveVisit.mutateAsync(visit.id);
    onOpenChange(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    await rejectVisit.mutateAsync({ visitId: visit.id, reason: rejectionReason });
    setRejectionReason('');
    setShowRejectForm(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[95vh] max-h-[95vh] w-[95vw] max-w-[95vw] flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pe-14">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>Review Visit Submission</DialogTitle>
            <Badge
              className={cn(
                visit.status === 'approved' && 'bg-success text-success-foreground',
                visit.status === 'rejected' && 'bg-destructive text-destructive-foreground',
                visit.status === 'submitted' && 'bg-warning text-warning-foreground',
              )}
            >
              {visit.status?.replace('_', ' ')}
            </Badge>
          </div>
          <DialogDescription>
            {visit.mission?.name || 'Mission'} · Submitted {visit.submitted_at ? format(new Date(visit.submitted_at), 'PPpp') : 'N/A'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 md:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="border-b border-border bg-muted/20 p-4 md:overflow-y-auto md:border-b-0 md:border-e">
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                  <User className="h-4 w-4" /> Agent
                </div>
                <p className="text-sm font-semibold">{visit.agent?.full_name || 'Mystery Shopper'}</p>
                <p className="text-xs text-muted-foreground">Tier {visit.agent?.tier || 'C'}</p>
                <p className="mt-2 break-all text-xs text-muted-foreground">{visit.agent?.email || '—'}</p>
                <p className="text-xs text-muted-foreground">{visit.agent?.phone || '—'}</p>
              </div>

              {scheduleInfo && (
                <div className="space-y-2 border-t border-border pt-4 text-xs">
                  <div className="mb-2 font-bold uppercase text-muted-foreground">Visit schedule</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{scheduleInfo.date ? format(parseISO(scheduleInfo.date), 'MMM d, yyyy') : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{scheduleInfo.time || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(scheduleInfo.duration)}</span>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4 text-xs">
                <div className="mb-2 flex items-center gap-2 font-bold uppercase text-muted-foreground">
                  <Receipt className="h-4 w-4" /> Purchase
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Spent</span>
                  <span className="font-semibold">{formatCurrency(Number(visit.purchase_amount || 0))}</span>
                </div>
                <div className="mt-1 flex justify-between gap-3">
                  <span className="text-muted-foreground">Allowed</span>
                  <span>{formatCurrency(Number(visit.mission?.purchase_budget_per_visit || 0))}</span>
                </div>
              </div>

              {visit.status === 'rejected' && visit.rejection_reason && (
                <div className="border border-destructive/30 bg-destructive/5 p-3 text-xs">
                  <div className="mb-1 flex items-center gap-2 font-bold text-destructive">
                    <XCircle className="h-4 w-4" /> Rejection reason
                  </div>
                  <p>{visit.rejection_reason}</p>
                </div>
              )}
            </div>
          </aside>

          <ScrollArea className="min-h-0">
            <main className="space-y-5 p-4 md:p-6">
              <section className="border border-border">
                <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <h3 className="font-bold">Visit result</h3>
                    <p className="text-xs text-muted-foreground">Operational score based on measurable submitted answers.</p>
                  </div>
                  <div className="text-end">
                    <div className={cn('text-3xl font-black leading-none', scoreTone(overallScore))}>
                      {overallScore === null ? '—' : `${overallScore}%`}
                    </div>
                    <div className="text-[11px] uppercase text-muted-foreground">Visit score</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 border-t border-border text-center">
                  <SummaryValue value={formatCurrency(Number(visit.purchase_amount || 0))} label="Spent" />
                  <SummaryValue value={String(evidenceCount)} label="Photos & files" bordered />
                  <SummaryValue value={String(issueCount)} label="Needs attention" bordered tone={issueCount ? 'danger' : 'success'} />
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold">Question responses</h3>
                    <p className="text-xs text-muted-foreground">Open only the section you need to review.</p>
                  </div>
                  <Badge variant="secondary">{answers.length} questions</Badge>
                </div>

                {sections.length ? (
                  <div className="space-y-2">
                    {sections.map((section) => {
                      const sectionScore = averageScore(section.answers);
                      const sectionIssues = section.answers.filter(isIssue).length;
                      const isOpen = Boolean(openSections[section.key]);
                      return (
                        <Collapsible
                          key={section.key}
                          open={isOpen}
                          onOpenChange={(nextOpen) => setOpenSections((current) => ({ ...current, [section.key]: nextOpen }))}
                          className="border border-border"
                        >
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="h-auto w-full justify-start rounded-none px-4 py-3 hover:bg-muted/50">
                              <ChevronDown className={cn('me-2 h-4 w-4 shrink-0 transition-transform', !isOpen && '-rotate-90')} />
                              <div className="min-w-0 flex-1 text-start">
                                <div className="truncate text-sm font-bold">{section.label}</div>
                                {section.labelAr && <div className="truncate font-ar text-xs font-normal text-muted-foreground" dir="rtl">{section.labelAr}</div>}
                              </div>
                              <span className="text-xs font-normal text-muted-foreground">{section.answers.length}</span>
                              {sectionIssues > 0 && (
                                <span className="ms-2 inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                                  <AlertTriangle className="h-3.5 w-3.5" /> {sectionIssues}
                                </span>
                              )}
                              <span className={cn('ms-3 text-sm font-black', scoreTone(sectionScore))}>
                                {sectionScore === null ? '—' : `${sectionScore}%`}
                              </span>
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-3 border-t border-border bg-muted/10 p-3">
                            {section.answers.map((answer) => (
                              <div key={answer.question_id || answerIndex.get(answer)} className="space-y-1.5">
                                {answer.metric_key && (
                                  <div className="flex justify-end">
                                    <Badge variant="outline" className="text-[10px]">Metric: {answer.metric_key.replace(/_/g, ' ')}</Badge>
                                  </div>
                                )}
                                <AnswerCard
                                  index={(answerIndex.get(answer) ?? 0) + 1}
                                  answer={answer}
                                  yesLabel="Yes"
                                  noLabel="No"
                                  naLabel="Not applicable"
                                />
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No responses submitted.</div>
                )}
              </section>

              {(photos.length > 0 || photoSlots.length > 0) && (
                <details className="border border-border" open>
                  <summary className="flex cursor-pointer items-center gap-2 p-3 text-sm font-bold uppercase">
                    <Camera className="h-4 w-4" /> General photos
                    <span className="text-xs font-normal text-muted-foreground">{photos.length}/{Math.max(photos.length, photoSlots.length)}</span>
                  </summary>
                  <div className="grid gap-3 border-t border-border p-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: Math.max(photos.length, photoSlots.length) }).map((_, index) => {
                      const slot = photoSlots[index];
                      const photo = slot ? photos.find((item) => item.slot_id === slot.id) || photos[index] : photos[index];
                      const missingRequired = Boolean(slot && slot.required !== false && !photo?.url);
                      return (
                        <div key={slot?.id || index} className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">{slot?.label?.en || slot?.label?.ar || `Photo ${index + 1}`}</span>
                            {slot && <Badge variant="secondary" className="text-[10px]">{slot.required === false ? 'Optional' : 'Required'}</Badge>}
                          </div>
                          {photo?.url ? (
                            <a href={photo.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden border border-border bg-muted hover:opacity-90">
                              <img src={photo.url} alt={slot?.label?.en || `Visit photo ${index + 1}`} loading="lazy" className="aspect-[4/3] w-full object-contain" />
                            </a>
                          ) : (
                            <div className={cn('flex aspect-[4/3] flex-col items-center justify-center gap-2 border border-dashed', missingRequired ? 'border-destructive/40 bg-destructive/5 text-destructive' : 'border-border text-muted-foreground')}>
                              <Camera className="h-5 w-5" />
                              <span className="text-xs font-semibold">No photo submitted</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </details>
              )}

              {(normalizedVisit?.receipt_photo || receiptCap !== undefined || visit.mission?.receipt?.enabled) && (
                <details className="border border-border" open>
                  <summary className="flex cursor-pointer items-center gap-2 p-3 text-sm font-bold uppercase">
                    <Paperclip className="h-4 w-4" /> Receipt
                    {receiptCap !== undefined && <span className="text-xs font-normal text-muted-foreground">cap {formatCurrency(receiptCap)}</span>}
                  </summary>
                  <div className="grid gap-4 border-t border-border p-3 sm:grid-cols-[minmax(0,24rem)_1fr]">
                    {normalizedVisit?.receipt_photo ? (
                      <a href={normalizedVisit.receipt_photo} target="_blank" rel="noopener noreferrer" className="block overflow-hidden border border-border bg-muted hover:opacity-90">
                        <img src={normalizedVisit.receipt_photo} alt="Receipt" loading="lazy" className="aspect-[4/3] w-full object-contain" />
                      </a>
                    ) : (
                      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 border border-dashed border-destructive/40 bg-destructive/5 text-destructive">
                        <Paperclip className="h-5 w-5" />
                        <span className="text-xs font-semibold">Required receipt not submitted</span>
                      </div>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Submitted amount</span><strong>{formatCurrency(Number(visit.purchase_amount || 0))}</strong></div>
                      {receiptCap !== undefined && <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Receipt cap</span><strong>{formatCurrency(receiptCap)}</strong></div>}
                      {receiptCap !== undefined && Number(visit.purchase_amount || 0) > receiptCap && (
                        <p className="flex items-center gap-2 font-semibold text-destructive"><AlertTriangle className="h-4 w-4" /> Submitted amount exceeds the receipt cap.</p>
                      )}
                    </div>
                  </div>
                </details>
              )}

              {showRejectForm && (
                <section className="space-y-3 border border-destructive/40 bg-destructive/5 p-4">
                  <h3 className="font-bold text-destructive">Rejection reason</h3>
                  <p className="text-sm text-muted-foreground">This visit will be re-queued for another agent and the current agent will not receive payment.</p>
                  <Textarea placeholder="Please provide a reason for rejection..." value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} rows={3} />
                  <div className="flex flex-wrap gap-2">
                    <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason.trim() || rejectVisit.isPending}>
                      {rejectVisit.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />} Confirm rejection
                    </Button>
                    <Button variant="outline" onClick={() => { setShowRejectForm(false); setRejectionReason(''); }}>Cancel</Button>
                  </div>
                </section>
              )}
            </main>
          </ScrollArea>
        </div>

        {isSubmitted && !showRejectForm && (
          <DialogFooter className="shrink-0 gap-2 border-t border-border px-5 py-3 sm:gap-2">
            <Button variant="outline" onClick={() => setShowRejectForm(true)} className="gap-2">
              <XCircle className="h-4 w-4" /> Reject
            </Button>
            <Button onClick={handleApprove} disabled={approveVisit.isPending} className="gap-2">
              {approveVisit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Approve visit
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SummaryValue({ value, label, bordered, tone }: { value: string; label: string; bordered?: boolean; tone?: 'success' | 'danger' }) {
  return (
    <div className={cn('min-w-0 p-2.5', bordered && 'border-s border-border')}>
      <div className={cn('truncate text-sm font-bold', tone === 'success' && 'text-success', tone === 'danger' && 'text-destructive')}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}