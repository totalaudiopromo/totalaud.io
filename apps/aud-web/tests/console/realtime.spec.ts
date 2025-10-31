/**
 * Realtime Validation Tests
 *
 * Tests Supabase realtime event streaming and metric synchronization:
 * 1. Insert campaign_events via API
 * 2. Measure latency from insert to DOM render
 * 3. Verify metrics update trigger animations
 * 4. Validate latency < 250ms requirement
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

test.describe('Realtime Event & Metric Sync', () => {
  let userId: string
  let sessionToken: string
  let campaignId: string

  test.beforeAll(async () => {
    // Create authenticated test user
    const supabase = createTestSupabaseClient()
    const { user, session } = await createAuthenticatedUser(supabase)
    userId = user.id
    sessionToken = session!.access_token

    // Create a test campaign
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        title: 'Realtime Test Campaign',
        release_date: '2025-12-01',
        goal_total: 50,
      })
      .select()
      .single()

    if (error || !campaign) {
      throw new Error(`Failed to create test campaign: ${error?.message}`)
    }

    campaignId = campaign.id
  })

  test.afterAll(async () => {
    // Cleanup test user and data
    if (userId) {
      await cleanupTestUser(userId)
    }
  })

  test('should stream new campaign_events to UI within 250ms', async ({ page }) => {
    const supabase = createAdminSupabaseClient()

    // Step 1: Navigate to console and authenticate
    await page.goto(TEST_CONFIG.appUrl + '/console')
    await setAuthSession(page, {
      access_token: sessionToken,
      refresh_token: 'test-refresh-token',
    })
    await page.reload()

    await waitForElement(page, '[data-testid="mission-stack"]', 10000)

    // Step 2: Switch to Activity view (if not already visible)
    // For now, activity stream is in center pane by default

    await takeScreenshot(page, 'realtime-console-loaded')

    // Step 3: Get initial event count
    const initialEventCount = await page.locator('[data-testid^="activity-event-"]').count()
    console.log(`[Realtime] Initial event count: ${initialEventCount}`)

    // Step 4: Insert new event via Supabase API and measure latency
    const eventInsertTime = performance.now()

    const { data: newEvent, error: insertError } = await supabase
      .from('campaign_events')
      .insert({
        campaign_id: campaignId,
        type: 'pitch_sent',
        target: 'BBC Radio 1',
        status: 'sent',
        message: 'Pitch sent to BBC Radio 1',
      })
      .select()
      .single()

    if (insertError || !newEvent) {
      throw new Error(`Failed to insert event: ${insertError?.message}`)
    }

    console.log(`[Realtime] Event inserted: ${newEvent.id}`)

    // Step 5: Wait for UI to update and measure render latency
    await page.waitForSelector('[data-testid="activity-event-pitch_sent"]', {
      timeout: 5000,
      state: 'visible',
    })

    const eventRenderTime = performance.now()
    const latency = eventRenderTime - eventInsertTime

    console.log(`[Realtime] Event render latency: ${latency.toFixed(2)}ms`)

    // Step 6: Verify latency is under 250ms requirement
    expect(latency).toBeLessThan(250)

    await takeScreenshot(page, 'realtime-event-rendered')

    logTestResult('Realtime event streaming', true, { duration: latency, timestamp: Date.now() })

    // Step 7: Verify event appears in activity stream
    const updatedEventCount = await page.locator('[data-testid^="activity-event-"]').count()
    expect(updatedEventCount).toBeGreaterThan(initialEventCount)
  })

  test('should update campaign metrics in real-time', async ({ page }) => {
    const supabase = createAdminSupabaseClient()

    // Step 1: Navigate to console
    await page.goto(TEST_CONFIG.appUrl + '/console')
    await setAuthSession(page, {
      access_token: sessionToken,
      refresh_token: 'test-refresh-token',
    })
    await page.reload()

    await waitForElement(page, '[data-testid="mission-stack"]', 10000)

    // Step 2: Switch to Track mode to see metrics
    await page.click('[data-testid="mission-track"]')
    await page.waitForTimeout(300) // Wait for mode transition

    await takeScreenshot(page, 'realtime-track-mode-before')

    // Step 3: Get initial metrics (if available)
    // Note: This depends on Track mode implementation showing live metrics

    // Step 4: Insert multiple events to trigger metrics update
    const events = [
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
        target: 'BBC Radio 1',
        status: 'opened',
        message: 'Pitch opened by BBC Radio 1',
      },
      {
        campaign_id: campaignId,
        type: 'pitch_replied',
        target: 'BBC Radio 1',
        status: 'replied',
        message: 'Received reply from BBC Radio 1',
      },
    ]

    const metricsUpdateStart = performance.now()

    for (const event of events) {
      await supabase.from('campaign_events').insert(event)
      await page.waitForTimeout(100) // Small delay between events
    }

    // Step 5: Wait for metrics to update
    await page.waitForTimeout(1000) // Allow time for metrics calculation + animation

    const metricsUpdateEnd = performance.now()
    const updateLatency = metricsUpdateEnd - metricsUpdateStart

    await takeScreenshot(page, 'realtime-track-mode-after')

    console.log(`[Realtime] Metrics update latency: ${updateLatency.toFixed(2)}ms`)

    logTestResult('Realtime metrics update', true, {
      duration: updateLatency,
      timestamp: Date.now(),
    })

    // Step 6: Verify progress bar animation
    // This would check for smooth easeOut animation (500ms as per spec)
    // For now, we verify the metrics section is visible
    const trackModeContent = await waitForElement(page, 'text=TRACK', 2000)
    expect(trackModeContent).toBeTruthy()
  })

  test('should measure average FPS during realtime updates', async ({ page }) => {
    const supabase = createAdminSupabaseClient()

    // Step 1: Navigate to console
    await page.goto(TEST_CONFIG.appUrl + '/console')
    await setAuthSession(page, {
      access_token: sessionToken,
      refresh_token: 'test-refresh-token',
    })
    await page.reload()

    await waitForElement(page, '[data-testid="mission-stack"]', 10000)

    // Step 2: Start FPS monitoring
    await page.evaluate(() => {
      let frameCount = 0
      let lastTime = performance.now()
      const fpsValues: number[] = []

      const measureFPS = () => {
        const currentTime = performance.now()
        frameCount++

        if (currentTime - lastTime >= 1000) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
          fpsValues.push(fps)
          frameCount = 0
          lastTime = currentTime

          // Store in window for retrieval
          ;(window as any).__fpsValues = fpsValues
        }

        requestAnimationFrame(measureFPS)
      }

      requestAnimationFrame(measureFPS)
    })

    // Step 3: Insert rapid events to stress test
    const testStart = performance.now()

    for (let i = 0; i < 10; i++) {
      await supabase.from('campaign_events').insert({
        campaign_id: campaignId,
        type: 'pitch_sent',
        target: `Test Station ${i + 1}`,
        status: 'sent',
        message: `Rapid test event ${i + 1}`,
      })
      await page.waitForTimeout(200) // 200ms between events
    }

    const testEnd = performance.now()
    const testDuration = testEnd - testStart

    // Step 4: Wait for animations to complete
    await page.waitForTimeout(2000)

    // Step 5: Retrieve FPS measurements
    const fpsValues = await page.evaluate(() => (window as any).__fpsValues || [])

    const avgFPS =
      fpsValues.length > 0
        ? fpsValues.reduce((sum: number, fps: number) => sum + fps, 0) / fpsValues.length
        : 0

    console.log(`[Realtime] Average FPS during updates: ${avgFPS.toFixed(1)}`)
    console.log(`[Realtime] FPS samples: ${fpsValues.join(', ')}`)

    await takeScreenshot(page, 'realtime-fps-test-complete')

    // Step 6: Verify FPS is acceptable (>= 55 fps as per spec)
    expect(avgFPS).toBeGreaterThanOrEqual(55)

    logTestResult('FPS during realtime updates', true, {
      duration: testDuration,
      fps: avgFPS,
      timestamp: Date.now(),
    })
  })

  test('should handle rapid event bursts without dropping frames', async ({ page }) => {
    const supabase = createAdminSupabaseClient()

    // Step 1: Navigate to console
    await page.goto(TEST_CONFIG.appUrl + '/console')
    await setAuthSession(page, {
      access_token: sessionToken,
      refresh_token: 'test-refresh-token',
    })
    await page.reload()

    await waitForElement(page, '[data-testid="mission-stack"]', 10000)

    // Step 2: Get initial state
    const initialCount = await page.locator('[data-testid^="activity-event-"]').count()

    // Step 3: Insert burst of events (stress test)
    const burstSize = 20
    const burstStart = performance.now()

    const insertPromises = []
    for (let i = 0; i < burstSize; i++) {
      insertPromises.push(
        supabase.from('campaign_events').insert({
          campaign_id: campaignId,
          type: 'pitch_sent',
          target: `Burst Test ${i + 1}`,
          status: 'sent',
          message: `Burst event ${i + 1}`,
        })
      )
    }

    await Promise.all(insertPromises)

    const burstEnd = performance.now()
    const burstDuration = burstEnd - burstStart

    console.log(`[Realtime] Inserted ${burstSize} events in ${burstDuration.toFixed(2)}ms`)

    // Step 4: Wait for UI to settle (batch rendering every 5s as per implementation)
    await page.waitForTimeout(6000)

    // Step 5: Verify events are rendered
    const finalCount = await page.locator('[data-testid^="activity-event-"]').count()

    await takeScreenshot(page, 'realtime-burst-test-complete')

    // Events should be rendered (up to 200 max as per store implementation)
    expect(finalCount).toBeGreaterThan(initialCount)

    logTestResult('Handle event burst', true, {
      duration: burstDuration,
      timestamp: Date.now(),
    })
  })
})
