import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InfoHint } from '@/components/common/InfoHint';
import { LoadingState } from '@/components/common/LoadingState';
import { toast } from 'sonner';
import { Pencil, Plus, RotateCcw, BarChart3, Target } from 'lucide-react';
import { useReportMetrics } from '@/hooks/useReportMetrics';
import { METRIC_FORMULAS, MetricFormula, ReportMetric, formatMetricValue, metricFormat } from '@/lib/reportMetrics';

type Draft = {
  metric_key: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  applies_to: string[];
  formula: MetricFormula;
  scale: number;
  promoterMin: number;
  detractorMax: number;
  topBoxes: number;
  target: number;
  is_active: boolean;
  is_system: boolean;
  sort_order: number;
};

function toDraft(m?: ReportMetric): Draft {
  return {
    metric_key: m?.metric_key ?? '',
    name: m?.name ?? '',
    name_ar: m?.name_ar ?? '',
    description: m?.description ?? '',
    description_ar: m?.description_ar ?? '',
    applies_to: m?.applies_to ?? ['rating'],
    formula: (m?.formula as MetricFormula) ?? 'average',
    scale: m?.config?.scale ?? 5,
    promoterMin: m?.config?.promoterMin ?? 9,
    detractorMax: m?.config?.detractorMax ?? 6,
    topBoxes: m?.config?.topBoxes ?? 2,
    target: m?.config?.target ?? 80,
    is_active: m?.is_active ?? true,
    is_system: m?.is_system ?? false,
    sort_order: m?.sort_order ?? 100,
  };
}

export function ReportMetricsSettings() {
  const { metrics, isLoading, saveMetric, removeMetric } = useReportMetrics();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openEdit = (m: ReportMetric) => {
    setIsNew(false);
    setEditing(toDraft(m));
  };

  const openNew = () => {
    setIsNew(true);
    setEditing(toDraft());
  };

  const persist = (draft: Draft) => {
    const formula = draft.formula;
    const format = METRIC_FORMULAS.find(f => f.value === formula)?.format ?? 'percent';
    return saveMetric.mutateAsync({
      metric_key: draft.metric_key,
      name: draft.name,
      name_ar: draft.name_ar || null,
      description: draft.description || null,
      description_ar: draft.description_ar || null,
      applies_to: draft.applies_to,
      formula,
      is_active: draft.is_active,
      is_system: draft.is_system,
      sort_order: draft.sort_order,
      config: {
        format,
        scale: draft.scale,
        target: draft.target,
        ...(formula === 'nps' ? { promoterMin: draft.promoterMin, detractorMax: draft.detractorMax, min: -100, max: 100 } : {}),
        ...(formula === 'top_2_box' ? { topBoxes: draft.topBoxes } : {}),
      },
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    const key = isNew
      ? editing.metric_key.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
      : editing.metric_key;
    if (!editing.name.trim() || !key) {
      toast.error('Metric name is required.');
      return;
    }
    if (isNew && metrics.some(m => m.metric_key === key)) {
      toast.error('A metric with this name already exists.');
      return;
    }
    try {
      await persist({ ...editing, metric_key: key });
      toast.success(isNew ? 'Metric created.' : 'Metric updated.');
      setEditing(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save the metric.');
    }
  };

  const toggleActive = async (m: ReportMetric, active: boolean) => {
    try {
      await persist({ ...toDraft(m), is_active: active });
      toast.success(active ? `${m.name} added to the report overview.` : `${m.name} hidden from the report overview.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update the metric.');
    }
  };

  const resetToDefault = async (m: ReportMetric) => {
    try {
      await removeMetric.mutateAsync(m);
      toast.success(`${m.name} reset to the platform default.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not reset the metric.');
    }
  };

  if (isLoading) return <LoadingState message="Loading metrics" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Report metrics
            </CardTitle>
            <CardDescription>
              Define what each metric measures and how it is calculated. Active metrics get their own card and charts in
              Reports → Overview, built from every question tagged with that metric.
            </CardDescription>
          </div>
          <Button onClick={openNew} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Add metric
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.map((m) => {
            const formula = METRIC_FORMULAS.find(f => f.value === m.formula);
            return (
              <div key={m.metric_key} className="rounded-md border border-border p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold uppercase tracking-wide">{m.name}</span>
                      {m.name_ar && <span className="text-xs text-muted-foreground">{m.name_ar}</span>}
                      {m.is_system ? (
                        <Badge variant="secondary" className="text-[10px]">System</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Custom</Badge>
                      )}
                      {m.user_id && <Badge variant="outline" className="text-[10px]">Edited</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground max-w-2xl">{m.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{m.is_active ? 'Active' : 'Inactive'}</span>
                    <Switch checked={m.is_active} onCheckedChange={(v) => toggleActive(m, v)} />
                    <Button variant="outline" size="sm" onClick={() => openEdit(m)} className="gap-1.5">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    {m.user_id && (
                      <Button variant="ghost" size="sm" onClick={() => resetToDefault(m)} className="gap-1.5">
                        <RotateCcw className="h-3.5 w-3.5" /> {m.is_system ? 'Reset' : 'Delete'}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <Badge variant="secondary" className="font-normal">{formula?.label ?? m.formula}</Badge>
                  <Badge variant="secondary" className="font-normal">Scale 0–{m.config?.scale ?? 5}</Badge>
                  {m.formula === 'nps' && (
                    <Badge variant="secondary" className="font-normal">
                      Promoters ≥ {m.config?.promoterMin ?? 9} · Detractors ≤ {m.config?.detractorMax ?? 6}
                    </Badge>
                  )}
                  {m.formula === 'top_2_box' && (
                    <Badge variant="secondary" className="font-normal">Top {m.config?.topBoxes ?? 2} boxes</Badge>
                  )}
                  {m.config?.target !== undefined && (
                    <Badge variant="secondary" className="font-normal gap-1">
                      <Target className="h-3 w-3" /> Target {formatMetricValue(m, m.config.target)}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="font-normal">
                    Question types: {(m.applies_to || []).map(t => (t === 'yes_no' ? 'Yes/No' : 'Rating')).join(', ')}
                  </Badge>
                  <Badge variant="secondary" className="font-normal">Output: {metricFormat(m)}</Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? 'Add metric' : `Edit ${editing?.name}`}</DialogTitle>
            <DialogDescription>
              Changes only affect your account's reports. System metrics keep a copy of the platform default you can
              reset to at any time.
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name (English)*</Label>
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, metric_key: isNew ? e.target.value : editing.metric_key })} placeholder="e.g. Cleanliness Index" />
                </div>
                <div className="space-y-2">
                  <Label>Name (Arabic)</Label>
                  <Input dir="rtl" value={editing.name_ar} onChange={(e) => setEditing({ ...editing, name_ar: e.target.value })} placeholder="مثال: مؤشر النظافة" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Description (English)</Label>
                  <Textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="What this metric tells you." />
                </div>
                <div className="space-y-2">
                  <Label>Description (Arabic)</Label>
                  <Textarea rows={2} dir="rtl" value={editing.description_ar} onChange={(e) => setEditing({ ...editing, description_ar: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  Calculation*
                  <InfoHint label="How the tagged answers are turned into a single number." />
                </Label>
                <Select value={editing.formula} onValueChange={(v) => setEditing({ ...editing, formula: v as MetricFormula })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {METRIC_FORMULAS.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {METRIC_FORMULAS.find(f => f.value === editing.formula)?.description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    Metric scale*
                    <InfoHint label="Answers from any rating question are normalised onto this scale before the metric is calculated." />
                  </Label>
                  <Input type="number" min={2} max={100} value={editing.scale} onChange={(e) => setEditing({ ...editing, scale: Number(e.target.value) })} />
                </div>
                {editing.formula === 'nps' && (
                  <>
                    <div className="space-y-2">
                      <Label>Promoter from*</Label>
                      <Input type="number" value={editing.promoterMin} onChange={(e) => setEditing({ ...editing, promoterMin: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Detractor up to*</Label>
                      <Input type="number" value={editing.detractorMax} onChange={(e) => setEditing({ ...editing, detractorMax: Number(e.target.value) })} />
                    </div>
                  </>
                )}
                {editing.formula === 'top_2_box' && (
                  <div className="space-y-2">
                    <Label>Top boxes counted*</Label>
                    <Input type="number" min={1} max={5} value={editing.topBoxes} onChange={(e) => setEditing({ ...editing, topBoxes: Number(e.target.value) })} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    Target
                    <InfoHint label="Results at or above the target show green in the report, 80% of target shows amber." />
                  </Label>
                  <Input type="number" value={editing.target} onChange={(e) => setEditing({ ...editing, target: Number(e.target.value) })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question types this metric can be attached to*</Label>
                <div className="flex flex-wrap gap-2">
                  {[{ v: 'rating', l: 'Rating' }, { v: 'yes_no', l: 'Yes / No' }].map(opt => {
                    const on = editing.applies_to.includes(opt.v);
                    return (
                      <Button
                        key={opt.v}
                        type="button"
                        variant={on ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setEditing({
                          ...editing,
                          applies_to: on
                            ? editing.applies_to.filter(t => t !== opt.v)
                            : [...editing.applies_to, opt.v],
                        })}
                      >
                        {opt.l}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Only rating and yes/no questions produce measurable answers.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-md border border-border p-3">
                <Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                <div className="text-sm">
                  Show this metric in Reports → Overview.
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMetric.isPending}>Save metric</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
