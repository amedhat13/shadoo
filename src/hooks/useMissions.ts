import { useState, useCallback } from 'react';
import { Mission, MissionStatus } from '@/types/mission';

// Mock data for demonstration
const mockBranches = [
  { id: 'branch-1', name: 'Cairo Downtown', address: '123 Tahrir Square, Cairo' },
  { id: 'branch-2', name: 'Alexandria Mall', address: '456 Corniche, Alexandria' },
  { id: 'branch-3', name: 'Giza Plaza', address: '789 Pyramids Road, Giza' },
];

const mockMissions: Mission[] = [
  {
    id: 'mission-1',
    title: 'Store Visit - Customer Service Audit',
    description: 'Evaluate customer service quality and staff responsiveness at retail locations.',
    branch_id: 'branch-1',
    branch: mockBranches[0],
    status: 'published',
    start_date: '2025-02-01',
    end_date: '2025-02-28',
    quota: 20,
    required_photos_count: 3,
    receipt_required: true,
    fixed_reward: 150,
    reimbursement_cap: 100,
    per_run_max_cost: 250,
    required_hold: 5000,
    completed_runs: 12,
    pending_runs: 3,
    approval_rate: 85,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-20T14:30:00Z',
    published_at: '2025-02-01T09:00:00Z',
  },
  {
    id: 'mission-2',
    title: 'Product Display Check',
    description: 'Verify product placement and promotional material visibility in store.',
    branch_id: 'branch-2',
    branch: mockBranches[1],
    status: 'draft',
    start_date: '2025-02-15',
    end_date: '2025-03-15',
    quota: 15,
    required_photos_count: 5,
    receipt_required: true,
    fixed_reward: 200,
    reimbursement_cap: 50,
    per_run_max_cost: 250,
    required_hold: 3750,
    completed_runs: 0,
    pending_runs: 0,
    created_at: '2025-01-28T11:00:00Z',
    updated_at: '2025-01-28T11:00:00Z',
  },
  {
    id: 'mission-3',
    title: 'Competitor Price Survey',
    description: 'Collect competitor pricing data for key products in the electronics category.',
    branch_id: 'branch-3',
    branch: mockBranches[2],
    status: 'paused',
    start_date: '2025-01-20',
    end_date: '2025-02-20',
    quota: 30,
    required_photos_count: 10,
    receipt_required: true,
    fixed_reward: 250,
    reimbursement_cap: 0,
    per_run_max_cost: 250,
    required_hold: 7500,
    completed_runs: 18,
    pending_runs: 2,
    approval_rate: 90,
    created_at: '2025-01-10T09:00:00Z',
    updated_at: '2025-01-25T16:00:00Z',
    published_at: '2025-01-20T08:00:00Z',
  },
  {
    id: 'mission-4',
    title: 'Mystery Dining Experience',
    description: 'Evaluate food quality, service speed, and overall dining experience at restaurant locations.',
    branch_id: 'branch-1',
    branch: mockBranches[0],
    status: 'ready_for_funding',
    start_date: '2025-03-01',
    end_date: '2025-03-31',
    quota: 10,
    required_photos_count: 4,
    receipt_required: true,
    fixed_reward: 300,
    reimbursement_cap: 200,
    per_run_max_cost: 500,
    required_hold: 5000,
    completed_runs: 0,
    pending_runs: 0,
    created_at: '2025-01-30T14:00:00Z',
    updated_at: '2025-01-30T14:00:00Z',
  },
];

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>(mockMissions);
  const [isLoading, setIsLoading] = useState(false);

  const getMission = useCallback((id: string) => {
    return missions.find((m) => m.id === id);
  }, [missions]);

  const updateMissionStatus = useCallback(async (id: string, status: MissionStatus) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setMissions((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status, updated_at: new Date().toISOString() }
          : m
      )
    );
    setIsLoading(false);
  }, []);

  const publishMission = useCallback(async (id: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mission = missions.find((m) => m.id === id);
    if (mission) {
      setMissions((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                status: 'published' as MissionStatus,
                published_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            : m
        )
      );
    }
    setIsLoading(false);
    return {
      status: 'published' as MissionStatus,
      hold_amount: mission?.required_hold || 0,
      hold_id: `hold-${Date.now()}`,
    };
  }, [missions]);

  const createMission = useCallback(async (data: Partial<Mission>) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const perRunMaxCost = (data.fixed_reward || 0) + (data.reimbursement_cap || 0);
    const requiredHold = (data.quota || 0) * perRunMaxCost;
    
    const newMission: Mission = {
      id: `mission-${Date.now()}`,
      title: data.title || '',
      description: data.description || '',
      branch_id: data.branch_id || '',
      branch: mockBranches.find((b) => b.id === data.branch_id),
      status: 'draft',
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      quota: data.quota || 0,
      required_photos_count: data.required_photos_count || 0,
      receipt_required: true,
      fixed_reward: data.fixed_reward || 0,
      reimbursement_cap: data.reimbursement_cap || 0,
      per_run_max_cost: perRunMaxCost,
      required_hold: requiredHold,
      completed_runs: 0,
      pending_runs: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMissions((prev) => [newMission, ...prev]);
    setIsLoading(false);
    return newMission;
  }, []);

  return {
    missions,
    isLoading,
    getMission,
    updateMissionStatus,
    publishMission,
    createMission,
    branches: mockBranches,
  };
}
