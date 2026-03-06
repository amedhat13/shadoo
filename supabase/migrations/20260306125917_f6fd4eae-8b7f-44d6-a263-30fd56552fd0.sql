
-- 1. Agent rejection columns
ALTER TABLE public.agents 
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejection_category TEXT,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_by UUID,
  ADD COLUMN IF NOT EXISTS can_resubmit BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 2. Visit duration pricing table
CREATE TABLE IF NOT EXISTS public.visit_duration_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_code TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'SAR',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tier_code, duration_minutes)
);

ALTER TABLE public.visit_duration_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pricing" ON public.visit_duration_pricing
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active pricing" ON public.visit_duration_pricing
  FOR SELECT TO authenticated USING (is_active = true);

-- Seed default pricing
INSERT INTO public.visit_duration_pricing (tier_code, duration_minutes, price) VALUES
  ('A', 15, 50), ('A', 30, 85), ('A', 45, 115), ('A', 60, 150), ('A', 90, 200), ('A', 120, 250),
  ('B', 15, 40), ('B', 30, 70), ('B', 45, 95), ('B', 60, 125), ('B', 90, 170), ('B', 120, 210),
  ('C', 15, 30), ('C', 30, 55), ('C', 45, 75), ('C', 60, 100), ('C', 90, 135), ('C', 120, 170);

-- 3. Agent payouts: add visit link and auto-generation columns
ALTER TABLE public.agent_payouts
  ADD COLUMN IF NOT EXISTS visit_id UUID REFERENCES public.visits(id),
  ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS tier_code TEXT;

-- 4. Visits: add re-queue tracking
ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS parent_visit_id UUID REFERENCES public.visits(id),
  ADD COLUMN IF NOT EXISTS is_requeued BOOLEAN DEFAULT false;
