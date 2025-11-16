-- Phase 13A: OS Evolution System
-- Tables for tracking evolving OS personalities over time

-- ============================================================================
-- os_evolution_profiles
-- Stores evolving personality parameters per OS per user
-- ============================================================================

CREATE TABLE IF NOT EXISTS os_evolution_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID, -- Nullable: can be global or per-campaign
  os TEXT NOT NULL CHECK (os IN ('ascii', 'xp', 'aqua', 'daw', 'analogue')),

  -- Personality parameters (0-1 scale)
  confidence_level FLOAT NOT NULL DEFAULT 0.5 CHECK (confidence_level >= 0 AND confidence_level <= 1),
  verbosity FLOAT NOT NULL DEFAULT 0.5 CHECK (verbosity >= 0 AND verbosity <= 1),
  risk_tolerance FLOAT NOT NULL DEFAULT 0.5 CHECK (risk_tolerance >= 0 AND risk_tolerance <= 1),
  empathy_level FLOAT NOT NULL DEFAULT 0.5 CHECK (empathy_level >= 0 AND empathy_level <= 1),

  -- Emotional bias weights (JSONB for flexibility)
  emotional_bias JSONB NOT NULL DEFAULT '{
    "hope": 0.2,
    "doubt": 0.2,
    "clarity": 0.2,
    "pride": 0.2,
    "fear": 0.2
  }'::jsonb,

  -- DAW-specific: tempo preference (60-180 bpm)
  tempo_preference FLOAT DEFAULT 120 CHECK (tempo_preference >= 60 AND tempo_preference <= 180),

  -- Historical changes for visualization
  drift_history JSONB NOT NULL DEFAULT '[]'::jsonb,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One profile per user+campaign+os combination
  UNIQUE(user_id, campaign_id, os)
);

-- ============================================================================
-- os_evolution_events
-- Logs micro-adjustments as they happen
-- ============================================================================

CREATE TABLE IF NOT EXISTS os_evolution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID, -- Nullable
  os TEXT NOT NULL CHECK (os IN ('ascii', 'xp', 'aqua', 'daw', 'analogue')),

  -- Event classification
  event_type TEXT NOT NULL CHECK (event_type IN (
    'memory',
    'fusion_agreement',
    'fusion_tension',
    'loop_feedback',
    'agent_success',
    'agent_warning',
    'user_override',
    'sentiment_shift'
  )),

  -- The incremental change
  delta JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Human-readable reasoning
  reasoning TEXT,

  -- Link to source event if applicable
  source_entity_type TEXT,
  source_entity_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_os_evolution_profiles_user_os
  ON os_evolution_profiles(user_id, os);

CREATE INDEX IF NOT EXISTS idx_os_evolution_profiles_campaign
  ON os_evolution_profiles(campaign_id) WHERE campaign_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_os_evolution_events_user_os
  ON os_evolution_events(user_id, os);

CREATE INDEX IF NOT EXISTS idx_os_evolution_events_created
  ON os_evolution_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_os_evolution_events_type
  ON os_evolution_events(event_type);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE os_evolution_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_evolution_events ENABLE ROW LEVEL SECURITY;

-- os_evolution_profiles policies
CREATE POLICY os_evolution_profiles_select ON os_evolution_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY os_evolution_profiles_insert ON os_evolution_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY os_evolution_profiles_update ON os_evolution_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY os_evolution_profiles_delete ON os_evolution_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- os_evolution_events policies
CREATE POLICY os_evolution_events_select ON os_evolution_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY os_evolution_events_insert ON os_evolution_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY os_evolution_events_delete ON os_evolution_events
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Get evolution profile with defaults
CREATE OR REPLACE FUNCTION get_os_evolution_profile(
  p_user_id UUID,
  p_os TEXT,
  p_campaign_id UUID DEFAULT NULL
)
RETURNS os_evolution_profiles
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile os_evolution_profiles;
BEGIN
  -- Try to find existing profile
  SELECT * INTO v_profile
  FROM os_evolution_profiles
  WHERE user_id = p_user_id
    AND os = p_os
    AND (campaign_id = p_campaign_id OR (campaign_id IS NULL AND p_campaign_id IS NULL));

  -- If not found, create with defaults
  IF NOT FOUND THEN
    INSERT INTO os_evolution_profiles (
      user_id,
      campaign_id,
      os
    ) VALUES (
      p_user_id,
      p_campaign_id,
      p_os
    )
    RETURNING * INTO v_profile;
  END IF;

  RETURN v_profile;
END;
$$;

-- Get recent evolution events
CREATE OR REPLACE FUNCTION get_recent_evolution_events(
  p_user_id UUID,
  p_os TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS SETOF os_evolution_events
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_os IS NULL THEN
    RETURN QUERY
    SELECT *
    FROM os_evolution_events
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT p_limit;
  ELSE
    RETURN QUERY
    SELECT *
    FROM os_evolution_events
    WHERE user_id = p_user_id
      AND os = p_os
    ORDER BY created_at DESC
    LIMIT p_limit;
  END IF;
END;
$$;

-- Get evolution statistics by OS
CREATE OR REPLACE FUNCTION get_evolution_stats_by_os(
  p_user_id UUID,
  p_campaign_id UUID DEFAULT NULL
)
RETURNS TABLE(
  os TEXT,
  event_count BIGINT,
  avg_confidence FLOAT,
  avg_risk FLOAT,
  avg_empathy FLOAT,
  last_updated TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.os,
    COUNT(e.id) as event_count,
    p.confidence_level as avg_confidence,
    p.risk_tolerance as avg_risk,
    p.empathy_level as avg_empathy,
    p.updated_at as last_updated
  FROM os_evolution_profiles p
  LEFT JOIN os_evolution_events e ON e.user_id = p.user_id AND e.os = p.os
  WHERE p.user_id = p_user_id
    AND (p_campaign_id IS NULL OR p.campaign_id = p_campaign_id)
  GROUP BY p.os, p.confidence_level, p.risk_tolerance, p.empathy_level, p.updated_at
  ORDER BY p.os;
END;
$$;
