-- Migration: Add OperatorOS persistence tables
-- Created: 2026-01-10

-- Create operator_layouts table if not exists
CREATE TABLE IF NOT EXISTS public.operator_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID NOT NULL,
  layout_name TEXT NOT NULL,
  windows JSONB NOT NULL DEFAULT '[]'::jsonb,
  theme TEXT NOT NULL DEFAULT 'xp',
  persona TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, workspace_id, layout_name)
);

-- Create operator_app_profiles table if not exists
CREATE TABLE IF NOT EXISTS public.operator_app_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID NOT NULL,
  app_id TEXT NOT NULL,
  preferred_layout_name TEXT,
  launch_mode TEXT DEFAULT 'floating',
  pinned BOOLEAN DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, workspace_id, app_id)
);

-- Create track_memory table if not exists
CREATE TABLE IF NOT EXISTS public.track_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  track_id UUID NOT NULL, -- Assuming UUID for now, can be TEXT if needed
  canonical_intent TEXT,
  canonical_intent_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, track_id)
);

-- Create track_memory_entries table if not exists
CREATE TABLE IF NOT EXISTS public.track_memory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_memory_id UUID REFERENCES public.track_memory(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_mode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Row Level Security for operator_layouts
ALTER TABLE public.operator_layouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own layouts" ON public.operator_layouts;
CREATE POLICY "Users can manage their own layouts" ON public.operator_layouts
  FOR ALL USING (auth.uid() = user_id);

-- Row Level Security for operator_app_profiles
ALTER TABLE public.operator_app_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own app profiles" ON public.operator_app_profiles;
CREATE POLICY "Users can manage their own app profiles" ON public.operator_app_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Row Level Security for track_memory
ALTER TABLE public.track_memory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own track memory" ON public.track_memory;
CREATE POLICY "Users can manage their own track memory" ON public.track_memory
  FOR ALL USING (auth.uid() = user_id);

-- Row Level Security for track_memory_entries
ALTER TABLE public.track_memory_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own track memory entries" ON public.track_memory_entries;
CREATE POLICY "Users can manage their own track memory entries" ON public.track_memory_entries
  FOR ALL USING (auth.uid() = user_id);

-- Ensure user_profiles has all required columns
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS operator_settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS campaigns_limit INTEGER DEFAULT 3;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_beta_user BOOLEAN DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS latest_analysis JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS onboarding_skipped_at TIMESTAMPTZ;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- Trigger for operator_layouts.updated_at
CREATE TRIGGER update_operator_layouts_updated_at
  BEFORE UPDATE ON public.operator_layouts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for operator_app_profiles.updated_at
CREATE TRIGGER update_operator_app_profiles_updated_at
  BEFORE UPDATE ON public.operator_app_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for track_memory.updated_at
CREATE TRIGGER update_track_memory_updated_at
  BEFORE UPDATE ON public.track_memory
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
