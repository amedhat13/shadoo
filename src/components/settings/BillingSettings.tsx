import { CreditCard, Receipt, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SubscriptionPlans } from './SubscriptionPlans';
import { useSubscription } from '@/hooks/useSubscription';
import { CURRENCY } from '@/lib/constants';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

const mockInvoices: Invoice[] = [
  { id: 'INV-001', date: '2024-03-01', amount: 5999, status: 'paid' },
  { id: 'INV-002', date: '2024-02-01', amount: 5999, status: 'paid' },
  { id: 'INV-003', date: '2024-01-01', amount: 5999, status: 'paid' },
];

const STATUS_CONFIG = {
  paid: { label: 'Paid', variant: 'default' as const },
  pending: { label: 'Pending', variant: 'secondary' as const },
  failed: { label: 'Failed', variant: 'destructive' as const },
};

export function BillingSettings() {
  const { plans, currentPlanId, currentPlan, isLoading, selectPlan } = useSubscription();

  const handleSelectPlan = async (planId: string) => {
    await selectPlan(planId);
    const plan = plans.find((p) => p.id === planId);
    toast.success(`Switched to ${plan?.name} plan`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-EG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      {currentPlan && (
        <Card className="border border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center bg-primary">
                  <CreditCard className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Current Plan</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{currentPlan.name}</span>
                    <Badge>{currentPlan.visits_per_month} visits/month</Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black">
                  {currentPlan.price.toLocaleString(CURRENCY.locale)} {CURRENCY.symbol}
                </div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Next billing date: March 1, 2024
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div>
        <h3 className="mb-4 text-lg font-bold">Available Plans</h3>
        <SubscriptionPlans
          plans={plans}
          currentPlanId={currentPlanId}
          onSelectPlan={handleSelectPlan}
          isLoading={isLoading}
        />
      </div>

      {/* Payment Method */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>
            Manage your payment information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-muted">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline">Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>
            Download past invoices and receipts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {mockInvoices.map((invoice) => {
              const statusConfig = STATUS_CONFIG[invoice.status];
              return (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(invoice.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {invoice.amount.toLocaleString(CURRENCY.locale)} {CURRENCY.symbol}
                    </span>
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
