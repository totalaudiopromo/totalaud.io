-- Supabase security & performance fixes
-- Addresses RLS gaps, policy hardening, view security, and function search_path hygiene.

-- =====================================================
-- RLS: agent_messages
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.agent_messages') IS NOT NULL THEN
    ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own agent messages" ON public.agent_messages;
    DROP POLICY IF EXISTS "Users can insert own agent messages" ON public.agent_messages;
    DROP POLICY IF EXISTS "Users can update own agent messages" ON public.agent_messages;
    DROP POLICY IF EXISTS "Users can delete own agent messages" ON public.agent_messages;

    CREATE POLICY "Users can view own agent messages" ON public.agent_messages
      FOR SELECT
      USING (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can view own agent messages" ON public.agent_messages IS
      'Allow users to read agent messages linked to their own sessions.';

    CREATE POLICY "Users can insert own agent messages" ON public.agent_messages
      FOR INSERT
      WITH CHECK (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can insert own agent messages" ON public.agent_messages IS
      'Allow users to add agent messages scoped to sessions they own.';

    CREATE POLICY "Users can update own agent messages" ON public.agent_messages
      FOR UPDATE
      USING (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      )
      WITH CHECK (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can update own agent messages" ON public.agent_messages IS
      'Allow users to update agent messages tied to their sessions.';

    CREATE POLICY "Users can delete own agent messages" ON public.agent_messages
      FOR DELETE
      USING (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can delete own agent messages" ON public.agent_messages IS
      'Allow users to delete agent messages tied to their sessions.';
  END IF;
END $$;

-- =====================================================
-- RLS: agent_session_steps
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.agent_session_steps') IS NOT NULL THEN
    ALTER TABLE public.agent_session_steps ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own agent session steps" ON public.agent_session_steps;
    DROP POLICY IF EXISTS "Users can insert own agent session steps" ON public.agent_session_steps;
    DROP POLICY IF EXISTS "Users can update own agent session steps" ON public.agent_session_steps;
    DROP POLICY IF EXISTS "Users can delete own agent session steps" ON public.agent_session_steps;

    CREATE POLICY "Users can view own agent session steps" ON public.agent_session_steps
      FOR SELECT
      USING (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can view own agent session steps" ON public.agent_session_steps IS
      'Allow users to read execution steps for sessions they own.';

    CREATE POLICY "Users can insert own agent session steps" ON public.agent_session_steps
      FOR INSERT
      WITH CHECK (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can insert own agent session steps" ON public.agent_session_steps IS
      'Allow users to add session steps for sessions they own.';

    CREATE POLICY "Users can update own agent session steps" ON public.agent_session_steps
      FOR UPDATE
      USING (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      )
      WITH CHECK (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can update own agent session steps" ON public.agent_session_steps IS
      'Allow users to update session steps for sessions they own.';

    CREATE POLICY "Users can delete own agent session steps" ON public.agent_session_steps
      FOR DELETE
      USING (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can delete own agent session steps" ON public.agent_session_steps IS
      'Allow users to delete session steps for sessions they own.';
  END IF;
END $$;

-- =====================================================
-- RLS: agents
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.agents') IS NOT NULL THEN
    ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Authenticated users can view agents" ON public.agents;
    DROP POLICY IF EXISTS "Service role can manage agents" ON public.agents;

    CREATE POLICY "Authenticated users can view agents" ON public.agents
      FOR SELECT
      USING ((select auth.uid()) IS NOT NULL);
    COMMENT ON POLICY "Authenticated users can view agents" ON public.agents IS
      'Allow signed-in users to read the agents registry.';

    CREATE POLICY "Service role can manage agents" ON public.agents
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    COMMENT ON POLICY "Service role can manage agents" ON public.agents IS
      'Restrict agent registry writes to service role operations.';
  END IF;
END $$;

-- =====================================================
-- RLS: skills
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.skills') IS NOT NULL THEN
    ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Authenticated users can view skills" ON public.skills;
    DROP POLICY IF EXISTS "Service role can manage skills" ON public.skills;

    CREATE POLICY "Authenticated users can view skills" ON public.skills
      FOR SELECT
      USING ((select auth.uid()) IS NOT NULL);
    COMMENT ON POLICY "Authenticated users can view skills" ON public.skills IS
      'Allow signed-in users to read the skills registry.';

    CREATE POLICY "Service role can manage skills" ON public.skills
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    COMMENT ON POLICY "Service role can manage skills" ON public.skills IS
      'Restrict skills registry writes to service role operations.';
  END IF;
END $$;

-- =====================================================
-- RLS: skill_executions
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.skill_executions') IS NOT NULL THEN
    ALTER TABLE public.skill_executions ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own skill executions" ON public.skill_executions;
    DROP POLICY IF EXISTS "Users can insert own skill executions" ON public.skill_executions;
    DROP POLICY IF EXISTS "Users can update own skill executions" ON public.skill_executions;
    DROP POLICY IF EXISTS "Users can delete own skill executions" ON public.skill_executions;

    CREATE POLICY "Users can view own skill executions" ON public.skill_executions
      FOR SELECT
      USING (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can view own skill executions" ON public.skill_executions IS
      'Allow users to read skill execution logs they own.';

    CREATE POLICY "Users can insert own skill executions" ON public.skill_executions
      FOR INSERT
      WITH CHECK (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can insert own skill executions" ON public.skill_executions IS
      'Allow users to insert skill execution logs tied to their account.';

    CREATE POLICY "Users can update own skill executions" ON public.skill_executions
      FOR UPDATE
      USING (user_id = (select auth.uid()))
      WITH CHECK (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can update own skill executions" ON public.skill_executions IS
      'Allow users to update their own skill execution logs.';

    CREATE POLICY "Users can delete own skill executions" ON public.skill_executions
      FOR DELETE
      USING (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can delete own skill executions" ON public.skill_executions IS
      'Allow users to delete their own skill execution logs.';
  END IF;
END $$;

-- =====================================================
-- RLS: agent_sessions
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.agent_sessions') IS NOT NULL THEN
    ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own sessions" ON public.agent_sessions;
    DROP POLICY IF EXISTS "Users can insert own sessions" ON public.agent_sessions;
    DROP POLICY IF EXISTS "Users can update own sessions" ON public.agent_sessions;
    DROP POLICY IF EXISTS "Users can delete own sessions" ON public.agent_sessions;
    DROP POLICY IF EXISTS "Users can view sessions" ON public.agent_sessions;
    DROP POLICY IF EXISTS "Anyone can insert sessions" ON public.agent_sessions;
    DROP POLICY IF EXISTS "Users can update sessions" ON public.agent_sessions;

    CREATE POLICY "Users can view own sessions" ON public.agent_sessions
      FOR SELECT
      USING (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can view own sessions" ON public.agent_sessions IS
      'Allow users to read their own agent sessions.';

    CREATE POLICY "Users can insert own sessions" ON public.agent_sessions
      FOR INSERT
      WITH CHECK (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can insert own sessions" ON public.agent_sessions IS
      'Allow users to create sessions linked to their account.';

    CREATE POLICY "Users can update own sessions" ON public.agent_sessions
      FOR UPDATE
      USING (user_id = (select auth.uid()))
      WITH CHECK (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can update own sessions" ON public.agent_sessions IS
      'Allow users to update sessions linked to their account.';

    CREATE POLICY "Users can delete own sessions" ON public.agent_sessions
      FOR DELETE
      USING (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can delete own sessions" ON public.agent_sessions IS
      'Allow users to delete their own agent sessions.';

    DROP POLICY IF EXISTS "Anon can view demo sessions" ON public.agent_sessions;
    DROP POLICY IF EXISTS "Anon can insert demo sessions" ON public.agent_sessions;
    DROP POLICY IF EXISTS "Anon can update demo sessions" ON public.agent_sessions;

    CREATE POLICY "Anon can view demo sessions" ON public.agent_sessions
      FOR SELECT
      TO anon
      USING (user_id IS NULL);
    COMMENT ON POLICY "Anon can view demo sessions" ON public.agent_sessions IS
      'Allow unauthenticated users to view demo sessions.';

    CREATE POLICY "Anon can insert demo sessions" ON public.agent_sessions
      FOR INSERT
      TO anon
      WITH CHECK (user_id IS NULL);
    COMMENT ON POLICY "Anon can insert demo sessions" ON public.agent_sessions IS
      'Allow unauthenticated users to create demo sessions.';

    CREATE POLICY "Anon can update demo sessions" ON public.agent_sessions
      FOR UPDATE
      TO anon
      USING (user_id IS NULL)
      WITH CHECK (user_id IS NULL);
    COMMENT ON POLICY "Anon can update demo sessions" ON public.agent_sessions IS
      'Allow unauthenticated users to update demo sessions.';
  END IF;
END $$;

-- =====================================================
-- RLS: agent_activity_log
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.agent_activity_log') IS NOT NULL THEN
    ALTER TABLE public.agent_activity_log ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own session activity" ON public.agent_activity_log;
    DROP POLICY IF EXISTS "Agents can insert activity logs" ON public.agent_activity_log;

    CREATE POLICY "Users can view own session activity" ON public.agent_activity_log
      FOR SELECT
      USING (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can view own session activity" ON public.agent_activity_log IS
      'Allow users to read activity logs for sessions they own.';

    CREATE POLICY "Users can insert own session activity" ON public.agent_activity_log
      FOR INSERT
      WITH CHECK (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can insert own session activity" ON public.agent_activity_log IS
      'Allow users to insert activity logs for sessions they own.';
  END IF;
END $$;

-- =====================================================
-- RLS: campaign_results
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.campaign_results') IS NOT NULL THEN
    ALTER TABLE public.campaign_results ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own campaign results" ON public.campaign_results;
    DROP POLICY IF EXISTS "Agents can insert campaign results" ON public.campaign_results;
    DROP POLICY IF EXISTS "Users can update own campaign results" ON public.campaign_results;

    CREATE POLICY "Users can view own campaign results" ON public.campaign_results
      FOR SELECT
      USING (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can view own campaign results" ON public.campaign_results IS
      'Allow users to read campaign results for sessions they own.';

    CREATE POLICY "Users can insert own campaign results" ON public.campaign_results
      FOR INSERT
      WITH CHECK (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can insert own campaign results" ON public.campaign_results IS
      'Allow users to insert campaign results for sessions they own.';

    CREATE POLICY "Users can update own campaign results" ON public.campaign_results
      FOR UPDATE
      USING (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      )
      WITH CHECK (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can update own campaign results" ON public.campaign_results IS
      'Allow users to update campaign results for sessions they own.';
  END IF;
END $$;

-- =====================================================
-- RLS: integration_metrics
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.integration_metrics') IS NOT NULL THEN
    ALTER TABLE public.integration_metrics ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own integration metrics" ON public.integration_metrics;
    DROP POLICY IF EXISTS "Agents can insert integration metrics" ON public.integration_metrics;

    CREATE POLICY "Users can view own integration metrics" ON public.integration_metrics
      FOR SELECT
      USING (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can view own integration metrics" ON public.integration_metrics IS
      'Allow users to read integration metrics for sessions they own.';

    CREATE POLICY "Users can insert own integration metrics" ON public.integration_metrics
      FOR INSERT
      WITH CHECK (
        session_id IN (
          SELECT id FROM public.agent_sessions
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can insert own integration metrics" ON public.integration_metrics IS
      'Allow users to insert integration metrics for sessions they own.';
  END IF;
END $$;

-- =====================================================
-- RLS: integration_sync_logs
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.integration_sync_logs') IS NOT NULL THEN
    ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own integration sync logs" ON public.integration_sync_logs;
    DROP POLICY IF EXISTS "System can insert integration sync logs" ON public.integration_sync_logs;

    CREATE POLICY "Users can view own integration sync logs" ON public.integration_sync_logs
      FOR SELECT
      USING (
        connection_id IN (
          SELECT id FROM public.integration_connections
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can view own integration sync logs" ON public.integration_sync_logs IS
      'Allow users to read sync logs for their own integrations.';

    CREATE POLICY "Users can insert own integration sync logs" ON public.integration_sync_logs
      FOR INSERT
      WITH CHECK (
        connection_id IN (
          SELECT id FROM public.integration_connections
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can insert own integration sync logs" ON public.integration_sync_logs IS
      'Allow users to insert sync logs for their own integrations.';
  END IF;
END $$;

-- =====================================================
-- RLS: gmail_tracked_emails
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.gmail_tracked_emails') IS NOT NULL THEN
    ALTER TABLE public.gmail_tracked_emails ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own gmail tracked emails" ON public.gmail_tracked_emails;
    DROP POLICY IF EXISTS "System can insert gmail tracked emails" ON public.gmail_tracked_emails;
    DROP POLICY IF EXISTS "System can update gmail tracked emails" ON public.gmail_tracked_emails;

    CREATE POLICY "Users can view own gmail tracked emails" ON public.gmail_tracked_emails
      FOR SELECT
      USING (
        connection_id IN (
          SELECT id FROM public.integration_connections
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can view own gmail tracked emails" ON public.gmail_tracked_emails IS
      'Allow users to read tracked emails for their own integrations.';

    CREATE POLICY "Users can insert own gmail tracked emails" ON public.gmail_tracked_emails
      FOR INSERT
      WITH CHECK (
        connection_id IN (
          SELECT id FROM public.integration_connections
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can insert own gmail tracked emails" ON public.gmail_tracked_emails IS
      'Allow users to insert tracked emails for their own integrations.';

    CREATE POLICY "Users can update own gmail tracked emails" ON public.gmail_tracked_emails
      FOR UPDATE
      USING (
        connection_id IN (
          SELECT id FROM public.integration_connections
          WHERE user_id = (select auth.uid())
        )
      )
      WITH CHECK (
        connection_id IN (
          SELECT id FROM public.integration_connections
          WHERE user_id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can update own gmail tracked emails" ON public.gmail_tracked_emails IS
      'Allow users to update tracked emails for their own integrations.';
  END IF;
END $$;

-- =====================================================
-- RLS: oauth_state_tokens
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.oauth_state_tokens') IS NOT NULL THEN
    ALTER TABLE public.oauth_state_tokens ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own oauth state tokens" ON public.oauth_state_tokens;
    DROP POLICY IF EXISTS "Users can insert own oauth state tokens" ON public.oauth_state_tokens;
    DROP POLICY IF EXISTS "Users can update own oauth state tokens" ON public.oauth_state_tokens;
    DROP POLICY IF EXISTS "Users can delete own oauth state tokens" ON public.oauth_state_tokens;

    CREATE POLICY "Users can view own oauth state tokens" ON public.oauth_state_tokens
      FOR SELECT
      USING (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can view own oauth state tokens" ON public.oauth_state_tokens IS
      'Allow users to read OAuth state tokens tied to their account.';

    CREATE POLICY "Users can insert own oauth state tokens" ON public.oauth_state_tokens
      FOR INSERT
      WITH CHECK (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can insert own oauth state tokens" ON public.oauth_state_tokens IS
      'Allow users to create OAuth state tokens tied to their account.';

    CREATE POLICY "Users can update own oauth state tokens" ON public.oauth_state_tokens
      FOR UPDATE
      USING (user_id = (select auth.uid()))
      WITH CHECK (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can update own oauth state tokens" ON public.oauth_state_tokens IS
      'Allow users to update OAuth state tokens tied to their account.';

    CREATE POLICY "Users can delete own oauth state tokens" ON public.oauth_state_tokens
      FOR DELETE
      USING (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can delete own oauth state tokens" ON public.oauth_state_tokens IS
      'Allow users to delete OAuth state tokens tied to their account.';
  END IF;
END $$;

-- =====================================================
-- RLS: campaign_collaborators
-- =====================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  IF to_regclass('public.campaign_collaborators') IS NOT NULL THEN
    ALTER TABLE public.campaign_collaborators ENABLE ROW LEVEL SECURITY;

    FOR r IN (
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'campaign_collaborators'
    ) LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.campaign_collaborators', r.policyname);
    END LOOP;

    CREATE POLICY "Users can view own campaign collaborator records" ON public.campaign_collaborators
      FOR SELECT
      USING (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can view own campaign collaborator records" ON public.campaign_collaborators IS
      'Allow users to read their own collaborator row for campaigns.';

    CREATE POLICY "Users can insert own campaign collaborator records" ON public.campaign_collaborators
      FOR INSERT
      WITH CHECK (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can insert own campaign collaborator records" ON public.campaign_collaborators IS
      'Allow users to insert their own collaborator row for campaigns.';

    CREATE POLICY "Users can update own campaign collaborator records" ON public.campaign_collaborators
      FOR UPDATE
      USING (user_id = (select auth.uid()))
      WITH CHECK (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can update own campaign collaborator records" ON public.campaign_collaborators IS
      'Allow users to update their own collaborator row for campaigns.';

    CREATE POLICY "Users can delete own campaign collaborator records" ON public.campaign_collaborators
      FOR DELETE
      USING (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can delete own campaign collaborator records" ON public.campaign_collaborators IS
      'Allow users to delete their own collaborator row for campaigns.';
  END IF;
END $$;

-- =====================================================
-- RLS: intel_pitcher_links
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.intel_pitcher_links') IS NOT NULL THEN
    ALTER TABLE public.intel_pitcher_links ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own links" ON public.intel_pitcher_links;
    DROP POLICY IF EXISTS "Users can insert own links" ON public.intel_pitcher_links;
    DROP POLICY IF EXISTS "Users can update own links" ON public.intel_pitcher_links;
    DROP POLICY IF EXISTS "Users can delete own links" ON public.intel_pitcher_links;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'intel_pitcher_links'
        AND column_name = 'created_by'
    ) THEN
      CREATE POLICY "Users can view own intel pitcher links" ON public.intel_pitcher_links
        FOR SELECT
        USING (created_by = (select auth.uid()));
      COMMENT ON POLICY "Users can view own intel pitcher links" ON public.intel_pitcher_links IS
        'Allow users to read intel-pitcher links they created.';

      CREATE POLICY "Users can insert own intel pitcher links" ON public.intel_pitcher_links
        FOR INSERT
        WITH CHECK (created_by = (select auth.uid()));
      COMMENT ON POLICY "Users can insert own intel pitcher links" ON public.intel_pitcher_links IS
        'Allow users to create intel-pitcher links tied to their account.';

      CREATE POLICY "Users can update own intel pitcher links" ON public.intel_pitcher_links
        FOR UPDATE
        USING (created_by = (select auth.uid()))
        WITH CHECK (created_by = (select auth.uid()));
      COMMENT ON POLICY "Users can update own intel pitcher links" ON public.intel_pitcher_links IS
        'Allow users to update intel-pitcher links they created.';

      CREATE POLICY "Users can delete own intel pitcher links" ON public.intel_pitcher_links
        FOR DELETE
        USING (created_by = (select auth.uid()));
      COMMENT ON POLICY "Users can delete own intel pitcher links" ON public.intel_pitcher_links IS
        'Allow users to delete intel-pitcher links they created.';
    ELSIF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'intel_pitcher_links'
        AND column_name = 'user_id'
    ) THEN
      CREATE POLICY "Users can view own intel pitcher links" ON public.intel_pitcher_links
        FOR SELECT
        USING (user_id = (select auth.uid()));
      COMMENT ON POLICY "Users can view own intel pitcher links" ON public.intel_pitcher_links IS
        'Allow users to read intel-pitcher links they created.';

      CREATE POLICY "Users can insert own intel pitcher links" ON public.intel_pitcher_links
        FOR INSERT
        WITH CHECK (user_id = (select auth.uid()));
      COMMENT ON POLICY "Users can insert own intel pitcher links" ON public.intel_pitcher_links IS
        'Allow users to create intel-pitcher links tied to their account.';

      CREATE POLICY "Users can update own intel pitcher links" ON public.intel_pitcher_links
        FOR UPDATE
        USING (user_id = (select auth.uid()))
        WITH CHECK (user_id = (select auth.uid()));
      COMMENT ON POLICY "Users can update own intel pitcher links" ON public.intel_pitcher_links IS
        'Allow users to update intel-pitcher links they created.';

      CREATE POLICY "Users can delete own intel pitcher links" ON public.intel_pitcher_links
        FOR DELETE
        USING (user_id = (select auth.uid()));
      COMMENT ON POLICY "Users can delete own intel pitcher links" ON public.intel_pitcher_links IS
        'Allow users to delete intel-pitcher links they created.';
    ELSE
      CREATE POLICY "Service role can manage intel pitcher links" ON public.intel_pitcher_links
        FOR ALL
        USING (auth.role() = 'service_role')
        WITH CHECK (auth.role() = 'service_role');
      COMMENT ON POLICY "Service role can manage intel pitcher links" ON public.intel_pitcher_links IS
        'Restrict intel-pitcher links access when ownership column is missing.';
    END IF;
  END IF;
END $$;

-- =====================================================
-- RLS: intel_logs
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.intel_logs') IS NOT NULL THEN
    ALTER TABLE public.intel_logs ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can read intel_logs" ON public.intel_logs;
    DROP POLICY IF EXISTS "Users can read own intel_logs" ON public.intel_logs;
    DROP POLICY IF EXISTS "Service can insert intel_logs" ON public.intel_logs;
    DROP POLICY IF EXISTS "Service role can manage intel_logs" ON public.intel_logs;

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'intel_logs'
        AND column_name = 'user_id'
    ) THEN
      CREATE POLICY "Users can read own intel logs" ON public.intel_logs
        FOR SELECT
        USING (user_id = (select auth.uid()));
      COMMENT ON POLICY "Users can read own intel logs" ON public.intel_logs IS
        'Allow users to read intel logs tied to their account.';

      CREATE POLICY "Users can insert own intel logs" ON public.intel_logs
        FOR INSERT
        WITH CHECK (user_id = (select auth.uid()));
      COMMENT ON POLICY "Users can insert own intel logs" ON public.intel_logs IS
        'Allow users to insert intel logs tied to their account.';
    ELSE
      CREATE POLICY "Service role can manage intel logs" ON public.intel_logs
        FOR ALL
        USING (auth.role() = 'service_role')
        WITH CHECK (auth.role() = 'service_role');
      COMMENT ON POLICY "Service role can manage intel logs" ON public.intel_logs IS
        'Restrict intel logs access to service role when user scoping is unavailable.';
    END IF;
  END IF;
END $$;

-- =====================================================
-- RLS: waitlist
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.waitlist') IS NOT NULL THEN
    ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Anyone can signup for waitlist" ON public.waitlist;
    DROP POLICY IF EXISTS "Only service role can read waitlist" ON public.waitlist;
    DROP POLICY IF EXISTS "Service role can manage waitlist" ON public.waitlist;

    CREATE POLICY "Service role can manage waitlist" ON public.waitlist
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    COMMENT ON POLICY "Service role can manage waitlist" ON public.waitlist IS
      'Restrict waitlist access to service role operations.';
  END IF;
END $$;

-- =====================================================
-- Consolidate RLS: canvas_scenes
-- =====================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  IF to_regclass('public.canvas_scenes') IS NOT NULL THEN
    ALTER TABLE public.canvas_scenes ENABLE ROW LEVEL SECURITY;

    FOR r IN (
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'canvas_scenes'
    ) LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.canvas_scenes', r.policyname);
    END LOOP;

    CREATE POLICY "Users can view accessible canvas scenes" ON public.canvas_scenes
      FOR SELECT
      USING (
        user_id = (select auth.uid())
        OR (is_public = true AND public_share_id IS NOT NULL)
      );
    COMMENT ON POLICY "Users can view accessible canvas scenes" ON public.canvas_scenes IS
      'Allow owners to read their scenes and anyone to view public share links.';

    CREATE POLICY "Users can create own canvas scenes" ON public.canvas_scenes
      FOR INSERT
      WITH CHECK (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can create own canvas scenes" ON public.canvas_scenes IS
      'Allow users to create scenes owned by their account.';

    CREATE POLICY "Users can update own canvas scenes" ON public.canvas_scenes
      FOR UPDATE
      USING (user_id = (select auth.uid()))
      WITH CHECK (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can update own canvas scenes" ON public.canvas_scenes IS
      'Allow users to update scenes they own.';

    CREATE POLICY "Users can delete own canvas scenes" ON public.canvas_scenes
      FOR DELETE
      USING (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can delete own canvas scenes" ON public.canvas_scenes IS
      'Allow users to delete scenes they own.';
  END IF;
END $$;

-- =====================================================
-- Consolidate RLS: collaboration_invites
-- =====================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  IF to_regclass('public.collaboration_invites') IS NOT NULL THEN
    ALTER TABLE public.collaboration_invites ENABLE ROW LEVEL SECURITY;

    FOR r IN (
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'collaboration_invites'
    ) LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.collaboration_invites', r.policyname);
    END LOOP;

    CREATE POLICY "Users can view relevant collaboration invites" ON public.collaboration_invites
      FOR SELECT
      USING (
        invited_by = (select auth.uid())
        OR invited_email = (
          SELECT email FROM auth.users
          WHERE id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can view relevant collaboration invites" ON public.collaboration_invites IS
      'Allow users to view invites they sent or invites sent to their email.';

    CREATE POLICY "Campaign owners can create invites" ON public.collaboration_invites
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.campaign_collaborators
          WHERE campaign_id = collaboration_invites.campaign_id
          AND user_id = (select auth.uid())
          AND role = 'owner'
        )
      );
    COMMENT ON POLICY "Campaign owners can create invites" ON public.collaboration_invites IS
      'Allow campaign owners to create collaboration invites.';

    CREATE POLICY "Users can update invites they received" ON public.collaboration_invites
      FOR UPDATE
      USING (
        invited_email = (
          SELECT email FROM auth.users
          WHERE id = (select auth.uid())
        )
      )
      WITH CHECK (
        invited_email = (
          SELECT email FROM auth.users
          WHERE id = (select auth.uid())
        )
      );
    COMMENT ON POLICY "Users can update invites they received" ON public.collaboration_invites IS
      'Allow invitees to update invite records addressed to their email.';
  END IF;
END $$;

-- =====================================================
-- Consolidate RLS: report_shares
-- =====================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  IF to_regclass('public.report_shares') IS NOT NULL THEN
    ALTER TABLE public.report_shares ENABLE ROW LEVEL SECURITY;

    FOR r IN (
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'report_shares'
    ) LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.report_shares', r.policyname);
    END LOOP;

    CREATE POLICY "Users can view accessible report shares" ON public.report_shares
      FOR SELECT
      USING (
        user_id = (select auth.uid())
        OR (
          token IS NOT NULL
          AND (expires_at IS NULL OR expires_at > now())
        )
      );
    COMMENT ON POLICY "Users can view accessible report shares" ON public.report_shares IS
      'Allow owners to view their shares and anyone to access valid tokens.';

    CREATE POLICY "Users can create own report shares" ON public.report_shares
      FOR INSERT
      WITH CHECK (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can create own report shares" ON public.report_shares IS
      'Allow users to create report share tokens for their sessions.';

    CREATE POLICY "Users can update own report shares" ON public.report_shares
      FOR UPDATE
      USING (user_id = (select auth.uid()))
      WITH CHECK (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can update own report shares" ON public.report_shares IS
      'Allow users to update their report shares (including view counts).';

    CREATE POLICY "Users can delete own report shares" ON public.report_shares
      FOR DELETE
      USING (user_id = (select auth.uid()));
    COMMENT ON POLICY "Users can delete own report shares" ON public.report_shares IS
      'Allow users to delete their report shares.';
  END IF;
END $$;

-- =====================================================
-- Consolidate RLS: user_cohorts
-- =====================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  IF to_regclass('public.user_cohorts') IS NOT NULL THEN
    ALTER TABLE public.user_cohorts ENABLE ROW LEVEL SECURITY;

    FOR r IN (
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'user_cohorts'
    ) LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_cohorts', r.policyname);
    END LOOP;

    CREATE POLICY "Service role can manage user cohorts" ON public.user_cohorts
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    COMMENT ON POLICY "Service role can manage user cohorts" ON public.user_cohorts IS
      'Allow service role to manage cohort assignments.';

    CREATE POLICY "Users can view own or admin cohorts" ON public.user_cohorts
      FOR SELECT
      USING (
        user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM auth.users
          WHERE id = (select auth.uid())
          AND raw_user_meta_data->>'role' = 'admin'
        )
      );
    COMMENT ON POLICY "Users can view own or admin cohorts" ON public.user_cohorts IS
      'Allow users to view their cohort and admins to view all cohorts.';
  END IF;
END $$;

-- =====================================================
-- Views: enforce security invoker
-- =====================================================
DO $$
BEGIN
  IF to_regclass('public.campaign_summaries') IS NOT NULL THEN
    ALTER VIEW public.campaign_summaries SET (security_invoker = true);
  END IF;

  IF to_regclass('public.golden_summary') IS NOT NULL THEN
    ALTER VIEW public.golden_summary SET (security_invoker = true);
  END IF;

  IF to_regclass('public.cohort_overview') IS NOT NULL THEN
    ALTER VIEW public.cohort_overview SET (security_invoker = true);
  END IF;

  IF to_regclass('public.testing_summary') IS NOT NULL THEN
    ALTER VIEW public.testing_summary SET (security_invoker = true);
  END IF;
END $$;

-- =====================================================
-- Functions: lock search_path
-- =====================================================
DO $$
DECLARE
  fn RECORD;
BEGIN
  FOR fn IN
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS arg_list
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp',
      fn.schema_name,
      fn.function_name,
      fn.arg_list
    );
  END LOOP;
END $$;

-- =====================================================
-- Policies: replace auth.uid() with (select auth.uid())
-- =====================================================
DO $$
DECLARE
  pol RECORD;
  new_qual TEXT;
  new_check TEXT;
  alter_stmt TEXT;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        (qual IS NOT NULL AND qual ~ 'auth\\.uid')
        OR (with_check IS NOT NULL AND with_check ~ 'auth\\.uid')
      )
  LOOP
    new_qual := pol.qual;
    new_check := pol.with_check;

    IF new_qual IS NOT NULL THEN
      new_qual := replace(new_qual, '(select auth.uid())', '__AUTH_UID_SELECT__');
      new_qual := regexp_replace(new_qual, 'auth\\.uid\\s*\\(\\s*\\)', '(select auth.uid())', 'g');
      new_qual := replace(new_qual, '__AUTH_UID_SELECT__', '(select auth.uid())');
    END IF;

    IF new_check IS NOT NULL THEN
      new_check := replace(new_check, '(select auth.uid())', '__AUTH_UID_SELECT__');
      new_check := regexp_replace(new_check, 'auth\\.uid\\s*\\(\\s*\\)', '(select auth.uid())', 'g');
      new_check := replace(new_check, '__AUTH_UID_SELECT__', '(select auth.uid())');
    END IF;

    alter_stmt := format('ALTER POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);

    IF new_qual IS NOT NULL THEN
      alter_stmt := alter_stmt || ' USING (' || new_qual || ')';
    END IF;

    IF new_check IS NOT NULL THEN
      alter_stmt := alter_stmt || ' WITH CHECK (' || new_check || ')';
    END IF;

    EXECUTE alter_stmt;
  END LOOP;
END $$;
