import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Mission, MissionStatus, Question, PhotoRequirements, AgentTier, VisitSchedule } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface DbMission {
  id: string;
  user_id: string;
  name: string;
  branch_id: string | null;
  status: string;
  agent_tier: string;
  questions: unknown;
  photo_requirements: unknown;
  number_of_visits: number;
  purchase_budget_per_visit: number;
  purchase_item_name: string | null;
  total_purchase_budget: number;
  visits_completed: number;
  visits_pending: number;
  budget_used: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  branches?: {
    id: string;
    name: string;
    address: string;
    city: string;
    district: string | null;
    google_maps_link: string;
    latitude: number | null;
    longitude: number | null;
    status: string;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
  } | null;
}

function mapDbMissionToMission(dbMission: DbMission): Mission {
  return {
    id: dbMission.id,
    name: dbMission.name,
    branch_id: dbMission.branch_id || '',
    branch: dbMission.branches ? {
      id: dbMission.branches.id,
      name: dbMission.branches.name,
      address: dbMission.branches.address,
      city: dbMission.branches.city,
      district: dbMission.branches.district || undefined,
      google_maps_link: dbMission.branches.google_maps_link,
      latitude: dbMission.branches.latitude || undefined,
      longitude: dbMission.branches.longitude || undefined,
      status: dbMission.branches.status as 'pending_verification' | 'verified' | 'rejected',
      rejection_reason: dbMission.branches.rejection_reason || undefined,
      created_at: dbMission.branches.created_at,
      updated_at: dbMission.branches.updated_at,
    } : undefined,
    status: dbMission.status as MissionStatus,
    questions: dbMission.questions as Question[],
    photo_requirements: dbMission.photo_requirements as PhotoRequirements,
    number_of_visits: dbMission.number_of_visits,
    purchase_budget_per_visit: dbMission.purchase_budget_per_visit,
    total_purchase_budget: dbMission.total_purchase_budget,
    visits_completed: dbMission.visits_completed,
    visits_pending: dbMission.visits_pending,
    budget_used: dbMission.budget_used,
    created_at: dbMission.created_at,
    updated_at: dbMission.updated_at,
    published_at: dbMission.published_at || undefined,
  };
}

export function useMissionsData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all missions
  const { data: missions = [], isLoading } = useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          branches (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(mapDbMissionToMission);
    },
  });

  // Get single mission
  const getMission = (id: string) => {
    return missions.find((m) => m.id === id);
  };

  // Create mission
  const createMissionMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      branch_id: string;
      agent_tier?: AgentTier;
      questions: Question[];
      photo_requirements: PhotoRequirements;
      number_of_visits: number;
      visit_schedules?: VisitSchedule[];
      purchase_budget_per_visit: number;
      purchase_item_name?: string;
      is_geo_tagged?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const totalBudget = data.number_of_visits * data.purchase_budget_per_visit;

      const insertData = {
        user_id: user.id,
        name: data.name,
        branch_id: data.branch_id,
        agent_tier: data.agent_tier || 'C',
        questions: JSON.parse(JSON.stringify(data.questions)),
        photo_requirements: JSON.parse(JSON.stringify(data.photo_requirements)),
        number_of_visits: data.number_of_visits,
        visit_schedules: data.visit_schedules ? JSON.parse(JSON.stringify(data.visit_schedules)) : [],
        purchase_budget_per_visit: data.purchase_budget_per_visit,
        purchase_item_name: data.purchase_item_name,
        total_purchase_budget: totalBudget,
        is_geo_tagged: data.is_geo_tagged ?? false,
      };

      const { data: mission, error } = await supabase
        .from('missions')
        .insert(insertData as never)
        .select(`*, branches (*)`)
        .single();

      if (error) throw error;
      return mapDbMissionToMission(mission as DbMission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create mission. Please try again.',
        variant: 'destructive',
      });
      console.error('Create mission error:', error);
    },
  });

  // Update mission status
  const updateMissionStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MissionStatus }) => {
      const { error } = await supabase
        .from('missions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  // Publish mission
  const publishMissionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('missions')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  // Update mission
  const updateMissionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Mission> }) => {
      const updateData: Record<string, unknown> = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.branch_id !== undefined) updateData.branch_id = data.branch_id;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.questions !== undefined) updateData.questions = JSON.parse(JSON.stringify(data.questions));
      if (data.photo_requirements !== undefined) updateData.photo_requirements = JSON.parse(JSON.stringify(data.photo_requirements));
      if (data.number_of_visits !== undefined) updateData.number_of_visits = data.number_of_visits;
      if (data.purchase_budget_per_visit !== undefined) updateData.purchase_budget_per_visit = data.purchase_budget_per_visit;
      
      if (data.number_of_visits !== undefined && data.purchase_budget_per_visit !== undefined) {
        updateData.total_purchase_budget = data.number_of_visits * data.purchase_budget_per_visit;
      }
      
      const { error } = await supabase
        .from('missions')
        .update(updateData as never)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  // Duplicate mission
  const duplicateMissionMutation = useMutation({
    mutationFn: async (id: string) => {
      const original = missions.find((m) => m.id === id);
      if (!original) throw new Error('Mission not found');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const insertData = {
        user_id: user.id,
        name: `${original.name} (Copy)`,
        branch_id: original.branch_id,
        agent_tier: 'C',
        questions: JSON.parse(JSON.stringify(original.questions)),
        photo_requirements: JSON.parse(JSON.stringify(original.photo_requirements)),
        number_of_visits: original.number_of_visits,
        purchase_budget_per_visit: original.purchase_budget_per_visit,
        total_purchase_budget: original.total_purchase_budget,
      };

      const { data: mission, error } = await supabase
        .from('missions')
        .insert(insertData as never)
        .select(`*, branches (*)`)
        .single();

      if (error) throw error;
      return mapDbMissionToMission(mission as DbMission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  return {
    missions,
    isLoading,
    getMission,
    createMission: createMissionMutation.mutateAsync,
    updateMissionStatus: (id: string, status: MissionStatus) => 
      updateMissionStatusMutation.mutateAsync({ id, status }),
    publishMission: publishMissionMutation.mutateAsync,
    updateMission: (id: string, data: Partial<Mission>) => 
      updateMissionMutation.mutateAsync({ id, data }),
    duplicateMission: duplicateMissionMutation.mutateAsync,
  };
}
