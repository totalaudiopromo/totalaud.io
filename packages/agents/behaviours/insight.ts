/**
 * Insight Agent Behaviour - Phase 9
 * Analysis, bottleneck detection, and emotional story card generation
 */

import type { AgentBehaviour } from '../runtime/agent-runner'
import type { AgentRuntimeContext } from '../runtime/agent-context'
import type { AgentBehaviourResult } from '@total-audio/timeline'
import type { AnalysisPayload, StoryPayload } from '@total-audio/timeline/clip-interpreter'
import { complete } from '@total-audio/core-ai-provider'
import { getAgentLogger } from '../runtime/agent-logger'

const logger = getAgentLogger()

/**
 * Insight Agent Implementation
 */
export class InsightBehaviour implements AgentBehaviour {
  readonly type = 'insight' as const

  getDescription(): string {
    return 'Insight Agent - Campaign analysis, bottleneck detection, and emotional story cards'
  }

  canExecute(context: AgentRuntimeContext): boolean {
    const behaviourType = context.clip.clip.behaviourType
    return behaviourType === 'analysis' || behaviourType === 'story' || behaviourType === 'custom'
  }

  async execute(context: AgentRuntimeContext): Promise<AgentBehaviourResult> {
    const clip = context.clip.clip
    const clipId = clip.id

    logger.info('insight', clipId, 'Starting Insight agent execution')

    try {
      if (clip.behaviourType === 'analysis') {
        return await this.executeAnalysis(context)
      } else if (clip.behaviourType === 'story') {
        return await this.executeStory(context)
      } else {
        return await this.executeCustom(context)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('insight', clipId, `Insight execution failed: ${errorMessage}`)

      return {
        success: false,
        clipId,
        agentType: 'insight',
        behaviourType: clip.behaviourType,
        message: `Insight execution failed: ${errorMessage}`,
        errors: [errorMessage],
      }
    }
  }

  /**
   * Execute campaign analysis
   */
  private async executeAnalysis(context: AgentRuntimeContext): Promise<AgentBehaviourResult> {
    const clip = context.clip.clip
    const clipId = clip.id
    const payload = clip.payload as AnalysisPayload

    if (!payload || !payload.analysisType) {
      return {
        success: false,
        clipId,
        agentType: 'insight',
        behaviourType: 'analysis',
        message: 'Analysis payload missing or invalid - analysisType is required',
        errors: ['Missing analysisType in analysis payload'],
      }
    }

    logger.info('insight', clipId, `Running ${payload.analysisType} analysis`)

    // Fetch campaign data for analysis
    const campaignData = await this.fetchCampaignData(context)

    // Use AI to analyse campaign state
    const prompt = `You are Insight, an analytical agent for music promotion campaigns.

Task: Analyse the campaign and ${payload.analysisType === 'bottleneck' ? 'identify bottlenecks' : payload.analysisType === 'performance' ? 'evaluate performance' : payload.analysisType === 'sentiment' ? 'assess sentiment' : 'analyse workflow'}.

Campaign: ${context.campaign.name}
Goal: ${context.campaign.goal}
Status: ${context.campaign.status}
OS Theme: ${context.osTheme}

Timeline clips: ${context.timeline.clips.length} total
Active clips: ${context.timeline.clips.filter((c) => c.status === 'active').length}
Completed clips: ${context.timeline.clips.filter((c) => c.status === 'completed').length}

${payload.includeRecommendations ? 'Include 3 actionable recommendations.' : ''}

Response format: JSON
{
  "analysisType": "${payload.analysisType}",
  "findings": ["finding1", "finding2", ...],
  "severity": "low|medium|high",
  ${payload.includeRecommendations ? '"recommendations": ["rec1", "rec2", "rec3"],' : ''}
  "summary": "brief summary"
}`

    const completion = await complete(
      'anthropic',
      [
        {
          role: 'system',
          content: 'You are Insight, an expert campaign analyst. Respond only with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.4,
        max_tokens: 600,
      }
    )

    let analysis: Record<string, unknown>

    try {
      analysis = JSON.parse(completion.content)
    } catch {
      analysis = {
        analysisType: payload.analysisType,
        findings: ['Analysis completed'],
        severity: 'low',
        summary: 'Campaign analysis complete',
      }
    }

    return {
      success: true,
      clipId,
      agentType: 'insight',
      behaviourType: 'analysis',
      message: `${payload.analysisType} analysis completed: ${analysis.summary}`,
      output: {
        ...analysis,
        analysisType: payload.analysisType,
        campaignData,
      },
      metadata: {
        model: completion.model,
        timestamp: new Date().toISOString(),
      },
    }
  }

  /**
   * Execute story card creation
   */
  private async executeStory(context: AgentRuntimeContext): Promise<AgentBehaviourResult> {
    const clip = context.clip.clip
    const clipId = clip.id
    const payload = clip.payload as StoryPayload

    if (!payload || !payload.sentiment) {
      return {
        success: false,
        clipId,
        agentType: 'insight',
        behaviourType: 'story',
        message: 'Story payload missing or invalid - sentiment is required',
        errors: ['Missing sentiment in story payload'],
      }
    }

    logger.info('insight', clipId, `Creating ${payload.sentiment} story card`)

    // Create story card in database (Analogue OS feature)
    try {
      const { data: card, error } = await context.supabase
        .from('analogue_cards')
        .insert({
          campaign_id: context.campaign.id,
          user_id: context.user.id,
          sentiment: payload.sentiment,
          content: payload.freeformText || `${payload.sentiment} moment in campaign`,
          linked_clip_ids: payload.linkedClipIds || [clipId],
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        success: true,
        clipId,
        agentType: 'insight',
        behaviourType: 'story',
        message: `Story card created: ${payload.sentiment}`,
        output: {
          cardId: card.id,
          sentiment: payload.sentiment,
          linkedClipIds: payload.linkedClipIds,
        },
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      return {
        success: false,
        clipId,
        agentType: 'insight',
        behaviourType: 'story',
        message: `Failed to create story card: ${errorMessage}`,
        errors: [errorMessage],
      }
    }
  }

  /**
   * Execute custom insight behaviour
   */
  private async executeCustom(context: AgentRuntimeContext): Promise<AgentBehaviourResult> {
    const clip = context.clip.clip
    const clipId = clip.id

    logger.info('insight', clipId, 'Executing custom Insight behaviour')

    return {
      success: true,
      clipId,
      agentType: 'insight',
      behaviourType: 'custom',
      message: 'Custom Insight behaviour executed',
      output: clip.payload || {},
    }
  }

  /**
   * Fetch campaign data for analysis
   */
  private async fetchCampaignData(context: AgentRuntimeContext): Promise<Record<string, unknown>> {
    try {
      // Fetch agent outputs for this campaign
      const { data: outputs } = await context.supabase
        .from('agent_outputs')
        .select('*')
        .eq('campaign_id', context.campaign.id)
        .order('created_at', { ascending: false })
        .limit(20)

      return {
        totalOutputs: outputs?.length || 0,
        recentOutputs: outputs || [],
      }
    } catch {
      return {
        totalOutputs: 0,
        recentOutputs: [],
      }
    }
  }
}

/**
 * Create Insight behaviour instance
 */
export function createInsightBehaviour(): InsightBehaviour {
  return new InsightBehaviour()
}
