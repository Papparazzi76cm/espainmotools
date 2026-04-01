
CREATE TABLE public.affiliates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  affiliate_id text NOT NULL UNIQUE DEFAULT 'AFF-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
  is_active boolean NOT NULL DEFAULT true,
  activated_at timestamp with time zone NOT NULL DEFAULT now(),
  deactivated_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage affiliates"
ON public.affiliates FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own affiliate status"
ON public.affiliates FOR SELECT TO authenticated
USING (auth.uid() = user_id);
