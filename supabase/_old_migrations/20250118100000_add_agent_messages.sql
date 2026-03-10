-- Agent-to-Agent Messaging System
CREATE TABLE IF NOT EXISTS agent_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES agent_sessions(id) ON DELETE CASCADE,
  from_agent text NOT NULL,
  to_agent text NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'info' CHECK (message_type IN ('info', 'request', 'response', 'error')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_agent_messages_session_id ON agent_messages(session_id);
CREATE INDEX idx_agent_messages_from_agent ON agent_messages(from_agent);
CREATE INDEX idx_agent_messages_to_agent ON agent_messages(to_agent);
CREATE INDEX idx_agent_messages_created_at ON agent_messages(created_at DESC);

-- Enable Realtime for agent messages
ALTER PUBLICATION supabase_realtime ADD TABLE agent_messages;

COMMENT ON TABLE agent_messages IS 'Messages exchanged between agents during collaborative workflows';
COMMENT ON COLUMN agent_messages.from_agent IS 'Name of the agent sending the message';
COMMENT ON COLUMN agent_messages.to_agent IS 'Name of the agent receiving the message';
COMMENT ON COLUMN agent_messages.message_type IS 'Type of message: info, request, response, or error';
COMMENT ON COLUMN agent_messages.metadata IS 'Additional context or data related to the message';

