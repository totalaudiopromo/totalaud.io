-- Enhance agents table for Flow Canvas visualization

ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS flow_shape text DEFAULT 'circle',
ADD COLUMN IF NOT EXISTS description_short text;

-- Update existing agents with short descriptions
UPDATE agents SET
  description_short = CASE
    WHEN name = 'scout-agent' THEN 'Finds opportunities'
    WHEN name = 'coach-agent' THEN 'Crafts pitches'
    WHEN name = 'tracker-agent' THEN 'Monitors campaigns'
    WHEN name = 'insight-agent' THEN 'Surfaces analytics'
    ELSE 'AI agent'
  END,
  flow_shape = CASE
    WHEN name = 'scout-agent' THEN 'diamond'
    WHEN name = 'coach-agent' THEN 'circle'
    WHEN name = 'tracker-agent' THEN 'rectangle'
    WHEN name = 'insight-agent' THEN 'circle'
    ELSE 'circle'
  END
WHERE description_short IS NULL OR flow_shape = 'circle';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_enabled ON agents(enabled) WHERE enabled = true;

-- Add comments
COMMENT ON COLUMN agents.flow_shape IS 'Visual shape for Flow Canvas: circle, rectangle, diamond';
COMMENT ON COLUMN agents.description_short IS 'Short description for tooltips and UI';

