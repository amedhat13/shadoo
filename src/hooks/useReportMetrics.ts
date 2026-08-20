import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ReportMetric } from '@/lib/reportMetrics';

/**
 * Report metric definitions.
 * Rows with `user_id = null` are the platform defaults; a client row with the
 * same `metric_key` overrides the default for that client.
 *
 * Pass `ownerId` to read another account's configuration (admin per-client view).
 */
export function useReportMetrics(ownerId?: string) {
  const { user } = useAuth();
  const effectiveOwner = ownerId ?? user?.id ?? null;
  const queryClient = useQueryClient();
  const isOwnConfig = !ownerId || ownerId === user?.id;

  const query = useQuery({
    queryKey: ['report-metrics', effectiveOwner],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_metrics')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as ReportMetric[];
    },
  });

  const metrics = useMemo(() => {
    const rows = query.data || [];
    const merged = new Map<string, ReportMetric>();
    for (const row of rows) {
      if (row.user_id === null) merged.set(row.metric_key, row);
    }
    for (const row of rows) {
      if (effectiveOwner && row.user_id === effectiveOwner) merged.set(row.metric_key, row);
    }
    return Array.from(merged.values()).sort((a, b) => a.sort_order - b.sort_order);
  }, [query.data, effectiveOwner]);

  const activeMetrics = useMemo(() => metrics.filter(m => m.is_active), [metrics]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['report-metrics'] });

  /** Saves a metric for the current owner (creates a per-client override of a default). */
  const saveMetric = useMutation({
    mutationFn: async (metric: Partial<ReportMetric> & { metric_key: string }) => {
      if (!effectiveOwner) throw new Error('Not signed in');
      const payload = {
        user_id: effectiveOwner,
        metric_key: metric.metric_key,
        name: metric.name ?? metric.metric_key,
        name_ar: metric.name_ar ?? null,
        description: metric.description ?? null,
        description_ar: metric.description_ar ?? null,
        applies_to: metric.applies_to ?? ['rating'],
        formula: metric.formula ?? 'average',
        config: (metric.config ?? {}) as never,
        is_active: metric.is_active ?? true,
        is_system: metric.is_system ?? false,
        sort_order: metric.sort_order ?? 100,
      };
      const { error } = await supabase
        .from('report_metrics')
        .upsert(payload, { onConflict: 'user_id,metric_key' });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  /** Removes a client's own metric (custom metric deleted, override reverts to default). */
  const removeMetric = useMutation({
    mutationFn: async (metric: ReportMetric) => {
      if (!effectiveOwner) throw new Error('Not signed in');
      const { error } = await supabase
        .from('report_metrics')
        .delete()
        .eq('user_id', effectiveOwner)
        .eq('metric_key', metric.metric_key);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    metrics,
    activeMetrics,
    isLoading: query.isLoading,
    isOwnConfig,
    saveMetric,
    removeMetric,
  };
}
