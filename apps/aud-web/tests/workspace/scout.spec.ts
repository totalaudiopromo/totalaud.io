/**
 * Scout Wizard E2E Tests
 *
 * Tests the complete Scout discovery workflow:
 * 1. Navigate through wizard steps
 * 2. Validate step progression requirements
 * 3. Test discovery API integration
 * 4. Verify results display and actions
 */

import { test, expect } from '@playwright/test'
import { TEST_CONFIG, takeScreenshot, measurePerformance, logTestResult } from '../setup'

test.describe('Scout Wizard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to workspace page which hosts the Scout wizard
    await page.goto(TEST_CONFIG.appUrl + '/workspace')
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('should display Scout wizard on workspace page', async ({ page }) => {
    // Check that the Scout progress indicator is visible
    await expect(page.locator('text=Step 1 of 5')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Tell us about your track')).toBeVisible()

    await takeScreenshot(page, 'scout-wizard-loaded')
    logTestResult('Scout wizard displayed on workspace', true)
  })

  test('should show Continue button disabled until track title entered', async ({ page }) => {
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })

    // Continue button should be disabled initially
    const continueButton = page.locator('button:has-text("Continue")')
    await expect(continueButton).toBeDisabled()

    // Enter a track title
    await page.fill('input#trackTitle', 'My Test Track')

    // Continue button should now be enabled
    await expect(continueButton).toBeEnabled()

    await takeScreenshot(page, 'scout-step1-filled')
    logTestResult('Step 1 validation works correctly', true)
  })

  test('should navigate from step 1 to step 2', async ({ page }) => {
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })

    // Fill in track title
    await page.fill('input#trackTitle', 'Midnight Signals')

    // Optionally add description
    await page.fill(
      'textarea#trackDescription',
      'A dreamy electronic track with cinematic soundscapes'
    )

    // Click Continue
    const metrics = await measurePerformance(page, async () => {
      await page.click('button:has-text("Continue")')
    })

    // Should now be on step 2
    await expect(page.locator('text=Step 2 of 5')).toBeVisible()
    await expect(page.locator('text=Genre and vibe')).toBeVisible()

    // Verify transition performance (should be < 300ms)
    expect(metrics.duration).toBeLessThan(300)

    await takeScreenshot(page, 'scout-step2-reached')
    logTestResult('Navigate to step 2', true, metrics)
  })

  test('should allow selecting multiple genres on step 2', async ({ page }) => {
    // Navigate to step 2
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })
    await page.fill('input#trackTitle', 'Test Track')
    await page.click('button:has-text("Continue")')

    // Wait for step 2
    await page.waitForSelector('text=Step 2 of 5')

    // Select genres
    await page.click('button:has-text("Electronic")')
    await page.click('button:has-text("Indie")')
    await page.click('button:has-text("Ambient")')

    // Verify selection summary appears
    await expect(page.locator('text=Selected: Electronic, Indie, Ambient')).toBeVisible()

    // Continue should be enabled
    const continueButton = page.locator('button:has-text("Continue")')
    await expect(continueButton).toBeEnabled()

    await takeScreenshot(page, 'scout-step2-genres-selected')
    logTestResult('Multiple genres selected', true)
  })

  test('should allow selecting vibe on step 2', async ({ page }) => {
    // Navigate to step 2
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })
    await page.fill('input#trackTitle', 'Test Track')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 2 of 5')

    // Select a genre first (required)
    await page.click('button:has-text("Electronic")')

    // Change vibe from default (Energetic) to Chill
    await page.click('button:has-text("Chill")')

    // Verify Chill is selected (has different styling)
    const chillButton = page.locator('button:has-text("Chill")')
    await expect(chillButton).toHaveClass(/border-\[#3AA9BE\]/)

    await takeScreenshot(page, 'scout-step2-vibe-selected')
    logTestResult('Vibe selection works', true)
  })

  test('should navigate to step 3 (Goals)', async ({ page }) => {
    // Navigate through steps 1 and 2
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })
    await page.fill('input#trackTitle', 'Test Track')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 2 of 5')
    await page.click('button:has-text("Electronic")')
    await page.click('button:has-text("Continue")')

    // Should be on step 3
    await expect(page.locator('text=Step 3 of 5')).toBeVisible()
    await expect(page.locator('text=What are you looking for?')).toBeVisible()

    // All goal types should be visible
    await expect(page.locator('text=Playlist Curators')).toBeVisible()
    await expect(page.locator('text=Music Blogs')).toBeVisible()
    await expect(page.locator('text=Radio Stations')).toBeVisible()
    await expect(page.locator('text=YouTube Channels')).toBeVisible()
    await expect(page.locator('text=Podcasts')).toBeVisible()

    await takeScreenshot(page, 'scout-step3-goals')
    logTestResult('Navigate to step 3', true)
  })

  test('should show "Start Scout" button on step 3', async ({ page }) => {
    // Navigate through steps 1 and 2
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })
    await page.fill('input#trackTitle', 'Test Track')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 2 of 5')
    await page.click('button:has-text("Electronic")')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 3 of 5')

    // Button should say "Start Scout" instead of "Continue"
    const startScoutButton = page.locator('button:has-text("Start Scout")')
    await expect(startScoutButton).toBeVisible()
    await expect(startScoutButton).toBeDisabled() // Should be disabled until goal selected

    // Select a goal
    await page.click('text=Playlist Curators')

    // Now button should be enabled
    await expect(startScoutButton).toBeEnabled()

    await takeScreenshot(page, 'scout-step3-ready')
    logTestResult('Start Scout button shown on step 3', true)
  })

  test('should navigate back from step 2 to step 1', async ({ page }) => {
    // Navigate to step 2
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })
    await page.fill('input#trackTitle', 'Test Track')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 2 of 5')

    // Click Back
    await page.click('button:has-text("Back")')

    // Should be back on step 1
    await expect(page.locator('text=Step 1 of 5')).toBeVisible()
    await expect(page.locator('text=Tell us about your track')).toBeVisible()

    // Track title should still be filled in (state persists)
    const trackTitleInput = page.locator('input#trackTitle')
    await expect(trackTitleInput).toHaveValue('Test Track')

    await takeScreenshot(page, 'scout-back-to-step1')
    logTestResult('Navigate back preserves state', true)
  })

  test('should start discovery when clicking Start Scout', async ({ page }) => {
    // Navigate through all setup steps
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })
    await page.fill('input#trackTitle', 'Discovery Test Track')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 2 of 5')
    await page.click('button:has-text("Electronic")')
    await page.click('button:has-text("Indie")')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 3 of 5')
    await page.click('text=Playlist Curators')
    await page.click('text=Music Blogs')

    // Start discovery
    const metrics = await measurePerformance(page, async () => {
      await page.click('button:has-text("Start Scout")')
    })

    // Should show discovery step (step 4)
    await expect(page.locator('text=Step 4 of 5')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Scouting opportunities')).toBeVisible()

    await takeScreenshot(page, 'scout-discovery-started')
    logTestResult('Discovery started', true, metrics)
  })

  test('should complete discovery and show results', async ({ page }) => {
    // Navigate through all setup steps
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })
    await page.fill('input#trackTitle', 'Results Test Track')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 2 of 5')
    await page.click('button:has-text("Electronic")')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 3 of 5')
    await page.click('text=Playlist Curators')
    await page.click('button:has-text("Start Scout")')

    // Wait for discovery to complete (may take a few seconds)
    await expect(page.locator('text=Step 5 of 5')).toBeVisible({ timeout: 30000 })
    await expect(page.locator('text=Your opportunities')).toBeVisible()

    // Should show results count
    await expect(page.locator('text=/Found \\d+ matches/')).toBeVisible()

    // Should have filter tabs
    await expect(page.locator('text=/All \\(\\d+\\)/')).toBeVisible()

    await takeScreenshot(page, 'scout-results-displayed')
    logTestResult('Discovery completed and results shown', true)
  })

  test('should allow selecting and exporting opportunities', async ({ page }) => {
    // Navigate through to results
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })
    await page.fill('input#trackTitle', 'Export Test Track')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 2 of 5')
    await page.click('button:has-text("Electronic")')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 3 of 5')
    await page.click('text=Playlist Curators')
    await page.click('button:has-text("Start Scout")')

    // Wait for results
    await expect(page.locator('text=Step 5 of 5')).toBeVisible({ timeout: 30000 })

    // Click "Select all"
    await page.click('text=Select all')

    // Should show selected count
    await expect(page.locator('text=/\\d+ selected/')).toBeVisible()

    // Export button should appear
    await expect(page.locator('button:has-text("Export")')).toBeVisible()

    await takeScreenshot(page, 'scout-opportunities-selected')
    logTestResult('Opportunities selection works', true)
  })

  test('should reset wizard when clicking New search', async ({ page }) => {
    // Navigate through to results
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })
    await page.fill('input#trackTitle', 'Reset Test Track')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 2 of 5')
    await page.click('button:has-text("Electronic")')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 3 of 5')
    await page.click('text=Playlist Curators')
    await page.click('button:has-text("Start Scout")')

    // Wait for results
    await expect(page.locator('text=Step 5 of 5')).toBeVisible({ timeout: 30000 })

    // Click "New search"
    await page.click('button:has-text("New search")')

    // Should be back on step 1 with empty fields
    await expect(page.locator('text=Step 1 of 5')).toBeVisible()
    const trackTitleInput = page.locator('input#trackTitle')
    await expect(trackTitleInput).toHaveValue('')

    await takeScreenshot(page, 'scout-reset-complete')
    logTestResult('Wizard reset works', true)
  })
})

test.describe('Scout Wizard - Region Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_CONFIG.appUrl + '/workspace')
    await page.waitForLoadState('networkidle')

    // Navigate to step 3 (Goals)
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })
    await page.fill('input#trackTitle', 'Region Test')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 2 of 5')
    await page.click('button:has-text("Electronic")')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 3 of 5')
  })

  test('should have UK selected by default', async ({ page }) => {
    const ukButton = page.locator('button:has-text("UK")')
    await expect(ukButton).toHaveClass(/border-\[#49A36C\]/) // Selected state
  })

  test('should allow selecting multiple regions', async ({ page }) => {
    // UK is already selected, add US and Europe
    await page.click('button:has-text("US")')
    await page.click('button:has-text("Europe")')

    // Verify all three are selected
    const ukButton = page.locator('button:has-text("UK")')
    const usButton = page.locator('button:has-text("US")')
    const europeButton = page.locator('button:has-text("Europe")')

    await expect(ukButton).toHaveClass(/border-\[#49A36C\]/)
    await expect(usButton).toHaveClass(/border-\[#49A36C\]/)
    await expect(europeButton).toHaveClass(/border-\[#49A36C\]/)

    await takeScreenshot(page, 'scout-multiple-regions')
    logTestResult('Multiple regions can be selected', true)
  })

  test('should not allow deselecting last region', async ({ page }) => {
    // UK is selected, try to deselect it
    await page.click('button:has-text("UK")')

    // UK should still be selected (can't deselect last region)
    const ukButton = page.locator('button:has-text("UK")')
    await expect(ukButton).toHaveClass(/border-\[#49A36C\]/)

    logTestResult('Last region cannot be deselected', true)
  })
})
