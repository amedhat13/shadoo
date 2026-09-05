import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/common/LoadingState';
import { InfoHint } from '@/components/common/InfoHint';
import { BarChart3, Lock, Phone, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useReportMetrics } from '@/hooks/useReportMetrics';
import { METRIC_FORMULAS, formatMetricValue, metricFormat } from '@/lib/reportMetrics';

/**
 * Read-only view of how the account's report metrics are calculated.
 * Changes are made by the Shadoo team so calculations stay consistent and comparable.
 */
export function ReportMetricsSettings() {
  const { metrics, isLoading } = useReportMetrics();

  if (isLoading) return <LoadingState message="Loading metrics" />;

  const active = metrics.filter(m => m.is_active);
  const inactive = metrics.filter(m => !m.is_active);

  const row = (m: typeof metrics[number]) => {
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
                ? <Badge variant="secondary" className="text-[10px]">Standard</Badge>
                : <Badge variant="outline" className="text-[10px]">Custom for you</Badge>}
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl">{m.description}</p>
          </div>
          <Badge variant={m.is_active ? 'default' : 'outline'} className="text-[10px] shrink-0">
            {m.is_active ? 'Shown in reports' : 'Hidden'}
          </Badge>
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
          {weightCount > 0 && (
            <Badge variant="secondary" className="font-normal">{weightCount} questions weighted differently</Badge>
          )}
          {m.config?.minSample ? (
            <Badge variant="secondary" className="font-normal">Needs {m.config.minSample}+ answers</Badge>
          ) : null}
          <Badge variant="secondary" className="font-normal">
            "Not applicable" answers: {m.config?.naHandling === 'zero' ? 'counted as zero' : 'not counted'}
          </Badge>
          {m.config?.target !== undefined && (
            <Badge variant="secondary" className="font-normal gap-1">
              <Target className="h-3 w-3" /> Target {formatMetricValue(m, m.config.target)}
            </Badge>
          )}
          <Badge variant="secondary" className="font-normal">Shown as: {metricFormat(m)}</Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> How your report metrics are calculated
          </CardTitle>
          <CardDescription className="space-y-2">
            <span className="block">
              Each metric below is built from the questions tagged with it in your missions. Metrics marked "Shown in
              reports" appear on your Reports overview with their own charts.
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <Lock className="h-3.5 w-3.5" />
              Set up by the Shadoo team so your scores stay comparable over time. Ask us for any change and we'll tune it
              for your account.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {active.map(row)}
          {inactive.length > 0 && (
            <div className="pt-2 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                Not shown in your reports
                <InfoHint label="These metrics exist on the platform but are switched off for your account." />
              </p>
              {inactive.map(row)}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-muted-foreground">
            Want a metric weighted differently, a new score, or a different target?
          </p>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/settings?tab=account">
              <Phone className="h-4 w-4" /> Request a change
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
