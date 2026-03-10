-- Update Thread Events Function (Atomic Operation)
-- totalaud.io - December 2025
--
-- Atomically updates thread-event relationships to prevent race conditions.
-- This function clears old relationships and sets new ones in a single transaction.

CREATE OR REPLACE FUNCTION update_thread_events(
  p_thread_id uuid,
  p_user_id uuid,
  p_event_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First, clear thread_id from events previously linked to this thread
  UPDATE user_timeline_events
  SET thread_id = NULL, updated_at = now()
  WHERE thread_id = p_thread_id
    AND user_id = p_user_id;

  -- Then, set thread_id on the new events (if any)
  IF array_length(p_event_ids, 1) > 0 THEN
    UPDATE user_timeline_events
    SET thread_id = p_thread_id, updated_at = now()
    WHERE id = ANY(p_event_ids)
      AND user_id = p_user_id;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_thread_events TO authenticated;

-- Comment for documentation
COMMENT ON FUNCTION update_thread_events IS 'Atomically updates thread-event relationships to prevent race conditions';
