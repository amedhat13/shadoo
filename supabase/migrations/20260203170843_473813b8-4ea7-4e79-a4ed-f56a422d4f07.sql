-- Fix overly permissive RLS policies

-- Drop the permissive notification insert policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a more restrictive notification insert policy
-- Only admins or the system (via service role) can insert notifications
CREATE POLICY "Admins can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- Drop the permissive audit log insert policy  
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Create a more restrictive audit log insert policy
-- Only admins can insert audit logs (service role bypasses RLS anyway)
CREATE POLICY "Admins can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));