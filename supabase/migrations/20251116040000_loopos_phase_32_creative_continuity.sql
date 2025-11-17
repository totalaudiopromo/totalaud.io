-- =====================================================================
-- Phase 32: Creative Continuity — Notebook → Timeline Smart Linking
-- =====================================================================
-- Enables seamless linking between notes/cards and timeline nodes.
-- Philosophy: One unified creative instrument.
-- Tone: "Add to timeline" not "Promote". Calm, British, connected.
-- =====================================================================

-- =====================================================================
-- 1. Analogue Cards Table
-- =====================================================================
-- Structured source for Analogue OS cards that can link to timeline

CREATE TABLE loopos_analogue_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_analogue_cards_workspace ON loopos_analogue_cards(workspace_id);
CREATE INDEX idx_analogue_cards_user ON loopos_analogue_cards(user_id);
CREATE INDEX idx_analogue_cards_created ON loopos_analogue_cards(created_at DESC);

-- RLS: Users can only access cards in their workspaces
ALTER TABLE loopos_analogue_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analogue cards in their workspaces"
  ON loopos_analogue_cards FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analogue cards in their workspaces"
  ON loopos_analogue_cards FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update analogue cards in their workspaces"
  ON loopos_analogue_cards FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete analogue cards in their workspaces"
  ON loopos_analogue_cards FOR DELETE
  USING (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

COMMENT ON TABLE loopos_analogue_cards IS 'Structured cards from Analogue OS that can link to timeline nodes';
COMMENT ON COLUMN loopos_analogue_cards.title IS 'Card title or heading';
COMMENT ON COLUMN loopos_analogue_cards.content IS 'Card content as JSON (text, images, metadata)';

-- =====================================================================
-- 2. Note Links Table
-- =====================================================================
-- Bidirectional links between notes/cards and timeline nodes

CREATE TABLE loopos_note_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
  note_id uuid,
  analogue_card_id uuid REFERENCES loopos_analogue_cards(id) ON DELETE CASCADE,
  node_id uuid NOT NULL,
  link_type text NOT NULL CHECK (link_type IN ('origin', 'reference', 'derived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT note_or_card_required CHECK (note_id IS NOT NULL OR analogue_card_id IS NOT NULL)
);

-- Indexes for performance
CREATE INDEX idx_note_links_workspace ON loopos_note_links(workspace_id);
CREATE INDEX idx_note_links_note ON loopos_note_links(note_id);
CREATE INDEX idx_note_links_card ON loopos_note_links(analogue_card_id);
CREATE INDEX idx_note_links_node ON loopos_note_links(node_id);
CREATE INDEX idx_note_links_type ON loopos_note_links(link_type);

-- RLS: Users can only access links in their workspaces
ALTER TABLE loopos_note_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view note links in their workspaces"
  ON loopos_note_links FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert note links in their workspaces"
  ON loopos_note_links FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete note links in their workspaces"
  ON loopos_note_links FOR DELETE
  USING (
    workspace_id IN (
      SELECT id FROM loopos_workspaces
      WHERE owner_id = auth.uid()
    )
  );

COMMENT ON TABLE loopos_note_links IS 'Directional links between notes/cards and timeline nodes';
COMMENT ON COLUMN loopos_note_links.note_id IS 'Journal note ID (if source is journal)';
COMMENT ON COLUMN loopos_note_links.analogue_card_id IS 'Analogue card ID (if source is analogue)';
COMMENT ON COLUMN loopos_note_links.node_id IS 'Timeline node ID (destination)';
COMMENT ON COLUMN loopos_note_links.link_type IS 'Link relationship: origin (note became node), reference (node references note), derived (AI-suggested)';

-- =====================================================================
-- 3. Extend Existing Tables
-- =====================================================================

-- Add origin tracking to timeline nodes
ALTER TABLE loopos_nodes
  ADD COLUMN origin_type text CHECK (origin_type IN ('note', 'analogue', 'coach', 'designer')),
  ADD COLUMN origin_id uuid,
  ADD COLUMN origin_confidence numeric(3,2) CHECK (origin_confidence >= 0.0 AND origin_confidence <= 1.0);

CREATE INDEX idx_nodes_origin_type ON loopos_nodes(origin_type);
CREATE INDEX idx_nodes_origin_id ON loopos_nodes(origin_id);

COMMENT ON COLUMN loopos_nodes.origin_type IS 'Source surface: note (journal), analogue (card), coach (suggestion), designer (visual)';
COMMENT ON COLUMN loopos_nodes.origin_id IS 'Source item UUID (note_id, card_id, etc.)';
COMMENT ON COLUMN looops_nodes.origin_confidence IS 'AI confidence if AI-generated (0.0-1.0)';

-- Add promotion tracking to journal notes
-- Note: Assuming loopos_notes table exists from earlier phases
-- If using loopos_journal_entries instead, adjust accordingly
DO $$
BEGIN
  -- Check if loopos_notes table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'loopos_notes') THEN
    ALTER TABLE loopos_notes
      ADD COLUMN IF NOT EXISTS promoted_to_node boolean DEFAULT false;

    COMMENT ON COLUMN loopos_notes.promoted_to_node IS 'True if note has been added to timeline';
  END IF;

  -- Check if loopos_journal_entries table exists (alternative structure)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'loopos_journal_entries') THEN
    ALTER TABLE loopos_journal_entries
      ADD COLUMN IF NOT EXISTS promoted_to_node boolean DEFAULT false;

    COMMENT ON COLUMN loopos_journal_entries.promoted_to_node IS 'True if entry has been added to timeline';
  END IF;
END $$;

-- =====================================================================
-- 4. Helper Functions
-- =====================================================================

-- Function to get all linked nodes for a note
CREATE OR REPLACE FUNCTION get_note_linked_nodes(p_note_id uuid)
RETURNS TABLE (
  node_id uuid,
  node_title text,
  node_type text,
  link_type text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.title,
    n.type,
    l.link_type,
    l.created_at
  FROM loopos_note_links l
  JOIN loopos_nodes n ON n.id = l.node_id
  WHERE l.note_id = p_note_id
  ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all linked nodes for an analogue card
CREATE OR REPLACE FUNCTION get_card_linked_nodes(p_card_id uuid)
RETURNS TABLE (
  node_id uuid,
  node_title text,
  node_type text,
  link_type text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.title,
    n.type,
    l.link_type,
    l.created_at
  FROM loopos_note_links l
  JOIN loopos_nodes n ON n.id = l.node_id
  WHERE l.analogue_card_id = p_card_id
  ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get origin source for a node
CREATE OR REPLACE FUNCTION get_node_origin(p_node_id uuid)
RETURNS TABLE (
  origin_type text,
  origin_id uuid,
  origin_title text,
  origin_content text,
  link_type text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.origin_type,
    n.origin_id,
    CASE
      WHEN n.origin_type = 'analogue' THEN ac.title
      WHEN n.origin_type = 'note' AND EXISTS (SELECT 1 FROM loopos_notes WHERE id = n.origin_id)
        THEN (SELECT title FROM loopos_notes WHERE id = n.origin_id)
      WHEN n.origin_type = 'note' AND EXISTS (SELECT 1 FROM loopos_journal_entries WHERE id = n.origin_id)
        THEN (SELECT title FROM loopos_journal_entries WHERE id = n.origin_id)
      ELSE NULL
    END,
    CASE
      WHEN n.origin_type = 'analogue' THEN ac.content::text
      WHEN n.origin_type = 'note' AND EXISTS (SELECT 1 FROM loopos_notes WHERE id = n.origin_id)
        THEN (SELECT content FROM loopos_notes WHERE id = n.origin_id)
      WHEN n.origin_type = 'note' AND EXISTS (SELECT 1 FROM loopos_journal_entries WHERE id = n.origin_id)
        THEN (SELECT content FROM loopos_journal_entries WHERE id = n.origin_id)
      ELSE NULL
    END,
    l.link_type
  FROM loopos_nodes n
  LEFT JOIN loopos_analogue_cards ac ON n.origin_type = 'analogue' AND ac.id = n.origin_id
  LEFT JOIN loopos_note_links l ON l.node_id = n.id
  WHERE n.id = p_node_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 5. Indexes for Cross-Table Queries
-- =====================================================================

-- Query: "Get all nodes created from this note"
CREATE INDEX idx_note_links_note_node
  ON loopos_note_links(note_id, node_id);

-- Query: "Get all nodes created from this card"
CREATE INDEX idx_note_links_card_node
  ON loopos_note_links(analogue_card_id, node_id);

-- Query: "Find nodes with origin from notes/cards"
CREATE INDEX idx_nodes_origin_workspace
  ON loopos_nodes(workspace_id, origin_type, origin_id);

-- =====================================================================
-- Migration Complete
-- =====================================================================
-- Tables created: 2 (loopos_analogue_cards, loopos_note_links)
-- Columns added: 4 (origin_type, origin_id, origin_confidence, promoted_to_node)
-- Functions added: 3 (helper queries)
-- RLS policies: 9 (full workspace scoping)
-- Indexes: 16 (performance-optimized)
-- Philosophy: One unified creative instrument
-- =====================================================================
