import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { matchAgentToTiers, type TierCriteria, type QuestionnaireCriterion } from '@/lib/agentHelpers';

export interface AgentTier {
  id: string;
  name: string;
  name_ar: string | null;
  tier_code: string;
  description: string | null;
  description_ar: string | null;
  color: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  min_age: number | null;
  max_age: number | null;
  gender: string | null;
  cities: string[] | null;
  districts: string[] | null;
  education_levels: string[] | null;
  languages: string[] | null;
  requires_car: boolean | null;
  requires_motorcycle: boolean | null;
  marital_statuses: string[] | null;
  employment_statuses: string[] | null;
  min_experience_years: number | null;
  specializations: string[] | null;
  min_rating: number | null;
  min_completed_visits: number | null;
  questionnaire_criteria: QuestionnaireCriterion[] | null;
  features: unknown;
  commission_rate: number | null;
  min_subscription_plan: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useAgentTiers() {
  return useQuery({
    queryKey: ['agent-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_tiers')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data as unknown as AgentTier[]) || [];
    },
  });
}

export function useActiveAgentTiers() {
  return useQuery({
    queryKey: ['agent-tiers', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_tiers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data as unknown as AgentTier[]) || [];
    },
  });
}

export function useCreateAgentTier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tier: Partial<AgentTier>) => {
      const { questionnaire_criteria, id, ...rest } = tier;
      const insertData: Record<string, unknown> = {
        ...rest,
        questionnaire_criteria: questionnaire_criteria ? JSON.parse(JSON.stringify(questionnaire_criteria)) : [],
      };
      const { data, error } = await supabase
        .from('agent_tiers')
        .insert(insertData as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-tiers'] });
      toast.success('Tier created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create tier: ' + error.message);
    },
  });
}

export function useUpdateAgentTier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AgentTier> & { id: string }) => {
      const { questionnaire_criteria, ...rest } = updates;
      const updateData: Record<string, unknown> = { ...rest };
      if (questionnaire_criteria !== undefined) {
        updateData.questionnaire_criteria = JSON.parse(JSON.stringify(questionnaire_criteria));
      }
      const { error } = await supabase
        .from('agent_tiers')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-tiers'] });
      toast.success('Tier updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update tier: ' + error.message);
    },
  });
}

export function useDeleteAgentTier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agent_tiers')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-tiers'] });
      toast.success('Tier deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete tier: ' + error.message);
    },
  });
}

export function useAgentCountByTier() {
  return useQuery({
    queryKey: ['agent-count-by-tier'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('tier, status')
        .eq('status', 'active');
      if (error) throw error;

      const counts: Record<string, number> = {};
      for (const agent of data || []) {
        if (!agent.tier) continue;
        const tiers = agent.tier.split(',').filter(Boolean);
        for (const t of tiers) {
          counts[t] = (counts[t] || 0) + 1;
        }
      }
      return counts;
    },
  });
}

export async function autoAssignAgentTiers(agentId: string) {
  // Fetch agent
  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single();
  if (agentError || !agent) return;

  // Fetch active tiers
  const { data: tiers, error: tiersError } = await supabase
    .from('agent_tiers')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (tiersError || !tiers) return;

  const tierCriteria: TierCriteria[] = (tiers as unknown as AgentTier[]).map(t => ({
    tier_code: t.tier_code,
    min_age: t.min_age,
    max_age: t.max_age,
    gender: t.gender,
    cities: t.cities,
    districts: t.districts,
    education_levels: t.education_levels,
    languages: t.languages,
    requires_car: t.requires_car,
    requires_motorcycle: t.requires_motorcycle,
    marital_statuses: t.marital_statuses,
    employment_statuses: t.employment_statuses,
    min_experience_years: t.min_experience_years,
    specializations: t.specializations,
    min_rating: t.min_rating,
    min_completed_visits: t.min_completed_visits,
    sort_order: t.sort_order,
    questionnaire_criteria: t.questionnaire_criteria as QuestionnaireCriterion[] | null,
  }));

  const agentData = agent as Record<string, unknown>;
  const matchedTiers = matchAgentToTiers({
    date_of_birth: agentData.date_of_birth as string | null,
    gender: agentData.gender as string | null,
    city: agentData.city as string | null,
    district: agentData.district as string | null,
    education_level: agentData.education_level as string | null,
    languages: agentData.languages as string[] | null,
    has_car: agentData.has_car as boolean | null,
    has_motorcycle: agentData.has_motorcycle as boolean | null,
    marital_status: agentData.marital_status as string | null,
    employment_status: agentData.employment_status as string | null,
    experience_years: agentData.experience_years as number | null,
    specializations: agentData.specializations as string[] | null,
    rating_avg: agent.rating_avg,
    completed_visits: agent.completed_visits,
    questionnaire_answers: agent.questionnaire_answers as unknown[] | null,
  }, tierCriteria);

  const tierStr = matchedTiers.length > 0 ? matchedTiers.join(',') : 'GENERAL';
  await supabase
    .from('agents')
    .update({ tier: tierStr })
    .eq('id', agentId);
}

export function useMatchingAgentCount(tierCode?: string, customCriteria?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['matching-agent-count', tierCode, customCriteria],
    queryFn: async () => {
      const { data: agents, error } = await supabase
        .from('agents')
        .select('tier, status')
        .eq('status', 'active');
      if (error) throw error;

      if (tierCode) {
        return (agents || []).filter(a => a.tier?.split(',').includes(tierCode)).length;
      }
      // For custom criteria, we'd need demographics - simplified count for now
      return agents?.length || 0;
    },
    enabled: Boolean(tierCode || customCriteria),
  });
}
