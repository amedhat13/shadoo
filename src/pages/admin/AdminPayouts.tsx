import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { StatCard } from '@/components/admin/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Wallet, Clock, CheckCircle, XCircle, Banknote, Loader2, Zap } from 'lucide-react';
import { useAdminPayouts, usePayoutStats, useProcessPayout, useBulkProcessPayouts } from '@/hooks/useAdminPayouts';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';

export default function AdminPayoutsPage() {
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState('pending');
  const [selected, setSelected] = useState<string[]>([]);

  const { data: stats, isLoading: statsLoading } = usePayoutStats();
  const { data: payouts, isLoading } = useAdminPayouts(activeTab);
  const processPayout = useProcessPayout();
  const bulkProcess = useBulkProcessPayouts();

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkApprove = () => {
    if (selected.length === 0) return;
    bulkProcess.mutate(selected, { onSuccess: () => setSelected([]) });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title={t('payouts.title', { defaultValue: 'Payout Management' })}
          description={t('payouts.description', { defaultValue: 'Process and manage agent payout requests.' })}
          badge={
            stats?.totalPending ? (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                {stats.totalPending} Pending
              </Badge>
            ) : null
          }
          actions={
            selected.length > 0 ? (
              <Button className="gap-2" onClick={handleBulkApprove} disabled={bulkProcess.isPending}>
                {bulkProcess.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
                Approve {selected.length} Payouts
              </Button>
            ) : null
          }
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Pending Payouts" value={statsLoading ? '...' : String(stats?.totalPending || 0)} variant="warning" icon={Clock} description={`${(stats?.pendingAmount || 0).toLocaleString()} EGP`} />
          <StatCard title="Completed" value={statsLoading ? '...' : String(stats?.totalCompleted || 0)} variant="success" icon={CheckCircle} description={`${(stats?.completedAmount || 0).toLocaleString()} EGP`} />
          <StatCard title="Rejected" value={statsLoading ? '...' : String(stats?.totalRejected || 0)} variant="destructive" icon={XCircle} />
          <StatCard title="Total" value={statsLoading ? '...' : String(stats?.total || 0)} icon={Wallet} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelected([]); }} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2"><Clock className="h-4 w-4" />Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold uppercase">{activeTab} Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingState message="Loading payouts..." />
              ) : !payouts?.length ? (
                <EmptyState icon={<Wallet className="h-7 w-7 text-muted-foreground" />} title="No payouts" description="No payouts in this category." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {activeTab === 'pending' && <TableHead className="w-10"><Checkbox checked={selected.length === payouts.length} onCheckedChange={(c) => setSelected(c ? payouts.map(p => p.id) : [])} /></TableHead>}
                      <TableHead>Agent</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Requested</TableHead>
                      {activeTab === 'pending' && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        {activeTab === 'pending' && (
                          <TableCell><Checkbox checked={selected.includes(payout.id)} onCheckedChange={() => toggleSelect(payout.id)} /></TableCell>
                        )}
                        <TableCell className="font-medium">{(payout.agent as any)?.full_name || 'Unknown'}</TableCell>
                        <TableCell><Badge variant="outline">{payout.method}</Badge></TableCell>
                        <TableCell>{payout.duration_minutes ? `${payout.duration_minutes} min` : '—'}</TableCell>
                        <TableCell>{payout.tier_code || '—'}</TableCell>
                        <TableCell className="text-right font-bold">{Number(payout.amount).toLocaleString()} EGP</TableCell>
                        <TableCell>
                          {payout.auto_generated ? (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1">
                              <Zap className="h-3 w-3" />Auto
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Manual</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{payout.requested_at ? new Date(payout.requested_at).toLocaleDateString() : '—'}</TableCell>
                        {activeTab === 'pending' && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="text-destructive"
                                onClick={() => processPayout.mutate({ payoutId: payout.id, action: 'rejected' })}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" className="gap-1"
                                onClick={() => processPayout.mutate({ payoutId: payout.id, action: 'completed' })}>
                                <CheckCircle className="h-4 w-4" />Approve
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
