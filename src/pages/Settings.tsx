import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Configure your organization preferences and notifications."
        />

        <Card className="border border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Settings will be available here.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
