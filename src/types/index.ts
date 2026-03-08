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
export type BranchStatus = 'pending_verification' | 'verified' | 'rejected';

export interface Branch {
  id: string;
  name: string;
  name_ar?: string;
  address: string;
  address_ar?: string;
  city: string;
  district?: string;
  google_maps_link: string;
  latitude?: number;
  longitude?: number;
  status: BranchStatus;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

// Question Types
export type QuestionType = 'multiple_choice' | 'rating' | 'short_text' | 'yes_no' | 'attachment';

export interface QuestionOption {
  id: string;
  text: string | { en: string; ar: string };
}

export interface QuestionPhotoRequirement {
  enabled: boolean;
  triggerCondition?: 'low_rating' | 'negative_answer';
  ratingThreshold?: number; // Percentage threshold (e.g., 70 means trigger at <70%)
  samplePhotoUrl?: string;
  instructions?: string | { en: string; ar: string };
}

export interface AttachmentConfig {
  allowed_types?: string[]; // e.g. ['image', 'pdf', 'document']
  max_files?: number; // max number of files (default 1)
  instructions?: string | { en: string; ar: string }; // guidance for the agent
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string | { en: string; ar: string };
  required: boolean;
  options?: QuestionOption[]; // For multiple_choice
  max_rating?: number; // For rating (default 5)
  photoRequirement?: QuestionPhotoRequirement; // Per-question photo requirement
  attachment_config?: AttachmentConfig; // For attachment type
}

// Photo Requirements (general/legacy)
export interface PhotoRequirements {
  required_count: number;
  instructions?: string | { en: string; ar: string };
}

// Agent Tiers
export type AgentTier = 'A' | 'B' | 'C';

export interface AgentTierInfo {
  tier: AgentTier;
  name: string;
  description: string;
  features: string[];
  available: boolean;
  requiresUpgrade: boolean;
}

// Question Templates
export type QuestionTemplateType = 'nps' | 'csat' | 'top_2_boxes' | 'top_box' | 'overall_score';

export interface QuestionTemplate {
  id: QuestionTemplateType;
  name: string;
  description: string;
  questions: Omit<Question, 'id'>[];
}

// Mission
export type MissionStatus = 'draft' | 'published' | 'paused' | 'completed' | 'archived';

export interface Mission {
  id: string;
  name: string;
  name_ar?: string;
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

// Visit Schedule for mission creation
export interface VisitSchedule {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // Time string (HH:mm)
  duration: number; // Duration in minutes
}

// Purchase Item for mission creation
export interface PurchaseItem {
  id: string;
  name: string;
  budget: number;
}

// Form Data for Mission Creation
export interface MissionFormData {
  // Step 1: Basics
  name: string;
  name_ar?: string;
  branch_ids: string[]; // Changed to support multiple branches
  
  // Step 2: Agent Tier
  agent_tier: AgentTier;
  
  // Step 3: Questions & Photos
  questions: Question[];
  photo_requirements: PhotoRequirements;
  
  // Step 4: Visits & Funding
  number_of_visits: number;
  visit_schedules: VisitSchedule[]; // Scheduled visits with date, time, duration
  purchase_items: PurchaseItem[]; // Multiple items with individual budgets
  purchase_budget_per_visit: number; // Computed from purchase_items
  purchase_item_name?: string; // Legacy - computed from purchase_items
  
  // Geo Settings
  is_geo_tagged?: boolean;
  
  // Methodology (from template)
  methodology?: string;
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
