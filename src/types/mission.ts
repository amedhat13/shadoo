// Mission entity types

export type MissionStatus = 
  | 'draft' 
  | 'ready_for_funding' 
  | 'published' 
  | 'paused' 
  | 'expired' 
  | 'archived';

export interface Branch {
  id: string;
  name: string;
  address?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  branch_id: string;
  branch?: Branch;
  status: MissionStatus;
  start_date: string;
  end_date: string;
  quota: number;
  
  // Requirements
  quiz_id?: string;
  form_id?: string;
  required_photos_count: number;
  receipt_required: boolean;
  
  // Reward & Funding
  fixed_reward: number;
  reimbursement_cap: number;
  
  // Computed
  per_run_max_cost?: number;
  required_hold?: number;
  
  // Stats (read-only)
  completed_runs?: number;
  pending_runs?: number;
  approval_rate?: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface MissionHold {
  id: string;
  mission_id: string;
  amount: number;
  status: 'active' | 'released' | 'used';
  created_at: string;
}

export interface MissionRun {
  id: string;
  mission_id: string;
  agent_id: string;
  status: 'pending' | 'completed' | 'approved' | 'rejected';
  reward_amount: number;
  reimbursement_amount: number;
  completed_at?: string;
}

// Form types
export interface MissionFormData {
  // Step 1: Basics
  title: string;
  branch_id: string;
  description: string;
  start_date: Date | undefined;
  end_date: Date | undefined;
  quota: number;
  
  // Step 2: Requirements
  quiz_id?: string;
  form_id?: string;
  required_photos_count: number;
  
  // Step 3: Reward & Funding
  fixed_reward: number;
  reimbursement_cap: number;
}

export interface PublishResponse {
  status: MissionStatus;
  hold_amount: number;
  hold_id: string;
}
