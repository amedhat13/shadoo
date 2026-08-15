import { useEffect } from 'react';
import { Users, AlertTriangle, Info, Calculator, Building2, Wallet, MapPin, Timer, ReceiptText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MissionFormData, PurchaseItem, VisitSchedule, ReceiptConfig, Branch } from '@/types';
import { CURRENCY, MESSAGES } from '@/lib/constants';
import { PurchaseItemsList } from './PurchaseItemsList';
import { VisitScheduleEditor } from './VisitScheduleEditor';
import { useTranslation } from 'react-i18next';

interface StepFundingProps {
  data: MissionFormData;
  onChange: (updates: Partial<MissionFormData>) => void;
  visitsRemaining: number;
  walletBalance: number;
  branchCount: number;
  /** Branches selected in step 1 */
  branches?: Branch[];
  onSaveDraft?: () => void;
}

export function StepFunding({
  data,
  onChange,
  visitsRemaining,
  walletBalance,
  branchCount,
  branches = [],
  onSaveDraft,
}: StepFundingProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('missions');
  
  const perBranch = branches.length > 0;

  // Keep slots in sync with the branches selected in step 1
  useEffect(() => {
    if (!perBranch) return;
    const ids = branches.map((b) => b.id);
    const first = ids[0];
    let changed = false;
    const next = data.visit_schedules
      .filter((s) => {
        const keep = !s.branch_id || ids.includes(s.branch_id);
        if (!keep) changed = true;
        return keep;
      })
      .map((s) => {
        if (!s.branch_id) {
          changed = true;
          return { ...s, branch_id: first };
        }
        return s;
      });
    if (changed) {
      onChange({ visit_schedules: next, number_of_visits: next.length });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches.map((b) => b.id).join(',')]);

  const budgetPerVisit = data.purchase_items.reduce((sum, item) => sum + (item.budget || 0), 0);
  const numberOfVisits = data.visit_schedules.length;
  const budgetPerMission = perBranch && branchCount > 0 ? (numberOfVisits / branchCount) * budgetPerVisit : numberOfVisits * budgetPerVisit;
  const totalVisitsAllMissions = perBranch ? numberOfVisits : numberOfVisits * branchCount;
  const totalPurchaseBudget = numberOfVisits * budgetPerVisit;
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

  const receipt: ReceiptConfig = data.receipt ?? {
    enabled: false,
    capEGP: budgetPerVisit,
    ruleText: { en: '', ar: '' },
  };
  const setReceipt = (patch: Partial<ReceiptConfig>) => onChange({ receipt: { ...receipt, ...patch } });

  // Reimbursement cap always mirrors the total purchase budget per visit
  useEffect(() => {
    if (data.receipt && data.receipt.capEGP !== budgetPerVisit) {
      onChange({ receipt: { ...data.receipt, capEGP: budgetPerVisit } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetPerVisit, data.receipt?.capEGP]);




  const handleSchedulesChange = (schedules: VisitSchedule[]) => {
    onChange({
      visit_schedules: schedules,
      number_of_visits: schedules.length,
    });
  };

  const handleTopUpAndSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft();
    }
    navigate('/wallet');
  };

  const { t: tc } = useTranslation('common');
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString(CURRENCY.locale)} ${tc('currency_code')}`;
  };

  return (
    <div className="space-y-6">
      {/* Multi-branch info */}
      {branchCount > 1 && (
        <div className="flex items-start gap-3 border border-primary/30 bg-primary/5 p-4">
          <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wide">{t('funding.creating_missions', { count: branchCount })}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {t('funding.multi_branch_desc', { count: branchCount })}
            </p>
          </div>
        </div>
      )}

      {/* Visit Schedules */}
      <VisitScheduleEditor
        schedules={data.visit_schedules}
        onChange={handleSchedulesChange}
        maxVisits={perBranch ? visitsRemaining : Math.floor(visitsRemaining / branchCount)}
        branches={branches}
      />

      {/* Visit Count Warning */}
      {exceedsVisits && numberOfVisits > 0 && (
        <div className="flex items-start gap-3 border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wide text-destructive">{t('funding.visit_limit_exceeded')}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {t('funding.visit_limit_desc', { total: totalVisitsAllMissions, remaining: visitsRemaining })}
            </p>
          </div>
        </div>
      )}

      {/* Purchase Items List */}
      <PurchaseItemsList
        items={data.purchase_items}
        onChange={handlePurchaseItemsChange}
      />

      {/* Budget Calculation */}
      <div className="border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <Calculator className="h-4 w-4" />
          {t('funding.budget_breakdown')}
        </div>

        <div className="space-y-3">
          {branchCount > 1 && (
            <>
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t('funding.per_mission')}
              </div>
              <div className="flex items-center justify-between text-sm pl-4">
                <span className="text-muted-foreground">{t('funding.scheduled_visits')}</span>
                <span className="font-semibold">{numberOfVisits}</span>
              </div>
              <div className="flex items-center justify-between text-sm pl-4">
                <span className="text-muted-foreground">{t('funding.budget_per_visit')}</span>
                <span className="font-semibold">{formatCurrency(budgetPerVisit)}</span>
              </div>
              <div className="flex items-center justify-between text-sm pl-4">
                <span className="text-muted-foreground">{t('funding.budget_per_mission')}</span>
                <span className="font-semibold">{formatCurrency(budgetPerMission)}</span>
              </div>
              <div className="border-t border-border my-3" />
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t('funding.total_missions', { count: branchCount })}
              </div>
            </>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('funding.total_visits')}</span>
            <span className="font-semibold">{totalVisitsAllMissions}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="font-bold uppercase tracking-wide text-xs">{t('funding.total_purchase_budget')}</span>
            <span className={`text-xl font-black ${exceedsBalance ? 'text-destructive' : 'text-primary'}`}>
              {formatCurrency(totalPurchaseBudget)}
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('funding.wallet_available')}</span>
            <span className="font-semibold">{formatCurrency(walletBalance)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('funding.after_funding')}</span>
            <span className={`font-bold ${exceedsBalance ? 'text-destructive' : 'text-success'}`}>
              {formatCurrency(walletBalance - totalPurchaseBudget)}
            </span>
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {exceedsBalance && !exceedsVisits && numberOfVisits > 0 && (
        <div className="flex items-start gap-3 border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-xs uppercase tracking-wide text-destructive">{t('funding.insufficient_balance')}</div>
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
              {t('funding.top_up_save_draft')}
            </Button>
          </div>
        </div>
      )}

      {!exceedsVisits && !exceedsBalance && numberOfVisits > 0 && (
        <div className="flex items-start gap-3 border border-primary/30 bg-primary/5 p-4">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wide">{t('funding.funding_info')}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {MESSAGES.funding.info}
            </p>
          </div>
        </div>
      )}

      {/* Geo verification toggle (merged from StepGeoSettings) */}
      <div className="flex items-start gap-3 border border-border rounded-md p-4">
        <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
          <MapPin className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="geo-tagged" className="text-sm font-semibold cursor-pointer">
              {t('geo.title')}
            </Label>
            <Switch
              id="geo-tagged"
              checked={data.is_geo_tagged ?? false}
              onCheckedChange={(checked) => onChange({ is_geo_tagged: checked })}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t('geo.description')}</p>
        </div>
      </div>

      {/* Timers shown to the agent */}
      <div className="border border-border rounded-md p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          <Timer className="h-4 w-4" />
          Agent timers
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-window" className="text-xs font-bold uppercase tracking-wide">
              Free-cancel window (min)
            </Label>
            <Input
              id="cancel-window"
              type="number"
              min={0}
              value={data.cancel_window_min ?? 5}
              onChange={(e) => onChange({ cancel_window_min: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground">
              After accepting, the agent can drop out penalty-free within this window. Shown as a live countdown; past it, cancelling affects their tier.
            </p>
            {(data.cancel_window_min ?? 5) >= (data.completion_deadline_min ?? 120) && (
              <p className="text-xs text-destructive">
                Cancel window must be less than the completion deadline ({data.completion_deadline_min ?? 120} min).
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-sla" className="text-xs font-bold uppercase tracking-wide">
              Review SLA (hours)
            </Label>
            <Input
              id="review-sla"
              type="number"
              min={1}
              value={data.review_sla_hours ?? 48}
              onChange={(e) => onChange({ review_sla_hours: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground">
              Shown on the agent's "sent for review" screen and on in-review missions.
            </p>
          </div>
        </div>
      </div>

      {/* Receipt & reimbursement */}
      <div className="border border-border rounded-md p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
            <ReceiptText className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="receipt-required" className="text-sm font-semibold cursor-pointer">
                Receipt required
              </Label>
              <Switch
                id="receipt-required"
                checked={receipt.enabled}
                onCheckedChange={(checked) => setReceipt({ enabled: checked })}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              The agent gets a receipt step capturing total paid, date, receipt number, items ordered and a photo.
            </p>
          </div>
        </div>

        {receipt.enabled && (
          <div className="space-y-4 pl-0 sm:pl-11">
            <div className="space-y-2">
              <Label htmlFor="receipt-cap" className="text-xs font-bold uppercase tracking-wide">
                Reimbursement cap ({CURRENCY.code})
              </Label>
              <Input
                id="receipt-cap"
                type="number"
                min={0}
                value={receipt.capEGP}
                onChange={(e) => setReceipt({ capEGP: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                Amounts over the cap show a warning in the app and are not reimbursed.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide">Receipt rule text</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  dir="ltr"
                  className="text-sm"
                  placeholder="e.g. Printed receipt only — a card slip alone is rejected."
                  value={receipt.ruleText.en}
                  onChange={(e) => setReceipt({ ruleText: { ...receipt.ruleText, en: e.target.value } })}
                />
                <Input
                  dir="rtl"
                  className="text-sm font-ar"
                  placeholder="مثال: إيصال مطبوع فقط — إيصال البطاقة وحده مرفوض."
                  value={receipt.ruleText.ar}
                  onChange={(e) => setReceipt({ ruleText: { ...receipt.ruleText, ar: e.target.value } })}
                />
              </div>
            </div>

            {!data.purchase_items.some((i) => (i.budget || 0) > 0) && (
              <p className="text-xs text-destructive">
                Receipt required needs at least one purchase item with a budget.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

