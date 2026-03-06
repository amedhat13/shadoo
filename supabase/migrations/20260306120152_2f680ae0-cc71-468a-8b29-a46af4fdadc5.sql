
-- Add methodology column to question_templates
ALTER TABLE public.question_templates ADD COLUMN IF NOT EXISTS methodology text DEFAULT NULL;

-- Add methodology column to missions  
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS methodology text DEFAULT 'custom';
