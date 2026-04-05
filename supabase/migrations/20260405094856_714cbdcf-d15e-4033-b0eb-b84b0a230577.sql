
CREATE TABLE public.country_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code text NOT NULL UNIQUE,
  country_name text NOT NULL,
  flag_emoji text NOT NULL DEFAULT '',
  currency_code text NOT NULL DEFAULT 'EUR',
  currency_symbol text NOT NULL DEFAULT '€',
  legislation jsonb NOT NULL DEFAULT '{}',
  tax_config jsonb NOT NULL DEFAULT '{}',
  terminology jsonb NOT NULL DEFAULT '{}',
  legal_references text NOT NULL DEFAULT '',
  ai_context_prompt text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.country_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active country configs"
  ON public.country_config FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage country configs"
  ON public.country_config FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_country_config_updated_at
  BEFORE UPDATE ON public.country_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
