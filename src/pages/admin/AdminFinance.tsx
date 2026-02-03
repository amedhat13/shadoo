import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { StatCard } from '@/components/admin/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Wallet, CreditCard, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';

const mockTransactions = [
  { id: '1', type: 'topup', client: 'Cairo Electronics Co.', amount: 5000, method: 'Card', date: '2 hours ago', status: 'completed' },
  { id: '2', type: 'subscription', client: 'Pharma Plus Egypt', amount: 2499, method: 'Card', date: '5 hours ago', status: 'completed' },
  { id: '3', type: 'topup', client: 'Tech Solutions MENA', amount: 10000, method: 'Bank Transfer', date: '1 day ago', status: 'completed' },
  { id: '4', type: 'refund', client: 'Fresh Foods Market', amount: -1500, method: 'Card', date: '2 days ago', status: 'completed' },
  { id: '5', type: 'payout', client: 'Mohamed Ali (Agent)', amount: -2500, method: 'Bank Transfer', date: '3 days ago', status: 'completed' },
];

export default function AdminFinancePage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Financial Management"
          description="Revenue tracking, transactions, and financial reports."
          actions={
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          }
        />

        {/* Revenue Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard 
            title="Total Revenue (MTD)" 
            value="298,500 EGP" 
            icon={DollarSign}
            variant="success"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard 
            title="Subscription Revenue" 
            value="215,000 EGP" 
            icon={CreditCard}
            description="132 active subscribers"
          />
          <StatCard 
            title="Wallet Topups" 
            value="125,000 EGP" 
            icon={Wallet}
            description="This month"
          />
          <StatCard 
            title="Agent Payouts" 
            value="85,000 EGP" 
            icon={TrendingUp}
            description="This month"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="topups">Wallet Topups</TabsTrigger>
            <TabsTrigger value="payouts">Agent Payouts</TabsTrigger>
            <TabsTrigger value="refunds">Refunds</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Client/Agent</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tx.amount > 0 ? (
                              <ArrowUpRight className="h-4 w-4 text-success" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-destructive" />
                            )}
                            <Badge variant="outline" className="capitalize">{tx.type}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{tx.client}</TableCell>
                        <TableCell className="text-muted-foreground">{tx.method}</TableCell>
                        <TableCell className={`text-right font-bold ${tx.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} EGP
                        </TableCell>
                        <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-success text-success-foreground">
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Subscription payments will be shown here.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topups">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Wallet topup transactions will be shown here.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Agent payout history will be shown here.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="refunds">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Refund transactions will be shown here.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
