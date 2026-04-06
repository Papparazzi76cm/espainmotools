REVOKE ALL ON FUNCTION public.mark_trial_paid(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_trial_end(uuid, timestamp with time zone) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_trial_paid(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_trial_end(uuid, timestamp with time zone) TO service_role;