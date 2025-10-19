/**
 * Shared types for Broker memory hooks
 */

export interface BrokerMemoryData {
  artist_name?: string
  genre?: string
  goal?: string
  experience?: string
}

export interface BrokerSessionSnapshot {
  session_id: string
  artist_name?: string
  goal?: string
  flow_template?: any // Serialized FlowTemplate
  last_accessed: string
  onboarding_completed: boolean
}
