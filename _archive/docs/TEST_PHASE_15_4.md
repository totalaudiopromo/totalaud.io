# Phase 15.4 Testing Guide

## Step 1: Apply RLS Migration

Go to Supabase Dashboard → SQL Editor:
https://supabase.com/dashboard/project/ucncbighzqudaszewjrv/sql/new

**Copy and paste this SQL (corrected - no public_share_id):**

```sql
DO $$
BEGIN
  -- 1. campaign_context RLS
  BEGIN
    ALTER TABLE campaign_context ENABLE ROW LEVEL SECURITY;
  EXCEPTION
    WHEN undefined_table THEN RAISE NOTICE 'campaign_context table does not exist';
  END;

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
    WHEN undefined_table THEN RAISE NOTICE 'agent_results table does not exist';
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

  -- 3. canvas_scenes RLS (NO public_share_id policy)
  BEGIN
    ALTER TABLE canvas_scenes ENABLE ROW LEVEL SECURITY;
  EXCEPTION
    WHEN undefined_table THEN RAISE NOTICE 'canvas_scenes table does not exist';
  END;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'canvas_scenes') THEN
    DROP POLICY IF EXISTS "Users can view own canvas scenes" ON canvas_scenes;
    CREATE POLICY "Users can view own canvas scenes" ON canvas_scenes FOR SELECT USING (auth.uid() = user_id);
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
    WHEN undefined_table THEN RAISE NOTICE 'artist_assets table does not exist';
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
    WHEN undefined_table THEN RAISE NOTICE 'flow_telemetry table does not exist';
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

  CREATE INDEX IF NOT EXISTS idx_campaign_outreach_logs_campaign_id ON campaign_outreach_logs(campaign_id);
  CREATE INDEX IF NOT EXISTS idx_campaign_outreach_logs_user_id ON campaign_outreach_logs(user_id);

  ALTER TABLE campaign_outreach_logs ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Users can view own outreach logs" ON campaign_outreach_logs;
  CREATE POLICY "Users can view own outreach logs" ON campaign_outreach_logs FOR SELECT USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can create own outreach logs" ON campaign_outreach_logs;
  CREATE POLICY "Users can create own outreach logs" ON campaign_outreach_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can update own outreach logs" ON campaign_outreach_logs;
  CREATE POLICY "Users can update own outreach logs" ON campaign_outreach_logs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can delete own outreach logs" ON campaign_outreach_logs;
  CREATE POLICY "Users can delete own outreach logs" ON campaign_outreach_logs FOR DELETE USING (auth.uid() = user_id);

END $$;

COMMENT ON TABLE campaign_outreach_logs IS 'Tracks pitch agent outreach with asset attachments (Phase 15.4)';
```

**Expected Result:** "Success. No rows returned"

---

## Step 2: Verify RLS Applied

Run this query in the same SQL Editor:

```sql
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'campaign_context',
    'agent_results',
    'canvas_scenes',
    'artist_assets',
    'flow_telemetry',
    'campaign_outreach_logs'
  )
ORDER BY tablename;
```

**Expected:** All 6 tables show `rls_enabled = true`

---

## Step 3: Test Locally

**In your terminal:**

```bash
# Navigate to project
cd /Users/chrisschofield/workspace/active/totalaud.io

# Start dev server
pnpm dev
```

**Wait for "Ready" message (may be on port 3000-3004)**

**Then open in browser:**
- Demo Console: http://localhost:3000/dev/console (or whatever port)
- Production Console: http://localhost:3000/console

**Expected:**
- `/dev/console` should load with "demo mode" banner
- `/console` should load (or redirect to login if not authenticated)
- No 500 errors

---

## Step 4: Run Audit

**In a new terminal:**

```bash
npx tsx apps/aud-web/scripts/audit-15-4.ts
```

**Expected:** `47/47 passing` ✅

---

## What's Been Fixed (7 commits total)

1. `34e8d6d` - feat(console): add demo surface at /dev/console
2. `66dab20` - feat(api): add last-used campaign endpoint
3. `a3372d2` - feat(auth): add session API endpoint
4. `53cb404` - feat(db): add comprehensive RLS policies
5. `045f3d8` - chore: apply prettier formatting
6. `8189cf0` - fix(console): add missing flowCoreColours constants
7. `8f81a69` - fix(console): correct import paths to use @aud-web alias

---

## Troubleshooting

### If you still get 500 errors:

Check the terminal output for specific import errors. The console pages use:
- `@aud-web/constants/flowCoreColours`
- `@aud-web/layouts/ConsoleLayout`
- `@aud-web/components/console/ConsoleHeader`
- `@aud-web/components/features/flow/FlowCanvas`
- `@aud-web/components/features/flow/NodePalette`
- `@aud-web/components/ui/CommandPalette`

All these files should exist in `apps/aud-web/src/`

### If audit fails:

The RLS migration might not have been applied correctly. Re-run the SQL in Step 1.

---

## Summary

**Phase 15.4 Status:** Code complete, 7 commits pushed ✅

Once RLS is applied and routes load successfully, Phase 15.4 is done!
