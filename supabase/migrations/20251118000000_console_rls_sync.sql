/**
 * Console RLS Sync Migration
 * Phase 15.4: Production Wiring & Demo Surface
 *
 * Purpose:
 * - Enable RLS on all console-related tables
 * - Add policies for authenticated user data isolation
 * - Support public sharing for canvas_scenes
 *
 * Tables:
 * - campaign_context: Campaign settings and metadata
 * - agent_results: Intel/pitch/tracker agent outputs
 * - canvas_scenes: Flow canvas node positions and connections
 * - artist_assets: Document/audio/image uploads
 * - flow_telemetry: User interaction tracking
 * - campaign_outreach_logs: Pitch agent sent messages
 */

--
-- 1. campaign_context: RLS for campaign isolation
--

-- Enable RLS
ALTER TABLE campaign_context ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own campaigns
CREATE POLICY "Users can view own campaigns"
  ON campaign_context
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own campaigns
CREATE POLICY "Users can create own campaigns"
  ON campaign_context
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own campaigns
CREATE POLICY "Users can update own campaigns"
  ON campaign_context
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own campaigns
CREATE POLICY "Users can delete own campaigns"
  ON campaign_context
  FOR DELETE
  USING (auth.uid() = user_id);

--
-- 2. agent_results: RLS for agent output isolation
--

-- Enable RLS
ALTER TABLE agent_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own agent results
CREATE POLICY "Users can view own agent results"
  ON agent_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own agent results
CREATE POLICY "Users can create own agent results"
  ON agent_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own agent results
CREATE POLICY "Users can update own agent results"
  ON agent_results
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own agent results
CREATE POLICY "Users can delete own agent results"
  ON agent_results
  FOR DELETE
  USING (auth.uid() = user_id);

--
-- 3. canvas_scenes: RLS with public share support
--

-- Enable RLS
ALTER TABLE canvas_scenes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own canvas scenes
CREATE POLICY "Users can view own canvas scenes"
  ON canvas_scenes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Anyone can view publicly shared canvas scenes
CREATE POLICY "Anyone can view public canvas scenes"
  ON canvas_scenes
  FOR SELECT
  USING (public_share_id IS NOT NULL);

-- Policy: Users can create their own canvas scenes
CREATE POLICY "Users can create own canvas scenes"
  ON canvas_scenes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own canvas scenes
CREATE POLICY "Users can update own canvas scenes"
  ON canvas_scenes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own canvas scenes
CREATE POLICY "Users can delete own canvas scenes"
  ON canvas_scenes
  FOR DELETE
  USING (auth.uid() = user_id);

--
-- 4. artist_assets: RLS for asset isolation
--

-- Enable RLS
ALTER TABLE artist_assets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own assets
CREATE POLICY "Users can view own assets"
  ON artist_assets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own assets
CREATE POLICY "Users can create own assets"
  ON artist_assets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own assets
CREATE POLICY "Users can update own assets"
  ON artist_assets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own assets
CREATE POLICY "Users can delete own assets"
  ON artist_assets
  FOR DELETE
  USING (auth.uid() = user_id);

--
-- 5. flow_telemetry: RLS for telemetry isolation
--

-- Enable RLS
ALTER TABLE flow_telemetry ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own telemetry
CREATE POLICY "Users can view own telemetry"
  ON flow_telemetry
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own telemetry
CREATE POLICY "Users can create own telemetry"
  ON flow_telemetry
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own telemetry
CREATE POLICY "Users can update own telemetry"
  ON flow_telemetry
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own telemetry
CREATE POLICY "Users can delete own telemetry"
  ON flow_telemetry
  FOR DELETE
  USING (auth.uid() = user_id);

--
-- 6. campaign_outreach_logs: RLS for outreach log isolation
--

-- Check if table exists, create if it doesn't
CREATE TABLE IF NOT EXISTS campaign_outreach_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL,
  contact_id TEXT,
  contact_name TEXT NOT NULL,
  message_preview TEXT NOT NULL,
  asset_ids TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('sent', 'replied', 'bounced', 'pending')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for fast campaign queries
CREATE INDEX IF NOT EXISTS idx_campaign_outreach_logs_campaign_id
  ON campaign_outreach_logs(campaign_id);

-- Create index for fast user queries
CREATE INDEX IF NOT EXISTS idx_campaign_outreach_logs_user_id
  ON campaign_outreach_logs(user_id);

-- Enable RLS
ALTER TABLE campaign_outreach_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own outreach logs
CREATE POLICY "Users can view own outreach logs"
  ON campaign_outreach_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own outreach logs
CREATE POLICY "Users can create own outreach logs"
  ON campaign_outreach_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own outreach logs
CREATE POLICY "Users can update own outreach logs"
  ON campaign_outreach_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own outreach logs
CREATE POLICY "Users can delete own outreach logs"
  ON campaign_outreach_logs
  FOR DELETE
  USING (auth.uid() = user_id);

--
-- Migration Complete
--

COMMENT ON TABLE campaign_outreach_logs IS 'Tracks pitch agent outreach with asset attachments (Phase 15.4)';
