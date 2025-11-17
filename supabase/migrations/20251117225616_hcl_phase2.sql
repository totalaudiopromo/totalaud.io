-- ══════════════════════════════════════════════════════════════════════════
-- HARDWARE CONTROL LAYER (HCL) - PHASE 2 MIGRATION
-- ══════════════════════════════════════════════════════════════════════════
-- Enhances HCL with advanced features:
-- - Gesture-based mappings (hold, double-tap, combos)
-- - Multi-device sync and grouping
-- - Scripting engine for complex workflows
-- - Performance mode and analytics
-- - Learn mode support
-- ══════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────────
-- 1. HARDWARE GESTURES
-- ──────────────────────────────────────────────────────────────────────────
-- Stores recorded gestures (double-tap, hold, combos)

CREATE TABLE IF NOT EXISTS hardware_gestures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES hardware_profiles(id) ON DELETE CASCADE NOT NULL,

  name text NOT NULL,
  description text,

  -- Gesture type: double_tap, hold, combo, sequence
  gesture_type text NOT NULL CHECK (gesture_type IN ('double_tap', 'hold', 'combo', 'sequence', 'velocity_sensitive')),

  -- Gesture data
  -- Example: { "inputs": ["pad-0-0", "pad-0-1"], "timing": [0, 150], "velocities": [127, 100] }
  data jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Mapped action (optional - can be mapped later)
  action text,
  action_param jsonb,

  enabled boolean DEFAULT true,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_hardware_gestures_profile_id ON hardware_gestures(profile_id);
CREATE INDEX idx_hardware_gestures_gesture_type ON hardware_gestures(gesture_type);
CREATE INDEX idx_hardware_gestures_enabled ON hardware_gestures(enabled) WHERE enabled = true;

-- ──────────────────────────────────────────────────────────────────────────
-- 2. HARDWARE SCRIPTS
-- ──────────────────────────────────────────────────────────────────────────
-- Stores JSON-based scripts for complex action sequences

CREATE TABLE IF NOT EXISTS hardware_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES hardware_profiles(id) ON DELETE CASCADE NOT NULL,

  name text NOT NULL,
  description text,

  -- JSON DSL script
  -- Example: { "steps": [{ "action": "open_window", "target": "cis" }, { "delay": 300 }] }
  script jsonb NOT NULL,

  -- Validation status
  validated boolean DEFAULT false,
  validation_errors text[],

  enabled boolean DEFAULT true,

  -- Execution statistics
  execution_count integer DEFAULT 0,
  last_executed_at timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_hardware_scripts_profile_id ON hardware_scripts(profile_id);
CREATE INDEX idx_hardware_scripts_enabled ON hardware_scripts(enabled) WHERE enabled = true;

-- ──────────────────────────────────────────────────────────────────────────
-- 3. HARDWARE DEVICE GROUPS
-- ──────────────────────────────────────────────────────────────────────────
-- Groups multiple devices into a single control surface

CREATE TABLE IF NOT EXISTS hardware_device_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  name text NOT NULL,
  description text,

  -- Array of device IDs in this group
  device_ids text[] NOT NULL DEFAULT '{}',

  -- Primary device (receives priority)
  primary_device_id text,

  -- Group settings
  -- Example: { "ledSync": true, "sharedMappings": true, "failover": "auto" }
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,

  enabled boolean DEFAULT true,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_hardware_device_groups_user_id ON hardware_device_groups(user_id);
CREATE INDEX idx_hardware_device_groups_enabled ON hardware_device_groups(enabled) WHERE enabled = true;

-- ──────────────────────────────────────────────────────────────────────────
-- 4. HARDWARE USAGE TRACKING
-- ──────────────────────────────────────────────────────────────────────────
-- Tracks input usage for analytics and heatmaps

CREATE TABLE IF NOT EXISTS hardware_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES hardware_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Input that was used
  input_type text NOT NULL,
  input_id text NOT NULL,

  -- Usage count
  count integer DEFAULT 1,

  -- Timing data
  last_used_at timestamptz DEFAULT now(),
  average_velocity numeric,

  -- Gesture detection
  gesture_detected boolean DEFAULT false,
  gesture_type text,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_hardware_usage_session_id ON hardware_usage(session_id);
CREATE INDEX idx_hardware_usage_user_id ON hardware_usage(user_id);
CREATE INDEX idx_hardware_usage_input_id ON hardware_usage(input_id);
CREATE INDEX idx_hardware_usage_last_used_at ON hardware_usage(last_used_at DESC);

-- ──────────────────────────────────────────────────────────────────────────
-- 5. HARDWARE PERFORMANCE LAYOUTS
-- ──────────────────────────────────────────────────────────────────────────
-- Stores performance mode layouts (clip matrix, parameter matrix, etc.)

CREATE TABLE IF NOT EXISTS hardware_performance_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES hardware_profiles(id) ON DELETE CASCADE NOT NULL,

  name text NOT NULL,
  description text,

  -- Layout type: clip_matrix, parameter_matrix, visualisation_matrix
  layout_type text NOT NULL CHECK (layout_type IN ('clip_matrix', 'parameter_matrix', 'visualisation_matrix', 'custom')),

  -- Layout configuration
  -- Example: { "grid": "8x8", "cells": [{ "pos": [0,0], "action": "trigger_scene", "param": {...} }] }
  config jsonb NOT NULL DEFAULT '{}'::jsonb,

  enabled boolean DEFAULT true,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_hardware_performance_layouts_profile_id ON hardware_performance_layouts(profile_id);
CREATE INDEX idx_hardware_performance_layouts_layout_type ON hardware_performance_layouts(layout_type);

-- ──────────────────────────────────────────────────────────────────────────
-- 6. HARDWARE CONTEXT MAPPINGS
-- ──────────────────────────────────────────────────────────────────────────
-- Context-aware mappings that change based on active window/mode

CREATE TABLE IF NOT EXISTS hardware_context_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES hardware_profiles(id) ON DELETE CASCADE NOT NULL,

  -- Context conditions
  -- Example: { "window": "cis", "mode": "creative", "persona": "producer" }
  context jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Input definition
  input_type text NOT NULL,
  input_id text NOT NULL,

  -- Action
  action text NOT NULL,
  param jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Priority (higher = takes precedence)
  priority integer DEFAULT 0,

  feedback text,
  enabled boolean DEFAULT true,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_hardware_context_mappings_profile_id ON hardware_context_mappings(profile_id);
CREATE INDEX idx_hardware_context_mappings_priority ON hardware_context_mappings(priority DESC);
CREATE INDEX idx_hardware_context_mappings_enabled ON hardware_context_mappings(enabled) WHERE enabled = true;

-- ──────────────────────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────────────────────────────────────

ALTER TABLE hardware_gestures ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_device_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_performance_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_context_mappings ENABLE ROW LEVEL SECURITY;

-- Policies for hardware_gestures
CREATE POLICY "Users can view own gestures"
  ON hardware_gestures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_gestures.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own gestures"
  ON hardware_gestures FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_gestures.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own gestures"
  ON hardware_gestures FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_gestures.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own gestures"
  ON hardware_gestures FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_gestures.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

-- Policies for hardware_scripts
CREATE POLICY "Users can view own scripts"
  ON hardware_scripts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_scripts.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own scripts"
  ON hardware_scripts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_scripts.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own scripts"
  ON hardware_scripts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_scripts.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own scripts"
  ON hardware_scripts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_scripts.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

-- Policies for hardware_device_groups
CREATE POLICY "Users can view own device groups"
  ON hardware_device_groups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own device groups"
  ON hardware_device_groups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own device groups"
  ON hardware_device_groups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own device groups"
  ON hardware_device_groups FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for hardware_usage
CREATE POLICY "Users can view own usage data"
  ON hardware_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own usage data"
  ON hardware_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for hardware_performance_layouts
CREATE POLICY "Users can view own performance layouts"
  ON hardware_performance_layouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_performance_layouts.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own performance layouts"
  ON hardware_performance_layouts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_performance_layouts.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own performance layouts"
  ON hardware_performance_layouts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_performance_layouts.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own performance layouts"
  ON hardware_performance_layouts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_performance_layouts.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

-- Policies for hardware_context_mappings
CREATE POLICY "Users can view own context mappings"
  ON hardware_context_mappings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_context_mappings.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own context mappings"
  ON hardware_context_mappings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_context_mappings.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own context mappings"
  ON hardware_context_mappings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_context_mappings.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own context mappings"
  ON hardware_context_mappings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM hardware_profiles
      WHERE hardware_profiles.id = hardware_context_mappings.profile_id
      AND hardware_profiles.user_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────────────────────
-- 8. UPDATED_AT TRIGGERS
-- ──────────────────────────────────────────────────────────────────────────

CREATE TRIGGER update_hardware_gestures_updated_at
  BEFORE UPDATE ON hardware_gestures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hardware_scripts_updated_at
  BEFORE UPDATE ON hardware_scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hardware_device_groups_updated_at
  BEFORE UPDATE ON hardware_device_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hardware_performance_layouts_updated_at
  BEFORE UPDATE ON hardware_performance_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hardware_context_mappings_updated_at
  BEFORE UPDATE ON hardware_context_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────────────────────────
-- 9. HELPER FUNCTIONS
-- ──────────────────────────────────────────────────────────────────────────

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_hardware_usage(
  p_session_id uuid,
  p_user_id uuid,
  p_input_type text,
  p_input_id text,
  p_velocity numeric DEFAULT NULL,
  p_gesture_type text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO hardware_usage (
    session_id,
    user_id,
    input_type,
    input_id,
    count,
    average_velocity,
    gesture_detected,
    gesture_type,
    last_used_at
  ) VALUES (
    p_session_id,
    p_user_id,
    p_input_type,
    p_input_id,
    1,
    p_velocity,
    p_gesture_type IS NOT NULL,
    p_gesture_type,
    now()
  )
  ON CONFLICT (session_id, input_id)
  DO UPDATE SET
    count = hardware_usage.count + 1,
    last_used_at = now(),
    average_velocity = CASE
      WHEN p_velocity IS NOT NULL THEN
        (hardware_usage.average_velocity * hardware_usage.count + p_velocity) / (hardware_usage.count + 1)
      ELSE hardware_usage.average_velocity
    END,
    gesture_detected = CASE
      WHEN p_gesture_type IS NOT NULL THEN true
      ELSE hardware_usage.gesture_detected
    END,
    gesture_type = COALESCE(p_gesture_type, hardware_usage.gesture_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get usage heatmap
CREATE OR REPLACE FUNCTION get_hardware_usage_heatmap(
  p_user_id uuid,
  p_session_id uuid DEFAULT NULL
)
RETURNS TABLE (
  input_id text,
  usage_count bigint,
  avg_velocity numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    hu.input_id,
    SUM(hu.count) as usage_count,
    AVG(hu.average_velocity) as avg_velocity
  FROM hardware_usage hu
  WHERE hu.user_id = p_user_id
    AND (p_session_id IS NULL OR hu.session_id = p_session_id)
  GROUP BY hu.input_id
  ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate creative flow score
CREATE OR REPLACE FUNCTION calculate_flow_score(p_session_id uuid)
RETURNS numeric AS $$
DECLARE
  v_score numeric := 0;
  v_unique_inputs integer;
  v_gesture_count integer;
  v_action_diversity numeric;
  v_session_duration interval;
BEGIN
  -- Count unique inputs used
  SELECT COUNT(DISTINCT input_id)
  INTO v_unique_inputs
  FROM hardware_usage
  WHERE session_id = p_session_id;

  -- Count gestures detected
  SELECT COUNT(*)
  INTO v_gesture_count
  FROM hardware_usage
  WHERE session_id = p_session_id
    AND gesture_detected = true;

  -- Get session duration
  SELECT (ended_at - started_at)
  INTO v_session_duration
  FROM hardware_sessions
  WHERE id = p_session_id;

  -- Calculate score (0-100)
  v_score := LEAST(100, (
    (v_unique_inputs * 2) +
    (v_gesture_count * 3) +
    (EXTRACT(EPOCH FROM v_session_duration) / 60 * 0.5)
  ));

  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ══════════════════════════════════════════════════════════════════════════
-- END OF HCL PHASE 2 MIGRATION
-- ══════════════════════════════════════════════════════════════════════════
