-- ============================================
-- SHADOO PLATFORM: CORE DATABASE SCHEMA
-- ============================================

-- 1. Create app_role enum for RBAC
CREATE TYPE public.app_role AS ENUM (
  'super_admin', 
  'admin', 
  'support', 
  'finance', 
  'operations', 
  'client_admin', 
  'client_manager', 
  'client_viewer', 
  'agent'
);

-- 2. User Roles Table (CRITICAL: separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security Definer Function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function to check if user is any admin type
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'support', 'finance', 'operations')
  )
$$;

-- 4. Agents Table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  national_id TEXT,
  tier TEXT DEFAULT 'C' CHECK (tier IN ('A', 'B', 'C')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'banned')),
  verification_docs JSONB DEFAULT '[]',
  bank_details JSONB,
  mobile_wallet TEXT,
  total_earnings NUMERIC DEFAULT 0,
  available_balance NUMERIC DEFAULT 0,
  rating_avg NUMERIC,
  completed_visits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ,
  verified_by UUID
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- 5. Visits Table (agent mission submissions)
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'approved', 'rejected')),
  answers JSONB DEFAULT '[]',
  photos TEXT[] DEFAULT '{}',
  purchase_amount NUMERIC,
  receipt_photo TEXT,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- 6. Agent Payouts Table
CREATE TABLE public.agent_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('bank_transfer', 'mobile_wallet')),
  payment_details JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'failed', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID,
  rejection_reason TEXT,
  transaction_reference TEXT
);

ALTER TABLE public.agent_payouts ENABLE ROW LEVEL SECURITY;

-- 7. Organization Members Table (team management)
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL, -- References profiles.user_id (org owner)
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'viewer')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  invited_by UUID,
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- 8. Notifications Table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  metadata JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 9. Question Templates Table (admin-managed)
CREATE TABLE public.question_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('nps', 'csat', 'top_2_boxes', 'top_box', 'overall_score', 'custom')),
  questions JSONB NOT NULL DEFAULT '[]',
  is_public BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.question_templates ENABLE ROW LEVEL SECURITY;

-- 10. Agent Tiers Configuration Table
CREATE TABLE public.agent_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_code TEXT UNIQUE NOT NULL CHECK (tier_code IN ('A', 'B', 'C')),
  name TEXT NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]',
  commission_rate NUMERIC DEFAULT 0,
  min_completed_visits INTEGER DEFAULT 0,
  min_rating NUMERIC DEFAULT 0,
  min_subscription_plan UUID REFERENCES public.subscription_plans(id),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.agent_tiers ENABLE ROW LEVEL SECURITY;

-- 11. Audit Logs Table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('admin', 'system', 'client', 'agent')),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- User Roles Policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Super admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- Agents Policies
CREATE POLICY "Agents can view their own profile"
ON public.agents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Agents can update their own profile"
ON public.agents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all agents"
ON public.agents FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage agents"
ON public.agents FOR ALL
USING (public.is_admin(auth.uid()));

-- Visits Policies
CREATE POLICY "Agents can view their own visits"
ON public.visits FOR SELECT
USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

CREATE POLICY "Agents can insert visits"
ON public.visits FOR INSERT
WITH CHECK (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

CREATE POLICY "Agents can update their own pending visits"
ON public.visits FOR UPDATE
USING (
  agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid())
  AND status IN ('pending', 'in_progress')
);

CREATE POLICY "Clients can view visits for their missions"
ON public.visits FOR SELECT
USING (
  mission_id IN (SELECT id FROM public.missions WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can view all visits"
ON public.visits FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage visits"
ON public.visits FOR ALL
USING (public.is_admin(auth.uid()));

-- Agent Payouts Policies
CREATE POLICY "Agents can view their own payouts"
ON public.agent_payouts FOR SELECT
USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

CREATE POLICY "Agents can request payouts"
ON public.agent_payouts FOR INSERT
WITH CHECK (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all payouts"
ON public.agent_payouts FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Finance admins can manage payouts"
ON public.agent_payouts FOR ALL
USING (public.has_role(auth.uid(), 'finance') OR public.has_role(auth.uid(), 'super_admin'));

-- Organization Members Policies
CREATE POLICY "Org owners can view their members"
ON public.organization_members FOR SELECT
USING (organization_id = auth.uid());

CREATE POLICY "Org owners can manage members"
ON public.organization_members FOR ALL
USING (organization_id = auth.uid());

CREATE POLICY "Members can view their own membership"
ON public.organization_members FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all org members"
ON public.organization_members FOR SELECT
USING (public.is_admin(auth.uid()));

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Question Templates Policies
CREATE POLICY "Anyone can view public templates"
ON public.question_templates FOR SELECT
USING (is_public = true);

CREATE POLICY "Admins can manage templates"
ON public.question_templates FOR ALL
USING (public.is_admin(auth.uid()));

-- Agent Tiers Policies
CREATE POLICY "Anyone can view active tiers"
ON public.agent_tiers FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage tiers"
ON public.agent_tiers FOR ALL
USING (public.is_admin(auth.uid()));

-- Audit Logs Policies
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamps
CREATE TRIGGER update_agents_updated_at
BEFORE UPDATE ON public.agents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_question_templates_updated_at
BEFORE UPDATE ON public.question_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_tiers_updated_at
BEFORE UPDATE ON public.agent_tiers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SEED DATA: Default Agent Tiers
-- ============================================

INSERT INTO public.agent_tiers (tier_code, name, description, features, commission_rate, min_completed_visits, min_rating, sort_order)
VALUES 
  ('C', 'Standard Agent', 'Entry-level agents with basic training', '["Basic missions", "Standard support"]', 10, 0, 0, 3),
  ('B', 'Professional Agent', 'Experienced agents with proven track record', '["All Standard features", "Priority assignments", "Higher pay rate"]', 15, 20, 4.0, 2),
  ('A', 'Elite Agent', 'Top-tier agents with excellent performance', '["All Professional features", "Premium missions", "Dedicated support", "Highest pay rate"]', 20, 50, 4.5, 1);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_agents_tier ON public.agents(tier);
CREATE INDEX idx_visits_mission_id ON public.visits(mission_id);
CREATE INDEX idx_visits_agent_id ON public.visits(agent_id);
CREATE INDEX idx_visits_status ON public.visits(status);
CREATE INDEX idx_agent_payouts_agent_id ON public.agent_payouts(agent_id);
CREATE INDEX idx_agent_payouts_status ON public.agent_payouts(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read_at ON public.notifications(read_at);
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_organization_members_org_id ON public.organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON public.organization_members(user_id);