ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS amount_total numeric,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent text;

CREATE INDEX IF NOT EXISTS idx_donations_stripe_session ON public.donations(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_donations_reference ON public.donations(reference_id);