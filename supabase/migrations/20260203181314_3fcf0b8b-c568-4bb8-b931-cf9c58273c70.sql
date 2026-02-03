-- Add must_change_password flag to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage profiles" 
ON public.profiles 
FOR ALL 
USING (is_admin(auth.uid()));

-- Allow admins to view all branches
CREATE POLICY "Admins can view all branches" 
ON public.branches 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Allow admins to manage all branches
CREATE POLICY "Admins can manage branches" 
ON public.branches 
FOR ALL 
USING (is_admin(auth.uid()));

-- Allow admins to view all missions
CREATE POLICY "Admins can view all missions" 
ON public.missions 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Allow admins to manage all missions
CREATE POLICY "Admins can manage missions" 
ON public.missions 
FOR ALL 
USING (is_admin(auth.uid()));

-- Allow admins to view all wallets
CREATE POLICY "Admins can view all wallets" 
ON public.wallets 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Allow admins to manage wallets
CREATE POLICY "Admins can manage wallets" 
ON public.wallets 
FOR ALL 
USING (is_admin(auth.uid()));

-- Allow admins to view all user subscriptions
CREATE POLICY "Admins can view all subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Allow admins to manage subscriptions
CREATE POLICY "Admins can manage subscriptions" 
ON public.user_subscriptions 
FOR ALL 
USING (is_admin(auth.uid()));