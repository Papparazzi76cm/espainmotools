
-- Add trial_activated column
ALTER TABLE public.user_trials
ADD COLUMN trial_activated boolean NOT NULL DEFAULT false;

-- Reset all existing trials to not-activated
UPDATE public.user_trials
SET trial_activated = false;

-- Recreate the trigger function to set trial_activated = false by default
CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_trials (user_id, trial_activated)
  VALUES (NEW.id, false);
  RETURN NEW;
END;
$function$;
