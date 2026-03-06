import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Agent {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  national_id: string | null;
  tier: string | null;
  status: string | null;
  rating_avg: number | null;
  completed_visits: number | null;
  total_earnings: number | null;
  available_balance: number | null;
  verification_docs: any;
  questionnaire_answers: any;
  mobile_wallet: string | null;
  bank_details: any;
  created_at: string | null;
  updated_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
}

export function useAgents(status?: string) {
  return useQuery({
    queryKey: ['agents', status],
    queryFn: async () => {
      let query = supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Agent[];
    },
  });
}

export function useAgentStats() {
  return useQuery({
    queryKey: ['agent-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('status, tier, rating_avg');

      if (error) throw error;

      const total = data.length;
      const pending = data.filter(a => a.status === 'pending').length;
      const active = data.filter(a => a.status === 'active').length;
      const suspended = data.filter(a => a.status === 'suspended').length;
      const tierA = data.filter(a => a.tier === 'A').length;
      const avgRating = data.filter(a => a.rating_avg).reduce((acc, a) => acc + (a.rating_avg || 0), 0) / (data.filter(a => a.rating_avg).length || 1);

      return {
        total,
        pending,
        active,
        suspended,
        tierA,
        avgRating: avgRating.toFixed(1),
      };
    },
  });
}

export function useApproveAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentId, tiers }: { agentId: string; tiers: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('agents')
        .update({
          status: 'active',
          tier: tiers.join(','),
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
        })
        .eq('id', agentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent-stats'] });
      toast.success('Agent approved successfully');
    },
    onError: (error) => {
      toast.error('Failed to approve agent: ' + error.message);
    },
  });
}

export function useRejectAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentId, reason, category }: { agentId: string; reason: string; category?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('agents')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          rejection_category: category || null,
          rejected_at: new Date().toISOString(),
          rejected_by: user?.id,
        } as any)
        .eq('id', agentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent-stats'] });
      toast.success('Agent rejected');
    },
    onError: (error) => {
      toast.error('Failed to reject agent: ' + error.message);
    },
  });
}

export function useUpdateAgentTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentId, tiers }: { agentId: string; tiers: string[] }) => {
      const { error } = await supabase
        .from('agents')
        .update({ tier: tiers.join(',') })
        .eq('id', agentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent-stats'] });
      toast.success('Agent tiers updated');
    },
    onError: (error) => {
      toast.error('Failed to update tiers: ' + error.message);
    },
  });
}

// Helper to parse tier string into array
export function parseTiers(tier: string | null): string[] {
  if (!tier) return ['C'];
  return tier.split(',').filter(Boolean);
}

export function useSuspendAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentId: string) => {
      const { error } = await supabase
        .from('agents')
        .update({ status: 'suspended' })
        .eq('id', agentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent-stats'] });
      toast.success('Agent suspended');
    },
    onError: (error) => {
      toast.error('Failed to suspend agent: ' + error.message);
    },
  });
}

export function useReactivateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentId: string) => {
      const { error } = await supabase
        .from('agents')
        .update({ status: 'active' })
        .eq('id', agentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent-stats'] });
      toast.success('Agent reactivated');
    },
    onError: (error) => {
      toast.error('Failed to reactivate agent: ' + error.message);
    },
  });
}
