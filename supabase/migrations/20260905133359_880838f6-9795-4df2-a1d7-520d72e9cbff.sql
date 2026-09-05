CREATE TABLE public.report_pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_key TEXT NOT NULL,
  label TEXT NOT NULL,
  label_ar TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_pins TO authenticated;
GRANT ALL ON public.report_pins TO service_role;

ALTER TABLE public.report_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own report pins"
ON public.report_pins FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view report pins"
ON public.report_pins FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_report_pins_updated_at
BEFORE UPDATE ON public.report_pins
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();