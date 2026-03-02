
-- Add bilingual columns to question_templates
ALTER TABLE public.question_templates
  ADD COLUMN IF NOT EXISTS name_ar text,
  ADD COLUMN IF NOT EXISTS description_ar text;
