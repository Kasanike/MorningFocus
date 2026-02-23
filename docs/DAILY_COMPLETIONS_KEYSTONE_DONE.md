# Fix: "column daily_completions.keystone_done does not exist"

If you see **Persist completed failed** or **column daily_completions.keystone_done does not exist** (e.g. when using "Redo protocol" or when the app saves daily completion), your `daily_completions` table is missing the `keystone_done` column.

## Option A: Run the migration (recommended)

If you use Supabase CLI and run migrations:

```bash
supabase db push
```

Or run the migration file manually: `supabase/migrations/012_daily_completions_keystone_done.sql`.

## Option B: Run SQL in Supabase Dashboard

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **SQL Editor** → **New query**.
3. Paste and run:

```sql
-- Ensure daily_completions has keystone_done
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_completions' AND column_name = 'one_thing_done'
  ) THEN
    ALTER TABLE public.daily_completions RENAME COLUMN one_thing_done TO keystone_done;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'daily_completions' AND column_name = 'keystone_done'
  ) THEN
    ALTER TABLE public.daily_completions ADD COLUMN keystone_done boolean NOT NULL DEFAULT false;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
```

4. Click **Run**.

After that, "Redo protocol" and daily completion persistence should work without the keystone_done error.
