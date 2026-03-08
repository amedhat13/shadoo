import { useState } from 'react';
import { getBilingualText } from '@/i18n/utils';
import { format, parseISO } from 'date-fns';
import {
  Users,
  Camera,
  DollarSign,
  HelpCircle,
  AlertTriangle,
  Check,
  Building2,
  Star,
  Calendar,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MissionFormData, Branch, Wallet } from '@/types';
import { CURRENCY, QUESTION_TYPE_LABELS, MESSAGES } from '@/lib/constants';
import { useActiveAgentTiers } from '@/hooks/useAgentTiers';
import { useTranslation } from 'react-i18next';

interface StepReviewProps {
  data: MissionFormData;
  branches: Branch[];
  wallet: Wallet;
  visitsRemaining: number;
  canPublish: boolean;
  publishBlockReason?: string;
  onPublish: () => Promise<void>;
  onSaveDraft: () => Promise<void>;
  isSubmitting: boolean;
}

export function StepReview({
  data,
  branches,
  wallet,
  visitsRemaining,
  canPublish,
  publishBlockReason,
  onPublish,
  onSaveDraft,
  isSubmitting,
}: StepReviewProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { t } = useTranslation('missions');

  const selectedBranches = branches.filter((b) => data.branch_ids.includes(b.id));
  const branchCount = selectedBranches.length || 1;
  const numberOfVisits = data.visit_schedules.length;
  const budgetPerMission = numberOfVisits * data.purchase_budget_per_visit;
  const totalVisitsAllMissions = numberOfVisits * branchCount;
  const totalPurchaseBudget = budgetPerMission * branchCount;
  const { data: agentTiers } = useActiveAgentTiers();
  const selectedTier = agentTiers?.find((t) => t.tier_code === data.agent_tier);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const { t: tc } = useTranslation('common');
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString(CURRENCY.locale)} ${tc('currency_code')}`;
  };

  const handlePublishClick = () => {
    if (canPublish) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmPublish = async () => {
    setShowConfirmDialog(false);
    await onPublish();
  };

  const questionsWithPhotoReq = data.questions.filter((q) => q.photoRequirement?.enabled);

  return (
    <div className="space-y-6">
      {/* Mission Basics */}
      <div className="border border-border p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wide">{t('review.mission_details')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{t('review.name_label')}</span>
            <p className="font-semibold">{data.name || t('review.not_specified')}</p>
          </div>
          <div>
            <span className="text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {t('review.branches_label')}
            </span>
            {selectedBranches.length === 0 ? (
              <p className="font-semibold">{t('review.not_specified')}</p>
            ) : selectedBranches.length === 1 ? (
              <p className="font-semibold">{selectedBranches[0].name}</p>
            ) : (
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedBranches.slice(0, 3).map((branch) => (
                  <Badge key={branch.id} variant="secondary" className="text-xs">
                    {branch.name}
                  </Badge>
                ))}
                {selectedBranches.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    {t('review.more_branches', { count: selectedBranches.length - 3 })}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        {branchCount > 1 && (
          <p className="text-xs text-primary font-medium mt-2">
            {t('review.missions_will_be_created', { count: branchCount })}
          </p>
        )}
      </div>

      {/* Agent Tier */}
      <div className="border border-border p-4 space-y-3">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <Star className="h-4 w-4" />
          {t('review.agent_tier')}
        </h3>
        {selectedTier && (
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm font-bold">
              {selectedTier.name}
            </Badge>
            <span className="text-sm text-muted-foreground">{selectedTier.description}</span>
          </div>
        )}
      </div>

      {/* Questions Summary */}
      <div className="border border-border p-4 space-y-3">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <HelpCircle className="h-4 w-4" />
          {t('review.questions_label', { count: data.questions.length })}
        </h3>
        {data.questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('review.no_questions')}</p>
        ) : (
          <ul className="space-y-2">
            {data.questions.map((q, i) => (
              <li key={q.id} className="flex items-start gap-2 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-muted text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="truncate block">{getBilingualText(q.text) || t('review.empty_question')}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">({QUESTION_TYPE_LABELS[q.type]})</span>
                    {q.photoRequirement?.enabled && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Camera className="h-3 w-3" />
                        {t('review.photo_on_negative')}
                      </Badge>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Photo Requirements */}
      <div className="border border-border p-4 space-y-3">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <Camera className="h-4 w-4" />
          {t('review.photo_requirements')}
        </h3>
        <div className="text-sm space-y-2">
          <p>
            <span className="text-muted-foreground">{t('review.general_required')} </span>
            <span className="font-semibold">{data.photo_requirements.required_count}</span>
          </p>
          {data.photo_requirements.instructions && (
            <p className="text-muted-foreground text-xs">
              {typeof data.photo_requirements.instructions === 'object'
                ? data.photo_requirements.instructions.en || data.photo_requirements.instructions.ar
                : data.photo_requirements.instructions}
            </p>
          )}
          {questionsWithPhotoReq.length > 0 && (
            <p className="text-xs text-primary">
              {t('review.questions_require_photo', { count: questionsWithPhotoReq.length })}
            </p>
          )}
        </div>
      </div>

      {/* Visit Schedules */}
      <div className="border border-border p-4 space-y-3">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <Calendar className="h-4 w-4" />
          {t('review.scheduled_visits', { count: numberOfVisits })}
        </h3>
        {data.visit_schedules.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('review.no_visits_scheduled')}</p>
        ) : (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {data.visit_schedules.slice(0, 5).map((schedule, i) => (
              <div key={schedule.id} className="flex items-center gap-3 text-sm p-2 bg-muted/50">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-muted text-xs font-bold">
                  {i + 1}
                </span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>{format(parseISO(schedule.date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{schedule.time}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {formatDuration(schedule.duration)}
                </Badge>
              </div>
            ))}
            {data.visit_schedules.length > 5 && (
              <p className="text-xs text-muted-foreground pl-8">
                {t('review.more_visits', { count: data.visit_schedules.length - 5 })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Budget Breakdown */}
      <div className="border border-border p-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wide">{t('review.budget_breakdown')}</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 border border-border p-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {branchCount > 1 ? t('review.visits_per_mission') : t('review.visits_label')}
              </div>
              <div className="text-lg font-black">{numberOfVisits}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 border border-border p-3">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{t('review.budget_per_visit')}</div>
              <div className="text-lg font-black">{formatCurrency(data.purchase_budget_per_visit)}</div>
            </div>
          </div>
        </div>

        {branchCount > 1 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 border border-border p-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">{t('review.missions_label')}</div>
                <div className="text-lg font-black">{branchCount}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 border border-border p-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">{t('review.total_visits')}</div>
                <div className="text-lg font-black">{totalVisitsAllMissions}</div>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wide text-xs">{t('review.total_purchase_budget')}</span>
            <span className="text-2xl font-black text-primary">
              {formatCurrency(totalPurchaseBudget)}
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('review.visits_remaining')}</span>
            <span className={totalVisitsAllMissions > visitsRemaining ? 'text-destructive font-bold' : ''}>
              {visitsRemaining}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('review.wallet_available')}</span>
            <span className={totalPurchaseBudget > wallet.available_balance ? 'text-destructive font-bold' : ''}>
              {formatCurrency(wallet.available_balance)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('review.balance_after')}</span>
            <span className={totalPurchaseBudget > wallet.available_balance ? 'text-destructive font-bold' : 'text-success font-bold'}>
              {formatCurrency(wallet.available_balance - totalPurchaseBudget)}
            </span>
          </div>
        </div>
      </div>

      {/* Publish Warning/Confirmation */}
      {!canPublish && publishBlockReason && (
        <div className="flex items-start gap-3 border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wide text-destructive">{t('review.cannot_publish')}</div>
            <p className="text-sm text-muted-foreground mt-1">{publishBlockReason}</p>
          </div>
        </div>
      )}

      {canPublish && (
        <div className="flex items-start gap-3 border border-success/30 bg-success/5 p-4">
          <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wide text-success">{t('review.ready_to_publish')}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {branchCount > 1
        ? `Publishing will create ${branchCount} missions and allocate ${formatCurrency(totalPurchaseBudget)} from your wallet.`
        : MESSAGES.publish.confirmation
            .replace('{amount}', formatCurrency(totalPurchaseBudget))
            .replace('{visits}', String(numberOfVisits))}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSubmitting}
        >
          {t('form.save_as_draft')}
        </Button>
        <Button
          onClick={handlePublishClick}
          disabled={!canPublish || isSubmitting}
          className="gap-2"
        >
          {!canPublish && <AlertTriangle className="h-4 w-4" />}
          {isSubmitting ? t('form.publishing') : branchCount > 1 ? t('form.publish_missions', { count: branchCount }) : t('form.publish_mission')}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">{t('review.confirm_title')}</DialogTitle>
            <DialogDescription className="pt-2">
              {branchCount > 1
          ? `You are about to create and publish ${branchCount} missions.`
          : MESSAGES.publish.confirmation
              .replace('{amount}', formatCurrency(totalPurchaseBudget))
              .replace('{visits}', String(numberOfVisits))}
            </DialogDescription>
          </DialogHeader>
          <div className="border border-border p-4 my-4">
            {branchCount > 1 && (
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">{t('review.missions_to_create')}</span>
                <span className="font-semibold">{branchCount}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('review.budget_allocated')}</span>
              <span className="font-black text-primary">
                {formatCurrency(totalPurchaseBudget)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">{t('review.visits_consumed')}</span>
              <span className="font-semibold">{totalVisitsAllMissions}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2 border-t border-border pt-2">
              <span className="text-muted-foreground">{t('review.available_after')}</span>
              <span className="font-semibold text-success">
                {formatCurrency(wallet.available_balance - totalPurchaseBudget)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              {t('form.cancel')}
            </Button>
            <Button
              onClick={handleConfirmPublish}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('form.publishing') : t('form.confirm_publish')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
