
-- 1. Drop the dangerous UPDATE policy that lets users modify their own trial/payment status
DROP POLICY IF EXISTS "Users can update own trial" ON public.user_trials;

-- 2. Drop the INSERT policy (trial creation is handled by the handle_new_user_trial trigger)
DROP POLICY IF EXISTS "Users can insert own trial" ON public.user_trials;

-- 3. Add unique constraint to prevent multiple trials per user
ALTER TABLE public.user_trials ADD CONSTRAINT user_trials_user_id_unique UNIQUE (user_id);

-- 4. Create a SECURITY DEFINER function for admin/server-side trial updates
CREATE OR REPLACE FUNCTION public.mark_trial_paid(_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE user_trials SET is_paid = true WHERE user_id = _user_id;
$$;

-- 5. Create a SECURITY DEFINER function for admin/server-side trial extension
CREATE OR REPLACE FUNCTION public.update_trial_end(_user_id uuid, _trial_end timestamptz)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE user_trials SET trial_end = _trial_end WHERE user_id = _user_id;
$$;

-- 6. Add admin-only UPDATE policy so admins can still manage trials
CREATE POLICY "Admins can update trials"
ON public.user_trials
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
