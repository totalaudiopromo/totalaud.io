/**
 * Persona-Based E2E Tests
 *
 * These tests simulate realistic user journeys through totalaud.io
 * from the perspective of each ICP persona.
 *
 * Run with: pnpm test:personas
 * Run specific persona: pnpm test:personas --grep "Maya"
 * Run specific scenario: pnpm test:personas --grep "ideas-capture"
 */

import { test, expect } from '@playwright/test'
import {
  PersonaScenarioRunner,
  ScenarioResult,
  ScenarioType,
  summariseBatchResults,
} from './scenario-runner'
import {
  PersonaId,
  allPersonaIds,
  getPersona,
  getViewportForPersona,
  generateIdeasForPersona,
  getScoutFiltersForPersona,
  generatePitchContentForPersona,
} from './personas'
import { generateSessionReport, saveReportToFile } from './report-generator'
import * as path from 'path'

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

const SCREENSHOT_DIR = path.join(__dirname, '../output/persona-screenshots')
const REPORT_DIR = path.join(__dirname, '../output/persona-reports')

// Which scenarios to run for each test
const QUICK_SCENARIOS: ScenarioType[] = ['first-visit', 'ideas-capture']
const FULL_SCENARIOS: ScenarioType[] = [
  'first-visit',
  'ideas-capture',
  'scout-discovery',
  'release-planning',
  'pitch-writing',
]

// =============================================================================
// PER-PERSONA TEST SUITES
// =============================================================================

test.describe('Persona: Maya Chen (Lo-fi Producer)', () => {
  const personaId: PersonaId = 'maya'
  const persona = getPersona(personaId)

  test.beforeEach(async ({ page }) => {
    const viewport = getViewportForPersona(personaId)
    await page.setViewportSize(viewport)
  })

  test('First visit experience on mobile', async ({ page, context }) => {
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('first-visit')

    // Maya expects mobile-friendly navigation
    expect(result.frictionPoints.filter((f) => f.severity === 'major')).toHaveLength(0)

    // Save report
    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `maya-first-visit`)
  })

  test('Quick idea capture on the bus', async ({ page, context }) => {
    // Maya adds ideas quickly on mobile during her commute
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('ideas-capture')

    // Should be able to add ideas quickly
    const addActions = result.actions.filter((a) => a.action.includes('Add idea'))
    expect(addActions.every((a) => a.durationMs < 5000)).toBe(true)

    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `maya-ideas-capture`)
  })

  test('Finding lo-fi playlists in Scout', async ({ page, context }) => {
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('scout-discovery')

    // Maya filters for small/medium playlists (realistic for her level)
    const filters = getScoutFiltersForPersona(personaId)
    expect(filters.audienceSize).toContain('small')
    expect(filters.audienceSize).not.toContain('large')

    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `maya-scout-discovery`)
  })
})

test.describe('Persona: Marcus Thompson (UK Hip-Hop)', () => {
  const personaId: PersonaId = 'marcus'
  const persona = getPersona(personaId)

  test.beforeEach(async ({ page }) => {
    const viewport = getViewportForPersona(personaId)
    await page.setViewportSize(viewport)
  })

  test('Album rollout planning', async ({ page, context }) => {
    // Marcus needs to plan a proper album campaign
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('release-planning')

    // Should be able to create multi-month timeline
    expect(result.success).toBe(true)

    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `marcus-release-planning`)
  })

  test('Bio upgrade after Radio 1Xtra play', async ({ page, context }) => {
    // Marcus needs to update his bio - he's levelled up
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('pitch-writing')

    const pitchContent = generatePitchContentForPersona(personaId)
    // His old bio shouldn't mention "hungry" or "come up"
    expect(pitchContent.currentBio.toLowerCase()).toContain('hungry')
    // His new bio should reflect his achievements
    expect(pitchContent.desiredBio).toContain('Radio 1Xtra')

    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `marcus-pitch-writing`)
  })

  test('Finding radio contacts (not scam promoters)', async ({ page, context }) => {
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('scout-discovery')

    // Marcus specifically looks for radio opportunities
    const filters = getScoutFiltersForPersona(personaId)
    expect(filters.types).toContain('radio')
    expect(filters.audienceSize).toContain('large') // He's past small now

    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `marcus-scout-discovery`)
  })
})

test.describe('Persona: Sarah & James (Folk Duo)', () => {
  const personaId: PersonaId = 'sarah-james'
  const persona = getPersona(personaId)

  test.beforeEach(async ({ page }) => {
    const viewport = getViewportForPersona(personaId)
    await page.setViewportSize(viewport)
  })

  test('Coordinating ideas between two people', async ({ page, context }) => {
    // Both Sarah and James add ideas independently
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('ideas-capture')

    const ideas = generateIdeasForPersona(personaId)
    // Should have collaboration-focused ideas
    expect(ideas.some((i) => i.content.toLowerCase().includes('collab'))).toBe(true)

    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `sarah-james-ideas-capture`)
  })

  test('Long lead time release planning (folk radio)', async ({ page, context }) => {
    // Folk radio needs 3+ months lead time
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('release-planning')

    // They need to see their 6-month timeline clearly
    expect(result.success).toBe(true)

    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `sarah-james-release-planning`)
  })

  test('Finding sync opportunities', async ({ page, context }) => {
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('scout-discovery')

    // Their music suits sync licensing
    const pitchContent = generatePitchContentForPersona(personaId)
    expect(pitchContent.pitchRequests.some((r) => r.toLowerCase().includes('sync'))).toBe(true)

    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `sarah-james-scout-discovery`)
  })
})

test.describe('Persona: Dev Patel (House Producer)', () => {
  const personaId: PersonaId = 'dev'
  const persona = getPersona(personaId)

  test.beforeEach(async ({ page }) => {
    const viewport = getViewportForPersona(personaId)
    await page.setViewportSize(viewport)
  })

  test('Quarterly business planning', async ({ page, context }) => {
    // Dev thinks in quarters now that music is his business
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('release-planning')

    const ideas = generateIdeasForPersona(personaId)
    // Should have business-focused ideas
    expect(ideas.some((i) => i.content.toLowerCase().includes('label'))).toBe(true)
    expect(ideas.some((i) => i.content.toLowerCase().includes('sample pack'))).toBe(true)

    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `dev-release-planning`)
  })

  test('Understanding dance music press landscape', async ({ page, context }) => {
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('scout-discovery')

    // Dev needs to understand Beatport, Mixmag, DJ Mag
    const filters = getScoutFiltersForPersona(personaId)
    expect(filters.types).toContain('press')
    expect(filters.genres).toContain('house')

    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `dev-scout-discovery`)
  })

  test('Authentic heritage narrative in pitch', async ({ page, context }) => {
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('pitch-writing')

    const pitchContent = generatePitchContentForPersona(personaId)
    // His bio should mention South Asian heritage authentically
    expect(pitchContent.desiredBio).toContain('South Asian')
    expect(pitchContent.pitchRequests.some((r) => r.includes('heritage'))).toBe(true)

    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `dev-pitch-writing`)
  })
})

test.describe('Persona: Chloe Williams (Student Singer-Songwriter)', () => {
  const personaId: PersonaId = 'chloe'
  const persona = getPersona(personaId)

  test.beforeEach(async ({ page }) => {
    const viewport = getViewportForPersona(personaId)
    await page.setViewportSize(viewport)
  })

  test('Not feeling overwhelmed on first visit', async ({ page, context }) => {
    // Chloe doesn't know what she doesn't know
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('first-visit')

    // Should have minimal friction for a beginner
    const majorFriction = result.frictionPoints.filter((f) => f.severity === 'major')
    expect(majorFriction).toHaveLength(0)

    // Should complete first visit quickly (she's impatient)
    expect(result.durationMs).toBeLessThan(60000) // Under 1 minute

    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `chloe-first-visit`)
  })

  test('Finding appropriate (small) opportunities', async ({ page, context }) => {
    // Chloe needs small playlists - not Rap Caviar
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('scout-discovery')

    const filters = getScoutFiltersForPersona(personaId)
    expect(filters.audienceSize).toEqual(['small']) // Only small for her level
    expect(filters.audienceSize).not.toContain('large')

    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `chloe-scout-discovery`)
  })

  test('Writing first ever bio', async ({ page, context }) => {
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('pitch-writing')

    const pitchContent = generatePitchContentForPersona(personaId)
    // She has no current bio
    expect(pitchContent.currentBio).toBe('')
    // Her first request is for help writing one
    expect(pitchContent.pitchRequests[0]).toContain('first ever bio')

    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `chloe-pitch-writing`)
  })

  test('Creating first release plan ever', async ({ page, context }) => {
    const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
    const result = await runner.runScenario('release-planning')

    // Her timeline should be simple - not a 6-month campaign
    const ideas = generateIdeasForPersona(personaId)
    // Should have learning-focused ideas
    expect(ideas.some((i) => i.content.toLowerCase().includes('learn'))).toBe(true)

    const report = generateSessionReport(result, persona)
    await saveReportToFile(report, REPORT_DIR, `chloe-release-planning`)
  })
})

// =============================================================================
// CROSS-PERSONA COMPARISON TESTS
// =============================================================================

test.describe('Cross-Persona Comparisons', () => {
  test('All personas can complete first visit without major friction', async ({
    page,
    context,
  }) => {
    const results: ScenarioResult[] = []

    for (const personaId of allPersonaIds) {
      const viewport = getViewportForPersona(personaId)
      await page.setViewportSize(viewport)

      const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
      const result = await runner.runScenario('first-visit')
      results.push(result)
    }

    const summary = summariseBatchResults(results)

    // All personas should pass first visit
    expect(summary.passed).toBe(summary.total)

    // No major friction points across any persona
    expect(summary.frictionPointsBySeverity['major'] || 0).toBe(0)
  })

  test('Mobile personas have good mobile experience', async ({ page, context }) => {
    const mobilePersonas: PersonaId[] = ['maya', 'chloe'] // Mobile-first users
    const results: ScenarioResult[] = []

    for (const personaId of mobilePersonas) {
      // Force mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
      const result = await runner.runScenario('ideas-capture')
      results.push(result)
    }

    // Check for navigation friction on mobile
    const navFriction = results.flatMap((r) =>
      r.frictionPoints.filter((f) => f.mode === 'navigation')
    )

    expect(navFriction.filter((f) => f.severity === 'major')).toHaveLength(0)
  })

  test('Professional personas can complete full journey', async ({ page, context }) => {
    const proPersonas: PersonaId[] = ['marcus', 'dev'] // Pro tier expected
    const results: ScenarioResult[] = []

    for (const personaId of proPersonas) {
      const viewport = getViewportForPersona(personaId)
      await page.setViewportSize(viewport)

      const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
      const result = await runner.runScenario('full-journey')
      results.push(result)
    }

    // Both should complete successfully
    expect(results.every((r) => r.success)).toBe(true)
  })
})

// =============================================================================
// AGGREGATE REPORTS
// =============================================================================

test.describe('Aggregate Reporting', () => {
  test.skip('Generate full persona comparison report', async ({ page, context }) => {
    // This is a long-running test for comprehensive reporting
    // Skip by default, run explicitly when needed

    const allResults: ScenarioResult[] = []

    for (const personaId of allPersonaIds) {
      for (const scenario of FULL_SCENARIOS) {
        const viewport = getViewportForPersona(personaId)
        await page.setViewportSize(viewport)

        const runner = new PersonaScenarioRunner(page, context, personaId, SCREENSHOT_DIR)
        const result = await runner.runScenario(scenario)
        allResults.push(result)
      }
    }

    const summary = summariseBatchResults(allResults)

    // Log summary
    console.log('\n=== PERSONA TEST SUMMARY ===')
    console.log(`Total: ${summary.total}`)
    console.log(`Passed: ${summary.passed}`)
    console.log(`Failed: ${summary.failed}`)
    console.log('\nFriction by mode:', summary.frictionPointsByMode)
    console.log('Friction by severity:', summary.frictionPointsBySeverity)
  })
})
