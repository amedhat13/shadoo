import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/admin/common/StatCard';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { Users, ClipboardList, UserCheck, MapPin, DollarSign, TrendingUp, Eye, Clock } from 'lucide-react';

interface OverviewTabProps {
  data: {
    overview: {
      totalClients: number;
      totalMissions: number;
      totalAgents: number;
      totalBranches: number;
      totalVisits: number;
      activeMissions: number;
      completedVisits: number;
      pendingVisits: number;
      totalRevenue: number;
      totalBudgetAllocated: number;
      totalBudgetUsed: number;
      activeAgents: number;
      pendingAgents: number;
    };
    missionStatusDist: { name: string; value: number; color: string }[];
    visitStatusDist: { name: string; value: number; color: string }[];
    visitTrends: { month: string; total: number; approved: number; rejected: number; submitted: number }[];
    revenueTrends: { month: string; topups: number; spend: number }[];
    subscriptionDist: { name: string; value: number; color: string }[];
  };
}

export function OverviewTab({ data }: OverviewTabProps) {
  const { overview, missionStatusDist, visitStatusDist, visitTrends, revenueTrends, subscriptionDist } = data;

  const completionRate = overview.totalVisits > 0
    ? Math.round((overview.completedVisits / overview.totalVisits) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Clients" value={overview.totalClients} icon={Users} href="/admin/clients" />
        <StatCard title="Total Missions" value={overview.totalMissions} icon={ClipboardList} description={`${overview.activeMissions} active`} href="/admin/missions" />
        <StatCard title="Active Agents" value={overview.activeAgents} icon={UserCheck} description={`${overview.pendingAgents} pending approval`} href="/admin/agents" />
        <StatCard title="Total Branches" value={overview.totalBranches} icon={MapPin} href="/admin/branches" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Visits" value={overview.totalVisits} icon={Eye} description={`${completionRate}% approved`} href="/admin/visits" />
        <StatCard title="Pending Reviews" value={overview.pendingVisits} icon={Clock} variant="warning" href="/admin/visits" />
        <StatCard title="Total Revenue" value={`${overview.totalRevenue.toLocaleString()} EGP`} icon={DollarSign} variant="success" />
        <StatCard title="Budget Utilization" value={overview.totalBudgetAllocated > 0 ? `${Math.round((overview.totalBudgetUsed / overview.totalBudgetAllocated) * 100)}%` : '0%'} icon={TrendingUp} description={`${overview.totalBudgetUsed.toLocaleString()} / ${overview.totalBudgetAllocated.toLocaleString()} EGP`} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Visit Trends</CardTitle>
            <CardDescription>Monthly visit volume and outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            {visitTrends.length > 0 ? (
              <ChartContainer config={{ approved: { label: 'Approved', color: '#22C55E' }, rejected: { label: 'Rejected', color: '#EF4444' }, submitted: { label: 'Submitted', color: '#F97316' } }} className="h-[280px] w-full">
                <AreaChart data={visitTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="approved" stackId="1" stroke="#22C55E" fill="#22C55E" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="submitted" stackId="1" stroke="#F97316" fill="#F97316" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="rejected" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">No visit data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Revenue Trends</CardTitle>
            <CardDescription>Monthly top-ups and mission spending</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueTrends.length > 0 ? (
              <ChartContainer config={{ topups: { label: 'Top-ups', color: '#22C55E' }, spend: { label: 'Spend', color: '#F97316' } }} className="h-[280px] w-full">
                <BarChart data={revenueTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="topups" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spend" fill="#F97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">No transaction data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 - Pie Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Mission Status</CardTitle>
          </CardHeader>
          <CardContent>
            {missionStatusDist.length > 0 ? (
              <ChartContainer config={{}} className="h-[220px] w-full">
                <PieChart>
                  <Pie data={missionStatusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {missionStatusDist.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground">No missions yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Visit Status</CardTitle>
          </CardHeader>
          <CardContent>
            {visitStatusDist.length > 0 ? (
              <ChartContainer config={{}} className="h-[220px] w-full">
                <PieChart>
                  <Pie data={visitStatusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {visitStatusDist.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground">No visits yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptionDist.length > 0 ? (
              <ChartContainer config={{}} className="h-[220px] w-full">
                <PieChart>
                  <Pie data={subscriptionDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {subscriptionDist.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground">No subscriptions yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
