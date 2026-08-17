ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS checklist jsonb,
  ADD COLUMN IF NOT EXISTS question_sections jsonb,
  ADD COLUMN IF NOT EXISTS brief_sections jsonb,
  ADD COLUMN IF NOT EXISTS require_brief_ack boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS expected_minutes integer,
  ADD COLUMN IF NOT EXISTS completion_deadline_min integer,
  ADD COLUMN IF NOT EXISTS cancel_window_min integer,
  ADD COLUMN IF NOT EXISTS review_sla_hours integer,
  ADD COLUMN IF NOT EXISTS receipt jsonb;