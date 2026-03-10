-- Phase 14.6: Console Activity Tracking
-- Stores user activity metrics for adaptive hints system

-- Create console_activity table
CREATE TABLE IF NOT EXISTS public.console_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Activity metrics
  last_save_at timestamptz,
  last_agent_run_at timestamptz,
  total_agent_runs integer DEFAULT 0,
  agent_runs_by_type jsonb DEFAULT '{}'::jsonb,
  last_tab_change timestamptz,
  current_tab text,
  idle_started_at timestamptz,
  session_started_at timestamptz DEFAULT now() NOT NULL,

  -- Metadata
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.console_activity ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity
CREATE POLICY "Users can view own console activity"
  ON public.console_activity
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own activity
CREATE POLICY "Users can insert own console activity"
  ON public.console_activity
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own activity
CREATE POLICY "Users can update own console activity"
  ON public.console_activity
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own activity
CREATE POLICY "Users can delete own console activity"
  ON public.console_activity
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_console_activity_user_id
  ON public.console_activity(user_id);

CREATE INDEX idx_console_activity_session
  ON public.console_activity(user_id, session_started_at DESC);

-- Create updated_at trigger
CREATE TRIGGER update_console_activity_updated_at
  BEFORE UPDATE ON public.console_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.console_activity IS 'Tracks user activity in console for adaptive hints system (Phase 14.6)';
COMMENT ON COLUMN public.console_activity.agent_runs_by_type IS 'JSONB map of agent type to run count (e.g., {"scout": 3, "coach": 1})';
COMMENT ON COLUMN public.console_activity.idle_started_at IS 'Timestamp when user went idle (2min threshold)';
COMMENT ON COLUMN public.console_activity.session_started_at IS 'When current session began';
