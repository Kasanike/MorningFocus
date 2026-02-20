-- =============================================================================
-- Profiles: trial period columns and plan values (trial, expired, pro)
-- Run after existing profile migrations.
-- =============================================================================

-- Trial period columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS trial_ends TIMESTAMPTZ DEFAULT (now() + interval '7 days');

-- Plan: allow 'trial', 'expired', 'pro' and set default to 'trial'
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE public.profiles
  ALTER COLUMN plan SET DEFAULT 'trial';

-- Migrate existing rows to valid values before adding the new constraint
UPDATE public.profiles SET plan = 'trial' WHERE plan = 'free';
UPDATE public.profiles SET plan = 'trial' WHERE plan NOT IN ('trial', 'expired', 'pro');

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('trial', 'expired', 'pro'));

COMMENT ON COLUMN public.profiles.trial_start IS 'When the trial period started';
COMMENT ON COLUMN public.profiles.trial_ends IS 'When the trial period ends';
COMMENT ON COLUMN public.profiles.plan IS 'User plan: trial, expired, or pro';
