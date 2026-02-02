import { useState } from 'react';
import {
  Users,
  Camera,
  DollarSign,
  HelpCircle,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const totalPurchaseBudget = data.number_of_visits * data.purchase_budget_per_visit;
  const selectedBranch = branches.find((b) => b.id === data.branch_id);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString(CURRENCY.locale)} ${CURRENCY.symbol}`;
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

  return (
    <div className="space-y-6">
      {/* Mission Basics */}
      <div className="border border-border p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wide">Mission Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Name</span>
            <p className="font-semibold">{data.name || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Branch</span>
            <p className="font-semibold">{selectedBranch?.name || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Questions Summary */}
      <div className="border border-border p-4 space-y-3">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <HelpCircle className="h-4 w-4" />
          Questions ({data.questions.length})
        </h3>
        {data.questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No questions added</p>
        ) : (
          <ul className="space-y-2">
            {data.questions.map((q, i) => (
              <li key={q.id} className="flex items-center gap-2 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-muted text-xs font-bold">
                  {i + 1}
                </span>
                <span className="truncate">{q.text || 'Empty question'}</span>
                <span className="text-xs text-muted-foreground">({QUESTION_TYPE_LABELS[q.type]})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Photo Requirements */}
      <div className="border border-border p-4 space-y-3">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <Camera className="h-4 w-4" />
          Photo Requirements
        </h3>
        <div className="text-sm">
          <p>
            <span className="text-muted-foreground">Required Photos: </span>
            <span className="font-semibold">{data.photo_requirements.required_count}</span>
          </p>
          {data.photo_requirements.instructions && (
            <p className="mt-1 text-muted-foreground text-xs">
              {data.photo_requirements.instructions}
            </p>
          )}
        </div>
      </div>

      {/* Budget Breakdown */}
      <div className="border border-border p-4 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wide">Budget Breakdown</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 border border-border p-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Visits</div>
              <div className="text-lg font-black">{data.number_of_visits}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 border border-border p-3">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Budget/Visit</div>
              <div className="text-lg font-black">{formatCurrency(data.purchase_budget_per_visit)}</div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wide text-xs">Total Purchase Budget</span>
            <span className="text-2xl font-black text-primary">
              {formatCurrency(totalPurchaseBudget)}
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Visits Remaining</span>
            <span className={data.number_of_visits > visitsRemaining ? 'text-destructive font-bold' : ''}>
              {visitsRemaining}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Wallet Available</span>
            <span className={totalPurchaseBudget > wallet.available_balance ? 'text-destructive font-bold' : ''}>
              {formatCurrency(wallet.available_balance)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Balance After Funding</span>
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
            <div className="font-bold text-xs uppercase tracking-wide text-destructive">Cannot Publish</div>
            <p className="text-sm text-muted-foreground mt-1">{publishBlockReason}</p>
          </div>
        </div>
      )}

      {canPublish && (
        <div className="flex items-start gap-3 border border-success/30 bg-success/5 p-4">
          <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wide text-success">Ready to Publish</div>
            <p className="text-sm text-muted-foreground mt-1">
              {MESSAGES.publish.confirmation
                .replace('{amount}', formatCurrency(totalPurchaseBudget))
                .replace('{visits}', String(data.number_of_visits))}
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
          SAVE AS DRAFT
        </Button>
        <Button
          onClick={handlePublishClick}
          disabled={!canPublish || isSubmitting}
          className="gap-2"
        >
          {!canPublish && <AlertTriangle className="h-4 w-4" />}
          {isSubmitting ? 'PUBLISHING...' : 'PUBLISH MISSION'}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">Confirm Publication</DialogTitle>
            <DialogDescription className="pt-2">
              {MESSAGES.publish.confirmation
                .replace('{amount}', formatCurrency(totalPurchaseBudget))
                .replace('{visits}', String(data.number_of_visits))}
            </DialogDescription>
          </DialogHeader>
          <div className="border border-border p-4 my-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget to be allocated</span>
              <span className="font-black text-primary">
                {formatCurrency(totalPurchaseBudget)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Visits to be consumed</span>
              <span className="font-semibold">{data.number_of_visits}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2 border-t border-border pt-2">
              <span className="text-muted-foreground">Available after funding</span>
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
              CANCEL
            </Button>
            <Button
              onClick={handleConfirmPublish}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'PUBLISHING...' : 'CONFIRM & PUBLISH'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
