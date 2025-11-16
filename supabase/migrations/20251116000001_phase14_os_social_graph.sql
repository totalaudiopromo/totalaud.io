-- Phase 14: Emergent Identity & OS Social Graph
-- Migration: os_relationships and os_identity_snapshots tables

-- ============================================================================
-- TABLE: os_relationships
-- ============================================================================
-- Represents pairwise relationships between OSs for a given user
-- Tracks trust, synergy, tension, and influence over time

CREATE TABLE IF NOT EXISTS os_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID,

  -- OS pair (stored in alphabetical order to avoid duplicates)
  os_a TEXT NOT NULL CHECK (os_a IN ('analogue', 'aqua', 'ascii', 'daw', 'xp')),
  os_b TEXT NOT NULL CHECK (os_b IN ('analogue', 'aqua', 'ascii', 'daw', 'xp')),

  -- Relationship metrics
  trust FLOAT NOT NULL DEFAULT 0 CHECK (trust >= -1 AND trust <= 1),
  synergy FLOAT NOT NULL DEFAULT 0 CHECK (synergy >= 0 AND synergy <= 1),
  tension FLOAT NOT NULL DEFAULT 0 CHECK (tension >= 0 AND tension <= 1),
  influence_bias FLOAT NOT NULL DEFAULT 0 CHECK (influence_bias >= -1 AND influence_bias <= 1),

  -- Tracking
  data_points INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure os_a < os_b alphabetically (consistent ordering)
  CONSTRAINT os_alphabetical_order CHECK (os_a < os_b),

  -- Unique constraint per user/campaign/pair
  UNIQUE(user_id, campaign_id, os_a, os_b)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_os_relationships_user_id ON os_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_os_relationships_campaign_id ON os_relationships(campaign_id);
CREATE INDEX IF NOT EXISTS idx_os_relationships_updated_at ON os_relationships(updated_at DESC);

-- ============================================================================
-- TABLE: os_identity_snapshots
-- ============================================================================
-- Periodic snapshots of the OS social system for historical analysis

CREATE TABLE IF NOT EXISTS os_identity_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID,

  taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Identity metrics (computed from relationships)
  leader_os TEXT CHECK (leader_os IN ('ascii', 'xp', 'aqua', 'daw', 'analogue')),
  support_os TEXT[] DEFAULT '{}',
  rebel_os TEXT[] DEFAULT '{}',
  cohesion_score FLOAT CHECK (cohesion_score >= 0 AND cohesion_score <= 1),

  -- Freeform notes/summary
  notes JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_os_identity_snapshots_user_id ON os_identity_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_os_identity_snapshots_campaign_id ON os_identity_snapshots(campaign_id);
CREATE INDEX IF NOT EXISTS idx_os_identity_snapshots_taken_at ON os_identity_snapshots(taken_at DESC);

-- ============================================================================
-- RLS POLICIES: os_relationships
-- ============================================================================

ALTER TABLE os_relationships ENABLE ROW LEVEL SECURITY;

-- Users can view their own relationships
CREATE POLICY "Users can view own os_relationships"
  ON os_relationships FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own relationships
CREATE POLICY "Users can insert own os_relationships"
  ON os_relationships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own relationships
CREATE POLICY "Users can update own os_relationships"
  ON os_relationships FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own relationships
CREATE POLICY "Users can delete own os_relationships"
  ON os_relationships FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: os_identity_snapshots
-- ============================================================================

ALTER TABLE os_identity_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can view their own snapshots
CREATE POLICY "Users can view own os_identity_snapshots"
  ON os_identity_snapshots FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own snapshots
CREATE POLICY "Users can insert own os_identity_snapshots"
  ON os_identity_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own snapshots
CREATE POLICY "Users can delete own os_identity_snapshots"
  ON os_identity_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get or create a relationship between two OSs
CREATE OR REPLACE FUNCTION get_or_create_os_relationship(
  p_user_id UUID,
  p_os_a TEXT,
  p_os_b TEXT,
  p_campaign_id UUID DEFAULT NULL
)
RETURNS os_relationships AS $$
DECLARE
  v_relationship os_relationships;
  v_ordered_a TEXT;
  v_ordered_b TEXT;
BEGIN
  -- Ensure alphabetical ordering
  IF p_os_a < p_os_b THEN
    v_ordered_a := p_os_a;
    v_ordered_b := p_os_b;
  ELSE
    v_ordered_a := p_os_b;
    v_ordered_b := p_os_a;
  END IF;

  -- Try to get existing relationship
  SELECT * INTO v_relationship
  FROM os_relationships
  WHERE user_id = p_user_id
    AND campaign_id IS NOT DISTINCT FROM p_campaign_id
    AND os_a = v_ordered_a
    AND os_b = v_ordered_b;

  -- Create if doesn't exist
  IF v_relationship IS NULL THEN
    INSERT INTO os_relationships (
      user_id,
      campaign_id,
      os_a,
      os_b,
      trust,
      synergy,
      tension,
      influence_bias,
      data_points
    ) VALUES (
      p_user_id,
      p_campaign_id,
      v_ordered_a,
      v_ordered_b,
      0,
      0,
      0,
      0,
      0
    )
    RETURNING * INTO v_relationship;
  END IF;

  RETURN v_relationship;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all relationships for a user
CREATE OR REPLACE FUNCTION get_user_os_relationships(
  p_user_id UUID,
  p_campaign_id UUID DEFAULT NULL
)
RETURNS SETOF os_relationships AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM os_relationships
  WHERE user_id = p_user_id
    AND campaign_id IS NOT DISTINCT FROM p_campaign_id
  ORDER BY updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create identity snapshot
CREATE OR REPLACE FUNCTION create_identity_snapshot(
  p_user_id UUID,
  p_campaign_id UUID DEFAULT NULL
)
RETURNS os_identity_snapshots AS $$
DECLARE
  v_snapshot os_identity_snapshots;
  v_leader_os TEXT;
  v_support_os TEXT[];
  v_rebel_os TEXT[];
  v_cohesion FLOAT;
  v_avg_tension FLOAT;
BEGIN
  -- Calculate average tension
  SELECT AVG(tension) INTO v_avg_tension
  FROM os_relationships
  WHERE user_id = p_user_id
    AND campaign_id IS NOT DISTINCT FROM p_campaign_id;

  -- Cohesion = 1 - average tension
  v_cohesion := COALESCE(1 - v_avg_tension, 1);

  -- Find leader (highest avg trust + synergy, lowest tension)
  -- This is a simplified calculation; could be more sophisticated
  SELECT os_a INTO v_leader_os
  FROM (
    SELECT os_a, AVG(trust + synergy - tension) as score
    FROM os_relationships
    WHERE user_id = p_user_id
      AND campaign_id IS NOT DISTINCT FROM p_campaign_id
    GROUP BY os_a
    UNION ALL
    SELECT os_b, AVG(trust + synergy - tension) as score
    FROM os_relationships
    WHERE user_id = p_user_id
      AND campaign_id IS NOT DISTINCT FROM p_campaign_id
    GROUP BY os_b
  ) subq
  GROUP BY os_a
  ORDER BY AVG(score) DESC
  LIMIT 1;

  -- Insert snapshot
  INSERT INTO os_identity_snapshots (
    user_id,
    campaign_id,
    leader_os,
    support_os,
    rebel_os,
    cohesion_score,
    notes
  ) VALUES (
    p_user_id,
    p_campaign_id,
    v_leader_os,
    '{}',  -- Simplified for v1
    '{}',  -- Simplified for v1
    v_cohesion,
    '{}'::jsonb
  )
  RETURNING * INTO v_snapshot;

  RETURN v_snapshot;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
