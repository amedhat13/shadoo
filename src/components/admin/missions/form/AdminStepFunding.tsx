import { Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { MissionFormData } from '@/types';

interface AdminStepFundingProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
  branchCount: number;
}

export function AdminStepFunding({ data, onChange, branchCount }: AdminStepFundingProps) {
  const totalVisitsPerMission = data.number_of_visits;
  const totalPurchaseBudgetPerMission = data.number_of_visits * data.purchase_budget_per_visit;
  const grandTotalBudget = totalPurchaseBudgetPerMission * branchCount;
  const grandTotalVisits = totalVisitsPerMission * branchCount;

  return (
    <div className="space-y-6">
      {/* Number of Visits */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase tracking-wide">Number of Visits per Mission</Label>
          <span className="text-2xl font-black">{data.number_of_visits}</span>
        </div>
        <Slider
          value={[data.number_of_visits]}
          onValueChange={([value]) => onChange({ number_of_visits: value })}
          min={1}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 visit</span>
          <span>100 visits</span>
        </div>
      </div>

      {/* Purchase Budget */}
      <div className="space-y-4">
        <Label className="text-xs font-bold uppercase tracking-wide">
          Purchase Budget per Visit (EGP)
        </Label>
        <Input
          type="number"
          min={0}
          step={10}
          value={data.purchase_budget_per_visit}
          onChange={(e) => onChange({ purchase_budget_per_visit: parseInt(e.target.value) || 0 })}
          className="text-lg font-semibold"
        />
        <p className="text-xs text-muted-foreground">
          Amount given to agents for purchases during each visit.
        </p>
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Info className="h-4 w-4 text-muted-foreground" />
            Budget Summary
          </div>
          
          {branchCount > 1 && (
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Per Mission:</span>
                <span>{totalPurchaseBudgetPerMission.toLocaleString()} EGP ({totalVisitsPerMission} visits)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Number of Missions:</span>
                <span>{branchCount} branches</span>
              </div>
            </div>
          )}
          
          <div className="pt-2 border-t">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{grandTotalBudget.toLocaleString()} EGP</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Total Visits:</span>
              <span>{grandTotalVisits} visits</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
