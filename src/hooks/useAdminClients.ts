import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminClient {
  id: string;
  userId: string;
  email: string;
  companyName: string | null;
  fullName: string | null;
  phone: string | null;
  plan: string | null;
  status: 'active' | 'suspended';
  balance: number;
  missionsCount: number;
  branchesCount: number;
  createdAt: string;
}

export function useAdminClients() {
  return useQuery({
    queryKey: ['admin-clients'],
    queryFn: async (): Promise<AdminClient[]> => {
      // Fetch profiles with client_admin role
      const { data: clientRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client_admin');

      if (rolesError) throw rolesError;
      
      const clientUserIds = clientRoles?.map(r => r.user_id) || [];
      
      if (clientUserIds.length === 0) {
        return [];
      }

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', clientUserIds);

      if (profilesError) throw profilesError;

      // Fetch wallets
      const { data: wallets, error: walletsError } = await supabase
        .from('wallets')
        .select('user_id, balance')
        .in('user_id', clientUserIds);

      if (walletsError) throw walletsError;

      // Fetch subscriptions with plans
      const { data: subscriptions, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('user_id, status, plan:subscription_plans(name)')
        .in('user_id', clientUserIds);

      if (subsError) throw subsError;

      // Fetch mission counts
      const { data: missions, error: missionsError } = await supabase
        .from('missions')
        .select('user_id')
        .in('user_id', clientUserIds);

      if (missionsError) throw missionsError;

      // Fetch branch counts
      const { data: branches, error: branchesError } = await supabase
        .from('branches')
        .select('user_id')
        .in('user_id', clientUserIds);

      if (branchesError) throw branchesError;

      // Build client objects
      const clients: AdminClient[] = profiles?.map((profile) => {
        const wallet = wallets?.find(w => w.user_id === profile.user_id);
        const subscription = subscriptions?.find(s => s.user_id === profile.user_id);
        const userMissions = missions?.filter(m => m.user_id === profile.user_id) || [];
        const userBranches = branches?.filter(b => b.user_id === profile.user_id) || [];

        // Extract plan name safely
        let planName: string | null = null;
        if (subscription?.plan && typeof subscription.plan === 'object' && 'name' in subscription.plan) {
          planName = (subscription.plan as { name: string }).name;
        }

        return {
          id: profile.id,
          userId: profile.user_id,
          email: '', // We'll need to get this from auth or store in profile
          companyName: profile.company_name,
          fullName: profile.full_name,
          phone: profile.phone,
          plan: planName,
          status: subscription?.status === 'suspended' ? 'suspended' : 'active',
          balance: wallet?.balance || 0,
          missionsCount: userMissions.length,
          branchesCount: userBranches.length,
          createdAt: profile.created_at,
        };
      }) || [];

      return clients;
    },
  });
}

export function useAdminClientsList() {
  return useQuery({
    queryKey: ['admin-clients-list'],
    queryFn: async () => {
      // Simple list for dropdowns
      const { data: clientRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'client_admin');

      if (rolesError) throw rolesError;
      
      const clientUserIds = clientRoles?.map(r => r.user_id) || [];
      
      if (clientUserIds.length === 0) {
        return [];
      }

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, company_name, full_name')
        .in('user_id', clientUserIds);

      if (error) throw error;

      return profiles?.map(p => ({
        userId: p.user_id,
        label: p.company_name || p.full_name || 'Unknown Client',
      })) || [];
    },
  });
}
