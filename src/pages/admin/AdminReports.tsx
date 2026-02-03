import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, MapPin, Download, Calendar } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminPageHeader
          title="Reports & Analytics"
          description="Platform insights and performance metrics."
          actions={
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          }
        />

        {/* Report Categories */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4" />
              Client Analytics
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-2">
              <Users className="h-4 w-4" />
              Agent Performance
            </TabsTrigger>
            <TabsTrigger value="missions" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Mission Analytics
            </TabsTrigger>
            <TabsTrigger value="geographic" className="gap-2">
              <MapPin className="h-4 w-4" />
              Geographic
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold uppercase">Platform Growth</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                  [Chart: Monthly signups, active users, revenue]
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold uppercase">Visit Completion Rate</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                  [Chart: Daily/weekly completion trends]
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold uppercase">Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                  [Chart: Subscriptions vs Topups pie chart]
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold uppercase">Agent Tier Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                  [Chart: Tier A/B/C distribution]
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Client Analytics</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
                Client acquisition, retention, churn analytics will be shown here.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Agent Performance</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
                Top agents, rating trends, completion rates will be shown here.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="missions">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Mission Analytics</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
                Mission creation, completion, and budget analytics will be shown here.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geographic">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold uppercase">Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
                Branches and missions by city/region will be shown here.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
