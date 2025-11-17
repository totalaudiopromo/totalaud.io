/**
 * Adaptive Log
 * Phase 21 - Logging system for adaptive performance changes
 * British English
 */

import type { AdaptiveMetrics } from './adaptiveMonitor'
import type { AdaptiveDirective } from './adaptiveRulesEngine'
import type { AdaptiveRewriteEntry } from '../agents/intent/creativeScoreRewriter'

/**
 * Adaptive log entry
 * Complete record of what happened during an adaptive cycle
 */
export interface AdaptiveLogEntry {
  timestamp: number
  bar: number
  scene: number
  metrics: AdaptiveMetrics
  directives: AdaptiveDirective[]
  rewrites: AdaptiveRewriteEntry[]
  affectedScene: number
}

/**
 * Adaptive log store
 */
class AdaptiveLogStore {
  private log: AdaptiveLogEntry[] = []
  private maxEntries = 1000 // Keep last 1000 entries

  /**
   * Add entry to log
   */
  add(entry: AdaptiveLogEntry): void {
    this.log.push(entry)

    // Trim if exceeds max
    if (this.log.length > this.maxEntries) {
      this.log.shift()
    }
  }

  /**
   * Get all log entries
   */
  getAll(): AdaptiveLogEntry[] {
    return [...this.log]
  }

  /**
   * Get entries for a specific scene
   */
  getByScene(sceneIndex: number): AdaptiveLogEntry[] {
    return this.log.filter((entry) => entry.scene === sceneIndex)
  }

  /**
   * Get entries in a time range
   */
  getByTimeRange(startTime: number, endTime: number): AdaptiveLogEntry[] {
    return this.log.filter((entry) => entry.timestamp >= startTime && entry.timestamp <= endTime)
  }

  /**
   * Get entries with specific directive types
   */
  getByDirectiveType(type: string): AdaptiveLogEntry[] {
    return this.log.filter((entry) =>
      entry.directives.some((directive) => directive.type === type)
    )
  }

  /**
   * Get recent entries
   */
  getRecent(count: number = 10): AdaptiveLogEntry[] {
    return this.log.slice(-count)
  }

  /**
   * Clear all log entries
   */
  clear(): void {
    this.log = []
  }

  /**
   * Get log statistics
   */
  getStatistics(): {
    totalEntries: number
    totalDirectives: number
    totalRewrites: number
    directivesByType: Record<string, number>
    rewritesByProperty: Record<string, number>
    scenesAffected: Set<number>
  } {
    const stats = {
      totalEntries: this.log.length,
      totalDirectives: 0,
      totalRewrites: 0,
      directivesByType: {} as Record<string, number>,
      rewritesByProperty: {} as Record<string, number>,
      scenesAffected: new Set<number>(),
    }

    this.log.forEach((entry) => {
      // Count directives
      stats.totalDirectives += entry.directives.length
      entry.directives.forEach((directive) => {
        stats.directivesByType[directive.type] = (stats.directivesByType[directive.type] || 0) + 1
      })

      // Count rewrites
      stats.totalRewrites += entry.rewrites.length
      entry.rewrites.forEach((rewrite) => {
        stats.rewritesByProperty[rewrite.affectedProperty] =
          (stats.rewritesByProperty[rewrite.affectedProperty] || 0) + 1
      })

      // Track affected scenes
      stats.scenesAffected.add(entry.affectedScene)
    })

    return stats
  }
}

/**
 * Global adaptive log singleton
 */
const adaptiveLogStore = new AdaptiveLogStore()

/**
 * Add adaptive log entry
 */
export function addAdaptiveLogEntry(entry: AdaptiveLogEntry): void {
  adaptiveLogStore.add(entry)
}

/**
 * Get adaptive log
 */
export function getAdaptiveLog(): AdaptiveLogEntry[] {
  return adaptiveLogStore.getAll()
}

/**
 * Get adaptive log entries by scene
 */
export function getAdaptiveLogByScene(sceneIndex: number): AdaptiveLogEntry[] {
  return adaptiveLogStore.getByScene(sceneIndex)
}

/**
 * Get adaptive log entries by time range
 */
export function getAdaptiveLogByTimeRange(startTime: number, endTime: number): AdaptiveLogEntry[] {
  return adaptiveLogStore.getByTimeRange(startTime, endTime)
}

/**
 * Get adaptive log entries by directive type
 */
export function getAdaptiveLogByDirectiveType(type: string): AdaptiveLogEntry[] {
  return adaptiveLogStore.getByDirectiveType(type)
}

/**
 * Get recent adaptive log entries
 */
export function getRecentAdaptiveLog(count: number = 10): AdaptiveLogEntry[] {
  return adaptiveLogStore.getRecent(count)
}

/**
 * Clear adaptive log
 */
export function clearAdaptiveLog(): void {
  adaptiveLogStore.clear()
}

/**
 * Get adaptive log statistics
 */
export function getAdaptiveLogStatistics(): {
  totalEntries: number
  totalDirectives: number
  totalRewrites: number
  directivesByType: Record<string, number>
  rewritesByProperty: Record<string, number>
  scenesAffected: Set<number>
} {
  return adaptiveLogStore.getStatistics()
}

/**
 * Export adaptive log as NDJSON (newline-delimited JSON)
 */
export function exportAdaptiveLogNDJSON(): string {
  const entries = getAdaptiveLog()
  return entries.map((entry) => JSON.stringify(entry)).join('\n')
}

/**
 * Export adaptive log as JSON array
 */
export function exportAdaptiveLogJSON(): string {
  const entries = getAdaptiveLog()
  return JSON.stringify(entries, null, 2)
}

/**
 * Export adaptive log summary as Markdown
 */
export function exportAdaptiveLogSummary(): string {
  const stats = getAdaptiveLogStatistics()
  const entries = getAdaptiveLog()

  const lines: string[] = []

  lines.push('# Adaptive Performance Log Summary')
  lines.push('')
  lines.push(`**Total Entries:** ${stats.totalEntries}`)
  lines.push(`**Total Directives:** ${stats.totalDirectives}`)
  lines.push(`**Total Rewrites:** ${stats.totalRewrites}`)
  lines.push(`**Scenes Affected:** ${stats.scenesAffected.size}`)
  lines.push('')

  // Directives by type
  lines.push('## Directives by Type')
  lines.push('')
  Object.entries(stats.directivesByType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      lines.push(`- **${type}**: ${count}`)
    })
  lines.push('')

  // Rewrites by property
  lines.push('## Rewrites by Property')
  lines.push('')
  Object.entries(stats.rewritesByProperty)
    .sort((a, b) => b[1] - a[1])
    .forEach(([property, count]) => {
      lines.push(`- **${property}**: ${count}`)
    })
  lines.push('')

  // Recent entries
  lines.push('## Recent Entries (Last 10)')
  lines.push('')
  const recent = getRecentAdaptiveLog(10)
  recent.forEach((entry, i) => {
    lines.push(`### Entry ${entries.length - recent.length + i + 1}`)
    lines.push(`- **Time:** ${new Date(entry.timestamp).toISOString()}`)
    lines.push(`- **Bar:** ${entry.bar}`)
    lines.push(`- **Scene:** ${entry.scene}`)
    lines.push(`- **Directives:** ${entry.directives.length}`)
    lines.push(`- **Rewrites:** ${entry.rewrites.length}`)
    if (entry.directives.length > 0) {
      lines.push('')
      lines.push('**Directive Details:**')
      entry.directives.forEach((directive) => {
        lines.push(`  - [${directive.type}] ${directive.reasoning}`)
      })
    }
    lines.push('')
  })

  return lines.join('\n')
}

/**
 * Download adaptive log (browser only)
 */
export function downloadAdaptiveLog(format: 'ndjson' | 'json' | 'summary' = 'json'): void {
  let content: string
  let filename: string
  let mimeType: string

  switch (format) {
    case 'ndjson':
      content = exportAdaptiveLogNDJSON()
      filename = `adaptive-log-${Date.now()}.ndjson`
      mimeType = 'application/x-ndjson'
      break

    case 'json':
      content = exportAdaptiveLogJSON()
      filename = `adaptive-log-${Date.now()}.json`
      mimeType = 'application/json'
      break

    case 'summary':
      content = exportAdaptiveLogSummary()
      filename = `adaptive-log-summary-${Date.now()}.md`
      mimeType = 'text/markdown'
      break
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
