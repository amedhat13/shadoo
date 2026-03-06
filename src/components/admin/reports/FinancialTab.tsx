import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatCard } from '@/components/admin/common/StatCard';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp, Wallet, CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FinancialTabProps {
  data: {
    revenueTrends: { month: string; topups: number; spend: number }[];
    overview: {
      totalRevenue: number;
      totalBudgetAllocated: number;
      totalBudgetUsed: number;
    };
    clientAnalytics: {
      id: string;
      name: string;
      budgetAllocated: number;
      budgetUsed: number;
      walletBalance: number;
    }[];
  };
}

export function FinancialTab({ data }: FinancialTabProps) {
  const { t } = useTranslation('admin');
  const { t: tCommon } = useTranslation('common');
  const { isRTL } = useLanguage();
  const currencyCode = tCommon('currency_code');
  const fmt = (n: number) => n.toLocaleString(isRTL ? 'ar-EG' : 'en');

  // Fetch payout data
  const { data: payoutData } = useQuery({
    queryKey: ['admin-payout-summary'],
    queryFn: async () => {
      const { data: payouts } = await supabase.from('agent_payouts').select('amount, status, method, requested_at');
      const all = payouts || [];
      const totalPending = all.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);
      const totalProcessed = all.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0);
      
      // Monthly payouts
      const monthlyPayouts: Record<string, { month: string; bank: number; wallet: number }> = {};
      all.filter(p => p.status === 'completed').forEach(p => {
        const d = new Date(p.requested_at || '');
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (!monthlyPayouts[key]) monthlyPayouts[key] = { month: label, bank: 0, wallet: 0 };
        if (p.method === 'bank_transfer') monthlyPayouts[key].bank += Number(p.amount);
        else monthlyPayouts[key].wallet += Number(p.amount);
      });
      const payoutTrends = Object.entries(monthlyPayouts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, d]) => d);
      
      return { totalPending, totalProcessed, payoutTrends };
    },
  });

  const { overview, revenueTrends, clientAnalytics } = data;
  const budgetRemaining = overview.totalBudgetAllocated - overview.totalBudgetUsed;
  
  const clientBudgetData = clientAnalytics
    .filter(c => c.budgetAllocated > 0)
    .sort((a, b) => b.budgetAllocated - a.budgetAllocated)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('reports.financial.total_revenue')} value={`${fmt(overview.totalRevenue)} ${currencyCode}`} icon={DollarSign} variant="success" />
        <StatCard title={t('reports.financial.total_payouts')} value={`${fmt(payoutData?.totalProcessed || 0)} ${currencyCode}`} icon={Wallet} />
        <StatCard title={t('reports.financial.pending_payouts')} value={`${fmt(payoutData?.totalPending || 0)} ${currencyCode}`} icon={CreditCard} variant="warning" />
        <StatCard title={t('reports.financial.budget_remaining')} value={`${fmt(budgetRemaining)} ${currencyCode}`} icon={TrendingUp} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="text-start">
            <CardTitle className="text-base font-bold uppercase">{t('reports.financial.revenue_breakdown')}</CardTitle>
            <CardDescription>{t('reports.financial.revenue_breakdown_desc')}</CardDescription>
          </CardHeader>
          <CardContent dir="ltr">
            {revenueTrends.length > 0 ? (
              <ChartContainer config={{
                topups: { label: t('reports.overview.chart_topups'), color: '#22C55E' },
                spend: { label: t('reports.overview.chart_spend'), color: '#F97316' },
              }} className="h-[280px] w-full">
                <AreaChart data={revenueTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="topups" stackId="1" stroke="#22C55E" fill="#22C55E" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="spend" stackId="1" stroke="#F97316" fill="#F97316" fillOpacity={0.4} />
                </AreaChart>
              </ChartContainer>
            ) : <div className="h-[280px] flex items-center justify-center text-muted-foreground">{t('reports.overview.no_transaction_data')}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-start">
            <CardTitle className="text-base font-bold uppercase">{t('reports.financial.payout_summary')}</CardTitle>
            <CardDescription>{t('reports.financial.payout_summary_desc')}</CardDescription>
          </CardHeader>
          <CardContent dir="ltr">
            {(payoutData?.payoutTrends?.length || 0) > 0 ? (
              <ChartContainer config={{
                bank: { label: t('reports.financial.bank_transfer'), color: '#0EA5E9' },
                wallet: { label: t('reports.financial.mobile_wallet'), color: '#A855F7' },
              }} className="h-[280px] w-full">
                <BarChart data={payoutData?.payoutTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="bank" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="wallet" fill="#A855F7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : <div className="h-[280px] flex items-center justify-center text-muted-foreground">{t('reports.financial.no_payout_data')}</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="text-start">
          <CardTitle className="text-base font-bold uppercase">{t('reports.financial.client_budget_health')}</CardTitle>
          <CardDescription>{t('reports.financial.client_budget_health_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{t('reports.col_client')}</TableHead>
                  <TableHead className="text-end">{t('reports.financial.allocated')}</TableHead>
                  <TableHead className="text-end">{t('reports.financial.used')}</TableHead>
                  <TableHead className="text-end">{t('reports.financial.remaining')}</TableHead>
                  <TableHead className="text-end">{t('reports.financial.wallet_balance')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientBudgetData.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t('reports.no_client_data')}</TableCell></TableRow>
                ) : clientBudgetData.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-start">{c.name}</TableCell>
                    <TableCell className="text-end">{fmt(c.budgetAllocated)} {currencyCode}</TableCell>
                    <TableCell className="text-end">{fmt(c.budgetUsed)} {currencyCode}</TableCell>
                    <TableCell className="text-end">{fmt(c.budgetAllocated - c.budgetUsed)} {currencyCode}</TableCell>
                    <TableCell className="text-end">{fmt(c.walletBalance)} {currencyCode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
