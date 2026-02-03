-- Add questionnaire_answers column to agents table for storing registration questionnaire
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS questionnaire_answers jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.agents.questionnaire_answers IS 'Stores the questionnaire responses submitted during agent registration';