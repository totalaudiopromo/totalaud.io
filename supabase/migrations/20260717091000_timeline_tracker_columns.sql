-- The timeline store has always written tracker_campaign_id and
-- tracker_synced_at (TAP Tracker sync), but the live table never had the
-- columns, so PostgREST rejected every timeline upsert that included them.
-- Additive fix: create the columns the code expects.

ALTER TABLE user_timeline_events
  ADD COLUMN IF NOT EXISTS tracker_campaign_id TEXT;

ALTER TABLE user_timeline_events
  ADD COLUMN IF NOT EXISTS tracker_synced_at TIMESTAMPTZ;
