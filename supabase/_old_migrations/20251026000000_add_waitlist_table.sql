-- Waitlist table for landing page CTA
-- Stores email signups for private beta access

CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text NOT NULL DEFAULT 'landing_page',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist(email);

-- Index for source analytics
CREATE INDEX IF NOT EXISTS waitlist_source_idx ON waitlist(source);

-- Index for created_at (for time-based queries)
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON waitlist(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (signup)
CREATE POLICY "Anyone can signup for waitlist"
  ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only service role can read waitlist
CREATE POLICY "Only service role can read waitlist"
  ON waitlist
  FOR SELECT
  USING (false); -- No public reads, only via service role key

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_waitlist_updated_at
  BEFORE UPDATE ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment for documentation
COMMENT ON TABLE waitlist IS 'Email signups from landing page CTA for private beta access';
