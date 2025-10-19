/**
 * Campaign Results & Metrics System
 *
 * Stores aggregated campaign metrics from all agents for the Mixdown Dashboard.
 * Each agent reports their results here during and after workflow execution.
 */

-- Campaign Results Table
CREATE TABLE IF NOT EXISTS campaign_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  session_id uuid NOT NULL REFERENCES agent_sessions(id) ON DELETE CASCADE,

  -- Agent attribution
  agent_name text NOT NULL CHECK (agent_name IN ('broker', 'scout', 'coach', 'tracker', 'insight')),

  -- Metric data
  metric_key text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  metric_label text NOT NULL,
  metric_unit text, -- e.g., '%', 'contacts', 'emails', 'ms'

  -- Additional context
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_results_session_id
  ON campaign_results(session_id);

CREATE INDEX IF NOT EXISTS idx_campaign_results_agent_name
  ON campaign_results(agent_name);

CREATE INDEX IF NOT EXISTS idx_campaign_results_metric_key
  ON campaign_results(metric_key);

CREATE INDEX IF NOT EXISTS idx_campaign_results_session_agent
  ON campaign_results(session_id, agent_name);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_campaign_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_results_updated_at
  BEFORE UPDATE ON campaign_results
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_results_updated_at();

-- Row Level Security (RLS)
ALTER TABLE campaign_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own campaign results
CREATE POLICY "Users can view own campaign results"
  ON campaign_results
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM agent_sessions
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Agents can insert campaign results (service role key required)
CREATE POLICY "Agents can insert campaign results"
  ON campaign_results
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own results (for manual adjustments)
CREATE POLICY "Users can update own campaign results"
  ON campaign_results
  FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM agent_sessions
      WHERE user_id = auth.uid()
    )
  );

-- Enable Realtime for live dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_results;

-- Campaign Summaries View (pre-aggregated metrics for dashboard)
CREATE OR REPLACE VIEW campaign_summaries AS
SELECT
  session_id,
  agent_name,
  COUNT(*) as total_metrics,
  json_agg(
    json_build_object(
      'metric_key', metric_key,
      'metric_value', metric_value,
      'metric_label', metric_label,
      'metric_unit', metric_unit,
      'updated_at', updated_at
    ) ORDER BY updated_at DESC
  ) as metrics
FROM campaign_results
GROUP BY session_id, agent_name;

-- Integration Metrics Table (for tracking Gmail, Sheets, etc.)
CREATE TABLE IF NOT EXISTS integration_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  session_id uuid NOT NULL REFERENCES agent_sessions(id) ON DELETE CASCADE,

  -- Integration info
  integration_type text NOT NULL CHECK (integration_type IN ('gmail', 'google_sheets', 'airtable', 'mailchimp', 'spotify')),

  -- Metrics
  metric_key text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  metric_label text NOT NULL,

  -- Raw data (optional)
  raw_data jsonb DEFAULT '{}'::jsonb,

  -- Timestamps
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integration_metrics_session_id
  ON integration_metrics(session_id);

CREATE INDEX IF NOT EXISTS idx_integration_metrics_integration_type
  ON integration_metrics(integration_type);

-- RLS
ALTER TABLE integration_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own integration metrics
CREATE POLICY "Users can view own integration metrics"
  ON integration_metrics
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM agent_sessions
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Agents can insert integration metrics
CREATE POLICY "Agents can insert integration metrics"
  ON integration_metrics
  FOR INSERT
  WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE integration_metrics;

-- Insert sample metrics for testing (optional - comment out for production)
/*
COMMENT ON TABLE campaign_results IS 'Stores aggregated metrics from agent workflow executions for the Mixdown Dashboard';
COMMENT ON TABLE integration_metrics IS 'Stores metrics synced from external integrations (Gmail, Sheets, Mailchimp, Spotify)';
*/
