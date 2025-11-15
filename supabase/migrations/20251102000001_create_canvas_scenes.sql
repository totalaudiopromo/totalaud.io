-- Phase 14.5: Canvas Scenes Table
-- Stores FlowCanvas scene snapshots for save/share functionality

-- Create canvas_scenes table
CREATE TABLE IF NOT EXISTS public.canvas_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  campaign_id uuid,
  
  -- Scene data
  title text NOT NULL DEFAULT 'Untitled Scene',
  scene_state jsonb NOT NULL,
  
  -- Sharing
  public_share_id uuid UNIQUE DEFAULT gen_random_uuid(),
  is_public boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  last_viewed_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.canvas_scenes ENABLE ROW LEVEL SECURITY;

-- Users can view their own scenes
CREATE POLICY "Users can view own canvas scenes"
  ON public.canvas_scenes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own scenes
CREATE POLICY "Users can insert own canvas scenes"
  ON public.canvas_scenes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own scenes
CREATE POLICY "Users can update own canvas scenes"
  ON public.canvas_scenes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own scenes
CREATE POLICY "Users can delete own canvas scenes"
  ON public.canvas_scenes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Anyone can view public scenes (for sharing)
CREATE POLICY "Anyone can view public canvas scenes"
  ON public.canvas_scenes
  FOR SELECT
  USING (is_public = true);

-- Create index for faster lookups
CREATE INDEX idx_canvas_scenes_user_created
  ON public.canvas_scenes(user_id, created_at DESC);

CREATE INDEX idx_canvas_scenes_public_share
  ON public.canvas_scenes(public_share_id)
  WHERE is_public = true;

-- Create updated_at trigger
CREATE TRIGGER update_canvas_scenes_updated_at
  BEFORE UPDATE ON public.canvas_scenes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.canvas_scenes IS 'Stores FlowCanvas scene snapshots for save/share functionality';
COMMENT ON COLUMN public.canvas_scenes.scene_state IS 'JSONB snapshot of FlowCanvas state (nodes, edges, viewport)';
COMMENT ON COLUMN public.canvas_scenes.public_share_id IS 'Unique UUID for public sharing links';
COMMENT ON COLUMN public.canvas_scenes.is_public IS 'Whether this scene is publicly accessible via share link';

-- Add last_saved_at to campaign_context
ALTER TABLE public.campaign_context 
  ADD COLUMN IF NOT EXISTS last_saved_at timestamptz;

COMMENT ON COLUMN public.campaign_context.last_saved_at IS 'Last time scene was saved for this campaign';
