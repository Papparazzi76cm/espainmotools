-- 1. Add DELETE policy on agency-logos storage bucket (owner-scoped)
CREATE POLICY "Users can delete own logos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'agency-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 2. Restrict country_config to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active country configs" ON public.country_config;
CREATE POLICY "Authenticated can view active country configs"
  ON public.country_config FOR SELECT TO authenticated
  USING (is_active = true);