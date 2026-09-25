import { forwardRef, useEffect, useState } from 'react';
import { CheckCircle2, Camera, MessageSquare, ChevronRight, EyeOff, Star, Loader2, Layers, Paperclip, BarChart3, CircleCheck, CircleX } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { CURRENCY, QUESTION_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { CommentMode, QuestionPhotoRequirement, SuggestedComment } from '@/types';

export interface CompletedVisitAnswer {
  question_id?: string;
  question: string;
  question_ar?: string;
  description?: string;
  description_ar?: string;
  section?: string;
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
  answer: string | number | boolean;
  not_applicable?: boolean;
  comment?: string;
}

export interface CompletedVisit {
  id: string;
  agent_name: string;
  completed_at: string;
  purchase_amount: number;
  photos: string[];
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
  photoSlots?: { id: string; label: { en?: string; ar?: string }; required?: boolean }[];
  receiptCap?: number;
  onRateVisit?: (visitId: string, rating: number, feedback?: string) => Promise<void>;
}


const StarRating = forwardRef<HTMLDivElement, {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}>(function StarRating({
  value, 
  onChange, 
  readonly = false 
}, ref) {
  const [hover, setHover] = useState(0);
  
  return (
    <div ref={ref} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={cn(
            'transition-colors',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          )}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          <Star
            className={cn(
              'h-5 w-5 transition-colors',
              (hover || value) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30'
            )}
          />
        </button>
      ))}
    </div>
  );
});

function groupBySection(answers: CompletedVisitAnswer[]) {
  const groups: { section?: string; section_ar?: string; answers: CompletedVisitAnswer[] }[] = [];
  answers.forEach((a) => {
    const last = groups[groups.length - 1];
    if (last && last.section === a.section) last.answers.push(a);
    else groups.push({ section: a.section, section_ar: a.section_ar, answers: [a] });
  });
  return groups;
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
  const { t } = useTranslation('missions');
  const { t: tc } = useTranslation('common');

  useEffect(() => {
    if (!open) return;
    setSelectedVisit((current) => visits.find((visit) => visit.id === current?.id) || visits[0] || null);
  }, [open, visits]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-EG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString(CURRENCY.locale)} ${tc('currency_code')}`;
  };

  const handleSubmitRating = async () => {
    if (!selectedVisit || !pendingRating || !onRateVisit) return;
    setIsSubmittingRating(true);
    try {
      await onRateVisit(selectedVisit.id, pendingRating, pendingFeedback || undefined);
      // Update local state
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            {t('details.completed_visits_title')} - {missionName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Review every submitted answer, attachment, required photo, and receipt for this mission.
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[68vh] min-h-0 flex-col md:flex-row">
          {/* Visit List */}
          <div className="h-32 shrink-0 border-b border-border md:h-full md:w-[18rem] md:border-b-0 md:border-r">
            <ScrollArea className="h-full">
              <div className="p-2">
                {visits.map((visit, index) => (
                  <button
                    key={visit.id}
                    onClick={() => {
                      setSelectedVisit(visit);
                      setPendingRating(0);
                      setPendingFeedback('');
                    }}
                    className={cn(
                      'w-full text-start p-3 transition-colors hover:bg-muted/50',
                      selectedVisit?.id === visit.id && 'bg-muted'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center bg-success/10">
                          <EyeOff className="h-4 w-4 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{t('details.mystery_shopper')} #{index + 1}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(visit.completed_at)}
                          </p>
                          {visit.client_rating && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs text-muted-foreground">{visit.client_rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Visit Details */}
          <div className="min-h-0 flex-1">
            {selectedVisit ? (
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg">{t('details.mystery_shopper')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('details.completed_on')} {formatDate(selectedVisit.completed_at)}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-success">
                      {formatCurrency(selectedVisit.purchase_amount)}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Rating Section */}
                  <div className="border border-border rounded-md p-4 space-y-3">
                    <h4 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      {t('rating.rate_visit')}
                    </h4>
                    
                    {selectedVisit.client_rating ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <StarRating value={selectedVisit.client_rating} readonly />
                          <span className="text-sm text-muted-foreground">
                            {t('rating.rated_x', { rating: selectedVisit.client_rating })}
                          </span>
                        </div>
                        {selectedVisit.client_feedback && (
                          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                            {selectedVisit.client_feedback}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <StarRating value={pendingRating} onChange={setPendingRating} />
                        {pendingRating > 0 && (
                          <>
                            <Textarea
                              value={pendingFeedback}
                              onChange={(e) => setPendingFeedback(e.target.value.slice(0, 200))}
                              placeholder={t('rating.feedback_placeholder')}
                              className="resize-none h-20"
                              maxLength={200}
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{pendingFeedback.length}/200</span>
                              <Button 
                                size="sm" 
                                onClick={handleSubmitRating} 
                                disabled={isSubmittingRating}
                              >
                                {isSubmittingRating && <Loader2 className="me-2 h-3 w-3 animate-spin" />}
                                {t('rating.submit')}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Answers grouped by section */}
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {t('details.answers')} ({selectedVisit.answers.length})
                    </h4>
                    <div className="space-y-6">
                      {groupBySection(selectedVisit.answers).map((group, gi) => (
                        <div key={gi} className="space-y-3">
                          {group.section && (
                            <div className="border-b border-border pb-2">
                              <div className="flex items-center gap-2">
                              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs font-bold uppercase tracking-wide">
                                {group.section}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{group.answers.length} questions</span>
                              </div>
                              {group.section_ar && <p className="mt-1 text-xs font-ar text-muted-foreground" dir="rtl">{group.section_ar}</p>}
                            </div>
                          )}
                          {group.answers.map((answer, idx) => (
                            <div key={answer.question_id || idx} className="border border-border p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-xs font-bold">{idx + 1}</div>
                                <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold">{answer.question}{answer.required && <span className="text-destructive">*</span>}</p>
                              {answer.question_ar && (
                                <p className="text-sm font-ar text-muted-foreground" dir="rtl">{answer.question_ar}</p>
                              )}
                              {(answer.description || answer.description_ar) && (
                                <div className="mt-1 space-y-0.5">
                                  {answer.description && (
                                    <p className="text-xs text-muted-foreground">{answer.description}</p>
                                  )}
                                  {answer.description_ar && (
                                    <p className="text-xs text-muted-foreground font-ar" dir="rtl">{answer.description_ar}</p>
                                  )}
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {QUESTION_TYPE_LABELS[answer.type] || answer.type}
                                {answer.type === 'rating' && answer.max_rating ? ` · ${answer.max_rating > 5 ? `0–${answer.max_rating}` : `1–${answer.max_rating}`}` : ''}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {answer.allow_na && <Badge variant="secondary" className="text-[10px]">N/A allowed</Badge>}
                                {answer.comment_mode && answer.comment_mode !== 'off' && (
                                  <Badge variant="secondary" className="text-[10px]">Comment {answer.comment_mode === 'required' ? 'required' : 'optional'}</Badge>
                                )}
                                {answer.photo_requirement?.enabled && <Badge variant="secondary" className="text-[10px]">Photo enabled</Badge>}
                                {answer.metric_key && (
                                  <Badge variant="outline" className="gap-1 text-[10px]"><BarChart3 className="h-3 w-3" />{answer.metric_key.replace(/_/g, ' ')}</Badge>
                                )}
                              </div>
                              {(answer.suggested_comments || []).some((comment) => comment.en || comment.ar) && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {(answer.suggested_comments || []).filter((comment) => comment.en || comment.ar).map((comment) => (
                                    <span key={comment.id} className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">{comment.en || comment.ar}</span>
                                  ))}
                                </div>
                              )}
                              {answer.not_applicable ? (
                                <div className="mt-3 border border-border bg-muted/40 p-3 text-sm font-medium">{t('details.not_applicable', 'Not applicable')}</div>
                              ) : (
                                <AnswerValue answer={answer} yesLabel={tc('yes')} noLabel={tc('no')} />
                              )}
                              {answer.comment && (
                                <div className="mt-3 border-s-2 border-primary bg-primary/5 p-3 text-sm">
                                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                  <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    Shopper comment
                                  </div>
                                  <span>{answer.comment}</span>
                                </div>
                              )}
                              {(answer.attachments || []).length > 0 && (
                                <MediaGrid title="Question attachments" urls={answer.attachments || []} icon="attachment" />
                              )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Photos — labelled with the mission's named slots */}
                  {selectedVisit.photos.length > 0 && (
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        {t('details.photos_label')} ({selectedVisit.photos.length})
                      </h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {selectedVisit.photos.map((photo, idx) => {
                          const slot = photoSlots?.[idx];
                          return (
                            <div key={idx} className="space-y-1">
                              {slot && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold">{slot.label?.en || slot.label?.ar}</span>
                                  {slot.required === false && (
                                    <span className="text-[10px] uppercase text-muted-foreground">{tc('optional')}</span>
                                  )}
                                </div>
                              )}
                              <a
                                href={photo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group bg-muted border border-border overflow-hidden block hover:opacity-90 transition-opacity"
                              >
                                <img
                                  src={photo}
                                  alt={slot?.label?.en || `Visit photo ${idx + 1}`}
                                  loading="lazy"
                                  className="aspect-[4/3] w-full object-contain bg-muted"
                                />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Receipt */}
                  {selectedVisit.receipt_photo && (
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        {tc('receipt') !== 'receipt' ? tc('receipt') : 'Receipt'}
                        {receiptCap !== undefined && (
                          <Badge variant="outline" className="text-xs font-normal">
                            {t('details.reimbursement_cap', 'Cap')}: {formatCurrency(receiptCap)}
                          </Badge>
                        )}
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
                      <a
                        href={selectedVisit.receipt_photo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-muted border border-border overflow-hidden hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={selectedVisit.receipt_photo}
                          alt="Receipt"
                          loading="lazy"
                          className="aspect-[4/3] w-full object-contain bg-muted"
                        />
                      </a>
                        <div className="border border-border p-3 text-sm">
                          <div className="text-xs text-muted-foreground">Amount spent</div>
                          <div className="mt-1 text-xl font-bold">{formatCurrency(selectedVisit.purchase_amount)}</div>
                          {receiptCap !== undefined && <div className="mt-3 text-xs text-muted-foreground">Reimbursement cap: {formatCurrency(receiptCap)}</div>}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </ScrollArea>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
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

function AnswerValue({ answer, yesLabel, noLabel }: { answer: CompletedVisitAnswer; yesLabel: string; noLabel: string }) {
  const raw = answer.answer;
  const normalized = typeof raw === 'string' ? raw.toLowerCase() : raw;
  if (answer.type === 'rating' && typeof raw === 'number') {
    const max = answer.max_rating || 5;
    return (
      <div className="mt-3 border border-border bg-muted/30 p-3">
        <div className="flex items-end justify-between gap-3">
          <span className="text-2xl font-black text-primary">{raw}</span>
          <span className="text-xs text-muted-foreground">out of {max}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden bg-muted"><div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, (raw / max) * 100))}%` }} /></div>
      </div>
    );
  }
  if (answer.type === 'yes_no' || typeof raw === 'boolean' || normalized === 'yes' || normalized === 'no') {
    const positive = raw === true || normalized === 'yes';
    return (
      <div className={cn('mt-3 flex items-center gap-2 border p-3 text-sm font-semibold', positive ? 'border-success/30 bg-success/5 text-success' : 'border-destructive/30 bg-destructive/5 text-destructive')}>
        {positive ? <CircleCheck className="h-5 w-5" /> : <CircleX className="h-5 w-5" />}
        {positive ? yesLabel : noLabel}
      </div>
    );
  }
  const selected = answer.options?.find((option) => option.id === String(raw));
  const display = selected?.en || selected?.ar || (Array.isArray(raw) ? raw.join(', ') : String(raw || '—'));
  return <div className="mt-3 border border-border bg-muted/40 p-3 text-sm font-medium">{display}</div>;
}

function MediaGrid({ title, urls, icon }: { title: string; urls: string[]; icon: 'attachment' | 'photo' }) {
  const Icon = icon === 'attachment' ? Paperclip : Camera;
  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"><Icon className="h-3.5 w-3.5" />{title}</div>
      <div className="grid grid-cols-2 gap-2">
        {urls.map((url, index) => (
          <a key={`${url}-${index}`} href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden border border-border bg-muted">
            <img src={url} alt={`${title} ${index + 1}`} loading="lazy" className="aspect-[4/3] w-full object-contain" />
          </a>
        ))}
      </div>
    </div>
  );
}
