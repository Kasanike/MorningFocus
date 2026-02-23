# Reflect tab – database setup

If you see **"Could not find the 'did_complete' column of 'reflections' in the schema cache"**, add the new columns and refresh Supabase's schema cache.

## Step 1: Run this SQL in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **SQL Editor**.
3. Click **New query**.
4. Paste and run:

```sql
-- Add columns required by the Reflect tab
ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS did_complete BOOLEAN NULL;
ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS reflection_note TEXT NULL;
ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.reflections ADD COLUMN IF NOT EXISTS keystone_id UUID NULL;
```

5. Click **Run**. You should see "Success. No rows returned".

## Step 2: Reload the schema cache

Supabase (PostgREST) caches the schema. After adding columns, run this in the **same SQL Editor**:

```sql
NOTIFY pgrst, 'reload schema';
```

Click **Run** again. That tells PostgREST to reload the schema so it sees `did_complete` and the other new columns.

Then try the Reflect tab again (e.g. click "Yes, I did it"). If the error persists, in **Settings → General** try **Restart project** (this also reloads the schema).
