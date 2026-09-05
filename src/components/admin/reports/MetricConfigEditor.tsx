import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InfoHint } from '@/components/common/InfoHint';
import { LoadingState } from '@/components/common/LoadingState';
import { toast } from 'sonner';
import { AlertCircle, BarChart3, CheckCircle2, Pencil, Plus, RotateCcw, Target } from 'lucide-react';
import { useReportMetrics } from '@/hooks/useReportMetrics';
import { evaluateExpression, expressionRefs } from '@/lib/metricExpression';
import {
  METRIC_FORMULAS, MetricFormula, ReportMetric, formatMetricValue, metricFormat,
} from '@/lib/reportMetrics';

export interface WeightTarget {
  slug: string;
  label: string;
  metricKey: string;
}

interface Props {
  /** Account whose configuration is edited. Omit for the platform defaults. */
  ownerId?: string;
  /** Questions available for weighting, gathered from that account's missions. */
  weightTargets?: WeightTarget[];
  scopeLabel: string;
}

type Band = { label: string; min: number };

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
  expression: string;
  naHandling: 'exclude' | 'zero';
  minSample: number;
  weights: Record<string, number>;
  bands: Band[];
  is_active: boolean;
  is_system: boolean;
  sort_order: number;
};

const DEFAULT_BANDS: Band[] = [
  { label: 'Excellent', min: 85 },
  { label: 'Good', min: 70 },
  { label: 'Needs work', min: 50 },
  { label: 'Critical', min: 0 },
];

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
    expression: m?.config?.expression ?? '',
    naHandling: (m?.config?.naHandling as 'exclude' | 'zero') ?? 'exclude',
    minSample: m?.config?.minSample ?? 0,
    weights: (m?.config?.weights as Record<string, number>) ?? {},
    bands: (m?.config?.bands as Band[])?.length ? (m!.config!.bands as Band[]) : DEFAULT_BANDS,
    is_active: m?.is_active ?? true,
    is_system: m?.is_system ?? false,
    sort_order: m?.sort_order ?? 100,
  };
}

/** Full metric control: calculation, weights, custom formulas, edge-case rules and bands. */
export function MetricConfigEditor({ ownerId, weightTargets = [], scopeLabel }: Props) {
  const { metrics, isLoading, saveMetric, removeMetric } = useReportMetrics(ownerId);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [isNew, setIsNew] = useState(false);

  const builtinKeys = useMemo(() => metrics.filter(m => m.formula !== 'expression').map(m => m.metric_key), [metrics]);

  const expressionCheck = useMemo(() => {
    if (!editing || editing.formula !== 'expression') return null;
    const expr = editing.expression.trim();
    if (!expr) return { ok: false, message: 'Write a formula, e.g. (csat * 0.6) + (compliance_rate * 0.4)' };
    const refs = expressionRefs(expr);
    const unknown = refs.filter(r => !builtinKeys.includes(r));
    if (unknown.length) return { ok: false, message: `Unknown metric: ${unknown.join(', ')}` };
    const sample: Record<string, number | null> = {};
    refs.forEach((r, i) => { sample[r] = 70 + i * 5; });
    const res = evaluateExpression(expr, sample);
    if (res === null) return { ok: false, message: 'That formula could not be read. Use metric keys, numbers, + - * / ( ) and min/max/avg.' };
    return { ok: true, message: `Valid. With sample values ${refs.map(r => `${r}=${sample[r]}`).join(', ')} this returns ${Math.round(res * 10) / 10}.` };
  }, [editing, builtinKeys]);

  const persist = (draft: Draft) => {
    const formula = draft.formula;
    const format = METRIC_FORMULAS.find(f => f.value === formula)?.format ?? 'percent';
    const cleanWeights = Object.fromEntries(
      Object.entries(draft.weights).filter(([, w]) => Number.isFinite(w) && w !== 1),
    );
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
        naHandling: draft.naHandling,
        minSample: draft.minSample || undefined,
        weights: Object.keys(cleanWeights).length ? cleanWeights : undefined,
        bands: draft.bands,
        ...(formula === 'nps' ? { promoterMin: draft.promoterMin, detractorMax: draft.detractorMax, min: -100, max: 100 } : {}),
        ...(formula === 'top_2_box' ? { topBoxes: draft.topBoxes } : {}),
        ...(formula === 'expression' ? { expression: draft.expression.trim() } : {}),
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
    if (editing.formula === 'expression' && !expressionCheck?.ok) {
      toast.error(expressionCheck?.message ?? 'Fix the formula first.');
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

  const targetsFor = (metricKey: string) => weightTargets.filter(t => t.metricKey === metricKey);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Metrics — {scopeLabel}
            </CardTitle>
            <CardDescription>
              Full control over what each metric measures, how heavily each question counts, and how results are graded.
              Active metrics appear in that account's Reports → Overview.
            </CardDescription>
          </div>
          <Button onClick={() => { setIsNew(true); setEditing(toDraft()); }} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Add metric
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.map((m) => {
            const formula = METRIC_FORMULAS.find(f => f.value === m.formula);
            const weightCount = Object.keys((m.config?.weights as Record<string, number>) || {}).length;
            return (
              <div key={m.metric_key} className="rounded-md border border-border p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold uppercase tracking-wide">{m.name}</span>
                      {m.name_ar && <span className="text-xs text-muted-foreground">{m.name_ar}</span>}
                      {m.is_system
                        ? <Badge variant="secondary" className="text-[10px]">System</Badge>
                        : <Badge variant="outline" className="text-[10px]">Custom</Badge>}
                      {m.user_id && <Badge variant="outline" className="text-[10px]">Overridden</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground max-w-2xl">{m.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{m.is_active ? 'Active' : 'Inactive'}</span>
                    <Switch checked={m.is_active} onCheckedChange={(v) => toggleActive(m, v)} />
                    <Button variant="outline" size="sm" onClick={() => { setIsNew(false); setEditing(toDraft(m)); }} className="gap-1.5">
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
                  {m.formula === 'expression'
                    ? <Badge variant="secondary" className="font-mono font-normal">{m.config?.expression}</Badge>
                    : <Badge variant="secondary" className="font-normal">Scale 0–{m.config?.scale ?? 5}</Badge>}
                  {m.formula === 'nps' && (
                    <Badge variant="secondary" className="font-normal">
                      Promoters ≥ {m.config?.promoterMin ?? 9} · Detractors ≤ {m.config?.detractorMax ?? 6}
                    </Badge>
                  )}
                  {m.formula === 'top_2_box' && (
                    <Badge variant="secondary" className="font-normal">Top {m.config?.topBoxes ?? 2} boxes</Badge>
                  )}
                  {weightCount > 0 && <Badge variant="secondary" className="font-normal">{weightCount} weighted questions</Badge>}
                  {m.config?.minSample ? <Badge variant="secondary" className="font-normal">Min {m.config.minSample} answers</Badge> : null}
                  <Badge variant="secondary" className="font-normal">
                    N/A: {m.config?.naHandling === 'zero' ? 'counts as zero' : 'excluded'}
                  </Badge>
                  {m.config?.target !== undefined && (
                    <Badge variant="secondary" className="font-normal gap-1">
                      <Target className="h-3 w-3" /> Target {formatMetricValue(m, m.config.target)}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="font-normal">Output: {metricFormat(m)}</Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? 'Add metric' : `Edit ${editing?.name}`}</DialogTitle>
            <DialogDescription>
              Applies to {scopeLabel}. System metrics keep the platform default, so you can always reset.
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <Tabs defaultValue="basics">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="calc">Calculation</TabsTrigger>
                <TabsTrigger value="weights">Weights</TabsTrigger>
                <TabsTrigger value="rules">Rules & bands</TabsTrigger>
              </TabsList>

              <TabsContent value="basics" className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name (English)*</Label>
                    <Input
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value, metric_key: isNew ? e.target.value : editing.metric_key })}
                      placeholder="e.g. Cleanliness Index"
                    />
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
                            applies_to: on ? editing.applies_to.filter(t => t !== opt.v) : [...editing.applies_to, opt.v],
                          })}
                        >
                          {opt.l}
                        </Button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">Only rating and yes/no questions produce measurable answers.</p>
                </div>
                <div className="flex items-center gap-3 rounded-md border border-border p-3">
                  <Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                  <div className="text-sm">Show this metric in Reports → Overview.</div>
                </div>
              </TabsContent>

              <TabsContent value="calc" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    Calculation*
                    <InfoHint label="How the tagged answers are turned into a single number." />
                  </Label>
                  <Select value={editing.formula} onValueChange={(v) => setEditing({ ...editing, formula: v as MetricFormula })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {METRIC_FORMULAS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{METRIC_FORMULAS.find(f => f.value === editing.formula)?.description}</p>
                </div>

                {editing.formula === 'expression' ? (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      Formula*
                      <InfoHint label="Combine other metrics by their key. Allowed: numbers, + - * / ( ) and min(), max(), avg()." />
                    </Label>
                    <Textarea
                      rows={2}
                      className="font-mono text-sm"
                      value={editing.expression}
                      onChange={(e) => setEditing({ ...editing, expression: e.target.value })}
                      placeholder="(csat * 0.6) + (compliance_rate * 0.4)"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {builtinKeys.map(k => (
                        <Button
                          key={k}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 font-mono text-[10px]"
                          onClick={() => setEditing({ ...editing, expression: `${editing.expression}${editing.expression ? ' ' : ''}${k}` })}
                        >
                          {k}
                        </Button>
                      ))}
                    </div>
                    {expressionCheck && (
                      <p className={`flex items-start gap-1.5 text-xs ${expressionCheck.ok ? 'text-success' : 'text-destructive'}`}>
                        {expressionCheck.ok ? <CheckCircle2 className="h-3.5 w-3.5 mt-0.5" /> : <AlertCircle className="h-3.5 w-3.5 mt-0.5" />}
                        {expressionCheck.message}
                      </p>
                    )}
                  </div>
                ) : (
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
                        <InfoHint label="The dashed line shown on the charts for this metric." />
                      </Label>
                      <Input type="number" value={editing.target} onChange={(e) => setEditing({ ...editing, target: Number(e.target.value) })} />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="weights" className="space-y-3 pt-4">
                <p className="text-xs text-muted-foreground">
                  A weight of 1 is normal. Raise it to make a question count more towards this metric, lower it to soften it.
                </p>
                {targetsFor(editing.metric_key).length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">
                    No questions are tagged with this metric for {scopeLabel} yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {targetsFor(editing.metric_key).map(t => (
                      <div key={t.slug} className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
                        <span className="text-xs flex-1 truncate" title={t.label}>{t.label}</span>
                        <Input
                          type="number"
                          step="0.1"
                          min={0}
                          max={10}
                          className="w-20 h-8"
                          value={editing.weights[t.slug] ?? 1}
                          onChange={(e) => setEditing({
                            ...editing,
                            weights: { ...editing.weights, [t.slug]: Number(e.target.value) },
                          })}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rules" className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      "Not applicable" answers
                      <InfoHint label="Choose whether N/A answers are ignored or counted as the lowest score." />
                    </Label>
                    <Select value={editing.naHandling} onValueChange={(v) => setEditing({ ...editing, naHandling: v as 'exclude' | 'zero' })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exclude">Exclude from the metric</SelectItem>
                        <SelectItem value="zero">Count as zero</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      Minimum answers before showing a result
                      <InfoHint label="Below this number the report shows 'not enough data' instead of a misleading score." />
                    </Label>
                    <Input type="number" min={0} max={999} value={editing.minSample} onChange={(e) => setEditing({ ...editing, minSample: Number(e.target.value) })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    Performance bands
                    <InfoHint label="Bands colour the gauges and charts. Each band starts at its own value on a 0–100 scale." />
                  </Label>
                  <div className="space-y-2">
                    {editing.bands.map((b, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          className="h-8 flex-1"
                          value={b.label}
                          onChange={(e) => {
                            const bands = [...editing.bands];
                            bands[i] = { ...b, label: e.target.value };
                            setEditing({ ...editing, bands });
                          }}
                        />
                        <span className="text-xs text-muted-foreground">from</span>
                        <Input
                          type="number"
                          className="h-8 w-20"
                          value={b.min}
                          onChange={(e) => {
                            const bands = [...editing.bands];
                            bands[i] = { ...b, min: Number(e.target.value) };
                            setEditing({ ...editing, bands });
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => setEditing({ ...editing, bands: editing.bands.filter((_, j) => j !== i) })}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setEditing({ ...editing, bands: [...editing.bands, { label: 'New band', min: 0 }] })}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add band
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
