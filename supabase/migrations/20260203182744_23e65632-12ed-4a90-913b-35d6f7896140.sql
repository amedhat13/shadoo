-- Add trial_visits_allowed column to track free trial visit limit
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS trial_visits_allowed integer DEFAULT NULL;

-- Add status 'trial' as valid option (already in use via the insert)