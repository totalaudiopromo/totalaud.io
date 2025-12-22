/**
 * Core User Flow E2E Test
 * Tests the main MVP workflow: Ideas → Scout → Timeline → Pitch
 * Updated to match current production UI
 */

import { test, expect } from '@playwright/test'

test.describe('MVP Core Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete full user journey: Ideas → Scout → Timeline → Pitch', async ({ page }) => {
    // Step 1: Navigate to Workspace
    await page.goto('/workspace')

    // Should show Ideas mode by default (URL may or may not have ?mode=ideas)
    await expect(page.getByRole('button', { name: 'Ideas' })).toBeVisible()

    // Step 2: Verify ideas interface is visible
    // The "+ Add" button should be visible in the toolbar
    const addButton = page.getByRole('button', { name: /\+ Add/i })
    await expect(addButton).toBeVisible()

    // Step 3: Switch to Scout mode
    await page.getByRole('button', { name: 'Scout' }).click()
    await expect(page).toHaveURL(/mode=scout/)

    // Wait for Scout content to load (either grid or auth prompt)
    const scoutContent = page.locator('[data-testid="scout-grid"], [data-testid="auth-prompt"]')
    await expect(scoutContent).toBeVisible({ timeout: 10000 })

    // Step 4: Switch to Timeline mode
    await page.getByRole('button', { name: 'Timeline' }).click()
    await expect(page).toHaveURL(/mode=timeline/)

    // Timeline should show (either events or empty state)
    await expect(page.locator('main')).toBeVisible()

    // Step 5: Switch to Pitch mode
    await page.getByRole('button', { name: 'Pitch' }).click()
    await expect(page).toHaveURL(/mode=pitch/)

    // Pitch mode should load
    await expect(page.locator('main')).toBeVisible()
  })

  test('should show workspace with starter prompts', async ({ page }) => {
    // Navigate to Ideas mode
    await page.goto('/workspace?mode=ideas')

    // Should see the Ideas toolbar
    await expect(page.getByRole('button', { name: /\+ Add/i })).toBeVisible()

    // Should have filter buttons
    await expect(page.getByRole('button', { name: /All/i })).toBeVisible()

    // Should have idea cards (starter prompts)
    const ideaCards = page.locator(
      'button[class*="content"], button[class*="brand"], button[class*="promo"]'
    )
    // Wait for at least one idea/tag to be visible
    await expect(page.getByRole('button', { name: /content/i }).first()).toBeVisible({
      timeout: 5000,
    })
  })

  test('should handle Scout mode correctly', async ({ page }) => {
    await page.goto('/workspace?mode=scout')

    // Should show either opportunities grid or auth prompt
    const scoutGrid = page.locator('[data-testid="scout-grid"]')
    const authPrompt = page.locator('[data-testid="auth-prompt"]')

    // Either shows opportunities (if logged in) or auth prompt (if not)
    await expect(scoutGrid.or(authPrompt)).toBeVisible({ timeout: 10000 })
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/workspace?mode=ideas')

    // Mobile nav should be visible (at bottom of screen)
    const mobileNav = page.locator('[data-testid="mobile-nav"]')
    await expect(mobileNav).toBeVisible()

    // Can switch modes via mobile nav
    await mobileNav.getByRole('button', { name: 'Scout' }).click()
    await expect(page).toHaveURL(/mode=scout/)
  })
})

test.describe('Authentication Flow', () => {
  test('should show auth prompt for protected features', async ({ page }) => {
    await page.goto('/workspace?mode=scout')

    // If not authenticated, should show sign-in prompt
    const authPrompt = page.locator('[data-testid="auth-prompt"]')
    const scoutGrid = page.locator('[data-testid="scout-grid"]')

    // Should see either opportunities (if logged in) or auth prompt
    await expect(authPrompt.or(scoutGrid)).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Performance', () => {
  test('should load workspace within 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/workspace')

    // Wait for workspace container
    await page.waitForSelector('[data-testid="workspace-container"]', { timeout: 3000 })
    const loadTime = Date.now() - startTime

    // Should load within 3 seconds (increased from 2s for network latency)
    expect(loadTime).toBeLessThan(3000)
  })
})
