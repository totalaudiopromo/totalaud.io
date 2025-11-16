/**
 * Tracker Agent Behaviour - Phase 9
 * Status logging, follow-up management, and campaign tracking
 */

import type { AgentBehaviour } from '../runtime/agent-runner'
import type { AgentRuntimeContext } from '../runtime/agent-context'
import type { AgentBehaviourResult, TimelineClip } from '@total-audio/timeline'
import type { FollowupPayload } from '@total-audio/timeline/clip-interpreter'
import { getAgentLogger } from '../runtime/agent-logger'

const logger = getAgentLogger()

/**
 * Tracker Agent Implementation
 */
export class TrackerBehaviour implements AgentBehaviour {
  readonly type = 'tracker' as const

  getDescription(): string {
    return 'Tracker Agent - Campaign tracking, status updates, and follow-up management'
  }

  canExecute(context: AgentRuntimeContext): boolean {
    const behaviourType = context.clip.clip.behaviourType
    return behaviourType === 'followup' || behaviourType === 'custom'
  }

  async execute(context: AgentRuntimeContext): Promise<AgentBehaviourResult> {
    const clip = context.clip.clip
    const clipId = clip.id

    logger.info('tracker', clipId, 'Starting Tracker agent execution')

    try {
      if (clip.behaviourType === 'followup') {
        return await this.executeFollowup(context)
      } else {
        return await this.executeCustom(context)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('tracker', clipId, `Tracker execution failed: ${errorMessage}`)

      return {
        success: false,
        clipId,
        agentType: 'tracker',
        behaviourType: clip.behaviourType,
        message: `Tracker execution failed: ${errorMessage}`,
        errors: [errorMessage],
      }
    }
  }

  /**
   * Execute follow-up tracking
   */
  private async executeFollowup(context: AgentRuntimeContext): Promise<AgentBehaviourResult> {
    const clip = context.clip.clip
    const clipId = clip.id
    const payload = clip.payload as FollowupPayload

    logger.info('tracker', clipId, 'Tracking follow-up')

    // Log follow-up to database
    try {
      const { data, error } = await context.supabase.from('agent_outputs').insert({
        agent_name: 'tracker',
        clip_id: clipId,
        campaign_id: context.campaign.id,
        user_id: context.user.id,
        event_type: 'followup_tracked',
        payload: {
          contactEmail: payload.contactEmail,
          previousMessageId: payload.previousMessageId,
          status: 'pending',
        },
        created_at: new Date().toISOString(),
      })

      if (error) {
        throw error
      }

      // Generate follow-up reminder clip
      const generatedClips: TimelineClip[] = [
        {
          id: `${clipId}-reminder`,
          campaignId: context.campaign.id,
          trackId: context.clip.track.id,
          agentType: 'insight',
          behaviourType: 'analysis',
          executionMode: 'auto',
          status: 'pending',
          title: 'Check follow-up status',
          description: `Review follow-up response for ${payload.contactEmail}`,
          startTime: clip.startTime + clip.duration + 48, // 48 beats later (~2 days at 120 BPM)
          duration: 4,
          colour: '#9C27B0',
          payload: {
            analysisType: 'performance',
            includeRecommendations: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      return {
        success: true,
        clipId,
        agentType: 'tracker',
        behaviourType: 'followup',
        message: `Follow-up tracked for ${payload.contactEmail || 'contact'}`,
        output: {
          contactEmail: payload.contactEmail,
          trackedAt: new Date().toISOString(),
          reminderScheduled: true,
        },
        generatedClips,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      return {
        success: false,
        clipId,
        agentType: 'tracker',
        behaviourType: 'followup',
        message: `Failed to track follow-up: ${errorMessage}`,
        errors: [errorMessage],
      }
    }
  }

  /**
   * Execute custom tracking
   */
  private async executeCustom(context: AgentRuntimeContext): Promise<AgentBehaviourResult> {
    const clip = context.clip.clip
    const clipId = clip.id

    logger.info('tracker', clipId, 'Executing custom Tracker behaviour')

    // Log to database
    try {
      await context.supabase.from('agent_outputs').insert({
        agent_name: 'tracker',
        clip_id: clipId,
        campaign_id: context.campaign.id,
        user_id: context.user.id,
        event_type: 'custom_track',
        payload: clip.payload || {},
        created_at: new Date().toISOString(),
      })

      return {
        success: true,
        clipId,
        agentType: 'tracker',
        behaviourType: 'custom',
        message: 'Custom tracking recorded',
        output: clip.payload || {},
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      return {
        success: false,
        clipId,
        agentType: 'tracker',
        behaviourType: 'custom',
        message: `Failed to record tracking: ${errorMessage}`,
        errors: [errorMessage],
      }
    }
  }
}

/**
 * Create Tracker behaviour instance
 */
export function createTrackerBehaviour(): TrackerBehaviour {
  return new TrackerBehaviour()
}
