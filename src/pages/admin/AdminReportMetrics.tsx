import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { ClientSelector } from '@/components/admin/common/ClientSelector';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MetricConfigEditor, WeightTarget } from '@/components/admin/reports/MetricConfigEditor';
import { questionSlug } from '@/lib/reportMetrics';
import { Building2, Globe2 } from 'lucide-react';

const PLATFORM = '__platform__';

export default function AdminReportMetricsPage() {
  const [scope, setScope] = useState<string>(PLATFORM);
  const isPlatform = scope === PLATFORM;

  const { data: missions } = useQuery({
    queryKey: ['admin-client-missions', scope],
    enabled: !isPlatform,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missions')
        .select('id, questions')
        .eq('user_id', scope);
      if (error) throw error;
      return data || [];
    },
  });

  const weightTargets = useMemo<WeightTarget[]>(() => {
    const seen = new Set<string>();
    const out: WeightTarget[] = [];
    for (const m of missions || []) {
      const qs = Array.isArray(m.questions) ? (m.questions as any[]) : [];
      for (const q of qs) {
        if (!q?.metric_key) continue;
        const slug = questionSlug(q);
        const id = `${q.metric_key}::${slug}`;
        if (seen.has(id)) continue;
        seen.add(id);
        const text = q.text;
        const label = typeof text === 'object' && text ? (text.en || text.ar) : text;
        out.push({ slug, label: String(label || slug), metricKey: q.metric_key });
      }
    }
    return out;
  }, [missions]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Report metrics"
          description="Metric definitions, weights and grading rules. Clients see the results and a read-only summary — only your team edits these."
        />

        <Card>
          <CardContent className="flex flex-wrap items-end gap-4 p-4">
            <div className="flex gap-2">
              <Button
                variant={isPlatform ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => setScope(PLATFORM)}
              >
                <Globe2 className="h-4 w-4" /> Platform defaults
              </Button>
              <Button
                variant={!isPlatform ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
                onClick={() => setScope('')}
              >
                <Building2 className="h-4 w-4" /> One client
              </Button>
            </div>
            {!isPlatform && (
              <div className="min-w-[260px]">
                <ClientSelector value={scope} onValueChange={setScope} label="Client" />
              </div>
            )}
          </CardContent>
        </Card>

        {isPlatform ? (
          <MetricConfigEditor ownerId={null} scopeLabel="all clients (platform defaults)" />
        ) : scope ? (
          <MetricConfigEditor ownerId={scope} weightTargets={weightTargets} scopeLabel="this client" />
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Pick a client to configure their metrics, or switch back to the platform defaults.
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
