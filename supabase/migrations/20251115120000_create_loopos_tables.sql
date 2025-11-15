-- LoopOS Phase 3: Core Tables with Authentication and Multi-User Support
-- Created: 2025-11-15

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- LOOPOS NODES TABLE
-- Core loop nodes with dependencies and sequencing
-- ============================================================
CREATE TABLE loopos_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Node metadata
  title TEXT NOT NULL,
  description TEXT,
  node_type TEXT NOT NULL CHECK (node_type IN ('creative', 'promotional', 'analysis', 'planning', 'custom')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'archived')),

  -- Dependencies and sequencing
  depends_on UUID[] DEFAULT '{}',
  sequence_order INTEGER,
  auto_start BOOLEAN DEFAULT false,

  -- Canvas positioning
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,

  -- Momentum impact
  momentum_value INTEGER DEFAULT 1 CHECK (momentum_value >= 0 AND momentum_value <= 10),

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_loopos_nodes_user_id ON loopos_nodes(user_id);
CREATE INDEX idx_loopos_nodes_status ON loopos_nodes(status);
CREATE INDEX idx_loopos_nodes_sequence ON loopos_nodes(sequence_order) WHERE sequence_order IS NOT NULL;
CREATE INDEX idx_loopos_nodes_depends_on ON loopos_nodes USING GIN(depends_on);
CREATE INDEX idx_loopos_nodes_tags ON loopos_nodes USING GIN(tags);

-- RLS Policies
ALTER TABLE loopos_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nodes"
  ON loopos_nodes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own nodes"
  ON loopos_nodes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nodes"
  ON loopos_nodes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nodes"
  ON loopos_nodes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- LOOPOS NOTES TABLE
-- Enhanced notes with tags and backlinks
-- ============================================================
CREATE TABLE loopos_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Note content
  title TEXT NOT NULL,
  content TEXT NOT NULL,

  -- Linking and organisation
  tags TEXT[] DEFAULT '{}',
  backlinks UUID[] DEFAULT '{}',
  linked_nodes UUID[] DEFAULT '{}',

  -- AI-generated metadata
  ai_summary TEXT,
  ai_themes TEXT[] DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_loopos_notes_user_id ON loopos_notes(user_id);
CREATE INDEX idx_loopos_notes_tags ON loopos_notes USING GIN(tags);
CREATE INDEX idx_loopos_notes_backlinks ON loopos_notes USING GIN(backlinks);
CREATE INDEX idx_loopos_notes_linked_nodes ON loopos_notes USING GIN(linked_nodes);

-- RLS Policies
ALTER TABLE loopos_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes"
  ON loopos_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
  ON loopos_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON loopos_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON loopos_notes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- LOOPOS MOMENTUM TABLE
-- User momentum tracking with decay and streaks
-- ============================================================
CREATE TABLE loopos_momentum (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Momentum state
  current_momentum INTEGER NOT NULL DEFAULT 0 CHECK (current_momentum >= 0),
  max_momentum INTEGER NOT NULL DEFAULT 100,

  -- Streak tracking
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_action_date DATE,

  -- Decay tracking
  last_decay_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decay_rate FLOAT NOT NULL DEFAULT 1.0 CHECK (decay_rate >= 0 AND decay_rate <= 10),

  -- Statistics
  total_nodes_completed INTEGER NOT NULL DEFAULT 0,
  total_sequences_completed INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_loopos_momentum_user_id ON loopos_momentum(user_id);

-- RLS Policies
ALTER TABLE loopos_momentum ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own momentum"
  ON loopos_momentum FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own momentum"
  ON loopos_momentum FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own momentum"
  ON loopos_momentum FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- LOOPOS EXPORTS TABLE
-- Console integration export tracking
-- ============================================================
CREATE TABLE loopos_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Export source
  source_type TEXT NOT NULL CHECK (source_type IN ('node', 'note', 'sequence', 'daily_action')),
  source_id UUID,

  -- Export content
  export_type TEXT NOT NULL CHECK (export_type IN ('promotion', 'analysis', 'planning', 'creative')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  suggested_date DATE,

  -- Sync status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
  sync_error TEXT,
  synced_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_loopos_exports_user_id ON loopos_exports(user_id);
CREATE INDEX idx_loopos_exports_status ON loopos_exports(status);
CREATE INDEX idx_loopos_exports_source ON loopos_exports(source_type, source_id);

-- RLS Policies
ALTER TABLE loopos_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exports"
  ON loopos_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exports"
  ON loopos_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exports"
  ON loopos_exports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exports"
  ON loopos_exports FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- LOOPOS NODE EXECUTIONS TABLE
-- History tracking for node completions
-- ============================================================
CREATE TABLE loopos_node_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES loopos_nodes(id) ON DELETE CASCADE,

  -- Execution details
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Outcome
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'skipped')),
  notes TEXT,
  momentum_gained INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_loopos_executions_user_id ON loopos_node_executions(user_id);
CREATE INDEX idx_loopos_executions_node_id ON loopos_node_executions(node_id);
CREATE INDEX idx_loopos_executions_status ON loopos_node_executions(status);

-- RLS Policies
ALTER TABLE loopos_node_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own executions"
  ON loopos_node_executions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own executions"
  ON loopos_node_executions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- LOOPOS LOOP TEMPLATES TABLE
-- Prebuilt loop sequences for quick starts
-- ============================================================
CREATE TABLE loopos_loop_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Template metadata
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Template content (serialised loop)
  template_data JSONB NOT NULL,

  -- Usage stats
  use_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_loopos_templates_category ON loopos_loop_templates(category);
CREATE INDEX idx_loopos_templates_public ON loopos_loop_templates(is_public) WHERE is_public = true;

-- RLS Policies (public templates visible to all, private only to creator)
ALTER TABLE loopos_loop_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public templates visible to all"
  ON loopos_loop_templates FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates"
  ON loopos_loop_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates"
  ON loopos_loop_templates FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own templates"
  ON loopos_loop_templates FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================================
-- TRIGGERS
-- Auto-update timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_loopos_nodes_updated_at
  BEFORE UPDATE ON loopos_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loopos_notes_updated_at
  BEFORE UPDATE ON loopos_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loopos_momentum_updated_at
  BEFORE UPDATE ON loopos_momentum
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loopos_exports_updated_at
  BEFORE UPDATE ON loopos_exports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loopos_templates_updated_at
  BEFORE UPDATE ON loopos_loop_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMMENTS
-- Table documentation
-- ============================================================
COMMENT ON TABLE loopos_nodes IS 'Core loop nodes with dependencies and sequencing for LoopOS';
COMMENT ON TABLE loopos_notes IS 'Enhanced notes with tags, backlinks, and AI organisation';
COMMENT ON TABLE loopos_momentum IS 'User momentum tracking with decay and streak mechanics';
COMMENT ON TABLE loopos_exports IS 'Console integration export tracking (preparation for future sync)';
COMMENT ON TABLE loopos_node_executions IS 'History tracking for node completions';
COMMENT ON TABLE loopos_loop_templates IS 'Prebuilt loop sequences for quick starts';
