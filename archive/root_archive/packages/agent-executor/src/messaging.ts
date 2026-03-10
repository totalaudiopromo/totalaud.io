import { supabase } from '@total-audio/core-supabase'

export interface AgentMessage {
  id: string
  from_agent: string
  to_agent: string
  content: string
  session_id: string
  message_type?: string
  metadata?: Record<string, any>
  created_at: string
}

export async function sendAgentMessage(msg: Omit<AgentMessage, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('agent_messages')
    .insert({
      from_agent: msg.from_agent,
      to_agent: msg.to_agent,
      content: msg.content,
      session_id: msg.session_id,
      message_type: msg.message_type || 'info',
      metadata: msg.metadata || {},
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function fetchAgentMessages(session_id: string, agent_name?: string) {
  let query = supabase
    .from('agent_messages')
    .select('*')
    .eq('session_id', session_id)
    .order('created_at', { ascending: true })

  if (agent_name) {
    query = query.or(`to_agent.eq.${agent_name},from_agent.eq.${agent_name}`)
  }

  const { data } = await query
  return data || []
}
