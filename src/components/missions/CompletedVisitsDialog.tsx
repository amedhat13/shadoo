import { useState } from 'react';
import { CheckCircle2, Camera, MessageSquare, ChevronRight, EyeOff, Star, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
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

export interface CompletedVisit {
  id: string;
  agent_name: string;
  completed_at: string;
  purchase_amount: number;
  photos: string[];
  receipt_photo?: string;
  answers: {
    question: string;
    type: string;
    answer: string | number | boolean;
  }[];
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
  onRateVisit?: (visitId: string, rating: number, feedback?: string) => Promise<void>;
}

function StarRating({ 
  value, 
  onChange, 
  readonly = false 
}: { 
  value: number; 
  onChange?: (v: number) => void; 
  readonly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="flex gap-1">
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
}

export function CompletedVisitsDialog({
  open,
  onOpenChange,
  visits,
  missionName,
  onRateVisit,
}: CompletedVisitsDialogProps) {
  const [selectedVisit, setSelectedVisit] = useState<CompletedVisit | null>(null);
  const [pendingRating, setPendingRating] = useState(0);
  const [pendingFeedback, setPendingFeedback] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const { t } = useTranslation('missions');
  const { t: tc } = useTranslation('common');

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
        </DialogHeader>

        <div className="flex h-[60vh]">
          {/* Visit List */}
          <div className="w-1/3 border-r border-border">
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
                      'w-full text-left p-3 transition-colors hover:bg-muted/50',
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
          <div className="flex-1">
            {selectedVisit ? (
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
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

                  {/* Answers */}
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {t('details.answers')}
                    </h4>
                    <div className="space-y-3">
                      {selectedVisit.answers.map((answer, idx) => (
                        <div key={idx} className="border border-border p-3">
                          <p className="text-sm font-medium">{answer.question}</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            {QUESTION_TYPE_LABELS[answer.type] || answer.type}
                          </p>
                          <div className="bg-muted/50 p-2 text-sm">
                            {typeof answer.answer === 'boolean'
                              ? answer.answer ? tc('yes') : tc('no')
                              : String(answer.answer)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Photos */}
                  {selectedVisit.photos.length > 0 && (
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        {t('details.photos_label')} ({selectedVisit.photos.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedVisit.photos.map((photo, idx) => (
                          <a
                            key={idx}
                            href={photo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-muted border border-border overflow-hidden block hover:opacity-90 transition-opacity"
                          >
                            <img
                              src={photo}
                              alt={`Visit photo ${idx + 1}`}
                              loading="lazy"
                              className="w-full h-auto max-h-96 object-contain bg-muted"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Receipt */}
                  {selectedVisit.receipt_photo && (
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        {tc('receipt') !== 'receipt' ? tc('receipt') : 'Receipt'}
                      </h4>
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
                          className="w-full h-auto max-h-[32rem] object-contain bg-muted"
                        />
                      </a>
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
