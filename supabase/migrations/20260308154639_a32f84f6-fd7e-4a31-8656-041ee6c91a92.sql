
-- Add demographic columns to agents table
ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS education_level TEXT,
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS has_car BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_motorcycle BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS marital_status TEXT,
  ADD COLUMN IF NOT EXISTS employment_status TEXT,
  ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS specializations TEXT[] DEFAULT '{}';

-- Add demographic criteria columns to agent_tiers table
ALTER TABLE public.agent_tiers
  ADD COLUMN IF NOT EXISTS name_ar TEXT,
  ADD COLUMN IF NOT EXISTS description_ar TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6B7280',
  ADD COLUMN IF NOT EXISTS min_age INTEGER,
  ADD COLUMN IF NOT EXISTS max_age INTEGER,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS cities TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS districts TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS education_levels TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requires_car BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_motorcycle BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS marital_statuses TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS employment_statuses TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS min_experience_years INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS specializations TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS questionnaire_criteria JSONB DEFAULT '[]';

-- Add agent selection columns to missions table
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS agent_selection_mode TEXT DEFAULT 'tier',
  ADD COLUMN IF NOT EXISTS agent_custom_criteria JSONB;

-- Update existing tier seed data with new columns
UPDATE public.agent_tiers SET name_ar = 'وكيل مبتدئ', description_ar = 'وكلاء جدد يبنون سمعتهم.', color = '#92400e' WHERE tier_code = 'C';
UPDATE public.agent_tiers SET name_ar = 'وكيل عادي', description_ar = 'وكلاء ذوو خبرة وأداء جيد.', color = '#94a3b8' WHERE tier_code = 'B';
UPDATE public.agent_tiers SET name_ar = 'وكيل مميز', description_ar = 'وكلاء من الدرجة الأولى بسجل ممتاز.', color = '#f59e0b' WHERE tier_code = 'A';
