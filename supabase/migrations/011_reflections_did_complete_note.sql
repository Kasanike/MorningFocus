-- =============================================================================
-- Reflections: add did_complete, reflection_note, keystone_id, updated_at
-- Run after reflections table exists (create manually or from app docs if missing).
-- =============================================================================

-- Ensure reflections table exists with full schema (idempotent for new installs)
CREATE TABLE IF NOT EXISTS public.reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT current_date,
  keystone_id UUID NULL,
  did_complete BOOLEAN NULL,
  reflection_note TEXT NULL,
  keystone_text TEXT NULL,
  entry TEXT NULL,
  mood TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Add new columns to existing table (no-op if already present)
ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS keystone_id UUID NULL;
ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS did_complete BOOLEAN NULL;
ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS reflection_note TEXT NULL;
ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS entry TEXT NULL;
ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS mood TEXT NULL;
ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS keystone_text TEXT NULL;

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own reflections" ON public.reflections;
CREATE POLICY "Users can manage own reflections"
  ON public.reflections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.reflections IS 'Daily evening reflections: did_complete (keystone), reflection_note, optional legacy entry/mood.';
