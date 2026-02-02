import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardList, Wallet, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VisitsRemainingWidget } from '@/components/package/VisitsRemainingWidget';
import { WalletCard } from '@/components/wallet/WalletCard';
import { useMissions } from '@/hooks/useMissions';
import { usePackage } from '@/hooks/usePackage';
import { useWallet } from '@/hooks/useWallet';
import { MESSAGES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { missions } = useMissions();
  const { visitsRemaining, visitsTotal, package: pkg } = usePackage();
  const { wallet } = useWallet();

  const canCreateMission = visitsRemaining > 0;

  const activeMissions = missions.filter((m) => m.status === 'published').length;
  const completedVisits = missions.reduce((sum, m) => sum + m.visits_completed, 0);

  const handleCreateClick = () => {
    if (!canCreateMission) {
      toast({
        title: 'No visits remaining',
        description: MESSAGES.visits.none_remaining,
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
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back! Here's an overview of your organization.
            </p>
          </div>
          <Button onClick={handleCreateClick} className="gap-2 w-full sm:w-auto" disabled={!canCreateMission}>
            <Plus className="h-4 w-4" />
            Create Mission
          </Button>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Visits Remaining */}
          <Card className="border border-border">
            <CardContent className="pt-6">
              <VisitsRemainingWidget
                visitsRemaining={visitsRemaining}
                visitsTotal={visitsTotal}
                variant="card"
              />
              <p className="text-xs text-muted-foreground mt-3">
                Package: {pkg.name}
              </p>
            </CardContent>
          </Card>

          {/* Active Missions */}
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <ClipboardList className="h-4 w-4" />
                Active Missions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-black text-primary">{activeMissions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedVisits} visits completed across all missions
              </p>
            </CardContent>
          </Card>

          {/* Wallet Summary */}
          <Card className="border border-border sm:col-span-2 lg:col-span-1">
            <WalletCard
              availableBalance={wallet.available_balance}
              allocatedToMissions={wallet.allocated_to_missions}
              compact
            />
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card 
            className="border border-border cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/missions')}
          >
            <CardContent className="p-4 md:pt-6 flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center bg-primary text-primary-foreground shrink-0">
                  <ClipboardList className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wide text-sm md:text-base">View All Missions</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Manage your mystery shopping missions
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>

          <Card 
            className="border border-border cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/wallet')}
          >
            <CardContent className="p-4 md:pt-6 flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center bg-success text-success-foreground shrink-0">
                  <Wallet className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wide text-sm md:text-base">Wallet & Funding</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    View balance and add funds
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Missions Preview */}
        {missions.length > 0 && (
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
              <CardTitle className="text-sm font-bold uppercase tracking-wide">
                Recent Missions
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/missions')} className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
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
                        {mission.branch?.name} • {mission.visits_completed}/{mission.number_of_visits} visits
                      </div>
                    </div>
                    <div className={`text-xs font-semibold uppercase px-2 py-1 shrink-0 ${
                      mission.status === 'published' 
                        ? 'bg-success/10 text-success' 
                        : mission.status === 'draft'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {mission.status}
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

export default Index;
