DROP INDEX IF EXISTS public.report_metrics_user_key_idx;
CREATE UNIQUE INDEX report_metrics_user_key_idx ON public.report_metrics (user_id, metric_key);