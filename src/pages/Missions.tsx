import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardList } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { MissionTable } from '@/components/missions/MissionTable';
import { MissionFiltersComponent, MissionFilters } from '@/components/missions/MissionFilters';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { useMissions } from '@/hooks/useMissions';
import { Mission } from '@/types/mission';
import { EMPTY_STATES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

export default function MissionsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { missions, branches, updateMissionStatus } = useMissions();

  const [filters, setFilters] = useState<MissionFilters>({
    search: '',
    status: 'all',
    branch: 'all',
    dateRange: {},
  });

  // Filter missions
  const filteredMissions = missions.filter((mission) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !mission.title.toLowerCase().includes(searchLower) &&
        !mission.description.toLowerCase().includes(searchLower)
      ) {
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

    // Date range filter
    if (filters.dateRange.from) {
      const missionDate = new Date(mission.created_at);
      if (missionDate < filters.dateRange.from) return false;
    }
    if (filters.dateRange.to) {
      const missionDate = new Date(mission.created_at);
      if (missionDate > filters.dateRange.to) return false;
    }

    return true;
  });

  const handlePause = async (mission: Mission) => {
    await updateMissionStatus(mission.id, 'paused');
    toast({
      title: 'Mission paused',
      description: `"${mission.title}" has been paused.`,
    });
  };

  const handleResume = async (mission: Mission) => {
    await updateMissionStatus(mission.id, 'published');
    toast({
      title: 'Mission resumed',
      description: `"${mission.title}" is now live.`,
    });
  };

  const handleArchive = async (mission: Mission) => {
    await updateMissionStatus(mission.id, 'archived');
    toast({
      title: 'Mission archived',
      description: `"${mission.title}" has been archived.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Missions"
          description="Create and manage mystery shopping missions for your organization."
          actions={
            <Button onClick={() => navigate('/missions/create')} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Mission
            </Button>
          }
        />

        {missions.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-7 w-7 text-muted-foreground" />}
            title={EMPTY_STATES.missions.title}
            description={EMPTY_STATES.missions.description}
            action={{
              label: EMPTY_STATES.missions.action,
              onClick: () => navigate('/missions/create'),
            }}
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
