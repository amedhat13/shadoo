// Shared chart language for every report chart (client + admin).
import { ReportMetric, metricFormat, metricMaxForGauge } from '@/lib/reportMetrics';

export const CHART = {
  primary: 'hsl(var(--primary))',
  primarySoft: 'hsl(var(--primary) / 0.18)',
  grid: 'hsl(var(--border))',
  axis: 'hsl(var(--muted-foreground))',
  good: 'hsl(142 71% 45%)',
  fair: 'hsl(38 92% 50%)',
  poor: 'hsl(0 84% 60%)',
  neutral: 'hsl(var(--muted-foreground) / 0.35)',
};

/** Ordered palette for series / categories. */
export const SERIES_COLORS = [
  'hsl(var(--primary))',
  'hsl(199 89% 48%)',
  'hsl(142 71% 45%)',
  'hsl(38 92% 50%)',
  'hsl(280 65% 60%)',
  'hsl(0 84% 60%)',
];

export interface MetricBands {
  min: number;
  max: number;
  fair: number;
  good: number;
  excellent: number;
}

/** Colour bands on the metric's own output scale. */
export function metricBands(metric: ReportMetric): MetricBands {
  const fmt = metricFormat(metric);
  const min = fmt === 'score' ? -100 : 0;
  const max = metricMaxForGauge(metric);
  const span = max - min;
  const cfg = metric.config?.bands;
  return {
    min,
    max,
    fair: cfg?.fair ?? min + span * 0.4,
    good: cfg?.good ?? min + span * 0.6,
    excellent: cfg?.excellent ?? min + span * 0.8,
  };
}

export function bandColor(metric: ReportMetric, value: number | null): string {
  if (value === null) return CHART.neutral;
  const b = metricBands(metric);
  if (value >= b.good) return CHART.good;
  if (value >= b.fair) return CHART.fair;
  return CHART.poor;
}

/** Axis domain for a metric, so every chart of the same metric shares one scale. */
export function metricDomain(metric: ReportMetric): [number, number] {
  const b = metricBands(metric);
  return [b.min, b.max];
}
