
-- 1. Add is_demo flag to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

-- 2. Create sales_call_requests table
CREATE TABLE public.sales_call_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  current_plan text,
  request_type text NOT NULL,
  preferred_time text,
  phone_number text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.sales_call_requests ENABLE ROW LEVEL SECURITY;

-- Clients can insert their own requests
CREATE POLICY "Users can insert their own sales requests"
ON public.sales_call_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Clients can view their own requests
CREATE POLICY "Users can view their own sales requests"
ON public.sales_call_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all sales requests"
ON public.sales_call_requests
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Admins can update requests
CREATE POLICY "Admins can update sales requests"
ON public.sales_call_requests
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

-- Admins can manage all
CREATE POLICY "Admins can manage sales requests"
ON public.sales_call_requests
FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- Update trigger for updated_at
CREATE TRIGGER update_sales_call_requests_updated_at
  BEFORE UPDATE ON public.sales_call_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
