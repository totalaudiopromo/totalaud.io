-- Phase 22: Universal Creative Memory Graph (CMG)
-- Creates graph layer for cross-campaign creative memory, pattern mining, and long-term adaptation

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 1. CMG Nodes - Individual memory/event/outcome nodes
-- =====================================================================
CREATE TABLE cmg_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID,
  node_type TEXT NOT NULL CHECK (node_type IN ('memory', 'clip', 'event', 'os_profile', 'structural_marker', 'outcome')),
  os TEXT CHECK (os IN ('ascii', 'xp', 'aqua', 'daw', 'analogue')),
  label TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
  importance INTEGER NOT NULL CHECK (importance >= 1 AND importance <= 5),
  payload JSONB DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_cmg_nodes_user_id ON cmg_nodes(user_id);
CREATE INDEX idx_cmg_nodes_node_type ON cmg_nodes(node_type);
CREATE INDEX idx_cmg_nodes_os ON cmg_nodes(os) WHERE os IS NOT NULL;
CREATE INDEX idx_cmg_nodes_occurred_at ON cmg_nodes(occurred_at);
CREATE INDEX idx_cmg_nodes_user_occurred ON cmg_nodes(user_id, occurred_at DESC);
CREATE INDEX idx_cmg_nodes_campaign ON cmg_nodes(campaign_id) WHERE campaign_id IS NOT NULL;

-- =====================================================================
-- 2. CMG Edges - Relationships between nodes
-- =====================================================================
CREATE TABLE cmg_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_node_id UUID NOT NULL REFERENCES cmg_nodes(id) ON DELETE CASCADE,
  to_node_id UUID NOT NULL REFERENCES cmg_nodes(id) ON DELETE CASCADE,
  edge_type TEXT NOT NULL CHECK (edge_type IN ('influences', 'precedes', 'resolves', 'contradicts', 'amplifies', 'relates')),
  weight FLOAT8 NOT NULL CHECK (weight >= 0 AND weight <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient graph traversal
CREATE INDEX idx_cmg_edges_user_id ON cmg_edges(user_id);
CREATE INDEX idx_cmg_edges_from_node ON cmg_edges(from_node_id);
CREATE INDEX idx_cmg_edges_to_node ON cmg_edges(to_node_id);
CREATE INDEX idx_cmg_edges_edge_type ON cmg_edges(edge_type);

-- =====================================================================
-- 3. CMG Fingerprints - Computed creative fingerprints
-- =====================================================================
CREATE TABLE cmg_fingerprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('structural', 'emotional', 'os', 'sonic', 'combined')),
  snapshot_window TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fingerprint retrieval
CREATE INDEX idx_cmg_fingerprints_user_id ON cmg_fingerprints(user_id);
CREATE INDEX idx_cmg_fingerprints_snapshot_type ON cmg_fingerprints(snapshot_type);
CREATE INDEX idx_cmg_fingerprints_snapshot_window ON cmg_fingerprints(snapshot_window);
CREATE INDEX idx_cmg_fingerprints_user_type_window ON cmg_fingerprints(user_id, snapshot_type, snapshot_window);

-- =====================================================================
-- 4. CMG Metrics - Computed metrics over time
-- =====================================================================
CREATE TABLE cmg_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  window TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for metric retrieval
CREATE INDEX idx_cmg_metrics_user_id ON cmg_metrics(user_id);
CREATE INDEX idx_cmg_metrics_metric_type ON cmg_metrics(metric_type);
CREATE INDEX idx_cmg_metrics_window ON cmg_metrics(window);
CREATE INDEX idx_cmg_metrics_user_type_window ON cmg_metrics(user_id, metric_type, window);

-- =====================================================================
-- 5. Row-Level Security (RLS) Policies
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE cmg_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cmg_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE cmg_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE cmg_metrics ENABLE ROW LEVEL SECURITY;

-- CMG Nodes policies
CREATE POLICY "Users can view their own nodes"
  ON cmg_nodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nodes"
  ON cmg_nodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nodes"
  ON cmg_nodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nodes"
  ON cmg_nodes FOR DELETE
  USING (auth.uid() = user_id);

-- CMG Edges policies
CREATE POLICY "Users can view their own edges"
  ON cmg_edges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own edges"
  ON cmg_edges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own edges"
  ON cmg_edges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own edges"
  ON cmg_edges FOR DELETE
  USING (auth.uid() = user_id);

-- CMG Fingerprints policies
CREATE POLICY "Users can view their own fingerprints"
  ON cmg_fingerprints FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fingerprints"
  ON cmg_fingerprints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fingerprints"
  ON cmg_fingerprints FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fingerprints"
  ON cmg_fingerprints FOR DELETE
  USING (auth.uid() = user_id);

-- CMG Metrics policies
CREATE POLICY "Users can view their own metrics"
  ON cmg_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics"
  ON cmg_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics"
  ON cmg_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metrics"
  ON cmg_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================================
-- 6. Helper SQL Functions
-- =====================================================================

-- Get CMG nodes for a user within a time range
CREATE OR REPLACE FUNCTION get_cmg_nodes_for_user(
  p_user_id UUID,
  p_from_ts TIMESTAMPTZ,
  p_to_ts TIMESTAMPTZ
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  campaign_id UUID,
  node_type TEXT,
  os TEXT,
  label TEXT,
  sentiment TEXT,
  importance INTEGER,
  payload JSONB,
  occurred_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.user_id,
    n.campaign_id,
    n.node_type,
    n.os,
    n.label,
    n.sentiment,
    n.importance,
    n.payload,
    n.occurred_at,
    n.created_at
  FROM cmg_nodes n
  WHERE n.user_id = p_user_id
    AND n.occurred_at >= p_from_ts
    AND n.occurred_at <= p_to_ts
  ORDER BY n.occurred_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get CMG edges for a user within a time range
CREATE OR REPLACE FUNCTION get_cmg_edges_for_user(
  p_user_id UUID,
  p_from_ts TIMESTAMPTZ,
  p_to_ts TIMESTAMPTZ
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  from_node_id UUID,
  to_node_id UUID,
  edge_type TEXT,
  weight FLOAT8,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.user_id,
    e.from_node_id,
    e.to_node_id,
    e.edge_type,
    e.weight,
    e.created_at
  FROM cmg_edges e
  INNER JOIN cmg_nodes n1 ON e.from_node_id = n1.id
  INNER JOIN cmg_nodes n2 ON e.to_node_id = n2.id
  WHERE e.user_id = p_user_id
    AND n1.occurred_at >= p_from_ts
    AND n2.occurred_at <= p_to_ts
  ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- Comments for documentation
-- =====================================================================

COMMENT ON TABLE cmg_nodes IS 'Creative Memory Graph nodes - stores memories, events, outcomes across campaigns';
COMMENT ON TABLE cmg_edges IS 'Creative Memory Graph edges - relationships between nodes';
COMMENT ON TABLE cmg_fingerprints IS 'Computed creative fingerprints for pattern recognition';
COMMENT ON TABLE cmg_metrics IS 'Time-series metrics for long-term analysis';

COMMENT ON FUNCTION get_cmg_nodes_for_user IS 'Retrieves CMG nodes for a user within a specified time range';
COMMENT ON FUNCTION get_cmg_edges_for_user IS 'Retrieves CMG edges for a user within a specified time range';
