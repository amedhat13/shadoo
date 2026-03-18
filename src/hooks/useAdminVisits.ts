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

      // Get the visit with agent and mission info
      const { data: visit, error: visitError } = await supabase
        .from('visits')
        .select('mission_id, agent_id, scheduled_duration, agent:agents(id, tier, full_name)')
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

      // Increment visits_completed on the mission
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

      // Auto-payout: look up price and create payout
      if (visit.agent_id && visit.scheduled_duration) {
        const agentData = visit.agent as any;
        const tierStr = agentData?.tier || 'C';
        // Use highest tier for pricing
        const tiers = tierStr.split(',').filter(Boolean);
        const tierPriority = ['A', 'B', 'C'];
        const bestTier = tiers.sort((a: string, b: string) => tierPriority.indexOf(a) - tierPriority.indexOf(b))[0] || 'C';

        // Look up price
        // Look up price by finding a range that contains the scheduled duration
        const { data: priceRows } = await supabase
          .from('visit_duration_pricing')
          .select('price, min_duration_minutes, max_duration_minutes')
          .eq('tier_code', bestTier)
          .eq('is_active', true)
          .order('min_duration_minutes');

        const priceData = (priceRows || []).find((p: any) =>
          visit.scheduled_duration >= p.min_duration_minutes &&
          (p.max_duration_minutes === null || visit.scheduled_duration <= p.max_duration_minutes)
        );

        if (priceData) {
          const amount = Number((priceData as any).price);
          // Create auto-payout
          await supabase.from('agent_payouts').insert({
            agent_id: visit.agent_id,
            amount,
            method: 'auto',
            status: 'pending',
            visit_id: visitId,
            auto_generated: true,
            duration_minutes: visit.scheduled_duration,
            tier_code: bestTier,
          } as any);

          // Update agent balance
          const { data: agent } = await supabase
            .from('agents')
            .select('available_balance')
            .eq('id', visit.agent_id)
            .single();

          if (agent) {
            await supabase
              .from('agents')
              .update({ available_balance: (Number(agent.available_balance) || 0) + amount })
              .eq('id', visit.agent_id);
          }

          return { agentName: agentData?.full_name, amount, tier: bestTier };
        }
      }

      return null;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-visits'] });
      queryClient.invalidateQueries({ queryKey: ['admin-visit-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-missions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      if (result) {
        toast.success(`Visit approved — Payout of ${result.amount} EGP queued for ${result.agentName}`);
      } else {
        toast.success('Visit approved successfully');
      }
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

      // Get the visit to clone
      const { data: visit, error: fetchErr } = await supabase
        .from('visits')
        .select('*')
        .eq('id', visitId)
        .single();

      if (fetchErr) throw fetchErr;

      // Mark as rejected
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

      // Create a new pending visit (re-queue)
      const { error: insertErr } = await supabase.from('visits').insert({
        mission_id: visit.mission_id,
        schedule_id: visit.schedule_id,
        scheduled_date: visit.scheduled_date,
        scheduled_time: visit.scheduled_time,
        scheduled_duration: visit.scheduled_duration,
        status: 'pending',
        is_requeued: true,
        parent_visit_id: visitId,
      } as any);

      if (insertErr) throw insertErr;

      // Increment visits_pending on mission
      if (visit.mission_id) {
        const { data: mission } = await supabase
          .from('missions')
          .select('visits_pending')
          .eq('id', visit.mission_id)
          .single();

        if (mission) {
          await supabase
            .from('missions')
            .update({ visits_pending: (mission.visits_pending || 0) + 1 })
            .eq('id', visit.mission_id);
        }
      }

      // Cancel any existing payout for this visit
      await supabase
        .from('agent_payouts')
        .update({ status: 'cancelled', rejection_reason: 'Visit rejected' } as any)
        .eq('visit_id', visitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-visits'] });
      queryClient.invalidateQueries({ queryKey: ['admin-visit-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      toast.success('Visit rejected — re-queued for another agent');
    },
    onError: (error) => {
      toast.error('Failed to reject visit: ' + error.message);
    },
  });
}
