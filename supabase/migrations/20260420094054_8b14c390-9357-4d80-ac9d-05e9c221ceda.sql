INSERT INTO storage.buckets (id, name, public) VALUES ('visit-photos', 'visit-photos', true) ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public read visit photos" ON storage.objects FOR SELECT USING (bucket_id = 'visit-photos');
CREATE POLICY "Authenticated upload visit photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'visit-photos');
CREATE POLICY "Admins manage visit photos" ON storage.objects FOR ALL USING (bucket_id = 'visit-photos' AND is_admin(auth.uid()));