
-- Commissions table
CREATE TABLE public.commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id text NOT NULL,
  user_id uuid NOT NULL,
  payment_amount numeric(10,2) NOT NULL,
  commission_percentage numeric(5,2) NOT NULL,
  commission_amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone,
  paid_at timestamp with time zone,
  payment_reference text,
  notes text
);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all commissions"
ON public.commissions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Affiliates can view own commissions"
ON public.commissions FOR SELECT TO authenticated
USING (
  affiliate_id IN (
    SELECT a.affiliate_id FROM public.affiliates a WHERE a.user_id = auth.uid() AND a.is_active = true
  )
);

-- Affiliate settings table
CREATE TABLE public.affiliate_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commission_percentage numeric(5,2) NOT NULL DEFAULT 15.00,
  min_payout numeric(10,2) NOT NULL DEFAULT 50.00,
  commission_type text NOT NULL DEFAULT 'first_only',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.affiliate_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage affiliate settings"
ON public.affiliate_settings FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view affiliate settings"
ON public.affiliate_settings FOR SELECT TO authenticated
USING (true);

-- Insert default settings
INSERT INTO public.affiliate_settings (commission_percentage, min_payout, commission_type)
VALUES (15.00, 50.00, 'first_only');

-- Index for fast lookups
CREATE INDEX idx_commissions_affiliate_id ON public.commissions(affiliate_id);
CREATE INDEX idx_commissions_user_id ON public.commissions(user_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);
