import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { StatCard } from '@/components/admin/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Building2, 
  ClipboardList, 
  UserCheck, 
  ClipboardCheck,
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useAdminDashboardStats } from '@/hooks/useAdminDashboardStats';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useAdminDashboardStats();

  const actionItems = [
    {
      title: 'Visits Pending Review',
      count: stats?.visits.submitted || 0,
      description: 'Agent submissions awaiting approval',
      href: '/admin/visits',
      icon: ClipboardCheck,
      variant: 'warning' as const,
      urgent: true,
    },
    {
      title: 'Agent Applications',
      count: stats?.agents.pending || 0,
      description: 'New agents awaiting verification',
      href: '/admin/agents',
      icon: UserCheck,
      variant: 'warning' as const,
      urgent: (stats?.agents.pending || 0) > 0,
    },
    {
      title: 'Branch Verifications',
      count: stats?.branches.pending || 0,
      description: 'Branches awaiting verification',
      href: '/admin/branches',
      icon: Building2,
      variant: 'default' as const,
      urgent: (stats?.branches.pending || 0) > 0,
    },
  ];

  const urgentActions = actionItems.filter(a => a.count > 0);

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <AdminPageHeader
          title="Dashboard"
          description="Platform overview and pending actions."
        />

        {/* Urgent Actions Banner */}
        {urgentActions.length > 0 && (
          <Card className="border-warning bg-warning/5">
            <CardHeader className="pb-2 px-3 md:px-6">
              <CardTitle className="flex flex-wrap items-center gap-2 text-sm md:text-base font-bold">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Action Required
                <Badge variant="secondary" className="ml-1 md:ml-2">
                  {urgentActions.reduce((sum, a) => sum + a.count, 0)} pending
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <div className="grid gap-2 md:gap-3 md:grid-cols-3">
                {actionItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className="flex items-center justify-between p-2 md:p-3 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <div className={`p-1.5 md:p-2 rounded-md shrink-0 ${item.count > 0 ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                        <item.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-semibold truncate">{item.title}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground truncate hidden sm:block">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 shrink-0">
                      <span className={`text-base md:text-lg font-bold ${item.count > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                        {item.count}
                      </span>
                      <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Stats - Clickable */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border">
                  <CardContent className="p-3 md:p-4">
                    <Skeleton className="h-3 md:h-4 w-20 md:w-24 mb-2" />
                    <Skeleton className="h-6 md:h-8 w-12 md:w-16 mb-1" />
                    <Skeleton className="h-2 md:h-3 w-24 md:w-32" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Clients"
                value={stats?.clients.total || 0}
                description="Organizations"
                icon={Users}
                href="/admin/clients"
              />
              <StatCard
                title="Active Missions"
                value={stats?.missions.published || 0}
                description={`${stats?.missions.total || 0} total`}
                icon={ClipboardList}
                href="/admin/missions"
              />
              <StatCard
                title="Active Agents"
                value={stats?.agents.active || 0}
                description={`${stats?.agents.total || 0} registered`}
                icon={UserCheck}
                href="/admin/agents"
              />
              <StatCard
                title="Verified Branches"
                value={stats?.branches.verified || 0}
                description={`${stats?.branches.total || 0} total`}
                icon={Building2}
                href="/admin/branches"
              />
            </>
          )}
        </div>

        {/* Visit Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
          <StatCard
            title="Pending Review"
            value={stats?.visits.submitted || 0}
            description="Awaiting approval"
            icon={Clock}
            variant="warning"
            href="/admin/visits"
          />
          <StatCard
            title="Approved"
            value={stats?.visits.approved || 0}
            description="Completed"
            icon={CheckCircle2}
            variant="success"
            href="/admin/visits"
          />
          <StatCard
            title="In Progress"
            value={stats?.visits.inProgress || 0}
            description="Active now"
            icon={Eye}
            href="/admin/visits"
          />
          <StatCard
            title="Total Visits"
            value={stats?.visits.total || 0}
            description="All time"
            icon={ClipboardCheck}
            href="/admin/visits"
          />
        </div>

        {/* Quick Links */}
        <div className="grid gap-3 md:gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-sm md:text-base font-bold uppercase">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-2.5 md:py-3 text-left"
                onClick={() => navigate('/admin/visits')}
              >
                <ClipboardCheck className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Review Visits</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">Approve submissions</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-2.5 md:py-3 text-left"
                onClick={() => navigate('/admin/agents')}
              >
                <UserCheck className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Manage Agents</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">Verify & approve</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-2.5 md:py-3 text-left"
                onClick={() => navigate('/admin/branches')}
              >
                <Building2 className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Verify Branches</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">Location approval</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-2.5 md:py-3 text-left"
                onClick={() => navigate('/admin/payouts')}
              >
                <Wallet className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Process Payouts</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">Agent withdrawals</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-sm md:text-base font-bold uppercase">Platform Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between text-xs md:text-sm border-b border-border pb-2">
                <span className="text-muted-foreground">Draft Missions</span>
                <span className="font-bold">{stats?.missions.draft || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm border-b border-border pb-2">
                <span className="text-muted-foreground">Completed Missions</span>
                <span className="font-bold">{stats?.missions.completed || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm border-b border-border pb-2">
                <span className="text-muted-foreground">Suspended Agents</span>
                <span className="font-bold text-destructive">{stats?.agents.suspended || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Rejected Branches</span>
                <span className="font-bold">{stats?.branches.rejected || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
