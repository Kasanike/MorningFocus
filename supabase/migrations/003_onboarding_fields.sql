-- =============================================================================
-- Profiles: onboarding fields (age_range, profession, onboarding_completed)
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_range TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profession TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.age_range IS 'User-selected age range from onboarding';
COMMENT ON COLUMN public.profiles.profession IS 'User-selected profession from onboarding';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'True after user completes onboarding';
