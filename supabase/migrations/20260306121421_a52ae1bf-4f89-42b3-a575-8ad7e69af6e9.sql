-- Add client rating fields to visits table
ALTER TABLE public.visits 
ADD COLUMN IF NOT EXISTS client_rating numeric CHECK (client_rating >= 1 AND client_rating <= 5),
ADD COLUMN IF NOT EXISTS client_feedback text,
ADD COLUMN IF NOT EXISTS rated_at timestamp with time zone;

-- Create function to recalculate agent rating_avg when a client rates a visit
CREATE OR REPLACE FUNCTION public.update_agent_rating_avg()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.client_rating IS NOT NULL AND NEW.agent_id IS NOT NULL THEN
    UPDATE public.agents
    SET rating_avg = (
      SELECT AVG(client_rating)
      FROM public.visits
      WHERE agent_id = NEW.agent_id
        AND client_rating IS NOT NULL
    )
    WHERE id = NEW.agent_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger for auto-updating agent rating
DROP TRIGGER IF EXISTS trigger_update_agent_rating ON public.visits;
CREATE TRIGGER trigger_update_agent_rating
AFTER INSERT OR UPDATE OF client_rating ON public.visits
FOR EACH ROW
EXECUTE FUNCTION public.update_agent_rating_avg();