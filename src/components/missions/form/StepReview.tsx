import { useState } from 'react';
import { format } from 'date-fns';
import {
  Calendar,
  Users,
  Camera,
  Receipt,
  DollarSign,
  FileText,
  AlertTriangle,
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
import { WalletSnapshot } from '@/components/wallet/WalletSnapshot';
import { MissionFormData } from '@/types/mission';
import { Wallet } from '@/types/wallet';
import { CURRENCY, MESSAGES } from '@/lib/constants';

interface StepReviewProps {
  data: MissionFormData;
  branches: { id: string; name: string }[];
  wallet: Wallet;
  perRunMaxCost: number;
  requiredHold: number;
  canPublish: boolean;
  onPublish: () => Promise<void>;
  onSaveDraft: () => Promise<void>;
  isSubmitting: boolean;
}

export function StepReview({
  data,
  branches,
  wallet,
  perRunMaxCost,
  requiredHold,
  canPublish,
  onPublish,
  onSaveDraft,
  isSubmitting,
}: StepReviewProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString(CURRENCY.locale)} ${CURRENCY.symbol}`;
  };

  const branchName = branches.find((b) => b.id === data.branch_id)?.name || 'Unknown';

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
      {/* Mission Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Mission Summary</h3>

        <div className="rounded-lg border border-border divide-y divide-border">
          {/* Title & Branch */}
          <div className="p-4">
            <div className="text-lg font-medium">{data.title}</div>
            <div className="text-sm text-muted-foreground mt-1">{branchName}</div>
            <p className="text-sm text-muted-foreground mt-2">{data.description}</p>
          </div>

          {/* Details Grid */}
          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Duration</div>
                <div className="text-sm font-medium">
                  {data.start_date && data.end_date
                    ? `${format(data.start_date, 'MMM d')} - ${format(
                        data.end_date,
                        'MMM d, yyyy'
                      )}`
                    : 'Not set'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Quota</div>
                <div className="text-sm font-medium">{data.quota} runs</div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="p-4">
            <div className="text-sm font-medium mb-2">Requirements</div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs">
                <Camera className="h-3 w-3" />
                {data.required_photos_count} photos
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs">
                <Receipt className="h-3 w-3" />
                Receipt
              </div>
              {data.quiz_id && (
                <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs">
                  <FileText className="h-3 w-3" />
                  Quiz
                </div>
              )}
              {data.form_id && (
                <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs">
                  <FileText className="h-3 w-3" />
                  Form
                </div>
              )}
            </div>
          </div>

          {/* Budget */}
          <div className="p-4">
            <div className="text-sm font-medium mb-3">Budget Breakdown</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Fixed Reward
                </span>
                <span>{formatCurrency(data.fixed_reward)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Receipt className="h-4 w-4" />
                  Reimbursement Cap
                </span>
                <span>{formatCurrency(data.reimbursement_cap)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="font-medium">Per-run Max Cost</span>
                <span className="font-medium">{formatCurrency(perRunMaxCost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Required Hold</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(requiredHold)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Snapshot */}
      <WalletSnapshot
        availableBalance={wallet.available_balance}
        onHoldBalance={wallet.on_hold_balance}
        requiredHold={requiredHold}
      />

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSubmitting}
        >
          Save as Draft
        </Button>
        <Button
          onClick={handlePublishClick}
          disabled={!canPublish || isSubmitting}
          className="gap-2"
        >
          {!canPublish && <AlertTriangle className="h-4 w-4" />}
          {isSubmitting ? 'Publishing...' : 'Publish Mission'}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Publication</DialogTitle>
            <DialogDescription className="pt-2">
              {MESSAGES.publish.confirmation.replace(
                '{amount}',
                formatCurrency(requiredHold)
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted/50 p-4 my-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Amount to be held</span>
              <span className="font-semibold text-primary">
                {formatCurrency(requiredHold)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Available after hold</span>
              <span className="font-medium">
                {formatCurrency(wallet.available_balance - requiredHold)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPublish}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Confirm & Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
