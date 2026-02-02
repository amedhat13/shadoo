import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { SubscriptionPlans } from '@/components/settings/SubscriptionPlans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { CreditCard, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { plans, currentPlanId, currentPlan, isLoading, selectPlan } = useSubscription();

  const handleSelectPlan = async (planId: string) => {
    await selectPlan(planId);
    const plan = plans.find((p) => p.id === planId);
    toast.success(`Switched to ${plan?.name} plan`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Configure your organization preferences and subscription."
        />

        {/* Current Plan Summary */}
        {currentPlan && (
          <Card className="border border-primary/30 bg-primary/5">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-primary">
                  <CreditCard className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Current Plan</div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{currentPlan.name}</span>
                    <Badge variant="secondary">{currentPlan.visits_per_month} visits/month</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold">Subscription Plans</h2>
            <p className="text-sm text-muted-foreground">
              Choose the plan that best fits your business needs.
            </p>
          </div>
          <SubscriptionPlans
            plans={plans}
            currentPlanId={currentPlanId}
            onSelectPlan={handleSelectPlan}
            isLoading={isLoading}
          />
        </section>

        <Separator />

        {/* Other Settings */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <Bell className="h-4 w-4" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive alerts and updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Notification settings coming soon.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <Shield className="h-4 w-4" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security and access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Security settings coming soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
