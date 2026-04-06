-- Re-add public policy since auth page needs it for unauthenticated users
CREATE POLICY "Anyone can view active country configs"
  ON public.country_config FOR SELECT TO public
  USING (is_active = true);

-- Drop the authenticated-only one since we need public access
DROP POLICY IF EXISTS "Authenticated can view active country configs" ON public.country_config;