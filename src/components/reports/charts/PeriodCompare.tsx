import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { ReportMetric, formatMetricValue } from '@/lib/reportMetrics';
import { CHART, metricDomain } from './chartTheme';

export interface PeriodPoint {
  metricKey: string;
  label: string;
  current: number | null;
  previous: number | null;
}

interface Props {
  points: PeriodPoint[];
  metrics: ReportMetric[];
  currentLabel: string;
  previousLabel: string;
}

/** Current period vs the one before it, per metric, with the change called out. */
export function PeriodCompare({ points, metrics, currentLabel, previousLabel }: Props) {
  const rows = points.filter(p => p.current !== null || p.previous !== null);
  if (rows.length === 0) {
    return <p className="text-xs text-muted-foreground py-8 text-center">Not enough history to compare periods yet.</p>;
  }

  const metricOf = (key: string) => metrics.find(m => m.metric_key === key);

  return (
    <div className="space-y-3">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 12, right: 8, left: -12, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="label" fontSize={10} stroke={CHART.axis} interval={0} angle={-12} textAnchor="end" height={44} />
            <YAxis fontSize={10} stroke={CHART.axis} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
              formatter={(v: any, n: any) => [Math.round(Number(v)), n === 'previous' ? previousLabel : currentLabel]}
            />
            <Bar dataKey="previous" name="previous" fill={CHART.neutral} radius={[3, 3, 0, 0]} />
            <Bar dataKey="current" name="current" radius={[3, 3, 0, 0]}>
              {rows.map((r, i) => (
                <Cell key={i} fill={(r.current ?? 0) >= (r.previous ?? 0) ? CHART.good : CHART.poor} />
              ))}
              <LabelList dataKey="current" position="top" fontSize={10} formatter={(v: any) => (v === null ? '' : Math.round(Number(v)))} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        {rows.map(r => {
          const m = metricOf(r.metricKey);
          const delta = r.current !== null && r.previous !== null ? r.current - r.previous : null;
          const Icon = delta === null ? Minus : delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : Minus;
          const tone = delta === null ? 'text-muted-foreground' : delta > 0 ? 'text-success' : delta < 0 ? 'text-destructive' : 'text-muted-foreground';
          return (
            <div key={r.metricKey} className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-1.5">
              <span className="text-[11px] truncate">{r.label}</span>
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="text-muted-foreground">
                  {m && r.previous !== null ? formatMetricValue(m, r.previous) : '—'} →{' '}
                  <span className="font-bold text-foreground">{m && r.current !== null ? formatMetricValue(m, r.current) : '—'}</span>
                </span>
                <span className={`flex items-center gap-0.5 font-bold ${tone}`}>
                  <Icon className="h-3 w-3" />
                  {delta === null ? '—' : `${Math.abs(Math.round(delta * 10) / 10)}`}
                </span>
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground">
        {currentLabel} compared with {previousLabel}.
      </p>
    </div>
  );
}
