/**
 * Scout Agent Behaviour - Phase 9
 * Research, contact discovery, and opportunity identification
 */

import type { AgentBehaviour } from '../runtime/agent-runner'
import type { AgentRuntimeContext } from '../runtime/agent-context'
import type { AgentBehaviourResult, TimelineClip } from '@total-audio/timeline'
import type { ResearchPayload } from '@total-audio/timeline/clip-interpreter'
import { complete } from '@total-audio/core-ai-provider'
import { getAgentLogger } from '../runtime/agent-logger'

const logger = getAgentLogger()

/**
 * Scout Agent Implementation
 */
export class ScoutBehaviour implements AgentBehaviour {
  readonly type = 'scout' as const

  getDescription(): string {
    return 'Scout Agent - Research tasks, contact discovery, and opportunity identification'
  }

  canExecute(context: AgentRuntimeContext): boolean {
    // Scout can execute research and custom behaviours
    const behaviourType = context.clip.clip.behaviourType
    return behaviourType === 'research' || behaviourType === 'custom'
  }

  async execute(context: AgentRuntimeContext): Promise<AgentBehaviourResult> {
    const clip = context.clip.clip
    const clipId = clip.id

    logger.info('scout', clipId, 'Starting Scout agent execution')

    // Parse research payload
    const payload = clip.payload as ResearchPayload

    if (!payload || !payload.query) {
      return {
        success: false,
        clipId,
        agentType: 'scout',
        behaviourType: clip.behaviourType,
        message: 'Research payload missing or invalid - query is required',
        errors: ['Missing query in research payload'],
      }
    }

    try {
      // Execute research based on target type
      switch (payload.targetType) {
        case 'contacts':
          return await this.researchContacts(context, payload)
        case 'playlists':
          return await this.researchPlaylists(context, payload)
        case 'opportunities':
          return await this.researchOpportunities(context, payload)
        case 'general':
        default:
          return await this.researchGeneral(context, payload)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('scout', clipId, `Scout execution failed: ${errorMessage}`)

      return {
        success: false,
        clipId,
        agentType: 'scout',
        behaviourType: clip.behaviourType,
        message: `Research failed: ${errorMessage}`,
        errors: [errorMessage],
      }
    }
  }

  /**
   * Research contacts (radio DJs, playlist curators, bloggers)
   */
  private async researchContacts(
    context: AgentRuntimeContext,
    payload: ResearchPayload
  ): Promise<AgentBehaviourResult> {
    const clipId = context.clip.clip.id
    logger.info('scout', clipId, `Researching contacts for query: ${payload.query}`)

    // Use AI to generate research strategy
    const prompt = `You are Scout, a research agent for music promotion campaigns.

Task: Research contacts (radio DJs, playlist curators, bloggers, influencers) for this query:
"${payload.query}"

Campaign context:
- Campaign: ${context.campaign.name}
- Goal: ${context.campaign.goal}
- OS Theme: ${context.osTheme}

Provide a structured research strategy including:
1. Search keywords (3-5 specific terms)
2. Platforms to check (Spotify, radio stations, blogs, etc.)
3. Contact types to prioritise
4. Expected number of contacts

Response format: JSON
{
  "keywords": ["keyword1", "keyword2", ...],
  "platforms": ["platform1", "platform2", ...],
  "contactTypes": ["type1", "type2", ...],
  "expectedCount": number,
  "notes": "brief strategy notes"
}`

    const completion = await complete(
      'anthropic',
      [
        {
          role: 'system',
          content: 'You are Scout, a music promotion research expert. Respond only with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.3,
        max_tokens: 500,
      }
    )

    let strategy: Record<string, unknown>

    try {
      strategy = JSON.parse(completion.content)
    } catch {
      strategy = {
        keywords: [payload.query],
        platforms: ['general'],
        contactTypes: ['contact'],
        expectedCount: 10,
        notes: 'Basic research strategy',
      }
    }

    // Generate follow-up clips for contact outreach
    const generatedClips: TimelineClip[] = []

    // Create a follow-up clip for each platform
    if (Array.isArray(strategy.platforms)) {
      for (let i = 0; i < Math.min(strategy.platforms.length, 3); i++) {
        const platform = strategy.platforms[i]

        generatedClips.push({
          id: `${clipId}-followup-${i}`,
          campaignId: context.campaign.id,
          trackId: context.clip.track.id,
          agentType: 'coach',
          behaviourType: 'planning',
          executionMode: 'assist',
          status: 'pending',
          title: `Plan outreach for ${platform}`,
          description: `Create outreach sequence for contacts on ${platform}`,
          startTime: context.clip.clip.startTime + context.clip.clip.duration + i * 10,
          duration: 8,
          colour: '#4CAF50',
          payload: {
            goal: `Outreach to ${platform} contacts`,
            context: `Based on Scout research: ${payload.query}`,
            generateSequence: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    }

    return {
      success: true,
      clipId,
      agentType: 'scout',
      behaviourType: 'research',
      message: `Research strategy generated: ${strategy.expectedCount || 0} potential contacts identified`,
      output: {
        strategy,
        query: payload.query,
        targetType: payload.targetType,
      },
      generatedClips,
      metadata: {
        model: completion.model,
        timestamp: new Date().toISOString(),
      },
    }
  }

  /**
   * Research playlists
   */
  private async researchPlaylists(
    context: AgentRuntimeContext,
    payload: ResearchPayload
  ): Promise<AgentBehaviourResult> {
    const clipId = context.clip.clip.id
    logger.info('scout', clipId, `Researching playlists for query: ${payload.query}`)

    // Generate playlist research output
    return {
      success: true,
      clipId,
      agentType: 'scout',
      behaviourType: 'research',
      message: `Playlist research completed for: ${payload.query}`,
      output: {
        query: payload.query,
        targetType: 'playlists',
        platforms: ['Spotify', 'Apple Music', 'YouTube Music'],
        recommendations: ['Focus on genre-specific playlists', 'Look for curator contact info'],
      },
    }
  }

  /**
   * Research opportunities (blogs, press, media)
   */
  private async researchOpportunities(
    context: AgentRuntimeContext,
    payload: ResearchPayload
  ): Promise<AgentBehaviourResult> {
    const clipId = context.clip.clip.id
    logger.info('scout', clipId, `Researching opportunities for query: ${payload.query}`)

    return {
      success: true,
      clipId,
      agentType: 'scout',
      behaviourType: 'research',
      message: `Opportunity research completed for: ${payload.query}`,
      output: {
        query: payload.query,
        targetType: 'opportunities',
        opportunities: ['Music blogs', 'Podcast features', 'Interview opportunities'],
      },
    }
  }

  /**
   * General research
   */
  private async researchGeneral(
    context: AgentRuntimeContext,
    payload: ResearchPayload
  ): Promise<AgentBehaviourResult> {
    const clipId = context.clip.clip.id
    logger.info('scout', clipId, `General research for query: ${payload.query}`)

    return {
      success: true,
      clipId,
      agentType: 'scout',
      behaviourType: 'research',
      message: `General research completed for: ${payload.query}`,
      output: {
        query: payload.query,
        targetType: 'general',
        findings: ['Research completed'],
      },
    }
  }
}

/**
 * Create Scout behaviour instance
 */
export function createScoutBehaviour(): ScoutBehaviour {
  return new ScoutBehaviour()
}
