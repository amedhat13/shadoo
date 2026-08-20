// TODO: Remove mock data import and set USE_MOCK_DATA = false when real data is available
import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { useLanguage } from '@/i18n/LanguageProvider';
import { getLocalizedValue } from '@/i18n/utils';
import {
  useClientReports,
  getVisitsForMission,
  getAnswersForQuestion,
  getPrimaryScore,
  calcNPS,
  calcCSAT,
  calcAverage,
  calcTop2Box,
  calcTopBox,
  calcYesPercent,
  getRatingDistribution,
  identifyQuestionRoles,
  isNPSLikeQuestion,
  calcNPSFromYesNo,
  calcOverallScore,
  ReportMission,
  ReportVisit,
} from '@/hooks/useClientReports';
import { exportReportsToExcel } from '@/lib/exportReports';
import { USE_MOCK_DATA, MOCK_MISSIONS, getMockVisits, MOCK_BRANCHES, filterMockData } from '@/lib/mockReportsData';
import { ReportsFilterBar, ReportFilters } from '@/components/reports/ReportsFilterBar';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, Target, DollarSign, BarChart3, Activity, Download, 
  CheckCircle, Clock, Building2, FileQuestion, Wallet, AlertTriangle,
} from 'lucide-react';
import { BranchComparisonTab } from '@/components/reports/BranchComparisonTab';
import { MetricsOverview } from '@/components/reports/MetricsOverview';

const COLORS = ['#F97316', '#22C55E', '#F59E0B', '#06B6D4', '#A855F7', '#EF4444', '#6366F1', '#14B8A6'];
const METHODOLOGY_LABELS: Record<string, string> = {
  nps: 'NPS', csat: 'CSAT', ces: 'CES', overall_score: 'Overall Score',
  top_2_box: 'Top 2 Box', top_box: 'Top Box', menu_tryout: 'Menu Try-Out',
  buy_and_try: 'Buy & Try', delivery_cx: 'Delivery CX', call_center_cx: 'Call Center CX',
  app_digital_cx: 'App/Digital CX', in_store_cx: 'In-Store CX', custom: 'Custom',
};

export default function ReportsPage() {
  const { t } = useTranslation('reports');
  const { t: tc } = useTranslation('common');
  const { t: tm } = useTranslation('missions');
  const { language } = useLanguage();
  const realData = useClientReports();
  const [selectedMissionId, setSelectedMissionId] = useState<string>('all');
  const [filters, setFilters] = useState<ReportFilters>({ dateFrom: null, dateTo: null, branchIds: [] });

  // Use mock or real data
  const rawMissions = USE_MOCK_DATA ? (MOCK_MISSIONS as unknown as ReportMission[]) : realData.missions;
  const rawVisits = USE_MOCK_DATA ? (getMockVisits() as unknown as ReportVisit[]) : realData.visits;
  const branches = USE_MOCK_DATA ? (MOCK_BRANCHES as any[]) : realData.branches;
  const isLoading = USE_MOCK_DATA ? false : realData.isLoading;

  // Apply global filters
  const { visits: filteredAllVisits, missions: filteredAllMissions } = useMemo(() => {
    return filterMockData(rawVisits, rawMissions, filters.dateFrom, filters.dateTo, filters.branchIds.length > 0 ? filters.branchIds : null);
  }, [rawVisits, rawMissions, filters]);

  const missions = filteredAllMissions as ReportMission[];
  const visits = filteredAllVisits as ReportVisit[];

  const selectedMission = useMemo(() => {
    if (selectedMissionId === 'all') return null;
    return missions.find(m => m.id === selectedMissionId) || null;
  }, [selectedMissionId, missions]);

  const relevantVisits = useMemo(() => {
    if (selectedMissionId === 'all') return visits;
    return visits.filter(v => v.mission_id === selectedMissionId);
  }, [selectedMissionId, visits]);

  const completedVisits = useMemo(() => 
    relevantVisits.filter(v => v.status === 'submitted' || v.status === 'approved'), 
    [relevantVisits]
  );

  const relevantMissions = useMemo(() => {
    if (selectedMissionId === 'all') return missions;
    return selectedMission ? [selectedMission] : [];
  }, [selectedMissionId, missions, selectedMission]);

  const methodology = selectedMission?.methodology || 'custom';
  const showMethodologyTab = methodology !== 'custom' && methodology !== null && selectedMission !== null;

  // Overview metrics
  const overviewMetrics = useMemo(() => {
    const totalPlanned = relevantMissions.reduce((s, m) => s + m.number_of_visits, 0);
    const totalCompleted = relevantMissions.reduce((s, m) => s + m.visits_completed, 0);
    const completionRate = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;

    const totalAllocated = relevantMissions.reduce((s, m) => s + m.total_purchase_budget, 0);
    const totalUsed = relevantMissions.reduce((s, m) => s + m.budget_used, 0);
    const budgetEfficiency = totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0;

    const activeMissions = missions.filter(m => m.status === 'published').length;
    const verifiedBranches = branches.filter(b => b.status === 'verified').length;

    // Avg response time
    const responseTimes = completedVisits
      .filter(v => v.started_at && v.submitted_at)
      .map(v => (new Date(v.submitted_at!).getTime() - new Date(v.started_at!).getTime()) / (1000 * 60 * 60));
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((s, t) => s + t, 0) / responseTimes.length * 10) / 10
      : 0;

    // Primary score
    let primaryScore: { score: number; label: string; maxScore: number; benchmark?: string; color?: string } = { score: 0, label: 'Score', maxScore: 10 };
    if (selectedMission) {
      primaryScore = getPrimaryScore(methodology, selectedMission.questions || [], completedVisits);
    }

    // Aggregate NPS across relevant missions
    const allQs: any[] = [];
    for (const m of relevantMissions) {
      const qs = Array.isArray(m.questions) ? m.questions : [];
      allQs.push(...(qs as any[]));
    }
    const npsQ = allQs.find(isNPSLikeQuestion);
    let npsScore: number | null = null;
    let npsTotal = 0;
    if (npsQ) {
      const kind = isNPSLikeQuestion(npsQ);
      const raw = getAnswersForQuestion(completedVisits, npsQ.id);
      if (kind === 'rating10') {
        const nums = raw.map(Number).filter((n) => !isNaN(n));
        const r = calcNPS(nums);
        npsScore = r.score; npsTotal = r.total;
      } else if (kind === 'recommend_yesno') {
        const r = calcNPSFromYesNo(raw as any);
        npsScore = r.score; npsTotal = r.total;
      }
    }
    const overall = calcOverallScore(completedVisits, allQs, 10);

    return { totalPlanned, totalCompleted, completionRate, totalAllocated, totalUsed, budgetEfficiency, activeMissions, verifiedBranches, avgResponseTime, primaryScore, npsScore, npsTotal, overallScore: overall.score, overallPercent: overall.percent, overallCount: overall.count };
  }, [relevantMissions, completedVisits, missions, branches, selectedMission, methodology]);

  const handleExport = useCallback(() => {
    const currency = tc('currency_code') || 'EGP';
    const branchData = branches.filter(b => b.status === 'verified').map(branch => {
      const branchMissions = relevantMissions.filter(m => m.branch_id === branch.id);
      const totalVisits = branchMissions.reduce((s, m) => s + m.number_of_visits, 0);
      const completed = branchMissions.reduce((s, m) => s + m.visits_completed, 0);
      return { name: branch.name, planned: totalVisits, completed, rating: '-' as string | number };
    });
    const statusCounts: Record<string, number> = {};
    missions.forEach(m => { statusCounts[m.status] = (statusCounts[m.status] || 0) + 1; });

    exportReportsToExcel({
      visitData: relevantMissions.map(m => ({
        month: new Date(m.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' }),
        branch: m.branch?.name || '-',
        planned: m.number_of_visits,
        completed: m.visits_completed,
        rating: 0,
      })),
      budgetData: relevantMissions.map(m => ({
        month: new Date(m.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' }),
        branch: m.branch?.name || '-',
        allocated: m.total_purchase_budget,
        used: m.budget_used,
      })),
      visitsByBranch: branchData,
      missionStatusData: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      keyMetrics: {
        visitCompletion: overviewMetrics.completionRate,
        totalVisitsPlanned: overviewMetrics.totalPlanned,
        totalVisitsCompleted: overviewMetrics.totalCompleted,
        budgetUtilization: overviewMetrics.budgetEfficiency,
        totalBudgetAllocated: overviewMetrics.totalAllocated,
        totalBudgetUsed: overviewMetrics.totalUsed,
        activeMissions: overviewMetrics.activeMissions,
        completedMissions: missions.filter(m => m.status === 'completed').length,
        packageUsed: 0,
        packageTotal: 0,
      },
      labels: {
        sheetSummary: t('export.sheet_summary'),
        sheetVisits: t('export.sheet_visits'),
        sheetBudget: t('export.sheet_budget'),
        sheetPerformance: t('export.sheet_performance'),
        sheetMissionStatus: t('export.sheet_mission_status'),
        metric: t('export.metric'),
        value: t('export.value'),
        visitCompletion: t('metrics.visit_completion'),
        budgetUtilization: t('metrics.budget_utilization'),
        activeMissions: t('metrics.active_missions'),
        completedMissions: t('export.completed_missions'),
        packageUsage: t('metrics.package_usage'),
        totalPlanned: t('export.total_planned'),
        totalCompleted: t('export.total_completed'),
        totalAllocated: t('budget_tab.total_allocated'),
        totalUsed: t('budget_tab.total_used'),
        month: t('export.month'),
        branch: t('export.branch'),
        planned: t('chart_labels.planned'),
        completed: t('chart_labels.completed'),
        rating: t('chart_labels.rating'),
        allocated: t('chart_labels.allocated'),
        used: t('chart_labels.used'),
        completionRate: t('export.completion_rate'),
        status: t('export.status'),
        count: t('export.count'),
        currency,
      },
    }, `shadoo-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [relevantMissions, missions, branches, overviewMetrics, t, tc]);

  // Mission status distribution
  const missionStatusDist = useMemo(() => {
    const counts: Record<string, number> = {};
    missions.forEach(m => { counts[m.status] = (counts[m.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
  }, [missions]);

  // NPS breakdown (Promoters / Passives / Detractors) across relevant missions
  const npsBreakdown = useMemo(() => {
    const allQs: any[] = [];
    for (const m of relevantMissions) {
      const qs = Array.isArray(m.questions) ? m.questions : [];
      allQs.push(...(qs as any[]));
    }
    const npsQ = allQs.find(isNPSLikeQuestion);
    if (!npsQ) return null;
    const kind = isNPSLikeQuestion(npsQ);
    const raw = getAnswersForQuestion(completedVisits, npsQ.id);
    if (kind === 'rating10') {
      const nums = raw.map(Number).filter((n) => !isNaN(n));
      const r = calcNPS(nums);
      return {
        score: r.score,
        total: r.total,
        data: [
          { name: 'Promoters', value: r.promoters, color: '#16a34a' },
          { name: 'Passives', value: r.passives, color: '#f59e0b' },
          { name: 'Detractors', value: r.detractors, color: '#dc2626' },
        ],
      };
    }
    const r = calcNPSFromYesNo(raw as any);
    return {
      score: r.score,
      total: r.total,
      data: [
        { name: 'Promoters', value: r.promoters, color: '#16a34a' },
        { name: 'Detractors', value: r.detractors, color: '#dc2626' },
      ],
    };
  }, [relevantMissions, completedVisits, t]);

  // Overall Score by branch (0-10 scale)
  const overallByBranch = useMemo(() => {
    const byBranch: { name: string; score: number; count: number }[] = [];
    for (const branch of branches) {
      const branchMissions = relevantMissions.filter(m => m.branch_id === branch.id);
      if (branchMissions.length === 0) continue;
      const branchVisits = completedVisits.filter(v => branchMissions.some(m => m.id === v.mission_id));
      const qs: any[] = [];
      for (const m of branchMissions) {
        const mq = Array.isArray(m.questions) ? m.questions : [];
        qs.push(...(mq as any[]));
      }
      const r = calcOverallScore(branchVisits, qs, 10);
      if (r.count > 0) {
        const label = (language === 'ar' && branch.name_ar ? branch.name_ar : branch.name) as string;
        byBranch.push({ name: label.length > 20 ? label.slice(0, 20) + '…' : label, score: r.score, count: r.count });
      }
    }
    return byBranch;
  }, [branches, relevantMissions, completedVisits, language]);

  if (isLoading) {
    return <DashboardLayout><LoadingState message={t('loading') || 'Loading...'} /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <PageHeader
          title={t('title')}
          description={t('description')}
          actions={
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              {t('export.button')}
            </Button>
          }
        />

        {/* Demo Data Banner */}
        {USE_MOCK_DATA && (
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-700 dark:text-amber-400">{t('demo_banner', { defaultValue: 'You are viewing demo data. Real analytics will appear once missions are completed.' })}</p>
            </CardContent>
          </Card>
        )}

        {/* Mission Selector */}
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Select value={selectedMissionId} onValueChange={setSelectedMissionId}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder={t('select_mission') || 'Select mission'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_missions') || 'All Missions'}</SelectItem>
                {missions.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {language === 'ar' && m.name_ar ? m.name_ar : m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMission && (
              <Badge variant="secondary" className="text-xs">
                {METHODOLOGY_LABELS[methodology] || 'Custom'}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Global Filters */}
        <ReportsFilterBar filters={filters} onFiltersChange={setFilters} branches={branches} language={language} />

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('tab_overview') || 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-2">
              <FileQuestion className="h-4 w-4" />
              {t('tab_questions') || 'Question Analytics'}
            </TabsTrigger>
            <TabsTrigger value="branches" className="gap-2">
              <Building2 className="h-4 w-4" />
              {t('tab_branches') || 'Branch Performance'}
            </TabsTrigger>
            <TabsTrigger value="budget" className="gap-2">
              <Wallet className="h-4 w-4" />
              {t('tab_budget') || 'Budget & Operations'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-4">
              {/* Configurable metrics */}
              <MetricsOverview
                missions={relevantMissions}
                visits={completedVisits}
                branches={branches}
                language={language}
              />

              {/* Operational cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                <MetricCard
                  title={t('metrics.visit_completion')}
                  value={`${overviewMetrics.completionRate}%`}
                  subtitle={`${overviewMetrics.totalCompleted}/${overviewMetrics.totalPlanned}`}
                  icon={<CheckCircle className="h-4 w-4" />}
                />
                <MetricCard
                  title={t('avg_response_time') || 'Avg Response Time'}
                  value={`${overviewMetrics.avgResponseTime}h`}
                  subtitle=""
                  icon={<Clock className="h-4 w-4" />}
                />
                <MetricCard
                  title={t('budget_efficiency') || 'Budget Efficiency'}
                  value={`${overviewMetrics.budgetEfficiency}%`}
                  subtitle={`${overviewMetrics.totalUsed.toLocaleString()} / ${overviewMetrics.totalAllocated.toLocaleString()}`}
                  icon={<DollarSign className="h-4 w-4" />}
                />
                <MetricCard
                  title={t('metrics.active_missions')}
                  value={`${overviewMetrics.activeMissions}`}
                  subtitle=""
                  icon={<TrendingUp className="h-4 w-4" />}
                />
                <MetricCard
                  title={t('verified_branches') || 'Verified Branches'}
                  value={`${overviewMetrics.verifiedBranches}`}
                  subtitle=""
                  icon={<Building2 className="h-4 w-4" />}
                />
              </div>

            </div>
          </TabsContent>

          {/* Question Analytics Tab */}
          <TabsContent value="questions">
            <QuestionAnalyticsTab
              mission={selectedMission}
              missions={relevantMissions}
              visits={completedVisits}
              language={language}
            />
          </TabsContent>

          {/* Branch Performance Tab */}
          <TabsContent value="branches">
            <BranchComparisonTab
              missions={missions}
              visits={completedVisits}
              allVisits={visits}
              branches={branches}
              language={language}
            />
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget">
            <BudgetTab
              missions={relevantMissions}
              visits={completedVisits}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// ---- Sub-components ----

function MetricCard({ title, value, subtitle, icon, className }: { title: string; value: string; subtitle: string; icon: React.ReactNode; className?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground truncate">{title}</span>
          <span className="text-muted-foreground">{icon}</span>
        </div>
        <div className={`text-2xl font-bold ${className || ''}`}>{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function MethodologyDashboard({ mission, visits, branches, language }: { mission: ReportMission; visits: ReportVisit[]; branches: any[]; language: string }) {
  const { t } = useTranslation('reports');
  const methodology = mission.methodology || 'custom';
  const questions = mission.questions || [];
  const roles = identifyQuestionRoles(methodology, questions);
  const missionVisits = visits.filter(v => v.mission_id === mission.id);

  if (missionVisits.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{t('no_visit_data') || 'No visit data available yet for this mission.'}</p>
        </CardContent>
      </Card>
    );
  }

  // Build dashboard based on methodology
  const primaryScore = getPrimaryScore(methodology, questions, missionVisits);

  // Get per-question analytics for display
  const questionAnalytics = questions.map(q => {
    const answers = getAnswersForQuestion(missionVisits, q.id);
    const qText = typeof q.text === 'object' ? (language === 'ar' ? q.text.ar : q.text.en) : q.text;
    
    if (q.type === 'rating') {
      const numAnswers = answers.map(Number).filter(n => !isNaN(n));
      return { ...q, displayText: qText, avg: calcAverage(numAnswers), count: numAnswers.length, dist: getRatingDistribution(numAnswers, q.max_rating || 5), top2: calcTop2Box(numAnswers, q.max_rating || 5) };
    }
    if (q.type === 'yes_no') {
      return { ...q, displayText: qText, yesPercent: calcYesPercent(answers), count: answers.length };
    }
    if (q.type === 'multiple_choice') {
      const optTexts = (q.options || []).map((o: any) => typeof o.text === 'object' ? (language === 'ar' ? o.text.ar : o.text.en) : o.text);
      const optValues = (q.options || []).map((o: any) => typeof o.text === 'object' ? o.text.en : o.text);
      const total = answers.length;
      const dist = optValues.map((ov: string, i: number) => ({
        option: optTexts[i],
        count: answers.filter(a => a === ov || a === optTexts[i]).length,
        percent: total > 0 ? Math.round((answers.filter(a => a === ov || a === optTexts[i]).length / total) * 100) : 0,
      }));
      return { ...q, displayText: qText, distribution: dist, count: total };
    }
    return { ...q, displayText: qText, textAnswers: answers, count: answers.length };
  });

  return (
    <div className="space-y-4">
      {/* Primary Score */}
      <Card>
        <CardContent className="p-6 flex flex-col items-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">{METHODOLOGY_LABELS[methodology] || methodology}</p>
          <div className={`text-5xl font-black ${primaryScore.color || ''}`}>
            {primaryScore.score}
            <span className="text-lg text-muted-foreground">/{primaryScore.maxScore}</span>
          </div>
          {primaryScore.benchmark && (
            <Badge variant="secondary" className="mt-2">{primaryScore.benchmark}</Badge>
          )}
          <p className="text-xs text-muted-foreground mt-1">{missionVisits.length} {t('responses') || 'responses'}</p>
        </CardContent>
      </Card>

      {/* Question-level detail cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {questionAnalytics.map((qa: any, i: number) => (
          <Card key={qa.id || i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{qa.displayText}</CardTitle>
              <CardDescription className="text-xs">{qa.count} {t('responses') || 'responses'}</CardDescription>
            </CardHeader>
            <CardContent>
              {qa.type === 'rating' && qa.dist && (
                <div className="space-y-2">
                  <p className="text-lg font-bold">{(qa.avg || 0).toFixed(1)} <span className="text-sm text-muted-foreground">/ {qa.max_rating || 5}</span></p>
                  <p className="text-xs text-muted-foreground">Top 2 Box: {qa.top2}%</p>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={qa.dist}>
                        <XAxis dataKey="rating" fontSize={10} />
                        <YAxis fontSize={10} />
                        <RechartsTooltip
                          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                          contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12 }}
                          formatter={(value: number) => [`${value} responses`, `Rating`]}
                          labelFormatter={(l) => `${l} ★`}
                        />
                        <Bar dataKey="count" fill={COLORS[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              {qa.type === 'yes_no' && (
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <div>
                      <span className="text-lg font-bold text-green-600">{qa.yesPercent}%</span>
                      <span className="text-xs text-muted-foreground ml-1">Yes</span>
                    </div>
                    <div>
                      <span className="text-lg font-bold text-destructive">{100 - (qa.yesPercent || 0)}%</span>
                      <span className="text-xs text-muted-foreground ml-1">No</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: `${qa.yesPercent}%` }} />
                  </div>
                </div>
              )}
              {qa.type === 'multiple_choice' && qa.distribution && (
                <div className="space-y-1.5">
                  {qa.distribution.map((d: any, j: number) => (
                    <div key={j} className="space-y-0.5">
                      <div className="flex justify-between text-xs">
                        <span className="truncate">{d.option}</span>
                        <span className="text-muted-foreground">{d.percent}% ({d.count})</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${d.percent}%`, backgroundColor: COLORS[j % COLORS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {qa.type === 'short_text' && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{qa.count} {t('text_responses') || 'text responses'}</p>
                  {(qa.textAnswers || []).slice(0, 5).map((txt: string, j: number) => (
                    <p key={j} className="text-xs bg-muted/50 p-2 rounded">{String(txt)}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QuestionAnalyticsTab({ mission, missions, visits, language }: { mission: ReportMission | null; missions: ReportMission[]; visits: ReportVisit[]; language: string }) {
  const { t } = useTranslation('reports');

  if (!mission) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileQuestion className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">{t('select_mission_for_questions') || 'Select a specific mission above to view per-question analytics.'}</p>
        </CardContent>
      </Card>
    );
  }

  const questions = mission.questions || [];
  const missionVisits = visits.filter(v => v.mission_id === mission.id);

  if (questions.length === 0) {
    return <Card><CardContent className="py-8 text-center text-muted-foreground">No questions configured.</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      {questions.map((q: any, i: number) => {
        const qText = typeof q.text === 'object' ? (language === 'ar' ? q.text.ar : q.text.en) : q.text;
        const answers = getAnswersForQuestion(missionVisits, q.id);

        return (
          <Card key={q.id || i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{qText}</CardTitle>
                <div className="flex items-center gap-1.5">
                  {isNPSLikeQuestion(q) && (
                    <Badge className="text-[10px] bg-primary/15 text-primary border-primary/30 hover:bg-primary/15">NPS</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">{q.type}</Badge>
                </div>
              </div>
              <CardDescription>{answers.length} responses</CardDescription>
            </CardHeader>
            <CardContent>
              {/* NPS visualization for recommend yes/no or 0-10 rating questions */}
              {isNPSLikeQuestion(q) === 'recommend_yesno' && (() => {
                const nps = calcNPSFromYesNo(answers);
                const color = nps.score < 0 ? 'text-destructive' : nps.score < 30 ? 'text-amber-500' : nps.score < 50 ? 'text-green-500' : 'text-green-700';
                const benchmark = nps.score >= 70 ? 'World-class' : nps.score >= 50 ? 'Excellent' : nps.score >= 30 ? 'Good' : nps.score >= 0 ? 'Needs Work' : 'Critical';
                return (
                  <div className="space-y-3 mb-4 p-3 border border-primary/30 bg-primary/5 rounded-md">
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">NPS Score</span>
                      <span className={`text-3xl font-black ${color}`}>{nps.score > 0 ? '+' : ''}{nps.score}</span>
                      <Badge variant="secondary" className="text-[10px]">{benchmark}</Badge>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600 font-semibold">Promoters (Yes)</span>
                        <span className="text-muted-foreground">{nps.promoterPct}% · {nps.promoters}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${nps.promoterPct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-destructive font-semibold">Detractors (No)</span>
                        <span className="text-muted-foreground">{nps.detractorPct}% · {nps.detractors}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-destructive h-2.5 rounded-full" style={{ width: `${nps.detractorPct}%` }} />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">NPS = % Promoters − % Detractors · Range: −100 to +100</p>
                  </div>
                );
              })()}
              {isNPSLikeQuestion(q) === 'rating10' && (() => {
                const nums = answers.map(Number).filter(n => !isNaN(n));
                const nps = calcNPS(nums);
                const color = nps.score < 0 ? 'text-destructive' : nps.score < 30 ? 'text-amber-500' : nps.score < 50 ? 'text-green-500' : 'text-green-700';
                const benchmark = nps.score >= 70 ? 'World-class' : nps.score >= 50 ? 'Excellent' : nps.score >= 30 ? 'Good' : nps.score >= 0 ? 'Needs Work' : 'Critical';
                const promoterPct = nps.total > 0 ? Math.round((nps.promoters / nps.total) * 100) : 0;
                const passivePct = nps.total > 0 ? Math.round((nps.passives / nps.total) * 100) : 0;
                const detractorPct = nps.total > 0 ? Math.round((nps.detractors / nps.total) * 100) : 0;
                return (
                  <div className="space-y-3 mb-4 p-3 border border-primary/30 bg-primary/5 rounded-md">
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">NPS Score</span>
                      <span className={`text-3xl font-black ${color}`}>{nps.score > 0 ? '+' : ''}{nps.score}</span>
                      <Badge variant="secondary" className="text-[10px]">{benchmark}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-green-600 font-semibold">Promoters (9-10)</p>
                        <p className="text-muted-foreground">{promoterPct}% · {nps.promoters}</p>
                      </div>
                      <div>
                        <p className="text-amber-500 font-semibold">Passives (7-8)</p>
                        <p className="text-muted-foreground">{passivePct}% · {nps.passives}</p>
                      </div>
                      <div>
                        <p className="text-destructive font-semibold">Detractors (0-6)</p>
                        <p className="text-muted-foreground">{detractorPct}% · {nps.detractors}</p>
                      </div>
                    </div>
                    <div className="flex w-full h-3 rounded-full overflow-hidden bg-muted">
                      <div className="bg-destructive" style={{ width: `${detractorPct}%` }} />
                      <div className="bg-amber-400" style={{ width: `${passivePct}%` }} />
                      <div className="bg-green-500" style={{ width: `${promoterPct}%` }} />
                    </div>
                  </div>
                );
              })()}
              {q.type === 'rating' && (() => {
                const nums = answers.map(Number).filter(n => !isNaN(n));
                const avg = calcAverage(nums);
                const dist = getRatingDistribution(nums, q.max_rating || 5);
                return (
                  <div className="flex gap-6 items-start">
                    <div>
                      <p className="text-3xl font-bold">{avg.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">/ {q.max_rating || 5}</p>
                      <p className="text-xs text-muted-foreground mt-1">T2B: {calcTop2Box(nums, q.max_rating || 5)}%</p>
                    </div>
                    <div className="flex-1 h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dist}>
                          <XAxis dataKey="rating" fontSize={10} />
                          <YAxis fontSize={10} />
                          <RechartsTooltip
                            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                            contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12 }}
                            formatter={(value: number) => [`${value} responses`, `Rating`]}
                            labelFormatter={(l) => `${l} ★`}
                          />
                          <Bar dataKey="count" fill={COLORS[0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })()}
              {q.type === 'yes_no' && (() => {
                const yp = calcYesPercent(answers);
                return (
                  <div className="space-y-2">
                    <div className="flex gap-6">
                      <span className="text-lg font-bold text-green-600">{yp}% Yes</span>
                      <span className="text-lg font-bold text-destructive">{100 - yp}% No</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-4">
                      <div className="bg-green-500 h-4 rounded-full" style={{ width: `${yp}%` }} />
                    </div>
                  </div>
                );
              })()}
              {q.type === 'multiple_choice' && (() => {
                const opts = (q.options || []).map((o: any) => typeof o.text === 'object' ? (language === 'ar' ? o.text.ar : o.text.en) : o.text);
                const optVals = (q.options || []).map((o: any) => typeof o.text === 'object' ? o.text.en : o.text);
                const total = answers.length;
                return (
                  <div className="space-y-2">
                    {optVals.map((ov: string, j: number) => {
                      const count = answers.filter(a => a === ov || a === opts[j]).length;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={j}>
                          <div className="flex justify-between text-sm mb-0.5">
                            <span>{opts[j]}</span>
                            <span className="text-muted-foreground">{pct}% ({count})</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-3">
                            <div className="h-3 rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[j % COLORS.length] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              {q.type === 'short_text' && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{answers.length} text responses</p>
                  {answers.slice(0, 10).map((a: any, j: number) => (
                    <p key={j} className="text-sm bg-muted/50 p-2 rounded">{String(a)}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}



function BudgetTab({ missions, visits }: { missions: ReportMission[]; visits: ReportVisit[] }) {
  const { t } = useTranslation('reports');
  const { t: tc } = useTranslation('common');

  const totalAllocated = missions.reduce((s, m) => s + m.total_purchase_budget, 0);
  const totalUsed = missions.reduce((s, m) => s + m.budget_used, 0);
  const remaining = totalAllocated - totalUsed;

  const completedVisits = visits.filter(v => v.status === 'approved' || v.status === 'submitted');
  const rejectedVisits = visits.filter(v => v.status === 'rejected');
  const rejectionRate = visits.length > 0 ? Math.round((rejectedVisits.length / visits.length) * 100) : 0;

  const responseTimes = completedVisits
    .filter(v => v.started_at && v.submitted_at)
    .map(v => (new Date(v.submitted_at!).getTime() - new Date(v.started_at!).getTime()) / (1000 * 60 * 60));
  const avgTime = responseTimes.length > 0 ? (responseTimes.reduce((s, t) => s + t, 0) / responseTimes.length).toFixed(1) : '0';
  const medianTime = responseTimes.length > 0 ? responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length / 2)].toFixed(1) : '0';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{t('budget_tab.total_allocated')}</p>
            <p className="text-2xl font-bold">{totalAllocated.toLocaleString()} <span className="text-sm text-muted-foreground">{tc('currency_code')}</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{t('budget_tab.total_used')}</p>
            <p className="text-2xl font-bold">{totalUsed.toLocaleString()} <span className="text-sm text-muted-foreground">{tc('currency_code')}</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{t('budget_tab.available_balance')}</p>
            <p className="text-2xl font-bold">{remaining.toLocaleString()} <span className="text-sm text-muted-foreground">{tc('currency_code')}</span></p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('response_time_analytics') || 'Response Time Analytics'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Average</p>
                <p className="text-xl font-bold">{avgTime}h</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Median</p>
                <p className="text-xl font-bold">{medianTime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('rejection_rate') || 'Visit Rejection Rate'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{rejectionRate}%</p>
            <p className="text-xs text-muted-foreground">{rejectedVisits.length} of {visits.length} visits rejected</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
