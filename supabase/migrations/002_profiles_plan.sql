-- Add plan column for payment status: 'free' | 'paid'
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'paid'));

COMMENT ON COLUMN public.profiles.plan IS 'User plan: free (default) or paid (one-time purchase completed)';
