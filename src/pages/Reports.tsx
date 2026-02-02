import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Reports"
          description="Analyze visit outcomes and mission performance over time."
        />

        <Card className="border border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Reports are coming next (charts, summaries, and exports).
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
