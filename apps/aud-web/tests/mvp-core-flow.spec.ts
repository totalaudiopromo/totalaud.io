/**
 * Core User Flow E2E Test
 * Tests the main MVP workflow: Ideas → Scout → Timeline → Pitch
 */

import { test, expect } from '@playwright/test'

test.describe('MVP Core Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete full user journey: Ideas → Scout → Timeline → Pitch', async ({ page }) => {
    // Step 1: Navigate to Workspace
    await page.goto('/workspace')

    // Should start on Ideas mode by default
    await expect(page).toHaveURL(/mode=ideas/)
    await expect(page.getByText('Ideas')).toBeVisible()

    // Step 2: Add an idea
    const addIdeaButton = page.getByRole('button', { name: /add idea/i })
    await addIdeaButton.click()

    const ideaInput = page.getByPlaceholder(/what's on your mind/i)
    await ideaInput.fill('Submit to BBC Radio 6 Music for new single')

    const saveButton = page.getByRole('button', { name: /save/i })
    await saveButton.click()

    // Verify idea was added
    await expect(page.getByText('Submit to BBC Radio 6 Music')).toBeVisible()

    // Step 3: Switch to Scout mode
    await page.getByRole('button', { name: 'Scout' }).click()
    await expect(page).toHaveURL(/mode=scout/)

    // Wait for opportunities to load
    await page.waitForSelector('[data-testid="opportunity-card"]', { timeout: 10000 })

    // Should see opportunities
    const opportunityCards = page.locator('[data-testid="opportunity-card"]')
    await expect(opportunityCards.first()).toBeVisible()

    // Step 4: Filter opportunities
    const typeFilter = page.getByRole('combobox', { name: /type/i })
    if (await typeFilter.isVisible()) {
      await typeFilter.selectOption('radio')
      await page.waitForTimeout(500) // Wait for filter to apply
    }

    // Step 5: Add opportunity to Timeline
    const addToTimelineButton = opportunityCards
      .first()
      .getByRole('button', { name: /add to timeline/i })
    await addToTimelineButton.click()

    // Should show success feedback
    await expect(page.getByText(/added to timeline/i)).toBeVisible({ timeout: 3000 })

    // Step 6: Switch to Timeline mode
    await page.getByRole('button', { name: 'Timeline' }).click()
    await expect(page).toHaveURL(/mode=timeline/)

    // Should see the added opportunity in timeline
    await expect(page.locator('[data-testid="timeline-event"]')).toHaveCount(1)

    // Step 7: Switch to Pitch mode
    await page.getByRole('button', { name: 'Pitch' }).click()
    await expect(page).toHaveURL(/mode=pitch/)

    // Should see pitch type selection
    await expect(page.getByText('Choose your pitch type')).toBeVisible()

    // Select radio pitch
    await page.getByRole('button', { name: /radio pitch/i }).click()

    // Should see pitch editor with sections
    await expect(page.getByRole('textbox').first()).toBeVisible()

    // Write in first section
    const pitchTextarea = page.getByRole('textbox').first()
    await pitchTextarea.fill('My new single blends indie rock with electronic elements')

    // Verify content was added
    await expect(pitchTextarea).toHaveValue(/indie rock with electronic/)
  })

  test('should persist data across page reloads', async ({ page }) => {
    // Add an idea
    await page.goto('/workspace?mode=ideas')
    const addButton = page.getByRole('button', { name: /add idea/i })
    await addButton.click()

    const input = page.getByPlaceholder(/what's on your mind/i)
    await input.fill('Test persistence')
    await page.getByRole('button', { name: /save/i }).click()

    // Reload page
    await page.reload()

    // Idea should still be there
    await expect(page.getByText('Test persistence')).toBeVisible()
  })

  test('should handle empty states gracefully', async ({ page }) => {
    // Clear localStorage to simulate fresh user
    await page.goto('/workspace?mode=ideas')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    // Should show empty state for ideas
    await expect(page.getByText(/no ideas yet/i)).toBeVisible()

    // Scout empty state (when not authenticated or no opportunities)
    await page.getByRole('button', { name: 'Scout' }).click()
    // Either shows opportunities or auth prompt
    const scoutContent = page.locator('[data-testid="scout-grid"], [data-testid="auth-prompt"]')
    await expect(scoutContent).toBeVisible({ timeout: 5000 })

    // Timeline empty state
    await page.getByRole('button', { name: 'Timeline' }).click()
    await expect(page.getByText(/your release plan/i)).toBeVisible()

    // Pitch empty state
    await page.getByRole('button', { name: 'Pitch' }).click()
    await expect(page.getByText(/choose your pitch type/i)).toBeVisible()
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/workspace?mode=ideas')

    // Should show mobile navigation
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()

    // Can switch modes via mobile nav
    await page.locator('[data-testid="mobile-nav"]').getByRole('button', { name: 'Scout' }).click()
    await expect(page).toHaveURL(/mode=scout/)
  })
})

test.describe('Authentication Flow', () => {
  test('should show auth prompt for protected features', async ({ page }) => {
    await page.goto('/workspace?mode=scout')

    // If not authenticated, should show sign-in prompt
    const authPrompt = page.locator('[data-testid="auth-prompt"]')
    const opportunityGrid = page.locator('[data-testid="scout-grid"]')

    // Should see either opportunities (if logged in) or auth prompt
    await expect(authPrompt.or(opportunityGrid)).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Performance', () => {
  test('should load workspace within 2 seconds', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/workspace')
    await page.waitForSelector('[data-testid="workspace-container"]', { timeout: 2000 })
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(2000)
  })
})
