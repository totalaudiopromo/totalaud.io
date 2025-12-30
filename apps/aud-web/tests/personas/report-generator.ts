/**
 * Session Report Generator for Persona-Based Testing
 *
 * Generates human-readable reports from persona test runs,
 * highlighting friction points and actionable insights.
 */

import * as fs from 'fs'
import * as path from 'path'
import { ScenarioResult, FrictionPoint, ActionRecord } from './scenario-runner'
import { Persona, PersonaId, personas } from './personas'

// =============================================================================
// TYPES
// =============================================================================

export interface SessionReport {
  persona: {
    id: PersonaId
    name: string
    displayName: string
    genre: string[]
    monthlyListeners: number
    tier: string
    devicePreference: string
  }
  scenario: string
  timestamp: string
  duration: string
  success: boolean
  summary: string
  frictionAnalysis: {
    total: number
    major: FrictionPoint[]
    moderate: FrictionPoint[]
    minor: FrictionPoint[]
    byMode: Record<string, number>
  }
  actionTimeline: {
    action: string
    duration: string
    success: boolean
    notes?: string
  }[]
  recommendations: string[]
  screenshots: {
    name: string
    description: string
    path: string
  }[]
  rawMetrics: {
    pageLoadMs: number
    timeToFirstInteraction: number
    totalActions: number
    successfulActions: number
    errorCount: number
  }
}

export interface ComparisonReport {
  generatedAt: string
  personasCompared: PersonaId[]
  scenariosRun: string[]
  overallSummary: {
    passRate: string
    totalFriction: number
    criticalIssues: string[]
  }
  byPersona: Record<
    PersonaId,
    {
      passRate: string
      totalFriction: number
      topIssues: string[]
    }
  >
  byMode: Record<
    string,
    {
      frictionCount: number
      issues: string[]
    }
  >
  prioritisedRecommendations: {
    priority: 'high' | 'medium' | 'low'
    recommendation: string
    affectedPersonas: PersonaId[]
    mode: string
  }[]
}

// =============================================================================
// SINGLE SESSION REPORT
// =============================================================================

export function generateSessionReport(result: ScenarioResult, persona: Persona): SessionReport {
  const majorFriction = result.frictionPoints.filter((f) => f.severity === 'major')
  const moderateFriction = result.frictionPoints.filter((f) => f.severity === 'moderate')
  const minorFriction = result.frictionPoints.filter((f) => f.severity === 'minor')

  // Count friction by mode
  const byMode: Record<string, number> = {}
  for (const fp of result.frictionPoints) {
    byMode[fp.mode] = (byMode[fp.mode] || 0) + 1
  }

  // Generate recommendations
  const recommendations = generateRecommendations(result, persona)

  // Generate summary
  const summary = generateSummary(result, persona)

  return {
    persona: {
      id: persona.id,
      name: persona.name,
      displayName: persona.displayName,
      genre: persona.genre,
      monthlyListeners: persona.monthlyListeners,
      tier: persona.expectedTier,
      devicePreference: persona.devicePreference,
    },
    scenario: result.scenarioType,
    timestamp: new Date().toISOString(),
    duration: formatDuration(result.durationMs),
    success: result.success,
    summary,
    frictionAnalysis: {
      total: result.frictionPoints.length,
      major: majorFriction,
      moderate: moderateFriction,
      minor: minorFriction,
      byMode,
    },
    actionTimeline: result.actions.map((a) => ({
      action: a.action,
      duration: formatDuration(a.durationMs),
      success: a.success,
      notes: a.notes,
    })),
    recommendations,
    screenshots: result.screenshots.map((s) => ({
      name: s.name,
      description: s.description,
      path: s.path,
    })),
    rawMetrics: {
      pageLoadMs: result.metrics.pageLoadMs,
      timeToFirstInteraction: result.metrics.timeToFirstInteraction,
      totalActions: result.actions.length,
      successfulActions: result.actions.filter((a) => a.success).length,
      errorCount: result.metrics.errors.length,
    },
  }
}

function generateSummary(result: ScenarioResult, persona: Persona): string {
  const majorCount = result.frictionPoints.filter((f) => f.severity === 'major').length

  if (result.success && majorCount === 0) {
    return `${persona.displayName} completed the ${result.scenarioType} scenario successfully with no major issues. The experience aligns well with their expectations as a ${persona.careerStage} artist on ${persona.devicePreference}.`
  }

  if (result.success && majorCount > 0) {
    return `${persona.displayName} completed the ${result.scenarioType} scenario but encountered ${majorCount} major friction point(s). These should be addressed to improve the experience for ${persona.expectedTier} tier users.`
  }

  return `${persona.displayName} failed to complete the ${result.scenarioType} scenario. ${result.metrics.errors.length} error(s) occurred. This indicates a critical issue for ${persona.careerStage} artists using ${persona.devicePreference} devices.`
}

function generateRecommendations(result: ScenarioResult, persona: Persona): string[] {
  const recommendations: string[] = []

  // Device-specific recommendations
  if (persona.devicePreference === 'mobile') {
    const navFriction = result.frictionPoints.filter((f) => f.mode === 'navigation')
    if (navFriction.length > 0) {
      recommendations.push(
        `Improve mobile navigation for ${persona.name}'s use case (${persona.sessionLength} sessions on mobile)`
      )
    }
  }

  // Career stage recommendations
  if (persona.careerStage === 'emerging') {
    const anyMajorFriction = result.frictionPoints.some((f) => f.severity === 'major')
    if (anyMajorFriction) {
      recommendations.push(
        `Simplify onboarding flow - ${persona.name} is new to industry tools and needs guided experience`
      )
    }
  }

  if (persona.careerStage === 'professional') {
    const slowActions = result.actions.filter((a) => a.durationMs > 3000)
    if (slowActions.length > 0) {
      recommendations.push(
        `Optimise performance for power users like ${persona.name} who expect professional-grade speed`
      )
    }
  }

  // Mode-specific recommendations
  const modeIssues = result.frictionPoints.reduce(
    (acc, fp) => {
      if (!acc[fp.mode]) acc[fp.mode] = []
      if (fp.suggestion) acc[fp.mode].push(fp.suggestion)
      return acc
    },
    {} as Record<string, string[]>
  )

  for (const [mode, suggestions] of Object.entries(modeIssues)) {
    if (suggestions.length > 0) {
      recommendations.push(`${mode.toUpperCase()} MODE: ${suggestions[0]}`)
    }
  }

  // Tier-based recommendations
  if (persona.expectedTier === 'starter' && result.frictionPoints.length > 3) {
    recommendations.push(
      `Starter tier users like ${persona.name} (£5/month) need smoother experience to convert`
    )
  }

  if (persona.expectedTier === 'pro' && !result.success) {
    recommendations.push(
      `Critical: Pro tier user ${persona.name} (£19/month) failed to complete journey - immediate fix needed`
    )
  }

  return recommendations
}

// =============================================================================
// COMPARISON REPORT
// =============================================================================

export function generateComparisonReport(
  results: ScenarioResult[],
  personaIds: PersonaId[],
  scenarios: string[]
): ComparisonReport {
  const byPersona: ComparisonReport['byPersona'] = {} as ComparisonReport['byPersona']
  const byMode: ComparisonReport['byMode'] = {}
  const allRecommendations: ComparisonReport['prioritisedRecommendations'] = []

  // Group results by persona
  for (const personaId of personaIds) {
    const personaResults = results.filter((r) => r.personaId === personaId)
    const passed = personaResults.filter((r) => r.success).length
    const friction = personaResults.flatMap((r) => r.frictionPoints)

    byPersona[personaId] = {
      passRate: `${passed}/${personaResults.length}`,
      totalFriction: friction.length,
      topIssues: friction
        .filter((f) => f.severity === 'major')
        .map((f) => f.description)
        .slice(0, 3),
    }
  }

  // Group by mode
  for (const result of results) {
    for (const fp of result.frictionPoints) {
      if (!byMode[fp.mode]) {
        byMode[fp.mode] = { frictionCount: 0, issues: [] }
      }
      byMode[fp.mode].frictionCount++
      if (fp.severity === 'major' && !byMode[fp.mode].issues.includes(fp.description)) {
        byMode[fp.mode].issues.push(fp.description)
      }
    }
  }

  // Generate prioritised recommendations
  const majorByMode: Record<string, { count: number; personas: PersonaId[] }> = {}

  for (const result of results) {
    for (const fp of result.frictionPoints.filter((f) => f.severity === 'major')) {
      if (!majorByMode[fp.mode]) {
        majorByMode[fp.mode] = { count: 0, personas: [] }
      }
      majorByMode[fp.mode].count++
      if (!majorByMode[fp.mode].personas.includes(result.personaId)) {
        majorByMode[fp.mode].personas.push(result.personaId)
      }
    }
  }

  for (const [mode, data] of Object.entries(majorByMode)) {
    allRecommendations.push({
      priority: data.personas.length >= 3 ? 'high' : data.personas.length >= 2 ? 'medium' : 'low',
      recommendation: `Fix ${mode} mode issues affecting ${data.personas.length} persona(s)`,
      affectedPersonas: data.personas,
      mode,
    })
  }

  // Sort by priority
  allRecommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  // Overall summary
  const totalPassed = results.filter((r) => r.success).length
  const totalFriction = results.flatMap((r) => r.frictionPoints).length
  const criticalIssues = results
    .flatMap((r) => r.frictionPoints)
    .filter((f) => f.severity === 'major')
    .map((f) => f.description)
    .filter((v, i, a) => a.indexOf(v) === i) // Unique
    .slice(0, 5)

  return {
    generatedAt: new Date().toISOString(),
    personasCompared: personaIds,
    scenariosRun: scenarios,
    overallSummary: {
      passRate: `${totalPassed}/${results.length} (${Math.round((totalPassed / results.length) * 100)}%)`,
      totalFriction,
      criticalIssues,
    },
    byPersona,
    byMode,
    prioritisedRecommendations: allRecommendations,
  }
}

// =============================================================================
// OUTPUT FORMATTERS
// =============================================================================

export function formatReportAsMarkdown(report: SessionReport): string {
  const lines: string[] = []

  lines.push(`# Persona Test Report: ${report.persona.displayName}`)
  lines.push('')
  lines.push(`**Scenario:** ${report.scenario}`)
  lines.push(`**Timestamp:** ${report.timestamp}`)
  lines.push(`**Duration:** ${report.duration}`)
  lines.push(`**Result:** ${report.success ? '✅ PASSED' : '❌ FAILED'}`)
  lines.push('')

  lines.push('## Summary')
  lines.push('')
  lines.push(report.summary)
  lines.push('')

  lines.push('## Persona Context')
  lines.push('')
  lines.push(`| Attribute | Value |`)
  lines.push(`|-----------|-------|`)
  lines.push(`| Genre | ${report.persona.genre.join(', ')} |`)
  lines.push(`| Monthly Listeners | ${report.persona.monthlyListeners.toLocaleString()} |`)
  lines.push(`| Expected Tier | ${report.persona.tier} |`)
  lines.push(`| Device | ${report.persona.devicePreference} |`)
  lines.push('')

  lines.push('## Friction Analysis')
  lines.push('')
  lines.push(`**Total Friction Points:** ${report.frictionAnalysis.total}`)
  lines.push('')

  if (report.frictionAnalysis.major.length > 0) {
    lines.push('### 🔴 Major Issues')
    for (const fp of report.frictionAnalysis.major) {
      lines.push(`- **${fp.mode}**: ${fp.description}`)
      if (fp.suggestion) {
        lines.push(`  - *Suggestion:* ${fp.suggestion}`)
      }
    }
    lines.push('')
  }

  if (report.frictionAnalysis.moderate.length > 0) {
    lines.push('### 🟡 Moderate Issues')
    for (const fp of report.frictionAnalysis.moderate) {
      lines.push(`- **${fp.mode}**: ${fp.description}`)
    }
    lines.push('')
  }

  if (report.frictionAnalysis.minor.length > 0) {
    lines.push('### 🟢 Minor Issues')
    for (const fp of report.frictionAnalysis.minor) {
      lines.push(`- **${fp.mode}**: ${fp.description}`)
    }
    lines.push('')
  }

  lines.push('### Friction by Mode')
  lines.push('')
  for (const [mode, count] of Object.entries(report.frictionAnalysis.byMode)) {
    lines.push(`- ${mode}: ${count}`)
  }
  lines.push('')

  lines.push('## Recommendations')
  lines.push('')
  for (const rec of report.recommendations) {
    lines.push(`- ${rec}`)
  }
  lines.push('')

  lines.push('## Action Timeline')
  lines.push('')
  lines.push('| Action | Duration | Status |')
  lines.push('|--------|----------|--------|')
  for (const action of report.actionTimeline) {
    const status = action.success ? '✅' : '❌'
    lines.push(`| ${action.action} | ${action.duration} | ${status} |`)
  }
  lines.push('')

  lines.push('## Metrics')
  lines.push('')
  lines.push(`- Page Load: ${report.rawMetrics.pageLoadMs}ms`)
  lines.push(`- Time to First Interaction: ${report.rawMetrics.timeToFirstInteraction}ms`)
  lines.push(
    `- Actions: ${report.rawMetrics.successfulActions}/${report.rawMetrics.totalActions} successful`
  )
  lines.push(`- Errors: ${report.rawMetrics.errorCount}`)
  lines.push('')

  if (report.screenshots.length > 0) {
    lines.push('## Screenshots')
    lines.push('')
    for (const ss of report.screenshots) {
      lines.push(`### ${ss.name}`)
      lines.push(`*${ss.description}*`)
      lines.push(`![${ss.name}](${ss.path})`)
      lines.push('')
    }
  }

  return lines.join('\n')
}

export function formatComparisonAsMarkdown(report: ComparisonReport): string {
  const lines: string[] = []

  lines.push('# Persona Comparison Report')
  lines.push('')
  lines.push(`**Generated:** ${report.generatedAt}`)
  lines.push(`**Personas:** ${report.personasCompared.join(', ')}`)
  lines.push(`**Scenarios:** ${report.scenariosRun.join(', ')}`)
  lines.push('')

  lines.push('## Overall Summary')
  lines.push('')
  lines.push(`- **Pass Rate:** ${report.overallSummary.passRate}`)
  lines.push(`- **Total Friction Points:** ${report.overallSummary.totalFriction}`)
  lines.push('')

  if (report.overallSummary.criticalIssues.length > 0) {
    lines.push('### Critical Issues')
    for (const issue of report.overallSummary.criticalIssues) {
      lines.push(`- ${issue}`)
    }
    lines.push('')
  }

  lines.push('## By Persona')
  lines.push('')
  lines.push('| Persona | Pass Rate | Friction | Top Issue |')
  lines.push('|---------|-----------|----------|-----------|')
  for (const [personaId, data] of Object.entries(report.byPersona)) {
    const persona = personas[personaId as PersonaId]
    const topIssue = data.topIssues[0] || 'None'
    lines.push(
      `| ${persona.displayName} | ${data.passRate} | ${data.totalFriction} | ${topIssue} |`
    )
  }
  lines.push('')

  lines.push('## By Mode')
  lines.push('')
  for (const [mode, data] of Object.entries(report.byMode)) {
    lines.push(`### ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`)
    lines.push(`- Friction Count: ${data.frictionCount}`)
    if (data.issues.length > 0) {
      lines.push('- Issues:')
      for (const issue of data.issues) {
        lines.push(`  - ${issue}`)
      }
    }
    lines.push('')
  }

  lines.push('## Prioritised Recommendations')
  lines.push('')
  for (const rec of report.prioritisedRecommendations) {
    const emoji = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'
    lines.push(`${emoji} **${rec.priority.toUpperCase()}**: ${rec.recommendation}`)
    lines.push(`   - Affects: ${rec.affectedPersonas.join(', ')}`)
    lines.push('')
  }

  return lines.join('\n')
}

// =============================================================================
// FILE OUTPUT
// =============================================================================

export async function saveReportToFile(
  report: SessionReport,
  outputDir: string,
  filename: string
): Promise<string> {
  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const markdown = formatReportAsMarkdown(report)
  const filePath = path.join(outputDir, `${filename}-${Date.now()}.md`)

  fs.writeFileSync(filePath, markdown)

  return filePath
}

export async function saveComparisonReportToFile(
  report: ComparisonReport,
  outputDir: string
): Promise<string> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const markdown = formatComparisonAsMarkdown(report)
  const filePath = path.join(outputDir, `comparison-${Date.now()}.md`)

  fs.writeFileSync(filePath, markdown)

  return filePath
}

// =============================================================================
// UTILITIES
// =============================================================================

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}
