-- =====================================================================
-- Phase 31: Creative Rhythm System
-- =====================================================================
-- Wellness-inspired awareness layer that tracks creative patterns:
-- when users write, add nodes, use coach, and return to their workspace.
--
-- Philosophy: Not productivity tracking. Just awareness.
-- Tone: Calm, non-judgmental, helpful.
-- =====================================================================

-- =====================================================================
-- 1. Activity Events Table
-- =====================================================================
-- Tracks every creative action (note, coach, node, designer, pack, login)
-- Used to detect energy windows and return patterns

CREATE TABLE loopos_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('note', 'coach', 'node', 'designer', 'pack', 'login')),
  timestamp timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_activity_events_workspace ON loopos_activity_events(workspace_id);
CREATE INDEX idx_activity_events_timestamp ON loopos_activity_events(timestamp DESC);
CREATE INDEX idx_activity_events_type ON loopos_activity_events(type);
CREATE INDEX idx_activity_events_user ON loopos_activity_events(user_id);

-- RLS: Users can only see activity for their own workspaces
ALTER TABLE loopos_activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity events in their workspaces"
  ON loopos_activity_events FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert activity events in their workspaces"
  ON loopos_activity_events FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

COMMENT ON TABLE loopos_activity_events IS 'Tracks creative activity events (note, coach, node, designer, pack, login) for rhythm analysis';
COMMENT ON COLUMN loopos_activity_events.type IS 'Type of activity: note, coach, node, designer, pack, login';
COMMENT ON COLUMN loopos_activity_events.metadata IS 'Additional context (optional, e.g., note length, coach topic)';

-- =====================================================================
-- 2. Daily Summaries Table
-- =====================================================================
-- Aggregates daily activity counts and mood (if provided)
-- Used for weekly activity charts and trend detection

CREATE TABLE loopos_daily_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  date date NOT NULL,
  entries integer NOT NULL DEFAULT 0,
  nodes_added integer NOT NULL DEFAULT 0,
  coach_messages integer NOT NULL DEFAULT 0,
  scenes_generated integer NOT NULL DEFAULT 0,
  mood text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, date)
);

-- Indexes for performance
CREATE INDEX idx_daily_summaries_workspace ON loopos_daily_summaries(workspace_id);
CREATE INDEX idx_daily_summaries_date ON loopos_daily_summaries(date DESC);

-- RLS: Users can only see summaries for their own workspaces
ALTER TABLE loopos_daily_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view daily summaries in their workspaces"
  ON loopos_daily_summaries FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert daily summaries in their workspaces"
  ON loopos_daily_summaries FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update daily summaries in their workspaces"
  ON loopos_daily_summaries FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

COMMENT ON TABLE loopos_daily_summaries IS 'Daily aggregates of creative activity (entries, nodes, coach messages, scenes)';
COMMENT ON COLUMN loopos_daily_summaries.entries IS 'Number of journal entries created';
COMMENT ON COLUMN loopos_daily_summaries.nodes_added IS 'Number of timeline nodes added';
COMMENT ON COLUMN loopos_daily_summaries.coach_messages IS 'Number of coach messages sent';
COMMENT ON COLUMN loopos_daily_summaries.scenes_generated IS 'Number of designer scenes generated';
COMMENT ON COLUMN loopos_daily_summaries.mood IS 'Optional mood indicator (calm, focused, stuck, etc.)';

-- =====================================================================
-- 3. Energy Windows Table
-- =====================================================================
-- Detects when user is most creatively active
-- Windows: early_morning, morning, afternoon, evening, late

CREATE TABLE loopos_energy_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  window text NOT NULL CHECK (window IN ('early_morning', 'morning', 'afternoon', 'evening', 'late')),
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  confidence numeric(3,2) NOT NULL DEFAULT 0.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  last_updated timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, window)
);

-- Indexes for performance
CREATE INDEX idx_energy_windows_workspace ON loopos_energy_windows(workspace_id);
CREATE INDEX idx_energy_windows_score ON loopos_energy_windows(score DESC);

-- RLS: Users can only see energy windows for their own workspaces
ALTER TABLE loopos_energy_windows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view energy windows in their workspaces"
  ON loopos_energy_windows FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert energy windows in their workspaces"
  ON loopos_energy_windows FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update energy windows in their workspaces"
  ON loopos_energy_windows FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

COMMENT ON TABLE loopos_energy_windows IS 'Detects when user is most creatively active (early_morning, morning, afternoon, evening, late)';
COMMENT ON COLUMN loopos_energy_windows.window IS 'Time window: early_morning (4-8am), morning (8-12pm), afternoon (12-5pm), evening (5-10pm), late (10pm-4am)';
COMMENT ON COLUMN loopos_energy_windows.score IS 'Activity score (0-100) for this time window';
COMMENT ON COLUMN loopos_energy_windows.confidence IS 'Confidence level (0.0-1.0) based on sample size';

-- =====================================================================
-- 4. Return Patterns Table
-- =====================================================================
-- Tracks how often user returns to their workspace
-- Detects streaks, gaps, and typical return patterns

CREATE TABLE loopos_return_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE UNIQUE,
  streak_days integer NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  last_active_date date,
  typical_gap_days integer CHECK (typical_gap_days >= 0),
  confidence numeric(3,2) NOT NULL DEFAULT 0.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_return_patterns_workspace ON loopos_return_patterns(workspace_id);
CREATE INDEX idx_return_patterns_last_active ON loopos_return_patterns(last_active_date DESC);

-- RLS: Users can only see return patterns for their own workspaces
ALTER TABLE loopos_return_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view return patterns in their workspaces"
  ON loopos_return_patterns FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert return patterns in their workspaces"
  ON loopos_return_patterns FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update return patterns in their workspaces"
  ON loopos_return_patterns FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

COMMENT ON TABLE loopos_return_patterns IS 'Tracks how often user returns to workspace (streaks, gaps, typical patterns)';
COMMENT ON COLUMN loopos_return_patterns.streak_days IS 'Current consecutive days with activity';
COMMENT ON COLUMN loopos_return_patterns.last_active_date IS 'Last date user had any activity';
COMMENT ON COLUMN loopos_return_patterns.typical_gap_days IS 'Average days between sessions (nullable until enough data)';
COMMENT ON COLUMN loopos_return_patterns.confidence IS 'Confidence level (0.0-1.0) based on historical data';

-- =====================================================================
-- Indexes for Cross-Table Queries
-- =====================================================================

-- Query: "Show me all activity in the last 7 days"
CREATE INDEX idx_activity_events_workspace_timestamp
  ON loopos_activity_events(workspace_id, timestamp DESC);

-- Query: "Get daily summaries for current week"
CREATE INDEX idx_daily_summaries_workspace_date
  ON loopos_daily_summaries(workspace_id, date DESC);

-- =====================================================================
-- Migration Complete
-- =====================================================================
-- Tables created: 4
-- RLS policies: 10 (SELECT, INSERT, UPDATE for most tables)
-- Indexes: 13 (performance-optimized)
-- Philosophy: Calm awareness, not productivity pressure
-- =====================================================================
