-- =============================================================================
-- One Thing history: daily one-thing entries with optional completed flag
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.one_thing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS one_thing_history_user_date_idx
  ON public.one_thing_history (user_id, date DESC);

COMMENT ON TABLE public.one_thing_history IS 'Daily one-thing entries; last 7 days shown as history.';

ALTER TABLE public.one_thing_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own one_thing_history" ON public.one_thing_history;
DROP POLICY IF EXISTS "Users can insert own one_thing_history" ON public.one_thing_history;
DROP POLICY IF EXISTS "Users can update own one_thing_history" ON public.one_thing_history;

CREATE POLICY "Users can view own one_thing_history"
  ON public.one_thing_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own one_thing_history"
  ON public.one_thing_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own one_thing_history"
  ON public.one_thing_history FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
