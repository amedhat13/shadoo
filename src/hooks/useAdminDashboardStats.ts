import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // Fetch all stats in parallel
      const [
        clientsResult,
        missionsResult,
        agentsResult,
        branchesResult,
        visitsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('missions').select('id, status'),
        supabase.from('agents').select('id, status'),
        supabase.from('branches').select('id, status'),
        supabase.from('visits').select('id, status'),
      ]);

      const missions = missionsResult.data || [];
      const agents = agentsResult.data || [];
      const branches = branchesResult.data || [];
      const visits = visitsResult.data || [];

      return {
        clients: {
          total: clientsResult.count || 0,
        },
        missions: {
          total: missions.length,
          published: missions.filter(m => m.status === 'published').length,
          draft: missions.filter(m => m.status === 'draft').length,
          completed: missions.filter(m => m.status === 'completed').length,
        },
        agents: {
          total: agents.length,
          active: agents.filter(a => a.status === 'active').length,
          pending: agents.filter(a => a.status === 'pending').length,
          suspended: agents.filter(a => a.status === 'suspended').length,
        },
        branches: {
          total: branches.length,
          verified: branches.filter(b => b.status === 'verified').length,
          pending: branches.filter(b => b.status === 'pending_verification').length,
          rejected: branches.filter(b => b.status === 'rejected').length,
        },
        visits: {
          total: visits.length,
          submitted: visits.filter(v => v.status === 'submitted').length,
          approved: visits.filter(v => v.status === 'approved').length,
          rejected: visits.filter(v => v.status === 'rejected').length,
          inProgress: visits.filter(v => v.status === 'in_progress').length,
        },
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
