-- Migration: Convert UUID IDs to TEXT to support prefixed IDs (e.g., idea-, evt-, thread-)
-- This fixes the "invalid input syntax for type uuid" error in production.

-- == 1. DROP CONSTRAINTS AND DEFAULTS ==
ALTER TABLE user_timeline_events DROP CONSTRAINT IF EXISTS fk_timeline_thread;
ALTER TABLE user_timeline_events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE user_ideas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE user_pitch_drafts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE signal_threads ALTER COLUMN id DROP DEFAULT;

-- == 2. CONVERT TYPES ==

-- User Ideas
ALTER TABLE user_ideas ALTER COLUMN id TYPE TEXT;

-- User Timeline Events
ALTER TABLE user_timeline_events ALTER COLUMN id TYPE TEXT;
ALTER TABLE user_timeline_events ALTER COLUMN thread_id TYPE TEXT;

-- User Pitch Drafts
ALTER TABLE user_pitch_drafts ALTER COLUMN id TYPE TEXT;

-- Signal Threads
ALTER TABLE signal_threads ALTER COLUMN id TYPE TEXT;
ALTER TABLE signal_threads ALTER COLUMN event_ids TYPE TEXT[] USING event_ids::text[];

-- == 3. RE-ADD CONSTRAINTS ==
ALTER TABLE user_timeline_events
  ADD CONSTRAINT fk_timeline_thread
  FOREIGN KEY (thread_id) REFERENCES signal_threads(id) ON DELETE SET NULL;

-- == 4. CLEAN UP OTHER SMALL BUGS ==
-- Ensure all used tags are in the check (adding 'music' if needed, though they aren't in frontend yet)
-- The check is already tag IN ('content', 'brand', 'music', 'promo') so it's fine.

COMMENT ON COLUMN user_ideas.id IS 'Switched from UUID to TEXT to support app-prefixed IDs like idea-xxxx';
COMMENT ON COLUMN user_timeline_events.id IS 'Switched from UUID to TEXT to support app-prefixed IDs like evt-xxxx';
COMMENT ON COLUMN signal_threads.id IS 'Switched from UUID to TEXT to support app-prefixed IDs like thread-xxxx';
