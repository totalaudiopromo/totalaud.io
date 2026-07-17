-- Personal access tokens for "bring your own assistant" (Phase 6,
-- docs/ROADMAP_2026.md). A token lets an artist's own AI assistant read
-- their workspace through the totalaud.io MCP endpoint. Only a SHA-256
-- hash is stored; the token itself is shown once at creation.

CREATE TABLE IF NOT EXISTS user_api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  token_last4 TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_api_tokens_user_id ON user_api_tokens(user_id);

ALTER TABLE user_api_tokens ENABLE ROW LEVEL SECURITY;

-- Artists can see and revoke their own tokens (metadata only — the hash
-- is useless without the original token). Creation goes through the API
-- with the service role so hashing stays server-side.
DROP POLICY IF EXISTS "Users can view own tokens" ON user_api_tokens;
CREATE POLICY "Users can view own tokens" ON user_api_tokens
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can revoke own tokens" ON user_api_tokens;
CREATE POLICY "Users can revoke own tokens" ON user_api_tokens
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tokens" ON user_api_tokens;
CREATE POLICY "Users can delete own tokens" ON user_api_tokens
  FOR DELETE USING (auth.uid() = user_id);
