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

    return { totalPlanned, totalCompleted, completionRate, totalAllocated, totalUsed, budgetEfficiency, activeMissions, verifiedBranches, avgResponseTime, primaryScore };
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
            {showMethodologyTab && (
              <TabsTrigger value="methodology" className="gap-2">
                <Activity className="h-4 w-4" />
                {t('tab_methodology') || 'Methodology Dashboard'}
              </TabsTrigger>
            )}
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
              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {selectedMission && (
                  <MetricCard
                    title={overviewMetrics.primaryScore.label}
                    value={`${overviewMetrics.primaryScore.score}`}
                    subtitle={overviewMetrics.primaryScore.benchmark || ''}
                    icon={<Target className="h-4 w-4" />}
                    className={overviewMetrics.primaryScore.color}
                  />
                )}
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

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Mission Status */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t('visits_tab.mission_status_dist')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {missionStatusDist.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={missionStatusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                              {missionStatusDist.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">{tc('no_data') || 'No data'}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Visit Completion by Mission */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t('visits_tab.completion_over_time')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {relevantMissions.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={relevantMissions.slice(0, 10).map(m => ({
                            name: (language === 'ar' && m.name_ar ? m.name_ar : m.name).slice(0, 15),
                            planned: m.number_of_visits,
                            completed: m.visits_completed,
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={10} />
                            <YAxis />
                            <Bar dataKey="planned" fill={COLORS[0]} name={t('chart_labels.planned')} />
                            <Bar dataKey="completed" fill={COLORS[1]} name={t('chart_labels.completed')} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">{tc('no_data') || 'No data'}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Methodology Dashboard Tab */}
          {showMethodologyTab && (
            <TabsContent value="methodology">
              <MethodologyDashboard
                mission={selectedMission!}
                visits={completedVisits}
                branches={branches}
                language={language}
              />
            </TabsContent>
          )}

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
            <BranchPerformanceTab
              missions={relevantMissions}
              visits={completedVisits}
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
                <Badge variant="outline" className="text-xs">{q.type}</Badge>
              </div>
              <CardDescription>{answers.length} responses</CardDescription>
            </CardHeader>
            <CardContent>
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

function BranchPerformanceTab({ missions, visits, branches, language }: { missions: ReportMission[]; visits: ReportVisit[]; branches: any[]; language: string }) {
  const { t } = useTranslation('reports');
  const verifiedBranches = branches.filter(b => b.status === 'verified');

  const branchData = useMemo(() => verifiedBranches.map(branch => {
    const branchMissions = missions.filter(m => m.branch_id === branch.id);
    const totalVisits = branchMissions.reduce((s, m) => s + m.number_of_visits, 0);
    const completedVisits = branchMissions.reduce((s, m) => s + m.visits_completed, 0);
    const completionRate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;
    const budgetUsed = branchMissions.reduce((s, m) => s + m.budget_used, 0);
    const budgetAllocated = branchMissions.reduce((s, m) => s + m.total_purchase_budget, 0);
    const budgetEfficiency = budgetAllocated > 0 ? Math.round((budgetUsed / budgetAllocated) * 100) : 0;

    const branchVisits = visits.filter(v => branchMissions.some(m => m.id === v.mission_id));
    const completedBV = branchVisits.filter(v => v.status === 'submitted' || v.status === 'approved');
    const responseTimes = completedBV
      .filter(v => v.started_at && v.submitted_at)
      .map(v => (new Date(v.submitted_at!).getTime() - new Date(v.started_at!).getTime()) / (1000 * 60 * 60));
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((s, t) => s + t, 0) / responseTimes.length * 10) / 10
      : 0;

    return {
      id: branch.id,
      name: language === 'ar' && branch.name_ar ? branch.name_ar : branch.name,
      city: branch.city,
      totalVisits,
      completedVisits,
      completionRate,
      budgetUsed,
      budgetAllocated,
      budgetEfficiency,
      avgResponseTime,
      missionCount: branchMissions.length,
    };
  }).filter(b => b.totalVisits > 0 || b.missionCount > 0), [verifiedBranches, missions, visits, language]);

  if (branchData.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">{t('no_branch_data') || 'No branch data available. Assign missions to branches to see comparisons.'}</p>
        </CardContent>
      </Card>
    );
  }

  const sortedByVisits = [...branchData].sort((a, b) => b.completedVisits - a.completedVisits);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{t('total_branches') || 'Branches with Data'}</p>
            <p className="text-2xl font-bold">{branchData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{t('best_completion') || 'Best Completion Rate'}</p>
            <p className="text-2xl font-bold text-green-600">{Math.max(...branchData.map(b => b.completionRate))}%</p>
            <p className="text-xs text-muted-foreground truncate">{[...branchData].sort((a, b) => b.completionRate - a.completionRate)[0]?.name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{t('fastest_response') || 'Fastest Avg Response'}</p>
            {(() => {
              const withTime = branchData.filter(b => b.avgResponseTime > 0);
              const fastest = withTime.length > 0 ? [...withTime].sort((a, b) => a.avgResponseTime - b.avgResponseTime)[0] : null;
              return fastest ? (
                <>
                  <p className="text-2xl font-bold text-primary">{fastest.avgResponseTime}h</p>
                  <p className="text-xs text-muted-foreground truncate">{fastest.name}</p>
                </>
              ) : <p className="text-2xl font-bold">-</p>;
            })()}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{t('highest_budget') || 'Highest Budget Used'}</p>
            <p className="text-2xl font-bold">{Math.max(...branchData.map(b => b.budgetUsed)).toLocaleString()} <span className="text-sm text-muted-foreground">EGP</span></p>
            <p className="text-xs text-muted-foreground truncate">{[...branchData].sort((a, b) => b.budgetUsed - a.budgetUsed)[0]?.name}</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('branch_visit_comparison') || 'Visit Completion by Branch'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedByVisits.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={10} />
                  <YAxis type="category" dataKey="name" fontSize={10} width={100} tick={{ width: 90 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="totalVisits" fill={COLORS[0]} name={t('chart_labels.planned') || 'Planned'} />
                  <Bar dataKey="completedVisits" fill={COLORS[1]} name={t('chart_labels.completed') || 'Completed'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('branch_completion_rate') || 'Completion Rate by Branch'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...branchData].sort((a, b) => b.completionRate - a.completionRate).slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} fontSize={10} />
                  <YAxis type="category" dataKey="name" fontSize={10} width={100} tick={{ width: 90 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completionRate" name={t('completion_rate') || 'Completion %'}>
                    {[...branchData].sort((a, b) => b.completionRate - a.completionRate).slice(0, 10).map((b, i) => (
                      <Cell key={i} fill={b.completionRate >= 80 ? '#22C55E' : b.completionRate >= 50 ? '#F59E0B' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('branch_budget_comparison') || 'Budget Usage by Branch'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...branchData].sort((a, b) => b.budgetUsed - a.budgetUsed).slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={10} />
                  <YAxis type="category" dataKey="name" fontSize={10} width={100} tick={{ width: 90 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="budgetAllocated" fill={COLORS[3]} name={t('chart_labels.allocated') || 'Allocated'} />
                  <Bar dataKey="budgetUsed" fill={COLORS[0]} name={t('chart_labels.used') || 'Used'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('branch_response_time') || 'Avg Response Time by Branch'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData.filter(b => b.avgResponseTime > 0).sort((a, b) => a.avgResponseTime - b.avgResponseTime).slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={10} />
                  <YAxis type="category" dataKey="name" fontSize={10} width={100} tick={{ width: 90 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avgResponseTime" name={t('avg_response_time') || 'Avg Time (h)'}>
                    {branchData.filter(b => b.avgResponseTime > 0).sort((a, b) => a.avgResponseTime - b.avgResponseTime).slice(0, 10).map((b, i) => (
                      <Cell key={i} fill={b.avgResponseTime <= 2 ? '#22C55E' : b.avgResponseTime <= 5 ? '#F59E0B' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('performance_tab.branch_details') || 'Branch Details'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-start p-2 font-medium">{t('branch') || 'Branch'}</th>
                  <th className="text-start p-2 font-medium">{t('city') || 'City'}</th>
                  <th className="text-end p-2 font-medium">{t('missions') || 'Missions'}</th>
                  <th className="text-end p-2 font-medium">{t('chart_labels.planned') || 'Planned'}</th>
                  <th className="text-end p-2 font-medium">{t('chart_labels.completed') || 'Completed'}</th>
                  <th className="text-end p-2 font-medium">{t('completion_rate') || 'Rate'}</th>
                  <th className="text-end p-2 font-medium">{t('avg_response_time') || 'Avg Time'}</th>
                  <th className="text-end p-2 font-medium">{t('budget') || 'Budget Used'}</th>
                  <th className="text-end p-2 font-medium">{t('budget_efficiency') || 'Budget %'}</th>
                </tr>
              </thead>
              <tbody>
                {[...branchData].sort((a, b) => b.completedVisits - a.completedVisits).map((b, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-2 font-medium">{b.name}</td>
                    <td className="p-2 text-muted-foreground">{b.city}</td>
                    <td className="p-2 text-end">{b.missionCount}</td>
                    <td className="p-2 text-end">{b.totalVisits}</td>
                    <td className="p-2 text-end">{b.completedVisits}</td>
                    <td className="p-2 text-end">
                      <Badge variant={b.completionRate >= 80 ? 'default' : b.completionRate >= 50 ? 'secondary' : 'destructive'} className="text-xs">
                        {b.completionRate}%
                      </Badge>
                    </td>
                    <td className="p-2 text-end">{b.avgResponseTime > 0 ? `${b.avgResponseTime}h` : '-'}</td>
                    <td className="p-2 text-end">{b.budgetUsed.toLocaleString()} EGP</td>
                    <td className="p-2 text-end">{b.budgetEfficiency}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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
