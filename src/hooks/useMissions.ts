import { useState, useCallback, useEffect } from 'react';
import { Mission, MissionStatus, Branch, Question, AgentTier, PhotoRequirements } from '@/types';
import { supabase } from '@/integrations/supabase/client';
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

export function useMissions() {
  const { toast } = useToast();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch missions and branches from database
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (user) {
        try {
          // Fetch missions
          const { data: missionsData, error: missionsError } = await supabase
            .from('missions')
            .select(`*, branches (*)`)
            .order('created_at', { ascending: false });

          if (missionsError) throw missionsError;
          setMissions((missionsData || []).map((m) => mapDbMissionToMission(m as DbMission)));

          // Fetch branches
          const { data: branchesData, error: branchesError } = await supabase
            .from('branches')
            .select('*')
            .order('created_at', { ascending: false });

          if (branchesError) throw branchesError;
          if (branchesData && branchesData.length > 0) {
            setBranches(branchesData.map((b) => ({
              id: b.id,
              name: b.name,
              address: b.address,
              city: b.city,
              district: b.district || undefined,
              google_maps_link: b.google_maps_link,
              latitude: b.latitude || undefined,
              longitude: b.longitude || undefined,
              status: b.status as 'pending_verification' | 'verified' | 'rejected',
              rejection_reason: b.rejection_reason || undefined,
              created_at: b.created_at,
              updated_at: b.updated_at,
            })));
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
      setIsLoading(false);
    }

    fetchData();
  }, []);

  const getMission = useCallback((id: string) => {
    return missions.find((m) => m.id === id);
  }, [missions]);

  const updateMissionStatus = useCallback(async (id: string, status: MissionStatus) => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const { error } = await supabase
          .from('missions')
          .update({ status })
          .eq('id', id);
        if (error) throw error;
      }
      
      setMissions((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, status, updated_at: new Date().toISOString() }
            : m
        )
      );
    } catch (error) {
      console.error('Error updating mission status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const publishMission = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      
      if (isAuthenticated) {
        const { error } = await supabase
          .from('missions')
          .update({ status: 'published', published_at: now })
          .eq('id', id);
        if (error) throw error;
      }
      
      setMissions((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, status: 'published' as MissionStatus, published_at: now, updated_at: now }
            : m
        )
      );
    } catch (error) {
      console.error('Error publishing mission:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const createMission = useCallback(async (data: {
    name: string;
    branch_id: string;
    agent_tier?: AgentTier;
    questions: Question[];
    photo_requirements: PhotoRequirements;
    number_of_visits: number;
    purchase_budget_per_visit: number;
    purchase_item_name?: string;
  }): Promise<Mission> => {
    setIsLoading(true);
    try {
      const totalBudget = data.number_of_visits * data.purchase_budget_per_visit;
      
      if (isAuthenticated) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const insertData = {
          user_id: user.id,
          name: data.name,
          branch_id: data.branch_id,
          agent_tier: data.agent_tier || 'C',
          questions: JSON.parse(JSON.stringify(data.questions)),
          photo_requirements: JSON.parse(JSON.stringify(data.photo_requirements)),
          number_of_visits: data.number_of_visits,
          purchase_budget_per_visit: data.purchase_budget_per_visit,
          purchase_item_name: data.purchase_item_name,
          total_purchase_budget: totalBudget,
        };

        const { data: mission, error } = await supabase
          .from('missions')
          .insert(insertData as never)
          .select(`*, branches (*)`)
          .single();

        if (error) throw error;
        const newMission = mapDbMissionToMission(mission as DbMission);
        setMissions((prev) => [newMission, ...prev]);
        return newMission;
      } else {
        // Mock mode for unauthenticated users
        const newMission: Mission = {
          id: `mission-${Date.now()}`,
          name: data.name,
          branch_id: data.branch_id,
          branch: branches.find((b) => b.id === data.branch_id),
          status: 'draft',
          questions: data.questions,
          photo_requirements: data.photo_requirements,
          number_of_visits: data.number_of_visits,
          purchase_budget_per_visit: data.purchase_budget_per_visit,
          total_purchase_budget: totalBudget,
          visits_completed: 0,
          visits_pending: 0,
          budget_used: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setMissions((prev) => [newMission, ...prev]);
        return newMission;
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, branches]);

  const updateMission = useCallback(async (id: string, data: Partial<Mission>) => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
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
      }
      
      setMissions((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                ...data,
                total_purchase_budget: (data.number_of_visits ?? m.number_of_visits) * (data.purchase_budget_per_visit ?? m.purchase_budget_per_visit),
                updated_at: new Date().toISOString(),
              }
            : m
        )
      );
    } catch (error) {
      console.error('Error updating mission:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const duplicateMission = useCallback(async (id: string): Promise<Mission | undefined> => {
    const original = missions.find((m) => m.id === id);
    if (!original) return undefined;

    setIsLoading(true);
    try {
      if (isAuthenticated) {
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
        const newMission = mapDbMissionToMission(mission as DbMission);
        setMissions((prev) => [newMission, ...prev]);
        return newMission;
      } else {
        // Mock mode
        const duplicatedMission: Mission = {
          id: `mission-${Date.now()}`,
          name: `${original.name} (Copy)`,
          branch_id: original.branch_id,
          branch: original.branch,
          status: 'draft',
          questions: original.questions.map(q => ({ ...q, id: `${q.id}-copy-${Date.now()}` })),
          photo_requirements: { ...original.photo_requirements },
          number_of_visits: original.number_of_visits,
          purchase_budget_per_visit: original.purchase_budget_per_visit,
          total_purchase_budget: original.total_purchase_budget,
          visits_completed: 0,
          visits_pending: 0,
          budget_used: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setMissions((prev) => [duplicatedMission, ...prev]);
        return duplicatedMission;
      }
    } finally {
      setIsLoading(false);
    }
  }, [missions, isAuthenticated]);

  return {
    missions,
    isLoading,
    getMission,
    updateMissionStatus,
    publishMission,
    createMission,
    updateMission,
    duplicateMission,
    branches,
  };
}
