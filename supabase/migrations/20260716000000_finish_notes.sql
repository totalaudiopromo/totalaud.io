-- Finish notes — persisted finishing-note sessions (July 2026)
--
-- Stores the client-side analysis (numbers only — audio never leaves the
-- artist's device) and the generated perspectives, per user. Feeds the
-- release loop later (Finish → Timeline hand-off).

CREATE TABLE IF NOT EXISTS finish_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  track_name TEXT,
  analysis JSONB NOT NULL,
  notes JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_finish_notes_user_id ON finish_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_finish_notes_created_at ON finish_notes(created_at DESC);

ALTER TABLE finish_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own finish notes"
  ON finish_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own finish notes"
  ON finish_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own finish notes"
  ON finish_notes FOR DELETE
  USING (auth.uid() = user_id);
