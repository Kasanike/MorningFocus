-- Rename daily_completions.one_thing_done → keystone_done (product rename: One Thing → Keystone)
ALTER TABLE public.daily_completions
  RENAME COLUMN one_thing_done TO keystone_done;

COMMENT ON COLUMN public.daily_completions.keystone_done IS 'True when user has set their Keystone (daily focus) for that day.';
