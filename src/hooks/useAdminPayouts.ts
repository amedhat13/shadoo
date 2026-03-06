import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminPayout {
  id: string;
  agent_id: string | null;
  amount: number;
  method: string;
  status: string | null;
  requested_at: string | null;
  processed_at: string | null;
  processed_by: string | null;
  rejection_reason: string | null;
  transaction_reference: string | null;
  visit_id: string | null;
  auto_generated: boolean;
  duration_minutes: number | null;
  tier_code: string | null;
  agent?: { id: string; full_name: string; email: string; tier: string };
  visit?: { id: string; mission_id: string; scheduled_duration: number };
}

export function useAdminPayouts(status?: string) {
  return useQuery({
    queryKey: ['admin-payouts', status],
    queryFn: async () => {
      let query = supabase
        .from('agent_payouts')
        .select(`*, agent:agents(id, full_name, email, tier)`)
        .order('requested_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as AdminPayout[];
    },
  });
}

export function usePayoutStats() {
  return useQuery({
    queryKey: ['admin-payout-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_payouts')
        .select('status, amount');
      if (error) throw error;

      const all = data || [];
      const pending = all.filter(p => p.status === 'pending');
      const completed = all.filter(p => p.status === 'completed');
      const rejected = all.filter(p => p.status === 'rejected');

      return {
        totalPending: pending.length,
        pendingAmount: pending.reduce((s, p) => s + Number(p.amount), 0),
        totalCompleted: completed.length,
        completedAmount: completed.reduce((s, p) => s + Number(p.amount), 0),
        totalRejected: rejected.length,
        total: all.length,
      };
    },
  });
}

export function useProcessPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ payoutId, action, reason }: { payoutId: string; action: 'completed' | 'rejected'; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('agent_payouts')
        .update({
          status: action,
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
          ...(reason ? { rejection_reason: reason } : {}),
        })
        .eq('id', payoutId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payout-stats'] });
      toast.success(vars.action === 'completed' ? 'Payout approved' : 'Payout rejected');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useBulkProcessPayouts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payoutIds: string[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('agent_payouts')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          processed_by: user?.id,
        })
        .in('id', payoutIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payout-stats'] });
      toast.success('Payouts approved');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}
