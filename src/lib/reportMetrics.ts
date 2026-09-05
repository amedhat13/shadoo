// Configurable report metrics engine.
// A metric is defined once (Settings → Reports) and applied to any question the
// client tags with that metric. Everything in the Reports overview is derived
// from these definitions — no hardcoded methodology rules.

export type MetricFormula = 'nps' | 'top_2_box' | 'top_box' | 'average' | 'yes_percent' | 'expression';

export type MetricFormat = 'score' | 'percent' | 'average';

export interface MetricConfig {
  /** Weight per question (key = question slug from questionSlug()). Default 1. */
  weights?: Record<string, number>;
  /** Weight per mission section title (lowercased). Applied on top of the question weight. */
  sectionWeights?: Record<string, number>;
  /** How "Not applicable" answers are treated. */
  naHandling?: 'exclude' | 'zero';
  /** Minimum number of answers before a score is shown. */
  minSample?: number;
  /** Custom formula (used when formula = 'expression'). */
  expression?: string;
  /** Colour band cut-offs, on the metric's own output scale. */
  bands?: { fair?: number; good?: number; excellent?: number };
  scale?: number; // rating scale the metric expects (answers are normalised to it)
  promoterMin?: number; // nps
  detractorMax?: number; // nps
  topBoxes?: number; // how many top points count as "top box"
  target?: number; // target / benchmark
  format?: MetricFormat;
  min?: number;
  max?: number;
  yesIsGood?: boolean;
}

export interface ReportMetric {
  id: string;
  user_id: string | null;
  metric_key: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  applies_to: string[];
  formula: MetricFormula | string;
  config: MetricConfig;
  is_active: boolean;
  is_system: boolean;
  sort_order: number;
}

export const METRIC_FORMULAS: { value: MetricFormula; label: string; description: string; format: MetricFormat }[] = [
  { value: 'nps', label: 'NPS (promoters − detractors)', description: '% answers ≥ promoter cut-off minus % answers ≤ detractor cut-off. Range −100 → +100.', format: 'score' },
  { value: 'top_2_box', label: 'Top boxes (%)', description: '% of answers landing in the top N points of the scale.', format: 'percent' },
  { value: 'top_box', label: 'Top box only (%)', description: '% of answers at the maximum point of the scale.', format: 'percent' },
  { value: 'average', label: 'Average score', description: 'Mean of all answers, normalised to the metric scale.', format: 'average' },
  { value: 'yes_percent', label: 'Yes rate (%)', description: '% of yes/no answers marked Yes.', format: 'percent' },
  { value: 'expression', label: 'Custom formula', description: 'Combine other metrics, e.g. 0.5*service + 0.3*cleanliness + 0.2*speed.', format: 'percent' },
];

/** Stable slug for a question, based on its English label. Used as the weight key. */
export function questionSlug(q: any): string {
  const t = q?.text;
  const raw = (typeof t === 'object' && t ? (t.en ?? t.ar ?? '') : t) || String(q?.id || '');
  return String(raw).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

/** Weight applied to one question inside a metric (question weight x section weight). */
export function questionWeight(metric: ReportMetric, q: any): number {
  const cfg = metric.config || {};
  const own = cfg.weights?.[questionSlug(q)];
  const sectionTitle = typeof q?.section === 'object' ? (q.section?.en ?? '') : (q?.section ?? q?.section_title ?? '');
  const sec = sectionTitle ? cfg.sectionWeights?.[String(sectionTitle).toLowerCase()] : undefined;
  const w = (own === undefined || own === null || Number.isNaN(Number(own)) ? 1 : Number(own))
    * (sec === undefined || sec === null || Number.isNaN(Number(sec)) ? 1 : Number(sec));
  return w > 0 ? w : 0;
}

export function hasWeights(metric: ReportMetric): boolean {
  const cfg = metric.config || {};
  const vals = [...Object.values(cfg.weights || {}), ...Object.values(cfg.sectionWeights || {})];
  return vals.some(v => Number(v) !== 1);
}

// Only measurable question types can be tagged with a metric.
export const MEASURABLE_QUESTION_TYPES = ['rating', 'yes_no'] as const;

export function metricName(m: ReportMetric, language: string) {
  return language === 'ar' && m.name_ar ? m.name_ar : m.name;
}

export function metricDescription(m: ReportMetric, language: string) {
  return language === 'ar' && m.description_ar ? m.description_ar : m.description || '';
}

export function metricFormat(m: ReportMetric): MetricFormat {
  return (m.config?.format as MetricFormat) || METRIC_FORMULAS.find(f => f.value === m.formula)?.format || 'percent';
}

export function formatMetricValue(m: ReportMetric, value: number | null): string {
  if (value === null || Number.isNaN(value)) return '—';
  const fmt = metricFormat(m);
  if (fmt === 'percent') return `${Math.round(value)}%`;
  if (fmt === 'average') return `${Math.round(value * 10) / 10}`;
  return `${Math.round(value)}`;
}

export function metricMaxForGauge(m: ReportMetric): number {
  const fmt = metricFormat(m);
  if (fmt === 'percent') return 100;
  if (fmt === 'average') return m.config?.scale ?? 10;
  return m.config?.max ?? 100;
}

/** Normalise a single raw answer to the metric scale (0..scale). */
function normaliseAnswer(raw: any, questionType: string, questionMax: number, scale: number, naHandling: 'exclude' | 'zero' = 'exclude'): number | null {
  const isNA = raw === null || raw === undefined || raw === 'na' || raw === 'N/A' || raw === 'n/a';
  if (isNA) return naHandling === 'zero' ? 0 : null;
  if (questionType === 'yes_no') {
    const yes = raw === true || raw === 'true' || raw === 'yes' || raw === 'Yes';
    const no = raw === false || raw === 'false' || raw === 'no' || raw === 'No';
    if (!yes && !no) return null;
    return yes ? scale : 0;
  }
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  const max = questionMax || 5;
  return (n / max) * scale;
}

export interface MetricResult {
  value: number | null;
  sampleSize: number;
  /** Set when the value is hidden on purpose (e.g. not enough answers). */
  reason?: 'low_sample' | 'no_data' | 'formula_error';
  /** Total weight behind the value (equals sampleSize when no weights are set). */
  totalWeight?: number;
  target?: number;
  /** Buckets used for the supporting chart (NPS split, box split, scale spread…) */
  buckets: { label: string; count: number; percent: number; color: string }[];
}

export function computeMetric(metric: ReportMetric, questions: any[], visits: any[]): MetricResult {
  const scale = metric.config?.scale ?? 10;
  const values: number[] = [];
  let yesCount = 0;
  let noCount = 0;

  const qMap = new Map<string, any>();
  for (const q of questions) qMap.set(String(q.id), q);

  for (const visit of visits) {
    const answers = Array.isArray(visit.answers) ? visit.answers : [];
    for (const a of answers) {
      const q = qMap.get(String(a?.question_id));
      if (!q) continue;
      if (q.type === 'yes_no') {
        const yes = a.value === true || a.value === 'true' || a.value === 'yes' || a.value === 'Yes';
        const no = a.value === false || a.value === 'false' || a.value === 'no' || a.value === 'No';
        if (yes) yesCount++;
        else if (no) noCount++;
      }
      const v = normaliseAnswer(a?.value, q.type, q.max_rating, scale);
      if (v !== null) values.push(v);
    }
  }

  const total = values.length;
  const target = metric.config?.target;
  if (total === 0 && yesCount + noCount === 0) {
    return { value: null, sampleSize: 0, target, buckets: [] };
  }

  switch (metric.formula) {
    case 'nps': {
      const promoterMin = metric.config?.promoterMin ?? 9;
      const detractorMax = metric.config?.detractorMax ?? 6;
      const promoters = values.filter(v => v >= promoterMin).length;
      const detractors = values.filter(v => v <= detractorMax).length;
      const passives = total - promoters - detractors;
      const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
      return {
        value: pct(promoters) - pct(detractors),
        sampleSize: total,
        target,
        buckets: [
          { label: 'Promoters', count: promoters, percent: pct(promoters), color: 'hsl(142 71% 45%)' },
          { label: 'Passives', count: passives, percent: pct(passives), color: 'hsl(38 92% 50%)' },
          { label: 'Detractors', count: detractors, percent: pct(detractors), color: 'hsl(0 84% 60%)' },
        ],
      };
    }
    case 'top_2_box':
    case 'top_box': {
      const boxes = metric.formula === 'top_box' ? 1 : metric.config?.topBoxes ?? 2;
      const cut = scale - (boxes - 1) - 0.001; // answers at or above the top N points
      const top = values.filter(v => v >= cut).length;
      const mid = values.filter(v => v < cut && v >= scale / 2).length;
      const low = total - top - mid;
      const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
      return {
        value: pct(top),
        sampleSize: total,
        target,
        buckets: [
          { label: `Top ${boxes}`, count: top, percent: pct(top), color: 'hsl(142 71% 45%)' },
          { label: 'Middle', count: mid, percent: pct(mid), color: 'hsl(38 92% 50%)' },
          { label: 'Low', count: low, percent: pct(low), color: 'hsl(0 84% 60%)' },
        ],
      };
    }
    case 'yes_percent': {
      const t = yesCount + noCount;
      const pct = (n: number) => (t ? Math.round((n / t) * 100) : 0);
      return {
        value: pct(yesCount),
        sampleSize: t,
        target,
        buckets: [
          { label: 'Yes', count: yesCount, percent: pct(yesCount), color: 'hsl(142 71% 45%)' },
          { label: 'No', count: noCount, percent: pct(noCount), color: 'hsl(0 84% 60%)' },
        ],
      };
    }
    case 'average':
    default: {
      const avg = total ? values.reduce((s, v) => s + v, 0) / total : 0;
      const buckets: { label: string; count: number; percent: number; color: string }[] = [];
      const bands = [
        { label: 'Excellent', min: scale * 0.8, color: 'hsl(142 71% 45%)' },
        { label: 'Good', min: scale * 0.6, color: 'hsl(84 60% 45%)' },
        { label: 'Fair', min: scale * 0.4, color: 'hsl(38 92% 50%)' },
        { label: 'Poor', min: -1, color: 'hsl(0 84% 60%)' },
      ];
      let remaining = [...values];
      for (const band of bands) {
        const inBand = remaining.filter(v => v >= band.min);
        remaining = remaining.filter(v => v < band.min);
        buckets.push({
          label: band.label,
          count: inBand.length,
          percent: total ? Math.round((inBand.length / total) * 100) : 0,
          color: band.color,
        });
      }
      return { value: Math.round(avg * 10) / 10, sampleSize: total, target, buckets };
    }
  }
}

/** Questions across the given missions that are tagged with this metric. */
export function questionsForMetric(missions: any[], metricKey: string): { question: any; missionId: string }[] {
  const out: { question: any; missionId: string }[] = [];
  for (const m of missions || []) {
    const qs = Array.isArray(m.questions) ? m.questions : [];
    for (const q of qs) {
      if (q?.metric_key === metricKey) out.push({ question: q, missionId: m.id });
    }
  }
  return out;
}

export function healthColor(metric: ReportMetric, value: number | null): string {
  if (value === null) return 'text-muted-foreground';
  const target = metric.config?.target;
  if (target === undefined) return 'text-foreground';
  if (value >= target) return 'text-success';
  if (value >= target * 0.8) return 'text-amber-500';
  return 'text-destructive';
}
