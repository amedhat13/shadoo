import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/admin/common/StatCard';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { Users, ClipboardList, UserCheck, MapPin, DollarSign, TrendingUp, Eye, Clock, Star, Activity } from 'lucide-react';

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
  topClients?: { id: string; name: string; missions: number; completedVisits: number; budgetUsed: number }[];
  topAgents?: { id: string; name: string; tier: string; completedVisits: number; rating: number; totalEarnings: number }[];
}

export function OverviewTab({ data, topClients, topAgents }: OverviewTabProps) {
  const { t } = useTranslation('admin');
  const { t: tCommon } = useTranslation('common');
  const { isRTL } = useLanguage();
  const currencyCode = tCommon('currency_code');
  const { overview, missionStatusDist, visitStatusDist, visitTrends, revenueTrends, subscriptionDist } = data;

  const completionRate = overview.totalVisits > 0
    ? Math.round((overview.completedVisits / overview.totalVisits) * 100) : 0;
  const budgetUtil = overview.totalBudgetAllocated > 0
    ? Math.round((overview.totalBudgetUsed / overview.totalBudgetAllocated) * 100) : 0;
  
  // Platform Health Score (composite)
  const visitApprovalRate = overview.totalVisits > 0 ? overview.completedVisits / overview.totalVisits : 0;
  const missionCompletionRate = overview.totalMissions > 0 ? (overview.activeMissions + overview.completedVisits) / overview.totalMissions : 0;
  const healthScore = Math.min(100, Math.round((visitApprovalRate * 40 + Math.min(missionCompletionRate, 1) * 30 + (budgetUtil / 100) * 30)));

  const fmt = (n: number) => n.toLocaleString(isRTL ? 'ar-EG' : 'en');

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title={t('reports.overview.total_clients')} value={overview.totalClients} icon={Users} href="/admin/clients" />
        <StatCard title={t('reports.overview.active_agents')} value={`${overview.activeAgents}/${overview.totalAgents}`} icon={UserCheck} href="/admin/agents" />
        <StatCard title={t('reports.overview.total_missions')} value={`${overview.activeMissions}/${overview.totalMissions}`} icon={ClipboardList} href="/admin/missions" />
        <StatCard title={t('reports.overview.total_visits')} value={overview.totalVisits} icon={Eye} description={t('reports.overview.approved_pct', { pct: completionRate })} href="/admin/visits" />
        <StatCard title={t('reports.overview.total_revenue')} value={`${fmt(overview.totalRevenue)} ${currencyCode}`} icon={DollarSign} variant="success" />
        <StatCard title={t('reports.overview.platform_health')} value={`${healthScore}/100`} icon={Activity} variant={healthScore >= 70 ? 'success' : healthScore >= 40 ? 'warning' : 'default'} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="text-start">
            <CardTitle className="text-base font-bold uppercase">{t('reports.overview.visit_trends')}</CardTitle>
            <CardDescription>{t('reports.overview.visit_trends_desc')}</CardDescription>
          </CardHeader>
          <CardContent dir="ltr">
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
            ) : <div className="h-[280px] flex items-center justify-center text-muted-foreground">{t('reports.overview.no_visit_data')}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-start">
            <CardTitle className="text-base font-bold uppercase">{t('reports.overview.revenue_trends')}</CardTitle>
            <CardDescription>{t('reports.overview.revenue_trends_desc')}</CardDescription>
          </CardHeader>
          <CardContent dir="ltr">
            {revenueTrends.length > 0 ? (
              <ChartContainer config={{
                topups: { label: t('reports.overview.chart_topups'), color: '#22C55E' },
                spend: { label: t('reports.overview.chart_spend'), color: '#F97316' },
              }} className="h-[280px] w-full">
                <AreaChart data={revenueTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="topups" stroke="#22C55E" fill="#22C55E" fillOpacity={0.5} />
                  <Area type="monotone" dataKey="spend" stroke="#F97316" fill="#F97316" fillOpacity={0.3} />
                </AreaChart>
              </ChartContainer>
            ) : <div className="h-[280px] flex items-center justify-center text-muted-foreground">{t('reports.overview.no_transaction_data')}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="text-start"><CardTitle className="text-base font-bold uppercase">{t('reports.overview.mission_status')}</CardTitle></CardHeader>
          <CardContent dir="ltr">
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
          <CardHeader className="text-start"><CardTitle className="text-base font-bold uppercase">{t('reports.overview.visit_status')}</CardTitle></CardHeader>
          <CardContent dir="ltr">
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
          <CardHeader className="text-start"><CardTitle className="text-base font-bold uppercase">{t('reports.overview.subscriptions')}</CardTitle></CardHeader>
          <CardContent dir="ltr">
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

      {/* Leaderboards Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="text-start">
            <CardTitle className="text-base font-bold uppercase">{t('reports.overview.top_clients')}</CardTitle>
            <CardDescription>{t('reports.overview.top_clients_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{t('reports.col_client')}</TableHead>
                  <TableHead className="text-center">{t('reports.col_missions')}</TableHead>
                  <TableHead className="text-center">{t('reports.col_approved')}</TableHead>
                  <TableHead className="text-end">{t('reports.col_budget_used')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(topClients || []).length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">{t('reports.no_client_data')}</TableCell></TableRow>
                ) : (topClients || []).map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-start">{c.name}</TableCell>
                    <TableCell className="text-center">{c.missions}</TableCell>
                    <TableCell className="text-center"><Badge variant="default" className="bg-success/10 text-success border-success/20">{c.completedVisits}</Badge></TableCell>
                    <TableCell className="text-end">{fmt(c.budgetUsed)} {currencyCode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-start">
            <CardTitle className="text-base font-bold uppercase">{t('reports.overview.top_agents')}</CardTitle>
            <CardDescription>{t('reports.overview.top_agents_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{t('reports.agents.col_agent')}</TableHead>
                  <TableHead className="text-center">{t('reports.agents.col_tier')}</TableHead>
                  <TableHead className="text-center">{t('reports.agents.col_rating')}</TableHead>
                  <TableHead className="text-end">{t('reports.agents.col_earnings')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(topAgents || []).length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">{t('reports.agents.no_agents')}</TableCell></TableRow>
                ) : (topAgents || []).map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-start">{a.name}</TableCell>
                    <TableCell className="text-center"><Badge variant="outline">{a.tier}</Badge></TableCell>
                    <TableCell className="text-center">
                      {a.rating > 0 ? <span className="flex items-center justify-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{a.rating.toFixed(1)}</span> : '—'}
                    </TableCell>
                    <TableCell className="text-end">{fmt(a.totalEarnings)} {currencyCode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
