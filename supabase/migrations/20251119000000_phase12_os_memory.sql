-- Phase 12A: OS Memory & Context Persistence
-- Tables for long-term agent and OS memory storage

-- ============================================================================
-- OS MEMORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS os_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID, -- Nullable: some memories are global, some per-campaign
  os TEXT NOT NULL CHECK (os IN ('ascii', 'xp', 'aqua', 'daw', 'analogue')),
  agent TEXT CHECK (agent IN ('scout', 'coach', 'tracker', 'insight')),
  memory_type TEXT NOT NULL CHECK (memory_type IN ('fact', 'pattern', 'reflection', 'emotion', 'warning')),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  importance INT NOT NULL DEFAULT 3 CHECK (importance >= 1 AND importance <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_content CHECK (jsonb_typeof(content) = 'object')
);

-- Indexes
CREATE INDEX idx_os_memories_user_id ON os_memories(user_id);
CREATE INDEX idx_os_memories_campaign_id ON os_memories(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_os_memories_os ON os_memories(os);
CREATE INDEX idx_os_memories_agent ON os_memories(agent) WHERE agent IS NOT NULL;
CREATE INDEX idx_os_memories_type ON os_memories(memory_type);
CREATE INDEX idx_os_memories_importance ON os_memories(importance DESC);
CREATE INDEX idx_os_memories_created_at ON os_memories(created_at DESC);

-- Compound index for common queries
CREATE INDEX idx_os_memories_user_campaign_os ON os_memories(user_id, campaign_id, os, created_at DESC);
CREATE INDEX idx_os_memories_user_os_agent ON os_memories(user_id, os, agent, created_at DESC) WHERE agent IS NOT NULL;

-- RLS Policies
ALTER TABLE os_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memories"
  ON os_memories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memories"
  ON os_memories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
  ON os_memories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON os_memories
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- MEMORY LINKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS memory_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES os_memories(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('clip', 'card', 'loop', 'campaign', 'fusion_session')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_memory_links_memory_id ON memory_links(memory_id);
CREATE INDEX idx_memory_links_entity ON memory_links(entity_type, entity_id);

-- Compound index for common queries
CREATE INDEX idx_memory_links_entity_type_id ON memory_links(entity_type, entity_id, created_at DESC);

-- RLS Policies
ALTER TABLE memory_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view memory links for their memories"
  ON memory_links
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM os_memories
      WHERE os_memories.id = memory_links.memory_id
      AND os_memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create memory links for their memories"
  ON memory_links
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM os_memories
      WHERE os_memories.id = memory_links.memory_id
      AND os_memories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete memory links for their memories"
  ON memory_links
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM os_memories
      WHERE os_memories.id = memory_links.memory_id
      AND os_memories.user_id = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get memories for a specific entity
CREATE OR REPLACE FUNCTION get_memories_for_entity(
  p_user_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS SETOF os_memories
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT DISTINCT m.*
  FROM os_memories m
  INNER JOIN memory_links ml ON ml.memory_id = m.id
  WHERE m.user_id = p_user_id
  AND ml.entity_type = p_entity_type
  AND ml.entity_id = p_entity_id
  ORDER BY m.importance DESC, m.created_at DESC
  LIMIT p_limit;
$$;

-- Get recent memories for OS + Agent combination
CREATE OR REPLACE FUNCTION get_recent_memories(
  p_user_id UUID,
  p_os TEXT,
  p_agent TEXT DEFAULT NULL,
  p_campaign_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 20
)
RETURNS SETOF os_memories
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM os_memories
  WHERE user_id = p_user_id
  AND os = p_os
  AND (p_agent IS NULL OR agent = p_agent)
  AND (p_campaign_id IS NULL OR campaign_id = p_campaign_id OR campaign_id IS NULL)
  ORDER BY importance DESC, created_at DESC
  LIMIT p_limit;
$$;

-- Get memory statistics by OS
CREATE OR REPLACE FUNCTION get_memory_stats_by_os(p_user_id UUID)
RETURNS TABLE(os TEXT, total_memories BIGINT, avg_importance NUMERIC)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    os,
    COUNT(*) as total_memories,
    ROUND(AVG(importance)::numeric, 2) as avg_importance
  FROM os_memories
  WHERE user_id = p_user_id
  GROUP BY os
  ORDER BY os;
$$;

-- Delete old low-importance memories (cleanup function)
CREATE OR REPLACE FUNCTION cleanup_old_memories(
  p_user_id UUID,
  p_days_old INT DEFAULT 90,
  p_min_importance INT DEFAULT 2
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM os_memories
  WHERE user_id = p_user_id
  AND created_at < NOW() - INTERVAL '1 day' * p_days_old
  AND importance < p_min_importance;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE os_memories IS 'Long-term memory storage for OS personalities and agents';
COMMENT ON TABLE memory_links IS 'Links memories to specific entities (clips, cards, loops, campaigns)';

COMMENT ON COLUMN os_memories.campaign_id IS 'NULL for global memories, UUID for campaign-specific memories';
COMMENT ON COLUMN os_memories.agent IS 'NULL for OS-level memories, agent name for agent-specific memories';
COMMENT ON COLUMN os_memories.memory_type IS 'Type of memory: fact, pattern, reflection, emotion, warning';
COMMENT ON COLUMN os_memories.importance IS 'Importance score 1-5, used for retrieval prioritisation';
COMMENT ON COLUMN os_memories.content IS 'JSONB structured content (text, tags, links, metadata)';

COMMENT ON FUNCTION get_memories_for_entity IS 'Retrieve memories linked to a specific entity';
COMMENT ON FUNCTION get_recent_memories IS 'Get recent memories for OS/agent combination';
COMMENT ON FUNCTION get_memory_stats_by_os IS 'Get memory statistics grouped by OS';
COMMENT ON FUNCTION cleanup_old_memories IS 'Delete old low-importance memories (maintenance)';
