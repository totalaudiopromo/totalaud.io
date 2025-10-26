/**
 * Collaboration Tests - Multi-User Session UX
 *
 * Stage 8.5: Shared Session UX & Multi-User QA
 * Tests presence sync, theme changes, Calm Mode broadcast, and performance
 */

import { test, expect, Page, BrowserContext } from '@playwright/test'
import { createTestUser, cleanupTestData, measurePerformance } from '../setup'

// Test configuration
const TEST_CAMPAIGN_ID = 'test-campaign-collab'
const TEST_TIMEOUT = 30000 // 30 seconds

/**
 * Helper: Create authenticated page
 */
async function createAuthenticatedPage(
  context: BrowserContext,
  userEmail: string
): Promise<Page> {
  const page = await context.newPage()

  // Login as test user
  await page.goto('/login')
  await page.fill('[data-testid="email-input"]', userEmail)
  await page.fill('[data-testid="password-input"]', 'test-password-123')
  await page.click('[data-testid="login-button"]')

  // Wait for auth to complete
  await page.waitForURL('/console')

  return page
}

/**
 * Helper: Get avatar count
 */
async function getAvatarCount(page: Page): Promise<number> {
  const avatars = await page.locator('[data-testid^="presence-avatar-"]').count()
  return avatars
}

/**
 * Helper: Measure FPS
 */
async function measureFPS(page: Page, durationMs: number = 2000): Promise<number> {
  return await page.evaluate((duration) => {
    return new Promise<number>((resolve) => {
      let frames = 0
      let lastTime = performance.now()

      function countFrame() {
        frames++
        if (performance.now() - lastTime >= duration) {
          const fps = Math.round((frames / duration) * 1000)
          resolve(fps)
        } else {
          requestAnimationFrame(countFrame)
        }
      }

      requestAnimationFrame(countFrame)
    })
  }, durationMs)
}

test.describe('Multi-User Collaboration', () => {
  test.beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestData(TEST_CAMPAIGN_ID)
  })

  test.afterEach(async () => {
    // Clean up test data after each test
    await cleanupTestData(TEST_CAMPAIGN_ID)
  })

  test('5 users join campaign and presence syncs', async ({ browser }) => {
    const users = [
      { email: 'alice@test.com', theme: 'ascii' },
      { email: 'bob@test.com', theme: 'xp' },
      { email: 'charlie@test.com', theme: 'aqua' },
      { email: 'diana@test.com', theme: 'daw' },
      { email: 'eve@test.com', theme: 'analogue' },
    ]

    // Create users and contexts
    const contexts: BrowserContext[] = []
    const pages: Page[] = []

    for (const user of users) {
      await createTestUser(user.email, 'test-password-123')
      const context = await browser.newContext()
      contexts.push(context)

      const page = await createAuthenticatedPage(context, user.email)
      pages.push(page)

      // Navigate to test campaign
      await page.goto(`/console/${TEST_CAMPAIGN_ID}`)
      await page.waitForTimeout(1000) // Wait for presence to connect
    }

    // Verify each user sees 5 avatars (including themselves)
    for (let i = 0; i < pages.length; i++) {
      const count = await getAvatarCount(pages[i])
      expect(count).toBe(5)
      console.log(`User ${i + 1} sees ${count} avatars ✓`)
    }

    // Measure presence sync latency
    // Alice changes theme → others should see update
    const startTime = Date.now()
    await pages[0].click('[data-testid="theme-selector"]')
    await pages[0].click('[data-testid="theme-xp"]')

    // Wait for Bob to see Alice's new theme
    await pages[1].waitForSelector('[data-testid="presence-avatar-alice"][data-theme="xp"]', {
      timeout: 1000,
    })
    const latency = Date.now() - startTime

    expect(latency).toBeLessThan(250) // Target: < 250ms
    console.log(`Presence sync latency: ${latency}ms ✓`)

    // Cleanup
    for (const context of contexts) {
      await context.close()
    }
  })

  test('Theme changes sync to all users < 150ms', async ({ browser }) => {
    const alice = await createTestUser('alice@test.com', 'test-password-123')
    const bob = await createTestUser('bob@test.com', 'test-password-123')

    const contextAlice = await browser.newContext()
    const contextBob = await browser.newContext()

    const pageAlice = await createAuthenticatedPage(contextAlice, 'alice@test.com')
    const pageBob = await createAuthenticatedPage(contextBob, 'bob@test.com')

    await pageAlice.goto(`/console/${TEST_CAMPAIGN_ID}`)
    await pageBob.goto(`/console/${TEST_CAMPAIGN_ID}`)
    await pageAlice.waitForTimeout(1000)

    // Alice changes theme
    const startTime = Date.now()
    await pageAlice.click('[data-testid="theme-selector"]')
    await pageAlice.click('[data-testid="theme-daw"]')

    // Bob sees Alice's avatar border change to orange (DAW color)
    await pageBob.waitForFunction(
      () => {
        const avatar = document.querySelector('[data-testid="presence-avatar-alice"]')
        if (!avatar) return false
        const borderColor = window.getComputedStyle(avatar).borderColor
        // DAW theme color: #FF6B35 → rgb(255, 107, 53)
        return borderColor.includes('255') && borderColor.includes('107')
      },
      { timeout: 500 }
    )

    const latency = Date.now() - startTime
    expect(latency).toBeLessThan(150) // Target: < 150ms
    console.log(`Theme sync latency: ${latency}ms ✓`)

    await contextAlice.close()
    await contextBob.close()
  })

  test('Calm Mode broadcast affects all users', async ({ browser }) => {
    const alice = await createTestUser('alice@test.com', 'test-password-123')
    const bob = await createTestUser('bob@test.com', 'test-password-123')

    const contextAlice = await browser.newContext()
    const contextBob = await browser.newContext()

    const pageAlice = await createAuthenticatedPage(contextAlice, 'alice@test.com')
    const pageBob = await createAuthenticatedPage(contextBob, 'bob@test.com')

    await pageAlice.goto(`/console/${TEST_CAMPAIGN_ID}`)
    await pageBob.goto(`/console/${TEST_CAMPAIGN_ID}`)
    await pageAlice.waitForTimeout(1000)

    // Verify Bob doesn't have .reduce-motion class initially
    const initialReducedMotion = await pageBob.evaluate(() => {
      return document.documentElement.classList.contains('reduce-motion')
    })
    expect(initialReducedMotion).toBe(false)

    // Alice enables Calm Mode
    await pageAlice.click('[data-testid="calm-mode-toggle"]')
    await pageAlice.waitForTimeout(500)

    // Bob should now have .reduce-motion class
    await pageBob.waitForFunction(
      () => document.documentElement.classList.contains('reduce-motion'),
      { timeout: 1000 }
    )

    const hasReducedMotion = await pageBob.evaluate(() => {
      return document.documentElement.classList.contains('reduce-motion')
    })
    expect(hasReducedMotion).toBe(true)
    console.log('Global Calm Mode broadcast: ✓')

    // Verify CSS animations are reduced
    const animationDuration = await pageBob.evaluate(() => {
      const el = document.querySelector('[data-testid="presence-avatar-alice"]')
      if (!el) return null
      return window.getComputedStyle(el).animationDuration
    })
    expect(animationDuration).toBe('0.01ms') // Reduced motion
    console.log('Animation duration reduced: ✓')

    await contextAlice.close()
    await contextBob.close()
  })

  test('FPS maintains >= 55 with 5 concurrent users', async ({ browser }) => {
    const users = [
      'alice@test.com',
      'bob@test.com',
      'charlie@test.com',
      'diana@test.com',
      'eve@test.com',
    ]

    const contexts: BrowserContext[] = []
    const pages: Page[] = []

    for (const email of users) {
      await createTestUser(email, 'test-password-123')
      const context = await browser.newContext()
      contexts.push(context)

      const page = await createAuthenticatedPage(context, email)
      pages.push(page)

      await page.goto(`/console/${TEST_CAMPAIGN_ID}`)
      await page.waitForTimeout(1000)
    }

    // Measure FPS on Alice's page while all 5 users are active
    const fps = await measureFPS(pages[0], 2000) // 2 second sample

    expect(fps).toBeGreaterThanOrEqual(55) // Target: >= 55 FPS
    console.log(`FPS with 5 users: ${fps} ✓`)

    // Cleanup
    for (const context of contexts) {
      await context.close()
    }
  })

  test('User leave triggers avatar removal', async ({ browser }) => {
    const alice = await createTestUser('alice@test.com', 'test-password-123')
    const bob = await createTestUser('bob@test.com', 'test-password-123')

    const contextAlice = await browser.newContext()
    const contextBob = await browser.newContext()

    const pageAlice = await createAuthenticatedPage(contextAlice, 'alice@test.com')
    const pageBob = await createAuthenticatedPage(contextBob, 'bob@test.com')

    await pageAlice.goto(`/console/${TEST_CAMPAIGN_ID}`)
    await pageBob.goto(`/console/${TEST_CAMPAIGN_ID}`)
    await pageAlice.waitForTimeout(1000)

    // Verify Bob sees Alice's avatar
    const initialCount = await getAvatarCount(pageBob)
    expect(initialCount).toBe(2) // Alice + Bob

    // Alice closes her page (leave)
    await contextAlice.close()

    // Bob should see avatar count decrease after 30s timeout
    // (For testing, we'll check after 5s - in production it's 30s)
    await pageBob.waitForTimeout(5000)

    const finalCount = await getAvatarCount(pageBob)
    expect(finalCount).toBe(1) // Only Bob remains
    console.log('Avatar removal on leave: ✓')

    await contextBob.close()
  })

  test('Collaborator actions show visual accents in ActivityStream', async ({ browser }) => {
    const alice = await createTestUser('alice@test.com', 'test-password-123')
    const bob = await createTestUser('bob@test.com', 'test-password-123')

    const contextAlice = await browser.newContext()
    const contextBob = await browser.newContext()

    const pageAlice = await createAuthenticatedPage(contextAlice, 'alice@test.com')
    const pageBob = await createAuthenticatedPage(contextBob, 'bob@test.com')

    await pageAlice.goto(`/console/${TEST_CAMPAIGN_ID}`)
    await pageBob.goto(`/console/${TEST_CAMPAIGN_ID}`)
    await pageAlice.waitForTimeout(1000)

    // Alice spawns an agent
    await pageAlice.click('[data-testid="spawn-agent-button"]')
    await pageAlice.fill('[data-testid="agent-name-input"]', 'radio-scout')
    await pageAlice.click('[data-testid="confirm-spawn"]')

    // Wait for event to appear in Bob's ActivityStream
    await pageBob.waitForSelector('[data-testid="activity-event-agent"]', {
      timeout: 2000,
    })

    // Verify event has collaborator border (Alice's theme color)
    const hasCollaboratorBorder = await pageBob.evaluate(() => {
      const event = document.querySelector('[data-testid="activity-event-agent"]')
      if (!event) return false
      const style = window.getComputedStyle(event)
      const borderLeft = style.borderLeftWidth
      return borderLeft === '3px' // Other user's action → 3px border-left
    })
    expect(hasCollaboratorBorder).toBe(true)
    console.log('Collaborator visual accent: ✓')

    // Verify tooltip shows Alice's name
    const tooltip = await pageBob.getAttribute(
      '[data-testid="activity-event-agent"]',
      'title'
    )
    expect(tooltip).toContain('alice')
    expect(tooltip).toContain('triggered this action')
    console.log('Collaborator tooltip: ✓')

    await contextAlice.close()
    await contextBob.close()
  })

  test('Presence update latency < 250ms under network conditions', async ({ browser }) => {
    const alice = await createTestUser('alice@test.com', 'test-password-123')
    const bob = await createTestUser('bob@test.com', 'test-password-123')

    // Create contexts with throttled network (simulating 3G)
    const contextAlice = await browser.newContext()
    const contextBob = await browser.newContext()

    await contextBob.route('**/*', (route) => {
      // Add 100ms latency
      setTimeout(() => route.continue(), 100)
    })

    const pageAlice = await createAuthenticatedPage(contextAlice, 'alice@test.com')
    const pageBob = await createAuthenticatedPage(contextBob, 'bob@test.com')

    await pageAlice.goto(`/console/${TEST_CAMPAIGN_ID}`)
    await pageBob.goto(`/console/${TEST_CAMPAIGN_ID}`)
    await pageAlice.waitForTimeout(1000)

    // Measure presence update with network latency
    const startTime = Date.now()
    await pageAlice.click('[data-testid="mode-selector"]')
    await pageAlice.click('[data-testid="mode-track"]')

    await pageBob.waitForSelector('[data-testid="presence-avatar-alice"][data-mode="track"]', {
      timeout: 1000,
    })
    const latency = Date.now() - startTime

    // With 100ms network latency, should still be < 250ms total
    expect(latency).toBeLessThan(250)
    console.log(`Presence latency with network delay: ${latency}ms ✓`)

    await contextAlice.close()
    await contextBob.close()
  })

  test('Avatar join animation completes in 120ms', async ({ browser, page }) => {
    const alice = await createTestUser('alice@test.com', 'test-password-123')
    const bob = await createTestUser('bob@test.com', 'test-password-123')

    // Bob already in campaign
    const contextBob = await browser.newContext()
    const pageBob = await createAuthenticatedPage(contextBob, 'bob@test.com')
    await pageBob.goto(`/console/${TEST_CAMPAIGN_ID}`)
    await pageBob.waitForTimeout(1000)

    // Alice joins
    const contextAlice = await browser.newContext()
    const pageAlice = await createAuthenticatedPage(contextAlice, 'alice@test.com')

    const startTime = Date.now()
    await pageAlice.goto(`/console/${TEST_CAMPAIGN_ID}`)

    // Wait for Alice's avatar to appear on Bob's page
    await pageBob.waitForSelector('[data-testid="presence-avatar-alice"]', {
      state: 'visible',
      timeout: 1000,
    })

    // Measure opacity transition (fade in animation)
    const animationDuration = await pageBob.evaluate(() => {
      const avatar = document.querySelector('[data-testid="presence-avatar-alice"]')
      if (!avatar) return null
      const style = window.getComputedStyle(avatar)
      return parseFloat(style.transitionDuration) * 1000 // Convert to ms
    })

    expect(animationDuration).toBeLessThanOrEqual(120) // Target: 120ms
    console.log(`Avatar join animation: ${animationDuration}ms ✓`)

    await contextAlice.close()
    await contextBob.close()
  })

  test('Action glow animation triggers on user action', async ({ browser }) => {
    const alice = await createTestUser('alice@test.com', 'test-password-123')

    const contextAlice = await browser.newContext()
    const pageAlice = await createAuthenticatedPage(contextAlice, 'alice@test.com')

    await pageAlice.goto(`/console/${TEST_CAMPAIGN_ID}`)
    await pageAlice.waitForTimeout(1000)

    // Trigger action (spawn agent)
    await pageAlice.click('[data-testid="spawn-agent-button"]')

    // Check if Alice's avatar has glow effect
    const hasGlow = await pageAlice.evaluate(() => {
      const avatar = document.querySelector('[data-testid="presence-avatar-alice"]')
      if (!avatar) return false
      const style = window.getComputedStyle(avatar)
      const boxShadow = style.boxShadow
      // Glow effect should have larger blur radius (> 10px)
      return boxShadow.includes('20px') || boxShadow.includes('40px')
    })

    expect(hasGlow).toBe(true)
    console.log('Action glow animation: ✓')

    // Wait for glow to fade (1.5s duration)
    await pageAlice.waitForTimeout(1500)

    // Verify glow has faded
    const glowFaded = await pageAlice.evaluate(() => {
      const avatar = document.querySelector('[data-testid="presence-avatar-alice"]')
      if (!avatar) return false
      const style = window.getComputedStyle(avatar)
      const boxShadow = style.boxShadow
      // Should return to default (8px blur)
      return !boxShadow.includes('20px') && !boxShadow.includes('40px')
    })

    expect(glowFaded).toBe(true)
    console.log('Action glow fade: ✓')

    await contextAlice.close()
  })

  test('Maximum 5 avatars visible, rest under "+N more"', async ({ browser }) => {
    const users = []
    for (let i = 1; i <= 8; i++) {
      users.push(`user${i}@test.com`)
    }

    const contexts: BrowserContext[] = []
    const pages: Page[] = []

    for (const email of users) {
      await createTestUser(email, 'test-password-123')
      const context = await browser.newContext()
      contexts.push(context)

      const page = await createAuthenticatedPage(context, email)
      pages.push(page)

      await page.goto(`/console/${TEST_CAMPAIGN_ID}`)
      await page.waitForTimeout(1000)
    }

    // Check first user's view
    const visibleAvatars = await pages[0].locator('[data-testid^="presence-avatar-"]').count()
    expect(visibleAvatars).toBeLessThanOrEqual(5) // Max 5 visible
    console.log(`Visible avatars: ${visibleAvatars} ✓`)

    // Check if "+N more" button exists
    const hasMoreButton = await pages[0].locator('[data-testid="show-more-avatars"]').isVisible()
    expect(hasMoreButton).toBe(true)

    // Check button text
    const moreButtonText = await pages[0].locator('[data-testid="show-more-avatars"]').textContent()
    expect(moreButtonText).toContain('+3') // 8 total - 5 visible = 3 more
    console.log(`More button text: ${moreButtonText} ✓`)

    // Cleanup
    for (const context of contexts) {
      await context.close()
    }
  })
})

test.describe('Performance & Accessibility', () => {
  test('No accessibility regressions with collaboration', async ({ browser }) => {
    const alice = await createTestUser('alice@test.com', 'test-password-123')
    const bob = await createTestUser('bob@test.com', 'test-password-123')

    const contextBob = await browser.newContext()
    const pageBob = await createAuthenticatedPage(contextBob, 'bob@test.com')

    await pageBob.goto(`/console/${TEST_CAMPAIGN_ID}`)
    await pageBob.waitForTimeout(1000)

    // Check ARIA labels on avatars
    const ariaLabel = await pageBob.getAttribute(
      '[data-testid="presence-avatar-bob"]',
      'aria-label'
    )
    expect(ariaLabel).toContain('bob')
    console.log('ARIA label present: ✓')

    // Check keyboard navigation
    await pageBob.keyboard.press('Tab')
    const focusedElement = await pageBob.evaluate(() => document.activeElement?.getAttribute('data-testid'))
    expect(focusedElement).toContain('presence-avatar')
    console.log('Keyboard navigation: ✓')

    // Check focus indicator
    const hasFocusRing = await pageBob.evaluate(() => {
      const avatar = document.querySelector('[data-testid="presence-avatar-bob"]')
      if (!avatar) return false
      const style = window.getComputedStyle(avatar)
      return style.outlineWidth !== '0px' && style.outlineStyle !== 'none'
    })
    expect(hasFocusRing).toBe(true)
    console.log('Focus indicator: ✓')

    await contextBob.close()
  })

  test('respects prefers-reduced-motion', async ({ browser }) => {
    // Create context with reduced motion preference
    const context = await browser.newContext({
      reducedMotion: 'reduce',
    })

    const alice = await createTestUser('alice@test.com', 'test-password-123')
    const page = await createAuthenticatedPage(context, 'alice@test.com')

    await page.goto(`/console/${TEST_CAMPAIGN_ID}`)
    await page.waitForTimeout(1000)

    // Check if animations are reduced
    const animationDuration = await page.evaluate(() => {
      const avatar = document.querySelector('[data-testid="presence-avatar-alice"]')
      if (!avatar) return null
      const style = window.getComputedStyle(avatar)
      return style.animationDuration
    })

    expect(animationDuration).toBe('0.01ms') // Reduced motion
    console.log('Reduced motion respected: ✓')

    await context.close()
  })
})
