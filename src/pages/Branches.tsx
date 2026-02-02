import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function BranchesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Branches"
          description="Manage your locations to scope missions by branch."
        />

        <Card className="border border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Branch management will be added here.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
