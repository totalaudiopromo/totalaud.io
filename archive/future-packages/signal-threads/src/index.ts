/**
 * Signal Threads
 * Narrative timeline builder connecting all campaign events
 */

import type { FusionContext } from '@total-audio/fusion-layer'

export type ThreadType = 'narrative' | 'campaign' | 'creative' | 'scene' | 'performance'

export interface SignalThreadInput {
  artistSlug: string
  threadType: ThreadType
  context: FusionContext
}

export interface SignalThread {
  threadType: ThreadType
  thread: ThreadStructure
  events: ThreadEvent[]
  milestones: Milestone[]
  narrativeSummary: string
  insights: string[]
}

export interface ThreadStructure {
  id: string
  startDate: Date
  endDate: Date
  totalEvents: number
  significance: number
}

export interface ThreadEvent {
  id: string
  date: Date
  type: 'creative_release' | 'campaign_start' | 'coverage' | 'scene_event' | 'reply' | 'milestone'
  title: string
  description: string
  significance: number
  connections: string[]
  metadata: Record<string, any>
}

export interface Milestone {
  id: string
  date: Date
  title: string
  description: string
  significance: number
  impact: string
}

export async function buildSignalThread(input: SignalThreadInput): Promise<SignalThread> {
  const { threadType, context } = input

  // Collect events based on thread type
  const events = collectThreadEvents(threadType, context)

  // Identify milestones
  const milestones = identifyMilestones(events)

  // Build thread structure
  const thread = buildThreadStructure(events)

  // Generate narrative summary
  const narrativeSummary = generateNarrativeSummary(threadType, events, milestones)

  // Extract insights
  const insights = extractInsights(events, milestones)

  return {
    threadType,
    thread,
    events,
    milestones,
    narrativeSummary,
    insights,
  }
}

function collectThreadEvents(threadType: ThreadType, context: FusionContext): ThreadEvent[] {
  const events: ThreadEvent[] = []

  switch (threadType) {
    case 'narrative':
      events.push(...collectNarrativeEvents(context))
      break
    case 'campaign':
      events.push(...collectCampaignEvents(context))
      break
    case 'creative':
      events.push(...collectCreativeEvents(context))
      break
    case 'scene':
      events.push(...collectSceneEvents(context))
      break
    case 'performance':
      events.push(...collectPerformanceEvents(context))
      break
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime())
}

function collectNarrativeEvents(context: FusionContext): ThreadEvent[] {
  const events: ThreadEvent[] = []

  // Add campaign starts
  context.tracker.campaigns.forEach((campaign) => {
    events.push({
      id: `campaign-${campaign.id}`,
      date: new Date(campaign.created_at),
      type: 'campaign_start',
      title: `Campaign: ${campaign.name}`,
      description: campaign.description || 'Campaign launched',
      significance: campaign.status === 'active' ? 0.8 : 0.6,
      connections: [],
      metadata: campaign,
    })
  })

  // Add coverage events
  context.coverage.events.forEach((event) => {
    events.push({
      id: `coverage-${event.id}`,
      date: new Date(event.date),
      type: 'coverage',
      title: `Coverage: ${event.outlet || 'Media'}`,
      description: event.type || 'Media coverage received',
      significance: event.importance || 0.7,
      connections: [],
      metadata: event,
    })
  })

  // Add asset drops
  context.assets.drops.forEach((drop) => {
    events.push({
      id: `asset-${drop.id}`,
      date: new Date(drop.created_at),
      type: 'creative_release',
      title: `Release: ${drop.title}`,
      description: drop.description || 'New asset released',
      significance: 0.9,
      connections: [],
      metadata: drop,
    })
  })

  return events
}

function collectCampaignEvents(context: FusionContext): ThreadEvent[] {
  const events: ThreadEvent[] = []

  // Campaign activities
  context.tracker.campaigns.forEach((campaign) => {
    events.push({
      id: `campaign-${campaign.id}`,
      date: new Date(campaign.created_at),
      type: 'campaign_start',
      title: campaign.name,
      description: campaign.description || '',
      significance: 0.8,
      connections: [],
      metadata: campaign,
    })
  })

  // Recent activities
  context.tracker.recentActivity.forEach((activity) => {
    events.push({
      id: `activity-${activity.id}`,
      date: new Date(activity.timestamp),
      type: 'milestone',
      title: activity.activityType,
      description: activity.description || '',
      significance: 0.6,
      connections: activity.campaignId ? [`campaign-${activity.campaignId}`] : [],
      metadata: activity,
    })
  })

  return events
}

function collectCreativeEvents(context: FusionContext): ThreadEvent[] {
  const events: ThreadEvent[] = []

  // Asset drops
  context.assets.drops.forEach((drop) => {
    events.push({
      id: `asset-${drop.id}`,
      date: new Date(drop.created_at),
      type: 'creative_release',
      title: drop.title,
      description: drop.description || '',
      significance: 0.9,
      connections: [],
      metadata: drop,
    })
  })

  // Writers room results (creative iterations)
  context.writerRoom.results.forEach((result) => {
    events.push({
      id: `writer-${result.id}`,
      date: new Date(result.created_at),
      type: 'creative_release',
      title: 'Creative iteration',
      description: result.prompt || 'New creative work',
      significance: 0.5,
      connections: [],
      metadata: result,
    })
  })

  return events
}

function collectSceneEvents(context: FusionContext): ThreadEvent[] {
  const events: ThreadEvent[] = []

  // Community posts
  context.community.posts.forEach((post) => {
    events.push({
      id: `post-${post.id}`,
      date: new Date(post.created_at),
      type: 'scene_event',
      title: post.title || 'Community post',
      description: post.body.substring(0, 100),
      significance: 0.6,
      connections: [],
      metadata: post,
    })
  })

  return events
}

function collectPerformanceEvents(context: FusionContext): ThreadEvent[] {
  const events: ThreadEvent[] = []

  // Email campaigns with notable performance
  context.email.campaigns.forEach((campaign) => {
    if (campaign.open_rate && campaign.open_rate > 30) {
      events.push({
        id: `email-${campaign.id}`,
        date: new Date(campaign.sent_at || campaign.created_at),
        type: 'milestone',
        title: `High-performing email: ${campaign.name}`,
        description: `${campaign.open_rate.toFixed(1)}% open rate`,
        significance: 0.8,
        connections: [],
        metadata: campaign,
      })
    }
  })

  // Reply intel - high value leads
  context.replyIntel.highValueLeads.forEach((lead) => {
    events.push({
      id: `lead-${lead.contactId}`,
      date: new Date(lead.lastReplyDate),
      type: 'reply',
      title: `High-value reply`,
      description: `Score: ${(lead.score * 100).toFixed(0)}%`,
      significance: 0.9,
      connections: [],
      metadata: lead,
    })
  })

  return events
}

function identifyMilestones(events: ThreadEvent[]): Milestone[] {
  const milestones: Milestone[] = []

  // High-significance events become milestones
  events
    .filter((e) => e.significance >= 0.8)
    .forEach((event) => {
      milestones.push({
        id: event.id,
        date: event.date,
        title: event.title,
        description: event.description,
        significance: event.significance,
        impact: determineMilestoneImpact(event),
      })
    })

  return milestones
}

function determineMilestoneImpact(event: ThreadEvent): string {
  switch (event.type) {
    case 'coverage':
      return 'Media visibility boost - expanded reach and credibility'
    case 'creative_release':
      return 'New creative work - fresh campaign material'
    case 'campaign_start':
      return 'Campaign momentum - active outreach phase'
    case 'reply':
      return 'High-value engagement - potential partnership opportunity'
    default:
      return 'Progress marker - campaign advancement'
  }
}

function buildThreadStructure(events: ThreadEvent[]): ThreadStructure {
  if (events.length === 0) {
    return {
      id: `thread-${Date.now()}`,
      startDate: new Date(),
      endDate: new Date(),
      totalEvents: 0,
      significance: 0,
    }
  }

  const startDate = events[0].date
  const endDate = events[events.length - 1].date
  const totalEvents = events.length
  const avgSignificance = events.reduce((sum, e) => sum + e.significance, 0) / totalEvents

  return {
    id: `thread-${Date.now()}`,
    startDate,
    endDate,
    totalEvents,
    significance: avgSignificance,
  }
}

function generateNarrativeSummary(
  threadType: ThreadType,
  events: ThreadEvent[],
  milestones: Milestone[]
): string {
  if (events.length === 0) {
    return 'No events recorded yet for this thread.'
  }

  const timespan = Math.ceil(
    (events[events.length - 1].date.getTime() - events[0].date.getTime()) / (1000 * 60 * 60 * 24)
  )

  const coverageCount = events.filter((e) => e.type === 'coverage').length
  const campaignCount = events.filter((e) => e.type === 'campaign_start').length
  const creativeCount = events.filter((e) => e.type === 'creative_release').length

  let summary = `Over ${timespan} days, `

  switch (threadType) {
    case 'narrative':
      summary += `${events.length} key events shaped this artist's journey. `
      if (coverageCount > 0) summary += `${coverageCount} coverage placements `
      if (campaignCount > 0) summary += `across ${campaignCount} campaigns `
      if (creativeCount > 0) summary += `with ${creativeCount} new releases `
      summary += `built momentum and visibility.`
      break

    case 'campaign':
      summary += `${campaignCount} campaigns generated ${events.length} tracked activities. `
      if (milestones.length > 0) {
        summary += `Key milestones: ${milestones[0].title}.`
      }
      break

    case 'creative':
      summary += `${creativeCount} creative releases demonstrate ongoing artistic output. `
      summary += `Consistent creative momentum maintained.`
      break

    case 'scene':
      summary += `${events.length} community interactions show active scene engagement. `
      summary += `Building grassroots presence and network.`
      break

    case 'performance':
      summary += `Performance tracking shows ${events.length} notable engagement points. `
      if (milestones.length > 0) {
        summary += `Strongest result: ${milestones[0].title}.`
      }
      break
  }

  return summary
}

function extractInsights(events: ThreadEvent[], milestones: Milestone[]): string[] {
  const insights: string[] = []

  // Frequency insights
  if (events.length > 20) {
    insights.push('High activity level - consistent campaign execution')
  } else if (events.length < 5) {
    insights.push('Low activity - consider increasing campaign frequency')
  }

  // Milestone insights
  if (milestones.length > 5) {
    insights.push(`${milestones.length} major milestones achieved - strong trajectory`)
  } else if (milestones.length === 0) {
    insights.push('No major milestones yet - focus on breakthrough opportunities')
  }

  // Event type distribution
  const coverageEvents = events.filter((e) => e.type === 'coverage')
  if (coverageEvents.length > 10) {
    insights.push('Strong media coverage - effective press strategy')
  }

  const replyEvents = events.filter((e) => e.type === 'reply')
  if (replyEvents.length > 5) {
    insights.push('High engagement rate - contacts are responding positively')
  }

  return insights
}
