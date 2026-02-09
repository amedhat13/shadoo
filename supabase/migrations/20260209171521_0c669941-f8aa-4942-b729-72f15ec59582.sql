-- Add name_ar column to missions for bilingual support
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS name_ar text;