import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Users,
  DollarSign,
  Camera,
  Pause,
  Play,
  Archive,
  CheckCircle2,
  Clock,
  Target,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import type { MissionStatus } from '@/types';
import { CompletedVisitsDialog, CompletedVisit } from '@/components/missions/CompletedVisitsDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CURRENCY, QUESTION_TYPE_LABELS } from '@/lib/constants';
import { useTranslation } from 'react-i18next';
import { useActiveAgentTiers } from '@/hooks/useAgentTiers';
import { toast } from 'sonner';
import type { AgentCustomCriteria } from '@/lib/agentHelpers';

export default function AdminMissionDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation('admin');
  const { t: tm } = useTranslation('missions');
  const { t: tc } = useTranslation('common');
  const queryClient = useQueryClient();
  const [showCompletedVisits, setShowCompletedVisits] = useState(false);
  const [showPauseBlockDialog, setShowPauseBlockDialog] = useState(false);

  const { data: agentTiers } = useActiveAgentTiers();

  const { data: mission, isLoading } = useQuery({
    queryKey: ['admin-mission-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No mission ID');
      const { data, error } = await supabase
        .from('missions')
        .select('*, branch:branches(name, city, address)')
        .eq('id', id)
        .single();
      if (error) throw error;

      // Get client info
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_name, full_name')
        .eq('user_id', data.user_id)
        .single();

      // Get visit stats
      const { data: visits } = await supabase
        .from('visits')
        .select('status')
        .eq('mission_id', id);

      const inProgressCount = visits?.filter(v => v.status === 'in_progress').length || 0;

      return {
        ...data,
        clientName: profile?.company_name || profile?.full_name || 'Unknown',
        branchName: data.branch && typeof data.branch === 'object' && 'name' in data.branch
          ? (data.branch as { name: string; city: string; address: string }).name : null,
        branchCity: data.branch && typeof data.branch === 'object' && 'city' in data.branch
          ? (data.branch as { city: string }).city : null,
        inProgressCount,
      };
    },
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const { error } = await supabase
        .from('missions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id!);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(t('missions.status_updated', { status: variables.status }));
      queryClient.invalidateQueries({ queryKey: ['admin-mission-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-missions'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const formatCurrency = (amount: number) =>
    `${amount.toLocaleString(CURRENCY.locale)} ${tc('currency_code')}`;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!mission) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-xl font-black uppercase">{tm('mission_not_found')}</h2>
          <Button onClick={() => navigate('/admin/missions')} className="mt-4">
            {t('missions.view')}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const questions = (mission.questions as Array<{ id: string; type: string; text: string | { en: string; ar: string }; required?: boolean }>) || [];
  const photoReqs = mission.photo_requirements as { required_count: number; instructions?: string | { en: string; ar: string } };
  const budgetRemaining = mission.total_purchase_budget - mission.budget_used;
  const visitsRemaining = mission.number_of_visits - mission.visits_completed - mission.visits_pending;
  const isActiveMission = ['published', 'paused', 'completed'].includes(mission.status);

  const selectedTier = agentTiers?.find(t => t.tier_code === mission.agent_tier);
  const customCriteria = mission.agent_custom_criteria as AgentCustomCriteria | null;
  const selectionMode = mission.agent_selection_mode || 'tier';

  const handlePause = () => {
    if (mission.inProgressCount > 0) {
      setShowPauseBlockDialog(true);
      return;
    }
    updateStatusMutation.mutate({ status: 'paused' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/missions')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black uppercase tracking-tight">{mission.name}</h1>
                <MissionStatusBadge status={mission.status as MissionStatus} />
              </div>
              <p className="mt-1 text-muted-foreground">
                {mission.clientName} • {mission.branchName || tm('details.no_branch')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mission.status === 'published' && (
              <Button variant="outline" onClick={handlePause} className="gap-2">
                <Pause className="h-4 w-4" />
                {t('missions.force_pause')}
              </Button>
            )}
            {mission.status === 'paused' && (
              <>
                <Button variant="outline" onClick={() => updateStatusMutation.mutate({ status: 'published' })} className="gap-2">
                  <Play className="h-4 w-4" />
                  {t('missions.resume')}
                </Button>
                <Button variant="outline" onClick={() => updateStatusMutation.mutate({ status: 'archived' })} className="gap-2 text-destructive hover:text-destructive">
                  <Archive className="h-4 w-4" />
                  {t('missions.force_archive')}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Performance Stats */}
        {isActiveMission && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button onClick={() => setShowCompletedVisits(true)} className="text-start transition-all hover:scale-[1.02]">
              <Card className="border-2 border-success/30 bg-success/5 hover:border-success/50 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-success mb-1">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-xs uppercase tracking-wide font-bold">{tm('details.completed')}</span>
                  </div>
                  <div className="text-4xl font-black text-success">{mission.visits_completed}</div>
                  <p className="text-xs text-muted-foreground mt-1">{tm('details.click_view_details')}</p>
                </CardContent>
              </Card>
            </button>

            <Card className="border border-amber-400/30 bg-amber-50/50 dark:bg-amber-950/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                  <Loader2 className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-wide font-bold">{tm('details.in_progress_label')}</span>
                </div>
                <div className="text-4xl font-black text-amber-600 dark:text-amber-400">{mission.inProgressCount}</div>
              </CardContent>
            </Card>

            <Card className="border border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Clock className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-wide font-bold">{tm('details.pending_label')}</span>
                </div>
                <div className="text-4xl font-black text-primary">{mission.visits_pending}</div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-muted/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Target className="h-5 w-5" />
                  <span className="text-xs uppercase tracking-wide font-bold">{tm('details.remaining_label')}</span>
                </div>
                <div className="text-4xl font-black">{visitsRemaining}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Bar */}
        {isActiveMission && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground uppercase tracking-wide text-xs font-bold">{tm('details.mission_progress')}</span>
                <span className="font-bold">{tm('details.visits_completed_of', { completed: mission.visits_completed, total: mission.number_of_visits })}</span>
              </div>
              <div className="h-3 overflow-hidden bg-muted rounded-sm">
                <div className="h-full bg-success transition-all duration-500" style={{ width: `${(mission.visits_completed / mission.number_of_visits) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Agent Selection Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('missions.agent_selection_section', { defaultValue: 'Agent Selection Criteria' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectionMode === 'tier' ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{tm('agent_selection.select_by_tier')}</span>
                    </div>
                    {selectedTier ? (
                      <div className="flex items-center gap-3">
                        <Badge style={{ backgroundColor: selectedTier.color || '#6B7280', color: '#fff' }}>
                          {selectedTier.name}
                        </Badge>
                        {selectedTier.description && (
                          <span className="text-sm text-muted-foreground">{selectedTier.description}</span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline">{mission.agent_tier}</Badge>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{tm('agent_selection.custom_profile')}</span>
                      <Badge variant="secondary">{t('missions.custom_profile_badge', { defaultValue: 'Custom Profile' })}</Badge>
                    </div>
                    {customCriteria && <CustomCriteriaDisplay criteria={customCriteria} t={tm} />}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Agent Brief */}
            {(() => {
              const m = mission as any;
              const cover = m?.cover_story as { en?: string; ar?: string } | null;
              const rules = (Array.isArray(m?.rules) ? m.rules : []) as Array<{ en?: string; ar?: string }>;
              const category = typeof m?.category === 'string' ? m.category : '';
              const hasBrief = category || (cover && (cover.en || cover.ar)) || rules.some(r => r?.en || r?.ar);
              if (!hasBrief) return null;
              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wide">Agent Brief</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {category && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Category</div>
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">{category}</div>
                      </div>
                    )}
                    {cover && (cover.en || cover.ar) && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Cover Story</div>
                        {cover.en && <p className="text-sm leading-relaxed">{cover.en}</p>}
                        {cover.ar && <p className="text-sm leading-relaxed font-ar mt-1" dir="rtl">{cover.ar}</p>}
                      </div>
                    )}
                    {rules.some(r => r?.en || r?.ar) && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Rules</div>
                        <ol className="space-y-2">
                          {rules.filter(r => r?.en || r?.ar).map((r, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              <span className="shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                              <div className="flex-1">
                                {r.en && <div>{r.en}</div>}
                                {r.ar && <div className="font-ar text-muted-foreground" dir="rtl">{r.ar}</div>}
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}



            {/* Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wide">
                  {tm('details.questions_count', { count: questions.length })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {questions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{tm('details.no_questions')}</p>
                ) : (
                  questions.map((q, i) => {
                    const desc = q.description as { en?: string; ar?: string } | string | undefined;
                    const descEn = typeof desc === 'object' ? desc?.en : (typeof desc === 'string' ? desc : '');
                    const descAr = typeof desc === 'object' ? desc?.ar : '';
                    return (
                      <div key={q.id} className="flex items-start gap-3 border border-border p-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-xs font-bold">{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{typeof q.text === 'string' ? q.text : q.text.en || q.text.ar}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {QUESTION_TYPE_LABELS[q.type] || q.type}
                            {q.required && ` • ${tc('required')}`}
                          </p>
                          {(descEn || descAr) && (
                            <div className="mt-2 rounded-md border-l-2 border-primary/40 bg-primary/5 px-2.5 py-1.5">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">Why we ask</div>
                              {descEn && <p className="text-xs text-muted-foreground leading-relaxed">{descEn}</p>}
                              {descAr && <p className="text-xs text-muted-foreground leading-relaxed font-ar mt-0.5" dir="rtl">{descAr}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Photo Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                  <Camera className="h-4 w-4" />
                  {tm('details.photo_requirements')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 border border-border px-3 py-2">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{tm('details.photos_required', { count: photoReqs?.required_count || 0 })}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Budget Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wide">{tm('details.budget_funding')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {tm('details.number_of_visits')}
                    </span>
                    <span className="font-semibold">{mission.number_of_visits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      {tm('details.budget_per_visit')}
                    </span>
                    <span className="font-semibold">{formatCurrency(mission.purchase_budget_per_visit)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold uppercase tracking-wide">{tm('details.total_budget')}</span>
                    <span className="font-black text-primary">{formatCurrency(mission.total_purchase_budget)}</span>
                  </div>
                </div>

                {isActiveMission && (
                  <div className="border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{tm('details.total_allocated')}</span>
                      <span>{formatCurrency(mission.total_purchase_budget)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{tm('details.used')}</span>
                      <span className="text-destructive font-semibold">-{formatCurrency(mission.budget_used)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="uppercase tracking-wide">{tm('details.remaining')}</span>
                      <span className="text-success">{formatCurrency(budgetRemaining)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wide">{t('missions.client')}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="font-semibold">{mission.clientName}</p>
                {mission.branchName && (
                  <p className="text-muted-foreground">{mission.branchName} — {mission.branchCity}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CompletedVisitsDialog open={showCompletedVisits} onOpenChange={setShowCompletedVisits} visits={[]} missionName={mission.name} />

      <AlertDialog open={showPauseBlockDialog} onOpenChange={setShowPauseBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {tm('actions.cannot_pause_title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tm('actions.cannot_pause_desc', { count: mission.inProgressCount })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>{tc('ok')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

function CustomCriteriaDisplay({ criteria, t }: { criteria: AgentCustomCriteria; t: (key: string, opts?: Record<string, unknown>) => string }) {
  const items: { label: string; value: string }[] = [];

  if (criteria.gender) items.push({ label: t('agent_selection.gender_preference'), value: t(`agent_selection.${criteria.gender}`) });
  if (criteria.min_age || criteria.max_age) items.push({ label: t('agent_selection.age_range'), value: `${criteria.min_age ?? '—'} - ${criteria.max_age ?? '—'}` });
  if (criteria.cities?.length) items.push({ label: t('agent_selection.city'), value: criteria.cities.join(', ') });
  if (criteria.education_levels?.length) items.push({ label: t('agent_selection.education'), value: criteria.education_levels.map(e => e.replace('_', ' ')).join(', ') });
  if (criteria.languages?.length) items.push({ label: t('agent_selection.languages_required'), value: criteria.languages.join(', ') });
  if (criteria.requires_car) items.push({ label: t('agent_selection.must_have_car'), value: '✓' });
  if (criteria.requires_motorcycle) items.push({ label: t('agent_selection.must_have_motorcycle'), value: '✓' });
  if (criteria.specializations?.length) items.push({ label: t('agent_selection.industry_experience'), value: criteria.specializations.map(s => s.replace(/_/g, ' ')).join(', ') });
  if (criteria.min_experience_years && criteria.min_experience_years > 0) items.push({ label: t('agent_selection.min_experience'), value: `${criteria.min_experience_years}` });

  if (items.length === 0) return <p className="text-sm text-muted-foreground">{t('agent_selection.any')}</p>;

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span className="text-muted-foreground">{item.label}</span>
          <span className="font-medium capitalize">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
