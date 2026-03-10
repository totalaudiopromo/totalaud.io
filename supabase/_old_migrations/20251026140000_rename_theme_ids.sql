-- Migration: Rename Theme IDs to Posture-Based Names
-- Theme System Anti-Gimmick Refactor
-- Date: 2025-10-26

-- Update existing user_prefs records with new theme IDs
UPDATE user_prefs SET theme = 'operator' WHERE theme = 'ascii';
UPDATE user_prefs SET theme = 'guide' WHERE theme = 'xp';
UPDATE user_prefs SET theme = 'map' WHERE theme = 'aqua';
UPDATE user_prefs SET theme = 'timeline' WHERE theme = 'daw';
UPDATE user_prefs SET theme = 'tape' WHERE theme = 'analogue';

-- Drop old constraint if it exists
ALTER TABLE user_prefs DROP CONSTRAINT IF EXISTS user_prefs_theme_check;

-- Add new constraint with updated theme IDs
ALTER TABLE user_prefs ADD CONSTRAINT user_prefs_theme_check
  CHECK (theme IN ('operator', 'guide', 'map', 'timeline', 'tape'));

-- Add comment explaining the change
COMMENT ON COLUMN user_prefs.theme IS 'User theme preference - posture-based workflows: operator (fast lane), guide (pathfinder), map (strategist), timeline (sequencer), tape (receipt)';
