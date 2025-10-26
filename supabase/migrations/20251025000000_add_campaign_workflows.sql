-- Campaign Workflows Table
-- Stores visual workflow designs from Flow Pane (Console "Plan" mode)
-- Each campaign can have one workflow graph (nodes + edges)

CREATE TABLE campaign_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Node graph data (JSON)
  nodes jsonb NOT NULL DEFAULT '[]'::jsonb,
  edges jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Workflow metadata
  name text,
  description text,

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT campaign_workflows_unique UNIQUE (campaign_id)
);

-- RLS Policies
ALTER TABLE campaign_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workflows"
  ON campaign_workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workflows"
  ON campaign_workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows"
  ON campaign_workflows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows"
  ON campaign_workflows FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_campaign_workflows_campaign_id ON campaign_workflows(campaign_id);
CREATE INDEX idx_campaign_workflows_user_id ON campaign_workflows(user_id);
CREATE INDEX idx_campaign_workflows_created_at ON campaign_workflows(created_at DESC);

-- Updated timestamp trigger
CREATE TRIGGER update_campaign_workflows_updated_at
  BEFORE UPDATE ON campaign_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE campaign_workflows IS 'Visual workflow designs created in Flow Pane (Console Plan mode)';
COMMENT ON COLUMN campaign_workflows.nodes IS 'ReactFlow nodes array (JSON) - workflow action nodes';
COMMENT ON COLUMN campaign_workflows.edges IS 'ReactFlow edges array (JSON) - connections between nodes';
COMMENT ON COLUMN campaign_workflows.name IS 'Workflow name (e.g., "Radio Promo Campaign")';
COMMENT ON COLUMN campaign_workflows.description IS 'Workflow description for documentation';
