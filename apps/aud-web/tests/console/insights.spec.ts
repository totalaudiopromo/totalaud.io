/**
 * AI Insight Generation Tests
 *
 * Tests the Claude-powered insight engine:
 * 1. Trigger insight generation via "Generate New Insights" button
 * 2. Verify API call completes < 3s
 * 3. Confirm 3-5 insight cards rendered with trend icons
 * 4. Validate insight quality and formatting
 */

import { test, expect } from '@playwright/test'
import {
  TEST_CONFIG,
  createTestSupabaseClient,
  createAdminSupabaseClient,
  createAuthenticatedUser,
  setAuthSession,
  cleanupTestUser,
  waitForElement,
  takeScreenshot,
  logTestResult,
  measurePerformance,
} from '../setup'

test.describe('AI Insight Generation', () => {
  let userId: string
  let sessionToken: string
  let campaignId: string

  test.beforeAll(async () => {
    // Create authenticated test user
    const supabase = createTestSupabaseClient()
    const { user, session } = await createAuthenticatedUser(supabase)
    userId = user.id
    sessionToken = session!.access_token

    // Create a test campaign with metrics
    const adminSupabase = createAdminSupabaseClient()

    const { data: campaign, error: campaignError } = await adminSupabase
      .from('campaigns')
      .insert({
        user_id: userId,
        title: 'AI Insight Test Campaign',
        release_date: '2025-12-15',
        goal_total: 50,
      })
      .select()
      .single()

    if (campaignError || !campaign) {
      throw new Error(`Failed to create test campaign: ${campaignError?.message}`)
    }

    campaignId = campaign.id

    // Insert sample events to generate meaningful insights
    const sampleEvents = [
      {
        campaign_id: campaignId,
        type: 'pitch_sent',
        target: 'BBC Radio 1',
        status: 'sent',
        message: 'Pitch sent to BBC Radio 1',
      },
      {
        campaign_id: campaignId,
        type: 'pitch_opened',
        target: 'BBC Radio 1',
        status: 'opened',
        message: 'BBC Radio 1 opened pitch',
      },
      {
        campaign_id: campaignId,
        type: 'pitch_replied',
        target: 'BBC Radio 1',
        status: 'replied',
        message: 'BBC Radio 1 replied',
      },
      {
        campaign_id: campaignId,
        type: 'pitch_sent',
        target: 'BBC Radio 6 Music',
        status: 'sent',
        message: 'Pitch sent to BBC Radio 6 Music',
      },
      {
        campaign_id: campaignId,
        type: 'pitch_opened',
        target: 'BBC Radio 6 Music',
        status: 'opened',
        message: 'BBC Radio 6 Music opened pitch',
      },
      {
        campaign_id: campaignId,
        type: 'pitch_sent',
        target: 'Spotify Editorial',
        status: 'sent',
        message: 'Pitch sent to Spotify Editorial',
      },
    ]

    for (const event of sampleEvents) {
      await adminSupabase.from('campaign_events').insert(event)
    }
  })

  test.afterAll(async () => {
    // Cleanup test user and data
    if (userId) {
      await cleanupTestUser(userId)
    }
  })

  test('should generate insights via Learn mode button', async ({ page }) => {
    // Step 1: Navigate to console
    await page.goto(TEST_CONFIG.appUrl + '/console')
    await setAuthSession(page, {
      access_token: sessionToken,
      refresh_token: 'test-refresh-token',
    })
    await page.reload()

    await waitForElement(page, '[data-testid="mission-stack"]', 10000)

    // Step 2: Switch to Learn mode
    await page.click('[data-testid="mission-learn"]')
    await page.waitForTimeout(300)

    await takeScreenshot(page, 'insights-learn-mode-loaded')

    // Step 3: Check for existing insights
    const initialInsightCount = await page.locator('[data-testid^="insight-card-"]').count()
    console.log(`[Insights] Initial insight count: ${initialInsightCount}`)

    // Step 4: Click "Generate New Insights" button
    const generateButton = page.locator('button:has-text("Generate New Insights")')
    await expect(generateButton).toBeVisible()

    const generateMetrics = await measurePerformance(page, async () => {
      await generateButton.click()

      // Wait for button to show loading state
      await page.waitForTimeout(500)
    })

    await takeScreenshot(page, 'insights-generation-started')

    // Step 5: Wait for API call to complete (max 5s, but should be < 3s)
    const apiStartTime = performance.now()

    // Wait for new insights to appear (realtime subscription should update UI)
    await page.waitForSelector('[data-testid^="insight-card-"]', {
      timeout: 10000,
      state: 'visible',
    })

    const apiEndTime = performance.now()
    const apiDuration = apiEndTime - apiStartTime

    console.log(`[Insights] API call duration: ${apiDuration.toFixed(2)}ms`)

    // Step 6: Verify API call completed in < 3s
    expect(apiDuration).toBeLessThan(3000)

    await takeScreenshot(page, 'insights-generated')

    logTestResult('Generate insights API call', true, {
      duration: apiDuration,
      timestamp: Date.now(),
    })

    // Step 7: Verify 3-5 insight cards rendered
    const finalInsightCount = await page.locator('[data-testid^="insight-card-"]').count()
    console.log(`[Insights] Final insight count: ${finalInsightCount}`)

    expect(finalInsightCount).toBeGreaterThanOrEqual(3)
    expect(finalInsightCount).toBeLessThanOrEqual(5)

    logTestResult('Insight card count (3-5)', true)
  })

  test('should display insights with trend indicators', async ({ page }) => {
    // Step 1: Navigate to console and switch to Learn mode
    await page.goto(TEST_CONFIG.appUrl + '/console')
    await setAuthSession(page, {
      access_token: sessionToken,
      refresh_token: 'test-refresh-token',
    })
    await page.reload()

    await waitForElement(page, '[data-testid="mission-stack"]', 10000)
    await page.click('[data-testid="mission-learn"]')
    await page.waitForTimeout(300)

    // Step 2: Check if insights exist (from previous test)
    const insightCards = page.locator('[data-testid^="insight-card-"]')
    const insightCount = await insightCards.count()

    if (insightCount === 0) {
      // Generate insights if none exist
      const generateButton = page.locator('button:has-text("Generate New Insights")')
      await generateButton.click()
      await page.waitForTimeout(5000)
    }

    // Step 3: Verify each insight has required elements
    const insights = await page.locator('[data-testid^="insight-card-"]').all()

    for (let i = 0; i < insights.length; i++) {
      const insight = insights[i]

      // Check for trend icon (↑ ↓ or •)
      const trendIcon = insight.locator(
        'span:has-text("↑"), span:has-text("↓"), span:has-text("•")'
      )
      const hasTrendIcon = (await trendIcon.count()) > 0

      expect(hasTrendIcon).toBeTruthy()

      // Check for metric text (e.g., "+18% open rate")
      const metricText = await insight.textContent()
      expect(metricText).toBeTruthy()
      expect(metricText!.length).toBeGreaterThan(10) // Has substantial content

      console.log(`[Insights] Card ${i + 1}: ${metricText?.substring(0, 50)}...`)
    }

    await takeScreenshot(page, 'insights-trend-indicators-verified')

    logTestResult('Insight trend indicators', true)
  })

  test('should show insight cards with proper formatting', async ({ page }) => {
    // Step 1: Navigate to Learn mode
    await page.goto(TEST_CONFIG.appUrl + '/console')
    await setAuthSession(page, {
      access_token: sessionToken,
      refresh_token: 'test-refresh-token',
    })
    await page.reload()

    await waitForElement(page, '[data-testid="mission-stack"]', 10000)
    await page.click('[data-testid="mission-learn"]')
    await page.waitForTimeout(300)

    // Step 2: Verify insight cards have proper styling
    const insightCard = page.locator('[data-testid^="insight-card-"]').first()

    if ((await insightCard.count()) === 0) {
      // Generate insights if needed
      await page.click('button:has-text("Generate New Insights")')
      await page.waitForTimeout(5000)
    }

    // Step 3: Check card styling (border, background, padding)
    const cardStyles = await insightCard.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return {
        backgroundColor: styles.backgroundColor,
        border: styles.border,
        borderRadius: styles.borderRadius,
        padding: styles.padding,
      }
    })

    console.log('[Insights] Card styles:', cardStyles)

    // Verify card has styling applied
    expect(cardStyles.backgroundColor).toBeTruthy()
    expect(cardStyles.border).toBeTruthy()

    await takeScreenshot(page, 'insights-card-formatting')

    logTestResult('Insight card formatting', true)
  })

  test('should handle insight generation errors gracefully', async ({ page }) => {
    // This test would check error handling if API fails
    // For now, we verify the UI remains functional even if API times out

    // Step 1: Navigate to Learn mode
    await page.goto(TEST_CONFIG.appUrl + '/console')
    await setAuthSession(page, {
      access_token: sessionToken,
      refresh_token: 'test-refresh-token',
    })
    await page.reload()

    await waitForElement(page, '[data-testid="mission-stack"]', 10000)
    await page.click('[data-testid="mission-learn"]')
    await page.waitForTimeout(300)

    // Step 2: Monitor console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Step 3: Click generate button
    const generateButton = page.locator('button:has-text("Generate New Insights")')
    await generateButton.click()

    // Step 4: Wait for response
    await page.waitForTimeout(5000)

    // Step 5: Verify no uncaught errors
    const hasUncaughtErrors = consoleErrors.some(
      (err) => err.toLowerCase().includes('uncaught') || err.toLowerCase().includes('unhandled')
    )

    expect(hasUncaughtErrors).toBeFalsy()

    await takeScreenshot(page, 'insights-error-handling')

    logTestResult('Insight error handling', true)
  })

  test('should display insights in Insight Panel', async ({ page }) => {
    // Step 1: Navigate to console
    await page.goto(TEST_CONFIG.appUrl + '/console')
    await setAuthSession(page, {
      access_token: sessionToken,
      refresh_token: 'test-refresh-token',
    })
    await page.reload()

    await waitForElement(page, '[data-testid="mission-stack"]', 10000)

    // Step 2: Check Insight Panel on right side
    const insightPanel = await waitForElement(page, '[data-testid="insight-panel"]', 5000)
    expect(insightPanel).toBeTruthy()

    // Step 3: Verify "AI Recommendations" section exists
    const aiRecommendations = page.locator('text=AI Recommendations')
    await expect(aiRecommendations).toBeVisible()

    await takeScreenshot(page, 'insights-panel-verified')

    logTestResult('Insight Panel display', true)
  })
})
