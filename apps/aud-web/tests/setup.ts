/**
 * Test Setup - Browser Automation Framework
 *
 * Configures Playwright + Vitest for Console Environment testing.
 * Handles Supabase authentication, user session management, and test utilities.
 */

import { type Page, type Browser } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Environment variables
export const TEST_CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  testTimeout: 30000,
  screenshotDir: './tests/output/screenshots',
  headless: process.env.HEADLESS !== 'false',
}

// Validate environment
if (!TEST_CONFIG.supabaseUrl || !TEST_CONFIG.supabaseAnonKey) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

/**
 * Create a Supabase client for testing
 */
export function createTestSupabaseClient(): SupabaseClient {
  return createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * Create a Supabase admin client (with service role key)
 */
export function createAdminSupabaseClient(): SupabaseClient {
  if (!TEST_CONFIG.supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for admin operations')
  }
  return createClient(TEST_CONFIG.supabaseUrl, TEST_CONFIG.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * Generate a random test user
 */
export function generateTestUser() {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return {
    email: `test-${timestamp}-${random}@totalaud.io`,
    password: `Test_${timestamp}_${random}!`,
    name: `Test User ${random}`,
  }
}

/**
 * Create and authenticate a test user
 */
export async function createAuthenticatedUser(supabase: SupabaseClient) {
  const user = generateTestUser()

  // Sign up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      data: { name: user.name },
    },
  })

  if (signUpError) {
    throw new Error(`Failed to sign up test user: ${signUpError.message}`)
  }

  if (!signUpData.user) {
    throw new Error('No user returned from sign up')
  }

  // Sign in to get session
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  })

  if (signInError) {
    throw new Error(`Failed to sign in test user: ${signInError.message}`)
  }

  return {
    user: signUpData.user,
    session: signInData.session,
    credentials: user,
  }
}

/**
 * Set authenticated session in browser
 */
export async function setAuthSession(page: Page, session: { access_token: string; refresh_token: string }) {
  await page.goto(TEST_CONFIG.appUrl)

  // Inject session into localStorage (Supabase default storage)
  await page.evaluate((sessionData) => {
    const storageKey = `sb-${new URL(sessionData.url).hostname.replace(/\./g, '-')}-auth-token`
    localStorage.setItem(storageKey, JSON.stringify({
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token,
      expires_at: Date.now() + 3600000, // 1 hour from now
      token_type: 'bearer',
      user: null,
    }))
  }, { ...session, url: TEST_CONFIG.supabaseUrl })
}

/**
 * Clean up test user and associated data
 */
export async function cleanupTestUser(userId: string) {
  const supabase = createAdminSupabaseClient()

  // Delete user's campaigns (cascade will handle related data)
  await supabase.from('campaigns').delete().eq('user_id', userId)

  // Delete user from auth.users (admin only)
  await supabase.auth.admin.deleteUser(userId)
}

/**
 * Measure performance metrics
 */
export interface PerformanceMetrics {
  duration: number
  fps?: number
  latency?: number
  timestamp: number
}

export async function measurePerformance(
  page: Page,
  action: () => Promise<void>
): Promise<PerformanceMetrics> {
  const startTime = performance.now()
  const startTimestamp = Date.now()

  await action()

  const endTime = performance.now()
  const duration = endTime - startTime

  // Get FPS from browser (if available)
  const fps = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let lastTime = performance.now()
      let frames = 0
      const measureFPS = () => {
        const currentTime = performance.now()
        frames++
        if (currentTime - lastTime >= 1000) {
          resolve(frames)
        } else {
          requestAnimationFrame(measureFPS)
        }
      }
      requestAnimationFrame(measureFPS)
    })
  }).catch(() => undefined)

  return {
    duration,
    fps,
    timestamp: startTimestamp,
  }
}

/**
 * Wait for element with timeout
 */
export async function waitForElement(page: Page, selector: string, timeout = 5000) {
  return page.waitForSelector(selector, { timeout, state: 'visible' })
}

/**
 * Wait for network idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  return page.waitForLoadState('networkidle', { timeout })
}

/**
 * Take screenshot with metadata
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `${name}-${timestamp}.png`
  const path = `${TEST_CONFIG.screenshotDir}/${filename}`

  await page.screenshot({ path, fullPage: true })

  return { filename, path }
}

/**
 * Log test result
 */
export function logTestResult(testName: string, success: boolean, metrics?: PerformanceMetrics) {
  const icon = success ? '✅' : '❌'
  const metricsStr = metrics
    ? ` (${metrics.duration.toFixed(2)}ms${metrics.fps ? `, ${metrics.fps} fps` : ''})`
    : ''

  console.log(`${icon} ${testName}${metricsStr}`)
}

/**
 * Assert condition with custom error message
 */
export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}
