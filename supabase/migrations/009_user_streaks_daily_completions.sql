-- =============================================================================
-- STEP 4 — Streak tracking: user_streaks + daily_completions
-- =============================================================================

-- user_streaks: one row per user, updated when daily completion is recorded
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_completed_date date,
  total_completions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_streaks IS 'Per-user streak summary: current/longest streak, last completed date, total completions.';

CREATE INDEX IF NOT EXISTS user_streaks_user_id_idx ON public.user_streaks(user_id);

-- Auto-update updated_at on row change (reuse existing handle_updated_at)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_streaks_updated_at ON public.user_streaks;
CREATE TRIGGER user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own user_streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can insert own user_streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can update own user_streaks" ON public.user_streaks;

CREATE POLICY "Users can view own user_streaks"
  ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_streaks"
  ON public.user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_streaks"
  ON public.user_streaks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- daily_completions: one row per user per day
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_date date NOT NULL,
  protocol_done boolean NOT NULL DEFAULT false,
  constitution_done boolean NOT NULL DEFAULT false,
  one_thing_done boolean NOT NULL DEFAULT false,
  fully_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, completed_date)
);

COMMENT ON TABLE public.daily_completions IS 'Daily completion flags; fully_completed = true only when all three (protocol, constitution, one_thing) are done.';

CREATE INDEX IF NOT EXISTS daily_completions_user_date_idx
  ON public.daily_completions(user_id, completed_date DESC);

ALTER TABLE public.daily_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own daily_completions" ON public.daily_completions;
DROP POLICY IF EXISTS "Users can insert own daily_completions" ON public.daily_completions;
DROP POLICY IF EXISTS "Users can update own daily_completions" ON public.daily_completions;

CREATE POLICY "Users can view own daily_completions"
  ON public.daily_completions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily_completions"
  ON public.daily_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily_completions"
  ON public.daily_completions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
