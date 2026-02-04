-- Add visit_schedules column to store scheduled visits with date, time, and duration
ALTER TABLE public.missions
ADD COLUMN visit_schedules jsonb DEFAULT '[]'::jsonb;