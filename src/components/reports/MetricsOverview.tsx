import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { InfoHint } from '@/components/common/InfoHint';
import { EmptyState } from '@/components/common/EmptyState';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell,
  Tooltip as RechartsTooltip, LineChart, Line, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { BarChart3, Settings2, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLocalizedValue } from '@/i18n/utils';
import { useReportMetrics } from '@/hooks/useReportMetrics';
import {
  ReportMetric, computeMetric, formatMetricValue, healthColor, metricDescription,
  metricFormat, metricMaxForGauge, metricName,
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

export function MetricsOverview({ missions, visits, branches, language, ownerId, hideSettingsLink }: MetricsOverviewProps) {
  const { activeMetrics, isLoading } = useReportMetrics(ownerId);
  const [expanded, setExpanded] = useState<string | null>(null);

  const results = useMemo(() => {
    return activeMetrics.map((metric) => {
      const questions = taggedQuestions(missions, metric.metric_key);
      const overall = computeMetric(metric, questions, visits);

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
        const scoped = (visits || []).filter((v: any) => entry.missionIds.has(v.mission_id));
        const r = computeMetric(metric, entry.qs, scoped);
        return { label, value: r.value, n: r.sampleSize };
      }).filter(r => r.n > 0).sort((a, b) => (a.value ?? 0) - (b.value ?? 0));

      // Per branch (visit → mission → branch)
      const missionBranch = new Map<string, string | null>();
      for (const m of missions || []) missionBranch.set(m.id, m.branch_id ?? null);
      const byBranch = (branches || []).map((b: any) => {
        const bVisits = (visits || []).filter((v: any) => {
          const bid = v.branch_id ?? missionBranch.get(v.mission_id);
          return bid === b.id;
        });
        const r = computeMetric(metric, questions, bVisits);
        const label = (language === 'ar' && b.name_ar ? b.name_ar : b.name) as string;
        return {
          name: label && label.length > 18 ? `${label.slice(0, 18)}…` : label,
          value: r.value ?? 0,
          n: r.sampleSize,
        };
      }).filter(b => b.n > 0).sort((a, b) => b.value - a.value);

      // Trend by month
      const monthMap = new Map<string, any[]>();
      for (const v of visits || []) {
        const key = monthKey(v.submitted_at || v.created_at);
        if (!key) continue;
        if (!monthMap.has(key)) monthMap.set(key, []);
        monthMap.get(key)!.push(v);
      }
      const trend = Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, vs]) => {
          const r = computeMetric(metric, questions, vs);
          return { month: key.slice(2), value: r.value ?? 0, n: r.sampleSize };
        })
        .filter(p => p.n > 0)
        .slice(-8);

      return { metric, overall, perQuestion, byBranch, trend, questionCount: questions.length };
    });
  }, [activeMetrics, missions, visits, branches, language]);

  if (isLoading) return null;

  const withData = results.filter(r => r.questionCount > 0);

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide">Your metrics</h3>
          <p className="text-xs text-muted-foreground">
            Calculated from every question tagged with each metric. {withData.length} of {activeMetrics.length} active metrics have tagged questions.
          </p>
        </div>
        {!hideSettingsLink && (
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/settings?tab=reports">
              <Settings2 className="h-4 w-4" /> Configure metrics
            </Link>
          </Button>
        )}
      </div>

      {/* Metric scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {results.map(({ metric, overall, questionCount }) => (
          <MetricScorecard
            key={metric.metric_key}
            metric={metric}
            value={overall.value}
            sampleSize={overall.sampleSize}
            questionCount={questionCount}
            language={language}
            active={expanded === metric.metric_key}
            onClick={() => setExpanded(expanded === metric.metric_key ? null : metric.metric_key)}
          />
        ))}
      </div>

      {/* Per-metric detail blocks */}
      {withData
        .filter(r => !expanded || r.metric.metric_key === expanded)
        .map(({ metric, overall, perQuestion, byBranch, trend }) => (
          <Card key={metric.metric_key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {metricName(metric, language)}
                <Badge variant="secondary" className="text-[10px] font-normal">
                  {overall.sampleSize} answers
                </Badge>
                <InfoHint label={metricDescription(metric, language) || metricName(metric, language)} />
              </CardTitle>
              <CardDescription className="text-xs">{metricDescription(metric, language)}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-3">
              {/* Distribution */}
              <div>
                <p className="text-xs font-medium mb-2 text-muted-foreground">Response split</p>
                {overall.buckets.length > 0 ? (
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={overall.buckets}
                          dataKey="count"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={72}
                          label={({ label, percent }) => `${label}: ${percent}%`}
                        >
                          {overall.buckets.map((b, i) => <Cell key={i} fill={b.color} />)}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-8 text-center">No answers yet</p>
                )}
              </div>

              {/* By branch */}
              <div>
                <p className="text-xs font-medium mb-2 text-muted-foreground">By branch</p>
                {byBranch.length > 0 ? (
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byBranch}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={9} interval={0} angle={-15} textAnchor="end" height={40} />
                        <YAxis fontSize={10} domain={[metricFormat(metric) === 'score' ? -100 : 0, metricMaxForGauge(metric)]} />
                        <RechartsTooltip />
                        {metric.config?.target !== undefined && (
                          <ReferenceLine y={metric.config.target} stroke="hsl(var(--primary))" strokeDasharray="4 4" />
                        )}
                        <Bar dataKey="value" fill="hsl(var(--primary))" name={metricName(metric, language)} radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-8 text-center">No branch data yet</p>
                )}
              </div>

              {/* Trend */}
              <div>
                <p className="text-xs font-medium mb-2 text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Trend
                </p>
                {trend.length > 1 ? (
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={10} />
                        <YAxis fontSize={10} domain={[metricFormat(metric) === 'score' ? -100 : 0, metricMaxForGauge(metric)]} />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-8 text-center">Not enough history yet</p>
                )}
              </div>

              {/* Question contribution */}
              <div className="lg:col-span-3">
                <p className="text-xs font-medium mb-2 text-muted-foreground">Questions feeding this metric</p>
                <div className="space-y-2">
                  {perQuestion.map((q, i) => {
                    const max = metricMaxForGauge(metric);
                    const pct = Math.max(0, Math.min(100, ((q.value ?? 0) - (metricFormat(metric) === 'score' ? -100 : 0)) / (max - (metricFormat(metric) === 'score' ? -100 : 0)) * 100));
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs flex-1 truncate">{q.label}</span>
                        <Progress value={pct} className="h-2 w-32" />
                        <span className={`text-xs font-bold w-16 text-end ${healthColor(metric, q.value)}`}>
                          {formatMetricValue(metric, q.value)}
                        </span>
                        <span className="text-[10px] text-muted-foreground w-14 text-end">{q.n} ans.</span>
                      </div>
                    );
                  })}
                  {perQuestion.length === 0 && (
                    <p className="text-xs text-muted-foreground">No tagged questions have answers yet.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

function MetricScorecard({
  metric, value, sampleSize, questionCount, language, active, onClick,
}: {
  metric: ReportMetric; value: number | null; sampleSize: number; questionCount: number;
  language: string; active: boolean; onClick: () => void;
}) {
  const target = metric.config?.target;
  const max = metricMaxForGauge(metric);
  const base = metricFormat(metric) === 'score' ? -100 : 0;
  const pct = value === null ? 0 : Math.max(0, Math.min(100, ((value - base) / (max - base)) * 100));

  return (
    <button type="button" onClick={onClick} className="text-start">
      <Card className={`h-full transition-colors ${active ? 'border-primary' : 'hover:border-primary/50'}`}>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {metricName(metric, language)}
            </p>
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className={`text-2xl font-bold ${healthColor(metric, value)}`}>
            {formatMetricValue(metric, value)}
          </p>
          <Progress value={pct} className="h-1.5" />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{questionCount === 0 ? 'No tagged questions' : `${sampleSize} answers · ${questionCount} Q`}</span>
            {target !== undefined && <span>Target {formatMetricValue(metric, target)}</span>}
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
