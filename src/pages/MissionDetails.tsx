import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  Camera,
  Receipt,
  FileText,
  Pause,
  Play,
  Archive,
  Edit,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MissionStatusBadge } from '@/components/missions/MissionStatusBadge';
import { WalletCard } from '@/components/wallet/WalletCard';
import { useMissions } from '@/hooks/useMissions';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { CURRENCY } from '@/lib/constants';

export default function MissionDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { getMission, updateMissionStatus } = useMissions();
  const { wallet } = useWallet();

  const mission = id ? getMission(id) : null;

  if (!mission) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-xl font-semibold">Mission not found</h2>
          <p className="mt-2 text-muted-foreground">
            The mission you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/missions')} className="mt-4">
            Back to Missions
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString(CURRENCY.locale)} ${CURRENCY.symbol}`;
  };

  const usedAmount = (mission.completed_runs || 0) * mission.per_run_max_cost!;
  const remainingHold = (mission.required_hold || 0) - usedAmount;

  const handlePause = async () => {
    await updateMissionStatus(mission.id, 'paused');
    toast({
      title: 'Mission paused',
      description: 'The mission has been paused.',
    });
  };

  const handleResume = async () => {
    await updateMissionStatus(mission.id, 'published');
    toast({
      title: 'Mission resumed',
      description: 'The mission is now live.',
    });
  };

  const handleArchive = async () => {
    await updateMissionStatus(mission.id, 'archived');
    toast({
      title: 'Mission archived',
      description: 'The mission has been archived.',
    });
    navigate('/missions');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/missions')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {mission.title}
                </h1>
                <MissionStatusBadge status={mission.status} />
              </div>
              <p className="mt-1 text-muted-foreground">
                {mission.branch?.name || 'No branch'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mission.status === 'draft' && (
              <Button
                variant="outline"
                onClick={() => navigate(`/missions/${mission.id}/edit`)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
            {mission.status === 'published' && (
              <Button variant="outline" onClick={handlePause} className="gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}
            {mission.status === 'paused' && (
              <>
                <Button variant="outline" onClick={handleResume} className="gap-2">
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
                <Button
                  variant="outline"
                  onClick={handleArchive}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Mission Summary */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base font-medium">Mission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{mission.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                      <div className="text-sm font-medium">
                        {format(new Date(mission.start_date), 'MMM d')} -{' '}
                        {format(new Date(mission.end_date), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Quota</div>
                      <div className="text-sm font-medium">{mission.quota} runs</div>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="border-t border-border pt-4">
                  <h4 className="mb-3 text-sm font-medium">Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm">
                      <Camera className="h-3.5 w-3.5" />
                      {mission.required_photos_count} photos
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm">
                      <Receipt className="h-3.5 w-3.5" />
                      Receipt required
                    </div>
                    {mission.quiz_id && (
                      <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm">
                        <FileText className="h-3.5 w-3.5" />
                        Quiz attached
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            {(mission.status === 'published' || mission.status === 'paused') && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base font-medium">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-success/5 p-4 text-center">
                      <div className="text-3xl font-bold text-success">
                        {mission.completed_runs || 0}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Completed Runs
                      </div>
                    </div>
                    <div className="rounded-lg bg-warning/5 p-4 text-center">
                      <div className="text-3xl font-bold text-warning">
                        {mission.pending_runs || 0}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Pending Runs
                      </div>
                    </div>
                    <div className="rounded-lg bg-primary/5 p-4 text-center">
                      <div className="text-3xl font-bold text-primary">
                        {mission.approval_rate || 0}%
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Approval Rate
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">
                        {mission.completed_runs || 0} / {mission.quota}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-primary transition-all duration-500"
                        style={{
                          width: `${((mission.completed_runs || 0) / mission.quota) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget Card */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base font-medium">Budget & Funding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      Fixed Reward
                    </span>
                    <span className="font-medium">
                      {formatCurrency(mission.fixed_reward)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Receipt className="h-4 w-4" />
                      Reimbursement Cap
                    </span>
                    <span className="font-medium">
                      {formatCurrency(mission.reimbursement_cap)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Per-run Max Cost</span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(mission.per_run_max_cost || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hold breakdown */}
                {(mission.status === 'published' || mission.status === 'paused') && (
                  <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Required Hold</span>
                      <span>{formatCurrency(mission.required_hold || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Used Amount</span>
                      <span className="text-success">-{formatCurrency(usedAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-medium border-t border-border pt-2">
                      <span>Remaining Hold</span>
                      <span className="text-warning">{formatCurrency(remainingHold)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wallet Card */}
            <WalletCard
              availableBalance={wallet.available_balance}
              onHoldBalance={wallet.on_hold_balance}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
