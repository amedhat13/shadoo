import { DollarSign, Info, Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MissionFormData } from '@/types/mission';
import { CURRENCY, MESSAGES } from '@/lib/constants';

interface StepRewardProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
  perRunMaxCost: number;
  requiredHold: number;
}

export function StepReward({ 
  data, 
  onChange, 
  perRunMaxCost, 
  requiredHold 
}: StepRewardProps) {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString(CURRENCY.locale)} ${CURRENCY.symbol}`;
  };

  return (
    <div className="space-y-6">
      {/* Fixed Reward */}
      <div className="space-y-2">
        <Label htmlFor="reward" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <DollarSign className="h-4 w-4" />
          Fixed Reward per Run *
        </Label>
        <div className="relative">
          <Input
            id="reward"
            type="number"
            min={0}
            value={data.fixed_reward}
            onChange={(e) =>
              onChange({ fixed_reward: parseFloat(e.target.value) || 0 })
            }
            className="pr-16"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
            {CURRENCY.symbol}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          The guaranteed payment agents receive for completing this mission
        </p>
      </div>

      {/* Reimbursement Cap */}
      <div className="space-y-2">
        <Label htmlFor="reimbursement" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <DollarSign className="h-4 w-4" />
          Reimbursement Cap per Run
        </Label>
        <div className="relative">
          <Input
            id="reimbursement"
            type="number"
            min={0}
            value={data.reimbursement_cap}
            onChange={(e) =>
              onChange({ reimbursement_cap: parseFloat(e.target.value) || 0 })
            }
            className="pr-16"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
            {CURRENCY.symbol}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Maximum amount agents can claim for purchases made during the mission
        </p>
      </div>

      {/* Calculated Fields */}
      <div className="border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <Calculator className="h-4 w-4" />
          Budget Calculation
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fixed Reward</span>
            <span className="font-semibold">{formatCurrency(data.fixed_reward)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">+ Reimbursement Cap</span>
            <span className="font-semibold">{formatCurrency(data.reimbursement_cap)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="font-bold uppercase tracking-wide text-xs">Per-run Max Cost</span>
            <span className="font-black text-primary">
              {formatCurrency(perRunMaxCost)}
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quota</span>
            <span className="font-semibold">× {data.quota} runs</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold uppercase tracking-wide text-xs">Required Hold</span>
            <span className="text-xl font-black text-success">
              {formatCurrency(requiredHold)}
            </span>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className="flex items-start gap-3 border border-primary/30 bg-primary/5 p-4">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-xs uppercase tracking-wide">Funding Information</div>
          <p className="text-sm text-muted-foreground mt-1">
            {MESSAGES.funding.info}
          </p>
        </div>
      </div>
    </div>
  );
}
