import { forwardRef, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Camera, MessageSquare, EyeOff, Star, Loader2, Paperclip, AlertTriangle, CircleCheck, CircleX, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { CURRENCY } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { CommentMode, PhotoSlot, QuestionPhotoRequirement, SuggestedComment } from '@/types';

export interface CompletedVisitAnswer {
  question_id?: string;
  question: string;
  question_ar?: string;
  description?: string;
  description_ar?: string;
  section?: string;
  section_id?: string;
  section_ar?: string;
  type: string;
  required?: boolean;
  max_rating?: number;
  allow_na?: boolean;
  comment_mode?: CommentMode;
  suggested_comments?: SuggestedComment[];
  metric_key?: string;
  options?: { id: string; en?: string; ar?: string }[];
  photo_requirement?: QuestionPhotoRequirement;
  attachments?: string[];
  answer: string | number | boolean | string[];
  not_applicable?: boolean;
  comment?: string;
}

export interface CompletedVisit {
  id: string;
  agent_name: string;
  completed_at: string;
  purchase_amount: number;
  photos: { url: string; slot_id?: string }[];
  receipt_photo?: string;
  answers: CompletedVisitAnswer[];
  rating?: number;
  client_rating?: number;
  client_feedback?: string;
  rated_at?: string;
}

interface CompletedVisitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visits: CompletedVisit[];
  missionName: string;
  photoSlots?: PhotoSlot[];
  receiptCap?: number;
  onRateVisit?: (visitId: string, rating: number, feedback?: string) => Promise<void>;
}

const StarRating = forwardRef<HTMLDivElement, {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}>(function StarRating({ value, onChange, readonly = false }, ref) {
  const [hover, setHover] = useState(0);

  return (
    <div ref={ref} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={cn('transition-colors', readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110')}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          aria-label={`${readonly ? 'Rated' : 'Rate'} ${star} stars`}
        >
          <Star
            className={cn(
              'h-5 w-5 transition-colors',
              (hover || value) >= star ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
            )}
          />
        </button>
      ))}
    </div>
  );
});

/** Score of a single answer as a 0-100 percentage, or null when it doesn't count. */
function answerScore(a: CompletedVisitAnswer): number | null {
  if (a.not_applicable) return null;
  if (a.type === 'rating' && typeof a.answer === 'number') {
    const max = a.max_rating || 5;
    return max > 0 ? Math.round((a.answer / max) * 100) : null;
  }
  if (a.type === 'yes_no') {
    const normalized = typeof a.answer === 'string' ? a.answer.toLowerCase() : a.answer;
    if (normalized === true || normalized === 'yes') return 100;
    if (normalized === false || normalized === 'no') return 0;
  }
  return null;
}

/** An answer needing the client's attention: weak score, or missing required evidence. */
function isIssue(a: CompletedVisitAnswer): boolean {
  const score = answerScore(a);
  if (score !== null && score <= 60) return true;
  if (a.comment_mode === 'required' && !a.comment && !a.not_applicable) return true;
  if (a.photo_requirement?.enabled && !(a.attachments || []).length && !a.not_applicable) return true;
  return false;
}

function averageScore(answers: CompletedVisitAnswer[]): number | null {
  const scores = answers.map(answerScore).filter((s): s is number => s !== null);
  if (!scores.length) return null;
  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}

function scoreTone(score: number | null) {
  if (score === null) return 'text-muted-foreground';
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-amber-500';
  return 'text-destructive';
}

export function CompletedVisitsDialog({
  open,
  onOpenChange,
  visits,
  missionName,
  photoSlots,
  receiptCap,
  onRateVisit,
}: CompletedVisitsDialogProps) {
  const [selectedVisit, setSelectedVisit] = useState<CompletedVisit | null>(null);
  const [pendingRating, setPendingRating] = useState(0);
  const [pendingFeedback, setPendingFeedback] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('all');
  const [issuesOnly, setIssuesOnly] = useState(false);
  const { t } = useTranslation('missions');
  const { t: tc } = useTranslation('common');

  useEffect(() => {
    if (!open) return;
    setSelectedVisit((current) => visits.find((visit) => visit.id === current?.id) || visits[0] || null);
  }, [open, visits]);

  useEffect(() => {
    setActiveSection('all');
    setIssuesOnly(false);
  }, [selectedVisit?.id]);

  const sections = useMemo(() => {
    const answers = selectedVisit?.answers || [];
    const map = new Map<string, { key: string; label: string; answers: CompletedVisitAnswer[] }>();
    answers.forEach((a) => {
      const key = a.section_id || a.section || 'general';
      const existing = map.get(key);
      if (existing) existing.answers.push(a);
      else map.set(key, { key, label: a.section || tc('general', 'General'), answers: [a] });
    });
    return [...map.values()];
  }, [selectedVisit, tc]);

  const visibleAnswers = useMemo(() => {
    let list = selectedVisit?.answers || [];
    if (activeSection !== 'all') {
      list = sections.find((s) => s.key === activeSection)?.answers || [];
    }
    if (issuesOnly) list = list.filter(isIssue);
    return list;
  }, [selectedVisit, sections, activeSection, issuesOnly]);

  const overall = averageScore(selectedVisit?.answers || []);
  const issueCount = (selectedVisit?.answers || []).filter(isIssue).length;
  const evidenceCount =
    (selectedVisit?.photos.length || 0) +
    (selectedVisit?.answers || []).reduce((sum, a) => sum + (a.attachments || []).length, 0) +
    (selectedVisit?.receipt_photo ? 1 : 0);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-EG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatCurrency = (amount: number) => `${amount.toLocaleString(CURRENCY.locale)} ${tc('currency_code')}`;

  const handleSubmitRating = async () => {
    if (!selectedVisit || !pendingRating || !onRateVisit) return;
    setIsSubmittingRating(true);
    try {
      await onRateVisit(selectedVisit.id, pendingRating, pendingFeedback || undefined);
      selectedVisit.client_rating = pendingRating;
      selectedVisit.client_feedback = pendingFeedback;
      selectedVisit.rated_at = new Date().toISOString();
      setPendingRating(0);
      setPendingFeedback('');
      toast.success(t('rating.submitted_success'));
    } catch {
      toast.error(t('rating.submit_error'));
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const answerIndex = new Map((selectedVisit?.answers || []).map((a, i) => [a, i]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-5 w-5 text-success" />
            {t('details.completed_visits_title')} — {missionName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Review each visit score, answers by section, evidence photos and the receipt.
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[70vh] min-h-0 flex-col md:flex-row">
          {/* Visit list */}
          <div className="h-24 shrink-0 border-b border-border md:h-full md:w-[15rem] md:border-b-0 md:border-e">
            <ScrollArea className="h-full">
              <div className="flex gap-2 p-2 md:block md:space-y-1">
                {visits.map((visit, index) => {
                  const score = averageScore(visit.answers);
                  const active = selectedVisit?.id === visit.id;
                  return (
                    <button
                      key={visit.id}
                      onClick={() => {
                        setSelectedVisit(visit);
                        setPendingRating(0);
                        setPendingFeedback('');
                      }}
                      aria-pressed={active}
                      className={cn(
                        'w-48 shrink-0 border border-transparent p-2.5 text-start transition-colors hover:bg-muted/60 md:w-full',
                        active && 'border-border bg-muted'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-success/10">
                          <EyeOff className="h-3.5 w-3.5 text-success" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {t('details.mystery_shopper')} #{index + 1}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">{formatDate(visit.completed_at)}</p>
                        </div>
                        {score !== null && (
                          <span className={cn('text-sm font-bold', scoreTone(score))}>{score}%</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Visit detail */}
          <div className="min-h-0 flex-1">
            {selectedVisit ? (
              <ScrollArea className="h-full">
                <div className="space-y-5 p-5">
                  {/* Summary */}
                  <div className="border border-border">
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div>
                        <h3 className="font-bold">{t('details.mystery_shopper')}</h3>
                        <p className="text-xs text-muted-foreground">
                          {t('details.completed_on')} {formatDate(selectedVisit.completed_at)}
                        </p>
                      </div>
                      <div className="text-end">
                        <div className={cn('text-3xl font-black leading-none', scoreTone(overall))}>
                          {overall === null ? '—' : `${overall}%`}
                        </div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Visit score</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 border-t border-border text-center">
                      <div className="border-e border-border p-2.5">
                        <div className="text-sm font-bold">{formatCurrency(selectedVisit.purchase_amount)}</div>
                        <div className="text-[11px] text-muted-foreground">Spent</div>
                      </div>
                      <div className="border-e border-border p-2.5">
                        <div className="text-sm font-bold">{evidenceCount}</div>
                        <div className="text-[11px] text-muted-foreground">Photos & files</div>
                      </div>
                      <div className="p-2.5">
                        <div className={cn('text-sm font-bold', issueCount ? 'text-destructive' : 'text-success')}>
                          {issueCount}
                        </div>
                        <div className="text-[11px] text-muted-foreground">Needs attention</div>
                      </div>
                    </div>
                  </div>

                  {/* Section filter */}
                  <div className="flex flex-wrap items-center gap-2">
                    <FilterPill
                      label="All"
                      score={overall}
                      count={selectedVisit.answers.length}
                      active={activeSection === 'all'}
                      onClick={() => setActiveSection('all')}
                    />
                    {sections.length > 1 &&
                      sections.map((s) => (
                        <FilterPill
                          key={s.key}
                          label={s.label}
                          score={averageScore(s.answers)}
                          count={s.answers.length}
                          active={activeSection === s.key}
                          onClick={() => setActiveSection(s.key)}
                        />
                      ))}
                    {issueCount > 0 && (
                      <button
                        onClick={() => setIssuesOnly((v) => !v)}
                        aria-pressed={issuesOnly}
                        className={cn(
                          'ms-auto inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold transition-colors',
                          issuesOnly
                            ? 'border-destructive bg-destructive/10 text-destructive'
                            : 'border-border text-muted-foreground hover:bg-muted'
                        )}
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Needs attention ({issueCount})
                      </button>
                    )}
                  </div>

                  {/* Answers */}
                  <div className="space-y-3">
                    {visibleAnswers.length === 0 ? (
                      <p className="border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                        Nothing to review here.
                      </p>
                    ) : (
                      visibleAnswers.map((answer) => (
                        <AnswerCard
                          key={answer.question_id || answerIndex.get(answer)}
                          index={(answerIndex.get(answer) ?? 0) + 1}
                          answer={answer}
                          yesLabel={tc('yes')}
                          noLabel={tc('no')}
                          naLabel={t('details.not_applicable', 'Not applicable')}
                        />
                      ))
                    )}
                  </div>

                  {/* Evidence */}
                  {(selectedVisit.photos.length > 0 || (photoSlots || []).length > 0) && (
                    <details className="border border-border" open>
                      <summary className="flex cursor-pointer items-center gap-2 p-3 text-sm font-bold uppercase tracking-wide">
                        <Camera className="h-4 w-4" />
                        {t('details.photos_label')}
                        <span className="text-xs font-normal text-muted-foreground">
                          {selectedVisit.photos.length}/{Math.max(selectedVisit.photos.length, photoSlots?.length || 0)}
                        </span>
                      </summary>
                      <div className="grid grid-cols-1 gap-3 border-t border-border p-3 sm:grid-cols-2">
                        {Array.from({ length: Math.max(selectedVisit.photos.length, photoSlots?.length || 0) }).map((_, idx) => {
                          const slot = photoSlots?.[idx];
                          const photo = slot
                            ? selectedVisit.photos.find((item) => item.slot_id === slot.id) || selectedVisit.photos[idx]
                            : selectedVisit.photos[idx];
                          return (
                            <div key={slot?.id || idx} className="space-y-2">
                              {slot && (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-semibold">{slot.label?.en || slot.label?.ar}</span>
                                  {slot.required !== false && (
                                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                                      {tc('required')}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {photo?.url ? (
                                <a
                                  href={photo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block overflow-hidden border border-border bg-muted transition-opacity hover:opacity-90"
                                >
                                  <img
                                    src={photo.url}
                                    alt={slot?.label?.en || `Visit photo ${idx + 1}`}
                                    loading="lazy"
                                    className="aspect-[4/3] w-full bg-muted object-contain"
                                  />
                                </a>
                              ) : (
                                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 border border-dashed border-destructive/40 bg-destructive/5 text-destructive">
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

                  {/* Receipt */}
                  {(selectedVisit.receipt_photo || receiptCap !== undefined) && (
                    <details className="border border-border">
                      <summary className="flex cursor-pointer items-center gap-2 p-3 text-sm font-bold uppercase tracking-wide">
                        <Paperclip className="h-4 w-4" />
                        Receipt
                        {receiptCap !== undefined && (
                          <span className="text-xs font-normal text-muted-foreground">
                            cap {formatCurrency(receiptCap)}
                          </span>
                        )}
                      </summary>
                      <div className="border-t border-border p-3">
                        {selectedVisit.receipt_photo ? (
                          <a
                            href={selectedVisit.receipt_photo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block max-w-sm overflow-hidden border border-border bg-muted transition-opacity hover:opacity-90"
                          >
                            <img
                              src={selectedVisit.receipt_photo}
                              alt="Receipt"
                              loading="lazy"
                              className="aspect-[4/3] w-full bg-muted object-contain"
                            />
                          </a>
                        ) : (
                          <div className="flex max-w-sm flex-col items-center justify-center gap-2 border border-dashed border-destructive/40 bg-destructive/5 p-6 text-destructive">
                            <Paperclip className="h-5 w-5" />
                            <span className="text-xs font-semibold">Required receipt not submitted</span>
                          </div>
                        )}
                      </div>
                    </details>
                  )}

                  {/* Rate the shopper */}
                  <details className="border border-border" open={!selectedVisit.client_rating}>
                    <summary className="flex cursor-pointer items-center gap-2 p-3 text-sm font-bold uppercase tracking-wide">
                      <Star className="h-4 w-4" />
                      {t('rating.rate_visit')}
                    </summary>
                    <div className="space-y-3 border-t border-border p-3">
                      {selectedVisit.client_rating ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <StarRating value={selectedVisit.client_rating} readonly />
                            <span className="text-sm text-muted-foreground">
                              {t('rating.rated_x', { rating: selectedVisit.client_rating })}
                            </span>
                          </div>
                          {selectedVisit.client_feedback && (
                            <p className="bg-muted/50 p-2 text-sm text-muted-foreground">{selectedVisit.client_feedback}</p>
                          )}
                        </div>
                      ) : (
                        <>
                          <StarRating value={pendingRating} onChange={setPendingRating} />
                          {pendingRating > 0 && (
                            <>
                              <Textarea
                                value={pendingFeedback}
                                onChange={(e) => setPendingFeedback(e.target.value.slice(0, 200))}
                                placeholder={t('rating.feedback_placeholder')}
                                className="h-20 resize-none"
                                maxLength={200}
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{pendingFeedback.length}/200</span>
                                <Button size="sm" onClick={handleSubmitRating} disabled={isSubmittingRating}>
                                  {isSubmittingRating && <Loader2 className="me-2 h-3 w-3 animate-spin" />}
                                  {t('rating.submit')}
                                </Button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </details>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <CheckCircle2 className="mx-auto mb-3 h-12 w-12 opacity-30" />
                  <p>{t('details.select_visit')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FilterPill({
  label,
  score,
  count,
  active,
  onClick,
}: {
  label: string;
  score: number | null;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 border px-3 py-1.5 text-xs font-semibold transition-colors',
        active ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-muted'
      )}
    >
      <span>{label}</span>
      <span className="text-[11px] text-muted-foreground">{count}</span>
      {score !== null && <span className={scoreTone(score)}>{score}%</span>}
    </button>
  );
}

/** One question: what was asked, what the shopper answered, and their evidence. */
function AnswerCard({
  index,
  answer,
  yesLabel,
  noLabel,
  naLabel,
}: {
  index: number;
  answer: CompletedVisitAnswer;
  yesLabel: string;
  noLabel: string;
  naLabel: string;
}) {
  const score = answerScore(answer);
  const attention = isIssue(answer);
  const attachments = answer.attachments || [];

  return (
    <div className={cn('border p-4', attention ? 'border-destructive/40 bg-destructive/5' : 'border-border')}>
      <div className="flex items-start gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-xs font-bold">{index}</div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{answer.question}</p>
              {answer.question_ar && (
                <p className="font-ar text-xs text-muted-foreground" dir="rtl">
                  {answer.question_ar}
                </p>
              )}
            </div>
            <AnswerValue answer={answer} score={score} yesLabel={yesLabel} noLabel={noLabel} naLabel={naLabel} />
          </div>

          {answer.comment && (
            <div
              className={cn(
                'flex items-start gap-2 border-s-2 p-2.5 text-sm',
                attention ? 'border-destructive bg-background' : 'border-primary bg-primary/5'
              )}
            >
              <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span>{answer.comment}</span>
            </div>
          )}

          {attention && !answer.comment && answer.comment_mode === 'required' && (
            <p className="text-xs font-semibold text-destructive">Comment was required but not provided.</p>
          )}
          {attention && answer.photo_requirement?.enabled && !attachments.length && !answer.not_applicable && (
            <p className="text-xs font-semibold text-destructive">Photo evidence was required but not provided.</p>
          )}

          {attachments.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {attachments.map((url, i) => (
                <a
                  key={`${url}-${i}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden border border-border bg-muted"
                >
                  <img src={url} alt={`Evidence ${i + 1}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                </a>
              ))}
            </div>
          )}

          {(answer.description || answer.description_ar) && (
            <details className="text-xs text-muted-foreground">
              <summary className="inline-flex cursor-pointer items-center gap-1 select-none">
                <ChevronDown className="h-3 w-3" />
                How this is scored
              </summary>
              <div className="mt-1 space-y-0.5 ps-4">
                {answer.description && <p>{answer.description}</p>}
                {answer.description_ar && (
                  <p className="font-ar" dir="rtl">
                    {answer.description_ar}
                  </p>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function AnswerValue({
  answer,
  score,
  yesLabel,
  noLabel,
  naLabel,
}: {
  answer: CompletedVisitAnswer;
  score: number | null;
  yesLabel: string;
  noLabel: string;
  naLabel: string;
}) {
  if (answer.not_applicable) {
    return (
      <Badge variant="secondary" className="shrink-0 whitespace-nowrap">
        {naLabel}
      </Badge>
    );
  }

  const raw = answer.answer;
  const normalized = typeof raw === 'string' ? raw.toLowerCase() : raw;

  if (answer.type === 'rating' && typeof raw === 'number') {
    const max = answer.max_rating || 5;
    return (
      <div className="shrink-0 text-end">
        <div className={cn('text-lg font-black leading-none', scoreTone(score))}>
          {raw}
          <span className="text-xs font-semibold text-muted-foreground">/{max}</span>
        </div>
        <div className="mt-1 h-1.5 w-20 overflow-hidden bg-muted">
          <div
            className={cn('h-full', score !== null && score >= 80 ? 'bg-success' : score !== null && score >= 60 ? 'bg-amber-500' : 'bg-destructive')}
            style={{ width: `${Math.max(0, Math.min(100, score ?? 0))}%` }}
          />
        </div>
      </div>
    );
  }

  if (answer.type === 'yes_no' || typeof raw === 'boolean' || normalized === 'yes' || normalized === 'no') {
    const positive = raw === true || normalized === 'yes';
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border px-2.5 py-1 text-xs font-bold',
          positive ? 'border-success/30 bg-success/10 text-success' : 'border-destructive/30 bg-destructive/10 text-destructive'
        )}
      >
        {positive ? <CircleCheck className="h-3.5 w-3.5" /> : <CircleX className="h-3.5 w-3.5" />}
        {positive ? yesLabel : noLabel}
      </span>
    );
  }

  const selected = answer.options?.find((option) => option.id === String(raw));
  const display = selected?.en || selected?.ar || (Array.isArray(raw) ? raw.join(', ') : String(raw || '—'));
  return <span className="max-w-[14rem] shrink-0 text-end text-sm font-medium">{display}</span>;
}
