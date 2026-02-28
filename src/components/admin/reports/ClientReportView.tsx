import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/i18n/LanguageProvider';
import { getLocalizedValue } from '@/i18n/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell,
  AreaChart, Area,
  RadialBarChart, RadialBar, Legend,
} from 'recharts';
import {
  Target, DollarSign, Activity, Users, BarChart3, TrendingUp,
  ClipboardList, Star, MessageSquare, CheckCircle, Clock,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const CHART_COLORS = {
  orange: '#F97316', orangeLight: '#FB923C',
  green: '#22C55E', greenLight: '#4ADE80',
  amber: '#F59E0B', amberLight: '#FBBF24',
  emerald: '#10B981', teal: '#14B8A6',
  cyan: '#06B6D4', sky: '#0EA5E9',
  red: '#EF4444', rose: '#F43F5E',
  purple: '#A855F7', indigo: '#6366F1',
};

interface ClientReportViewProps {
  clientId: string;
  clientName: string;
}

export function ClientReportView({ clientId, clientName }: ClientReportViewProps) {
  const { t } = useTranslation('reports');
  const { t: tCommon } = useTranslation('common');
  const { t: tAdmin } = useTranslation('admin');
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const currencyCode = tCommon('currency_code');
  const borderSide = isRTL ? 'border-r-4' : 'border-l-4';

  const [selectedMissionId, setSelectedMissionId] = useState<string>('all');

  // Fetch client-specific data
  const { data, isLoading } = useQuery({
    queryKey: ['admin-client-report', clientId],
    queryFn: async () => {
      const [missionsRes, branchesRes, walletRes] = await Promise.all([
        supabase.from('missions').select('*').eq('user_id', clientId),
        supabase.from('branches').select('*').eq('user_id', clientId),
        supabase.from('wallets').select('*').eq('user_id', clientId).maybeSingle(),
      ]);

      const missions = missionsRes.data || [];
      const branches = branchesRes.data || [];
      const wallet = walletRes.data;

      // Fetch visits for this client's missions
      const missionIds = missions.map(m => m.id);
      let visits: any[] = [];
      if (missionIds.length > 0) {
        const visitsRes = await supabase.from('visits').select('*').in('mission_id', missionIds);
        visits = visitsRes.data || [];
      }

      // Fetch subscription
      const subRes = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', clientId)
        .eq('status', 'active')
        .maybeSingle();
      const subscription = subRes.data;

      return { missions, branches, visits, wallet, subscription };
    },
    enabled: !!clientId,
  });

  const missions = data?.missions || [];
  const branches = data?.branches || [];
  const visits = data?.visits || [];
  const wallet = data?.wallet;
  const subscription = data?.subscription;

  // Compute metrics
  const totalVisitsPlanned = missions.reduce((s, m) => s + m.number_of_visits, 0);
  const totalVisitsCompleted = missions.reduce((s, m) => s + m.visits_completed, 0);
  const completionRate = totalVisitsPlanned > 0 ? Math.round((totalVisitsCompleted / totalVisitsPlanned) * 100) : 0;

  const totalBudgetAllocated = missions.reduce((s, m) => s + Number(m.total_purchase_budget), 0);
  const totalBudgetUsed = missions.reduce((s, m) => s + Number(m.budget_used), 0);
  const budgetUtilization = totalBudgetAllocated > 0 ? Math.round((totalBudgetUsed / totalBudgetAllocated) * 100) : 0;

  const activeMissions = missions.filter(m => m.status === 'published').length;
  const completedMissions = missions.filter(m => m.status === 'completed').length;

  const visitsUsed = subscription?.visits_used_this_month || 0;
  const visitsAllowed = (subscription?.subscription_plans as any)?.visits_per_month || 0;

  // Mission status distribution
  const missionStatusData = [
    { name: tCommon('statuses.completed'), value: missions.filter(m => m.status === 'completed').length, color: CHART_COLORS.green },
    { name: tCommon('statuses.published'), value: missions.filter(m => m.status === 'published').length, color: CHART_COLORS.orange },
    { name: tCommon('statuses.paused'), value: missions.filter(m => m.status === 'paused').length, color: CHART_COLORS.amber },
    { name: tCommon('statuses.draft'), value: missions.filter(m => m.status === 'draft').length, color: CHART_COLORS.sky },
  ].filter(d => d.value > 0);

  // Visits by branch
  const visitsByBranch = useMemo(() => {
    return branches.map(branch => {
      const branchMissions = missions.filter(m => m.branch_id === branch.id);
      const planned = branchMissions.reduce((s, m) => s + m.number_of_visits, 0);
      const completed = branchMissions.reduce((s, m) => s + m.visits_completed, 0);
      return {
        name: getLocalizedValue(branch.name_ar ? { en: branch.name, ar: branch.name_ar } : branch.name, language) as string,
        planned,
        completed,
        rating: 0,
      };
    }).filter(b => b.planned > 0);
  }, [branches, missions, language]);

  // Budget by mission
  const budgetByMission = missions
    .filter(m => Number(m.total_purchase_budget) > 0)
    .slice(0, 8)
    .map(m => ({
      name: (getLocalizedValue(m.name_ar ? { en: m.name, ar: m.name_ar } : m.name, language) as string).slice(0, 15),
      allocated: Number(m.total_purchase_budget),
      used: Number(m.budget_used),
    }));

  // Selected mission for responses
  const selectedMission = useMemo(() => {
    if (selectedMissionId === 'all') return null;
    return missions.find(m => m.id === selectedMissionId);
  }, [selectedMissionId, missions]);

  // Mock responses for selected mission (same logic as client Reports)
  const missionResponses = useMemo(() => {
    if (!selectedMission) return null;
    const questions = (selectedMission.questions as any[]) || [];
    const seed = selectedMission.id.charCodeAt(selectedMission.id.length - 1);
    return questions.map((q, index) => {
      const baseValue = 60 + ((seed + index) % 30);
      if (q.type === 'yes_no') {
        return { questionId: q.id, question: q.text, type: 'yes_no', yes: baseValue, no: 100 - baseValue };
      } else if (q.type === 'rating') {
        const avgRating = 3.5 + ((seed + index) % 15) / 10;
        return {
          questionId: q.id, question: q.text, type: 'rating',
          avgRating: avgRating.toFixed(1), maxRating: q.max_rating || 5,
          distribution: [
            { rating: 1, count: 5 + (index % 3) }, { rating: 2, count: 8 + (index % 5) },
            { rating: 3, count: 15 + (index % 7) }, { rating: 4, count: 25 + (index % 10) },
            { rating: 5, count: 20 + (index % 8) },
          ],
        };
      } else if (q.type === 'multiple_choice' && q.options) {
        let remaining = 100;
        const optionResults = q.options.map((opt: any, optIndex: number) => {
          const isLast = optIndex === q.options.length - 1;
          const value = isLast ? remaining : Math.floor(remaining * (0.2 + ((seed + optIndex) % 40) / 100));
          remaining -= value;
          return { option: opt.text, count: value, color: [CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.sky][optIndex % 4] };
        });
        return { questionId: q.id, question: q.text, type: 'multiple_choice', options: optionResults };
      } else {
        return {
          questionId: q.id, question: q.text, type: 'short_text',
          totalResponses: 25 + (seed % 20),
          samples: ['Great service overall!', 'Staff was helpful but slow', 'Clean and well organized', 'Could improve checkout speed'],
        };
      }
    });
  }, [selectedMission]);

  const chartConfig = {
    planned: { label: t('chart_labels.planned'), color: CHART_COLORS.orange },
    completed: { label: t('chart_labels.completed'), color: CHART_COLORS.green },
    allocated: { label: t('chart_labels.allocated'), color: CHART_COLORS.amber },
    used: { label: t('chart_labels.used'), color: CHART_COLORS.emerald },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Client Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{clientName}</CardTitle>
          <CardDescription>
            {subscription ? (subscription.subscription_plans as any)?.name || tAdmin('clients.no_plan') : tAdmin('clients.no_plan')}
            {' • '}
            {missions.length} {t('tabs.missions')} • {branches.length} {tAdmin('branches.total_branches')}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className={`${borderSide} border-orange-500`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('metrics.visit_completion')}</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {t('metrics.visits_of_total', { completed: totalVisitsCompleted, planned: totalVisitsPlanned })}
            </p>
            <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all" style={{ width: `${completionRate}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className={`${borderSide} border-green-500`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('metrics.budget_utilization')}</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              {t('metrics.budget_of_total', { used: totalBudgetUsed.toLocaleString(isRTL ? 'ar-EG' : 'en'), allocated: totalBudgetAllocated.toLocaleString(isRTL ? 'ar-EG' : 'en') })}
            </p>
            <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all" style={{ width: `${budgetUtilization}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className={`${borderSide} border-amber-500`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('metrics.active_missions')}</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMissions}</div>
            <p className="text-xs text-muted-foreground">
              {t('metrics.completed_total', { count: completedMissions })}
            </p>
          </CardContent>
        </Card>

        <Card className={`${borderSide} border-sky-500`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('metrics.package_usage')}</CardTitle>
            <Users className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitsUsed}/{visitsAllowed || '∞'}</div>
            <p className="text-xs text-muted-foreground">{t('metrics.visits_used_month')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs replicating client reports */}
      <Tabs defaultValue="visits" className="space-y-4">
        <TabsList className="bg-muted/50 w-full flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="visits" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t('tabs.visits')}
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t('tabs.budget')}
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-amber-500 data-[state=active]:text-white">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t('tabs.performance')}
          </TabsTrigger>
          <TabsTrigger value="responses" className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-sky-500 data-[state=active]:text-white">
            <PieChartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {t('tabs.responses')}
          </TabsTrigger>
        </TabsList>

        {/* Visits Tab */}
        <TabsContent value="visits" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader className="p-4 md:p-6 pb-2 md:pb-2">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  {t('visits_tab.mission_status_dist')}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">{t('visits_tab.mission_status_dist_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                {missionStatusData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
                    <PieChart>
                      <Pie data={missionStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}>
                        {missionStatusData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={2} />)}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">{tAdmin('missions.no_missions')}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 md:p-6 pb-2 md:pb-2">
                <CardTitle className="text-sm sm:text-base">{t('visits_tab.visits_by_branch')}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{t('visits_tab.visits_by_branch_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                {visitsByBranch.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
                    <BarChart data={visitsByBranch} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" fontSize={10} />
                      <YAxis dataKey="name" type="category" width={80} fontSize={9} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="planned" fill={CHART_COLORS.orangeLight} radius={[0, 4, 4, 0]} name={t('chart_labels.planned')} />
                      <Bar dataKey="completed" fill={CHART_COLORS.greenLight} radius={[0, 4, 4, 0]} name={t('chart_labels.completed')} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">{tAdmin('branches.no_verified')}</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                {t('budget_tab.allocation_vs_usage')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('budget_tab.allocation_vs_usage_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              {budgetByMission.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <BarChart data={budgetByMission}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis fontSize={10} tickFormatter={(v) => `${v / 1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="allocated" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} name={t('chart_labels.allocated')} />
                    <Bar dataKey="used" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} name={t('chart_labels.used')} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">{tAdmin('missions.no_missions')}</div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10">
              <CardHeader className="pb-2 p-4"><CardTitle className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">{t('budget_tab.total_allocated')}</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl sm:text-2xl font-bold text-amber-800 dark:text-amber-200">{totalBudgetAllocated.toLocaleString(isRTL ? 'ar-EG' : 'en')} {currencyCode}</div>
                <p className="text-xs text-amber-600 dark:text-amber-400">{t('budget_tab.across_all_missions')}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
              <CardHeader className="pb-2 p-4"><CardTitle className="text-xs sm:text-sm text-green-700 dark:text-green-300">{t('budget_tab.total_used')}</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200">{totalBudgetUsed.toLocaleString(isRTL ? 'ar-EG' : 'en')} {currencyCode}</div>
                <p className="text-xs text-green-600 dark:text-green-400">{t('budget_tab.spent_on_visits')}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/20 dark:to-sky-900/10">
              <CardHeader className="pb-2 p-4"><CardTitle className="text-xs sm:text-sm text-sky-700 dark:text-sky-300">{t('budget_tab.available_balance')}</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-xl sm:text-2xl font-bold text-sky-800 dark:text-sky-200">{(wallet?.balance || 0).toLocaleString(isRTL ? 'ar-EG' : 'en')} {currencyCode}</div>
                <p className="text-xs text-sky-600 dark:text-sky-400">{t('budget_tab.in_wallet')}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-2">
              <CardTitle className="text-sm sm:text-base">{t('performance_tab.branch_details')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('performance_tab.branch_details_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-2 md:pt-2 space-y-3">
              {visitsByBranch.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">{tAdmin('branches.no_verified')}</div>
              ) : visitsByBranch.map((branch, index) => {
                const colors = [CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.sky];
                const completion = branch.planned > 0 ? Math.round((branch.completed / branch.planned) * 100) : 0;
                return (
                  <div key={branch.name} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[index % colors.length] }} />
                        <span className="font-medium text-sm truncate">{branch.name}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div>
                        <span className="text-muted-foreground">{t('performance_tab.visits')}</span>
                        <p className="font-medium">{branch.completed}/{branch.planned}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('performance_tab.completion')}</span>
                        <p className="font-medium">{completion}%</p>
                      </div>
                    </div>
                    <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${completion}%`, backgroundColor: colors[index % colors.length] }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responses Tab */}
        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 p-4 md:p-6">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                {t('responses_tab.select_mission')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('responses_tab.select_mission_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <Select value={selectedMissionId} onValueChange={setSelectedMissionId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('responses_tab.select_mission_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="text-muted-foreground">{t('responses_tab.select_mission_prompt')}</span>
                  </SelectItem>
                  {missions.map(mission => (
                    <SelectItem key={mission.id} value={mission.id}>
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[200px]">
                          {getLocalizedValue(mission.name_ar ? { en: mission.name, ar: mission.name_ar } : mission.name, language)}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {t('responses_tab.questions_count', { count: (mission.questions as any[])?.length || 0 })}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {!selectedMission && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('responses_tab.select_mission_title')}</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">{t('responses_tab.select_mission_body')}</p>
              </CardContent>
            </Card>
          )}

          {selectedMission && missionResponses && (
            <>
              <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-2 p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg">
                      {getLocalizedValue(selectedMission.name_ar ? { en: selectedMission.name, ar: selectedMission.name_ar } : selectedMission.name, language)}
                    </CardTitle>
                    <Badge variant="outline" className="w-fit text-xs">
                      {t('responses_tab.visits_count', { completed: selectedMission.visits_completed, total: selectedMission.number_of_visits })}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid gap-3 md:gap-4">
                {missionResponses.map((response, index) => (
                  <Card key={response.questionId}>
                    <CardHeader className="pb-2 p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:justify-between">
                        <div className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: [CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.sky][index % 4] }}>
                            {index + 1}
                          </div>
                          <CardTitle className="text-sm sm:text-base">
                            {typeof response.question === 'object' ? getLocalizedValue(response.question, language) : response.question}
                          </CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs w-fit">{t(`question_types.${response.type}`)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                      {response.type === 'yes_no' && (
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs sm:text-sm mb-1">
                              <span className="text-green-600 font-medium">{t('chart_labels.yes')}</span>
                              <span className="font-bold">{response.yes}%</span>
                            </div>
                            <div className="h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${response.yes}%` }} />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-xs sm:text-sm mb-1">
                              <span className="text-red-600 font-medium">{t('chart_labels.no')}</span>
                              <span className="font-bold">{response.no}%</span>
                            </div>
                            <div className="h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-red-500 rounded-full" style={{ width: `${response.no}%` }} />
                            </div>
                          </div>
                        </div>
                      )}
                      {response.type === 'rating' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
                              <span className="text-3xl font-bold">{response.avgRating}</span>
                              <span className="text-muted-foreground">/ {response.maxRating}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{t('responses_detail.average_rating')}</span>
                          </div>
                          <div className="space-y-2">
                            {response.distribution?.map((d: any) => (
                              <div key={d.rating} className="flex items-center gap-2">
                                <span className="w-8 text-sm text-end">{d.rating}★</span>
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(d.count / 75) * 100}%` }} />
                                </div>
                                <span className="w-8 text-xs text-muted-foreground">{d.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {response.type === 'multiple_choice' && (
                        <div className="space-y-3">
                          {response.options?.map((opt: any, optIndex: number) => (
                            <div key={optIndex} className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{typeof opt.option === 'object' ? getLocalizedValue(opt.option, language) : opt.option}</span>
                                  <span className="font-medium">{opt.count}%</span>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${opt.count}%`, backgroundColor: opt.color }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {response.type === 'short_text' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            <span>{t('responses_detail.text_responses_collected', { count: response.totalResponses })}</span>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">{t('responses_detail.sample_responses')}</p>
                            {response.samples?.map((sample: string, si: number) => (
                              <div key={si} className="p-2 bg-muted/50 rounded-md text-sm italic">"{sample}"</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
