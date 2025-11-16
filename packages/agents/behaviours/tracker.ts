/**
 * Tracker Agent Behaviour
 * Follow-up scheduling, status updates, and completion tracking
 */

import type { TimelineClip } from '@totalaud/os-state/campaign'
import type {
  AgentBehaviour,
  AgentBehaviourOutput,
} from '../runtime/agent-runner'
import type { AgentContext } from '../runtime/agent-context'
import { DEFAULT_AGENT_CAPABILITIES } from '../runtime/agent-context'
import type { ClipBehaviour } from '@totalaud/timeline/clip-interpreter'

export const trackerBehaviour: AgentBehaviour = {
  name: 'tracker',
  description: 'Tracking agent - manages follow-ups and monitors completion',
  supportedClipTypes: ['followup', 'custom'],
  capabilities: {
    ...DEFAULT_AGENT_CAPABILITIES,
  },

  canExecute(clip: TimelineClip, context: AgentContext): boolean {
    const metadata = clip.metadata as ClipBehaviour | undefined
    return (
      clip.agentSource === 'tracker' &&
      (metadata?.behaviourType === 'followup' || metadata?.behaviourType === 'custom')
    )
  },

  async execute(clip: TimelineClip, context: AgentContext): Promise<AgentBehaviourOutput> {
    const metadata = clip.metadata as ClipBehaviour | undefined
    const payload = metadata?.payload || {}

    try {
      // Check follow-up type
      const followupType = payload.followupType || 'gentle'
      const delayDays = payload.delayDays || 7

      // Track completion status
      const statusUpdate = await trackCompletion(clip, context)

      // Determine if follow-up is needed
      const needsFollowup = statusUpdate.completionRate < 0.8

      // Create follow-up clips if needed
      const clipsToCreate = needsFollowup
        ? [
            {
              name: `Follow-up: ${clip.name}`,
              trackId: clip.trackId,
              startTime: clip.startTime + clip.duration + delayDays * 86400, // Convert days to seconds (simplified)
              duration: 5,
              colour: '#3AA9BE',
              agentSource: 'tracker' as const,
              cardLinks: [],
              metadata: {
                behaviourType: 'followup',
                payload: {
                  originalClip: clip.id,
                  attemptNumber: (payload.attemptNumber || 0) + 1,
                  followupType: 'reminder',
                },
              },
            },
          ]
        : []

      // Generate sentiment card based on completion
      const cardsToCreate = []
      if (statusUpdate.completionRate >= 0.9) {
        cardsToCreate.push({
          type: 'pride',
          content: `Tracker: Excellent progress on "${clip.name}" - ${Math.round(statusUpdate.completionRate * 100)}% complete!`,
          linkedClipId: clip.id,
        })
      } else if (statusUpdate.completionRate < 0.3) {
        cardsToCreate.push({
          type: 'frustration',
          content: `Tracker: "${clip.name}" is behind schedule. Only ${Math.round(statusUpdate.completionRate * 100)}% complete.`,
          linkedClipId: clip.id,
        })
      }

      return {
        success: true,
        message: `Status tracked: ${Math.round(statusUpdate.completionRate * 100)}% complete`,
        data: statusUpdate,
        clipsToCreate,
        cardsToCreate,
      }
    } catch (error) {
      return {
        success: false,
        message: `Tracking failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  },
}

/**
 * Track completion status
 */
async function trackCompletion(
  clip: TimelineClip,
  context: AgentContext
): Promise<CompletionStatus> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Simulate tracking logic
  // In real implementation, would check:
  // - Email open rates
  // - Response rates
  // - Task completion in external systems
  // - Time elapsed vs. expected

  const completionRate = 0.4 + Math.random() * 0.6 // 40-100%

  return {
    clipId: clip.id,
    clipName: clip.name,
    completionRate,
    totalActions: 100,
    completedActions: Math.floor(100 * completionRate),
    pendingActions: Math.floor(100 * (1 - completionRate)),
    lastUpdated: new Date(),
    nextFollowupRecommended: completionRate < 0.8,
    metrics: {
      emailsSent: 100,
      emailsOpened: Math.floor(100 * 0.6),
      emailsReplied: Math.floor(100 * completionRate),
      averageResponseTime: '2.5 days',
    },
  }
}

interface CompletionStatus {
  clipId: string
  clipName: string
  completionRate: number
  totalActions: number
  completedActions: number
  pendingActions: number
  lastUpdated: Date
  nextFollowupRecommended: boolean
  metrics: {
    emailsSent: number
    emailsOpened: number
    emailsReplied: number
    averageResponseTime: string
  }
}
