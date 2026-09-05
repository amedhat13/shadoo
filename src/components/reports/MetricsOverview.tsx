import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InfoHint } from '@/components/common/InfoHint';
import { EmptyState } from '@/components/common/EmptyState';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
  Tooltip as RechartsTooltip, LineChart, Line, ResponsiveContainer, ReferenceLine, LabelList, Area, AreaChart,
} from 'recharts';
import { BarChart3, Filter, Pin, PinOff, Settings2, TrendingUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLocalizedValue } from '@/i18n/utils';
import { useReportMetrics } from '@/hooks/useReportMetrics';
import { useReportPins } from '@/hooks/useReportPins';
import { buildBranchMatrix, metricToPercent, questionKey } from '@/lib/reportInsights';
import { BranchHeatMap } from '@/components/reports/BranchHeatMap';
import { TopBranchCard } from '@/components/reports/TopBranchCard';
import { BranchRadarComparison } from '@/components/reports/BranchRadarComparison';
import { PinnedQuestionCards } from '@/components/reports/PinnedQuestionCards';
import { ReportFilterProvider, useReportFilter } from '@/components/reports/ReportFilterContext';
import { ChartFrame } from '@/components/reports/charts/ChartFrame';
import { MetricGauge } from '@/components/reports/charts/MetricGauge';
import { AnswerSplitBar } from '@/components/reports/charts/AnswerSplitBar';
import { QuestionHeatGrid, HeatGridData } from '@/components/reports/charts/QuestionHeatGrid';
import { PeriodCompare, PeriodPoint } from '@/components/reports/charts/PeriodCompare';
import { WeightContribution } from '@/components/reports/charts/WeightContribution';
import { CHART, bandColor, metricDomain } from '@/components/reports/charts/chartTheme';
import {
  ReportMetric, computeAnyMetric, computeMetric, formatMetricValue, hasWeights, healthColor,
  metricContributions, metricDescription, metricName, questionSlug,
} from '@/lib/reportMetrics';

interface MetricsOverviewProps {
  missions: any[];
  visits: any[];
  branches: any[];
  language: string;
  /** Admin view: read the client's own metric configuration. */
  ownerId?: string;
  /** Hide the "configure" link (admin view). */
  hideSettingsLink?: boolean;
}

function taggedQuestions(missions: any[], metricKey: string) {
  const out: any[] = [];
  for (const m of missions || []) {
    const qs = Array.isArray(m.questions) ? m.questions : [];
    for (const q of qs) if (q?.metric_key === metricKey) out.push({ ...q, __missionId: m.id });
  }
  return out;
}

function monthKey(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string | null) {
  if (!key) return 'All time';
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

export function MetricsOverview(props: MetricsOverviewProps) {
  return (
    <ReportFilterProvider>
      <MetricsOverviewInner {...props} />
    </ReportFilterProvider>
  );
}

function MetricsOverviewInner({ missions, visits, branches, language, ownerId, hideSettingsLink }: MetricsOverviewProps) {
  const { activeMetrics, isLoading } = useReportMetrics(ownerId);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { isPinned, toggle: togglePin, canEdit: canPin } = useReportPins(ownerId);
  const filter = useReportFilter();

  const missionBranch = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const m of missions || []) map.set(m.id, m.branch_id ?? null);
    return map;
  }, [missions]);

  const branchOf = (v: any) => v.branch_id ?? missionBranch.get(v.mission_id) ?? null;

  // Branch matrix always uses every visit so the heat map / comparison stay complete.
  const matrix = useMemo(
    () => buildBranchMatrix(activeMetrics, missions, visits, branches, language),
    [activeMetrics, missions, visits, branches, language],
  );

  // Visits scoped to the current drill-down (branch + month).
  const scopedVisits = useMemo(() => {
    let list = visits || [];
    if (filter.branchId) list = list.filter((v: any) => branchOf(v) === filter.branchId);
    if (filter.month) list = list.filter((v: any) => monthKey(v.submitted_at || v.created_at) === filter.month);
    return list;
  }, [visits, filter.branchId, filter.month, missionBranch]);

  const focusedBranchName = filter.branchId ? matrix.branches.find(b => b.id === filter.branchId)?.name : null;

  const results = useMemo(() => {
    const visitsScope = scopedVisits;
    return activeMetrics.map((metric) => {
      const allQuestions = taggedQuestions(missions, metric.metric_key);
      // Question drill-down narrows the metric to the selected question only.
      const questions = filter.questionKey
        ? allQuestions.filter(q => questionSlug(q) === filter.questionKey)
        : allQuestions;

      const overall = metric.formula === 'expression'
        ? computeAnyMetric(metric, activeMetrics, missions, visitsScope)
        : computeMetric(metric, questions, visitsScope);

      // Per question — the same question can exist in several missions, so group by label
      const grouped = new Map<string, { qs: any[]; missionIds: Set<string> }>();
      for (const q of questions) {
        const label = getLocalizedValue(q.text, language) || 'Question';
        if (!grouped.has(label)) grouped.set(label, { qs: [], missionIds: new Set() });
        const entry = grouped.get(label)!;
        entry.qs.push(q);
        entry.missionIds.add(q.__missionId);
      }
      const perQuestion = Array.from(grouped.entries()).map(([label, entry]) => {
        const scoped = (visitsScope || []).filter((v: any) => entry.missionIds.has(v.mission_id));
        const r = computeMetric(metric, entry.qs, scoped);
        return { label, value: r.value, n: r.sampleSize, key: questionKey(entry.qs[0]) };
      }).filter(r => r.n > 0).sort((a, b) => (a.value ?? 0) - (b.value ?? 0));

      const contributions = metricContributions(metric, questions, visitsScope, language);

      // Per branch (visit → mission → branch)
      const byBranch = (branches || []).map((b: any) => {
        const bVisits = (visitsScope || []).filter((v: any) => branchOf(v) === b.id);
        const r = computeMetric(metric, questions, bVisits);
        const label = (language === 'ar' && b.name_ar ? b.name_ar : b.name) as string;
        return {
          id: b.id,
          full: label,
          name: label && label.length > 18 ? `${label.slice(0, 18)}…` : label,
          value: r.value ?? 0,
          n: r.sampleSize,
        };
      }).filter(b => b.n > 0).sort((a, b) => b.value - a.value);

      // Trend by month
      const monthMap = new Map<string, any[]>();
      for (const v of visitsScope || []) {
        const key = monthKey(v.submitted_at || v.created_at);
        if (!key) continue;
        if (!monthMap.has(key)) monthMap.set(key, []);
        monthMap.get(key)!.push(v);
      }
      const trend = Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, vs]) => {
          const r = computeMetric(metric, questions, vs);
          return { key, month: monthLabel(key), value: r.value ?? 0, n: r.sampleSize };
        })
        .filter(p => p.n > 0)
        .slice(-8);

      return { metric, overall, perQuestion, byBranch, trend, contributions, questionCount: questions.length };
    });
  }, [activeMetrics, missions, scopedVisits, branches, language, filter.questionKey]);

  // Period comparison: latest month with data vs the one before.
  const periodData = useMemo(() => {
    const months = Array.from(new Set((visits || [])
      .map((v: any) => monthKey(v.submitted_at || v.created_at))
      .filter(Boolean))).sort() as string[];
    if (months.length < 2) return null;
    const cur = months[months.length - 1];
    const prev = months[months.length - 2];
    const inMonth = (key: string) => (visits || []).filter((v: any) =>
      monthKey(v.submitted_at || v.created_at) === key &&
      (!filter.branchId || branchOf(v) === filter.branchId));
    const points: PeriodPoint[] = activeMetrics.map((metric) => {
      const qs = taggedQuestions(missions, metric.metric_key);
      const c = metric.formula === 'expression'
        ? computeAnyMetric(metric, activeMetrics, missions, inMonth(cur))
        : computeMetric(metric, qs, inMonth(cur));
      const p = metric.formula === 'expression'
        ? computeAnyMetric(metric, activeMetrics, missions, inMonth(prev))
        : computeMetric(metric, qs, inMonth(prev));
      return { metricKey: metric.metric_key, label: metricName(metric, language), current: c.value, previous: p.value };
    }).filter(p => p.current !== null || p.previous !== null);
    return { points, cur, prev };
  }, [visits, missions, activeMetrics, language, filter.branchId, missionBranch]);

  // Question × branch heat grid.
  const heatGrid = useMemo<HeatGridData>(() => {
    const rows: HeatGridData['rows'] = [];
    const cells: HeatGridData['cells'] = {};
    const cols = matrix.branches
      .filter(b => b.answers > 0)
      .map(b => ({ id: b.id, label: b.name }));

    for (const metric of activeMetrics) {
      if (metric.formula === 'expression') continue;
      const qs = taggedQuestions(missions, metric.metric_key);
      const grouped = new Map<string, any[]>();
      for (const q of qs) {
        const slug = questionSlug(q);
        if (!grouped.has(slug)) grouped.set(slug, []);
        grouped.get(slug)!.push(q);
      }
      for (const [slug, group] of grouped) {
        if (rows.some(r => r.key === slug)) continue;
        const label = getLocalizedValue(group[0].text, language) || slug;
        rows.push({ key: slug, label });
        cells[slug] = {};
        for (const col of cols) {
          const bVisits = (visits || []).filter((v: any) => branchOf(v) === col.id);
          const r = computeMetric(metric, group, bVisits);
          cells[slug][col.id] = {
            percent: metricToPercent(metric, r.value),
            answers: r.sampleSize,
            raw: formatMetricValue(metric, r.value),
          };
        }
      }
    }
    return { rows: rows.slice(0, 14), cols, cells };
  }, [activeMetrics, missions, visits, matrix.branches, language, missionBranch]);

  if (isLoading) return null;

  const withData = results.filter(r => r.questionCount > 0 || r.metric.formula === 'expression');

  if (activeMetrics.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={<BarChart3 className="h-7 w-7 text-muted-foreground" />}
            title="No metrics activated"
            description="Activate the metrics you want to track in Settings → Reports. Each active metric gets its own card and charts here."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drill-down bar */}
      {filter.isActive && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-3 py-2">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">Filtered by</span>
          {focusedBranchName && (
            <Badge variant="secondary" className="gap-1 text-[11px]">
              {focusedBranchName}
              <button type="button" onClick={() => filter.setBranch(null)} aria-label="Clear branch"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {filter.questionKey && (
            <Badge variant="secondary" className="gap-1 text-[11px]">
              {heatGrid.rows.find(r => r.key === filter.questionKey)?.label || filter.questionKey}
              <button type="button" onClick={() => filter.setQuestion(null)} aria-label="Clear question"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {filter.month && (
            <Badge variant="secondary" className="gap-1 text-[11px]">
              {monthLabel(filter.month)}
              <button type="button" onClick={() => filter.setMonth(null)} aria-label="Clear period"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-6 text-xs ms-auto" onClick={filter.clear}>Clear all</Button>
        </div>
      )}

      {/* Pinned questions */}
      <PinnedQuestionCards
        missions={missions}
        visits={scopedVisits}
        branches={branches}
        language={language}
        ownerId={ownerId}
      />

      {/* Top branch */}
      <TopBranchCard matrix={matrix} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide">Your metrics</h3>
          <p className="text-xs text-muted-foreground">
            Calculated from every question tagged with each metric, using the weights set for your account.
            {focusedBranchName && ` Focused on ${focusedBranchName}.`}
          </p>
        </div>
        {!hideSettingsLink && (
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/settings?tab=reports">
              <Settings2 className="h-4 w-4" /> How metrics are calculated
            </Link>
          </Button>
        )}
      </div>

      {/* Metric gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {results.map(({ metric, overall, questionCount }) => (
          <button
            key={metric.metric_key}
            type="button"
            onClick={() => setExpanded(expanded === metric.metric_key ? null : metric.metric_key)}
            className="text-start"
          >
            <Card className={`h-full transition-colors ${expanded === metric.metric_key ? 'border-primary' : 'hover:border-primary/50'}`}>
              <CardContent className="p-3 space-y-1">
                <div className="flex items-start justify-between gap-1">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground truncate">
                    {metricName(metric, language)}
                  </p>
                  {hasWeights(metric) && <Badge variant="outline" className="text-[9px] shrink-0">Weighted</Badge>}
                </div>
                <MetricGauge
                  metric={metric}
                  value={overall.value}
                  sampleSize={overall.sampleSize}
                  reason={overall.reason}
                  language={language}
                  compact
                />
                <p className="text-[10px] text-muted-foreground text-center">
                  {metric.formula === 'expression'
                    ? 'Custom formula'
                    : questionCount === 0 ? 'No tagged questions' : `${questionCount} question${questionCount > 1 ? 's' : ''}`}
                </p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {/* Period comparison */}
      {periodData && periodData.points.length > 0 && (
        <ChartFrame
          title="This period vs last"
          hint="Every active metric in the latest month with data, compared against the month before it. Green means it improved."
          meta={`${monthLabel(periodData.cur)} vs ${monthLabel(periodData.prev)}`}
          actions={
            <Button
              variant={filter.month === periodData.cur ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => filter.setMonth(filter.month === periodData.cur ? null : periodData.cur)}
            >
              {filter.month === periodData.cur ? 'Showing latest month' : 'Focus latest month'}
            </Button>
          }
        >
          <PeriodCompare
            points={periodData.points}
            metrics={activeMetrics}
            currentLabel={monthLabel(periodData.cur)}
            previousLabel={monthLabel(periodData.prev)}
          />
        </ChartFrame>
      )}

      {/* Location heat map */}
      <BranchHeatMap matrix={matrix} focusBranchId={filter.branchId} onFocusBranch={filter.setBranch} />

      {/* Question × branch heat grid */}
      <ChartFrame
        title="Question by branch"
        hint="Each cell is that question's score at that branch, on a comparable 0–100 scale. Click a cell to focus the whole page on it."
        meta={`${heatGrid.rows.length} questions × ${heatGrid.cols.length} branches`}
      >
        <QuestionHeatGrid
          data={heatGrid}
          activeRow={filter.questionKey}
          activeCol={filter.branchId}
          onSelect={(rowKey, colId) => {
            filter.setQuestion(filter.questionKey === rowKey && filter.branchId === colId ? null : rowKey);
            filter.setBranch(filter.questionKey === rowKey && filter.branchId === colId ? null : colId);
          }}
        />
      </ChartFrame>

      {/* Branch comparison */}
      <BranchRadarComparison matrix={matrix} metrics={activeMetrics} language={language} />

      {/* Per-metric detail blocks */}
      {withData
        .filter(r => !expanded || r.metric.metric_key === expanded)
        .map(({ metric, overall, byBranch, trend, contributions }) => (
          <Card key={metric.metric_key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex flex-wrap items-center gap-2">
                {metricName(metric, language)}
                <Badge variant="secondary" className="text-[10px] font-normal">{overall.sampleSize} answers</Badge>
                {hasWeights(metric) && <Badge variant="outline" className="text-[10px] font-normal">Weighted</Badge>}
                {metric.config?.minSample ? (
                  <Badge variant="outline" className="text-[10px] font-normal">Min {metric.config.minSample} answers</Badge>
                ) : null}
                <InfoHint label={metricDescription(metric, language) || metricName(metric, language)} />
              </CardTitle>
              <CardDescription className="text-xs">{metricDescription(metric, language)}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-2">
              {/* Answer split */}
              <div>
                <p className="text-xs font-medium mb-2 text-muted-foreground">Answer split</p>
                <AnswerSplitBar metric={metric} result={overall} />
              </div>

              {/* Trend */}
              <div>
                <p className="text-xs font-medium mb-2 text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Trend
                </p>
                {trend.length > 1 ? (
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${metric.metric_key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                        <XAxis dataKey="month" fontSize={10} stroke={CHART.axis} />
                        <YAxis fontSize={10} stroke={CHART.axis} domain={metricDomain(metric)} />
                        <RechartsTooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                          formatter={(v: any, _n: any, p: any) => [`${formatMetricValue(metric, Number(v))} · ${p.payload.n} answers`, metricName(metric, language)]}
                        />
                        {metric.config?.target !== undefined && (
                          <ReferenceLine y={metric.config.target} stroke="hsl(var(--foreground))" strokeDasharray="4 4" label={{ value: 'Target', fontSize: 9, position: 'insideTopRight' }} />
                        )}
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fill={`url(#grad-${metric.metric_key})`}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-8 text-center">Not enough history yet</p>
                )}
              </div>

              {/* By branch */}
              <div>
                <p className="text-xs font-medium mb-2 text-muted-foreground">By branch — click a bar to focus</p>
                {byBranch.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byBranch} margin={{ top: 12, right: 8, left: -18, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                        <XAxis dataKey="name" fontSize={9} stroke={CHART.axis} interval={0} angle={-15} textAnchor="end" height={44} />
                        <YAxis fontSize={10} stroke={CHART.axis} domain={metricDomain(metric)} />
                        <RechartsTooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                          formatter={(v: any, _n: any, p: any) => [`${formatMetricValue(metric, Number(v))} · ${p.payload.n} answers`, p.payload.full]}
                        />
                        {metric.config?.target !== undefined && (
                          <ReferenceLine y={metric.config.target} stroke="hsl(var(--foreground))" strokeDasharray="4 4" />
                        )}
                        <Bar
                          dataKey="value"
                          radius={[3, 3, 0, 0]}
                          onClick={(d: any) => filter.setBranch(filter.branchId === d?.id ? null : d?.id)}
                          className="cursor-pointer"
                        >
                          {byBranch.map((b, i) => (
                            <Cell key={i} fill={bandColor(metric, b.value)} opacity={filter.branchId && filter.branchId !== b.id ? 0.35 : 1} />
                          ))}
                          <LabelList dataKey="value" position="top" fontSize={9} formatter={(v: any) => Math.round(Number(v))} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-8 text-center">No branch data yet</p>
                )}
              </div>

              {/* Weight contribution */}
              <div>
                <p className="text-xs font-medium mb-2 text-muted-foreground flex items-center gap-1.5">
                  Questions feeding this metric
                  <InfoHint label="Bar length is the question's own score. The badge shows its weight and how much of the metric it accounts for." />
                </p>
                <WeightContribution metric={metric} contributions={contributions} />
                {canPin && contributions.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {contributions.filter(c => c.answers > 0).slice(0, 6).map(c => (
                      <div key={c.slug} className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          title={isPinned(c.slug) ? 'Unpin from overview' : 'Pin to overview'}
                          onClick={() => togglePin({ question_key: c.slug, label: c.label })}
                        >
                          {isPinned(c.slug)
                            ? <PinOff className="h-3.5 w-3.5 text-primary" />
                            : <Pin className="h-3.5 w-3.5 text-muted-foreground" />}
                        </Button>
                        <span className="text-[11px] flex-1 truncate">{c.label}</span>
                        <span className={`text-[11px] font-bold ${healthColor(metric, c.value)}`}>
                          {formatMetricValue(metric, c.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
