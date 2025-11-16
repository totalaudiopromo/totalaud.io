/**
 * Phase 31: Creative Rhythm System - Rhythm Engine
 *
 * Analyzes creative patterns to detect:
 * - Energy windows (when user is most active)
 * - Return patterns (how often they come back)
 * - Mood and flow states
 *
 * Philosophy: Awareness, not productivity. Calm, non-judgmental analysis.
 */

import type {
  ActivityEvent,
  EnergyWindowType,
  DailySummary,
  EnergyWindow,
  ReturnPattern,
} from '@loopos/db'

// =====================================================
// ENERGY WINDOW DETECTION
// =====================================================

interface EnergyWindowAnalysis {
  window: EnergyWindowType
  score: number
  confidence: number
  activityCount: number
}

/**
 * Detect energy windows from activity events
 * Windows: early_morning (4-8am), morning (8-12pm), afternoon (12-5pm), evening (5-10pm), late (10pm-4am)
 */
export function detectEnergyWindows(events: ActivityEvent[]): EnergyWindowAnalysis[] {
  const windowCounts: Record<EnergyWindowType, number> = {
    early_morning: 0,
    morning: 0,
    afternoon: 0,
    evening: 0,
    late: 0,
  }

  // Count events per window
  events.forEach((event) => {
    const hour = new Date(event.timestamp).getHours()
    const window = getWindowForHour(hour)
    windowCounts[window]++
  })

  const totalEvents = events.length
  const minEventsForConfidence = 10

  // Calculate scores and confidence
  const windows: EnergyWindowAnalysis[] = Object.entries(windowCounts).map(([window, count]) => {
    const score = totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0
    const confidence = Math.min(1.0, count / minEventsForConfidence)

    return {
      window: window as EnergyWindowType,
      score,
      confidence: parseFloat(confidence.toFixed(2)),
      activityCount: count,
    }
  })

  return windows.sort((a, b) => b.score - a.score)
}

function getWindowForHour(hour: number): EnergyWindowType {
  if (hour >= 4 && hour < 8) return 'early_morning'
  if (hour >= 8 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'late'
}

// =====================================================
// RETURN PATTERN DETECTION
// =====================================================

interface ReturnPatternAnalysis {
  currentStreak: number
  longestStreak: number
  averageGapDays: number
  totalActiveDays: number
  confidence: number
}

/**
 * Analyze return patterns from daily summaries
 */
export function analyzeReturnPattern(summaries: DailySummary[]): ReturnPatternAnalysis {
  if (summaries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      averageGapDays: 0,
      totalActiveDays: 0,
      confidence: 0.0,
    }
  }

  // Sort by date (oldest first)
  const sorted = [...summaries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Filter to only active days (any activity)
  const activeDays = sorted.filter(
    (s) =>
      s.entries > 0 ||
      s.nodes_added > 0 ||
      s.coach_messages > 0 ||
      s.scenes_generated > 0
  )

  if (activeDays.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      averageGapDays: 0,
      totalActiveDays: 0,
      confidence: 0.0,
    }
  }

  // Calculate streaks
  let currentStreak = 1
  let longestStreak = 1
  let tempStreak = 1
  const gaps: number[] = []

  for (let i = 1; i < activeDays.length; i++) {
    const prevDate = new Date(activeDays[i - 1].date)
    const currDate = new Date(activeDays[i].date)
    const daysDiff = Math.floor(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysDiff === 1) {
      // Consecutive day
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)

      // Check if this is current streak (last day)
      if (i === activeDays.length - 1) {
        currentStreak = tempStreak
      }
    } else {
      // Gap
      gaps.push(daysDiff - 1)
      tempStreak = 1

      // If this is the last day and it's not consecutive, streak is 1
      if (i === activeDays.length - 1) {
        currentStreak = 1
      }
    }
  }

  const averageGapDays = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0

  const minDaysForConfidence = 14
  const confidence = Math.min(1.0, activeDays.length / minDaysForConfidence)

  return {
    currentStreak,
    longestStreak,
    averageGapDays: parseFloat(averageGapDays.toFixed(1)),
    totalActiveDays: activeDays.length,
    confidence: parseFloat(confidence.toFixed(2)),
  }
}

// =====================================================
// MOOD DETECTION (Basic Heuristics)
// =====================================================

interface MoodAnalysis {
  mood: 'calm' | 'focused' | 'exploratory' | 'stuck' | 'flowing'
  confidence: number
  reason: string
}

/**
 * Detect mood from recent activity patterns
 */
export function detectMood(recentEvents: ActivityEvent[], recentSummary?: DailySummary): MoodAnalysis {
  if (recentEvents.length === 0) {
    return {
      mood: 'calm',
      confidence: 0.5,
      reason: 'No recent activity',
    }
  }

  const typeCount = {
    note: 0,
    coach: 0,
    node: 0,
    designer: 0,
    pack: 0,
    login: 0,
  }

  recentEvents.forEach((e) => {
    typeCount[e.type]++
  })

  const total = recentEvents.length

  // Patterns:
  // - High journal activity = exploratory or stuck
  // - High timeline activity = focused
  // - High coach + designer = flowing
  // - Balanced activity = calm

  // Flowing: High coach + designer (> 40% combined)
  if ((typeCount.coach + typeCount.designer) / total > 0.4) {
    return {
      mood: 'flowing',
      confidence: 0.7,
      reason: 'Active collaboration with coach and designer',
    }
  }

  // Focused: High timeline activity (> 50%)
  if (typeCount.node / total > 0.5) {
    return {
      mood: 'focused',
      confidence: 0.75,
      reason: 'Concentrated timeline work',
    }
  }

  // Exploratory: High journal activity (> 60%)
  if (typeCount.note / total > 0.6) {
    return {
      mood: 'exploratory',
      confidence: 0.7,
      reason: 'Lots of journaling and note-taking',
    }
  }

  // Stuck: Lots of coach questions, little else
  if (typeCount.coach / total > 0.7 && total > 3) {
    return {
      mood: 'stuck',
      confidence: 0.6,
      reason: 'Many coach conversations without forward progress',
    }
  }

  // Default: Calm (balanced activity)
  return {
    mood: 'calm',
    confidence: 0.6,
    reason: 'Balanced activity across surfaces',
  }
}

// =====================================================
// SUGGESTIONS GENERATOR
// =====================================================

interface RhythmSuggestion {
  id: string
  message: string
  tone: 'info' | 'encouragement' | 'awareness'
}

/**
 * Generate calm, non-judgmental suggestions based on rhythm patterns
 */
export function generateSuggestions(
  energyWindows: EnergyWindow[],
  returnPattern: ReturnPattern | null,
  recentMood?: MoodAnalysis
): RhythmSuggestion[] {
  const suggestions: RhythmSuggestion[] = []

  // Energy window suggestion
  const topWindow = energyWindows.find((w) => w.confidence >= 0.5)
  if (topWindow) {
    const timeText = getWindowTimeText(topWindow.window)
    suggestions.push({
      id: 'energy-window',
      message: `You tend to be more active ${timeText}. Just something to notice.`,
      tone: 'info',
    })
  }

  // Return pattern suggestion
  if (returnPattern && returnPattern.confidence >= 0.5) {
    if (returnPattern.streak_days >= 3) {
      suggestions.push({
        id: 'streak',
        message: `You've been here ${returnPattern.streak_days} days in a row. Nice rhythm.`,
        tone: 'encouragement',
      })
    }

    if (returnPattern.typical_gap_days && returnPattern.typical_gap_days >= 3) {
      suggestions.push({
        id: 'return-pattern',
        message: `You usually return every ${Math.round(returnPattern.typical_gap_days)} days or so.`,
        tone: 'awareness',
      })
    }
  }

  // Mood-based suggestion
  if (recentMood) {
    if (recentMood.mood === 'stuck' && recentMood.confidence >= 0.6) {
      suggestions.push({
        id: 'mood-stuck',
        message: `Lots of thinking lately. Sometimes a quick timeline sketch helps clear the fog.`,
        tone: 'info',
      })
    }

    if (recentMood.mood === 'flowing' && recentMood.confidence >= 0.7) {
      suggestions.push({
        id: 'mood-flowing',
        message: `Good flow between surfaces. Whatever you're doing, it's working.`,
        tone: 'encouragement',
      })
    }
  }

  // Cap at 4 suggestions (no overwhelming)
  return suggestions.slice(0, 4)
}

function getWindowTimeText(window: EnergyWindowType): string {
  switch (window) {
    case 'early_morning':
      return 'in the early morning (4–8am)'
    case 'morning':
      return 'in the morning (8am–noon)'
    case 'afternoon':
      return 'in the afternoon (noon–5pm)'
    case 'evening':
      return 'in the evening (5–10pm)'
    case 'late':
      return 'late at night (10pm–4am)'
  }
}

// =====================================================
// FULL RHYTHM ANALYSIS
// =====================================================

export interface RhythmAnalysis {
  energyWindows: EnergyWindowAnalysis[]
  returnPattern: ReturnPatternAnalysis
  mood: MoodAnalysis
  suggestions: RhythmSuggestion[]
}

/**
 * Perform full rhythm analysis
 */
export function analyzeRhythm(
  events: ActivityEvent[],
  summaries: DailySummary[],
  returnPattern: ReturnPattern | null
): RhythmAnalysis {
  const energyWindows = detectEnergyWindows(events)
  const returnAnalysis = analyzeReturnPattern(summaries)
  const recentEvents = events.slice(0, 20) // Last 20 events for mood
  const mood = detectMood(recentEvents)

  // Convert energy window analysis to EnergyWindow format for suggestions
  const energyWindowsForSuggestions: EnergyWindow[] = energyWindows.map((w) => ({
    id: `window-${w.window}`,
    workspace_id: '', // Not needed for suggestions
    window: w.window,
    score: w.score,
    confidence: w.confidence,
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }))

  const suggestions = generateSuggestions(energyWindowsForSuggestions, returnPattern, mood)

  return {
    energyWindows,
    returnPattern: returnAnalysis,
    mood,
    suggestions,
  }
}
