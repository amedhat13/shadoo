-- Create storage bucket for client logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-logos', 'client-logos', true);

-- Allow authenticated users to upload to client-logos bucket
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-logos');

-- Allow public read access to logos
CREATE POLICY "Public can view logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'client-logos');

-- Allow admins to delete logos
CREATE POLICY "Admins can delete logos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'client-logos' AND is_admin(auth.uid()));

-- Add logo_url to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS logo_url text;