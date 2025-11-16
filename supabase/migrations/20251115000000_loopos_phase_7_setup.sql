-- ============================================================================
-- LoopOS Phase 7: Complete Database Setup
-- ============================================================================
-- This migration creates all tables for the LoopOS app with proper RLS policies
-- covering: Workspaces, Nodes, Journal, Packs, Playbook, Flow Sessions, etc.
-- ============================================================================

-- ============================================================================
-- WORKSPACES
-- ============================================================================

CREATE TABLE IF NOT EXISTS loopos_workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loopos_workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Indices for workspaces
CREATE INDEX idx_workspace_members_workspace ON loopos_workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON loopos_workspace_members(user_id);

-- RLS for workspaces
ALTER TABLE loopos_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE loopos_workspace_members ENABLE ROW LEVEL SECURITY;

-- Workspace policies
CREATE POLICY "Users can view workspaces they belong to"
  ON loopos_workspaces FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces"
  ON loopos_workspaces FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Workspace owners can update"
  ON loopos_workspaces FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

CREATE POLICY "Workspace owners can delete"
  ON loopos_workspaces FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Workspace member policies
CREATE POLICY "Users can view workspace members"
  ON loopos_workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members AS wm
      WHERE wm.workspace_id = workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add themselves to workspaces"
  ON loopos_workspace_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can update members"
  ON loopos_workspace_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_workspace_members.workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

CREATE POLICY "Owners can remove members"
  ON loopos_workspace_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members AS wm
      WHERE wm.workspace_id = workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role = 'owner'
    )
  );

-- ============================================================================
-- NODES (Timeline Canvas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS loopos_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('idea', 'milestone', 'task', 'reference', 'insight', 'decision')),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  colour TEXT NOT NULL DEFAULT '#3AA9BE',
  position_x NUMERIC NOT NULL DEFAULT 0,
  position_y NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nodes_workspace ON loopos_nodes(workspace_id);
CREATE INDEX idx_nodes_user ON loopos_nodes(user_id);

ALTER TABLE loopos_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view nodes"
  ON loopos_nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_nodes.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create nodes"
  ON loopos_nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_nodes.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can update nodes"
  ON loopos_nodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_nodes.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can delete nodes"
  ON loopos_nodes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_nodes.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- ============================================================================
-- NOTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS loopos_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id UUID REFERENCES loopos_nodes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_workspace ON loopos_notes(workspace_id);
CREATE INDEX idx_notes_node ON loopos_notes(node_id);

ALTER TABLE loopos_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view notes"
  ON loopos_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_notes.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create notes"
  ON loopos_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_notes.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can update notes"
  ON loopos_notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_notes.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can delete notes"
  ON loopos_notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_notes.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- ============================================================================
-- JOURNAL ENTRIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS loopos_journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'voice', 'reflection')),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  voice_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_journal_workspace ON loopos_journal_entries(workspace_id);
CREATE INDEX idx_journal_user ON loopos_journal_entries(user_id);

ALTER TABLE loopos_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal entries"
  ON loopos_journal_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create journal entries"
  ON loopos_journal_entries FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_journal_entries.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own journal entries"
  ON loopos_journal_entries FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own journal entries"
  ON loopos_journal_entries FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- MOODBOARD ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS loopos_moodboard_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'colour', 'text', 'link')),
  content TEXT NOT NULL,
  image_url TEXT,
  position_x NUMERIC NOT NULL DEFAULT 0,
  position_y NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_moodboard_workspace ON loopos_moodboard_items(workspace_id);

ALTER TABLE loopos_moodboard_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view moodboard items"
  ON loopos_moodboard_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_moodboard_items.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create moodboard items"
  ON loopos_moodboard_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_moodboard_items.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can update moodboard items"
  ON loopos_moodboard_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_moodboard_items.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can delete moodboard items"
  ON loopos_moodboard_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_moodboard_items.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- ============================================================================
-- CREATIVE PACKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS loopos_creative_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_packs_workspace ON loopos_creative_packs(workspace_id);
CREATE INDEX idx_packs_category ON loopos_creative_packs(category);
CREATE INDEX idx_packs_public ON loopos_creative_packs(is_public);

ALTER TABLE loopos_creative_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public packs and workspace packs"
  ON loopos_creative_packs FOR SELECT
  USING (
    is_public = TRUE OR
    (workspace_id IS NULL) OR
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_creative_packs.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create packs"
  ON loopos_creative_packs FOR INSERT
  WITH CHECK (
    (workspace_id IS NULL AND auth.uid() IS NOT NULL) OR
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_creative_packs.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Pack creators can update"
  ON loopos_creative_packs FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_creative_packs.workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

CREATE POLICY "Pack creators can delete"
  ON loopos_creative_packs FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_creative_packs.workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- ============================================================================
-- PLAYBOOK CHAPTERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS loopos_playbook_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_playbook_workspace ON loopos_playbook_chapters(workspace_id);
CREATE INDEX idx_playbook_order ON loopos_playbook_chapters(order_index);
CREATE INDEX idx_playbook_public ON loopos_playbook_chapters(is_public);

ALTER TABLE loopos_playbook_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public chapters and workspace chapters"
  ON loopos_playbook_chapters FOR SELECT
  USING (
    is_public = TRUE OR
    (workspace_id IS NULL) OR
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_playbook_chapters.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create chapters"
  ON loopos_playbook_chapters FOR INSERT
  WITH CHECK (
    (workspace_id IS NULL AND auth.uid() IS NOT NULL) OR
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_playbook_chapters.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Owners can update chapters"
  ON loopos_playbook_chapters FOR UPDATE
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_playbook_chapters.workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

CREATE POLICY "Owners can delete chapters"
  ON loopos_playbook_chapters FOR DELETE
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_playbook_chapters.workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- ============================================================================
-- FLOW SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS loopos_flow_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flow_sessions_workspace ON loopos_flow_sessions(workspace_id);
CREATE INDEX idx_flow_sessions_user ON loopos_flow_sessions(user_id);
CREATE INDEX idx_flow_sessions_status ON loopos_flow_sessions(status);

ALTER TABLE loopos_flow_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own flow sessions"
  ON loopos_flow_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create flow sessions"
  ON loopos_flow_sessions FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_flow_sessions.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own flow sessions"
  ON loopos_flow_sessions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own flow sessions"
  ON loopos_flow_sessions FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- AGENT EXECUTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS loopos_agent_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_executions_workspace ON loopos_agent_executions(workspace_id);
CREATE INDEX idx_agent_executions_user ON loopos_agent_executions(user_id);
CREATE INDEX idx_agent_executions_status ON loopos_agent_executions(status);

ALTER TABLE loopos_agent_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agent executions"
  ON loopos_agent_executions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create agent executions"
  ON loopos_agent_executions FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_agent_executions.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own agent executions"
  ON loopos_agent_executions FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- AUTO CHAINS
-- ============================================================================

CREATE TABLE IF NOT EXISTS loopos_auto_chains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auto_chains_workspace ON loopos_auto_chains(workspace_id);
CREATE INDEX idx_auto_chains_user ON loopos_auto_chains(user_id);
CREATE INDEX idx_auto_chains_active ON loopos_auto_chains(is_active);

ALTER TABLE loopos_auto_chains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view auto chains"
  ON loopos_auto_chains FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_auto_chains.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create auto chains"
  ON loopos_auto_chains FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_auto_chains.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can update auto chains"
  ON loopos_auto_chains FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_auto_chains.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Editors can delete auto chains"
  ON loopos_auto_chains FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_auto_chains.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- ============================================================================
-- EXPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS loopos_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'docx', 'json', 'zip', 'presentation')),
  name TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exports_workspace ON loopos_exports(workspace_id);
CREATE INDEX idx_exports_user ON loopos_exports(user_id);
CREATE INDEX idx_exports_status ON loopos_exports(status);

ALTER TABLE loopos_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exports"
  ON loopos_exports FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create exports"
  ON loopos_exports FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM loopos_workspace_members
      WHERE workspace_id = loopos_exports.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own exports"
  ON loopos_exports FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own exports"
  ON loopos_exports FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables
CREATE TRIGGER update_loopos_workspaces_updated_at
  BEFORE UPDATE ON loopos_workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loopos_workspace_members_updated_at
  BEFORE UPDATE ON loopos_workspace_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loopos_nodes_updated_at
  BEFORE UPDATE ON loopos_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loopos_notes_updated_at
  BEFORE UPDATE ON loopos_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loopos_journal_entries_updated_at
  BEFORE UPDATE ON loopos_journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loopos_moodboard_items_updated_at
  BEFORE UPDATE ON loopos_moodboard_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loopos_creative_packs_updated_at
  BEFORE UPDATE ON loopos_creative_packs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loopos_playbook_chapters_updated_at
  BEFORE UPDATE ON loopos_playbook_chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loopos_flow_sessions_updated_at
  BEFORE UPDATE ON loopos_flow_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loopos_agent_executions_updated_at
  BEFORE UPDATE ON loopos_agent_executions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loopos_auto_chains_updated_at
  BEFORE UPDATE ON loopos_auto_chains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loopos_exports_updated_at
  BEFORE UPDATE ON loopos_exports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
