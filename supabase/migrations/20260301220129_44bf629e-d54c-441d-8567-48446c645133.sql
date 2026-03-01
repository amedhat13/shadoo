
-- System configuration key-value store
CREATE TABLE public.system_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key text NOT NULL UNIQUE,
  config_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage system config"
  ON public.system_config FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view system config"
  ON public.system_config FOR SELECT
  USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_system_config_updated_at
  BEFORE UPDATE ON public.system_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Notification templates table
CREATE TABLE public.notification_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key text NOT NULL UNIQUE,
  name text NOT NULL,
  name_ar text,
  description text,
  description_ar text,
  subject text NOT NULL DEFAULT '',
  subject_ar text,
  body text NOT NULL DEFAULT '',
  body_ar text,
  channel text NOT NULL DEFAULT 'email',
  is_active boolean NOT NULL DEFAULT true,
  variables jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notification templates"
  ON public.notification_templates FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view notification templates"
  ON public.notification_templates FOR SELECT
  USING (is_admin(auth.uid()));

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Cities & districts tables
CREATE TABLE public.cities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  name_ar text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active cities"
  ON public.cities FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage cities"
  ON public.cities FOR ALL
  USING (is_admin(auth.uid()));

CREATE TABLE public.districts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  name_ar text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active districts"
  ON public.districts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage districts"
  ON public.districts FOR ALL
  USING (is_admin(auth.uid()));

-- Seed default feature flags
INSERT INTO public.system_config (config_key, config_value, description) VALUES
  ('feature_new_mission_builder', '{"enabled": true}'::jsonb, 'Enhanced mission creation flow with AI suggestions'),
  ('feature_agent_mobile_v2', '{"enabled": true}'::jsonb, 'New mobile app experience for agents'),
  ('feature_multi_language', '{"enabled": false}'::jsonb, 'Arabic/English interface toggle'),
  ('feature_api_access', '{"enabled": false}'::jsonb, 'Allow enterprise clients API access'),
  ('maintenance_mode', '{"enabled": false, "message": "", "start_time": null, "end_time": null}'::jsonb, 'Maintenance mode settings');

-- Seed default notification templates
INSERT INTO public.notification_templates (template_key, name, name_ar, description, description_ar, subject, body, channel) VALUES
  ('welcome_email', 'Welcome Email', 'بريد الترحيب', 'Sent to new client signups.', 'يُرسل عند تسجيل عميل جديد.', 'Welcome to Shadoo!', 'Hello {{name}}, welcome to Shadoo platform!', 'email'),
  ('branch_verified', 'Branch Verified', 'تم التحقق من الفرع', 'Sent when admin verifies a branch.', 'يُرسل عند تحقق المسؤول من الفرع.', 'Branch Verified', 'Your branch {{branch_name}} has been verified.', 'email'),
  ('low_balance_alert', 'Low Balance Alert', 'تنبيه رصيد منخفض', 'Sent when wallet balance is low.', 'يُرسل عندما يكون رصيد المحفظة منخفضاً.', 'Low Balance Alert', 'Your wallet balance is below {{threshold}}.', 'email'),
  ('visit_completed_agent', 'Visit Completed (Agent)', 'اكتمال الزيارة (الوكيل)', 'Sent to agent after visit submission.', 'يُرسل للوكيل بعد تقديم الزيارة.', 'Visit Submitted', 'Your visit for mission {{mission_name}} has been submitted.', 'email'),
  ('mission_published', 'Mission Published', 'تم نشر المهمة', 'Sent when a mission is published.', 'يُرسل عند نشر مهمة.', 'New Mission Available', 'A new mission {{mission_name}} is available.', 'email'),
  ('visit_approved', 'Visit Approved', 'تمت الموافقة على الزيارة', 'Sent when a visit is approved.', 'يُرسل عند الموافقة على الزيارة.', 'Visit Approved', 'Your visit has been approved. Payment of {{amount}} EGP will be processed.', 'email');

-- Seed cities from egypt-locations
INSERT INTO public.cities (code, name, name_ar, sort_order) VALUES
  ('cairo', 'Cairo', 'القاهرة', 1),
  ('giza', 'Giza', 'الجيزة', 2),
  ('alexandria', 'Alexandria', 'الإسكندرية', 3),
  ('mansoura', 'Mansoura', 'المنصورة', 4),
  ('tanta', 'Tanta', 'طنطا', 5),
  ('aswan', 'Aswan', 'أسوان', 6),
  ('luxor', 'Luxor', 'الأقصر', 7),
  ('sharm-el-sheikh', 'Sharm El Sheikh', 'شرم الشيخ', 8),
  ('hurghada', 'Hurghada', 'الغردقة', 9),
  ('port-said', 'Port Said', 'بورسعيد', 10);
