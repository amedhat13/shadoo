import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminVisit {
  id: string;
  mission_id: string;
  agent_id: string;
  status: string;
  answers: any;
  photos: string[];
  receipt_photo: string | null;
  purchase_amount: number | null;
  started_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  // Schedule info (denormalized from mission visit_schedules)
  schedule_id: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  scheduled_duration: number | null;
  // Joined data
  mission?: {
    id: string;
    name: string;
    questions: any;
    photo_requirements: any;
    purchase_budget_per_visit: number;
    user_id: string;
    visit_schedules: any;
  };
  agent?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    tier: string;
  };
  client?: {
    full_name: string;
    company_name: string;
  };
}

export function useAdminVisits(status?: string) {
  return useQuery({
    queryKey: ['admin-visits', status],
    queryFn: async () => {
      let query = supabase
        .from('visits')
        .select(`
          *,
          mission:missions (
            id,
            name,
            questions,
            photo_requirements,
            purchase_budget_per_visit,
            user_id,
            visit_schedules
          ),
          agent:agents (
            id,
            full_name,
            email,
            phone,
            tier
          )
        `)
        .order('submitted_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch client profiles for each mission
      const missionUserIds = [...new Set((data || []).map(v => v.mission?.user_id).filter(Boolean))];
      
      let clientProfiles: Record<string, { full_name: string; company_name: string }> = {};
      if (missionUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, company_name')
          .in('user_id', missionUserIds);
        
        if (profiles) {
          clientProfiles = profiles.reduce((acc, p) => {
            acc[p.user_id] = { full_name: p.full_name || '', company_name: p.company_name || '' };
            return acc;
          }, {} as Record<string, { full_name: string; company_name: string }>);
        }
      }

      return (data || []).map(visit => ({
        ...visit,
        client: visit.mission?.user_id ? clientProfiles[visit.mission.user_id] : undefined,
      })) as AdminVisit[];
    },
  });
}

export function useVisitStats() {
  return useQuery({
    queryKey: ['admin-visit-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('status');

      if (error) throw error;

      const total = data.length;
      const pending = data.filter(v => v.status === 'pending').length;
      const inProgress = data.filter(v => v.status === 'in_progress').length;
      const submitted = data.filter(v => v.status === 'submitted').length;
      const approved = data.filter(v => v.status === 'approved').length;
      const rejected = data.filter(v => v.status === 'rejected').length;

      return {
        total,
        pending,
        inProgress,
        submitted,
        approved,
        rejected,
      };
    },
  });
}

export function useApproveVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visitId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the visit to find the mission
      const { data: visit, error: visitError } = await supabase
        .from('visits')
        .select('mission_id')
        .eq('id', visitId)
        .single();

      if (visitError) throw visitError;

      // Update visit status
      const { error: updateError } = await supabase
        .from('visits')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', visitId);

      if (updateError) throw updateError;

      // Increment visits_completed on the mission manually
      const { data: mission } = await supabase
        .from('missions')
        .select('visits_completed, visits_pending')
        .eq('id', visit.mission_id)
        .single();

      if (mission) {
        await supabase
          .from('missions')
          .update({ 
            visits_completed: (mission.visits_completed || 0) + 1,
            visits_pending: Math.max(0, (mission.visits_pending || 1) - 1),
          })
          .eq('id', visit.mission_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-visits'] });
      queryClient.invalidateQueries({ queryKey: ['admin-visit-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-missions'] });
      toast.success('Visit approved successfully');
    },
    onError: (error) => {
      toast.error('Failed to approve visit: ' + error.message);
    },
  });
}

export function useRejectVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitId, reason }: { visitId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update visit status to rejected
      const { error } = await supabase
        .from('visits')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          rejection_reason: reason,
        })
        .eq('id', visitId);

      if (error) throw error;

      // Note: The visit slot is now available for another agent to pick up
      // The mission's visits_pending should remain as-is or be adjusted by the agent app
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-visits'] });
      queryClient.invalidateQueries({ queryKey: ['admin-visit-stats'] });
      toast.success('Visit rejected - available for reassignment');
    },
    onError: (error) => {
      toast.error('Failed to reject visit: ' + error.message);
    },
  });
}
