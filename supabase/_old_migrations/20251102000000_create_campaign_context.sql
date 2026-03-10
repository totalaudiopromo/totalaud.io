-- Phase 14.3: Campaign Context Table
-- Stores intelligent campaign context from Operator Scene

-- Create campaign_context table
CREATE TABLE IF NOT EXISTS public.campaign_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Campaign metadata
  title text NOT NULL,
  goal text NOT NULL CHECK (goal IN ('radio', 'playlist', 'press', 'growth', 'experiment')),
  horizon_days integer NOT NULL CHECK (horizon_days >= 1 AND horizon_days <= 365),

  -- Artist intelligence
  artist text,
  genre text,
  followers integer,

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.campaign_context ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own campaign contexts
CREATE POLICY "Users can view own campaign contexts"
  ON public.campaign_context
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own campaign contexts
CREATE POLICY "Users can insert own campaign contexts"
  ON public.campaign_context
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own campaign contexts
CREATE POLICY "Users can update own campaign contexts"
  ON public.campaign_context
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own campaign contexts
CREATE POLICY "Users can delete own campaign contexts"
  ON public.campaign_context
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups by user_id and created_at
CREATE INDEX idx_campaign_context_user_created
  ON public.campaign_context(user_id, created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaign_context_updated_at
  BEFORE UPDATE ON public.campaign_context
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.campaign_context IS 'Stores campaign context captured from Operator Scene during onboarding';
COMMENT ON COLUMN public.campaign_context.goal IS 'Campaign goal: radio, playlist, press, growth, or experiment';
COMMENT ON COLUMN public.campaign_context.horizon_days IS 'Campaign duration in days (1-365)';
COMMENT ON COLUMN public.campaign_context.artist IS 'Artist name detected via Spotify API';
COMMENT ON COLUMN public.campaign_context.genre IS 'Primary genre from Spotify artist data';
COMMENT ON COLUMN public.campaign_context.followers IS 'Monthly listeners count from Spotify';
