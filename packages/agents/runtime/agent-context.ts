/**
 * Agent Execution Context - Phase 9
 * Provides campaign, OS, and timeline context to agents
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ClipExecutionContext, TimelineState } from '@total-audio/timeline'

/**
 * OS Theme Type
 */
export type OSTheme = 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'

/**
 * Campaign Context
 */
export interface CampaignContext {
  id: string
  name: string
  goal: string
  status: 'active' | 'paused' | 'completed'
  createdAt: string
  metadata: Record<string, unknown>
}

/**
 * User Context
 */
export interface UserContext {
  id: string
  email: string
  metadata: Record<string, unknown>
}

/**
 * Agent Runtime Context
 */
export interface AgentRuntimeContext {
  // Campaign context
  campaign: CampaignContext

  // User context
  user: UserContext

  // OS theme
  osTheme: OSTheme

  // Timeline state
  timeline: TimelineState

  // Clip execution context
  clip: ClipExecutionContext

  // Supabase client for database access
  supabase: SupabaseClient

  // Metadata
  metadata: Record<string, unknown>
}

/**
 * Context Builder
 */
export class AgentContextBuilder {
  private context: Partial<AgentRuntimeContext> = {}

  setCampaign(campaign: CampaignContext): this {
    this.context.campaign = campaign
    return this
  }

  setUser(user: UserContext): this {
    this.context.user = user
    return this
  }

  setOSTheme(theme: OSTheme): this {
    this.context.osTheme = theme
    return this
  }

  setTimeline(timeline: TimelineState): this {
    this.context.timeline = timeline
    return this
  }

  setClip(clip: ClipExecutionContext): this {
    this.context.clip = clip
    return this
  }

  setSupabase(supabase: SupabaseClient): this {
    this.context.supabase = supabase
    return this
  }

  setMetadata(metadata: Record<string, unknown>): this {
    this.context.metadata = metadata
    return this
  }

  build(): AgentRuntimeContext {
    // Validate required fields
    if (!this.context.campaign) {
      throw new Error('Campaign context is required')
    }

    if (!this.context.user) {
      throw new Error('User context is required')
    }

    if (!this.context.osTheme) {
      throw new Error('OS theme is required')
    }

    if (!this.context.timeline) {
      throw new Error('Timeline state is required')
    }

    if (!this.context.clip) {
      throw new Error('Clip execution context is required')
    }

    if (!this.context.supabase) {
      throw new Error('Supabase client is required')
    }

    return this.context as AgentRuntimeContext
  }
}

/**
 * Create agent context builder
 */
export function createAgentContext(): AgentContextBuilder {
  return new AgentContextBuilder()
}
