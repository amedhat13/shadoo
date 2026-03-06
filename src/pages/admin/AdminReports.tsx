import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, MapPin, UserCheck, DollarSign, Download, Calendar } from 'lucide-react';
import { useAdminReportsData } from '@/hooks/useAdminReportsData';
import { LoadingState } from '@/components/common/LoadingState';
import { OverviewTab } from '@/components/admin/reports/OverviewTab';
import { ClientAnalyticsTab } from '@/components/admin/reports/ClientAnalyticsTab';
import { AgentPerformanceTab } from '@/components/admin/reports/AgentPerformanceTab';
import { MissionAnalyticsTab } from '@/components/admin/reports/MissionAnalyticsTab';
import { GeographicTab } from '@/components/admin/reports/GeographicTab';
import { FinancialTab } from '@/components/admin/reports/FinancialTab';
import { exportAdminReportsToExcel } from '@/lib/exportAdminReports';

const DATE_PRESETS = [
  { value: 'this_month', months: 1 },
  { value: 'last_month', months: 1 },
  { value: 'last_3_months', months: 3 },
  { value: 'last_6_months', months: 6 },
  { value: 'this_year', months: 12 },
  { value: 'all_time', months: 0 },
];

function getDateRange(preset: string): { from: Date | null; to: Date } {
  const now = new Date();
  const to = new Date(now);
  
  if (preset === 'all_time') return { from: null, to };
  if (preset === 'this_month') {
    return { from: new Date(now.getFullYear(), now.getMonth(), 1), to };
  }
  if (preset === 'last_month') {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const toEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from, to: toEnd };
  }
  if (preset === 'last_3_months') {
    return { from: new Date(now.getFullYear(), now.getMonth() - 3, 1), to };
  }
  if (preset === 'last_6_months') {
    return { from: new Date(now.getFullYear(), now.getMonth() - 6, 1), to };
  }
  if (preset === 'this_year') {
    return { from: new Date(now.getFullYear(), 0, 1), to };
  }
  return { from: null, to };
}

export default function AdminReportsPage() {
  const { t } = useTranslation('admin');
  const { data, isLoading } = useAdminReportsData();
  const [activeTab, setActiveTab] = useState('overview');
  const [datePreset, setDatePreset] = useState('last_3_months');

  const handleExport = () => {
    if (!data) return;
    exportAdminReportsToExcel(data, activeTab, t);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title={t('reports.title')}
          description={t('reports.description')}
          actions={
            <div className="flex items-center gap-2">
              <Select value={datePreset} onValueChange={setDatePreset}>
                <SelectTrigger className="w-[180px] h-9">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this_month">{t('reports.date_this_month')}</SelectItem>
                  <SelectItem value="last_month">{t('reports.date_last_month')}</SelectItem>
                  <SelectItem value="last_3_months">{t('reports.date_last_3_months')}</SelectItem>
                  <SelectItem value="last_6_months">{t('reports.date_last_6_months')}</SelectItem>
                  <SelectItem value="this_year">{t('reports.date_this_year')}</SelectItem>
                  <SelectItem value="all_time">{t('reports.date_all_time')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={!data}>
                <Download className="h-4 w-4 mr-1" />
                {t('reports.export')}
              </Button>
            </div>
          }
        />

        {isLoading || !data ? (
          <LoadingState message={t('reports.loading')} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="flex-wrap">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('reports.tab_overview')}
              </TabsTrigger>
              <TabsTrigger value="clients" className="gap-2">
                <Users className="h-4 w-4" />
                {t('reports.tab_clients')}
              </TabsTrigger>
              <TabsTrigger value="agents" className="gap-2">
                <UserCheck className="h-4 w-4" />
                {t('reports.tab_agents')}
              </TabsTrigger>
              <TabsTrigger value="missions" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('reports.tab_missions')}
              </TabsTrigger>
              <TabsTrigger value="geographic" className="gap-2">
                <MapPin className="h-4 w-4" />
                {t('reports.tab_geographic')}
              </TabsTrigger>
              <TabsTrigger value="financial" className="gap-2">
                <DollarSign className="h-4 w-4" />
                {t('reports.tab_financial')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab data={{
                overview: data.overview,
                missionStatusDist: data.missionStatusDist,
                visitStatusDist: data.visitStatusDist,
                visitTrends: data.visitTrends,
                revenueTrends: data.revenueTrends,
                subscriptionDist: data.subscriptionDist,
              }} topClients={data.clientAnalytics.slice(0, 5)} topAgents={data.agentPerformance.slice(0, 5)} />
            </TabsContent>

            <TabsContent value="clients">
              <ClientAnalyticsTab data={data.clientAnalytics} />
            </TabsContent>

            <TabsContent value="agents">
              <AgentPerformanceTab
                agents={data.agentPerformance}
                tierDist={data.agentTierDist}
                statusDist={data.agentStatusDist}
              />
            </TabsContent>

            <TabsContent value="missions">
              <MissionAnalyticsTab data={{
                overview: data.overview,
                missionStatusDist: data.missionStatusDist,
                visitTrends: data.visitTrends,
              }} />
            </TabsContent>

            <TabsContent value="geographic">
              <GeographicTab
                geographicData={data.geographicData}
                branchStatusDist={data.branchStatusDist}
              />
            </TabsContent>

            <TabsContent value="financial">
              <FinancialTab data={{
                revenueTrends: data.revenueTrends,
                overview: data.overview,
                clientAnalytics: data.clientAnalytics,
              }} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
}
