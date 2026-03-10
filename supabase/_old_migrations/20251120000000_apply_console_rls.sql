/**
 * Console RLS Application Migration
 * Phase 15.4: Production Wiring & Demo Surface
 *
 * This migration safely applies RLS policies using DO blocks
 * to handle cases where policies may already exist.
 */

-- Helper function to create policy if not exists
DO $$
BEGIN
  -- 1. campaign_context RLS
  BEGIN
    ALTER TABLE campaign_context ENABLE ROW LEVEL SECURITY;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'campaign_context table does not exist';
  END;

  -- Create policies for campaign_context
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_context') THEN
    DROP POLICY IF EXISTS "Users can view own campaigns" ON campaign_context;
    CREATE POLICY "Users can view own campaigns" ON campaign_context FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can create own campaigns" ON campaign_context;
    CREATE POLICY "Users can create own campaigns" ON campaign_context FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own campaigns" ON campaign_context;
    CREATE POLICY "Users can update own campaigns" ON campaign_context FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete own campaigns" ON campaign_context;
    CREATE POLICY "Users can delete own campaigns" ON campaign_context FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- 2. agent_results RLS
  BEGIN
    ALTER TABLE agent_results ENABLE ROW LEVEL SECURITY;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'agent_results table does not exist';
  END;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_results') THEN
    DROP POLICY IF EXISTS "Users can view own agent results" ON agent_results;
    CREATE POLICY "Users can view own agent results" ON agent_results FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can create own agent results" ON agent_results;
    CREATE POLICY "Users can create own agent results" ON agent_results FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own agent results" ON agent_results;
    CREATE POLICY "Users can update own agent results" ON agent_results FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete own agent results" ON agent_results;
    CREATE POLICY "Users can delete own agent results" ON agent_results FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- 3. canvas_scenes RLS
  BEGIN
    ALTER TABLE canvas_scenes ENABLE ROW LEVEL SECURITY;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'canvas_scenes table does not exist';
  END;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'canvas_scenes') THEN
    DROP POLICY IF EXISTS "Users can view own canvas scenes" ON canvas_scenes;
    CREATE POLICY "Users can view own canvas scenes" ON canvas_scenes FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Anyone can view public canvas scenes" ON canvas_scenes;
    CREATE POLICY "Anyone can view public canvas scenes" ON canvas_scenes FOR SELECT USING (public_share_id IS NOT NULL);

    DROP POLICY IF EXISTS "Users can create own canvas scenes" ON canvas_scenes;
    CREATE POLICY "Users can create own canvas scenes" ON canvas_scenes FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own canvas scenes" ON canvas_scenes;
    CREATE POLICY "Users can update own canvas scenes" ON canvas_scenes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete own canvas scenes" ON canvas_scenes;
    CREATE POLICY "Users can delete own canvas scenes" ON canvas_scenes FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- 4. artist_assets RLS
  BEGIN
    ALTER TABLE artist_assets ENABLE ROW LEVEL SECURITY;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'artist_assets table does not exist';
  END;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artist_assets') THEN
    DROP POLICY IF EXISTS "Users can view own assets" ON artist_assets;
    CREATE POLICY "Users can view own assets" ON artist_assets FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can create own assets" ON artist_assets;
    CREATE POLICY "Users can create own assets" ON artist_assets FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own assets" ON artist_assets;
    CREATE POLICY "Users can update own assets" ON artist_assets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete own assets" ON artist_assets;
    CREATE POLICY "Users can delete own assets" ON artist_assets FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- 5. flow_telemetry RLS
  BEGIN
    ALTER TABLE flow_telemetry ENABLE ROW LEVEL SECURITY;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'flow_telemetry table does not exist';
  END;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flow_telemetry') THEN
    DROP POLICY IF EXISTS "Users can view own telemetry" ON flow_telemetry;
    CREATE POLICY "Users can view own telemetry" ON flow_telemetry FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can create own telemetry" ON flow_telemetry;
    CREATE POLICY "Users can create own telemetry" ON flow_telemetry FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own telemetry" ON flow_telemetry;
    CREATE POLICY "Users can update own telemetry" ON flow_telemetry FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete own telemetry" ON flow_telemetry;
    CREATE POLICY "Users can delete own telemetry" ON flow_telemetry FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- 6. campaign_outreach_logs table and RLS
  -- Create table if it doesn't exist
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

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_campaign_outreach_logs_campaign_id ON campaign_outreach_logs(campaign_id);
  CREATE INDEX IF NOT EXISTS idx_campaign_outreach_logs_user_id ON campaign_outreach_logs(user_id);

  -- Enable RLS
  ALTER TABLE campaign_outreach_logs ENABLE ROW LEVEL SECURITY;

  -- Create policies
  DROP POLICY IF EXISTS "Users can view own outreach logs" ON campaign_outreach_logs;
  CREATE POLICY "Users can view own outreach logs" ON campaign_outreach_logs FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can create own outreach logs" ON campaign_outreach_logs;
  CREATE POLICY "Users can create own outreach logs" ON campaign_outreach_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can update own outreach logs" ON campaign_outreach_logs;
  CREATE POLICY "Users can update own outreach logs" ON campaign_outreach_logs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can delete own outreach logs" ON campaign_outreach_logs;
  CREATE POLICY "Users can delete own outreach logs" ON campaign_outreach_logs FOR DELETE USING (auth.uid() = user_id);

END $$;

-- Add table comment
COMMENT ON TABLE campaign_outreach_logs IS 'Tracks pitch agent outreach with asset attachments (Phase 15.4)';
