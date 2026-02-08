import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { StatCard } from '@/components/admin/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, Building2, ClipboardList, UserCheck, ClipboardCheck,
  Wallet, Clock, CheckCircle2, AlertTriangle, ArrowRight, Eye,
} from 'lucide-react';
import { useAdminDashboardStats } from '@/hooks/useAdminDashboardStats';
import { useTranslation } from 'react-i18next';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useAdminDashboardStats();
  const { t } = useTranslation('admin');

  const actionItems = [
    {
      title: t('dashboard.visits_pending_review'),
      count: stats?.visits.submitted || 0,
      description: t('dashboard.agent_submissions_awaiting'),
      href: '/admin/visits',
      icon: ClipboardCheck,
      variant: 'warning' as const,
      urgent: true,
    },
    {
      title: t('dashboard.agent_applications'),
      count: stats?.agents.pending || 0,
      description: t('dashboard.new_agents_awaiting'),
      href: '/admin/agents',
      icon: UserCheck,
      variant: 'warning' as const,
      urgent: (stats?.agents.pending || 0) > 0,
    },
    {
      title: t('dashboard.branch_verifications'),
      count: stats?.branches.pending || 0,
      description: t('dashboard.branches_awaiting'),
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
        <AdminPageHeader title={t('dashboard.title')} description={t('dashboard.description')} />

        {urgentActions.length > 0 && (
          <Card className="border-warning bg-warning/5">
            <CardHeader className="pb-2 px-3 md:px-6">
              <CardTitle className="flex flex-wrap items-center gap-2 text-sm md:text-base font-bold">
                <AlertTriangle className="h-4 w-4 text-warning" />
                {t('dashboard.action_required')}
                <Badge variant="secondary" className="ms-1 md:ms-2">
                  {urgentActions.reduce((sum, a) => sum + a.count, 0)} {t('dashboard.pending')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <div className="grid gap-2 md:gap-3 md:grid-cols-3">
                {actionItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className="flex items-center justify-between p-2 md:p-3 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-start group"
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
                      <span className={`text-base md:text-lg font-bold ${item.count > 0 ? 'text-warning' : 'text-muted-foreground'}`}>{item.count}</span>
                      <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <Card key={i} className="border"><CardContent className="p-3 md:p-4"><Skeleton className="h-3 md:h-4 w-20 md:w-24 mb-2" /><Skeleton className="h-6 md:h-8 w-12 md:w-16 mb-1" /><Skeleton className="h-2 md:h-3 w-24 md:w-32" /></CardContent></Card>
            ))
          ) : (
            <>
              <StatCard title={t('dashboard.total_clients')} value={stats?.clients.total || 0} description={t('dashboard.organizations')} icon={Users} href="/admin/clients" />
              <StatCard title={t('dashboard.active_missions')} value={stats?.missions.published || 0} description={t('dashboard.total_label', { count: stats?.missions.total || 0 })} icon={ClipboardList} href="/admin/missions" />
              <StatCard title={t('dashboard.active_agents')} value={stats?.agents.active || 0} description={t('dashboard.registered', { count: stats?.agents.total || 0 })} icon={UserCheck} href="/admin/agents" />
              <StatCard title={t('dashboard.verified_branches')} value={stats?.branches.verified || 0} description={t('dashboard.total_label', { count: stats?.branches.total || 0 })} icon={Building2} href="/admin/branches" />
            </>
          )}
        </div>

        {/* Visit Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
          <StatCard title={t('dashboard.pending_review')} value={stats?.visits.submitted || 0} description={t('dashboard.awaiting_approval')} icon={Clock} variant="warning" href="/admin/visits" />
          <StatCard title={t('dashboard.approved')} value={stats?.visits.approved || 0} description={t('dashboard.completed_label')} icon={CheckCircle2} variant="success" href="/admin/visits" />
          <StatCard title={t('dashboard.in_progress')} value={stats?.visits.inProgress || 0} description={t('dashboard.active_now')} icon={Eye} href="/admin/visits" />
          <StatCard title={t('dashboard.total_visits')} value={stats?.visits.total || 0} description={t('dashboard.all_time')} icon={ClipboardCheck} href="/admin/visits" />
        </div>

        {/* Quick Links */}
        <div className="grid gap-3 md:gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-sm md:text-base font-bold uppercase">{t('dashboard.quick_actions')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start gap-2 h-auto py-2.5 md:py-3 text-start" onClick={() => navigate('/admin/visits')}>
                <ClipboardCheck className="h-4 w-4 shrink-0" />
                <div className="min-w-0"><div className="text-sm font-semibold">{t('dashboard.review_visits')}</div><div className="text-[10px] md:text-xs text-muted-foreground">{t('dashboard.approve_submissions')}</div></div>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-2.5 md:py-3 text-start" onClick={() => navigate('/admin/agents')}>
                <UserCheck className="h-4 w-4 shrink-0" />
                <div className="min-w-0"><div className="text-sm font-semibold">{t('dashboard.manage_agents')}</div><div className="text-[10px] md:text-xs text-muted-foreground">{t('dashboard.verify_approve')}</div></div>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-2.5 md:py-3 text-start" onClick={() => navigate('/admin/branches')}>
                <Building2 className="h-4 w-4 shrink-0" />
                <div className="min-w-0"><div className="text-sm font-semibold">{t('dashboard.verify_branches')}</div><div className="text-[10px] md:text-xs text-muted-foreground">{t('dashboard.location_approval')}</div></div>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-2.5 md:py-3 text-start" onClick={() => navigate('/admin/payouts')}>
                <Wallet className="h-4 w-4 shrink-0" />
                <div className="min-w-0"><div className="text-sm font-semibold">{t('dashboard.process_payouts')}</div><div className="text-[10px] md:text-xs text-muted-foreground">{t('dashboard.agent_withdrawals')}</div></div>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-sm md:text-base font-bold uppercase">{t('dashboard.platform_summary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between text-xs md:text-sm border-b border-border pb-2">
                <span className="text-muted-foreground">{t('dashboard.draft_missions')}</span>
                <span className="font-bold">{stats?.missions.draft || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm border-b border-border pb-2">
                <span className="text-muted-foreground">{t('dashboard.completed_missions')}</span>
                <span className="font-bold">{stats?.missions.completed || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm border-b border-border pb-2">
                <span className="text-muted-foreground">{t('dashboard.suspended_agents')}</span>
                <span className="font-bold text-destructive">{stats?.agents.suspended || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">{t('dashboard.rejected_branches')}</span>
                <span className="font-bold">{stats?.branches.rejected || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}