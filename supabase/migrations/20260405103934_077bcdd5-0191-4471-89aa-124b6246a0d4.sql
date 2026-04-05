
-- Add country_code column to profiles
ALTER TABLE public.profiles ADD COLUMN country_code text DEFAULT 'es';

-- Update handle_new_user to save country_code from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _referred_by text;
  _affiliate_user_id uuid;
  _affiliate_email text;
  _new_user_email text;
  _is_valid boolean := false;
  _country_code text;
BEGIN
  _referred_by := NEW.raw_user_meta_data->>'referred_by';
  _new_user_email := NEW.email;
  _country_code := COALESCE(NEW.raw_user_meta_data->>'country_code', 'es');

  IF _referred_by IS NOT NULL AND _referred_by != '' THEN
    SELECT a.user_id INTO _affiliate_user_id
    FROM public.affiliates a
    WHERE a.affiliate_id = _referred_by AND a.is_active = true;

    IF _affiliate_user_id IS NOT NULL THEN
      SELECT au.email INTO _affiliate_email
      FROM auth.users au WHERE au.id = _affiliate_user_id;

      IF _affiliate_email IS DISTINCT FROM _new_user_email THEN
        _is_valid := true;
      END IF;
    END IF;
  END IF;

  INSERT INTO public.profiles (user_id, full_name, country_code, referred_by, referred_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    _country_code,
    CASE WHEN _is_valid THEN _referred_by ELSE NULL END,
    CASE WHEN _is_valid THEN now() ELSE NULL END
  );
  RETURN NEW;
END;
$function$;
