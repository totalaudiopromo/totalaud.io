/**
 * Adaptive Theme Logic
 *
 * Data-driven theme adjustments based on:
 * - Activity intensity (events/min)
 * - Time of day
 * - Campaign progress
 */

import { palettes, type ThemePalette } from './palettes'

export interface AdaptiveContext {
  activityIntensity: 'low' | 'medium' | 'high' // Events per minute
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  campaignProgress: number // 0-100 percentage
}

export interface AdaptiveAdjustments {
  palette?: Partial<ThemePalette>
  suggestedTheme?: string
  energyLevel: 'calm' | 'focused' | 'energized'
}

/**
 * Calculate activity intensity from event rate
 */
export function calculateActivityIntensity(eventsPerMinute: number): 'low' | 'medium' | 'high' {
  if (eventsPerMinute < 2) return 'low'
  if (eventsPerMinute < 5) return 'medium'
  return 'high'
}

/**
 * Detect time of day
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

/**
 * Get adaptive adjustments based on context
 */
export function getAdaptiveAdjustments(context: AdaptiveContext): AdaptiveAdjustments {
  const { activityIntensity, timeOfDay, campaignProgress } = context

  // Time-based theme suggestions
  let suggestedTheme: string | undefined

  if (timeOfDay === 'morning' && activityIntensity === 'low') {
    suggestedTheme = 'map' // Calm, focused start
  } else if (timeOfDay === 'afternoon' && activityIntensity === 'high') {
    suggestedTheme = 'timeline' // Peak productivity
  } else if (timeOfDay === 'evening' || timeOfDay === 'night') {
    suggestedTheme = 'tape' // Warm, relaxed
  }

  // Energy level mapping
  let energyLevel: 'calm' | 'focused' | 'energized' = 'focused'

  if (activityIntensity === 'low' && timeOfDay === 'night') {
    energyLevel = 'calm'
  } else if (
    activityIntensity === 'high' &&
    (timeOfDay === 'morning' || timeOfDay === 'afternoon')
  ) {
    energyLevel = 'energized'
  }

  // Palette adjustments for high activity
  let palette: Partial<ThemePalette> | undefined

  if (activityIntensity === 'high') {
    // Slightly increase accent brightness for visibility
    // Note: This would need custom implementation in applyPalette
    palette = undefined // Placeholder for future brightness adjustments
  }

  // Campaign progress milestones
  if (campaignProgress >= 75 && activityIntensity === 'high') {
    // Near completion - suggest energetic theme
    suggestedTheme = 'guide'
  } else if (campaignProgress < 25 && activityIntensity === 'low') {
    // Early stage, low activity - suggest focused theme
    suggestedTheme = 'operator'
  }

  return {
    palette,
    suggestedTheme,
    energyLevel,
  }
}

/**
 * Monitor activity intensity over time window
 */
export class ActivityMonitor {
  private events: number[] = []
  private windowSize: number = 60000 // 1 minute window

  addEvent() {
    const now = Date.now()
    this.events.push(now)

    // Clean old events outside window
    this.events = this.events.filter((time) => now - time < this.windowSize)
  }

  getEventsPerMinute(): number {
    return this.events.length
  }

  getIntensity(): 'low' | 'medium' | 'high' {
    return calculateActivityIntensity(this.getEventsPerMinute())
  }

  reset() {
    this.events = []
  }
}

/**
 * Get theme suggestion based on full context
 */
export function suggestTheme(currentTheme: string, context: AdaptiveContext): string | null {
  const adjustments = getAdaptiveAdjustments(context)

  // Don't suggest if already on suggested theme
  if (adjustments.suggestedTheme && adjustments.suggestedTheme !== currentTheme) {
    return adjustments.suggestedTheme
  }

  return null
}

/**
 * Format theme suggestion notification
 */
export function formatThemeSuggestion(suggestedTheme: string, reason: string): string {
  const themeNames: Record<string, string> = {
    ascii: 'ASCII Terminal',
    xp: 'Windows XP',
    aqua: 'macOS Aqua',
    daw: 'DAW Studio',
    analogue: 'Analogue Warmth',
  }

  return `Switch to ${themeNames[suggestedTheme]}? ${reason}`
}
