import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardList } from 'lucide-react';
import { AIMissionBuilderDialog } from '@/components/missions/ai/AIMissionBuilderDialog';
import { useWallet } from '@/hooks/useWallet';
import shadooCap from '@/assets/shadoo-cap.png';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { MissionTable } from '@/components/missions/MissionTable';
import { SaveAsTemplateDialog } from '@/components/missions/SaveAsTemplateDialog';
import { MissionFiltersComponent, MissionFilters } from '@/components/missions/MissionFilters';
import { EmptyState } from '@/components/common/EmptyState';
import { VisitsRemainingWidget } from '@/components/package/VisitsRemainingWidget';
import { Button } from '@/components/ui/button';
import { useMissions } from '@/hooks/useMissions';
import { usePackage } from '@/hooks/usePackage';
import { Mission } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function MissionsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation('missions');
  const { missions, branches, updateMissionStatus, duplicateMission } = useMissions();
  const { visitsRemaining, visitsTotal } = usePackage();

  const { wallet } = useWallet();

  const [filters, setFilters] = useState<MissionFilters>({ search: '', status: 'all', branch: 'all' });
  const [templateSource, setTemplateSource] = useState<Mission | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const canCreateMission = visitsRemaining > 0;

  const filteredMissions = missions.filter((mission) => {
    if (filters.search && !mission.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.status !== 'all' && mission.status !== filters.status) return false;
    if (filters.branch !== 'all' && mission.branch_id !== filters.branch) return false;
    return true;
  });

  const handlePause = async (mission: Mission) => {
    await updateMissionStatus(mission.id, 'paused');
    toast({ title: t('mission_paused'), description: t('mission_paused_desc', { name: mission.name }) });
  };

  const handleResume = async (mission: Mission) => {
    await updateMissionStatus(mission.id, 'published');
    toast({ title: t('mission_resumed'), description: t('mission_resumed_desc', { name: mission.name }) });
  };

  const handleArchive = async (mission: Mission) => {
    await updateMissionStatus(mission.id, 'archived');
    toast({ title: t('mission_archived'), description: t('mission_archived_desc', { name: mission.name }) });
  };

  const handleDuplicate = async (mission: Mission) => {
    const duplicated = await duplicateMission(mission.id);
    if (duplicated) {
      toast({ title: t('mission_duplicated'), description: t('mission_duplicated_desc', { name: duplicated.name }) });
      navigate(`/missions/${duplicated.id}/edit`);
    }
  };

  const handleCreateClick = () => {
    if (!canCreateMission) {
      toast({ title: t('no_missions'), description: t('funding.insufficient_visits'), variant: 'destructive' });
      return;
    }
    navigate('/missions/create');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={t('title')}
          description={t('description')}
          actions={
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button onClick={handleCreateClick} variant="outline" className="gap-2" disabled={!canCreateMission}>
                <Plus className="h-4 w-4" />
                {t('create_mission')}
              </Button>
              <Button onClick={() => setAiOpen(true)} className="gap-2" disabled={!canCreateMission}>
                <img src={shadooCap} alt="" className="h-4 w-auto" />
                Create with AI
              </Button>
            </div>
          }
        />

        <button
          onClick={() => canCreateMission && setAiOpen(true)}
          className="w-full rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-start transition-colors hover:border-primary"
        >
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-tight">
            <img src={shadooCap} alt="" className="h-5 w-auto" />
            Skip the 6 steps — describe your mission instead
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Shadoo AI reads your brief or your standards document, asks anything that's missing, then fills the whole
            wizard in English and Arabic. You review and publish.
          </p>
        </button>

        <VisitsRemainingWidget visitsRemaining={visitsRemaining} visitsTotal={visitsTotal} variant="card" />

        {missions.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-7 w-7 text-muted-foreground" />}
            title={t('no_missions')}
            description={t('no_missions_desc')}
            action={canCreateMission ? { label: t('create_mission'), onClick: () => navigate('/missions/create') } : undefined}
          />
        ) : (
          <>
            <MissionFiltersComponent filters={filters} onFiltersChange={setFilters} branches={branches} />
            {filteredMissions.length === 0 ? (
              <EmptyState title={t('no_missions_found')} description={t('no_missions_found_desc')} />
            ) : (
              <MissionTable missions={filteredMissions} onPause={handlePause} onResume={handleResume} onArchive={handleArchive} onDuplicate={handleDuplicate} onSaveTemplate={setTemplateSource} />
            )}
          </>
        )}
      </div>

      <SaveAsTemplateDialog
        mission={templateSource ? {
          name: templateSource.name,
          name_ar: (templateSource as unknown as { name_ar?: string }).name_ar,
          methodology: (templateSource as unknown as { methodology?: string }).methodology,
          category: (templateSource as unknown as { category?: string }).category,
          questions: templateSource.questions,
        } : null}
        open={!!templateSource}
        onOpenChange={(o) => !o && setTemplateSource(null)}
      />
    </DashboardLayout>
  );
}
