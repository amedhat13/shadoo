import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/admin/common/StatCard';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { Users, ClipboardList, UserCheck, MapPin, DollarSign, TrendingUp, Eye, Clock } from 'lucide-react';

interface OverviewTabProps {
  data: {
    overview: {
      totalClients: number; totalMissions: number; totalAgents: number; totalBranches: number;
      totalVisits: number; activeMissions: number; completedVisits: number; pendingVisits: number;
      totalRevenue: number; totalBudgetAllocated: number; totalBudgetUsed: number;
      activeAgents: number; pendingAgents: number;
    };
    missionStatusDist: { name: string; value: number; color: string }[];
    visitStatusDist: { name: string; value: number; color: string }[];
    visitTrends: { month: string; total: number; approved: number; rejected: number; submitted: number }[];
    revenueTrends: { month: string; topups: number; spend: number }[];
    subscriptionDist: { name: string; value: number; color: string }[];
  };
}

export function OverviewTab({ data }: OverviewTabProps) {
  const { t } = useTranslation('admin');
  const { t: tCommon } = useTranslation('common');
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const currencyCode = tCommon('currency_code');
  const { overview, missionStatusDist, visitStatusDist, visitTrends, revenueTrends, subscriptionDist } = data;

  const completionRate = overview.totalVisits > 0
    ? Math.round((overview.completedVisits / overview.totalVisits) * 100) : 0;
  const budgetUtil = overview.totalBudgetAllocated > 0
    ? Math.round((overview.totalBudgetUsed / overview.totalBudgetAllocated) * 100) : 0;

  const fmt = (n: number) => n.toLocaleString(isRTL ? 'ar-EG' : 'en');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('reports.overview.total_clients')} value={overview.totalClients} icon={Users} href="/admin/clients" />
        <StatCard title={t('reports.overview.total_missions')} value={overview.totalMissions} icon={ClipboardList} description={t('reports.overview.active_label', { count: overview.activeMissions })} href="/admin/missions" />
        <StatCard title={t('reports.overview.active_agents')} value={overview.activeAgents} icon={UserCheck} description={t('reports.overview.pending_approval', { count: overview.pendingAgents })} href="/admin/agents" />
        <StatCard title={t('reports.overview.total_branches')} value={overview.totalBranches} icon={MapPin} href="/admin/branches" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('reports.overview.total_visits')} value={overview.totalVisits} icon={Eye} description={t('reports.overview.approved_pct', { pct: completionRate })} href="/admin/visits" />
        <StatCard title={t('reports.overview.pending_reviews')} value={overview.pendingVisits} icon={Clock} variant="warning" href="/admin/visits" />
        <StatCard title={t('reports.overview.total_revenue')} value={`${fmt(overview.totalRevenue)} ${currencyCode}`} icon={DollarSign} variant="success" />
        <StatCard title={t('reports.overview.budget_utilization')} value={`${budgetUtil}%`} icon={TrendingUp} description={`${fmt(overview.totalBudgetUsed)} / ${fmt(overview.totalBudgetAllocated)} ${currencyCode}`} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">{t('reports.overview.visit_trends')}</CardTitle>
            <CardDescription>{t('reports.overview.visit_trends_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {visitTrends.length > 0 ? (
              <ChartContainer config={{
                approved: { label: t('reports.overview.chart_approved'), color: '#22C55E' },
                rejected: { label: t('reports.overview.chart_rejected'), color: '#EF4444' },
                submitted: { label: t('reports.overview.chart_submitted'), color: '#F97316' },
              }} className="h-[280px] w-full">
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
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">{t('reports.overview.no_visit_data')}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">{t('reports.overview.revenue_trends')}</CardTitle>
            <CardDescription>{t('reports.overview.revenue_trends_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueTrends.length > 0 ? (
              <ChartContainer config={{
                topups: { label: t('reports.overview.chart_topups'), color: '#22C55E' },
                spend: { label: t('reports.overview.chart_spend'), color: '#F97316' },
              }} className="h-[280px] w-full">
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
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">{t('reports.overview.no_transaction_data')}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base font-bold uppercase">{t('reports.overview.mission_status')}</CardTitle></CardHeader>
          <CardContent>
            {missionStatusDist.length > 0 ? (
              <ChartContainer config={{}} className="h-[220px] w-full">
                <PieChart>
                  <Pie data={missionStatusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {missionStatusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : <div className="h-[220px] flex items-center justify-center text-muted-foreground">{t('reports.overview.no_missions')}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base font-bold uppercase">{t('reports.overview.visit_status')}</CardTitle></CardHeader>
          <CardContent>
            {visitStatusDist.length > 0 ? (
              <ChartContainer config={{}} className="h-[220px] w-full">
                <PieChart>
                  <Pie data={visitStatusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {visitStatusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : <div className="h-[220px] flex items-center justify-center text-muted-foreground">{t('reports.overview.no_visits')}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base font-bold uppercase">{t('reports.overview.subscriptions')}</CardTitle></CardHeader>
          <CardContent>
            {subscriptionDist.length > 0 ? (
              <ChartContainer config={{}} className="h-[220px] w-full">
                <PieChart>
                  <Pie data={subscriptionDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {subscriptionDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : <div className="h-[220px] flex items-center justify-center text-muted-foreground">{t('reports.overview.no_subscriptions')}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
