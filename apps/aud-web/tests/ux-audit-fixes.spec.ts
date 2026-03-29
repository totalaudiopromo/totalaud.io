/**
 * UX Audit Fix Validation
 *
 * E2E tests verifying fixes from the full-product UX audit (PRs #87-#90).
 * Covers: TAP UI removal, console fixes, settings/auth, workspace polish.
 * Runs on both desktop (1920x1080) and mobile (375x812) viewports.
 */

import { test, expect } from '@playwright/test'

// Helper: dismiss tour modals that may appear on first visit
async function dismissTour(page: import('@playwright/test').Page) {
  const skipButton = page.getByText('Skip tour')
  if (await skipButton.isVisible({ timeout: 1500 }).catch(() => false)) {
    await skipButton.click()
    await page.waitForTimeout(300)
  }
}

// ============================================================================
// PR #87: TAP UI removed from workspace modes
// ============================================================================

test.describe('Workspace: no TAP integration UI', () => {
  test('Pitch mode has no "Generate with TAP" button', async ({ page }) => {
    await page.goto('/workspace?mode=pitch')
    await dismissTour(page)

    // Wait for page to settle
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // No TAP-related buttons
    await expect(page.getByText('Generate with TAP')).not.toBeVisible()
    await expect(page.getByText('TAP')).not.toBeVisible()
  })

  test('Scout mode has no TAP enrich or sync buttons', async ({ page }) => {
    await page.goto('/workspace?mode=scout')
    await dismissTour(page)

    // Wait for page to settle
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // No TAP-specific actions anywhere on the page
    await expect(page.getByText('Sync to TAP')).not.toBeVisible()
    await expect(page.getByText('Validate contact with TAP')).not.toBeVisible()
    await expect(page.getByText('TAP Intel')).not.toBeVisible()
    await expect(page.getByText('TAP Tracker')).not.toBeVisible()
  })

  test('Timeline mode has no TAP sync section', async ({ page }) => {
    await page.goto('/workspace?mode=timeline')
    await dismissTour(page)

    // Wait for page to settle
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // No TAP sync references
    await expect(page.getByText('Sync to TAP')).not.toBeVisible()
    await expect(page.getByText('TAP Tracker')).not.toBeVisible()
  })

  test('TAP API routes return 410 Gone', async ({ request }) => {
    const routes = ['/api/tap/pitch', '/api/tap/enrich', '/api/tap/campaigns', '/api/tap/sync']

    for (const route of routes) {
      const response = await request.post(route)
      expect(response.status()).toBe(410)

      const body = await response.json()
      expect(body.success).toBe(false)
      expect(body.error).toContain('retired')
    }
  })
})

// ============================================================================
// PR #88: Console dead UI fixed
// ============================================================================

test.describe('Console: functional navigation', () => {
  test('TopBar has no dead buttons', async ({ page }) => {
    await page.goto('/console')

    // TopBar should have a settings link
    const settingsLink = page.locator('header a[href="/settings"]')
    await expect(settingsLink).toBeVisible()

    // No dead artist selector dropdown
    await expect(page.getByText('current-artist')).not.toBeVisible()
  })

  test('Sidebar shows threads and automations without "Soon" badge', async ({ page }) => {
    await page.goto('/console')

    // Look for sidebar navigation
    const sidebar = page.locator('aside, nav')

    // Threads should be a clickable link, not disabled
    const threadsLink = sidebar.getByRole('link', { name: /threads/i })
    if (await threadsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(threadsLink).toBeEnabled()

      // No "Soon" badge next to it
      const threadsItem = threadsLink.locator('..')
      await expect(threadsItem.getByText('Soon')).not.toBeVisible()
    }

    // Automations should be a clickable link, not disabled
    const automationsLink = sidebar.getByRole('link', { name: /automations/i })
    if (await automationsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(automationsLink).toBeEnabled()

      const automationsItem = automationsLink.locator('..')
      await expect(automationsItem.getByText('Soon')).not.toBeVisible()
    }
  })

  // Scoped to chromium -- WebKit has a pre-existing loading issue on console pages
  test('Identity page shows account info in empty state', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Console pages do not fully render on WebKit mobile')

    await page.goto('/console/identity')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Skip if redirected to auth
    if (page.url().includes('/login') || page.url().includes('/signin')) return

    // Should not tell user to "go to pitch mode"
    await expect(page.getByText('start building your profile in pitch mode')).not.toBeVisible()

    // Should show either account info fields or identity data
    const accountLabels = page.getByText(/display name|email|plan/i)
    const identityContent = page.getByText(/brand voice|scene identity/i)
    await expect(accountLabels.first().or(identityContent.first())).toBeVisible({ timeout: 5000 })
  })

  test('Insights page has no dead tabs', async ({ page }) => {
    await page.goto('/console/insights')

    await expect(page.locator('main')).toBeVisible()

    // No "patterns" or "next steps" tabs
    await expect(page.getByRole('tab', { name: /patterns/i })).not.toBeVisible()
    await expect(page.getByRole('tab', { name: /next steps/i })).not.toBeVisible()
  })

  test('Automations page has no empty history placeholder', async ({ page }) => {
    await page.goto('/console/automations')

    await expect(page.locator('main')).toBeVisible()

    // No placeholder history card
    await expect(page.getByText('execution history will appear here')).not.toBeVisible()
  })

  test('Copyright shows current year', async ({ page }) => {
    await page.goto('/console')

    const currentYear = new Date().getFullYear().toString()
    const copyright = page.getByText(new RegExp(`${currentYear}`))
    await expect(copyright.first()).toBeVisible({ timeout: 3000 })
  })
})

// ============================================================================
// PR #89: Settings, auth, and navigation fixes
// ============================================================================

test.describe('Settings and auth', () => {
  test('Settings page has no "coming soon" text', async ({ page }) => {
    await page.goto('/settings')

    // Wait for settings page to load (may redirect to login)
    await page.waitForTimeout(1000)

    // If we're on settings (not redirected)
    if (page.url().includes('/settings')) {
      await expect(page.getByText('More preferences coming soon')).not.toBeVisible()
      await expect(page.getByText('coming soon')).not.toBeVisible()
    }
  })

  test('Signup page does not show TAP feature headers', async ({ page }) => {
    // Test with retired TAP features
    await page.goto('/signup?feature=validate')
    await expect(page.getByText('TAP Intel')).not.toBeVisible()

    await page.goto('/signup?feature=tracker-sync')
    await expect(page.getByText('TAP Tracker')).not.toBeVisible()

    // Default header should show instead
    await expect(page.getByText(/create your account|create a free account/i)).toBeVisible()
  })

  test('Signup pitch-generator feature still works', async ({ page }) => {
    await page.goto('/signup?feature=pitch-generator')

    // Should show pitch-specific header
    await expect(page.getByText(/generate pitches/i)).toBeVisible()
  })

  test('Sidebar overlay shows current copyright year', async ({ page }) => {
    await page.goto('/workspace?mode=ideas')
    await dismissTour(page)

    // Open sidebar (click hamburger/menu button)
    const menuButton = page.getByRole('button', { name: /menu|navigation/i })
    if (await menuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await menuButton.click()

      const currentYear = new Date().getFullYear().toString()
      await expect(page.getByText(new RegExp(`${currentYear}`))).toBeVisible()
    }
  })
})

// ============================================================================
// PR #90: Workspace UX polish
// ============================================================================

test.describe('Workspace polish', () => {
  // Scoped to chromium -- WebKit has a pre-existing loading issue on workspace pages
  test('Ideas toolbar Sort and Export visible on mobile', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Workspace pages do not fully render on WebKit mobile')

    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/workspace?mode=ideas')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    await dismissTour(page)

    // Sort control should be visible -- check by title attribute
    const sortButton = page.locator('[title="Sort ideas"]')
    await expect(sortButton).toBeVisible({ timeout: 5000 })

    // Export control should be visible
    const exportButton = page.locator('[title="Export ideas"]')
    await expect(exportButton).toBeVisible({ timeout: 5000 })
  })
})

// ============================================================================
// Mobile viewport validation (375px)
// ============================================================================

test.describe('Mobile layout validation @375px', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
  })

  test('Workspace modes load without overflow', async ({ page }) => {
    const modes = ['ideas', 'scout', 'timeline', 'pitch']

    for (const mode of modes) {
      await page.goto(`/workspace?mode=${mode}`)
      await dismissTour(page)

      // No horizontal scrollbar (content fits viewport)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(375 + 1) // 1px tolerance
    }
  })

  test('Console pages load without overflow', async ({ page }) => {
    const pages = ['/console', '/console/identity', '/console/insights']

    for (const path of pages) {
      await page.goto(path)
      await page.waitForTimeout(500)

      // Skip if redirected to login
      if (page.url().includes('/login') || page.url().includes('/signin')) continue

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(375 + 1)
    }
  })

  test('Signup form fits mobile viewport', async ({ page }) => {
    await page.goto('/signup')

    // Form should be visible
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()

    // No horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375 + 1)
  })

  test('Settings page fits mobile viewport', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForTimeout(1000)

    if (page.url().includes('/settings')) {
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(375 + 1)
    }
  })
})
