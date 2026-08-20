CREATE TABLE public.report_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  metric_key text NOT NULL,
  name text NOT NULL,
  name_ar text,
  description text,
  description_ar text,
  applies_to text[] NOT NULL DEFAULT ARRAY['rating']::text[],
  formula text NOT NULL DEFAULT 'average',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  is_system boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX report_metrics_user_key_idx ON public.report_metrics (user_id, metric_key) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX report_metrics_system_key_idx ON public.report_metrics (metric_key) WHERE user_id IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_metrics TO authenticated;
GRANT ALL ON public.report_metrics TO service_role;

ALTER TABLE public.report_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read defaults and own metrics" ON public.report_metrics
  FOR SELECT TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users insert own metrics" ON public.report_metrics
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users update own metrics" ON public.report_metrics
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users delete own metrics" ON public.report_metrics
  FOR DELETE TO authenticated
  USING ((user_id = auth.uid() AND is_system = false) OR public.is_admin(auth.uid()));

CREATE TRIGGER update_report_metrics_updated_at
  BEFORE UPDATE ON public.report_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.report_metrics (user_id, metric_key, name, name_ar, description, description_ar, applies_to, formula, config, is_active, is_system, sort_order) VALUES
(NULL, 'nps', 'NPS', 'مؤشر صافي الترويج', 'Percentage of promoters minus percentage of detractors on a 0-10 recommendation question.', 'نسبة المروجين ناقص نسبة المنتقدين على سؤال توصية من 0 إلى 10.', ARRAY['rating','yes_no']::text[], 'nps', '{"scale":10,"promoterMin":9,"detractorMax":6,"target":50,"format":"score","min":-100,"max":100}'::jsonb, true, true, 1),
(NULL, 'csat', 'CSAT', 'رضا العملاء', 'Percentage of answers rated in the top two points of the scale.', 'نسبة الإجابات في أعلى درجتين على المقياس.', ARRAY['rating','yes_no']::text[], 'top_2_box', '{"scale":5,"topBoxes":2,"target":85,"format":"percent"}'::jsonb, true, true, 2),
(NULL, 'overall_score', 'Overall Score', 'التقييم العام', 'Average of every tagged rating answer, normalised to a 0-10 scale.', 'متوسط كل تقييم مرتبط بالمؤشر، محول إلى مقياس من 0 إلى 10.', ARRAY['rating']::text[], 'average', '{"scale":10,"target":8,"format":"average"}'::jsonb, true, true, 3),
(NULL, 'top_2_box', 'Top 2 Box', 'أعلى خانتين', 'Percentage of answers in the top two boxes of the rating scale.', 'نسبة الإجابات في أعلى خانتين من مقياس التقييم.', ARRAY['rating']::text[], 'top_2_box', '{"scale":5,"topBoxes":2,"target":80,"format":"percent"}'::jsonb, true, true, 4),
(NULL, 'top_box', 'Top Box', 'أعلى خانة', 'Percentage of answers that scored the maximum rating.', 'نسبة الإجابات التي حصلت على أعلى تقييم.', ARRAY['rating']::text[], 'top_box', '{"scale":5,"topBoxes":1,"target":60,"format":"percent"}'::jsonb, true, true, 5),
(NULL, 'ces', 'CES', 'مؤشر جهد العميل', 'Average effort score on a 1-7 scale — lower means easier.', 'متوسط درجة الجهد على مقياس من 1 إلى 7 — الأقل يعني أسهل.', ARRAY['rating']::text[], 'average', '{"scale":7,"target":5.5,"format":"average"}'::jsonb, false, true, 6),
(NULL, 'compliance', 'Compliance Rate', 'نسبة الالتزام', 'Percentage of yes/no checks answered correctly (Yes).', 'نسبة أسئلة نعم/لا التي تمت الإجابة عليها بنعم.', ARRAY['yes_no']::text[], 'yes_percent', '{"target":90,"format":"percent","yesIsGood":true}'::jsonb, true, true, 7);