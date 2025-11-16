/**
 * Live Captioner
 * Phase 16: Generate dynamic captions from performance events
 */

import type { PerformanceEvent } from '@totalaud/performance'

/**
 * OS label mapping
 */
const OS_LABELS: Record<string, string> = {
  ascii: 'ASCII',
  xp: 'XP',
  aqua: 'Aqua',
  daw: 'DAW',
  analogue: 'Analogue',
}

/**
 * Generate live caption from recent events
 */
export function generateLiveCaption(recentEvents: PerformanceEvent[]): string | null {
  if (recentEvents.length === 0) return null

  // Get last 2-3 events (most recent first)
  const latestEvents = recentEvents.slice(-3).reverse()

  // Try to generate caption from latest event
  const latestEvent = latestEvents[0]

  switch (latestEvent.type) {
    case 'fusion_consensus':
      return generateConsensusCaption(latestEvent, latestEvents)

    case 'fusion_tension':
      return generateTensionCaption(latestEvent, latestEvents)

    case 'evolution_spike':
      return generateEvolutionCaption(latestEvent)

    case 'loop_executed':
    case 'loop_suggestion_created':
      return generateLoopCaption(latestEvent, latestEvents)

    case 'memory_created':
      return generateMemoryCaption(latestEvent)

    case 'agent_success':
      return generateSuccessCaption(latestEvent)

    case 'agent_warning':
      return generateWarningCaption(latestEvent)

    case 'clip_activated':
      return generateClipCaption(latestEvent)

    default:
      return null
  }
}

/**
 * Caption generators for each event type
 */

function generateConsensusCaption(event: PerformanceEvent, recent: PerformanceEvent[]): string {
  const os = event.os ? OS_LABELS[event.os] || event.os : 'OSs'

  // Check if multiple OSs reached consensus recently
  const consensusEvents = recent.filter((e) => e.type === 'fusion_consensus')
  if (consensusEvents.length > 1) {
    return 'Multiple OSs aligning on shared vision'
  }

  return `${os} building consensus through collaboration`
}

function generateTensionCaption(event: PerformanceEvent, recent: PerformanceEvent[]): string {
  const os = event.os ? OS_LABELS[event.os] || event.os : 'OSs'

  // Check for multiple tension events
  const tensionEvents = recent.filter((e) => e.type === 'fusion_tension')
  if (tensionEvents.length > 1) {
    return 'Creative tensions emerging across the collective'
  }

  return `${os} navigating creative tension and debate`
}

function generateEvolutionCaption(event: PerformanceEvent): string {
  const os = event.os ? OS_LABELS[event.os] || event.os : 'An OS'
  return `Evolution spike: ${os} adapting and growing`
}

function generateLoopCaption(event: PerformanceEvent, recent: PerformanceEvent[]): string {
  const os = event.os ? OS_LABELS[event.os] || event.os : 'OSs'

  const loopEvents = recent.filter(
    (e) => e.type === 'loop_executed' || e.type === 'loop_suggestion_created'
  )

  if (loopEvents.length > 2) {
    return 'Autonomous loops running across the collective'
  }

  if (event.type === 'loop_suggestion_created') {
    return `${os} generating new loop suggestions`
  }

  return `${os} executing autonomous workflow loops`
}

function generateMemoryCaption(event: PerformanceEvent): string {
  const os = event.os ? OS_LABELS[event.os] || event.os : 'An OS'
  return `${os} creating significant memory marker`
}

function generateSuccessCaption(event: PerformanceEvent): string {
  const os = event.os ? OS_LABELS[event.os] || event.os : 'An OS'
  return `${os} celebrating successful task completion`
}

function generateWarningCaption(event: PerformanceEvent): string {
  const os = event.os ? OS_LABELS[event.os] || event.os : 'An OS'
  return `${os} flagging potential challenge ahead`
}

function generateClipCaption(event: PerformanceEvent): string {
  return 'Creative clip activated and ready to launch'
}
