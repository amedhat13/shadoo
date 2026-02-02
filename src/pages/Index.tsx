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
  const totalBudgetAllocated = missions
    .filter((m) => m.status === 'published' || m.status === 'paused')
    .reduce((sum, m) => sum + m.total_purchase_budget, 0);

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your organization.
            </p>
          </div>
          <Button onClick={handleCreateClick} className="gap-2" disabled={!canCreateMission}>
            <Plus className="h-4 w-4" />
            Create Mission
          </Button>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="text-4xl font-black text-primary">{activeMissions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedVisits} visits completed across all missions
              </p>
            </CardContent>
          </Card>

          {/* Wallet Summary */}
          <WalletCard
            availableBalance={wallet.available_balance}
            allocatedToMissions={wallet.allocated_to_missions}
            compact
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="border border-border cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/missions')}
          >
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-primary text-primary-foreground">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wide">View All Missions</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage and monitor your mystery shopping missions
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card 
            className="border border-border cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/wallet')}
          >
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-success text-success-foreground">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wide">Wallet & Funding</h3>
                  <p className="text-sm text-muted-foreground">
                    View your balance and add funds for missions
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Missions Preview */}
        {missions.length > 0 && (
          <Card className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wide">
                Recent Missions
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/missions')} className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {missions.slice(0, 3).map((mission) => (
                  <div
                    key={mission.id}
                    className="flex items-center justify-between border border-border p-3 cursor-pointer hover:bg-muted/30"
                    onClick={() => navigate(`/missions/${mission.id}`)}
                  >
                    <div>
                      <div className="font-semibold">{mission.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {mission.branch?.name} • {mission.visits_completed}/{mission.number_of_visits} visits
                      </div>
                    </div>
                    <div className={`text-xs font-semibold uppercase px-2 py-1 ${
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
