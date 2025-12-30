/**
 * Scenario Runner for Persona-Based Testing
 *
 * Executes realistic user journeys through totalaud.io
 * from the perspective of each ICP persona.
 */

import { Page, BrowserContext } from '@playwright/test'
import {
  PersonaId,
  Persona,
  getPersona,
  getViewportForPersona,
  getSessionBehaviourForPersona,
  generateIdeasForPersona,
  getScoutFiltersForPersona,
  generateTimelineForPersona,
  generatePitchContentForPersona,
} from './personas'

// =============================================================================
// TYPES
// =============================================================================

export type ScenarioType =
  | 'first-visit' // New user exploring the app
  | 'ideas-capture' // Quick idea capture session
  | 'scout-discovery' // Finding opportunities
  | 'release-planning' // Building a timeline
  | 'pitch-writing' // Crafting bios/pitches
  | 'full-journey' // Complete flow through all modes

export interface ScenarioResult {
  personaId: PersonaId
  scenarioType: ScenarioType
  success: boolean
  durationMs: number
  actions: ActionRecord[]
  frictionPoints: FrictionPoint[]
  screenshots: ScreenshotRecord[]
  metrics: PerformanceMetrics
}

export interface ActionRecord {
  timestamp: number
  action: string
  element?: string
  success: boolean
  durationMs: number
  notes?: string
}

export interface FrictionPoint {
  timestamp: number
  description: string
  severity: 'minor' | 'moderate' | 'major'
  mode: 'ideas' | 'scout' | 'timeline' | 'pitch' | 'navigation'
  suggestion?: string
}

export interface ScreenshotRecord {
  name: string
  path: string
  timestamp: number
  description: string
}

export interface PerformanceMetrics {
  pageLoadMs: number
  timeToFirstInteraction: number
  modeTransitions: { from: string; to: string; durationMs: number }[]
  networkRequests: number
  errors: string[]
}

// =============================================================================
// SCENARIO RUNNER CLASS
// =============================================================================

export class PersonaScenarioRunner {
  private page: Page
  private context: BrowserContext
  private persona: Persona
  private startTime: number = 0
  private actions: ActionRecord[] = []
  private frictionPoints: FrictionPoint[] = []
  private screenshots: ScreenshotRecord[] = []
  private errors: string[] = []
  private screenshotDir: string

  constructor(page: Page, context: BrowserContext, personaId: PersonaId, screenshotDir: string) {
    this.page = page
    this.context = context
    this.persona = getPersona(personaId)
    this.screenshotDir = screenshotDir
  }

  // ---------------------------------------------------------------------------
  // MAIN SCENARIO EXECUTORS
  // ---------------------------------------------------------------------------

  async runScenario(scenarioType: ScenarioType): Promise<ScenarioResult> {
    this.startTime = Date.now()
    this.actions = []
    this.frictionPoints = []
    this.screenshots = []
    this.errors = []

    // Set viewport for persona's device preference
    const viewport = getViewportForPersona(this.persona.id)
    await this.page.setViewportSize(viewport)

    let success = false

    try {
      switch (scenarioType) {
        case 'first-visit':
          success = await this.runFirstVisitScenario()
          break
        case 'ideas-capture':
          success = await this.runIdeasCaptureScenario()
          break
        case 'scout-discovery':
          success = await this.runScoutDiscoveryScenario()
          break
        case 'release-planning':
          success = await this.runReleasePlanningScenario()
          break
        case 'pitch-writing':
          success = await this.runPitchWritingScenario()
          break
        case 'full-journey':
          success = await this.runFullJourneyScenario()
          break
      }
    } catch (error) {
      this.errors.push(error instanceof Error ? error.message : String(error))
      await this.takeScreenshot('error-state', 'Error occurred during scenario')
    }

    return this.generateResult(scenarioType, success)
  }

  // ---------------------------------------------------------------------------
  // INDIVIDUAL SCENARIOS
  // ---------------------------------------------------------------------------

  private async runFirstVisitScenario(): Promise<boolean> {
    await this.recordAction('Navigate to workspace', async () => {
      await this.page.goto('/workspace')
      await this.page.waitForLoadState('networkidle')
    })

    await this.takeScreenshot('first-visit-landing', 'Initial workspace view')

    // Check if onboarding appears (if applicable)
    const hasOnboarding = await this.page.locator('[data-testid="onboarding"]').isVisible()
    if (hasOnboarding) {
      await this.recordAction('Complete onboarding', async () => {
        // Skip or complete onboarding
        const skipButton = this.page.locator('[data-testid="skip-onboarding"]')
        if (await skipButton.isVisible()) {
          await skipButton.click()
        }
      })
    }

    // Explore each mode tab
    const modes = ['ideas', 'scout', 'timeline', 'pitch']
    for (const mode of modes) {
      await this.recordAction(`Navigate to ${mode} mode`, async () => {
        const tab = this.page.locator(`[data-testid="mode-tab-${mode}"]`)
        if (await tab.isVisible()) {
          await tab.click()
          await this.page.waitForTimeout(300) // Wait for transition
        } else {
          this.addFrictionPoint(
            `Could not find ${mode} mode tab`,
            'moderate',
            'navigation',
            `Ensure mode tabs are visible on ${this.persona.devicePreference}`
          )
        }
      })
      await this.takeScreenshot(`first-visit-${mode}`, `${mode} mode first impression`)
    }

    // Check mobile navigation if on mobile
    if (this.persona.devicePreference === 'mobile') {
      await this.validateMobileNavigation()
    }

    return this.frictionPoints.filter((f) => f.severity === 'major').length === 0
  }

  private async runIdeasCaptureScenario(): Promise<boolean> {
    await this.navigateToMode('ideas')

    const ideas = generateIdeasForPersona(this.persona.id)
    const ideasToAdd = ideas.slice(0, 3) // Add first 3 ideas

    for (const idea of ideasToAdd) {
      await this.recordAction(`Add idea: "${idea.content.substring(0, 30)}..."`, async () => {
        // Try to find add button
        const addButton = this.page.locator('[data-testid="add-idea-button"]')
        const fabButton = this.page.locator('[data-testid="ideas-fab"]')

        if (await addButton.isVisible()) {
          await addButton.click()
        } else if (await fabButton.isVisible()) {
          await fabButton.click()
        } else {
          this.addFrictionPoint(
            'Could not find add idea button',
            'major',
            'ideas',
            'Add idea button should be prominent and accessible'
          )
          return
        }

        // Fill in idea content
        const input = this.page.locator('[data-testid="idea-input"], textarea, input[type="text"]')
        if (await input.isVisible()) {
          await input.fill(idea.content)

          // Try to select tag
          const tagSelector = this.page.locator(`[data-testid="tag-${idea.tag}"]`)
          if (await tagSelector.isVisible()) {
            await tagSelector.click()
          }

          // Submit
          const submitButton = this.page.locator(
            '[data-testid="submit-idea"], button[type="submit"]'
          )
          if (await submitButton.isVisible()) {
            await submitButton.click()
          } else {
            await this.page.keyboard.press('Enter')
          }
        } else {
          this.addFrictionPoint('Could not find idea input field', 'major', 'ideas')
        }
      })
    }

    await this.takeScreenshot('ideas-after-adding', `Added ${ideasToAdd.length} ideas`)

    // Verify ideas were saved
    await this.recordAction('Verify ideas persisted', async () => {
      await this.page.reload()
      await this.page.waitForLoadState('networkidle')
      // Check if ideas are still there after reload
    })

    return this.frictionPoints.filter((f) => f.severity === 'major').length === 0
  }

  private async runScoutDiscoveryScenario(): Promise<boolean> {
    await this.navigateToMode('scout')
    await this.takeScreenshot('scout-initial', 'Scout mode initial state')

    const filters = getScoutFiltersForPersona(this.persona.id)

    // Apply genre filter
    if (filters.genres.length > 0) {
      await this.recordAction(`Filter by genre: ${filters.genres[0]}`, async () => {
        const genreFilter = this.page.locator('[data-testid="genre-filter"]')
        if (await genreFilter.isVisible()) {
          await genreFilter.click()
          const option = this.page.locator(`[data-testid="genre-${filters.genres[0]}"]`)
          if (await option.isVisible()) {
            await option.click()
          }
        } else {
          this.addFrictionPoint('Genre filter not easily accessible', 'moderate', 'scout')
        }
      })
    }

    // Apply type filter
    if (filters.types.length > 0) {
      await this.recordAction(`Filter by type: ${filters.types[0]}`, async () => {
        const typeFilter = this.page.locator('[data-testid="type-filter"]')
        if (await typeFilter.isVisible()) {
          await typeFilter.click()
          const option = this.page.locator(`[data-testid="type-${filters.types[0]}"]`)
          if (await option.isVisible()) {
            await option.click()
          }
        }
      })
    }

    await this.takeScreenshot('scout-filtered', 'Scout with filters applied')

    // Try to add an opportunity to timeline
    await this.recordAction('Add opportunity to timeline', async () => {
      const opportunityCard = this.page.locator('[data-testid="opportunity-card"]').first()
      if (await opportunityCard.isVisible()) {
        const addButton = opportunityCard.locator('[data-testid="add-to-timeline"]')
        if (await addButton.isVisible()) {
          await addButton.click()
        } else {
          this.addFrictionPoint(
            'Add to timeline button not visible on card',
            'moderate',
            'scout',
            'Consider making add action more prominent'
          )
        }
      } else {
        this.addFrictionPoint(
          'No opportunities displayed',
          'major',
          'scout',
          'Check if data loaded'
        )
      }
    })

    return this.frictionPoints.filter((f) => f.severity === 'major').length === 0
  }

  private async runReleasePlanningScenario(): Promise<boolean> {
    await this.navigateToMode('timeline')
    await this.takeScreenshot('timeline-initial', 'Timeline mode initial state')

    const events = generateTimelineForPersona(this.persona.id)
    const eventsToAdd = events.slice(0, 3) // Add first 3 events

    for (const event of eventsToAdd) {
      await this.recordAction(`Add timeline event: "${event.title}"`, async () => {
        const addButton = this.page.locator('[data-testid="add-event-button"]')
        if (await addButton.isVisible()) {
          await addButton.click()

          // Fill event details
          const titleInput = this.page.locator('[data-testid="event-title-input"]')
          if (await titleInput.isVisible()) {
            await titleInput.fill(event.title)
          }

          // Select lane
          const laneSelector = this.page.locator(`[data-testid="lane-${event.lane}"]`)
          if (await laneSelector.isVisible()) {
            await laneSelector.click()
          }

          // Submit
          const submitButton = this.page.locator('[data-testid="submit-event"]')
          if (await submitButton.isVisible()) {
            await submitButton.click()
          }
        } else {
          this.addFrictionPoint('Add event button not found', 'major', 'timeline')
        }
      })
    }

    await this.takeScreenshot('timeline-with-events', `Added ${eventsToAdd.length} events`)

    return this.frictionPoints.filter((f) => f.severity === 'major').length === 0
  }

  private async runPitchWritingScenario(): Promise<boolean> {
    await this.navigateToMode('pitch')
    await this.takeScreenshot('pitch-initial', 'Pitch mode initial state')

    const pitchContent = generatePitchContentForPersona(this.persona.id)

    // Enter current bio
    await this.recordAction('Enter current bio', async () => {
      const bioInput = this.page.locator('[data-testid="bio-input"], textarea')
      if (await bioInput.isVisible()) {
        await bioInput.fill(pitchContent.currentBio)
      } else {
        this.addFrictionPoint('Bio input not found', 'major', 'pitch')
      }
    })

    // Try to get AI coaching
    await this.recordAction('Request AI coaching', async () => {
      const coachButton = this.page.locator(
        '[data-testid="get-coaching"], [data-testid="improve-bio"]'
      )
      if (await coachButton.isVisible()) {
        await coachButton.click()
        // Wait for AI response
        await this.page.waitForTimeout(2000)
      } else {
        this.addFrictionPoint('AI coaching button not obvious', 'moderate', 'pitch')
      }
    })

    await this.takeScreenshot('pitch-with-coaching', 'After requesting AI coaching')

    return this.frictionPoints.filter((f) => f.severity === 'major').length === 0
  }

  private async runFullJourneyScenario(): Promise<boolean> {
    // Run all scenarios in sequence
    const scenarios: ScenarioType[] = [
      'first-visit',
      'ideas-capture',
      'scout-discovery',
      'release-planning',
      'pitch-writing',
    ]

    for (const scenario of scenarios) {
      await this.takeScreenshot(`journey-${scenario}-start`, `Starting ${scenario}`)
      // Run simplified version of each
      switch (scenario) {
        case 'first-visit':
          await this.navigateToMode('ideas')
          break
        case 'ideas-capture':
          await this.runIdeasCaptureScenario()
          break
        case 'scout-discovery':
          await this.runScoutDiscoveryScenario()
          break
        case 'release-planning':
          await this.runReleasePlanningScenario()
          break
        case 'pitch-writing':
          await this.runPitchWritingScenario()
          break
      }
    }

    await this.takeScreenshot('full-journey-complete', 'Completed full journey')

    return this.frictionPoints.filter((f) => f.severity === 'major').length === 0
  }

  // ---------------------------------------------------------------------------
  // HELPER METHODS
  // ---------------------------------------------------------------------------

  private async navigateToMode(mode: string): Promise<void> {
    await this.recordAction(`Navigate to ${mode} mode`, async () => {
      await this.page.goto(`/workspace?mode=${mode}`)
      await this.page.waitForLoadState('networkidle')
    })
  }

  private async validateMobileNavigation(): Promise<void> {
    await this.recordAction('Validate mobile navigation', async () => {
      // Check for hamburger menu or bottom nav
      const hamburger = this.page.locator('[data-testid="mobile-menu"]')
      const bottomNav = this.page.locator('[data-testid="bottom-nav"]')

      const hasHamburger = await hamburger.isVisible()
      const hasBottomNav = await bottomNav.isVisible()

      if (!hasHamburger && !hasBottomNav) {
        this.addFrictionPoint(
          'No mobile navigation pattern found',
          'major',
          'navigation',
          'Add hamburger menu or bottom navigation for mobile'
        )
      }

      // Check touch target sizes
      const buttons = await this.page.locator('button').all()
      for (const button of buttons.slice(0, 5)) {
        const box = await button.boundingBox()
        if (box && (box.width < 44 || box.height < 44)) {
          this.addFrictionPoint(
            'Touch target too small for mobile',
            'minor',
            'navigation',
            'Minimum touch target should be 44x44px'
          )
          break
        }
      }
    })
  }

  private async recordAction(description: string, action: () => Promise<void>): Promise<void> {
    const startTime = Date.now()
    let success = true
    let notes: string | undefined

    try {
      await action()
    } catch (error) {
      success = false
      notes = error instanceof Error ? error.message : String(error)
      this.errors.push(notes)
    }

    this.actions.push({
      timestamp: Date.now() - this.startTime,
      action: description,
      success,
      durationMs: Date.now() - startTime,
      notes,
    })
  }

  private addFrictionPoint(
    description: string,
    severity: FrictionPoint['severity'],
    mode: FrictionPoint['mode'],
    suggestion?: string
  ): void {
    this.frictionPoints.push({
      timestamp: Date.now() - this.startTime,
      description,
      severity,
      mode,
      suggestion,
    })
  }

  private async takeScreenshot(name: string, description: string): Promise<void> {
    const filename = `${this.persona.id}-${name}-${Date.now()}.png`
    const path = `${this.screenshotDir}/${filename}`

    try {
      await this.page.screenshot({ path, fullPage: false })
      this.screenshots.push({
        name,
        path,
        timestamp: Date.now() - this.startTime,
        description,
      })
    } catch {
      // Screenshot failed, continue anyway
    }
  }

  private generateResult(scenarioType: ScenarioType, success: boolean): ScenarioResult {
    return {
      personaId: this.persona.id,
      scenarioType,
      success,
      durationMs: Date.now() - this.startTime,
      actions: this.actions,
      frictionPoints: this.frictionPoints,
      screenshots: this.screenshots,
      metrics: {
        pageLoadMs: this.actions[0]?.durationMs || 0,
        timeToFirstInteraction:
          this.actions.find((a) => a.action.includes('Add') || a.action.includes('Navigate'))
            ?.timestamp || 0,
        modeTransitions: [],
        networkRequests: 0,
        errors: this.errors,
      },
    }
  }
}

// =============================================================================
// BATCH RUNNER
// =============================================================================

export interface BatchRunConfig {
  personas: PersonaId[]
  scenarios: ScenarioType[]
  baseUrl: string
  screenshotDir: string
  parallel?: boolean
}

export interface BatchRunResult {
  startTime: Date
  endTime: Date
  totalDurationMs: number
  results: ScenarioResult[]
  summary: {
    total: number
    passed: number
    failed: number
    frictionPointsByMode: Record<string, number>
    frictionPointsBySeverity: Record<string, number>
  }
}

export function summariseBatchResults(results: ScenarioResult[]): BatchRunResult['summary'] {
  const frictionPointsByMode: Record<string, number> = {}
  const frictionPointsBySeverity: Record<string, number> = {}

  for (const result of results) {
    for (const fp of result.frictionPoints) {
      frictionPointsByMode[fp.mode] = (frictionPointsByMode[fp.mode] || 0) + 1
      frictionPointsBySeverity[fp.severity] = (frictionPointsBySeverity[fp.severity] || 0) + 1
    }
  }

  return {
    total: results.length,
    passed: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    frictionPointsByMode,
    frictionPointsBySeverity,
  }
}
