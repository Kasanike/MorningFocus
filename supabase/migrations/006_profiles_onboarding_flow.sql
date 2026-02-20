-- =============================================================================
-- Profiles: age_range and profession for onboarding flow
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_range TEXT,
  ADD COLUMN IF NOT EXISTS profession TEXT;

COMMENT ON COLUMN public.profiles.age_range IS 'User-selected age range from onboarding (e.g. 18-24, 25-34)';
COMMENT ON COLUMN public.profiles.profession IS 'User-selected profession from onboarding';
