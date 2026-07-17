-- Signal threads repair (July 2026): the live schema never matched the code,
-- so thread creation and thread-event linking always failed at runtime.

-- 1. id is text but had no default, so API inserts (which omit id) failed
ALTER TABLE signal_threads ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- 2. event_ids was uuid[] but timeline event ids are text ('evt-...')
ALTER TABLE signal_threads ALTER COLUMN event_ids DROP DEFAULT;
ALTER TABLE signal_threads ALTER COLUMN event_ids TYPE text[] USING event_ids::text[];
ALTER TABLE signal_threads ALTER COLUMN event_ids SET DEFAULT '{}'::text[];

-- 3. recalculate_thread_dates took uuid but ids are text
DROP FUNCTION IF EXISTS recalculate_thread_dates(uuid);
CREATE OR REPLACE FUNCTION recalculate_thread_dates(p_thread_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE signal_threads
  SET
    start_date = (SELECT MIN(event_date) FROM user_timeline_events WHERE thread_id = p_thread_id),
    end_date = (SELECT MAX(event_date) FROM user_timeline_events WHERE thread_id = p_thread_id),
    event_ids = (SELECT COALESCE(array_agg(id ORDER BY event_date), '{}') FROM user_timeline_events WHERE thread_id = p_thread_id),
    updated_at = now()
  WHERE id = p_thread_id;
END;
$$;

-- 4. update_thread_events is called by /api/threads but was never created.
--    Atomically re-points a thread's events: clears stale links, sets new ones.
CREATE OR REPLACE FUNCTION update_thread_events(p_thread_id text, p_user_id uuid, p_event_ids text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE user_timeline_events SET thread_id = NULL
   WHERE user_id = p_user_id AND thread_id = p_thread_id
     AND NOT (id = ANY(p_event_ids));
  UPDATE user_timeline_events SET thread_id = p_thread_id
   WHERE user_id = p_user_id AND id = ANY(p_event_ids);
END;
$$;
