/**
 * Coach Drafts Migration
 *
 * Stores AI-generated follow-up email drafts from the Coach agent.
 * Design Principle: "Data should lead to dialogue."
 */

-- Create coach_drafts table
CREATE TABLE IF NOT EXISTS coach_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES agent_sessions(id) ON DELETE CASCADE,
  thread_id text NOT NULL,
  contact_email text NOT NULL,
  contact_name text,
  subject text NOT NULL,
  body text NOT NULL,
  theme text NOT NULL, -- OS theme used for generation (ascii, xp, apple, quantum)
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'archived')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_coach_drafts_user_id ON coach_drafts(user_id);
CREATE INDEX idx_coach_drafts_session_id ON coach_drafts(session_id);
CREATE INDEX idx_coach_drafts_status ON coach_drafts(status);
CREATE INDEX idx_coach_drafts_thread_id ON coach_drafts(thread_id);

-- Enable Row Level Security
ALTER TABLE coach_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own drafts
CREATE POLICY "Users can view their own drafts"
  ON coach_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drafts"
  ON coach_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts"
  ON coach_drafts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts"
  ON coach_drafts FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime for live draft updates
ALTER PUBLICATION supabase_realtime ADD TABLE coach_drafts;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coach_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coach_drafts_updated_at
  BEFORE UPDATE ON coach_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_coach_drafts_updated_at();

-- Add comment for documentation
COMMENT ON TABLE coach_drafts IS 'AI-generated follow-up email drafts from Coach agent';
COMMENT ON COLUMN coach_drafts.theme IS 'OS theme personality used for generation (ascii, xp, apple, quantum)';
COMMENT ON COLUMN coach_drafts.status IS 'Draft status: draft (not sent), sent (via Gmail), archived (user dismissed)';
COMMENT ON COLUMN coach_drafts.metadata IS 'Additional context: campaign_name, original_email_subject, llm_model, etc.';
