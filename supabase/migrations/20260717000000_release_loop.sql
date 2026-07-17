-- Release loop foundations (July 2026, Phase 4 — docs/ROADMAP_2026.md)
--
-- 1. The UI has always used a 'post-release' lane but the check constraint
--    never allowed it, so post-release events silently failed to persist
--    and lived only in localStorage. Widen the constraint.
-- 2. Timeline events can now reference the person they are about (a TAP
--    contact id such as ctc_...), so completing a follow-up can offer to
--    log an outcome against the right relationship.

ALTER TABLE user_timeline_events
  DROP CONSTRAINT IF EXISTS user_timeline_events_lane_check;

ALTER TABLE user_timeline_events
  ADD CONSTRAINT user_timeline_events_lane_check
  CHECK (lane IN ('pre-release', 'release', 'post-release', 'promo', 'content', 'analytics'));

-- TAP contact ids are prefixed strings, not UUIDs
ALTER TABLE user_timeline_events
  ADD COLUMN IF NOT EXISTS contact_id TEXT;

CREATE INDEX IF NOT EXISTS idx_user_timeline_events_contact_id
  ON user_timeline_events(contact_id)
  WHERE contact_id IS NOT NULL;
