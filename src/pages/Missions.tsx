import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardList } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { MissionTable } from '@/components/missions/MissionTable';
import { MissionFiltersComponent, MissionFilters } from '@/components/missions/MissionFilters';
import { EmptyState } from '@/components/common/EmptyState';
import { VisitsRemainingWidget } from '@/components/package/VisitsRemainingWidget';
import { Button } from '@/components/ui/button';
import { useMissions } from '@/hooks/useMissions';
import { usePackage } from '@/hooks/usePackage';
import { Mission } from '@/types';
import { EMPTY_STATES, MESSAGES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

export default function MissionsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { missions, branches, updateMissionStatus } = useMissions();
  const { visitsRemaining, visitsTotal } = usePackage();

  const [filters, setFilters] = useState<MissionFilters>({
    search: '',
    status: 'all',
    branch: 'all',
  });

  const canCreateMission = visitsRemaining > 0;

  // Filter missions
  const filteredMissions = missions.filter((mission) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!mission.name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Status filter
    if (filters.status !== 'all' && mission.status !== filters.status) {
      return false;
    }

    // Branch filter
    if (filters.branch !== 'all' && mission.branch_id !== filters.branch) {
      return false;
    }

    return true;
  });

  const handlePause = async (mission: Mission) => {
    await updateMissionStatus(mission.id, 'paused');
    toast({
      title: 'Mission paused',
      description: `"${mission.name}" has been paused.`,
    });
  };

  const handleResume = async (mission: Mission) => {
    await updateMissionStatus(mission.id, 'published');
    toast({
      title: 'Mission resumed',
      description: `"${mission.name}" is now live.`,
    });
  };

  const handleArchive = async (mission: Mission) => {
    await updateMissionStatus(mission.id, 'archived');
    toast({
      title: 'Mission archived',
      description: `"${mission.name}" has been archived.`,
    });
  };

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
        <PageHeader
          title="Missions"
          description="Create and manage mystery shopping missions for your organization."
          actions={
            <Button onClick={handleCreateClick} className="gap-2" disabled={!canCreateMission}>
              <Plus className="h-4 w-4" />
              Create Mission
            </Button>
          }
        />

        {/* Visits remaining widget */}
        <VisitsRemainingWidget
          visitsRemaining={visitsRemaining}
          visitsTotal={visitsTotal}
          variant="card"
        />

        {missions.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-7 w-7 text-muted-foreground" />}
            title={EMPTY_STATES.missions.title}
            description={EMPTY_STATES.missions.description}
            action={
              canCreateMission
                ? {
                    label: EMPTY_STATES.missions.action,
                    onClick: () => navigate('/missions/create'),
                  }
                : undefined
            }
          />
        ) : (
          <>
            <MissionFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              branches={branches}
            />

            {filteredMissions.length === 0 ? (
              <EmptyState
                title="No missions found"
                description="Try adjusting your filters to find what you're looking for."
              />
            ) : (
              <MissionTable
                missions={filteredMissions}
                onPause={handlePause}
                onResume={handleResume}
                onArchive={handleArchive}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
