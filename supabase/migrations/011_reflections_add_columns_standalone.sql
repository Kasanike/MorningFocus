-- Run this in Supabase SQL Editor if "Save did_complete failed" appears.
-- Adds did_complete, reflection_note, updated_at (and optional keystone_id) to reflections.

ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS did_complete BOOLEAN NULL;
ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS reflection_note TEXT NULL;
ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS keystone_id UUID NULL;
