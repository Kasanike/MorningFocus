-- =============================================================================
-- Morning Focus - Supabase Schema & Row Level Security
-- Run this script in your Supabase project: SQL Editor > New Query > Paste & Run
-- =============================================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Table: user_principles
-- Stores each user's Personal Constitution (list of principles)
-- One row per user; content is a JSONB array of { id, text } objects
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_principles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Updated_at trigger for user_principles
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_principles_updated_at ON public.user_principles;
CREATE TRIGGER user_principles_updated_at
  BEFORE UPDATE ON public.user_principles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- Table: daily_focus
-- Stores each user's daily plan and optional quote override
-- One row per user per date
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_focus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  quote_override TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

DROP TRIGGER IF EXISTS daily_focus_updated_at ON public.daily_focus;
CREATE TRIGGER daily_focus_updated_at
  BEFORE UPDATE ON public.daily_focus
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- Users can ONLY access their own rows (auth.uid())
-- -----------------------------------------------------------------------------

-- Enable RLS on both tables
ALTER TABLE public.user_principles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_focus ENABLE ROW LEVEL SECURITY;

-- user_principles: SELECT, INSERT, UPDATE, DELETE only for own user_id
CREATE POLICY "Users can view own principles"
  ON public.user_principles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own principles"
  ON public.user_principles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own principles"
  ON public.user_principles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own principles"
  ON public.user_principles
  FOR DELETE
  USING (auth.uid() = user_id);

-- daily_focus: SELECT, INSERT, UPDATE, DELETE only for own user_id
CREATE POLICY "Users can view own daily focus"
  ON public.daily_focus
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily focus"
  ON public.daily_focus
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily focus"
  ON public.daily_focus
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily focus"
  ON public.daily_focus
  FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Optional: Indexes for common queries
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_principles_user_id ON public.user_principles(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_focus_user_date ON public.daily_focus(user_id, date);
