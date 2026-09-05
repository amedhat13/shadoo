import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ReportMetric, formatMetricValue, metricName } from '@/lib/reportMetrics';
import { CHART, bandColor, metricBands } from './chartTheme';

interface MetricGaugeProps {
  metric: ReportMetric;
  value: number | null;
  sampleSize: number;
  language: string;
  reason?: string;
  compact?: boolean;
}

/** Half-circle dial: score against target, coloured by band. */
export function MetricGauge({ metric, value, sampleSize, language, reason, compact }: MetricGaugeProps) {
  const b = metricBands(metric);
  const span = b.max - b.min || 1;
  const pct = value === null ? 0 : Math.max(0, Math.min(1, (value - b.min) / span));
  const color = bandColor(metric, value);
  const target = metric.config?.target;
  const targetPct = target === undefined ? null : Math.max(0, Math.min(1, (target - b.min) / span));

  const data = [
    { name: 'value', v: pct },
    { name: 'rest', v: 1 - pct },
  ];

  return (
    <div className={compact ? 'relative h-28' : 'relative h-40'}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* band track */}
          <Pie
            data={[
              { v: (b.fair - b.min) / span },
              { v: (b.good - b.fair) / span },
              { v: (b.max - b.good) / span },
            ]}
            dataKey="v"
            startAngle={180}
            endAngle={0}
            cx="50%"
            cy="82%"
            innerRadius="62%"
            outerRadius="70%"
            stroke="none"
            isAnimationActive={false}
          >
            <Cell fill={`${CHART.poor.replace(')', ' / 0.25)')}`} />
            <Cell fill={`${CHART.fair.replace(')', ' / 0.25)')}`} />
            <Cell fill={`${CHART.good.replace(')', ' / 0.25)')}`} />
          </Pie>
          {/* value arc */}
          <Pie
            data={data}
            dataKey="v"
            startAngle={180}
            endAngle={0}
            cx="50%"
            cy="82%"
            innerRadius="72%"
            outerRadius="96%"
            stroke="none"
          >
            <Cell fill={color} />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
          {targetPct !== null && (
            <Pie
              data={[{ v: targetPct }, { v: 0.006 }, { v: Math.max(0, 1 - targetPct - 0.006) }]}
              dataKey="v"
              startAngle={180}
              endAngle={0}
              cx="50%"
              cy="82%"
              innerRadius="70%"
              outerRadius="100%"
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill="transparent" />
              <Cell fill="hsl(var(--foreground))" />
              <Cell fill="transparent" />
            </Pie>
          )}
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-x-0 bottom-1 text-center">
        <p className="text-2xl font-bold leading-none" style={{ color: value === null ? undefined : color }}>
          {value === null ? '—' : formatMetricValue(metric, value)}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {reason === 'low_sample'
            ? `Not enough answers (${sampleSize})`
            : reason === 'formula_error'
              ? 'Formula needs fixing'
              : target !== undefined
                ? `Target ${formatMetricValue(metric, target)} · ${sampleSize} answers`
                : `${sampleSize} answers`}
        </p>
        {!compact && (
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mt-0.5">
            {metricName(metric, language)}
          </p>
        )}
      </div>
    </div>
  );
}
