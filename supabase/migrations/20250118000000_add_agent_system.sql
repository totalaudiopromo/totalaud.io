-- Skills Registry
CREATE TABLE IF NOT EXISTS skills (
  name text PRIMARY KEY,
  version text NOT NULL,
  category text NOT NULL CHECK (category IN ('research', 'generation', 'analysis', 'communication')),
  description text,
  input_schema jsonb NOT NULL,
  output_schema jsonb NOT NULL,
  provider text NOT NULL CHECK (provider IN ('openai', 'anthropic', 'custom')),
  model text,
  config jsonb DEFAULT '{}'::jsonb,
  enabled boolean DEFAULT true,
  is_beta boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agents Registry
CREATE TABLE IF NOT EXISTS agents (
  name text PRIMARY KEY,
  version text NOT NULL,
  description text,
  system_prompt text NOT NULL,
  available_skills text[] NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  avatar_emoji text DEFAULT '🤖',
  color text DEFAULT '#6366f1',
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agent Sessions
CREATE TABLE IF NOT EXISTS agent_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name text REFERENCES agents(name) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  
  name text,
  description text,
  
  initial_input jsonb NOT NULL,
  final_output jsonb,
  
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  current_step integer DEFAULT 0,
  total_steps integer,
  
  trace jsonb[] DEFAULT ARRAY[]::jsonb[],
  
  tokens_used integer DEFAULT 0,
  cost_usd numeric DEFAULT 0,
  duration_ms integer,
  
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_agent_sessions_user_id ON agent_sessions(user_id);
CREATE INDEX idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX idx_agent_sessions_created_at ON agent_sessions(created_at DESC);

-- Agent Session Steps
CREATE TABLE IF NOT EXISTS agent_session_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES agent_sessions(id) ON DELETE CASCADE NOT NULL,
  step_number integer NOT NULL,
  skill_name text REFERENCES skills(name),
  description text,
  input jsonb,
  output jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  UNIQUE(session_id, step_number)
);

CREATE INDEX idx_agent_session_steps_session_id ON agent_session_steps(session_id);

-- Skill Executions
CREATE TABLE IF NOT EXISTS skill_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name text REFERENCES skills(name) NOT NULL,
  input jsonb NOT NULL,
  output jsonb,
  duration_ms integer,
  tokens_used integer,
  cost_usd numeric,
  status text CHECK (status IN ('success', 'error', 'timeout')),
  error_message text,
  agent_session_id uuid REFERENCES agent_sessions(id),
  user_id uuid REFERENCES auth.users(id),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_skill_executions_skill_name ON skill_executions(skill_name);
CREATE INDEX idx_skill_executions_user_id ON skill_executions(user_id);
CREATE INDEX idx_skill_executions_started_at ON skill_executions(started_at DESC);

-- Enable Realtime for agent sessions
ALTER PUBLICATION supabase_realtime ADD TABLE agent_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_session_steps;

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_sessions_updated_at BEFORE UPDATE ON agent_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

