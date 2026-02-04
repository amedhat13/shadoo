-- Add schedule_id to visits table to link each visit to a specific scheduled slot
-- This allows tracking which scheduled visit slot an agent is completing
ALTER TABLE public.visits
ADD COLUMN schedule_id text NULL;

-- Add scheduled_date, scheduled_time, scheduled_duration for denormalized access
-- These are copied from the mission's visit_schedules when the visit is assigned
ALTER TABLE public.visits
ADD COLUMN scheduled_date date NULL,
ADD COLUMN scheduled_time time NULL,
ADD COLUMN scheduled_duration integer NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.visits.schedule_id IS 'ID referencing a specific entry in the mission visit_schedules JSONB array';
COMMENT ON COLUMN public.visits.scheduled_date IS 'The scheduled date for this visit (copied from mission visit_schedules)';
COMMENT ON COLUMN public.visits.scheduled_time IS 'The scheduled time for this visit (copied from mission visit_schedules)';
COMMENT ON COLUMN public.visits.scheduled_duration IS 'Expected duration in minutes for this visit (copied from mission visit_schedules)';