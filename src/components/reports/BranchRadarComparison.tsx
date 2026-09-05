import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radar as RadarIcon } from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { ReportMetric, metricName, formatMetricValue } from '@/lib/reportMetrics';
import { BranchMatrix } from '@/lib/reportInsights';

const SERIES_COLORS = ['hsl(var(--primary))', 'hsl(142 71% 45%)', 'hsl(199 89% 48%)', 'hsl(280 65% 60%)'];
const MAX_SELECTED = 4;

interface Props {
  matrix: BranchMatrix;
  metrics: ReportMetric[];
  language: string;
}

export function BranchRadarComparison({ matrix, metrics, language }: Props) {
  const candidates = matrix.ranked;
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (selected.length === 0 && candidates.length > 0) {
      setSelected(candidates.slice(0, Math.min(MAX_SELECTED, candidates.length)).map(b => b.id));
    }
  }, [candidates, selected.length]);

  const chosen = candidates.filter(b => selected.includes(b.id));

  const data = useMemo(() => {
    return metrics
      .filter(m => chosen.some(b => (b.perMetric[m.metric_key]?.sampleSize ?? 0) > 0))
      .map(m => {
        const row: Record<string, any> = { metric: metricName(m, language) };
        for (const b of chosen) row[b.name] = Math.round(b.perMetric[m.metric_key]?.percent ?? 0);
        return row;
      });
  }, [metrics, chosen, language]);

  if (candidates.length < 2 || metrics.length === 0) return null;

  const toggle = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= MAX_SELECTED) return prev;
      return [...prev, id];
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <RadarIcon className="h-4 w-4 text-primary" /> Branch comparison — who scores best in what
        </CardTitle>
        <CardDescription className="text-xs">
          Every axis is one of your active metrics, normalised to 0-100 so branches are directly comparable. Pick up to {MAX_SELECTED} branches.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {candidates.map(b => {
            const active = selected.includes(b.id);
            return (
              <Button
                key={b.id}
                type="button"
                size="sm"
                variant={active ? 'default' : 'outline'}
                className="h-7 text-xs"
                onClick={() => toggle(b.id)}
              >
                {b.name}
              </Button>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-80">
            {data.length >= 3 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} outerRadius="72%">
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <RechartsTooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {chosen.map((b, i) => (
                    <Radar
                      key={b.id}
                      name={b.name}
                      dataKey={b.name}
                      stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                      fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                      fillOpacity={0.18}
                      strokeWidth={2}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground py-12 text-center">
                At least three metrics with answers are needed to draw the comparison shape.
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium mb-2 text-muted-foreground">Best in each metric</p>
            <div className="space-y-2">
              {metrics.map(m => {
                const leader = matrix.bestPerMetric[m.metric_key];
                if (!leader) return null;
                const lead = leader.runnerUp !== null ? Math.round(leader.percent - leader.runnerUp) : null;
                return (
                  <div key={m.metric_key} className="flex items-center gap-2 text-xs">
                    <span className="flex-1 truncate text-muted-foreground">{metricName(m, language)}</span>
                    <span className="font-semibold truncate max-w-[45%]">{leader.branch.name}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {formatMetricValue(m, leader.branch.perMetric[m.metric_key].value)}
                    </Badge>
                    {lead !== null && lead > 0 && (
                      <span className="text-[10px] text-success">+{lead} pts</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
