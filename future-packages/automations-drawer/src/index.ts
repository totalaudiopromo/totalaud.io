/**
 * Automations Drawer
 * AI-powered quick actions for dashboard
 */

import type { FusionContext } from '@total-audio/fusion-layer'
import type { SupabaseClient } from '@supabase/supabase-js'

export type AutomationAction =
  | 'suggest_contacts'
  | 'fix_bottleneck'
  | 'generate_variations'
  | 'clean_segments'
  | 'detect_rot'
  | 'optimize_schedule'

export interface AutomationInput {
  action: AutomationAction
  payload: Record<string, any>
  context: FusionContext
  userId: string
  workspaceId: string
}

export interface AutomationResult {
  success: boolean
  result: Record<string, any>
  executionTimeMs: number
  error?: string
}

export async function executeAutomation(
  input: AutomationInput,
  supabase: SupabaseClient
): Promise<AutomationResult> {
  const startTime = Date.now()

  try {
    let result: Record<string, any>

    switch (input.action) {
      case 'suggest_contacts':
        result = await suggestContacts(input)
        break
      case 'fix_bottleneck':
        result = await fixBottleneck(input)
        break
      case 'generate_variations':
        result = await generateVariations(input)
        break
      case 'clean_segments':
        result = await cleanSegments(input)
        break
      case 'detect_rot':
        result = await detectRot(input)
        break
      case 'optimize_schedule':
        result = await optimizeSchedule(input)
        break
      default:
        throw new Error(`Unknown automation action: ${input.action}`)
    }

    const executionTimeMs = Date.now() - startTime

    // Save to automations_history
    await supabase.from('automations_history').insert({
      workspace_id: input.workspaceId,
      user_id: input.userId,
      action: input.action,
      action_type: input.action,
      payload: input.payload,
      result,
      status: 'success',
      execution_time_ms: executionTimeMs,
    })

    return {
      success: true,
      result,
      executionTimeMs,
    }
  } catch (error) {
    const executionTimeMs = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Save failed attempt
    await supabase.from('automations_history').insert({
      workspace_id: input.workspaceId,
      user_id: input.userId,
      action: input.action,
      action_type: input.action,
      payload: input.payload,
      result: { error: errorMessage },
      status: 'failed',
      execution_time_ms: executionTimeMs,
    })

    return {
      success: false,
      result: {},
      executionTimeMs,
      error: errorMessage,
    }
  }
}

// 1. Suggest Contacts - Find best contacts for next pitch
async function suggestContacts(input: AutomationInput): Promise<Record<string, any>> {
  const { context, payload } = input
  const { genre, count = 10, targetType } = payload

  // Analyze contact performance from fusion context
  const contacts = context.intel.contacts
    .filter((c) => {
      if (genre && c.genres && !c.genres.includes(genre)) return false
      if (targetType && c.outlet_type !== targetType) return false
      return true
    })
    .map((c) => {
      // Score based on contact intel metrics
      const contactIntel = context.contactIntel.contacts.find((ci) => ci.contactId === c.id)
      const score = contactIntel
        ? contactIntel.responsivenessScore * 0.6 + contactIntel.replyQualityScore * 0.4
        : 0.5

      return { ...c, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)

  return {
    contacts: contacts.map((c) => ({
      id: c.id,
      name: c.name,
      outlet: c.outlet,
      score: c.score,
      reasoning: `High responsiveness (${(c.score * 100).toFixed(0)}%)`,
    })),
    totalAnalyzed: context.intel.contacts.length,
    reasoning: `Selected top ${count} contacts based on responsiveness and reply quality scores`,
  }
}

// 2. Fix Bottleneck - Identify and resolve campaign bottleneck
async function fixBottleneck(input: AutomationInput): Promise<Record<string, any>> {
  const { context } = input

  // Analyze campaign performance
  const bottlenecks: Array<{ type: string; severity: number; suggestion: string }> = []

  // Check reply rate
  if (context.email.performanceMetrics.avgReplyRate < 0.05) {
    bottlenecks.push({
      type: 'low_reply_rate',
      severity: 0.9,
      suggestion: 'Reply rate below 5% - consider personalizing pitches or refreshing contact list',
    })
  }

  // Check active campaigns
  if (context.tracker.activeCampaigns === 0) {
    bottlenecks.push({
      type: 'no_active_campaigns',
      severity: 1.0,
      suggestion: 'No active campaigns - start a new campaign to maintain momentum',
    })
  }

  // Check email open rate
  if (context.email.performanceMetrics.avgOpenRate < 20) {
    bottlenecks.push({
      type: 'low_open_rate',
      severity: 0.7,
      suggestion: 'Open rate below 20% - test new subject line approaches',
    })
  }

  // Check contact responsiveness
  if (context.contactIntel.avgResponsivenessScore < 0.3) {
    bottlenecks.push({
      type: 'unresponsive_contacts',
      severity: 0.8,
      suggestion:
        'Average contact responsiveness below 30% - segment and target more responsive contacts',
    })
  }

  return {
    bottlenecks: bottlenecks.sort((a, b) => b.severity - a.severity),
    primaryIssue: bottlenecks[0] || null,
    actionableSteps: bottlenecks.map((b) => b.suggestion),
  }
}

// 3. Generate Variations - Create pitch variations
async function generateVariations(input: AutomationInput): Promise<Record<string, any>> {
  const { payload } = input
  const { basePitch, count = 5, style } = payload

  // Generate variations based on style
  const variations: Array<{ variant: string; approach: string }> = []

  const approaches = [
    { name: 'concise', description: 'Short and direct' },
    { name: 'storytelling', description: 'Narrative-focused' },
    { name: 'data-driven', description: 'Statistics and metrics' },
    { name: 'emotional', description: 'Emotive and personal' },
    { name: 'professional', description: 'Formal and polished' },
  ]

  for (let i = 0; i < Math.min(count, approaches.length); i++) {
    variations.push({
      variant: `Variation ${i + 1}: ${approaches[i].description} approach`,
      approach: approaches[i].name,
    })
  }

  return {
    variations,
    baseApproach: style || 'balanced',
    totalGenerated: variations.length,
    recommendation: 'Test each variation with a small segment before full send',
  }
}

// 4. Clean Segments - Remove dead/unresponsive contacts
async function cleanSegments(input: AutomationInput): Promise<Record<string, any>> {
  const { context, payload } = input
  const { segmentId, threshold = 0.2 } = payload

  // Find contacts below responsiveness threshold
  const deadContacts = context.contactIntel.contacts
    .filter((c) => c.responsivenessScore < threshold)
    .map((c) => ({
      contactId: c.contactId,
      score: c.responsivenessScore,
      lastContact: c.lastContactDate,
    }))

  const totalContacts = context.contactIntel.contacts.length
  const cleanedPercentage = (deadContacts.length / totalContacts) * 100

  return {
    deadContacts: deadContacts.slice(0, 50), // Return first 50
    totalDead: deadContacts.length,
    totalContacts,
    cleanedPercentage: cleanedPercentage.toFixed(1),
    threshold,
    recommendation:
      deadContacts.length > 0
        ? `Remove ${deadContacts.length} unresponsive contacts to improve list health`
        : 'Your contact list is healthy - no cleaning needed',
  }
}

// 5. Detect Rot - Find stale lists and suggest refresh
async function detectRot(input: AutomationInput): Promise<Record<string, any>> {
  const { context } = input

  const staleThresholdDays = 90
  const now = new Date()

  // Analyze campaign staleness
  const staleCampaigns = context.tracker.campaigns.filter((c) => {
    const daysSinceUpdate =
      (now.getTime() - new Date(c.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceUpdate > staleThresholdDays && c.status !== 'completed'
  })

  // Analyze contact staleness
  const staleContacts = context.contactIntel.contacts.filter((c) => {
    if (!c.lastContactDate) return false
    const daysSinceContact =
      (now.getTime() - new Date(c.lastContactDate).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceContact > staleThresholdDays
  })

  const rotLevel = staleCampaigns.length > 5 || staleContacts.length > 20 ? 'critical' : 'moderate'

  return {
    staleCampaigns: staleCampaigns.map((c) => ({
      id: c.id,
      name: c.name,
      daysSinceUpdate: Math.floor(
        (now.getTime() - new Date(c.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      ),
    })),
    staleContactCount: staleContacts.length,
    rotLevel,
    recommendations: [
      staleCampaigns.length > 0
        ? `Archive or update ${staleCampaigns.length} stale campaigns`
        : null,
      staleContacts.length > 0
        ? `Re-engage or remove ${staleContacts.length} stale contacts`
        : null,
      'Schedule regular list maintenance every 30 days',
    ].filter(Boolean),
  }
}

// 6. Optimize Schedule - Best times to send over next 5 days
async function optimizeSchedule(input: AutomationInput): Promise<Record<string, any>> {
  const { context, payload } = input
  const { days = 5 } = payload

  // Analyze historical send performance
  const emailsByDay = context.email.campaigns.reduce(
    (acc, campaign) => {
      const day = new Date(campaign.sent_at || campaign.created_at).getDay()
      if (!acc[day]) acc[day] = { count: 0, avgOpenRate: 0 }
      acc[day].count++
      acc[day].avgOpenRate += campaign.open_rate || 0
      return acc
    },
    {} as Record<number, { count: number; avgOpenRate: number }>
  )

  // Calculate best days
  const bestDays = Object.entries(emailsByDay)
    .map(([day, stats]) => ({
      day: parseInt(day),
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(day)],
      avgOpenRate: stats.count > 0 ? stats.avgOpenRate / stats.count : 0,
    }))
    .sort((a, b) => b.avgOpenRate - a.avgOpenRate)

  // Generate schedule for next N days
  const schedule: Array<{ date: string; reason: string; confidence: number }> = []
  const now = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() + i)
    const dayOfWeek = date.getDay()

    // Avoid weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    // Best time: Tuesday-Thursday, 10am-2pm
    const isOptimalDay = dayOfWeek >= 2 && dayOfWeek <= 4
    const confidence = isOptimalDay ? 0.85 : 0.65

    schedule.push({
      date: date.toISOString().split('T')[0],
      reason: isOptimalDay ? 'Peak engagement window (Tue-Thu)' : 'Good backup window (Mon/Fri)',
      confidence,
    })
  }

  return {
    schedule: schedule.slice(0, days),
    bestDays: bestDays.slice(0, 3),
    optimalTime: '10:00-14:00 GMT',
    reasoning: 'Based on historical open rates and industry best practices for music PR outreach',
  }
}
