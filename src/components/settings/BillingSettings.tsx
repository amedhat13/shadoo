import { CreditCard, Receipt, Download, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSubscription } from '@/hooks/useSubscription';
import { SalesCallDialog } from './SalesCallDialog';
import { CURRENCY } from '@/lib/constants';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

export function BillingSettings() {
  const { plans, currentPlanId, currentPlan, isLoading } = useSubscription();
  const { t } = useTranslation('settings');
  const { t: tc } = useTranslation('common');
  const { isRTL } = useLanguage();
  const currencyLabel = tc('currency_code');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-EG' : 'en-EG', {
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
                  <div className="text-sm text-muted-foreground">{t('billing.current_plan')}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{currentPlan.name}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="cursor-help">{t('billing.visits_per_month', { count: currentPlan.visits_per_month })}</Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('billing.visits_tooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <div className={isRTL ? "text-start" : "text-end"}>
                <div className="text-2xl font-black">
                  {currentPlan.price.toLocaleString(isRTL ? 'ar-EG' : CURRENCY.locale)} {currencyLabel}
                </div>
                <div className="text-sm text-muted-foreground">{t('billing.per_month')}</div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              {t('billing.auto_renews', { defaultValue: 'Auto-renews on' })} March 1, 2024
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change Plan / Request Sales Call */}
      <SalesCallDialog />

      {/* Payment Method */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t('billing.payment_method_title')}
          </CardTitle>
          <CardDescription>{t('billing.payment_method_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-muted">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">{t('billing.expires', { date: '12/25' })}</p>
              </div>
            </div>
            <Button variant="outline">{t('billing.update')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {t('billing.billing_history_title')}
          </CardTitle>
          <CardDescription>{t('billing.billing_history_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {mockInvoices.map((invoice) => {
              const statusKey = invoice.status;
              return (
                <div key={invoice.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(invoice.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {invoice.amount.toLocaleString(isRTL ? 'ar-EG' : CURRENCY.locale)} {currencyLabel}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant={statusKey === 'paid' ? 'default' : statusKey === 'pending' ? 'secondary' : 'destructive'}
                          className="cursor-help"
                        >
                          {t(`billing.statuses.${statusKey}`)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t(`billing.statuses.${statusKey}_description`)}</p>
                      </TooltipContent>
                    </Tooltip>
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