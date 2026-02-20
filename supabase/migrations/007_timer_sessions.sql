CREATE TABLE timer_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  total_time_seconds integer NOT NULL,
  steps_completed integer NOT NULL,
  steps_total integer NOT NULL,
  completion_rate numeric(3,2) NOT NULL,
  step_details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timer_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON timer_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON timer_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_timer_sessions_user_date
  ON timer_sessions(user_id, date);
