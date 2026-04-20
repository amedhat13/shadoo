import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Users,
  DollarSign,
  Camera,
  Pause,
  Play,
  Archive,
  Edit,
  CheckCircle2,
  Clock,
  Target,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MissionStatusBadge } from '@/components/missions/MissionStatusBadge';
import { WalletCard } from '@/components/wallet/WalletCard';
import { CompletedVisitsDialog, CompletedVisit } from '@/components/missions/CompletedVisitsDialog';
import { useMissions } from '@/hooks/useMissions';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { CURRENCY, QUESTION_TYPE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useDirectionalIcons } from '@/i18n/utils';
import { supabase } from '@/integrations/supabase/client';

interface DBVisit {
  id: string;
  status: string | null;
  purchase_amount: number | null;
  submitted_at: string | null;
  started_at: string | null;
  created_at: string | null;
  answers: any;
  photos: string[] | null;
  receipt_photo: string | null;
  client_rating: number | null;
  client_feedback: string | null;
  rated_at: string | null;
}

export default function MissionDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { getMission, updateMissionStatus } = useMissions();
  const { wallet } = useWallet();
  const [showCompletedVisits, setShowCompletedVisits] = useState(false);
  const [showPauseBlockDialog, setShowPauseBlockDialog] = useState(false);
  const { t } = useTranslation('missions');
  const { t: tc } = useTranslation('common');
  const { ArrowStart } = useDirectionalIcons();

  const mission = id ? getMission(id) : null;

  const { data: visits = [] } = useQuery({
    queryKey: ['mission-visits', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('id, status, purchase_amount, submitted_at, started_at, created_at, answers, photos, receipt_photo, client_rating, client_feedback, rated_at')
        .eq('mission_id', id!)
        .order('submitted_at', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data || []) as DBVisit[];
    },
  });

  const completedCount = visits.filter(v => v.status === 'approved' || v.status === 'submitted').length;
  const inProgressCount = visits.filter(v => v.status === 'in_progress').length;
  const pendingCount = visits.filter(v => v.status === 'pending').length;

  const completedVisitsForDialog: CompletedVisit[] = useMemo(() => {
    if (!mission) return [];
    const questionMap = new Map<string, any>();
    (mission.questions || []).forEach((q: any) => questionMap.set(q.id, q));
    return visits
      .filter(v => v.status === 'approved' || v.status === 'submitted')
      .map(v => {
        const answersArr = Array.isArray(v.answers) ? v.answers : [];
        const mappedAnswers = answersArr.map((a: any) => {
          const q = questionMap.get(a.question_id);
          const questionText = q
            ? (typeof q.text === 'string' ? q.text : (q.text?.en || q.text?.ar || a.question_id))
            : a.question_id;
          return {
            question: questionText,
            type: q?.type || 'short_text',
            answer: a.value,
          };
        });
        return {
          id: v.id,
          agent_name: 'Mystery Shopper',
          completed_at: v.submitted_at || v.started_at || v.created_at || new Date().toISOString(),
          purchase_amount: Number(v.purchase_amount || 0),
          photos: v.photos || [],
          receipt_photo: v.receipt_photo ?? undefined,
          answers: mappedAnswers,
          client_rating: v.client_rating ?? undefined,
          client_feedback: v.client_feedback ?? undefined,
          rated_at: v.rated_at ?? undefined,
        };
      });
  }, [visits, mission]);

  if (!mission) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-xl font-black uppercase">{t('mission_not_found')}</h2>
          <p className="mt-2 text-muted-foreground">{t('mission_not_found_description')}</p>
          <Button onClick={() => navigate('/missions')} className="mt-4">
            {t('back_to_missions')}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString(CURRENCY.locale)} ${tc('currency_code')}`;
  };

  const budgetRemaining = mission.total_purchase_budget - mission.budget_used;
  const visitsRemaining = mission.number_of_visits - mission.visits_completed - mission.visits_pending;

  const handlePause = async () => {
    // Block pause if in-progress visits exist
    if (inProgressCount > 0) {
      setShowPauseBlockDialog(true);
      return;
    }
    await updateMissionStatus(mission.id, 'paused');
    toast({ title: t('actions.mission_paused'), description: t('actions.mission_paused_desc', { name: mission.name }) });
  };

  const handleResume = async () => {
    await updateMissionStatus(mission.id, 'published');
    toast({ title: t('actions.mission_resumed'), description: t('actions.mission_resumed_desc', { name: mission.name }) });
  };

  const handleArchive = async () => {
    await updateMissionStatus(mission.id, 'archived');
    toast({ title: t('actions.mission_archived'), description: t('actions.mission_archived_desc', { name: mission.name }) });
    navigate('/missions');
  };

  const isActiveMission = mission.status === 'published' || mission.status === 'paused' || mission.status === 'completed';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/missions')}>
              <ArrowStart className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black uppercase tracking-tight">{mission.name}</h1>
                <MissionStatusBadge status={mission.status} />
              </div>
              <p className="mt-1 text-muted-foreground">{mission.branch?.name || t('details.no_branch')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mission.status === 'draft' && (
              <Button variant="outline" onClick={() => navigate(`/missions/${mission.id}/edit`)} className="gap-2">
                <Edit className="h-4 w-4" />
                {tc('edit')}
              </Button>
            )}
            {mission.status === 'published' && (
              <Button variant="outline" onClick={handlePause} className="gap-2">
                <Pause className="h-4 w-4" />
                {t('actions.pause')}
              </Button>
            )}
            {mission.status === 'paused' && (
              <>
                <Button variant="outline" onClick={handleResume} className="gap-2">
                  <Play className="h-4 w-4" />
                  {t('actions.resume')}
                </Button>
                <Button variant="outline" onClick={handleArchive} className="gap-2 text-destructive hover:text-destructive">
                  <Archive className="h-4 w-4" />
                  {t('actions.archive')}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Performance Stats Cards - now 4 cards with In Progress */}
        {isActiveMission && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button onClick={() => setShowCompletedVisits(true)} className="text-start transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <Card className="border-2 border-success/30 bg-success/5 hover:border-success/50 transition-colors h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-success mb-1">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-xs uppercase tracking-wide font-bold">{t('details.completed')}</span>
                  </div>
                  <div className="text-4xl font-black text-success">{completedCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">{t('details.click_view_details')}</p>
                </CardContent>
              </Card>
            </button>

            {/* In Progress Card */}
            <Card className="border border-amber-400/30 bg-amber-50/50 dark:bg-amber-950/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                  <Loader2 className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-wide font-bold">{t('details.in_progress_label')}</span>
                </div>
                <div className="text-4xl font-black text-amber-600 dark:text-amber-400">{inProgressCount}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('details.currently_executing')}</p>
              </CardContent>
            </Card>

            <Card className="border border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Clock className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-wide font-bold">{t('details.pending_label')}</span>
                </div>
                <div className="text-4xl font-black text-primary">{pendingCount}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('details.awaiting_submission')}</p>
              </CardContent>
            </Card>
            <Card className="border border-border bg-muted/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Target className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-wide font-bold">{t('details.remaining_label')}</span>
                </div>
                <div className="text-4xl font-black">{visitsRemaining}</div>
                <p className="text-xs text-muted-foreground mt-1">{t('details.available_for_agents')}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Bar */}
        {isActiveMission && (
          <Card className="border border-border">
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground uppercase tracking-wide text-xs font-bold">{t('details.mission_progress')}</span>
                <span className="font-bold">{t('details.visits_completed_of', { completed: mission.visits_completed, total: mission.number_of_visits })}</span>
              </div>
              <div className="h-3 overflow-hidden bg-muted rounded-sm">
                <div className="h-full bg-success transition-all duration-500" style={{ width: `${(mission.visits_completed / mission.number_of_visits) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Questions Summary */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wide">
                  {t('details.questions_count', { count: mission.questions.length })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mission.questions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t('details.no_questions')}</p>
                ) : (
                  mission.questions.map((question, index) => (
                    <div key={question.id} className="flex items-start gap-3 border border-border p-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-xs font-bold">{index + 1}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{typeof question.text === 'string' ? question.text : question.text.en || question.text.ar}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {QUESTION_TYPE_LABELS[question.type]}
                          {question.required && ` • ${tc('required')}`}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Photo Requirements */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                  <Camera className="h-4 w-4" />
                  {t('details.photo_requirements')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 border border-border px-3 py-2">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{t('details.photos_required', { count: mission.photo_requirements.required_count })}</span>
                  </div>
                </div>
                {mission.photo_requirements.instructions && (
                  <p className="mt-3 text-sm text-muted-foreground">{
                    typeof mission.photo_requirements.instructions === 'object'
                      ? (mission.photo_requirements.instructions as any).en || (mission.photo_requirements.instructions as any).ar
                      : mission.photo_requirements.instructions
                  }</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Budget Card */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wide">{t('details.budget_funding')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {t('details.number_of_visits')}
                    </span>
                    <span className="font-semibold">{mission.number_of_visits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      {t('details.budget_per_visit')}
                    </span>
                    <span className="font-semibold">{formatCurrency(mission.purchase_budget_per_visit)}</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold uppercase tracking-wide">{t('details.total_budget')}</span>
                      <span className="font-black text-primary">{formatCurrency(mission.total_purchase_budget)}</span>
                    </div>
                  </div>
                </div>

                {(mission.status === 'published' || mission.status === 'paused') && (
                  <div className="border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('details.total_allocated')}</span>
                      <span>{formatCurrency(mission.total_purchase_budget)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('details.used')}</span>
                      <span className="text-destructive font-semibold">-{formatCurrency(mission.budget_used)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold border-t border-border pt-2">
                      <span className="uppercase tracking-wide">{t('details.remaining')}</span>
                      <span className="text-success">{formatCurrency(budgetRemaining)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <WalletCard availableBalance={wallet.available_balance} allocatedToMissions={wallet.allocated_to_missions} />
          </div>
        </div>
      </div>

      <CompletedVisitsDialog open={showCompletedVisits} onOpenChange={setShowCompletedVisits} visits={completedVisitsForDialog} missionName={mission.name} />

      {/* Pause Block Dialog */}
      <AlertDialog open={showPauseBlockDialog} onOpenChange={setShowPauseBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('actions.cannot_pause_title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('actions.cannot_pause_desc', { count: inProgressCount })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>{tc('ok')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
