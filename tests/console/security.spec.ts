/**
 * Security & RLS Enforcement Tests
 *
 * Tests Row Level Security policies to ensure data isolation:
 * 1. Create two separate users (User A & User B)
 * 2. User A creates campaign
 * 3. User B queries campaigns → should NOT see A's campaign
 * 4. Verify direct API calls with wrong JWT return 403
 * 5. Test cross-user data access prevention
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
} from '../setup'

test.describe('RLS & Security Enforcement', () => {
  let userAId: string
  let userASessionToken: string
  let userACampaignId: string

  let userBId: string
  let userBSessionToken: string

  test.beforeAll(async () => {
    const supabase = createTestSupabaseClient()

    // Create User A
    const userA = await createAuthenticatedUser(supabase)
    userAId = userA.user.id
    userASessionToken = userA.session!.access_token

    // User A creates a campaign
    const adminSupabase = createAdminSupabaseClient()
    const { data: campaign, error } = await adminSupabase
      .from('campaigns')
      .insert({
        user_id: userAId,
        title: 'User A Secret Campaign',
        release_date: '2025-12-01',
        goal_total: 50,
      })
      .select()
      .single()

    if (error || !campaign) {
      throw new Error(`Failed to create User A campaign: ${error?.message}`)
    }

    userACampaignId = campaign.id

    // Create User B (separate user)
    const userB = await createAuthenticatedUser(supabase)
    userBId = userB.user.id
    userBSessionToken = userB.session!.access_token
  })

  test.afterAll(async () => {
    // Cleanup both test users
    if (userAId) {
      await cleanupTestUser(userAId)
    }
    if (userBId) {
      await cleanupTestUser(userBId)
    }
  })

  test('should isolate campaigns between users via RLS', async ({ page }) => {
    // Step 1: User B tries to query all campaigns
    const supabase = createTestSupabaseClient()

    // Manually set User B session
    await supabase.auth.setSession({
      access_token: userBSessionToken,
      refresh_token: 'test-refresh-token',
    })

    // Step 2: Query campaigns (should only see User B's campaigns, not User A's)
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userAId) // Explicitly try to query User A's campaigns

    console.log('[Security] User B querying User A campaigns:', { campaigns, error })

    // Step 3: Verify RLS blocks access
    // RLS should prevent User B from seeing User A's campaigns
    expect(campaigns).toBeTruthy()
    expect(campaigns!.length).toBe(0) // Should return empty array due to RLS

    logTestResult('RLS campaign isolation', true)
  })

  test('should prevent User B from accessing User A campaign in UI', async ({ page }) => {
    // Step 1: User B logs into console
    await page.goto(TEST_CONFIG.appUrl + '/console')
    await setAuthSession(page, {
      access_token: userBSessionToken,
      refresh_token: 'test-refresh-token',
    })
    await page.reload()

    await waitForElement(page, '[data-testid="mission-stack"]', 10000)

    await takeScreenshot(page, 'security-user-b-console')

    // Step 2: Check campaign name in header (should not show User A's campaign)
    const campaignName =
      (await page.textContent('text=Untitled Campaign')) || (await page.textContent('header'))

    console.log('[Security] User B sees campaign:', campaignName)

    // User B should NOT see "User A Secret Campaign"
    expect(campaignName).not.toContain('User A Secret Campaign')

    logTestResult('UI campaign isolation', true)
  })

  test('should block direct API access with wrong JWT', async () => {
    // Step 1: Try to access campaign_events with User B's JWT for User A's campaign
    const supabase = createTestSupabaseClient()

    await supabase.auth.setSession({
      access_token: userBSessionToken,
      refresh_token: 'test-refresh-token',
    })

    // Step 2: Attempt to insert event for User A's campaign
    const { data, error } = await supabase
      .from('campaign_events')
      .insert({
        campaign_id: userACampaignId, // User A's campaign ID
        type: 'pitch_sent',
        target: 'Malicious Insert Test',
        status: 'sent',
        message: 'This should be blocked by RLS',
      })
      .select()

    console.log('[Security] Cross-user insert attempt:', { data, error })

    // Step 3: Verify insert is blocked
    // RLS should prevent User B from inserting events for User A's campaign
    // This will either return error or success with no rows affected
    if (data) {
      expect(data.length).toBe(0)
    }

    // If error is returned, check it's a permission error
    if (error) {
      expect(error.message.toLowerCase()).toMatch(/permission|policy|denied|rls/i)
    }

    logTestResult('Block cross-user API access', true)
  })

  test('should prevent User B from reading User A campaign events', async () => {
    const adminSupabase = createAdminSupabaseClient()

    // Step 1: Admin creates an event for User A's campaign
    await adminSupabase.from('campaign_events').insert({
      campaign_id: userACampaignId,
      type: 'pitch_sent',
      target: 'Secret Station',
      status: 'sent',
      message: 'User A secret event',
    })

    // Step 2: User B tries to read events for User A's campaign
    const userBSupabase = createTestSupabaseClient()
    await userBSupabase.auth.setSession({
      access_token: userBSessionToken,
      refresh_token: 'test-refresh-token',
    })

    const { data: events, error } = await userBSupabase
      .from('campaign_events')
      .select('*')
      .eq('campaign_id', userACampaignId)

    console.log('[Security] User B reading User A events:', { events, error })

    // Step 3: Verify RLS blocks access
    expect(events).toBeTruthy()
    expect(events!.length).toBe(0) // RLS should filter out User A's events

    logTestResult('Block cross-user event reading', true)
  })

  test('should prevent User B from reading User A campaign metrics', async () => {
    const userBSupabase = createTestSupabaseClient()

    await userBSupabase.auth.setSession({
      access_token: userBSessionToken,
      refresh_token: 'test-refresh-token',
    })

    // Try to read metrics for User A's campaign
    const { data: metrics, error } = await userBSupabase
      .from('campaign_metrics')
      .select('*')
      .eq('campaign_id', userACampaignId)

    console.log('[Security] User B reading User A metrics:', { metrics, error })

    // RLS should block access
    expect(metrics).toBeTruthy()
    expect(metrics!.length).toBe(0)

    logTestResult('Block cross-user metrics reading', true)
  })

  test('should prevent User B from reading User A campaign insights', async () => {
    const adminSupabase = createAdminSupabaseClient()

    // Step 1: Admin creates an insight for User A's campaign
    await adminSupabase.from('campaign_insights').insert({
      campaign_id: userACampaignId,
      key: 'Secret Insight',
      value: 'User A private insight',
      metric: '+50% secret metric',
      trend: 'up',
    })

    // Step 2: User B tries to read User A's insights
    const userBSupabase = createTestSupabaseClient()
    await userBSupabase.auth.setSession({
      access_token: userBSessionToken,
      refresh_token: 'test-refresh-token',
    })

    const { data: insights, error } = await userBSupabase
      .from('campaign_insights')
      .select('*')
      .eq('campaign_id', userACampaignId)

    console.log('[Security] User B reading User A insights:', { insights, error })

    // RLS should block access
    expect(insights).toBeTruthy()
    expect(insights!.length).toBe(0)

    logTestResult('Block cross-user insights reading', true)
  })

  test('should allow User A to access own data', async () => {
    // Verify RLS allows legitimate access
    const userASupabase = createTestSupabaseClient()

    await userASupabase.auth.setSession({
      access_token: userASessionToken,
      refresh_token: 'test-refresh-token',
    })

    // User A should be able to read own campaign
    const { data: campaigns, error } = await userASupabase
      .from('campaigns')
      .select('*')
      .eq('id', userACampaignId)

    console.log('[Security] User A reading own campaign:', { campaigns, error })

    // Should succeed
    expect(error).toBeNull()
    expect(campaigns).toBeTruthy()
    expect(campaigns!.length).toBe(1)
    expect(campaigns![0].id).toBe(userACampaignId)

    logTestResult('Allow legitimate user access', true)
  })

  test('should enforce RLS on realtime subscriptions', async ({ page }) => {
    // Test that realtime subscriptions respect RLS
    // User B should not receive realtime events for User A's campaign

    // Step 1: User B opens console
    await page.goto(TEST_CONFIG.appUrl + '/console')
    await setAuthSession(page, {
      access_token: userBSessionToken,
      refresh_token: 'test-refresh-token',
    })
    await page.reload()

    await waitForElement(page, '[data-testid="mission-stack"]', 10000)

    // Step 2: Monitor for new events in UI
    const initialEventCount = await page.locator('[data-testid^="activity-event-"]').count()

    // Step 3: Admin inserts event for User A's campaign
    const adminSupabase = createAdminSupabaseClient()
    await adminSupabase.from('campaign_events').insert({
      campaign_id: userACampaignId,
      type: 'pitch_sent',
      target: 'Realtime Test Station',
      status: 'sent',
      message: 'User A realtime event',
    })

    // Step 4: Wait for potential realtime update
    await page.waitForTimeout(2000)

    // Step 5: Verify User B did NOT receive the event
    const finalEventCount = await page.locator('[data-testid^="activity-event-"]').count()

    await takeScreenshot(page, 'security-realtime-isolation')

    // Event count should not have changed (RLS blocks realtime subscription)
    expect(finalEventCount).toBe(initialEventCount)

    logTestResult('RLS on realtime subscriptions', true)
  })
})
