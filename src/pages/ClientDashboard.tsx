import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardList, Building2, CheckCircle2, Clock, XCircle, TrendingUp, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VisitsRemainingWidget } from '@/components/package/VisitsRemainingWidget';
import { useMissions } from '@/hooks/useMissions';
import { usePackage } from '@/hooks/usePackage';
import { useBranches } from '@/hooks/useBranches';
import { useToast } from '@/hooks/use-toast';
import { useDirectionalIcons } from '@/i18n/utils';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useDashboardScores } from '@/hooks/useDashboardScores';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('dashboard');
  const { t: tc } = useTranslation('common');
  const { t: tm } = useTranslation('missions');
  const { t: tb } = useTranslation('branches');
  const { ArrowEnd } = useDirectionalIcons();
  const { isRTL } = useLanguage();
  const { missions } = useMissions();
  const { visitsRemaining, visitsTotal, visitsUsed, subscription } = usePackage();
  const { branches } = useBranches();
  const { data: scores } = useDashboardScores();

  const canCreateMission = visitsRemaining > 0;

  const activeMissions = missions.filter((m) => m.status === 'published').length;
  const completedVisits = missions.reduce((sum, m) => sum + m.visits_completed, 0);

  // Branch stats
  const totalBranches = branches.length;
  const verifiedBranches = branches.filter((b) => b.status === 'verified').length;
  const pendingBranches = branches.filter((b) => b.status === 'pending_verification').length;
  const rejectedBranches = branches.filter((b) => b.status === 'rejected').length;

  // Subscription period end
  const periodEnd = subscription.current_period_end;
  const formattedPeriodEnd = periodEnd
    ? format(new Date(periodEnd), 'MMM d, yyyy', { locale: isRTL ? ar : undefined })
    : null;

  const handleCreateClick = () => {
    if (!canCreateMission) {
      toast({
        title: t('no_visits_remaining'),
        description: t('visits_used_all'),
        variant: 'destructive',
      });
      return;
    }
    navigate('/missions/create');
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('welcome')}</p>
          </div>
          <Button onClick={handleCreateClick} className="gap-2 w-full sm:w-auto" disabled={!canCreateMission}>
            <Plus className="h-4 w-4" />
            {t('create_mission')}
          </Button>
        </div>

        {/* CX Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <TrendingUp className="h-4 w-4" />
                NPS Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl md:text-4xl font-black text-primary">
                  {scores?.nps ?? '—'}
                </div>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {scores?.npsTotal ?? 0} responses
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <Star className="h-4 w-4" />
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl md:text-4xl font-black text-primary">
                  {scores?.overallScore?.toFixed(1) ?? '—'}
                </div>
                <span className="text-xs text-muted-foreground">/ 10 ({scores?.overallPercent ?? 0}%)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {scores?.ratingsCount ?? 0} rated answers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Subscription / Visits Card */}
          <Card className="border border-border">
            <CardContent className="pt-6">
              <VisitsRemainingWidget visitsRemaining={visitsRemaining} visitsTotal={visitsTotal} variant="card" />
              {formattedPeriodEnd ? (
                <p className="text-xs text-muted-foreground mt-3">
                  {t('visits_used_label', { used: visitsUsed, total: visitsTotal })} · {t('renews_on', { date: formattedPeriodEnd })}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-3">{t('no_active_subscription')}</p>
              )}
            </CardContent>
          </Card>

          {/* Active Missions Card */}
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <ClipboardList className="h-4 w-4" />
                {t('active_missions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-black text-primary">{activeMissions}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('visits_completed_across', { count: completedVisits })}</p>
            </CardContent>
          </Card>

          {/* Branches Info Card (replaces wallet card) */}
          <Card className="border border-border sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <Building2 className="h-4 w-4" />
                {t('branches_info')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-black">{totalBranches}</div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  <span className="text-success font-semibold">{verifiedBranches}</span> {tb('stats.verified')}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3 text-primary" />
                  <span className="text-primary font-semibold">{pendingBranches}</span> {tb('stats.pending')}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <XCircle className="h-3 w-3 text-destructive" />
                  <span className="text-destructive font-semibold">{rejectedBranches}</span> {tb('stats.rejected')}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/branches')} className="mt-2 gap-1 p-0 h-auto text-xs text-primary">
                {t('view_all_branches')}
                <ArrowEnd className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card className="border border-border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/missions')}>
            <CardContent className="p-4 md:pt-6 flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center bg-primary text-primary-foreground shrink-0">
                  <ClipboardList className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wide text-sm md:text-base">{t('view_all_missions')}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{t('manage_missions')}</p>
                </div>
              </div>
              <ArrowEnd className="h-5 w-5 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>

          <Card className="border border-border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/branches')}>
            <CardContent className="p-4 md:pt-6 flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center bg-success text-success-foreground shrink-0">
                  <Building2 className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wide text-sm md:text-base">{t('manage_branches')}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{t('view_branch_status')}</p>
                </div>
              </div>
              <ArrowEnd className="h-5 w-5 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Missions Preview */}
        {missions.length > 0 && (
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
              <CardTitle className="text-sm font-bold uppercase tracking-wide">{t('recent_missions')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/missions')} className="gap-1">
                {tc('view_all')}
                <ArrowEnd className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
              <div className="space-y-3">
                {missions.slice(0, 3).map((mission) => (
                  <div
                    key={mission.id}
                    className="flex items-center justify-between border border-border p-3 cursor-pointer hover:bg-muted/30 gap-3"
                    onClick={() => navigate(`/missions/${mission.id}`)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate">{mission.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {mission.branch?.name} • {mission.visits_completed}/{mission.number_of_visits} {tc('visits')}
                      </div>
                    </div>
                    <div className={`text-xs font-semibold uppercase px-2 py-1 shrink-0 ${
                      mission.status === 'published' ? 'bg-success/10 text-success'
                        : mission.status === 'draft' ? 'bg-muted text-muted-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {tm(`statuses.${mission.status}`)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
