import { Users, AlertTriangle, Info, Calculator, Building2, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MissionFormData, PurchaseItem } from '@/types';
import { CURRENCY, MESSAGES } from '@/lib/constants';
import { PurchaseItemsList } from './PurchaseItemsList';

interface StepFundingProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
  visitsRemaining: number;
  walletBalance: number;
  branchCount: number;
  onSaveDraft?: () => void;
}

export function StepFunding({
  data,
  onChange,
  visitsRemaining,
  walletBalance,
  branchCount,
  onSaveDraft,
}: StepFundingProps) {
  const navigate = useNavigate();
  
  // Calculate budget from purchase items
  const budgetPerVisit = data.purchase_items.reduce((sum, item) => sum + (item.budget || 0), 0);
  const budgetPerMission = data.number_of_visits * budgetPerVisit;
  const totalVisitsAllMissions = data.number_of_visits * branchCount;
  const totalPurchaseBudget = budgetPerMission * branchCount;
  const exceedsVisits = totalVisitsAllMissions > visitsRemaining;
  const exceedsBalance = totalPurchaseBudget > walletBalance;

  const handlePurchaseItemsChange = (items: PurchaseItem[]) => {
    const totalBudget = items.reduce((sum, item) => sum + (item.budget || 0), 0);
    const itemNames = items.filter(i => i.name).map(i => i.name).join(', ');
    onChange({
      purchase_items: items,
      purchase_budget_per_visit: totalBudget,
      purchase_item_name: itemNames || undefined,
    });
  };

  const handleTopUpAndSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft();
    }
    navigate('/wallet');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString(CURRENCY.locale)} ${CURRENCY.symbol}`;
  };

  return (
    <div className="space-y-6">
      {/* Multi-branch info */}
      {branchCount > 1 && (
        <div className="flex items-start gap-3 border border-primary/30 bg-primary/5 p-4">
          <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wide">Creating {branchCount} Missions</div>
            <p className="text-sm text-muted-foreground mt-1">
              You've selected {branchCount} branches. The settings below will apply to each mission individually.
              Total costs are calculated across all missions.
            </p>
          </div>
        </div>
      )}

      {/* Number of Visits */}
      <div className="space-y-2">
        <Label htmlFor="visits" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <Users className="h-4 w-4" />
          Number of Visits {branchCount > 1 ? 'per Mission' : ''}<span className="text-destructive">*</span>
        </Label>
        <Input
          id="visits"
          type="number"
          min={1}
          max={Math.floor(visitsRemaining / branchCount)}
          value={data.number_of_visits}
          onChange={(e) =>
            onChange({ number_of_visits: parseInt(e.target.value) || 0 })
          }
          className={exceedsVisits ? 'border-destructive' : ''}
        />
        <p className={`text-xs ${exceedsVisits ? 'text-destructive' : 'text-muted-foreground'}`}>
          {exceedsVisits
            ? `Total visits (${totalVisitsAllMissions}) exceeds your remaining allowance (${visitsRemaining} available).`
            : branchCount > 1
            ? `${data.number_of_visits} visits × ${branchCount} missions = ${totalVisitsAllMissions} total visits from your allowance.`
            : MESSAGES.visits.consumption_warning.replace('{count}', String(data.number_of_visits))}
        </p>
      </div>

      {/* Purchase Items List */}
      <PurchaseItemsList
        items={data.purchase_items}
        onChange={handlePurchaseItemsChange}
      />

      {/* Budget Calculation */}
      <div className="border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <Calculator className="h-4 w-4" />
          Budget Breakdown
        </div>

        <div className="space-y-3">
          {branchCount > 1 && (
            <>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Per Mission
              </div>
              <div className="flex items-center justify-between text-sm pl-4">
                <span className="text-muted-foreground">Visits</span>
                <span className="font-semibold">{data.number_of_visits}</span>
              </div>
              <div className="flex items-center justify-between text-sm pl-4">
                <span className="text-muted-foreground">× Budget per Visit</span>
                <span className="font-semibold">{formatCurrency(budgetPerVisit)}</span>
              </div>
              <div className="flex items-center justify-between text-sm pl-4">
                <span className="text-muted-foreground">= Budget per Mission</span>
                <span className="font-semibold">{formatCurrency(budgetPerMission)}</span>
              </div>
              <div className="border-t border-border my-3" />
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Total ({branchCount} Missions)
              </div>
            </>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Visits</span>
            <span className="font-semibold">{totalVisitsAllMissions}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="font-bold uppercase tracking-wide text-xs">Total Purchase Budget</span>
            <span className={`text-xl font-black ${exceedsBalance ? 'text-destructive' : 'text-primary'}`}>
              {formatCurrency(totalPurchaseBudget)}
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Wallet Available</span>
            <span className="font-semibold">{formatCurrency(walletBalance)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">After Funding</span>
            <span className={`font-bold ${exceedsBalance ? 'text-destructive' : 'text-success'}`}>
              {formatCurrency(walletBalance - totalPurchaseBudget)}
            </span>
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {exceedsVisits && (
        <div className="flex items-start gap-3 border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wide text-destructive">Insufficient Visits</div>
            <p className="text-sm text-muted-foreground mt-1">
              {MESSAGES.funding.insufficient_visits}
            </p>
          </div>
        </div>
      )}

      {exceedsBalance && !exceedsVisits && (
        <div className="flex items-start gap-3 border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-xs uppercase tracking-wide text-destructive">Insufficient Balance</div>
            <p className="text-sm text-muted-foreground mt-1">
              {MESSAGES.funding.insufficient_balance}
            </p>
            <Button
              type="button"
              onClick={handleTopUpAndSaveDraft}
              className="mt-3 gap-2"
              size="sm"
            >
              <Wallet className="h-4 w-4" />
              Top Up & Save as Draft
            </Button>
          </div>
        </div>
      )}

      {!exceedsVisits && !exceedsBalance && (
        <div className="flex items-start gap-3 border border-primary/30 bg-primary/5 p-4">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wide">Funding Information</div>
            <p className="text-sm text-muted-foreground mt-1">
              {MESSAGES.funding.info}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
