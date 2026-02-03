import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { StatCard } from '@/components/admin/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Wallet, Clock, CheckCircle, XCircle, Banknote } from 'lucide-react';

const mockPayouts = [
  { id: '1', agent: 'Mohamed Ali', method: 'Bank Transfer', amount: 2500, status: 'pending', requested: '2 hours ago' },
  { id: '2', agent: 'Fatma Ibrahim', method: 'Mobile Wallet', amount: 1800, status: 'pending', requested: '5 hours ago' },
  { id: '3', agent: 'Ahmed Hassan', method: 'Bank Transfer', amount: 3200, status: 'pending', requested: '1 day ago' },
  { id: '4', agent: 'Sara Mahmoud', method: 'Mobile Wallet', amount: 950, status: 'completed', requested: '3 days ago' },
  { id: '5', agent: 'Omar Khaled', method: 'Bank Transfer', amount: 4100, status: 'rejected', requested: '1 week ago' },
];

export default function AdminPayoutsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Payout Management"
          description="Process and manage agent payout requests."
          badge={
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              15 Pending
            </Badge>
          }
          actions={
            <Button className="gap-2">
              <Banknote className="h-4 w-4" />
              Bulk Process
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Pending Payouts" value="15" variant="warning" icon={Clock} description="12,500 EGP total" />
          <StatCard title="This Month" value="85,000 EGP" icon={Wallet} />
          <StatCard title="Completed" value="342" variant="success" icon={CheckCircle} />
          <StatCard title="Rejected" value="8" variant="destructive" icon={XCircle} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending (15)
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Pending Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPayouts.filter(p => p.status === 'pending').map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium">{payout.agent}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{payout.method}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold">{payout.amount.toLocaleString()} EGP</TableCell>
                        <TableCell className="text-muted-foreground">{payout.requested}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="text-destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Completed payouts history will be shown here.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Rejected payouts list will be shown here.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
