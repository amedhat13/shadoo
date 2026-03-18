
ALTER TABLE public.agent_tiers ADD COLUMN icon text DEFAULT NULL;

ALTER TABLE public.visit_duration_pricing 
  RENAME COLUMN duration_minutes TO min_duration_minutes;

ALTER TABLE public.visit_duration_pricing 
  ADD COLUMN max_duration_minutes integer;

-- Backfill max_duration_minutes based on existing min values
UPDATE public.visit_duration_pricing SET max_duration_minutes = min_duration_minutes;
