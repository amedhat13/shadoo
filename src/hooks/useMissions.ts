import { useState, useCallback } from 'react';
import { Mission, MissionStatus, Branch, Question } from '@/types';

// Mock branches (aligned with useBranches)
const mockBranches: Branch[] = [
  {
    id: 'branch-1',
    name: 'Cairo Downtown',
    address: '123 Tahrir Square',
    city: 'Cairo',
    google_maps_link: 'https://maps.google.com/?q=30.0444,31.2357',
    latitude: 30.0444,
    longitude: 31.2357,
    status: 'verified',
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
  },
  {
    id: 'branch-2',
    name: 'Alexandria Mall',
    address: '456 Corniche Road',
    city: 'Alexandria',
    google_maps_link: 'https://maps.google.com/?q=31.2001,29.9187',
    latitude: 31.2001,
    longitude: 29.9187,
    status: 'verified',
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-05T10:00:00Z',
  },
  {
    id: 'branch-3',
    name: 'Giza Plaza',
    address: '789 Pyramids Road',
    city: 'Giza',
    google_maps_link: 'https://maps.google.com/?q=29.9773,31.1325',
    latitude: 29.9773,
    longitude: 31.1325,
    status: 'pending_verification',
    created_at: '2025-01-20T10:00:00Z',
    updated_at: '2025-01-20T10:00:00Z',
  },
];

// Mock questions for demo
const sampleQuestions: Question[] = [
  {
    id: 'q1',
    type: 'yes_no',
    text: 'Was the staff friendly and welcoming?',
    required: true,
  },
  {
    id: 'q2',
    type: 'rating',
    text: 'Rate the overall cleanliness of the store',
    required: true,
    max_rating: 5,
  },
  {
    id: 'q3',
    type: 'multiple_choice',
    text: 'How long did you wait to be served?',
    required: true,
    options: [
      { id: 'opt1', text: 'Less than 2 minutes' },
      { id: 'opt2', text: '2-5 minutes' },
      { id: 'opt3', text: '5-10 minutes' },
      { id: 'opt4', text: 'More than 10 minutes' },
    ],
  },
  {
    id: 'q4',
    type: 'short_text',
    text: 'Any additional comments or observations?',
    required: false,
  },
];

// Mock missions
const mockMissions: Mission[] = [
  {
    id: 'mission-1',
    name: 'Customer Service Audit',
    branch_id: 'branch-1',
    branch: mockBranches[0],
    status: 'published',
    questions: sampleQuestions,
    photo_requirements: { required_count: 3, instructions: 'Take photos of store entrance, checkout area, and product displays' },
    number_of_visits: 20,
    purchase_budget_per_visit: 100,
    total_purchase_budget: 2000,
    visits_completed: 12,
    visits_pending: 3,
    budget_used: 1150,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-20T14:30:00Z',
    published_at: '2025-02-01T09:00:00Z',
  },
  {
    id: 'mission-2',
    name: 'Product Display Check',
    branch_id: 'branch-2',
    branch: mockBranches[1],
    status: 'draft',
    questions: sampleQuestions.slice(0, 2),
    photo_requirements: { required_count: 5, instructions: 'Photograph each product category section' },
    number_of_visits: 15,
    purchase_budget_per_visit: 50,
    total_purchase_budget: 750,
    visits_completed: 0,
    visits_pending: 0,
    budget_used: 0,
    created_at: '2025-01-28T11:00:00Z',
    updated_at: '2025-01-28T11:00:00Z',
  },
  {
    id: 'mission-3',
    name: 'Mystery Dining Experience',
    branch_id: 'branch-1',
    branch: mockBranches[0],
    status: 'paused',
    questions: sampleQuestions,
    photo_requirements: { required_count: 4, instructions: 'Photo of menu, food served, receipt, and restaurant ambiance' },
    number_of_visits: 10,
    purchase_budget_per_visit: 200,
    total_purchase_budget: 2000,
    visits_completed: 5,
    visits_pending: 1,
    budget_used: 980,
    created_at: '2025-01-10T09:00:00Z',
    updated_at: '2025-01-25T16:00:00Z',
    published_at: '2025-01-20T08:00:00Z',
  },
  {
    id: 'mission-4',
    name: 'Competitor Price Survey',
    branch_id: 'branch-3',
    branch: mockBranches[2],
    status: 'completed',
    questions: [sampleQuestions[2], sampleQuestions[3]],
    photo_requirements: { required_count: 10, instructions: 'Photograph price tags for all listed products' },
    number_of_visits: 8,
    purchase_budget_per_visit: 0,
    total_purchase_budget: 0,
    visits_completed: 8,
    visits_pending: 0,
    budget_used: 0,
    created_at: '2025-01-05T09:00:00Z',
    updated_at: '2025-01-30T16:00:00Z',
    published_at: '2025-01-06T08:00:00Z',
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
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
    
    setIsLoading(false);
  }, []);

  const createMission = useCallback(async (data: Partial<Mission>) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const totalBudget = (data.number_of_visits || 0) * (data.purchase_budget_per_visit || 0);
    
    const newMission: Mission = {
      id: `mission-${Date.now()}`,
      name: data.name || '',
      branch_id: data.branch_id || '',
      branch: mockBranches.find((b) => b.id === data.branch_id),
      status: 'draft',
      questions: data.questions || [],
      photo_requirements: data.photo_requirements || { required_count: 0 },
      number_of_visits: data.number_of_visits || 0,
      purchase_budget_per_visit: data.purchase_budget_per_visit || 0,
      total_purchase_budget: totalBudget,
      visits_completed: 0,
      visits_pending: 0,
      budget_used: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMissions((prev) => [newMission, ...prev]);
    setIsLoading(false);
    return newMission;
  }, []);

  const updateMission = useCallback(async (id: string, data: Partial<Mission>) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
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
    
    setIsLoading(false);
  }, []);

  return {
    missions,
    isLoading,
    getMission,
    updateMissionStatus,
    publishMission,
    createMission,
    updateMission,
    branches: mockBranches,
  };
}
