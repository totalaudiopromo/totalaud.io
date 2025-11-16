-- LoopOS Phase 11: Artist Memory Graph
-- Creates semantic memory graph that learns from all LoopOS content
-- Tables: memory_nodes, memory_edges, memory_sources, memory_snapshots

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MEMORY NODES
-- =====================================================
-- Semantic units: themes, tone, visual motifs, audience, values, etc.
CREATE TABLE loopos_memory_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,

    -- Node content
    kind TEXT NOT NULL, -- 'theme', 'tone', 'visual_motif', 'audience', 'value', 'skill', 'goal', 'collaborator', 'genre', 'instrument', 'technique'
    label TEXT NOT NULL, -- Short name: "Nostalgia", "Dark aesthetics", "Bedroom pop vibes"
    summary TEXT, -- Longer description
    confidence NUMERIC(3, 2) DEFAULT 0.5, -- 0.0-1.0 (how certain AI is about this)

    -- Metadata
    occurrences INTEGER DEFAULT 1, -- How many times this concept appeared
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),

    -- Embeddings (future: vector search)
    embedding_model TEXT, -- e.g., "text-embedding-3-small"
    embedding VECTOR(1536), -- For semantic similarity (requires pgvector)

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_memory_nodes_workspace ON loopos_memory_nodes(workspace_id);
CREATE INDEX idx_memory_nodes_kind ON loopos_memory_nodes(kind);
CREATE INDEX idx_memory_nodes_label ON loopos_memory_nodes(label);
CREATE INDEX idx_memory_nodes_confidence ON loopos_memory_nodes(confidence DESC);

-- RLS
ALTER TABLE loopos_memory_nodes ENABLE ROW LEVEL SECURITY;

-- Workspace members can view nodes
CREATE POLICY "Workspace members can view memory nodes"
    ON loopos_memory_nodes FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id
            FROM loopos_workspace_members
            WHERE user_id = auth.uid()
        )
    );

-- System can insert/update nodes (via service role)
CREATE POLICY "System can manage memory nodes"
    ON loopos_memory_nodes FOR ALL
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 2. MEMORY EDGES
-- =====================================================
-- Relationships between nodes
CREATE TABLE loopos_memory_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,

    -- Edge connection
    from_node_id UUID NOT NULL REFERENCES loopos_memory_nodes(id) ON DELETE CASCADE,
    to_node_id UUID NOT NULL REFERENCES loopos_memory_nodes(id) ON DELETE CASCADE,

    -- Relationship
    relation TEXT NOT NULL, -- 'relates_to', 'contrasts_with', 'inspires', 'caused_by', 'part_of', 'similar_to'
    strength NUMERIC(3, 2) DEFAULT 0.5, -- 0.0-1.0 (how strong the relationship)

    -- Evidence
    evidence TEXT, -- Why this edge exists (quote, summary)

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate edges
    UNIQUE (from_node_id, to_node_id, relation)
);

-- Indexes
CREATE INDEX idx_memory_edges_workspace ON loopos_memory_edges(workspace_id);
CREATE INDEX idx_memory_edges_from ON loopos_memory_edges(from_node_id);
CREATE INDEX idx_memory_edges_to ON loopos_memory_edges(to_node_id);
CREATE INDEX idx_memory_edges_relation ON loopos_memory_edges(relation);

-- RLS
ALTER TABLE loopos_memory_edges ENABLE ROW LEVEL SECURITY;

-- Workspace members can view edges
CREATE POLICY "Workspace members can view memory edges"
    ON loopos_memory_edges FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id
            FROM loopos_workspace_members
            WHERE user_id = auth.uid()
        )
    );

-- System can manage edges
CREATE POLICY "System can manage memory edges"
    ON loopos_memory_edges FOR ALL
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 3. MEMORY SOURCES
-- =====================================================
-- Links memory nodes to origin content
CREATE TABLE loopos_memory_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES loopos_memory_nodes(id) ON DELETE CASCADE,

    -- Source identification
    source_type TEXT NOT NULL, -- 'journal', 'coach', 'timeline', 'designer', 'pack', 'moodboard', 'usage'
    source_id UUID NOT NULL, -- ID of the source entity (journal entry, coach message, etc.)

    -- Context
    excerpt TEXT, -- Relevant quote or summary from source

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_memory_sources_workspace ON loopos_memory_sources(workspace_id);
CREATE INDEX idx_memory_sources_node ON loopos_memory_sources(node_id);
CREATE INDEX idx_memory_sources_type ON loopos_memory_sources(source_type);
CREATE INDEX idx_memory_sources_source_id ON loopos_memory_sources(source_id);

-- RLS
ALTER TABLE loopos_memory_sources ENABLE ROW LEVEL SECURITY;

-- Workspace members can view sources
CREATE POLICY "Workspace members can view memory sources"
    ON loopos_memory_sources FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id
            FROM loopos_workspace_members
            WHERE user_id = auth.uid()
        )
    );

-- System can manage sources
CREATE POLICY "System can manage memory sources"
    ON loopos_memory_sources FOR ALL
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 4. MEMORY SNAPSHOTS
-- =====================================================
-- Periodic "state of the artist" snapshots
CREATE TABLE loopos_memory_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES loopos_workspaces(id) ON DELETE CASCADE,

    -- Snapshot content
    snapshot_type TEXT NOT NULL DEFAULT 'auto', -- 'auto', 'manual'
    summary TEXT NOT NULL, -- AI-generated summary of artist's current state

    -- Stats at snapshot time
    stats JSONB DEFAULT '{}', -- { node_count, edge_count, top_themes: [], dominant_tone: '', etc. }

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_memory_snapshots_workspace ON loopos_memory_snapshots(workspace_id);
CREATE INDEX idx_memory_snapshots_created ON loopos_memory_snapshots(created_at DESC);

-- RLS
ALTER TABLE loopos_memory_snapshots ENABLE ROW LEVEL SECURITY;

-- Workspace members can view snapshots
CREATE POLICY "Workspace members can view memory snapshots"
    ON loopos_memory_snapshots FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id
            FROM loopos_workspace_members
            WHERE user_id = auth.uid()
        )
    );

-- Workspace owners can create manual snapshots
CREATE POLICY "Workspace owners can create snapshots"
    ON loopos_memory_snapshots FOR INSERT
    WITH CHECK (
        workspace_id IN (
            SELECT id
            FROM loopos_workspaces
            WHERE owner_id = auth.uid()
        )
    );

-- System can create auto snapshots
CREATE POLICY "System can create auto snapshots"
    ON loopos_memory_snapshots FOR ALL
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 5. DATABASE FUNCTIONS
-- =====================================================

-- Get top nodes by kind
CREATE OR REPLACE FUNCTION loopos_get_top_nodes(
    p_workspace_id UUID,
    p_kind TEXT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    label TEXT,
    summary TEXT,
    confidence NUMERIC,
    occurrences INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        n.id,
        n.label,
        n.summary,
        n.confidence,
        n.occurrences
    FROM loopos_memory_nodes n
    WHERE n.workspace_id = p_workspace_id
        AND n.kind = p_kind
    ORDER BY n.confidence DESC, n.occurrences DESC
    LIMIT p_limit;
END;
$$;

-- Get node with edges
CREATE OR REPLACE FUNCTION loopos_get_node_graph(
    p_node_id UUID
)
RETURNS TABLE (
    node_id UUID,
    node_label TEXT,
    edge_id UUID,
    relation TEXT,
    connected_node_id UUID,
    connected_node_label TEXT,
    strength NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    -- Outgoing edges
    SELECT
        n.id AS node_id,
        n.label AS node_label,
        e.id AS edge_id,
        e.relation,
        n2.id AS connected_node_id,
        n2.label AS connected_node_label,
        e.strength
    FROM loopos_memory_nodes n
    JOIN loopos_memory_edges e ON e.from_node_id = n.id
    JOIN loopos_memory_nodes n2 ON n2.id = e.to_node_id
    WHERE n.id = p_node_id

    UNION ALL

    -- Incoming edges
    SELECT
        n.id AS node_id,
        n.label AS node_label,
        e.id AS edge_id,
        e.relation,
        n2.id AS connected_node_id,
        n2.label AS connected_node_label,
        e.strength
    FROM loopos_memory_nodes n
    JOIN loopos_memory_edges e ON e.to_node_id = n.id
    JOIN loopos_memory_nodes n2 ON n2.id = e.from_node_id
    WHERE n.id = p_node_id;
END;
$$;

-- Create or update node (upsert by workspace + kind + label)
CREATE OR REPLACE FUNCTION loopos_upsert_memory_node(
    p_workspace_id UUID,
    p_kind TEXT,
    p_label TEXT,
    p_summary TEXT DEFAULT NULL,
    p_confidence NUMERIC DEFAULT 0.5
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_node_id UUID;
BEGIN
    -- Try to find existing node
    SELECT id INTO v_node_id
    FROM loopos_memory_nodes
    WHERE workspace_id = p_workspace_id
        AND kind = p_kind
        AND LOWER(label) = LOWER(p_label)
    LIMIT 1;

    IF v_node_id IS NOT NULL THEN
        -- Update existing node
        UPDATE loopos_memory_nodes
        SET
            summary = COALESCE(p_summary, summary),
            confidence = GREATEST(confidence, p_confidence),
            occurrences = occurrences + 1,
            last_seen_at = NOW(),
            updated_at = NOW()
        WHERE id = v_node_id;
    ELSE
        -- Insert new node
        INSERT INTO loopos_memory_nodes (
            workspace_id,
            kind,
            label,
            summary,
            confidence
        ) VALUES (
            p_workspace_id,
            p_kind,
            p_label,
            p_summary,
            p_confidence
        )
        RETURNING id INTO v_node_id;
    END IF;

    RETURN v_node_id;
END;
$$;

-- Create memory edge
CREATE OR REPLACE FUNCTION loopos_create_memory_edge(
    p_workspace_id UUID,
    p_from_node_id UUID,
    p_to_node_id UUID,
    p_relation TEXT,
    p_strength NUMERIC DEFAULT 0.5,
    p_evidence TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_edge_id UUID;
BEGIN
    INSERT INTO loopos_memory_edges (
        workspace_id,
        from_node_id,
        to_node_id,
        relation,
        strength,
        evidence
    ) VALUES (
        p_workspace_id,
        p_from_node_id,
        p_to_node_id,
        p_relation,
        p_strength,
        p_evidence
    )
    ON CONFLICT (from_node_id, to_node_id, relation) DO UPDATE
    SET
        strength = GREATEST(loopos_memory_edges.strength, EXCLUDED.strength),
        evidence = COALESCE(EXCLUDED.evidence, loopos_memory_edges.evidence),
        updated_at = NOW()
    RETURNING id INTO v_edge_id;

    RETURN v_edge_id;
END;
$$;

-- Get artist identity summary (top themes, tones, values)
CREATE OR REPLACE FUNCTION loopos_get_artist_identity(
    p_workspace_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'themes', (
            SELECT jsonb_agg(jsonb_build_object('label', label, 'confidence', confidence))
            FROM (
                SELECT label, confidence
                FROM loopos_memory_nodes
                WHERE workspace_id = p_workspace_id AND kind = 'theme'
                ORDER BY confidence DESC, occurrences DESC
                LIMIT 5
            ) t
        ),
        'tones', (
            SELECT jsonb_agg(jsonb_build_object('label', label, 'confidence', confidence))
            FROM (
                SELECT label, confidence
                FROM loopos_memory_nodes
                WHERE workspace_id = p_workspace_id AND kind = 'tone'
                ORDER BY confidence DESC, occurrences DESC
                LIMIT 5
            ) t
        ),
        'values', (
            SELECT jsonb_agg(jsonb_build_object('label', label, 'confidence', confidence))
            FROM (
                SELECT label, confidence
                FROM loopos_memory_nodes
                WHERE workspace_id = p_workspace_id AND kind = 'value'
                ORDER BY confidence DESC, occurrences DESC
                LIMIT 5
            ) t
        ),
        'visual_motifs', (
            SELECT jsonb_agg(jsonb_build_object('label', label, 'confidence', confidence))
            FROM (
                SELECT label, confidence
                FROM loopos_memory_nodes
                WHERE workspace_id = p_workspace_id AND kind = 'visual_motif'
                ORDER BY confidence DESC, occurrences DESC
                LIMIT 5
            ) t
        ),
        'node_count', (
            SELECT COUNT(*) FROM loopos_memory_nodes WHERE workspace_id = p_workspace_id
        ),
        'edge_count', (
            SELECT COUNT(*) FROM loopos_memory_edges WHERE workspace_id = p_workspace_id
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Updated at trigger for nodes
CREATE OR REPLACE FUNCTION update_memory_node_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_memory_node_timestamp
    BEFORE UPDATE ON loopos_memory_nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_memory_node_timestamp();

-- Updated at trigger for edges
CREATE OR REPLACE FUNCTION update_memory_edge_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_memory_edge_timestamp
    BEFORE UPDATE ON loopos_memory_edges
    FOR EACH ROW
    EXECUTE FUNCTION update_memory_edge_timestamp();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE loopos_memory_nodes IS 'Semantic memory graph nodes - themes, tones, visual motifs, etc.';
COMMENT ON TABLE loopos_memory_edges IS 'Relationships between memory nodes';
COMMENT ON TABLE loopos_memory_sources IS 'Links memory nodes to source content (journal, coach, timeline, etc.)';
COMMENT ON TABLE loopos_memory_snapshots IS 'Periodic snapshots of artist identity state';

COMMENT ON FUNCTION loopos_get_top_nodes IS 'Get top N nodes of a specific kind by confidence and occurrences';
COMMENT ON FUNCTION loopos_get_node_graph IS 'Get node with all connected edges and nodes';
COMMENT ON FUNCTION loopos_upsert_memory_node IS 'Create or update memory node (increments occurrences if exists)';
COMMENT ON FUNCTION loopos_create_memory_edge IS 'Create memory edge (upserts on conflict)';
COMMENT ON FUNCTION loopos_get_artist_identity IS 'Get artist identity summary with top themes, tones, values, etc.';
