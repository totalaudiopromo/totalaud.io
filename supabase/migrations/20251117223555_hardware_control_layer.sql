-- ══════════════════════════════════════════════════════════════════════════
-- HARDWARE CONTROL LAYER (HCL) MIGRATION
-- ══════════════════════════════════════════════════════════════════════════
-- Creates database tables for hardware controller integration
-- Enables Push 2, Push 3, Launchpad, MPK Mini, and generic MIDI devices
-- to control TotalAud.io interface and actions
-- ══════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────────
-- 1. HARDWARE PROFILES
-- ──────────────────────────────────────────────────────────────────────────
-- Stores device-specific configuration for each user's hardware controller

CREATE TABLE IF NOT EXISTS hardware_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  device_type text NOT NULL CHECK (device_type IN ('push2', 'push3', 'launchpad', 'mpk', 'generic_midi')),
  device_id text,

  midi_in_port text,
  midi_out_port text,

  -- Layout configuration (pads, encoders, buttons, etc.)
  -- Example: { "pads": { "0": "pad-0-0", "1": "pad-0-1" }, "encoders": [...] }
  layout jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Optional device-specific settings
  metadata jsonb DEFAULT '{}'::jsonb,

  enabled boolean DEFAULT true,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Ensure one active profile per device type per user
  UNIQUE(user_id, device_type)
);

CREATE INDEX idx_hardware_profiles_user_id ON hardware_profiles(user_id);
CREATE INDEX idx_hardware_profiles_device_type ON hardware_profiles(device_type);
CREATE INDEX idx_hardware_profiles_enabled ON hardware_profiles(enabled) WHERE enabled = true;

-- ──────────────────────────────────────────────────────────────────────────
-- 2. HARDWARE MAPPINGS
-- ──────────────────────────────────────────────────────────────────────────
-- Maps hardware inputs (pads, encoders, buttons) to TotalAud.io actions

CREATE TABLE IF NOT EXISTS hardware_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES hardware_profiles(id) ON DELETE CASCADE NOT NULL,

  -- Input definition
  input_type text NOT NULL CHECK (input_type IN ('pad', 'encoder', 'button', 'fader', 'strip', 'key', 'knob')),
  input_id text NOT NULL,

  -- Action to trigger
  action text NOT NULL CHECK (action IN (
    'open_window',
    'focus_window',
    'close_window',
    'cycle_window',
    'trigger_scene',
    'switch_scene',
    'run_agent',
    'spawn_agent',
    'run_skill',
    'control_param',
    'adjust_param',
    'toggle_mode',
    'save_snapshot',
    'trigger_command',
    'navigate',
    'cycle_theme',
    'toggle_flow_mode',
    'trigger_boot'
  )),

  -- Action parameters
  -- Example: { "window": "studio", "agent": "creative", "param": "intensity", "value": 10 }
  param jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- LED feedback configuration
  -- Example: "cyan-pulse", "red-static", "flow-mode"
  feedback text,

  -- Mapping state
  enabled boolean DEFAULT true,

  -- Context (optional) - when this mapping is active
  -- Example: "flow_mode", "studio_open", "scene_active"
  context text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Ensure unique mapping per input per profile
  UNIQUE(profile_id, input_id)
);

CREATE INDEX idx_hardware_mappings_profile_id ON hardware_mappings(profile_id);
CREATE INDEX idx_hardware_mappings_action ON hardware_mappings(action);
CREATE INDEX idx_hardware_mappings_enabled ON hardware_mappings(enabled) WHERE enabled = true;
CREATE INDEX idx_hardware_mappings_context ON hardware_mappings(context) WHERE context IS NOT NULL;

-- ──────────────────────────────────────────────────────────────────────────
-- 3. HARDWARE SESSIONS
-- ──────────────────────────────────────────────────────────────────────────
-- Logs sessions where hardware controllers are active

CREATE TABLE IF NOT EXISTS hardware_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES hardware_profiles(id) ON DELETE SET NULL,

  device_type text NOT NULL,

  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,

  -- Session statistics
  total_actions integer DEFAULT 0,
  duration_ms integer,

  -- Session metadata (device info, context, etc.)
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Flow mode tracking
  flow_mode_enabled boolean DEFAULT false,
  flow_mode_duration_ms integer DEFAULT 0
);

CREATE INDEX idx_hardware_sessions_user_id ON hardware_sessions(user_id);
CREATE INDEX idx_hardware_sessions_started_at ON hardware_sessions(started_at DESC);
CREATE INDEX idx_hardware_sessions_device_type ON hardware_sessions(device_type);
CREATE INDEX idx_hardware_sessions_active ON hardware_sessions(ended_at) WHERE ended_at IS NULL;

-- ──────────────────────────────────────────────────────────────────────────
-- 4. HARDWARE ACTION LOG
-- ──────────────────────────────────────────────────────────────────────────
-- Tracks every hardware action executed (for analytics and debugging)

CREATE TABLE IF NOT EXISTS hardware_action_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES hardware_sessions(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES hardware_profiles(id) ON DELETE SET NULL,

  -- Input that triggered the action
  input_type text NOT NULL,
  input_id text NOT NULL,
  input_value integer,

  -- Action executed
  action text NOT NULL,
  param jsonb,

  -- Execution result
  status text DEFAULT 'success' CHECK (status IN ('success', 'error', 'skipped')),
  error_message text,

  -- Timing
  executed_at timestamptz DEFAULT now(),
  duration_ms integer
);

CREATE INDEX idx_hardware_action_log_session_id ON hardware_action_log(session_id);
CREATE INDEX idx_hardware_action_log_user_id ON hardware_action_log(user_id);
CREATE INDEX idx_hardware_action_log_executed_at ON hardware_action_log(executed_at DESC);
CREATE INDEX idx_hardware_action_log_action ON hardware_action_log(action);

-- ──────────────────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE hardware_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_action_log ENABLE ROW LEVEL SECURITY;

-- Policies for hardware_profiles
CREATE POLICY "Users can view own hardware profiles"
  ON hardware_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own hardware profiles"
  ON hardware_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hardware profiles"
  ON hardware_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hardware profiles"
  ON hardware_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for hardware_mappings
CREATE POLICY "Users can view own hardware mappings"
  ON hardware_mappings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_mappings.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own hardware mappings"
  ON hardware_mappings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_mappings.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own hardware mappings"
  ON hardware_mappings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_mappings.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own hardware mappings"
  ON hardware_mappings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_mappings.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

-- Policies for hardware_sessions
CREATE POLICY "Users can view own hardware sessions"
  ON hardware_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own hardware sessions"
  ON hardware_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hardware sessions"
  ON hardware_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for hardware_action_log
CREATE POLICY "Users can view own hardware action log"
  ON hardware_action_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own hardware action log"
  ON hardware_action_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────────────────
-- 6. UPDATED_AT TRIGGERS
-- ──────────────────────────────────────────────────────────────────────────

CREATE TRIGGER update_hardware_profiles_updated_at
  BEFORE UPDATE ON hardware_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hardware_mappings_updated_at
  BEFORE UPDATE ON hardware_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────────────────────────
-- 7. ENABLE REALTIME
-- ──────────────────────────────────────────────────────────────────────────
-- Enable real-time updates for hardware sessions and action log

ALTER PUBLICATION supabase_realtime ADD TABLE hardware_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE hardware_action_log;

-- ──────────────────────────────────────────────────────────────────────────
-- 8. HELPER FUNCTIONS
-- ──────────────────────────────────────────────────────────────────────────

-- Function to get active hardware session for a user
CREATE OR REPLACE FUNCTION get_active_hardware_session(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  device_type text,
  started_at timestamptz,
  total_actions integer,
  flow_mode_enabled boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    hs.id,
    hs.device_type,
    hs.started_at,
    hs.total_actions,
    hs.flow_mode_enabled
  FROM hardware_sessions hs
  WHERE hs.user_id = p_user_id
    AND hs.ended_at IS NULL
  ORDER BY hs.started_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment session action count
CREATE OR REPLACE FUNCTION increment_session_actions(p_session_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE hardware_sessions
  SET total_actions = total_actions + 1
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ══════════════════════════════════════════════════════════════════════════
-- END OF HARDWARE CONTROL LAYER MIGRATION
-- ══════════════════════════════════════════════════════════════════════════
