/**
 * LoopOS Core Tables Migration
 *
 * Creates all core tables for LoopOS standalone app:
 * - loopos_nodes: Campaign workflow nodes
 * - loopos_notes: General notes attached to nodes
 * - loopos_journal_entries: Daily reflection journal
 * - loopos_momentum_sessions: Flow tracking sessions
 * - loopos_creative_packs: Template campaign packs
 * - loopos_playbook_chapters: Strategic playbook chapters
 * - loopos_moodboard_items: Visual reference items
 * - loopos_agent_executions: Agent skill execution history
 *
 * Design Principle: "Everything is scoped to user_id with RLS"
 */

-- ========================================
-- Nodes Table
-- ========================================

CREATE TABLE IF NOT EXISTS loopos_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'archived')),
  position jsonb, -- { x: number, y: number }
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_loopos_nodes_user_id ON loopos_nodes(user_id);
CREATE INDEX idx_loopos_nodes_status ON loopos_nodes(status);
CREATE INDEX idx_loopos_nodes_created_at ON loopos_nodes(created_at DESC);

ALTER TABLE loopos_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nodes" ON loopos_nodes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nodes" ON loopos_nodes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nodes" ON loopos_nodes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nodes" ON loopos_nodes FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE loopos_nodes;

COMMENT ON TABLE loopos_nodes IS 'Campaign workflow nodes for LoopOS timeline/canvas';

-- ========================================
-- Notes Table
-- ========================================

CREATE TABLE IF NOT EXISTS loopos_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id uuid REFERENCES loopos_nodes(id) ON DELETE CASCADE,
  content text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_loopos_notes_user_id ON loopos_notes(user_id);
CREATE INDEX idx_loopos_notes_node_id ON loopos_notes(node_id);
CREATE INDEX idx_loopos_notes_created_at ON loopos_notes(created_at DESC);

ALTER TABLE loopos_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON loopos_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON loopos_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON loopos_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON loopos_notes FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE loopos_notes;

COMMENT ON TABLE loopos_notes IS 'General notes that can be attached to nodes or standalone';

-- ========================================
-- Journal Entries Table
-- ========================================

CREATE TABLE IF NOT EXISTS loopos_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  mood text CHECK (mood IN ('inspired', 'focused', 'uncertain', 'frustrated', 'accomplished')),
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_loopos_journal_user_id ON loopos_journal_entries(user_id);
CREATE INDEX idx_loopos_journal_created_at ON loopos_journal_entries(created_at DESC);
CREATE INDEX idx_loopos_journal_mood ON loopos_journal_entries(mood);

ALTER TABLE loopos_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal entries" ON loopos_journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries" ON loopos_journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON loopos_journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" ON loopos_journal_entries FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE loopos_journal_entries;

COMMENT ON TABLE loopos_journal_entries IS 'Daily reflection journal for LoopOS';

-- ========================================
-- Momentum Sessions Table
-- ========================================

CREATE TABLE IF NOT EXISTS loopos_momentum_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  flow_score integer CHECK (flow_score >= 0 AND flow_score <= 100),
  actions_completed integer DEFAULT 0,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_loopos_momentum_user_id ON loopos_momentum_sessions(user_id);
CREATE INDEX idx_loopos_momentum_started_at ON loopos_momentum_sessions(started_at DESC);

ALTER TABLE loopos_momentum_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own momentum sessions" ON loopos_momentum_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own momentum sessions" ON loopos_momentum_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own momentum sessions" ON loopos_momentum_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own momentum sessions" ON loopos_momentum_sessions FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE loopos_momentum_sessions;

COMMENT ON TABLE loopos_momentum_sessions IS 'Flow tracking sessions for Flow Meter v3';

-- ========================================
-- Creative Packs Table
-- ========================================

CREATE TABLE IF NOT EXISTS loopos_creative_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('radio-promo', 'release-campaign', 'tour-support', 'playlist-push', 'custom')),
  template_nodes jsonb DEFAULT '[]'::jsonb,
  is_public boolean DEFAULT false,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  usage_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_loopos_packs_category ON loopos_creative_packs(category);
CREATE INDEX idx_loopos_packs_is_public ON loopos_creative_packs(is_public);
CREATE INDEX idx_loopos_packs_author_id ON loopos_creative_packs(author_id);
CREATE INDEX idx_loopos_packs_usage_count ON loopos_creative_packs(usage_count DESC);

ALTER TABLE loopos_creative_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public packs are viewable by all" ON loopos_creative_packs FOR SELECT USING (is_public = true OR auth.uid() = author_id);
CREATE POLICY "Users can insert own packs" ON loopos_creative_packs FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own packs" ON loopos_creative_packs FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own packs" ON loopos_creative_packs FOR DELETE USING (auth.uid() = author_id);

ALTER PUBLICATION supabase_realtime ADD TABLE loopos_creative_packs;

COMMENT ON TABLE loopos_creative_packs IS 'Pre-built campaign template packs';

-- ========================================
-- Playbook Chapters Table
-- ========================================

CREATE TABLE IF NOT EXISTS loopos_playbook_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  order_index integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_loopos_playbook_user_id ON loopos_playbook_chapters(user_id);
CREATE INDEX idx_loopos_playbook_order ON loopos_playbook_chapters(order_index);
CREATE INDEX idx_loopos_playbook_completed ON loopos_playbook_chapters(is_completed);

ALTER TABLE loopos_playbook_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own playbook chapters" ON loopos_playbook_chapters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own playbook chapters" ON loopos_playbook_chapters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own playbook chapters" ON loopos_playbook_chapters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own playbook chapters" ON loopos_playbook_chapters FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE loopos_playbook_chapters;

COMMENT ON TABLE loopos_playbook_chapters IS 'Strategic playbook chapters for campaign planning';

-- ========================================
-- Moodboard Items Table
-- ========================================

CREATE TABLE IF NOT EXISTS loopos_moodboard_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('image', 'link', 'text', 'colour')),
  content text NOT NULL,
  title text,
  position jsonb, -- { x: number, y: number }
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_loopos_moodboard_user_id ON loopos_moodboard_items(user_id);
CREATE INDEX idx_loopos_moodboard_type ON loopos_moodboard_items(type);
CREATE INDEX idx_loopos_moodboard_created_at ON loopos_moodboard_items(created_at DESC);

ALTER TABLE loopos_moodboard_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own moodboard items" ON loopos_moodboard_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own moodboard items" ON loopos_moodboard_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own moodboard items" ON loopos_moodboard_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own moodboard items" ON loopos_moodboard_items FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE loopos_moodboard_items;

COMMENT ON TABLE loopos_moodboard_items IS 'Visual reference items for moodboard';

-- ========================================
-- Agent Executions Table
-- ========================================

CREATE TABLE IF NOT EXISTS loopos_agent_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id text NOT NULL,
  input jsonb NOT NULL,
  output jsonb,
  success boolean NOT NULL,
  error text,
  duration_ms integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_loopos_agent_exec_user_id ON loopos_agent_executions(user_id);
CREATE INDEX idx_loopos_agent_exec_skill_id ON loopos_agent_executions(skill_id);
CREATE INDEX idx_loopos_agent_exec_created_at ON loopos_agent_executions(created_at DESC);
CREATE INDEX idx_loopos_agent_exec_success ON loopos_agent_executions(success);

ALTER TABLE loopos_agent_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own agent executions" ON loopos_agent_executions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own agent executions" ON loopos_agent_executions FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE loopos_agent_executions;

COMMENT ON TABLE loopos_agent_executions IS 'Agent skill execution history and audit log';

-- ========================================
-- Triggers for updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_loopos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER loopos_nodes_updated_at BEFORE UPDATE ON loopos_nodes FOR EACH ROW EXECUTE FUNCTION update_loopos_updated_at();
CREATE TRIGGER loopos_notes_updated_at BEFORE UPDATE ON loopos_notes FOR EACH ROW EXECUTE FUNCTION update_loopos_updated_at();
CREATE TRIGGER loopos_journal_updated_at BEFORE UPDATE ON loopos_journal_entries FOR EACH ROW EXECUTE FUNCTION update_loopos_updated_at();
CREATE TRIGGER loopos_packs_updated_at BEFORE UPDATE ON loopos_creative_packs FOR EACH ROW EXECUTE FUNCTION update_loopos_updated_at();
CREATE TRIGGER loopos_playbook_updated_at BEFORE UPDATE ON loopos_playbook_chapters FOR EACH ROW EXECUTE FUNCTION update_loopos_updated_at();
CREATE TRIGGER loopos_moodboard_updated_at BEFORE UPDATE ON loopos_moodboard_items FOR EACH ROW EXECUTE FUNCTION update_loopos_updated_at();
