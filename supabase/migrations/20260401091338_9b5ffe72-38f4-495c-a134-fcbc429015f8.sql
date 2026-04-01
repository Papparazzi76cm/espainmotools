
ALTER TABLE public.affiliates ADD COLUMN IF NOT EXISTS link_afiliado text;

-- Update existing affiliates to have their link
UPDATE public.affiliates SET link_afiliado = 'https://es-ace-inmotools.lovable.app/auth?ref=' || affiliate_id WHERE link_afiliado IS NULL;

-- Add referred_by to profiles to track which affiliate referred a user
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by text;
