import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ClientAnalyticsTabProps {
  data: {
    id: string;
    name: string;
    missions: number;
    activeMissions: number;
    branches: number;
    totalVisits: number;
    completedVisits: number;
    pendingVisits: number;
    budgetAllocated: number;
    budgetUsed: number;
    walletBalance: number;
  }[];
}

export function ClientAnalyticsTab({ data }: ClientAnalyticsTabProps) {
  const topClients = data.slice(0, 10);
  const chartData = topClients.slice(0, 8).map(c => ({
    name: c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name,
    missions: c.missions,
    visits: c.totalVisits,
    approved: c.completedVisits,
  }));

  return (
    <div className="space-y-6">
      {/* Top Clients Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold uppercase">Top Clients by Activity</CardTitle>
          <CardDescription>Missions, visits, and approvals by client</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={{
              missions: { label: 'Missions', color: '#F97316' },
              visits: { label: 'Total Visits', color: '#0EA5E9' },
              approved: { label: 'Approved', color: '#22C55E' },
            }} className="h-[300px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} angle={-20} textAnchor="end" height={50} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="missions" fill="#F97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="visits" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No client data yet</div>
          )}
        </CardContent>
      </Card>

      {/* Client Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold uppercase">Client Breakdown</CardTitle>
          <CardDescription>Detailed metrics per client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-center">Missions</TableHead>
                  <TableHead className="text-center">Branches</TableHead>
                  <TableHead className="text-center">Visits</TableHead>
                  <TableHead className="text-center">Approved</TableHead>
                  <TableHead className="text-center">Pending</TableHead>
                  <TableHead className="text-end">Budget Used</TableHead>
                  <TableHead className="text-end">Wallet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No clients found</TableCell>
                  </TableRow>
                ) : topClients.map(client => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{client.missions}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{client.branches}</TableCell>
                    <TableCell className="text-center">{client.totalVisits}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default" className="bg-green-500/10 text-green-700 border-green-500/20">{client.completedVisits}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {client.pendingVisits > 0 ? (
                        <Badge variant="default" className="bg-orange-500/10 text-orange-700 border-orange-500/20">{client.pendingVisits}</Badge>
                      ) : '0'}
                    </TableCell>
                    <TableCell className="text-end">{client.budgetUsed.toLocaleString()} / {client.budgetAllocated.toLocaleString()}</TableCell>
                    <TableCell className="text-end">{client.walletBalance.toLocaleString()} EGP</TableCell>
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
