import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminBranches() {
  return useQuery({
    queryKey: ['admin-branches'],
    queryFn: async () => {
      const { data: branches, error } = await supabase
        .from('branches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profiles for client names
      const userIds = [...new Set(branches?.map(b => b.user_id) || [])];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, company_name, full_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return branches?.map(branch => ({
        ...branch,
        clientName: profileMap.get(branch.user_id)?.company_name || profileMap.get(branch.user_id)?.full_name || 'Unknown',
      })) || [];
    },
  });
}

export function useAdminMissions() {
  return useQuery({
    queryKey: ['admin-missions'],
    queryFn: async () => {
      const { data: missions, error } = await supabase
        .from('missions')
        .select(`
          *,
          branch:branches(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get profiles for client names
      const userIds = [...new Set(missions?.map(m => m.user_id) || [])];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, company_name, full_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return missions?.map(mission => ({
        ...mission,
        clientName: profileMap.get(mission.user_id)?.company_name || profileMap.get(mission.user_id)?.full_name || 'Unknown',
        branchName: mission.branch && typeof mission.branch === 'object' && 'name' in mission.branch 
          ? (mission.branch as { name: string }).name 
          : null,
      })) || [];
    },
  });
}

export function useClientBranches(clientUserId: string | null) {
  return useQuery({
    queryKey: ['client-branches', clientUserId],
    queryFn: async () => {
      if (!clientUserId) return [];
      
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, city')
        .eq('user_id', clientUserId)
        .eq('status', 'verified');

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientUserId,
  });
}
