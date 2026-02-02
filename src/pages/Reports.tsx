import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMissions } from '@/hooks/useMissions';
import { useWallet } from '@/hooks/useWallet';
import { usePackage } from '@/hooks/usePackage';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';

// Mock data for reports
const visitCompletionData = [
  { month: 'Sep', planned: 45, completed: 42 },
  { month: 'Oct', planned: 52, completed: 48 },
  { month: 'Nov', planned: 60, completed: 55 },
  { month: 'Dec', planned: 48, completed: 45 },
  { month: 'Jan', planned: 53, completed: 37 },
  { month: 'Feb', planned: 65, completed: 25 },
];

const branchPerformanceData = [
  { name: 'Cairo Downtown', rating: 4.5, visits: 45, budget: 4500 },
  { name: 'Alexandria Mall', rating: 4.2, visits: 32, budget: 3200 },
  { name: 'Giza Plaza', rating: 3.8, visits: 28, budget: 2800 },
];

const missionStatusData = [
  { name: 'Completed', value: 8, color: 'hsl(var(--chart-1))' },
  { name: 'Published', value: 5, color: 'hsl(var(--chart-2))' },
  { name: 'Paused', value: 2, color: 'hsl(var(--chart-3))' },
  { name: 'Draft', value: 3, color: 'hsl(var(--chart-4))' },
];

const budgetTrendData = [
  { month: 'Sep', allocated: 12000, used: 10500 },
  { month: 'Oct', allocated: 15000, used: 13200 },
  { month: 'Nov', allocated: 18000, used: 16800 },
  { month: 'Dec', allocated: 14000, used: 12900 },
  { month: 'Jan', allocated: 16000, used: 11800 },
  { month: 'Feb', allocated: 20000, used: 8500 },
];

const questionResponseData = [
  { question: 'Staff Friendly?', yes: 85, no: 15 },
  { question: 'Clean Store?', yes: 78, no: 22 },
  { question: 'Quick Service?', yes: 65, no: 35 },
  { question: 'Good Value?', yes: 72, no: 28 },
];

const chartConfig = {
  planned: { label: 'Planned', color: 'hsl(var(--chart-1))' },
  completed: { label: 'Completed', color: 'hsl(var(--chart-2))' },
  allocated: { label: 'Allocated', color: 'hsl(var(--chart-1))' },
  used: { label: 'Used', color: 'hsl(var(--chart-2))' },
  yes: { label: 'Yes', color: 'hsl(var(--chart-2))' },
  no: { label: 'No', color: 'hsl(var(--chart-4))' },
  rating: { label: 'Rating', color: 'hsl(var(--chart-1))' },
};

export default function ReportsPage() {
  const { missions } = useMissions();
  const { wallet } = useWallet();
  const { subscription } = usePackage();

  // Calculate key metrics
  const totalVisitsPlanned = missions.reduce((sum, m) => sum + m.number_of_visits, 0);
  const totalVisitsCompleted = missions.reduce((sum, m) => sum + m.visits_completed, 0);
  const completionRate = totalVisitsPlanned > 0 ? Math.round((totalVisitsCompleted / totalVisitsPlanned) * 100) : 0;
  
  const totalBudgetAllocated = missions.reduce((sum, m) => sum + m.total_purchase_budget, 0);
  const totalBudgetUsed = missions.reduce((sum, m) => sum + m.budget_used, 0);
  const budgetUtilization = totalBudgetAllocated > 0 ? Math.round((totalBudgetUsed / totalBudgetAllocated) * 100) : 0;

  const activeMissions = missions.filter(m => m.status === 'published').length;
  const completedMissions = missions.filter(m => m.status === 'completed').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Reports & Analytics"
          description="Analyze visit outcomes, mission performance, and budget utilization."
        />

        {/* Key Metrics Row */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Visit Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {totalVisitsCompleted} of {totalVisitsPlanned} visits
              </p>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{budgetUtilization}%</div>
              <p className="text-xs text-muted-foreground">
                {totalBudgetUsed.toLocaleString()} of {totalBudgetAllocated.toLocaleString()} EGP
              </p>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                On track
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMissions}</div>
              <p className="text-xs text-muted-foreground">
                {completedMissions} completed total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Package Usage</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription.visits_used_this_month}/{subscription.package.visits_per_month}
              </div>
              <p className="text-xs text-muted-foreground">
                Visits used this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="visits" className="space-y-4">
          <TabsList>
            <TabsTrigger value="visits" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visits
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="responses" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Responses
            </TabsTrigger>
          </TabsList>

          {/* Visits Tab */}
          <TabsContent value="visits" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Visit Completion Over Time</CardTitle>
                  <CardDescription>Planned vs completed visits by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart data={visitCompletionData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="planned" fill="var(--color-planned)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mission Status Distribution</CardTitle>
                  <CardDescription>Current status of all missions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <PieChart>
                      <Pie
                        data={missionStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {missionStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget Allocation vs Usage</CardTitle>
                <CardDescription>Track how your purchase budget is being utilized over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px]">
                  <AreaChart data={budgetTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `${value/1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="allocated"
                      stackId="1"
                      stroke="var(--color-allocated)"
                      fill="var(--color-allocated)"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="used"
                      stackId="2"
                      stroke="var(--color-used)"
                      fill="var(--color-used)"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Allocated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBudgetAllocated.toLocaleString()} EGP</div>
                  <p className="text-xs text-muted-foreground">Across all missions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBudgetUsed.toLocaleString()} EGP</div>
                  <p className="text-xs text-muted-foreground">Spent on visits</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Available Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{wallet.available_balance.toLocaleString()} EGP</div>
                  <p className="text-xs text-muted-foreground">In wallet</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Branch Performance Comparison</CardTitle>
                <CardDescription>Average ratings and visit counts by branch</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px]">
                  <BarChart data={branchPerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 5]} className="text-xs" />
                    <YAxis dataKey="name" type="category" width={120} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="rating" fill="var(--color-rating)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              {branchPerformanceData.map((branch) => (
                <Card key={branch.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{branch.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rating</span>
                      <span className="font-medium">{branch.rating}/5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Visits</span>
                      <span className="font-medium">{branch.visits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Budget Spent</span>
                      <span className="font-medium">{branch.budget.toLocaleString()} EGP</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Responses Tab */}
          <TabsContent value="responses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Question Response Summary</CardTitle>
                <CardDescription>Yes/No question responses across all visits</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px]">
                  <BarChart data={questionResponseData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} className="text-xs" tickFormatter={(v) => `${v}%`} />
                    <YAxis dataKey="question" type="category" width={120} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="yes" stackId="a" fill="var(--color-yes)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="no" stackId="a" fill="var(--color-no)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>AI-generated observations from your data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">High Customer Satisfaction</p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        85% of visits report friendly staff - above industry average of 75%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">Service Speed Opportunity</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        35% of visits report slow service - consider staffing adjustments during peak hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Cairo Downtown Leading</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your Cairo Downtown branch has the highest rating (4.5) and most visits (45)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
