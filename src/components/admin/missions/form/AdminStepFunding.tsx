import { Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MissionFormData, VisitSchedule } from '@/types';
import { VisitScheduleEditor } from '@/components/missions/form/VisitScheduleEditor';
import { useTranslation } from 'react-i18next';

interface AdminStepFundingProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
  branchCount: number;
}

export function AdminStepFunding({ data, onChange, branchCount }: AdminStepFundingProps) {
  const { t } = useTranslation('missions');
  const numberOfVisits = data.visit_schedules.length;
  const totalPurchaseBudgetPerMission = numberOfVisits * data.purchase_budget_per_visit;
  const grandTotalBudget = totalPurchaseBudgetPerMission * branchCount;
  const grandTotalVisits = numberOfVisits * branchCount;

  const handleSchedulesChange = (schedules: VisitSchedule[]) => {
    onChange({
      visit_schedules: schedules,
      number_of_visits: schedules.length,
    });
  };

  return (
    <div className="space-y-6">
      {/* Visit Schedules */}
      <VisitScheduleEditor
        schedules={data.visit_schedules}
        onChange={handleSchedulesChange}
        maxVisits={100}
      />

      {/* Purchase Budget */}
      <div className="space-y-4">
        <Label className="text-xs font-bold uppercase tracking-wide">
          {t('admin.budget_per_visit_label')}
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
          {t('admin.budget_per_visit_help')}
        </p>
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Info className="h-4 w-4 text-muted-foreground" />
            {t('admin.budget_summary')}
          </div>
          
          {branchCount > 1 && (
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('funding.per_mission')}:</span>
                <span>{totalPurchaseBudgetPerMission.toLocaleString()} EGP ({numberOfVisits} {t('visits')})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('admin.number_of_missions')}:</span>
                <span>{branchCount} {t('review.branches_label').toLowerCase()}</span>
              </div>
            </div>
          )}
          
          <div className="pt-2 border-t">
            <div className="flex justify-between text-lg font-bold">
              <span>{t('review.total_purchase_budget')}:</span>
              <span>{grandTotalBudget.toLocaleString()} EGP</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t('review.total_visits')}:</span>
              <span>{grandTotalVisits} {t('visits')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
