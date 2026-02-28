import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/admin/common/StatCard';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ClipboardList, CheckCircle, DollarSign, Target } from 'lucide-react';

interface MissionAnalyticsTabProps {
  data: {
    overview: {
      totalMissions: number; activeMissions: number; completedVisits: number;
      totalVisits: number; totalBudgetAllocated: number; totalBudgetUsed: number;
    };
    missionStatusDist: { name: string; value: number; color: string }[];
    visitTrends: { month: string; total: number; approved: number; rejected: number; submitted: number }[];
  };
}

export function MissionAnalyticsTab({ data }: MissionAnalyticsTabProps) {
  const { t } = useTranslation('admin');
  const { t: tCommon } = useTranslation('common');
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const currencyCode = tCommon('currency_code');
  const { overview, missionStatusDist, visitTrends } = data;

  const budgetUtil = overview.totalBudgetAllocated > 0
    ? Math.round((overview.totalBudgetUsed / overview.totalBudgetAllocated) * 100) : 0;
  const visitApprovalRate = overview.totalVisits > 0
    ? Math.round((overview.completedVisits / overview.totalVisits) * 100) : 0;
  const fmt = (n: number) => n.toLocaleString(isRTL ? 'ar-EG' : 'en');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('reports.missions_tab.total_missions')} value={overview.totalMissions} icon={ClipboardList} />
        <StatCard title={t('reports.missions_tab.active_now')} value={overview.activeMissions} icon={Target} variant="warning" />
        <StatCard title={t('reports.missions_tab.visit_approval_rate')} value={`${visitApprovalRate}%`} icon={CheckCircle} variant="success" />
        <StatCard title={t('reports.missions_tab.budget_utilization')} value={`${budgetUtil}%`} icon={DollarSign} description={`${fmt(overview.totalBudgetUsed)} / ${fmt(overview.totalBudgetAllocated)} ${currencyCode}`} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base font-bold uppercase">{t('reports.missions_tab.mission_status_dist')}</CardTitle></CardHeader>
          <CardContent>
            {missionStatusDist.length > 0 ? (
              <ChartContainer config={{}} className="h-[280px] w-full">
                <PieChart>
                  <Pie data={missionStatusDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {missionStatusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : <div className="h-[280px] flex items-center justify-center text-muted-foreground">{t('reports.missions_tab.no_missions')}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase">{t('reports.missions_tab.visit_outcomes')}</CardTitle>
            <CardDescription>{t('reports.missions_tab.visit_outcomes_desc')}</CardDescription>
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
                  <Area type="monotone" dataKey="approved" stroke="#22C55E" fill="#22C55E" fillOpacity={0.5} />
                  <Area type="monotone" dataKey="submitted" stroke="#F97316" fill="#F97316" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="rejected" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                </AreaChart>
              </ChartContainer>
            ) : <div className="h-[280px] flex items-center justify-center text-muted-foreground">{t('reports.missions_tab.no_visit_data')}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
