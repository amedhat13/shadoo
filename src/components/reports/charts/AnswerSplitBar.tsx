import { MetricResult, ReportMetric } from '@/lib/reportMetrics';

interface AnswerSplitBarProps {
  metric: ReportMetric;
  result: MetricResult;
  /** Show the legend under the bar. */
  legend?: boolean;
}

/** One horizontal stacked bar showing how the answers split (promoters/passives/detractors, yes/no, bands). */
export function AnswerSplitBar({ result, legend = true }: AnswerSplitBarProps) {
  const buckets = result.buckets.filter(b => b.percent > 0 || b.count > 0);
  if (buckets.length === 0) {
    return <p className="text-xs text-muted-foreground py-6 text-center">No answers yet</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex h-7 w-full overflow-hidden rounded-md">
        {buckets.map((b, i) => (
          <div
            key={i}
            title={`${b.label}: ${b.percent}% (${b.count} answers)`}
            style={{ width: `${Math.max(b.percent, 0)}%`, backgroundColor: b.color }}
            className="flex items-center justify-center transition-all"
          >
            {b.percent >= 10 && (
              <span className="text-[10px] font-bold text-white">{b.percent}%</span>
            )}
          </div>
        ))}
      </div>
      {legend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {buckets.map((b, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
              <span className="text-[11px] text-muted-foreground">
                {b.label} · {b.percent}% ({b.count})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
