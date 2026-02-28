import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Star } from 'lucide-react';

interface AgentPerformanceTabProps {
  agents: {
    id: string;
    name: string;
    tier: string;
    status: string;
    completedVisits: number;
    totalEarnings: number;
    rating: number;
    totalVisits: number;
    approvedVisits: number;
    rejectedVisits: number;
    completionRate: number;
  }[];
  tierDist: { name: string; value: number; color: string }[];
  statusDist: { name: string; value: number; color: string }[];
}

const tierColors: Record<string, string> = {
  A: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  B: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
  C: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-700 border-green-500/20',
  pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  suspended: 'bg-red-500/10 text-red-700 border-red-500/20',
};

export function AgentPerformanceTab({ agents, tierDist, statusDist }: AgentPerformanceTabProps) {
  const topAgents = agents.filter(a => a.status === 'active').slice(0, 10);
  const chartData = topAgents.slice(0, 8).map(a => ({
    name: a.name.length > 12 ? a.name.slice(0, 12) + '…' : a.name,
    approved: a.approvedVisits,
    rejected: a.rejectedVisits,
    rating: a.rating,
  }));

  return (
    <div className="space-y-6">
      {/* Distribution Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Agent Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {tierDist.length > 0 ? (
              <ChartContainer config={{}} className="h-[220px] w-full">
                <PieChart>
                  <Pie data={tierDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {tierDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground">No agents yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Agent Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusDist.length > 0 ? (
              <ChartContainer config={{}} className="h-[220px] w-full">
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground">No agents yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Agents Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold uppercase">Top Agent Performance</CardTitle>
          <CardDescription>Approved vs rejected visits for top active agents</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={{
              approved: { label: 'Approved', color: '#22C55E' },
              rejected: { label: 'Rejected', color: '#EF4444' },
            }} className="h-[300px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={11} angle={-20} textAnchor="end" height={50} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="approved" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No active agents yet</div>
          )}
        </CardContent>
      </Card>

      {/* Agent Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold uppercase">Agent Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-center">Tier</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Visits</TableHead>
                  <TableHead className="text-center">Completion</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead className="text-end">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No agents found</TableCell>
                  </TableRow>
                ) : agents.slice(0, 15).map(agent => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={tierColors[agent.tier] || ''}>{agent.tier}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={statusColors[agent.status] || ''}>{agent.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{agent.approvedVisits} / {agent.totalVisits}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-2">
                        <Progress value={agent.completionRate} className="h-2 w-16" />
                        <span className="text-xs">{agent.completionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {agent.rating > 0 ? (
                        <span className="flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {agent.rating.toFixed(1)}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-end">{agent.totalEarnings.toLocaleString()} EGP</TableCell>
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
