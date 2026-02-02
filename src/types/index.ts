// ============= Core Entity Types =============

// Package & Subscription
export interface Package {
  id: string;
  name: string;
  visits_per_month: number;
  price_per_month: number;
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  package: Package;
  visits_used_this_month: number;
  current_period_start: string;
  current_period_end: string;
}

// Branch
export interface Branch {
  id: string;
  name: string;
  address?: string;
}

// Question Types
export type QuestionType = 'multiple_choice' | 'rating' | 'short_text' | 'yes_no';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  options?: QuestionOption[]; // For multiple_choice
  max_rating?: number; // For rating (default 5)
}

// Photo Requirements
export interface PhotoRequirements {
  required_count: number;
  instructions?: string;
}

// Mission
export type MissionStatus = 'draft' | 'published' | 'paused' | 'completed' | 'archived';

export interface Mission {
  id: string;
  name: string;
  branch_id: string;
  branch?: Branch;
  status: MissionStatus;
  
  // Questions & Photos
  questions: Question[];
  photo_requirements: PhotoRequirements;
  
  // Visits & Funding
  number_of_visits: number;
  purchase_budget_per_visit: number;
  total_purchase_budget: number; // Computed: number_of_visits × purchase_budget_per_visit
  
  // Stats
  visits_completed: number;
  visits_pending: number;
  budget_used: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// Visit (execution instance of a mission)
export interface Visit {
  id: string;
  mission_id: string;
  agent_id: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  answers: VisitAnswer[];
  photos: string[];
  purchase_amount?: number;
  submitted_at?: string;
  approved_at?: string;
}

export interface VisitAnswer {
  question_id: string;
  value: string | number | boolean;
}

// Wallet
export interface Wallet {
  id: string;
  organization_id: string;
  available_balance: number;
  allocated_to_missions: number;
  currency: string;
  updated_at: string;
}

// Form Data for Mission Creation
export interface MissionFormData {
  // Step 1: Basics
  name: string;
  branch_id: string;
  
  // Step 2: Questions & Photos
  questions: Question[];
  photo_requirements: PhotoRequirements;
  
  // Step 3: Visits & Funding
  number_of_visits: number;
  purchase_budget_per_visit: number;
}

// Computed values helper
export function getVisitsRemaining(subscription: OrganizationSubscription): number {
  return subscription.package.visits_per_month - subscription.visits_used_this_month;
}

export function getTotalPurchaseBudget(data: Pick<MissionFormData, 'number_of_visits' | 'purchase_budget_per_visit'>): number {
  return data.number_of_visits * data.purchase_budget_per_visit;
}

export function canPublishMission(
  mission: Pick<MissionFormData, 'number_of_visits' | 'purchase_budget_per_visit'>,
  subscription: OrganizationSubscription,
  wallet: Wallet
): { canPublish: boolean; reason?: string } {
  const visitsRemaining = getVisitsRemaining(subscription);
  const totalBudget = getTotalPurchaseBudget(mission);
  
  if (mission.number_of_visits > visitsRemaining) {
    return {
      canPublish: false,
      reason: `Not enough visits remaining. You need ${mission.number_of_visits} visits but only have ${visitsRemaining} remaining this month.`,
    };
  }
  
  if (totalBudget > wallet.available_balance) {
    return {
      canPublish: false,
      reason: `Insufficient wallet balance. You need ${totalBudget} EGP but only have ${wallet.available_balance} EGP available.`,
    };
  }
  
  return { canPublish: true };
}
