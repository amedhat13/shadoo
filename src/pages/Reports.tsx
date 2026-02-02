import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Target,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Filter,
  Calendar,
  MapPin,
  ClipboardList,
  Star,
  MessageSquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Vibrant color palette for charts
const CHART_COLORS = {
  orange: '#F97316',
  orangeLight: '#FB923C',
  green: '#22C55E',
  greenLight: '#4ADE80',
  amber: '#F59E0B',
  amberLight: '#FBBF24',
  emerald: '#10B981',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  sky: '#0EA5E9',
  red: '#EF4444',
  rose: '#F43F5E',
  purple: '#A855F7',
  indigo: '#6366F1',
};

// Mock data for reports - organized by month and branch
const allVisitData = [
  { month: 'Sep', branch: 'Cairo Downtown', planned: 18, completed: 17, rating: 4.6 },
  { month: 'Sep', branch: 'Alexandria Mall', planned: 15, completed: 14, rating: 4.2 },
  { month: 'Sep', branch: 'Giza Plaza', planned: 12, completed: 11, rating: 3.9 },
  { month: 'Oct', branch: 'Cairo Downtown', planned: 20, completed: 19, rating: 4.5 },
  { month: 'Oct', branch: 'Alexandria Mall', planned: 17, completed: 15, rating: 4.3 },
  { month: 'Oct', branch: 'Giza Plaza', planned: 15, completed: 14, rating: 4.0 },
  { month: 'Nov', branch: 'Cairo Downtown', planned: 22, completed: 20, rating: 4.7 },
  { month: 'Nov', branch: 'Alexandria Mall', planned: 20, completed: 18, rating: 4.1 },
  { month: 'Nov', branch: 'Giza Plaza', planned: 18, completed: 17, rating: 4.2 },
  { month: 'Dec', branch: 'Cairo Downtown', planned: 18, completed: 17, rating: 4.4 },
  { month: 'Dec', branch: 'Alexandria Mall', planned: 16, completed: 15, rating: 4.0 },
  { month: 'Dec', branch: 'Giza Plaza', planned: 14, completed: 13, rating: 3.8 },
  { month: 'Jan', branch: 'Cairo Downtown', planned: 20, completed: 15, rating: 4.5 },
  { month: 'Jan', branch: 'Alexandria Mall', planned: 18, completed: 12, rating: 4.2 },
  { month: 'Jan', branch: 'Giza Plaza', planned: 15, completed: 10, rating: 4.1 },
  { month: 'Feb', branch: 'Cairo Downtown', planned: 25, completed: 12, rating: 4.6 },
  { month: 'Feb', branch: 'Alexandria Mall', planned: 22, completed: 8, rating: 4.3 },
  { month: 'Feb', branch: 'Giza Plaza', planned: 18, completed: 5, rating: 4.0 },
];

const allBudgetData = [
  { month: 'Sep', branch: 'Cairo Downtown', allocated: 5000, used: 4500 },
  { month: 'Sep', branch: 'Alexandria Mall', allocated: 4000, used: 3500 },
  { month: 'Sep', branch: 'Giza Plaza', allocated: 3000, used: 2500 },
  { month: 'Oct', branch: 'Cairo Downtown', allocated: 6000, used: 5500 },
  { month: 'Oct', branch: 'Alexandria Mall', allocated: 5000, used: 4200 },
  { month: 'Oct', branch: 'Giza Plaza', allocated: 4000, used: 3500 },
  { month: 'Nov', branch: 'Cairo Downtown', allocated: 7000, used: 6500 },
  { month: 'Nov', branch: 'Alexandria Mall', allocated: 6000, used: 5500 },
  { month: 'Nov', branch: 'Giza Plaza', allocated: 5000, used: 4800 },
  { month: 'Dec', branch: 'Cairo Downtown', allocated: 5500, used: 5000 },
  { month: 'Dec', branch: 'Alexandria Mall', allocated: 4500, used: 4200 },
  { month: 'Dec', branch: 'Giza Plaza', allocated: 4000, used: 3700 },
  { month: 'Jan', branch: 'Cairo Downtown', allocated: 6000, used: 4500 },
  { month: 'Jan', branch: 'Alexandria Mall', allocated: 5500, used: 4000 },
  { month: 'Jan', branch: 'Giza Plaza', allocated: 4500, used: 3300 },
  { month: 'Feb', branch: 'Cairo Downtown', allocated: 8000, used: 4000 },
  { month: 'Feb', branch: 'Alexandria Mall', allocated: 7000, used: 2800 },
  { month: 'Feb', branch: 'Giza Plaza', allocated: 5000, used: 1700 },
];

// Generate mock response data per mission based on their actual questions
const generateMockResponses = (missionId: string, questions: any[]) => {
  // Seed random based on mission ID for consistent mock data
  const seed = missionId.charCodeAt(missionId.length - 1);
  
  return questions.map((q, index) => {
    const baseValue = 60 + ((seed + index) % 30);
    
    if (q.type === 'yes_no') {
      return {
        questionId: q.id,
        question: q.text,
        type: 'yes_no',
        yes: baseValue,
        no: 100 - baseValue,
      };
    } else if (q.type === 'rating') {
      const avgRating = 3.5 + ((seed + index) % 15) / 10;
      return {
        questionId: q.id,
        question: q.text,
        type: 'rating',
        avgRating: avgRating.toFixed(1),
        maxRating: q.max_rating || 5,
        distribution: [
          { rating: 1, count: 5 + (index % 3) },
          { rating: 2, count: 8 + (index % 5) },
          { rating: 3, count: 15 + (index % 7) },
          { rating: 4, count: 25 + (index % 10) },
          { rating: 5, count: 20 + (index % 8) },
        ],
      };
    } else if (q.type === 'multiple_choice' && q.options) {
      const total = 100;
      let remaining = total;
      const optionResults = q.options.map((opt: any, optIndex: number) => {
        const isLast = optIndex === q.options.length - 1;
        const value = isLast ? remaining : Math.floor(remaining * (0.2 + ((seed + optIndex) % 40) / 100));
        remaining -= value;
        return {
          option: opt.text,
          count: value,
          color: [CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.sky][optIndex % 4],
        };
      });
      return {
        questionId: q.id,
        question: q.text,
        type: 'multiple_choice',
        options: optionResults,
      };
    } else {
      // short_text - show sample responses
      return {
        questionId: q.id,
        question: q.text,
        type: 'short_text',
        totalResponses: 25 + (seed % 20),
        samples: [
          'Great service overall!',
          'Staff was helpful but slow',
          'Clean and well organized',
          'Could improve checkout speed',
        ],
      };
    }
  });
};

const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
const BRANCHES = ['Cairo Downtown', 'Alexandria Mall', 'Giza Plaza'];

const chartConfig = {
  planned: { label: 'Planned', color: CHART_COLORS.orange },
  completed: { label: 'Completed', color: CHART_COLORS.green },
  allocated: { label: 'Allocated', color: CHART_COLORS.amber },
  used: { label: 'Used', color: CHART_COLORS.emerald },
  yes: { label: 'Yes', color: CHART_COLORS.green },
  no: { label: 'No', color: CHART_COLORS.red },
  rating: { label: 'Rating', color: CHART_COLORS.orange },
  'Cairo Downtown': { label: 'Cairo Downtown', color: CHART_COLORS.orange },
  'Alexandria Mall': { label: 'Alexandria Mall', color: CHART_COLORS.green },
  'Giza Plaza': { label: 'Giza Plaza', color: CHART_COLORS.amber },
};

export default function ReportsPage() {
  const { missions } = useMissions();
  const { wallet } = useWallet();
  const { subscription } = usePackage();
  
  // Filters
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedMissionId, setSelectedMissionId] = useState<string>('all');

  // Get selected mission and its responses
  const selectedMission = useMemo(() => {
    if (selectedMissionId === 'all') return null;
    return missions.find(m => m.id === selectedMissionId);
  }, [selectedMissionId, missions]);

  const missionResponses = useMemo(() => {
    if (!selectedMission) return null;
    return generateMockResponses(selectedMission.id, selectedMission.questions);
  }, [selectedMission]);

  // Filter data based on selections
  const filteredVisitData = useMemo(() => {
    let data = allVisitData;
    if (selectedMonth !== 'all') {
      data = data.filter(d => d.month === selectedMonth);
    }
    if (selectedBranch !== 'all') {
      data = data.filter(d => d.branch === selectedBranch);
    }
    return data;
  }, [selectedMonth, selectedBranch]);

  const filteredBudgetData = useMemo(() => {
    let data = allBudgetData;
    if (selectedMonth !== 'all') {
      data = data.filter(d => d.month === selectedMonth);
    }
    if (selectedBranch !== 'all') {
      data = data.filter(d => d.branch === selectedBranch);
    }
    return data;
  }, [selectedMonth, selectedBranch]);

  // Aggregate data for charts
  const visitsByMonth = useMemo(() => {
    const months = selectedMonth === 'all' ? MONTHS : [selectedMonth];
    return months.map(month => {
      const monthData = filteredVisitData.filter(d => d.month === month);
      return {
        month,
        planned: monthData.reduce((sum, d) => sum + d.planned, 0),
        completed: monthData.reduce((sum, d) => sum + d.completed, 0),
      };
    });
  }, [filteredVisitData, selectedMonth]);

  const visitsByBranch = useMemo(() => {
    const branches = selectedBranch === 'all' ? BRANCHES : [selectedBranch];
    return branches.map(branch => {
      const branchData = filteredVisitData.filter(d => d.branch === branch);
      return {
        name: branch,
        planned: branchData.reduce((sum, d) => sum + d.planned, 0),
        completed: branchData.reduce((sum, d) => sum + d.completed, 0),
        rating: branchData.length > 0 
          ? (branchData.reduce((sum, d) => sum + d.rating, 0) / branchData.length).toFixed(1)
          : 0,
      };
    });
  }, [filteredVisitData, selectedBranch]);

  const budgetByMonth = useMemo(() => {
    const months = selectedMonth === 'all' ? MONTHS : [selectedMonth];
    return months.map(month => {
      const monthData = filteredBudgetData.filter(d => d.month === month);
      return {
        month,
        allocated: monthData.reduce((sum, d) => sum + d.allocated, 0),
        used: monthData.reduce((sum, d) => sum + d.used, 0),
      };
    });
  }, [filteredBudgetData, selectedMonth]);

  // Mission status pie chart data
  const missionStatusData = [
    { name: 'Completed', value: missions.filter(m => m.status === 'completed').length, color: CHART_COLORS.green },
    { name: 'Published', value: missions.filter(m => m.status === 'published').length, color: CHART_COLORS.orange },
    { name: 'Paused', value: missions.filter(m => m.status === 'paused').length, color: CHART_COLORS.amber },
    { name: 'Draft', value: missions.filter(m => m.status === 'draft').length, color: CHART_COLORS.sky },
  ].filter(d => d.value > 0);

  // Radial chart for branch performance
  const branchRadialData = visitsByBranch.map((branch, index) => ({
    name: branch.name,
    value: parseFloat(branch.rating as string) * 20, // Convert to percentage
    rating: branch.rating,
    fill: [CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.amber][index],
  }));

  // Calculate key metrics from filtered data
  const totalVisitsPlanned = filteredVisitData.reduce((sum, d) => sum + d.planned, 0);
  const totalVisitsCompleted = filteredVisitData.reduce((sum, d) => sum + d.completed, 0);
  const completionRate = totalVisitsPlanned > 0 ? Math.round((totalVisitsCompleted / totalVisitsPlanned) * 100) : 0;
  
  const totalBudgetAllocated = filteredBudgetData.reduce((sum, d) => sum + d.allocated, 0);
  const totalBudgetUsed = filteredBudgetData.reduce((sum, d) => sum + d.used, 0);
  const budgetUtilization = totalBudgetAllocated > 0 ? Math.round((totalBudgetUsed / totalBudgetAllocated) * 100) : 0;

  const activeMissions = missions.filter(m => m.status === 'published').length;
  const completedMissions = missions.filter(m => m.status === 'completed').length;

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <PageHeader
          title="Reports & Analytics"
          description="Analyze visit outcomes, mission performance, and budget utilization."
        />

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3 p-4 md:p-6">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2 flex-1 sm:flex-none">
                <Label className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3" />
                  Month
                </Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {MONTHS.map(month => (
                      <SelectItem key={month} value={month}>{month} 2025</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1 sm:flex-none">
                <Label className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3 w-3" />
                  Branch
                </Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {BRANCHES.map(branch => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Visit Completion</CardTitle>
              <Target className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {totalVisitsCompleted} of {totalVisitsPlanned} visits
              </p>
              <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{budgetUtilization}%</div>
              <p className="text-xs text-muted-foreground">
                {totalBudgetUsed.toLocaleString()} of {totalBudgetAllocated.toLocaleString()} EGP
              </p>
              <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                  style={{ width: `${budgetUtilization}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
              <Activity className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMissions}</div>
              <p className="text-xs text-muted-foreground">
                {completedMissions} completed total
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-sky-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Package Usage</CardTitle>
              <Users className="h-4 w-4 text-sky-500" />
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
          <TabsList className="bg-muted/50">
            <TabsTrigger value="visits" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              Visits
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <DollarSign className="h-4 w-4" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="responses" className="flex items-center gap-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white">
              <PieChartIcon className="h-4 w-4" />
              Responses
            </TabsTrigger>
          </TabsList>

          {/* Visits Tab */}
          <TabsContent value="visits" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                    Visit Completion Over Time
                  </CardTitle>
                  <CardDescription>Planned vs completed visits by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart data={visitsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar 
                        dataKey="planned" 
                        fill={CHART_COLORS.orange} 
                        radius={[4, 4, 0, 0]} 
                        name="Planned"
                      />
                      <Bar 
                        dataKey="completed" 
                        fill={CHART_COLORS.green} 
                        radius={[4, 4, 0, 0]} 
                        name="Completed"
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    Mission Status Distribution
                  </CardTitle>
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
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={{ stroke: '#888', strokeWidth: 1 }}
                      >
                        {missionStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Branch comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Visits by Branch</CardTitle>
                <CardDescription>Comparison of planned vs completed visits across branches</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={visitsByBranch} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" width={130} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="planned" fill={CHART_COLORS.orangeLight} radius={[0, 4, 4, 0]} name="Planned" />
                    <Bar dataKey="completed" fill={CHART_COLORS.greenLight} radius={[0, 4, 4, 0]} name="Completed" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  Budget Allocation vs Usage
                </CardTitle>
                <CardDescription>Track how your purchase budget is being utilized over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px]">
                  <AreaChart data={budgetByMonth}>
                    <defs>
                      <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.amber} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorUsed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.emerald} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={CHART_COLORS.emerald} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `${value/1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="allocated"
                      stroke={CHART_COLORS.amber}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAllocated)"
                      name="Allocated"
                    />
                    <Area
                      type="monotone"
                      dataKey="used"
                      stroke={CHART_COLORS.emerald}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorUsed)"
                      name="Used"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-700 dark:text-amber-300">Total Allocated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">{totalBudgetAllocated.toLocaleString()} EGP</div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Across all missions</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-700 dark:text-green-300">Total Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">{totalBudgetUsed.toLocaleString()} EGP</div>
                  <p className="text-xs text-green-600 dark:text-green-400">Spent on visits</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/20 dark:to-sky-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-sky-700 dark:text-sky-300">Available Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-sky-800 dark:text-sky-200">{wallet.available_balance.toLocaleString()} EGP</div>
                  <p className="text-xs text-sky-600 dark:text-sky-400">In wallet</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                    Branch Ratings
                  </CardTitle>
                  <CardDescription>Average customer satisfaction rating by branch</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="30%"
                      outerRadius="90%"
                      barSize={20}
                      data={branchRadialData}
                      startAngle={180}
                      endAngle={0}
                    >
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={10}
                        label={{ position: 'insideStart', fill: '#fff', fontWeight: 'bold' }}
                      />
                      <Legend
                        iconSize={10}
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        content={({ payload }) => (
                          <ul className="space-y-2">
                            {payload?.map((entry: any, index: number) => (
                              <li key={`item-${index}`} className="flex items-center gap-2 text-sm">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span>{entry.value}</span>
                                <span className="font-bold">{branchRadialData[index]?.rating}/5</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      />
                    </RadialBarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Branch Details</CardTitle>
                  <CardDescription>Performance metrics by location</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {visitsByBranch.map((branch, index) => {
                    const colors = [CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.amber];
                    const completion = branch.planned > 0 ? Math.round((branch.completed / branch.planned) * 100) : 0;
                    return (
                      <div key={branch.name} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: colors[index] }}
                            />
                            <span className="font-medium">{branch.name}</span>
                          </div>
                          <span className="text-lg font-bold">{branch.rating}/5.0</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Visits</span>
                            <p className="font-medium">{branch.completed}/{branch.planned}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Completion</span>
                            <p className="font-medium">{completion}%</p>
                          </div>
                        </div>
                        <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${completion}%`,
                              backgroundColor: colors[index],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Responses Tab */}
          <TabsContent value="responses" className="space-y-4">
            {/* Mission Selector */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Select Mission
                </CardTitle>
                <CardDescription>
                  Choose a mission to view response analytics for its specific questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedMissionId} onValueChange={setSelectedMissionId}>
                  <SelectTrigger className="w-full md:w-[400px]">
                    <SelectValue placeholder="Select a mission..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="text-muted-foreground">Select a mission to view responses</span>
                    </SelectItem>
                    {missions.map(mission => (
                      <SelectItem key={mission.id} value={mission.id}>
                        <div className="flex items-center gap-2">
                          <span>{mission.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {mission.questions.length} questions
                          </Badge>
                          <Badge 
                            variant={mission.status === 'published' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {mission.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* No mission selected state */}
            {!selectedMission && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Mission</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Choose a mission from the dropdown above to view detailed response analytics 
                    for each question in that mission.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Mission responses */}
            {selectedMission && missionResponses && (
              <>
                {/* Mission Summary Card */}
                <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{selectedMission.name}</CardTitle>
                      <Badge variant="outline">
                        {selectedMission.visits_completed} / {selectedMission.number_of_visits} visits completed
                      </Badge>
                    </div>
                    <CardDescription>
                      {selectedMission.branch?.name} • {selectedMission.questions.length} questions
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Question Response Cards */}
                <div className="grid gap-4">
                  {missionResponses.map((response, index) => (
                    <Card key={response.questionId}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{ backgroundColor: [CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.sky][index % 4] }}
                            >
                              {index + 1}
                            </div>
                            <CardTitle className="text-base">{response.question}</CardTitle>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {response.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Yes/No Question */}
                        {response.type === 'yes_no' && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-green-600 font-medium">Yes</span>
                                  <span className="font-bold">{response.yes}%</span>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500 rounded-full transition-all"
                                    style={{ width: `${response.yes}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-red-600 font-medium">No</span>
                                  <span className="font-bold">{response.no}%</span>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-red-500 rounded-full transition-all"
                                    style={{ width: `${response.no}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Rating Question */}
                        {response.type === 'rating' && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
                                <span className="text-3xl font-bold">{response.avgRating}</span>
                                <span className="text-muted-foreground">/ {response.maxRating}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">Average Rating</span>
                            </div>
                            <div className="space-y-2">
                              {response.distribution?.map((d: any) => (
                                <div key={d.rating} className="flex items-center gap-2">
                                  <span className="w-8 text-sm text-right">{d.rating}★</span>
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-amber-400 rounded-full"
                                      style={{ width: `${(d.count / 75) * 100}%` }}
                                    />
                                  </div>
                                  <span className="w-8 text-xs text-muted-foreground">{d.count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Multiple Choice Question */}
                        {response.type === 'multiple_choice' && (
                          <div className="space-y-3">
                            {response.options?.map((opt: any, optIndex: number) => (
                              <div key={optIndex} className="flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>{opt.option}</span>
                                    <span className="font-medium">{opt.count}%</span>
                                  </div>
                                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full transition-all"
                                      style={{ 
                                        width: `${opt.count}%`,
                                        backgroundColor: opt.color,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Short Text Question */}
                        {response.type === 'short_text' && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MessageSquare className="h-4 w-4" />
                              <span>{response.totalResponses} text responses collected</span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Sample responses:</p>
                              {response.samples?.map((sample: string, sampleIndex: number) => (
                                <div 
                                  key={sampleIndex}
                                  className="p-2 bg-muted/50 rounded-md text-sm italic"
                                >
                                  "{sample}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Key Insights for this mission */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mission Insights</CardTitle>
                    <CardDescription>AI-generated observations for {selectedMission.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">Strong Performance</p>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            This mission shows {selectedMission.visits_completed > selectedMission.number_of_visits / 2 ? 'good' : 'improving'} completion rates 
                            with {selectedMission.visits_completed} visits completed out of {selectedMission.number_of_visits} planned.
                          </p>
                        </div>
                      </div>
                      {missionResponses.some(r => r.type === 'yes_no' && r.no > 30) && (
                        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                          <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-amber-800 dark:text-amber-200">Area for Improvement</p>
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                              Some yes/no questions show over 30% negative responses - review these for potential improvements.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
