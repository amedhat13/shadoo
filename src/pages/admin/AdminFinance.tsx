import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { StatCard } from '@/components/admin/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Wallet, CreditCard, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const mockTransactions = [
  { id: '1', type: 'topup', client: 'Cairo Electronics Co.', amount: 5000, method: 'Card', date: '2 hours ago', status: 'completed' },
  { id: '2', type: 'subscription', client: 'Pharma Plus Egypt', amount: 2499, method: 'Card', date: '5 hours ago', status: 'completed' },
  { id: '3', type: 'topup', client: 'Tech Solutions MENA', amount: 10000, method: 'Bank Transfer', date: '1 day ago', status: 'completed' },
  { id: '4', type: 'refund', client: 'Fresh Foods Market', amount: -1500, method: 'Card', date: '2 days ago', status: 'completed' },
  { id: '5', type: 'payout', client: 'Mohamed Ali (Agent)', amount: -2500, method: 'Bank Transfer', date: '3 days ago', status: 'completed' },
];

export default function AdminFinancePage() {
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title={t('finance.title')}
          description={t('finance.description')}
          actions={<Button variant="outline" className="gap-2"><Download className="h-4 w-4" />{t('finance.export_report')}</Button>}
        />
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title={t('finance.total_revenue_mtd')} value="298,500 EGP" icon={DollarSign} variant="success" trend={{ value: 12, isPositive: true }} />
          <StatCard title={t('finance.subscription_revenue')} value="215,000 EGP" icon={CreditCard} description={t('finance.active_subscribers', { count: 132 })} />
          <StatCard title={t('finance.wallet_topups')} value="125,000 EGP" icon={Wallet} description={t('finance.this_month')} />
          <StatCard title={t('finance.agent_payouts')} value="85,000 EGP" icon={TrendingUp} description={t('finance.this_month')} />
        </div>
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">{t('finance.all_transactions')}</TabsTrigger>
            <TabsTrigger value="subscriptions">{t('finance.subscriptions')}</TabsTrigger>
            <TabsTrigger value="topups">{t('finance.topups')}</TabsTrigger>
            <TabsTrigger value="payouts">{t('finance.payouts')}</TabsTrigger>
            <TabsTrigger value="refunds">{t('finance.refunds')}</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <Card>
              <CardHeader><CardTitle className="text-base font-bold uppercase">{t('finance.recent_transactions')}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('finance.type')}</TableHead>
                      <TableHead>{t('finance.client_agent')}</TableHead>
                      <TableHead>{t('finance.method')}</TableHead>
                      <TableHead className="text-end">{t('finance.amount')}</TableHead>
                      <TableHead>{t('finance.date')}</TableHead>
                      <TableHead>{t('finance.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tx.amount > 0 ? <ArrowUpRight className="h-4 w-4 text-success" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                            <Badge variant="outline" className="capitalize">{tx.type}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{tx.client}</TableCell>
                        <TableCell className="text-muted-foreground">{tx.method}</TableCell>
                        <TableCell className={`text-end font-bold ${tx.amount > 0 ? 'text-success' : 'text-destructive'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} {tc('currency_code')}</TableCell>
                        <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                        <TableCell><Badge variant="default" className="bg-success text-success-foreground">{tc(`statuses.${tx.status}`)}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="subscriptions"><Card><CardContent className="p-8 text-center text-muted-foreground">{t('finance.placeholder_subscriptions')}</CardContent></Card></TabsContent>
          <TabsContent value="topups"><Card><CardContent className="p-8 text-center text-muted-foreground">{t('finance.placeholder_topups')}</CardContent></Card></TabsContent>
          <TabsContent value="payouts"><Card><CardContent className="p-8 text-center text-muted-foreground">{t('finance.placeholder_payouts')}</CardContent></Card></TabsContent>
          <TabsContent value="refunds"><Card><CardContent className="p-8 text-center text-muted-foreground">{t('finance.placeholder_refunds')}</CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}