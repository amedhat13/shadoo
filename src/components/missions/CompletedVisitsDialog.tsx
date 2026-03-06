import { useState } from 'react';
import { CheckCircle2, Clock, User, MapPin, Camera, MessageSquare, X, ChevronRight, EyeOff } from 'lucide-react';
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
import { CURRENCY, QUESTION_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export interface CompletedVisit {
  id: string;
  agent_name: string;
  completed_at: string;
  purchase_amount: number;
  photos: string[];
  answers: {
    question: string;
    type: string;
    answer: string | number | boolean;
  }[];
  rating?: number;
}

interface CompletedVisitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visits: CompletedVisit[];
  missionName: string;
}

export function CompletedVisitsDialog({
  open,
  onOpenChange,
  visits,
  missionName,
}: CompletedVisitsDialogProps) {
  const [selectedVisit, setSelectedVisit] = useState<CompletedVisit | null>(null);
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
                    onClick={() => setSelectedVisit(visit)}
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
                  {/* Header - agent name hidden */}
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
                      <div className="grid grid-cols-3 gap-2">
                        {selectedVisit.photos.map((photo, idx) => (
                          <div
                            key={idx}
                            className="aspect-square bg-muted border border-border flex items-center justify-center"
                          >
                            <Camera className="h-6 w-6 text-muted-foreground" />
                          </div>
                        ))}
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
