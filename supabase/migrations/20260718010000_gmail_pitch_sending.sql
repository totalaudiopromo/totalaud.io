-- Gmail send-from-your-own-inbox for pitches (Phase 6, docs/ROADMAP_2026.md).
--
-- gmail_connections holds the artist's own OAuth tokens. RLS is enabled with
-- no user policies on purpose: only the service role (server routes) can read
-- or write tokens, so they never reach the browser.
--
-- pitch_sends records what the artist explicitly chose to send; the partial
-- unique index makes a retried send idempotent. Nothing auto-sends.

CREATE TABLE IF NOT EXISTS gmail_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE gmail_connections ENABLE ROW LEVEL SECURITY;
-- No policies: service-role access only.

CREATE TABLE IF NOT EXISTS pitch_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idempotency_key TEXT,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  gmail_message_id TEXT,
  gmail_thread_id TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pitch_sends_idempotency
  ON pitch_sends(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pitch_sends_user
  ON pitch_sends(user_id, sent_at DESC);

ALTER TABLE pitch_sends ENABLE ROW LEVEL SECURITY;

-- Artists can see their own send history; writes go through the server
-- (service role) after the Gmail send succeeds.
DROP POLICY IF EXISTS "Users can view own pitch sends" ON pitch_sends;
CREATE POLICY "Users can view own pitch sends" ON pitch_sends
  FOR SELECT USING (auth.uid() = user_id);
