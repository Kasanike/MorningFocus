-- =============================================================================
-- Profiles: onboarding_completed for first-time wizard
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.onboarding_completed IS 'True after user completes the 3-step onboarding wizard';
