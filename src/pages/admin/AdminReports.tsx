import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, MapPin, UserCheck } from 'lucide-react';
import { useAdminReportsData } from '@/hooks/useAdminReportsData';
import { LoadingState } from '@/components/common/LoadingState';
import { OverviewTab } from '@/components/admin/reports/OverviewTab';
import { ClientAnalyticsTab } from '@/components/admin/reports/ClientAnalyticsTab';
import { AgentPerformanceTab } from '@/components/admin/reports/AgentPerformanceTab';
import { MissionAnalyticsTab } from '@/components/admin/reports/MissionAnalyticsTab';
import { GeographicTab } from '@/components/admin/reports/GeographicTab';

export default function AdminReportsPage() {
  const { data, isLoading } = useAdminReportsData();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Reports & Analytics"
          description="Platform-wide insights across clients, agents, missions, and branches."
        />

        {isLoading || !data ? (
          <LoadingState message="Loading reports..." />
        ) : (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="flex-wrap">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="clients" className="gap-2">
                <Users className="h-4 w-4" />
                Clients
              </TabsTrigger>
              <TabsTrigger value="agents" className="gap-2">
                <UserCheck className="h-4 w-4" />
                Agents
              </TabsTrigger>
              <TabsTrigger value="missions" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Missions
              </TabsTrigger>
              <TabsTrigger value="geographic" className="gap-2">
                <MapPin className="h-4 w-4" />
                Geographic
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
              }} />
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
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
}
