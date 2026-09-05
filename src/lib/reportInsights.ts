// Derived branch/question insights for the Reports overview.
// Everything reuses the configurable metric engine — no new scoring rules.
import { getLocalizedValue } from '@/i18n/utils';
import {
  ReportMetric,
  computeMetric,
  metricFormat,
  metricMaxForGauge,
} from '@/lib/reportMetrics';

/** Stable key for a question, based on its English label so the same question across missions groups together. */
export function questionKey(q: any): string {
  const raw = getLocalizedValue(q?.text, 'en') || String(q?.id || '');
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

export function isMeasurable(q: any): boolean {
  return q?.type === 'rating' || q?.type === 'yes_no';
}

/** Normalise any metric value to a comparable 0-100 scale. */
export function metricToPercent(metric: ReportMetric, value: number | null): number | null {
  if (value === null || Number.isNaN(value)) return null;
  const fmt = metricFormat(metric);
  if (fmt === 'percent') return Math.max(0, Math.min(100, value));
  if (fmt === 'score') return Math.max(0, Math.min(100, ((value + 100) / 200) * 100));
  const max = metricMaxForGauge(metric) || 10;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

export interface BranchInsight {
  id: string;
  name: string;
  city: string;
  score: number | null; // 0-100 blended score across active metrics
  answers: number;
  visits: number;
  perMetric: Record<string, { value: number | null; percent: number | null; sampleSize: number }>;
}

export interface BranchMatrix {
  branches: BranchInsight[];
  ranked: BranchInsight[]; // only branches with data, best first
  average: number | null;
  best: BranchInsight | null;
  worst: BranchInsight | null;
  bestPerMetric: Record<string, { branch: BranchInsight; percent: number; runnerUp: number | null } | null>;
}

function taggedQuestions(missions: any[], metricKey: string) {
  const out: any[] = [];
  for (const m of missions || []) {
    const qs = Array.isArray(m.questions) ? m.questions : [];
    for (const q of qs) if (q?.metric_key === metricKey) out.push(q);
  }
  return out;
}

export function buildBranchMatrix(
  metrics: ReportMetric[],
  missions: any[],
  visits: any[],
  branches: any[],
  language: string,
): BranchMatrix {
  const missionBranch = new Map<string, string | null>();
  for (const m of missions || []) missionBranch.set(m.id, m.branch_id ?? null);

  const branchVisits = (branchId: string) =>
    (visits || []).filter((v: any) => (v.branch_id ?? missionBranch.get(v.mission_id)) === branchId);

  const metricQuestions = new Map<string, any[]>();
  for (const metric of metrics) metricQuestions.set(metric.metric_key, taggedQuestions(missions, metric.metric_key));

  const insights: BranchInsight[] = (branches || []).map((b: any) => {
    const bVisits = branchVisits(b.id);
    const perMetric: BranchInsight['perMetric'] = {};
    const pcts: number[] = [];
    let answers = 0;
    for (const metric of metrics) {
      const r = computeMetric(metric, metricQuestions.get(metric.metric_key) || [], bVisits);
      const percent = metricToPercent(metric, r.value);
      perMetric[metric.metric_key] = { value: r.value, percent, sampleSize: r.sampleSize };
      answers += r.sampleSize;
      if (percent !== null && r.sampleSize > 0) pcts.push(percent);
    }
    return {
      id: b.id,
      name: (language === 'ar' && b.name_ar ? b.name_ar : b.name) as string,
      city: b.city || '',
      score: pcts.length ? Math.round(pcts.reduce((s, v) => s + v, 0) / pcts.length) : null,
      answers,
      visits: bVisits.length,
      perMetric,
    };
  });

  const ranked = insights
    .filter(b => b.score !== null && b.answers > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const average = ranked.length
    ? Math.round(ranked.reduce((s, b) => s + (b.score ?? 0), 0) / ranked.length)
    : null;

  const bestPerMetric: BranchMatrix['bestPerMetric'] = {};
  for (const metric of metrics) {
    const withData = insights
      .filter(b => (b.perMetric[metric.metric_key]?.sampleSize ?? 0) > 0 && b.perMetric[metric.metric_key]?.percent !== null)
      .sort((a, b) => (b.perMetric[metric.metric_key].percent ?? 0) - (a.perMetric[metric.metric_key].percent ?? 0));
    bestPerMetric[metric.metric_key] = withData.length
      ? {
          branch: withData[0],
          percent: withData[0].perMetric[metric.metric_key].percent ?? 0,
          runnerUp: withData[1] ? withData[1].perMetric[metric.metric_key].percent ?? null : null,
        }
      : null;
  }

  return {
    branches: insights,
    ranked,
    average,
    best: ranked[0] ?? null,
    worst: ranked.length > 1 ? ranked[ranked.length - 1] : null,
    bestPerMetric,
  };
}

/** Heat colour for a 0-100 score (red → amber → green). */
export function heatColor(score: number | null): string {
  if (score === null) return 'hsl(var(--muted))';
  const clamped = Math.max(0, Math.min(100, score));
  const hue = (clamped / 100) * 130; // 0 = red, 130 = green
  return `hsl(${Math.round(hue)} 72% 45%)`;
}

export interface PinnedQuestionResult {
  key: string;
  label: string;
  type: string;
  maxRating: number;
  average: number | null; // on question scale (rating) or yes % (yes_no)
  percent: number | null; // 0-100 comparable
  answers: number;
  distribution: { label: string; count: number; percent: number }[];
  bestBranch: { name: string; percent: number } | null;
  worstBranch: { name: string; percent: number } | null;
}

function answerValues(questionIds: Set<string>, visits: any[]) {
  const raw: any[] = [];
  for (const v of visits || []) {
    const answers = Array.isArray(v.answers) ? v.answers : [];
    for (const a of answers) if (questionIds.has(String(a?.question_id))) raw.push(a?.value);
  }
  return raw;
}

function scoreAnswers(type: string, maxRating: number, raw: any[]) {
  if (type === 'yes_no') {
    let yes = 0;
    let no = 0;
    for (const v of raw) {
      if (v === true || v === 'true' || v === 'yes' || v === 'Yes') yes++;
      else if (v === false || v === 'false' || v === 'no' || v === 'No') no++;
    }
    const total = yes + no;
    if (!total) return { average: null, percent: null, answers: 0, distribution: [] };
    const pct = Math.round((yes / total) * 100);
    return {
      average: pct,
      percent: pct,
      answers: total,
      distribution: [
        { label: 'Yes', count: yes, percent: pct },
        { label: 'No', count: no, percent: 100 - pct },
      ],
    };
  }
  const nums = raw.map(Number).filter(n => !Number.isNaN(n));
  if (!nums.length) return { average: null, percent: null, answers: 0, distribution: [] };
  const avg = nums.reduce((s, v) => s + v, 0) / nums.length;
  const max = maxRating || 5;
  const counts = new Map<number, number>();
  for (const n of nums) counts.set(n, (counts.get(n) || 0) + 1);
  const distribution = Array.from(counts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([point, count]) => ({
      label: String(point),
      count,
      percent: Math.round((count / nums.length) * 100),
    }));
  return {
    average: Math.round(avg * 10) / 10,
    percent: Math.round((avg / max) * 100),
    answers: nums.length,
    distribution,
  };
}

/** Every measurable question across the missions, grouped by stable key. */
export function measurableQuestionIndex(missions: any[], language: string) {
  const map = new Map<string, { key: string; label: string; type: string; maxRating: number; ids: Set<string>; missionIds: Set<string> }>();
  for (const m of missions || []) {
    const qs = Array.isArray(m.questions) ? m.questions : [];
    for (const q of qs) {
      if (!isMeasurable(q)) continue;
      const key = questionKey(q);
      if (!key) continue;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: getLocalizedValue(q.text, language) || key,
          type: q.type,
          maxRating: q.max_rating || 5,
          ids: new Set(),
          missionIds: new Set(),
        });
      }
      const entry = map.get(key)!;
      entry.ids.add(String(q.id));
      entry.missionIds.add(m.id);
    }
  }
  return map;
}

export function computePinnedQuestion(
  entry: { key: string; label: string; type: string; maxRating: number; ids: Set<string>; missionIds: Set<string> },
  missions: any[],
  visits: any[],
  branches: any[],
  language: string,
): PinnedQuestionResult {
  const scoped = (visits || []).filter((v: any) => entry.missionIds.has(v.mission_id));
  const base = scoreAnswers(entry.type, entry.maxRating, answerValues(entry.ids, scoped));

  const missionBranch = new Map<string, string | null>();
  for (const m of missions || []) missionBranch.set(m.id, m.branch_id ?? null);

  const perBranch = (branches || [])
    .map((b: any) => {
      const bVisits = scoped.filter((v: any) => (v.branch_id ?? missionBranch.get(v.mission_id)) === b.id);
      const r = scoreAnswers(entry.type, entry.maxRating, answerValues(entry.ids, bVisits));
      return {
        name: (language === 'ar' && b.name_ar ? b.name_ar : b.name) as string,
        percent: r.percent,
        answers: r.answers,
      };
    })
    .filter(b => b.answers > 0 && b.percent !== null)
    .sort((a, b) => (b.percent ?? 0) - (a.percent ?? 0));

  return {
    key: entry.key,
    label: entry.label,
    type: entry.type,
    maxRating: entry.maxRating,
    average: base.average,
    percent: base.percent,
    answers: base.answers,
    distribution: base.distribution,
    bestBranch: perBranch[0] ? { name: perBranch[0].name, percent: perBranch[0].percent as number } : null,
    worstBranch:
      perBranch.length > 1
        ? { name: perBranch[perBranch.length - 1].name, percent: perBranch[perBranch.length - 1].percent as number }
        : null,
  };
}
