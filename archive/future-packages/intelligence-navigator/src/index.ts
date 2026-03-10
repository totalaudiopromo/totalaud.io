/**
 * Intelligence Navigator
 * Q&A layer for dashboard intelligence
 */

import type { FusionContext } from '@total-audio/fusion-layer'
import Anthropic from '@anthropic-ai/sdk'

export interface NavigatorQuestion {
  question: string
  context: FusionContext
  userId: string
}

export interface NavigatorAnswer {
  answer: string
  evidence: Evidence[]
  deepLinks: DeepLink[]
  recommendedActions: string[]
  confidence: number
}

export interface Evidence {
  source: string
  data: string
  relevance: number
}

export interface DeepLink {
  label: string
  href: string
  description: string
}

export async function generateNavigatorAnswer(input: NavigatorQuestion): Promise<NavigatorAnswer> {
  const { question, context } = input

  // Build comprehensive context for Claude
  const systemContext = `You are an AI music marketing intelligence assistant.

You have access to complete data from the Total Audio platform:
- ${context.intel.totalContacts} contacts
- ${context.tracker.totalCampaigns} campaigns (${context.tracker.activeCampaigns} active)
- ${context.email.totalCampaigns} email campaigns
- ${context.community.posts.length} community posts
- ${context.contactIntel.totalContacts} contacts with intelligence data
- ${context.pressKitIntel.reports.length} press kit reports
- ${context.writerRoom.results.length} writer's room generations

Current performance metrics:
- Email open rate: ${context.email.performanceMetrics.avgOpenRate.toFixed(1)}%
- Campaign success rate: ${context.tracker.performanceMetrics.successRate.toFixed(1)}%
- Contact responsiveness: ${(context.contactIntel.avgResponsivenessScore * 100).toFixed(0)}%

Answer the user's question with specific, actionable insights based on this data.`

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `${systemContext}\n\nQuestion: ${question}`,
        },
      ],
    })

    const answerText = response.content[0].type === 'text' ? response.content[0].text : ''

    // Extract evidence and deep links from context
    const evidence: Evidence[] = []
    const deepLinks: DeepLink[] = []

    // Add relevant evidence based on question keywords
    if (question.toLowerCase().includes('contact')) {
      evidence.push({
        source: 'Contact Intel',
        data: `${context.intel.totalContacts} total contacts with ${(context.contactIntel.avgResponsivenessScore * 100).toFixed(0)}% avg responsiveness`,
        relevance: 0.9,
      })
      deepLinks.push({
        label: 'View Contact Intelligence',
        href: '/dashboard/contact-intel',
        description: 'Detailed contact performance data',
      })
    }

    if (question.toLowerCase().includes('campaign')) {
      evidence.push({
        source: 'Campaign Tracker',
        data: `${context.tracker.activeCampaigns} active campaigns, ${context.tracker.performanceMetrics.successRate.toFixed(1)}% success rate`,
        relevance: 0.95,
      })
      deepLinks.push({
        label: 'View Campaigns',
        href: '/dashboard/tracker',
        description: 'Campaign performance details',
      })
    }

    if (question.toLowerCase().includes('email') || question.toLowerCase().includes('pitch')) {
      evidence.push({
        source: 'Email Performance',
        data: `${context.email.performanceMetrics.avgOpenRate.toFixed(1)}% open rate, ${context.email.performanceMetrics.avgReplyRate.toFixed(1)}% reply rate`,
        relevance: 0.9,
      })
      deepLinks.push({
        label: 'Email Campaigns',
        href: '/dashboard/email',
        description: 'Email campaign analytics',
      })
    }

    // Generate recommended actions
    const recommendedActions: string[] = []
    if (context.replyIntel.highValueLeads.length > 0) {
      recommendedActions.push(
        `Follow up on ${context.replyIntel.highValueLeads.length} high-value leads`
      )
    }
    if (context.tracker.activeCampaigns === 0) {
      recommendedActions.push('Start a new campaign')
    }
    if (context.pressKitIntel.avgQualityScore < 0.7) {
      recommendedActions.push('Improve press kit quality')
    }

    return {
      answer: answerText,
      evidence: evidence.slice(0, 5),
      deepLinks: deepLinks.slice(0, 3),
      recommendedActions: recommendedActions.slice(0, 3),
      confidence: 0.85,
    }
  } catch (error) {
    return {
      answer: `Unable to generate answer: ${error instanceof Error ? error.message : 'Unknown error'}`,
      evidence: [],
      deepLinks: [],
      recommendedActions: [],
      confidence: 0,
    }
  }
}
