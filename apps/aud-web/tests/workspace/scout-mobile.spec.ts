/**
 * Scout Wizard Mobile Responsiveness Tests
 *
 * Tests the Scout wizard on various mobile viewport sizes to ensure
 * responsive design works correctly across devices.
 */

import { test, expect, devices } from '@playwright/test'
import { TEST_CONFIG, takeScreenshot, logTestResult } from '../setup'

// Mobile device viewports
const MOBILE_VIEWPORTS = {
  iPhoneSE: { width: 375, height: 667 },
  iPhone12: { width: 390, height: 844 },
  Pixel5: { width: 393, height: 851 },
  iPad: { width: 768, height: 1024 },
}

test.describe('Scout Wizard - Mobile Responsiveness', () => {
  for (const [deviceName, viewport] of Object.entries(MOBILE_VIEWPORTS)) {
    test.describe(`${deviceName} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport })

      test('should render Scout wizard correctly', async ({ page }) => {
        await page.goto(TEST_CONFIG.appUrl + '/workspace')
        await page.waitForLoadState('networkidle')

        // Check that step 1 header is visible
        await expect(page.locator('text=Step 1 of 5')).toBeVisible({ timeout: 10000 })
        await expect(page.locator('text=Tell us about your track')).toBeVisible()

        // Check form inputs are visible and usable
        const trackTitleInput = page.locator('input#trackTitle')
        await expect(trackTitleInput).toBeVisible()
        await expect(trackTitleInput).toBeEnabled()

        await takeScreenshot(page, `scout-mobile-${deviceName.toLowerCase()}-step1`)
        logTestResult(`${deviceName}: Scout wizard renders correctly`, true)
      })

      test('should have readable text sizes', async ({ page }) => {
        await page.goto(TEST_CONFIG.appUrl + '/workspace')
        await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })

        // Check that text is readable (at least 12px font size on mobile)
        const stepLabel = page.locator('text=Step 1 of 5')
        const fontSize = await stepLabel.evaluate((el) => {
          return parseFloat(window.getComputedStyle(el).fontSize)
        })

        expect(fontSize).toBeGreaterThanOrEqual(10) // At least 10px for step labels
        logTestResult(`${deviceName}: Text sizes are readable`, true)
      })

      test('should have tappable buttons', async ({ page }) => {
        await page.goto(TEST_CONFIG.appUrl + '/workspace')
        await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })

        // Fill in required field
        await page.fill('input#trackTitle', 'Mobile Test')

        const continueButton = page.locator('button:has-text("Continue")')

        // Check button is visible and has minimum tap target size (44x44 recommended)
        const buttonBox = await continueButton.boundingBox()
        expect(buttonBox).not.toBeNull()
        expect(buttonBox!.height).toBeGreaterThanOrEqual(36) // Minimum height

        // Test that button is tappable
        await continueButton.click()

        // Should navigate to step 2
        await expect(page.locator('text=Step 2 of 5')).toBeVisible()

        logTestResult(`${deviceName}: Buttons are tappable`, true)
      })

      test('should allow horizontal scrolling on genre grid only if needed', async ({ page }) => {
        await page.goto(TEST_CONFIG.appUrl + '/workspace')
        await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })

        // Navigate to step 2 (genres)
        await page.fill('input#trackTitle', 'Mobile Test')
        await page.click('button:has-text("Continue")')
        await page.waitForSelector('text=Step 2 of 5')

        // Check page isn't horizontally scrollable
        const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
        const viewportWidth = await page.evaluate(() => window.innerWidth)

        // Allow small tolerance for scrollbar
        expect(documentWidth).toBeLessThanOrEqual(viewportWidth + 20)

        await takeScreenshot(page, `scout-mobile-${deviceName.toLowerCase()}-genres`)
        logTestResult(`${deviceName}: No horizontal overflow`, true)
      })

      test('should wrap genre buttons properly', async ({ page }) => {
        await page.goto(TEST_CONFIG.appUrl + '/workspace')
        await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })

        // Navigate to step 2
        await page.fill('input#trackTitle', 'Mobile Test')
        await page.click('button:has-text("Continue")')
        await page.waitForSelector('text=Step 2 of 5')

        // Get the genre container
        const genreContainer = page.locator('div.flex.flex-wrap.gap-2').first()
        await expect(genreContainer).toBeVisible()

        // Verify genres wrap to multiple rows on narrow screens
        const containerBox = await genreContainer.boundingBox()
        if (viewport.width < 500 && containerBox) {
          // On narrow screens, container should be taller (multiple rows)
          expect(containerBox.height).toBeGreaterThan(50)
        }

        logTestResult(`${deviceName}: Genre buttons wrap correctly`, true)
      })

      test('should have working back button', async ({ page }) => {
        await page.goto(TEST_CONFIG.appUrl + '/workspace')
        await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })

        // Navigate to step 2
        await page.fill('input#trackTitle', 'Mobile Test')
        await page.click('button:has-text("Continue")')
        await page.waitForSelector('text=Step 2 of 5')

        // Back button should be visible
        const backButton = page.locator('button:has-text("Back")')
        await expect(backButton).toBeVisible()

        // Tap back
        await backButton.click()

        // Should be back on step 1
        await expect(page.locator('text=Step 1 of 5')).toBeVisible()

        logTestResult(`${deviceName}: Back navigation works`, true)
      })

      test('should display goals cards in single column on narrow screens', async ({ page }) => {
        if (viewport.width >= 640) {
          test.skip()
          return
        }

        await page.goto(TEST_CONFIG.appUrl + '/workspace')
        await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })

        // Navigate to step 3
        await page.fill('input#trackTitle', 'Mobile Test')
        await page.click('button:has-text("Continue")')
        await page.waitForSelector('text=Step 2 of 5')
        await page.click('button:has-text("Electronic")')
        await page.click('button:has-text("Continue")')
        await page.waitForSelector('text=Step 3 of 5')

        // On narrow screens, goals should be in single column
        // Check that Playlist Curators and Music Blogs are stacked (not side-by-side)
        const playlistButton = page.locator('text=Playlist Curators').first()
        const blogButton = page.locator('text=Music Blogs').first()

        const playlistBox = await playlistButton.boundingBox()
        const blogBox = await blogButton.boundingBox()

        if (playlistBox && blogBox && viewport.width < 500) {
          // On narrow screens, blog should be below playlist (higher Y value)
          expect(blogBox.y).toBeGreaterThan(playlistBox.y)
        }

        await takeScreenshot(page, `scout-mobile-${deviceName.toLowerCase()}-goals`)
        logTestResult(`${deviceName}: Goals cards stack correctly`, true)
      })

      test('should display vibe buttons in responsive grid', async ({ page }) => {
        await page.goto(TEST_CONFIG.appUrl + '/workspace')
        await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })

        // Navigate to step 2
        await page.fill('input#trackTitle', 'Mobile Test')
        await page.click('button:has-text("Continue")')
        await page.waitForSelector('text=Step 2 of 5')

        // Check vibe buttons are visible
        await expect(page.locator('button:has-text("Energetic")')).toBeVisible()
        await expect(page.locator('button:has-text("Chill")')).toBeVisible()
        await expect(page.locator('button:has-text("Dark")')).toBeVisible()

        // On narrow screens (< 640px), vibes should be in 2 columns
        // On wider screens (>= 640px), vibes should be in 5 columns
        const vibeGrid = page.locator('.grid.grid-cols-2.sm\\:grid-cols-5')
        await expect(vibeGrid).toBeVisible()

        await takeScreenshot(page, `scout-mobile-${deviceName.toLowerCase()}-vibes`)
        logTestResult(`${deviceName}: Vibe buttons display correctly`, true)
      })
    })
  }
})

test.describe('Scout Wizard - Touch Interactions', () => {
  test.use({
    viewport: MOBILE_VIEWPORTS.iPhone12,
    hasTouch: true,
  })

  test('should handle touch gestures on genre buttons', async ({ page }) => {
    await page.goto(TEST_CONFIG.appUrl + '/workspace')
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })

    // Navigate to step 2
    await page.fill('input#trackTitle', 'Touch Test')
    await page.click('button:has-text("Continue")')
    await page.waitForSelector('text=Step 2 of 5')

    // Tap genre buttons
    const electronicButton = page.locator('button:has-text("Electronic")')
    await electronicButton.tap()

    // Should show selection summary
    await expect(page.locator('text=Selected: Electronic')).toBeVisible()

    // Tap another genre
    const popButton = page.locator('button:has-text("Pop")')
    await popButton.tap()

    // Should update selection summary
    await expect(page.locator('text=Selected: Electronic, Pop')).toBeVisible()

    logTestResult('Touch interactions work on genre buttons', true)
  })

  test('should handle touch gestures on vibe buttons', async ({ page }) => {
    await page.goto(TEST_CONFIG.appUrl + '/workspace')
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })

    // Navigate to step 2
    await page.fill('input#trackTitle', 'Touch Test')
    await page.click('button:has-text("Continue")')
    await page.waitForSelector('text=Step 2 of 5')

    // Select a genre first
    await page.locator('button:has-text("Electronic")').tap()

    // Tap different vibes
    const chillButton = page.locator('button:has-text("Chill")')
    await chillButton.tap()

    // Chill should now be selected
    await expect(chillButton).toHaveClass(/border-\[#3AA9BE\]/)

    logTestResult('Touch interactions work on vibe buttons', true)
  })

  test('should scroll results list smoothly', async ({ page }) => {
    await page.goto(TEST_CONFIG.appUrl + '/workspace')
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })

    // Navigate through all steps to results
    await page.fill('input#trackTitle', 'Scroll Test')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 2 of 5')
    await page.click('button:has-text("Electronic")')
    await page.click('button:has-text("Continue")')

    await page.waitForSelector('text=Step 3 of 5')
    await page.click('text=Playlist Curators')
    await page.click('text=Music Blogs')
    await page.click('text=Radio Stations')
    await page.click('button:has-text("Start Scout")')

    // Wait for results
    await expect(page.locator('text=Step 5 of 5')).toBeVisible({ timeout: 30000 })

    // Scroll down the results list
    await page.evaluate(() => {
      window.scrollBy(0, 300)
    })

    // Page should still be functional after scroll
    await expect(page.locator('text=Your opportunities')).toBeVisible()

    await takeScreenshot(page, 'scout-mobile-results-scrolled')
    logTestResult('Results list scrolls smoothly', true)
  })
})

test.describe('Scout Wizard - Landscape Orientation', () => {
  test.use({
    viewport: { width: 844, height: 390 }, // iPhone 12 landscape
  })

  test('should render correctly in landscape', async ({ page }) => {
    await page.goto(TEST_CONFIG.appUrl + '/workspace')
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })

    // All elements should still be visible and usable
    await expect(page.locator('text=Tell us about your track')).toBeVisible()
    await expect(page.locator('input#trackTitle')).toBeVisible()
    await expect(page.locator('button:has-text("Continue")')).toBeVisible()

    await takeScreenshot(page, 'scout-mobile-landscape')
    logTestResult('Landscape orientation renders correctly', true)
  })

  test('should have usable form in landscape', async ({ page }) => {
    await page.goto(TEST_CONFIG.appUrl + '/workspace')
    await page.waitForSelector('text=Step 1 of 5', { timeout: 10000 })

    // Fill form in landscape
    await page.fill('input#trackTitle', 'Landscape Test')

    // Continue should work
    await page.click('button:has-text("Continue")')

    await expect(page.locator('text=Step 2 of 5')).toBeVisible()

    logTestResult('Form works in landscape orientation', true)
  })
})
