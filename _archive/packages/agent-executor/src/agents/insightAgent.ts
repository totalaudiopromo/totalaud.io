/**
 * Insight Agent
 *
 * Compiles campaign results from all agents and generates an executive summary
 * with KPIs, trends, highlights, risks, and actionable recommendations.
 *
 * Design Principle: "The mixdown is the moment the work feels real."
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { complete } from '@total-audio/core-ai-provider'
import { getBrokerPersonality } from '../personas/brokerPersonalityRegistry'

export type OSTheme = 'operator' | 'guide' | 'map' | 'timeline' | 'tape'

export interface Mixdown {
  sessionId: string
  userId: string
  theme: OSTheme
  generatedAt: string

  // Executive Summary
  summary: {
    totalContacts: number
    emailsSent: number
    repliesReceived: number
    followUpsSent: number
    openRate: number
    replyRate: number
    campaignDuration: string
    agentsUsed: string[]
  }

  // KPIs (Key Performance Indicators)
  kpis: Array<{
    key: string
    value: number | string
    label: string
    unit: string
    trend?: 'up' | 'down' | 'stable'
    changePercent?: number
  }>

  // Trends & Insights
  trends: Array<{
    category: string
    observation: string
    impact: 'positive' | 'negative' | 'neutral'
    confidence: 'high' | 'medium' | 'low'
  }>

  // Highlights (wins)
  highlights: string[]

  // Risks & Concerns
  risks: Array<{
    description: string
    severity: 'high' | 'medium' | 'low'
    mitigation: string
  }>

  // Actionable Recommendations
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    action: string
    expectedImpact: string
    timeEstimate: string
  }>

  // Broker Narrative (theme-aware story)
  narrative: string

  // Raw Agent Data
  agentBreakdown: {
    broker?: { metrics: any; logs: any[] }
    scout?: { metrics: any; logs: any[] }
    coach?: { metrics: any; logs: any[] }
    tracker?: { metrics: any; logs: any[] }
  }
}

export interface InsightAgentConfig {
  supabaseClient: SupabaseClient
  sessionId: string
  userId: string
  theme: OSTheme
  aiProvider: 'anthropic' | 'openai'
}

export interface InsightAgentResult {
  success: boolean
  mixdown?: Mixdown
  message: string
  errors?: string[]
}

export class InsightAgent {
  private supabase: SupabaseClient
  private sessionId: string
  private userId: string
  private theme: OSTheme
  private aiProvider: 'anthropic' | 'openai'

  constructor(config: InsightAgentConfig) {
    this.supabase = config.supabaseClient
    this.sessionId = config.sessionId
    this.userId = config.userId
    this.theme = config.theme
    this.aiProvider = config.aiProvider
  }

  /**
   * Execute insight analysis and generate mixdown report
   */
  async execute(): Promise<InsightAgentResult> {
    try {
      console.log('[InsightAgent] Starting campaign analysis...')

      // 1. Gather all campaign data
      const campaignResults = await this.getCampaignResults()
      const activityLogs = await this.getActivityLogs()
      const coachDrafts = await this.getCoachDrafts()
      const sessionInfo = await this.getSessionInfo()

      // 2. Compile executive summary
      const summary = this.compileSummary(campaignResults, activityLogs, coachDrafts)

      // 3. Extract KPIs
      const kpis = this.extractKPIs(campaignResults, summary)

      // 4. Analyze trends using AI
      const trends = await this.analyzeTrends(campaignResults, activityLogs)

      // 5. Identify highlights
      const highlights = this.identifyHighlights(campaignResults, kpis)

      // 6. Detect risks
      const risks = this.detectRisks(campaignResults, summary)

      // 7. Generate recommendations
      const recommendations = await this.generateRecommendations(
        summary,
        trends,
        risks,
        campaignResults
      )

      // 8. Generate Broker narrative (theme-aware)
      const narrative = await this.generateNarrative(summary, highlights, trends)

      // 9. Compile agent breakdown
      const agentBreakdown = this.compileAgentBreakdown(campaignResults, activityLogs)

      // 10. Assemble final mixdown
      const mixdown: Mixdown = {
        sessionId: this.sessionId,
        userId: this.userId,
        theme: this.theme,
        generatedAt: new Date().toISOString(),
        summary,
        kpis,
        trends,
        highlights,
        risks,
        recommendations,
        narrative,
        agentBreakdown,
      }

      console.log('[InsightAgent] Mixdown generated successfully')

      return {
        success: true,
        mixdown,
        message: `Campaign mixdown generated: ${summary.totalContacts} contacts, ${summary.emailsSent} emails sent, ${summary.repliesReceived} replies`,
      }
    } catch (error) {
      console.error('[InsightAgent] Error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate mixdown',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }

  /**
   * Get all campaign results from database
   */
  private async getCampaignResults(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('campaign_results')
      .select('*')
      .eq('session_id', this.sessionId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch campaign results: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get agent activity logs
   */
  private async getActivityLogs(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('agent_activity_log')
      .select('*')
      .eq('session_id', this.sessionId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch activity logs: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get coach drafts
   */
  private async getCoachDrafts(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('coach_drafts')
      .select('*')
      .eq('session_id', this.sessionId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[InsightAgent] Coach drafts not available:', error.message)
      return []
    }

    return data || []
  }

  /**
   * Get session information
   */
  private async getSessionInfo(): Promise<any> {
    const { data, error } = await this.supabase
      .from('agent_sessions')
      .select('*')
      .eq('id', this.sessionId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch session info: ${error.message}`)
    }

    return data
  }

  /**
   * Compile executive summary from raw data
   */
  private compileSummary(
    campaignResults: any[],
    activityLogs: any[],
    coachDrafts: any[]
  ): Mixdown['summary'] {
    const agentsUsed = [...new Set(activityLogs.map((log) => log.agent_name).filter(Boolean))]

    // Extract metrics
    const metricsMap = new Map<string, number>()
    campaignResults.forEach((result) => {
      const key = result.metric_key
      const value = parseFloat(result.metric_value) || 0
      metricsMap.set(key, (metricsMap.get(key) || 0) + value)
    })

    const totalContacts = metricsMap.get('total_contacts') || metricsMap.get('contacts_found') || 0
    const emailsSent = metricsMap.get('emails_sent') || 0
    const repliesReceived = metricsMap.get('replies_received') || 0
    const followUpsSent = coachDrafts.filter((d) => d.status === 'sent').length

    const openRate =
      emailsSent > 0 ? ((metricsMap.get('emails_opened') || 0) / emailsSent) * 100 : 0
    const replyRate = emailsSent > 0 ? (repliesReceived / emailsSent) * 100 : 0

    // Calculate campaign duration
    const timestamps = activityLogs.map((log) => new Date(log.created_at).getTime())
    const startTime = Math.min(...timestamps)
    const endTime = Math.max(...timestamps)
    const durationMs = endTime - startTime
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
    const durationDays = Math.floor(durationHours / 24)
    const campaignDuration =
      durationDays > 0 ? `${durationDays}d ${durationHours % 24}h` : `${durationHours}h`

    return {
      totalContacts,
      emailsSent,
      repliesReceived,
      followUpsSent,
      openRate: Math.round(openRate * 10) / 10,
      replyRate: Math.round(replyRate * 10) / 10,
      campaignDuration,
      agentsUsed,
    }
  }

  /**
   * Extract KPIs from campaign results
   */
  private extractKPIs(campaignResults: any[], summary: Mixdown['summary']): Mixdown['kpis'] {
    const kpis: Mixdown['kpis'] = [
      {
        key: 'total_contacts',
        value: summary.totalContacts,
        label: 'Total Contacts',
        unit: 'contacts',
      },
      {
        key: 'emails_sent',
        value: summary.emailsSent,
        label: 'Emails Sent',
        unit: 'emails',
      },
      {
        key: 'reply_rate',
        value: summary.replyRate,
        label: 'Reply Rate',
        unit: '%',
        trend: summary.replyRate > 10 ? 'up' : summary.replyRate > 5 ? 'stable' : 'down',
      },
      {
        key: 'open_rate',
        value: summary.openRate,
        label: 'Open Rate',
        unit: '%',
        trend: summary.openRate > 50 ? 'up' : summary.openRate > 30 ? 'stable' : 'down',
      },
      {
        key: 'follow_ups_sent',
        value: summary.followUpsSent,
        label: 'Follow-Ups Sent',
        unit: 'emails',
      },
    ]

    // Add custom metrics from campaign_results
    const customMetrics = campaignResults
      .filter((r) => !['total_contacts', 'emails_sent', 'emails_opened'].includes(r.metric_key))
      .slice(0, 5) // Top 5 custom metrics

    customMetrics.forEach((metric) => {
      kpis.push({
        key: metric.metric_key,
        value: metric.metric_value,
        label: metric.metric_label || metric.metric_key,
        unit: metric.metric_unit || '',
      })
    })

    return kpis
  }

  /**
   * Analyze trends using AI
   */
  private async analyzeTrends(
    campaignResults: any[],
    activityLogs: any[]
  ): Promise<Mixdown['trends']> {
    const personality = getBrokerPersonality(this.theme)

    const prompt = `Analyze this music promotion campaign data and identify 3-5 key trends or insights.

Campaign Metrics:
${JSON.stringify(campaignResults.slice(0, 20), null, 2)}

Agent Activity:
${JSON.stringify(activityLogs.slice(0, 10), null, 2)}

For each trend, provide:
1. Category (e.g., "Engagement", "Timing", "Audience")
2. Observation (1-2 sentences)
3. Impact (positive/negative/neutral)
4. Confidence level (high/medium/low)

Respond with a JSON array of trends. Be specific and actionable.`

    try {
      const completion = await complete(
        this.aiProvider,
        [
          {
            role: 'system',
            content:
              'You are an expert data analyst specializing in music promotion campaigns. Provide insights in JSON format.',
          },
          { role: 'user', content: prompt },
        ],
        { temperature: 0.3, max_tokens: 800 }
      )

      const trends = JSON.parse(completion.content.trim())
      return Array.isArray(trends) ? trends : []
    } catch (error) {
      console.warn('[InsightAgent] Failed to analyze trends:', error)
      return [
        {
          category: 'General',
          observation: 'Campaign data collected successfully',
          impact: 'neutral',
          confidence: 'high',
        },
      ]
    }
  }

  /**
   * Identify campaign highlights
   */
  private identifyHighlights(campaignResults: any[], kpis: Mixdown['kpis']): string[] {
    const highlights: string[] = []

    // Reply rate achievement
    const replyRateKPI = kpis.find((k) => k.key === 'reply_rate')
    if (replyRateKPI && typeof replyRateKPI.value === 'number' && replyRateKPI.value > 10) {
      highlights.push(`Achieved ${replyRateKPI.value}% reply rate (above industry average)`)
    }

    // Open rate achievement
    const openRateKPI = kpis.find((k) => k.key === 'open_rate')
    if (openRateKPI && typeof openRateKPI.value === 'number' && openRateKPI.value > 50) {
      highlights.push(`Strong ${openRateKPI.value}% open rate demonstrates compelling outreach`)
    }

    // Total contacts reached
    const contactsKPI = kpis.find((k) => k.key === 'total_contacts')
    if (contactsKPI && typeof contactsKPI.value === 'number' && contactsKPI.value > 20) {
      highlights.push(`Reached ${contactsKPI.value} industry contacts`)
    }

    // Follow-ups sent
    const followUpsKPI = kpis.find((k) => k.key === 'follow_ups_sent')
    if (followUpsKPI && typeof followUpsKPI.value === 'number' && followUpsKPI.value > 0) {
      highlights.push(`Sent ${followUpsKPI.value} personalized follow-up emails`)
    }

    // Integration success
    const integrationMetrics = campaignResults.filter((r) =>
      r.metric_key.includes('integration')
    ).length
    if (integrationMetrics > 0) {
      highlights.push('Successfully integrated external tools (Gmail, Sheets, etc.)')
    }

    return highlights.length > 0
      ? highlights
      : ['Campaign executed successfully with multi-agent orchestration']
  }

  /**
   * Detect potential risks
   */
  private detectRisks(campaignResults: any[], summary: Mixdown['summary']): Mixdown['risks'] {
    const risks: Mixdown['risks'] = []

    // Low reply rate
    if (summary.replyRate < 5 && summary.emailsSent > 10) {
      risks.push({
        description: `Low reply rate (${summary.replyRate}%) may indicate targeting or messaging issues`,
        severity: 'medium',
        mitigation: 'Review contact targeting criteria and email copy for relevance',
      })
    }

    // Low open rate
    if (summary.openRate < 30 && summary.emailsSent > 10) {
      risks.push({
        description: `Low open rate (${summary.openRate}%) suggests subject lines need improvement`,
        severity: 'medium',
        mitigation: 'A/B test subject lines and optimize send timing',
      })
    }

    // No follow-ups sent
    if (summary.emailsSent > 5 && summary.followUpsSent === 0) {
      risks.push({
        description: 'No follow-up emails sent - missing opportunities for re-engagement',
        severity: 'low',
        mitigation: 'Use Coach agent to generate and send follow-ups to non-responders',
      })
    }

    // Small sample size
    if (summary.emailsSent < 10) {
      risks.push({
        description: 'Small sample size limits statistical significance of results',
        severity: 'low',
        mitigation: 'Expand contact list using Scout agent for more comprehensive outreach',
      })
    }

    return risks
  }

  /**
   * Generate actionable recommendations using AI
   */
  private async generateRecommendations(
    summary: Mixdown['summary'],
    trends: Mixdown['trends'],
    risks: Mixdown['risks'],
    campaignResults: any[]
  ): Promise<Mixdown['recommendations']> {
    const prompt = `Based on this music promotion campaign performance, provide 3-5 actionable recommendations.

Summary:
- Total Contacts: ${summary.totalContacts}
- Emails Sent: ${summary.emailsSent}
- Reply Rate: ${summary.replyRate}%
- Open Rate: ${summary.openRate}%

Trends:
${trends.map((t) => `- ${t.category}: ${t.observation}`).join('\n')}

Risks:
${risks.map((r) => `- ${r.description} (${r.severity})`).join('\n')}

For each recommendation, provide:
1. Priority (high/medium/low)
2. Action (specific, actionable step)
3. Expected Impact (1 sentence)
4. Time Estimate (e.g., "2 hours", "1 day")

Respond with a JSON array. Focus on realistic, high-impact actions.`

    try {
      const completion = await complete(
        this.aiProvider,
        [
          {
            role: 'system',
            content:
              'You are a music industry marketing consultant. Provide actionable recommendations in JSON format.',
          },
          { role: 'user', content: prompt },
        ],
        { temperature: 0.4, max_tokens: 800 }
      )

      const recommendations = JSON.parse(completion.content.trim())
      return Array.isArray(recommendations) ? recommendations : []
    } catch (error) {
      console.warn('[InsightAgent] Failed to generate recommendations:', error)
      return [
        {
          priority: 'medium',
          action: 'Review campaign metrics and adjust strategy for next campaign',
          expectedImpact: 'Improved targeting and messaging based on data-driven insights',
          timeEstimate: '1 hour',
        },
      ]
    }
  }

  /**
   * Generate Broker narrative (theme-aware storytelling)
   */
  private async generateNarrative(
    summary: Mixdown['summary'],
    highlights: string[],
    trends: Mixdown['trends']
  ): Promise<string> {
    const personality = getBrokerPersonality(this.theme)

    const prompt = `Write a brief campaign wrap-up narrative (150-200 words) in the voice of Broker, the campaign orchestrator.

Tone: ${personality.tone}
Slang: ${personality.slang.join(', ')}

Campaign Summary:
- Contacts: ${summary.totalContacts}
- Emails Sent: ${summary.emailsSent}
- Reply Rate: ${summary.replyRate}%
- Agents Used: ${summary.agentsUsed.join(', ')}

Highlights:
${highlights.join('\n')}

Key Trends:
${trends.map((t) => t.observation).join('\n')}

Make it feel like a short story-style wrap-up. Use the theme's personality. Be concise but engaging.`

    try {
      const completion = await complete(
        this.aiProvider,
        [
          {
            role: 'system',
            content: `You are Broker, an AI campaign orchestrator. Speak in ${personality.tone} tone with slang like ${personality.slang.join(', ')}.`,
          },
          { role: 'user', content: prompt },
        ],
        { temperature: 0.8, max_tokens: 400 }
      )

      return completion.content.trim()
    } catch (error) {
      console.warn('[InsightAgent] Failed to generate narrative:', error)
      return `Campaign complete. Reached ${summary.totalContacts} contacts with ${summary.emailsSent} emails sent. Reply rate: ${summary.replyRate}%. The team coordinated across ${summary.agentsUsed.join(', ')} to deliver results.`
    }
  }

  /**
   * Compile agent-specific breakdown
   */
  private compileAgentBreakdown(
    campaignResults: any[],
    activityLogs: any[]
  ): Mixdown['agentBreakdown'] {
    const breakdown: Mixdown['agentBreakdown'] = {}

    const agents = ['broker', 'scout', 'coach', 'tracker']

    agents.forEach((agentName) => {
      const agentMetrics = campaignResults.filter((r) => r.agent_name === agentName)
      const agentLogs = activityLogs.filter((log) => log.agent_name === agentName)

      if (agentMetrics.length > 0 || agentLogs.length > 0) {
        breakdown[agentName as keyof Mixdown['agentBreakdown']] = {
          metrics: agentMetrics,
          logs: agentLogs.slice(0, 10), // Latest 10 logs
        }
      }
    })

    return breakdown
  }
}

/**
 * Factory function to create InsightAgent
 */
export function createInsightAgent(config: InsightAgentConfig): InsightAgent {
  return new InsightAgent(config)
}
