import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/admin/common/StatCard';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { ClipboardList, CheckCircle, DollarSign, Target } from 'lucide-react';

interface MissionAnalyticsTabProps {
  data: {
    overview: {
      totalMissions: number;
      activeMissions: number;
      completedVisits: number;
      totalVisits: number;
      totalBudgetAllocated: number;
      totalBudgetUsed: number;
    };
    missionStatusDist: { name: string; value: number; color: string }[];
    visitTrends: { month: string; total: number; approved: number; rejected: number; submitted: number }[];
  };
}

export function MissionAnalyticsTab({ data }: MissionAnalyticsTabProps) {
  const { overview, missionStatusDist, visitTrends } = data;
  const budgetUtil = overview.totalBudgetAllocated > 0
    ? Math.round((overview.totalBudgetUsed / overview.totalBudgetAllocated) * 100) : 0;
  const visitApprovalRate = overview.totalVisits > 0
    ? Math.round((overview.completedVisits / overview.totalVisits) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Missions" value={overview.totalMissions} icon={ClipboardList} />
        <StatCard title="Active Now" value={overview.activeMissions} icon={Target} variant="warning" />
        <StatCard title="Visit Approval Rate" value={`${visitApprovalRate}%`} icon={CheckCircle} variant="success" />
        <StatCard title="Budget Utilization" value={`${budgetUtil}%`} icon={DollarSign} description={`${overview.totalBudgetUsed.toLocaleString()} / ${overview.totalBudgetAllocated.toLocaleString()} EGP`} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Mission Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {missionStatusDist.length > 0 ? (
              <ChartContainer config={{}} className="h-[280px] w-full">
                <PieChart>
                  <Pie data={missionStatusDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {missionStatusDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">No missions yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">Visit Outcomes Over Time</CardTitle>
            <CardDescription>Monthly visit approval and rejection trends</CardDescription>
          </CardHeader>
          <CardContent>
            {visitTrends.length > 0 ? (
              <ChartContainer config={{
                approved: { label: 'Approved', color: '#22C55E' },
                rejected: { label: 'Rejected', color: '#EF4444' },
                submitted: { label: 'Submitted', color: '#F97316' },
              }} className="h-[280px] w-full">
                <AreaChart data={visitTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="approved" stroke="#22C55E" fill="#22C55E" fillOpacity={0.5} />
                  <Area type="monotone" dataKey="submitted" stroke="#F97316" fill="#F97316" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="rejected" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">No visit data yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
