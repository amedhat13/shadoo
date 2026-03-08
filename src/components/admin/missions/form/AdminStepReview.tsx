import { format, parseISO } from 'date-fns';
import { CheckCircle, MapPin, HelpCircle, DollarSign, Users, MapPinned, Loader2, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MissionFormData, Question } from '@/types';
import { useActiveAgentTiers } from '@/hooks/useAgentTiers';
import { useTranslation } from 'react-i18next';

interface Branch {
  id: string;
  name: string;
  city: string;
}

interface AdminMissionFormData extends MissionFormData {
  clientUserId: string;
}

interface AdminStepReviewProps {
  data: AdminMissionFormData;
  branches: Branch[];
  onCreate: () => void;
  isSubmitting: boolean;
}

export function AdminStepReview({ data, branches, onCreate, isSubmitting }: AdminStepReviewProps) {
  const { t } = useTranslation('missions');
  const selectedBranches = branches.filter((b) => data.branch_ids.includes(b.id));
  const branchCount = selectedBranches.length || 1;
  const numberOfVisits = data.visit_schedules.length;
  const totalBudget = numberOfVisits * data.purchase_budget_per_visit * branchCount;
  const totalVisits = numberOfVisits * branchCount;
  const selectedTier = AGENT_TIERS.find((tier) => tier.tier === data.agent_tier);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <h3 className="text-lg font-bold">{t('admin.review_title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('admin.review_desc')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('admin.basic_info')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('review.name_label')}</span>
              <span className="font-medium">{data.name || t('review.not_specified')}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('review.branches_label')}</span>
              <span className="font-medium">{t('form.branches_selected', { count: selectedBranches.length })}</span>
            </div>
            {selectedBranches.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedBranches.slice(0, 3).map((b) => (
                  <Badge key={b.id} variant="outline" className="text-xs">
                    {b.name}
                  </Badge>
                ))}
                {selectedBranches.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    {t('review.more_branches', { count: selectedBranches.length - 3 })}
                  </Badge>
                )}
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('geo.title')}</span>
              <Badge variant={data.is_geo_tagged ? 'default' : 'secondary'}>
                {data.is_geo_tagged ? (
                  <>
                    <MapPinned className="h-3 w-3 me-1" />
                    {t('admin.enabled')}
                  </>
                ) : (
                  t('admin.disabled')
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Agent Tier */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('review.agent_tier')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('admin.selected_tier')}</span>
              <Badge variant="outline">{selectedTier?.name || data.agent_tier}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedTier?.description}
            </p>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              {t('review.questions_label', { count: data.questions.length })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('admin.total_questions')}</span>
              <span className="font-medium">{data.questions.length}</span>
            </div>
            {data.questions.length > 0 && (
              <div className="space-y-1 mt-2">
                {data.questions.slice(0, 3).map((q: Question, i: number) => (
                  <div key={q.id} className="text-xs text-muted-foreground truncate">
                    {i + 1}. {typeof q.text === 'string' ? q.text : q.text.en || q.text.ar}
                  </div>
                ))}
                {data.questions.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    {t('review.more_branches', { count: data.questions.length - 3 })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Funding */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('admin.funding')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('funding.scheduled_visits')}</span>
              <span className="font-medium">{numberOfVisits} {t('admin.per_mission')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('review.budget_per_visit')}</span>
              <span className="font-medium">{data.purchase_budget_per_visit.toLocaleString()} EGP</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>{t('review.total_purchase_budget')}</span>
              <span>{totalBudget.toLocaleString()} EGP</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('review.total_visits')}</span>
              <span>{totalVisits} {t('admin.visits_across', { count: branchCount })}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visit Schedules */}
      {data.visit_schedules.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('review.scheduled_visits', { count: numberOfVisits })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {data.visit_schedules.slice(0, 5).map((schedule, i) => (
                <div key={schedule.id} className="flex items-center gap-3 text-sm p-2 bg-muted/50 rounded">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center bg-muted text-xs font-bold rounded">
                    {i + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{format(parseISO(schedule.date), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{schedule.time}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatDuration(schedule.duration)}
                  </Badge>
                </div>
              ))}
              {data.visit_schedules.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  {t('review.more_visits', { count: data.visit_schedules.length - 5 })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Button */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <Button
          size="lg"
          className="w-full sm:w-auto px-12 gap-2"
          onClick={onCreate}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
          {branchCount > 1
            ? t('admin.create_missions', { count: branchCount })
            : t('admin.create_mission')}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          {t('admin.missions_saved_as_drafts')}
        </p>
      </div>
    </div>
  );
}
