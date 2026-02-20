-- =============================================================================
-- Profiles: plan 'pro', subscription and Stripe columns
-- Run after 002. Safe to run multiple times (adds columns if missing).
-- =============================================================================

-- Allow 'pro' in plan (migrate from 'paid' if present)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'pro'));

-- Migrate existing 'paid' to 'pro'
UPDATE public.profiles SET plan = 'pro' WHERE plan = 'paid';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

COMMENT ON COLUMN public.profiles.plan IS 'User plan: free or pro (subscription active)';
COMMENT ON COLUMN public.profiles.subscription_start IS 'When the current subscription period started';
COMMENT ON COLUMN public.profiles.subscription_end IS 'When the current subscription period ends';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer id for this user';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Stripe subscription id (active or last)';
