CREATE POLICY "Clients can insert visits for their own missions"
ON public.visits
FOR INSERT
TO authenticated
WITH CHECK (
  mission_id IN (
    SELECT id FROM public.missions WHERE user_id = auth.uid()
  )
);