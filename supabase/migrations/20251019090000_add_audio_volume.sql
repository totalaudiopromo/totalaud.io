-- Add audio_volume preference for Flow State Design System

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS audio_volume numeric DEFAULT 0.7 CHECK (audio_volume >= 0 AND audio_volume <= 1);

COMMENT ON COLUMN user_preferences.audio_volume IS 'Global audio volume (0.0 to 1.0) for ambient sounds and UI feedback';
