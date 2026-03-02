
-- Add bilingual columns to subscription_plans
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS name_ar text,
  ADD COLUMN IF NOT EXISTS description_ar text;

-- Allow admins to manage subscription plans
CREATE POLICY "Admins can manage subscription plans"
  ON public.subscription_plans
  FOR ALL
  USING (is_admin(auth.uid()));
