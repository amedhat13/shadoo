import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { MetricContribution, ReportMetric, formatMetricValue } from '@/lib/reportMetrics';
import { CHART, bandColor, metricDomain } from './chartTheme';

interface Props {
  metric: ReportMetric;
  contributions: MetricContribution[];
}

/** How much each question pushed the metric, with its weight and share of the total. */
export function WeightContribution({ metric, contributions }: Props) {
  const rows = contributions.filter(c => c.answers > 0);
  if (rows.length === 0) {
    return <p className="text-xs text-muted-foreground py-8 text-center">No tagged questions have answers yet.</p>;
  }

  const data = rows.map(r => ({
    ...r,
    short: r.label.length > 26 ? `${r.label.slice(0, 26)}…` : r.label,
  }));

  return (
    <div className="space-y-3">
      <div style={{ height: Math.max(160, data.length * 34) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
            <XAxis type="number" domain={metricDomain(metric)} fontSize={10} stroke={CHART.axis} />
            <YAxis type="category" dataKey="short" width={170} fontSize={10} stroke={CHART.axis} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
              formatter={(v: any, _n: any, p: any) => [
                `${formatMetricValue(metric, Number(v))} · weight ${p.payload.weight} · ${p.payload.share}% of score · ${p.payload.answers} answers`,
                p.payload.label,
              ]}
            />
            <Bar dataKey="value" radius={[0, 3, 3, 0]}>
              {data.map((r, i) => <Cell key={i} fill={bandColor(metric, r.value)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {data.map(r => (
          <Badge key={r.slug} variant={r.weight === 1 ? 'outline' : 'secondary'} className="text-[10px] font-normal">
            {r.short} · ×{r.weight} · {r.share}%
          </Badge>
        ))}
      </div>
    </div>
  );
}
