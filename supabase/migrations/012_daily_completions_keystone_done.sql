-- Ensure daily_completions has keystone_done (fix for "column keystone_done does not exist").
-- If the table has one_thing_done (from 009), rename it. Otherwise add keystone_done.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_completions' AND column_name = 'one_thing_done'
  ) THEN
    ALTER TABLE public.daily_completions RENAME COLUMN one_thing_done TO keystone_done;
    RAISE NOTICE 'Renamed daily_completions.one_thing_done to keystone_done';
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_completions' AND column_name = 'keystone_done'
  ) THEN
    ALTER TABLE public.daily_completions ADD COLUMN keystone_done boolean NOT NULL DEFAULT false;
    RAISE NOTICE 'Added daily_completions.keystone_done';
  END IF;
END $$;

COMMENT ON COLUMN public.daily_completions.keystone_done IS 'True when user has set their Keystone (daily focus) for that day.';

-- Reload PostgREST schema cache so the API sees the new/renamed column
NOTIFY pgrst, 'reload schema';
