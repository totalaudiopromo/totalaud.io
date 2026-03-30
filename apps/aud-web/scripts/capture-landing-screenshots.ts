/**
 * capture-landing-screenshots.ts
 *
 * Headless Playwright screenshot capture for totalaud.io workspace modes.
 * Adapted from TAP's capture-screenshots.ts with Supabase cookie auth injection.
 *
 * Usage:
 *   cd totalaud.io/apps/aud-web && npx tsx scripts/capture-landing-screenshots.ts [finish] [pitch] [scout]
 *
 * Omit mode names to capture all. Reads credentials from .env.local.
 * Output goes to public/images/landing/.
 */

import { chromium, type Page } from '@playwright/test'
import path from 'path'
import fs from 'fs/promises'
import { config } from 'dotenv'

// Resolve from apps/aud-web/scripts/ up to apps/aud-web/
const APP_ROOT = path.resolve(import.meta.dirname ?? __dirname, '..')
config({ path: path.join(APP_ROOT, '.env.local'), override: true })

const BASE_URL = process.env.CAPTURE_URL || 'http://localhost:3000'

// Hardcode totalaud.io's Supabase project to avoid shell env overrides from TAP
const SUPABASE_REF = 'qopmwhdermudwufrloqb'
const SUPABASE_URL = `https://${SUPABASE_REF}.supabase.co`
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Screenshot test user (created via admin API)
const EMAIL = process.env.SCREENSHOT_EMAIL || 'screenshot@totalaud.io'
const PASSWORD = process.env.SCREENSHOT_PASSWORD || 'ScreenshotTest2026!'

const OUTPUT_DIR = path.join(APP_ROOT, 'public/images/landing')
const VIEWPORT = { width: 1440, height: 900 }

async function supabaseLogin(page: Page): Promise<void> {
  if (!EMAIL || !PASSWORD)
    throw new Error('TAP_LOGIN_EMAIL and TAP_LOGIN_PASSWORD must be set in .env.local')
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY)
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and ANON_KEY must be set in .env.local')

  console.log(`Authenticating as ${EMAIL} against ${SUPABASE_REF}...`)

  const authRes = await fetch(
    `https://${SUPABASE_REF}.supabase.co/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    }
  )

  if (!authRes.ok) {
    const err = (await authRes.json().catch(() => ({}))) as Record<string, string>
    throw new Error(
      `Supabase login failed: ${err.msg || err.error_description || authRes.statusText}`
    )
  }

  const session = (await authRes.json()) as {
    access_token: string
    refresh_token: string
    expires_in: number
    user: Record<string, unknown>
  }

  const tokenPayload = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + session.expires_in,
    expires_in: session.expires_in,
    token_type: 'bearer',
    user: session.user,
  })

  // Encode as chunked Supabase SSR cookies
  const cookieBase = `sb-${SUPABASE_REF}-auth-token`
  const base64url = Buffer.from(tokenPayload)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  const encoded = `base64-${base64url}`

  const chunkSize = 3180
  const chunks: string[] = []
  for (let i = 0; i < encoded.length; i += chunkSize) chunks.push(encoded.slice(i, i + chunkSize))

  const origin = new URL(BASE_URL)
  const cookieDomain = origin.hostname

  await page.context().addCookies(
    chunks.map((chunk, i) => ({
      name: chunks.length === 1 ? cookieBase : `${cookieBase}.${i}`,
      value: chunk,
      domain: cookieDomain,
      path: '/',
      httpOnly: false,
      secure: origin.protocol === 'https:',
      sameSite: 'Lax' as const,
    }))
  )

  // Navigate to set localStorage (needed for client-side Supabase hooks)
  await page.goto(`${BASE_URL}/login`, { timeout: 30000 })
  await page.waitForLoadState('domcontentloaded')
  await page.evaluate(
    ({ ref, token }) => {
      localStorage.setItem(`sb-${ref}-auth-token`, token)
    },
    { ref: SUPABASE_REF, token: tokenPayload }
  )

  // Navigate to workspace to verify auth worked
  await page.goto(`${BASE_URL}/workspace`, { timeout: 30000 })
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(2000)

  console.log('Authenticated successfully')
}

/** Force all framer-motion animated elements to be visible */
async function forceAnimationsVisible(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelectorAll('[style*="opacity"]').forEach((el) => {
      const htmlEl = el as HTMLElement
      if (parseFloat(htmlEl.style.opacity) < 0.1) {
        htmlEl.style.opacity = '1'
      }
    })
    document.querySelectorAll('[style*="transform"]').forEach((el) => {
      const htmlEl = el as HTMLElement
      if (htmlEl.style.transform.includes('translateY')) {
        htmlEl.style.transform = 'none'
      }
    })
  })
  await page.waitForTimeout(300)
}

/** Dismiss onboarding modals and close sidebar for clean marketing shots */
async function prepareForScreenshot(page: Page): Promise<void> {
  // Dismiss any "Welcome to X" / tour modals
  const skipBtn = page.locator('text=Skip tour').first()
  if (await skipBtn.isVisible().catch(() => false)) {
    await skipBtn.click()
    await page.waitForTimeout(500)
  }

  // Close any other modals/overlays
  const closeButtons = page.locator(
    '[aria-label="Close"], button:has-text("Close"), button:has-text("Dismiss")'
  )
  for (let i = 0; i < (await closeButtons.count()); i++) {
    const btn = closeButtons.nth(i)
    if (await btn.isVisible().catch(() => false)) {
      await btn.click()
      await page.waitForTimeout(300)
    }
  }

  // Close the sidebar overlay (X button in top-right of sidebar)
  const sidebarClose = page.locator('aside button, [data-sidebar] button').first()
  if (await sidebarClose.isVisible().catch(() => false)) {
    // Try the X close button at the top of the sidebar
    const xBtn = page
      .locator('button[aria-label*="close" i], button[aria-label*="Close" i]')
      .first()
    if (await xBtn.isVisible().catch(() => false)) {
      await xBtn.click()
      await page.waitForTimeout(500)
    }
  }

  // Inject CSS to hide sidebar and adjust layout
  await page
    .addStyleTag({
      content: `
      aside, [data-sidebar], nav[aria-label="sidebar"] { display: none !important; }
      main, [role="main"] { margin-left: 0 !important; padding-left: 0 !important; width: 100% !important; }
    `,
    })
    .catch(() => {})
  await page.waitForTimeout(300)

  await forceAnimationsVisible(page)
}

interface Shot {
  id: string
  mode: string
  description: string
  capture: (page: Page) => Promise<void>
}

const SHOTS: Shot[] = [
  {
    id: 'workspace-finish',
    mode: 'finish',
    description: 'Finish mode -- audio analysis and production feedback',
    capture: async (page) => {
      await page.goto(`${BASE_URL}/workspace?mode=finish`, { timeout: 30000 })
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(3000)
      await prepareForScreenshot(page)
    },
  },
  {
    id: 'workspace-pitch',
    mode: 'pitch',
    description: 'Pitch mode -- narrative crafting and bio writing',
    capture: async (page) => {
      await page.goto(`${BASE_URL}/workspace?mode=pitch`, { timeout: 30000 })
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(3000)
      await prepareForScreenshot(page)
    },
  },
  {
    id: 'workspace-scout',
    mode: 'scout',
    description: 'Scout mode -- discover playlists, blogs, radio, press',
    capture: async (page) => {
      await page.goto(`${BASE_URL}/workspace?mode=scout`, { timeout: 30000 })
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(3000)
      await prepareForScreenshot(page)
    },
  },
  {
    id: 'workspace-ideas',
    mode: 'ideas',
    description: 'Ideas mode -- capture and organise creative ideas',
    capture: async (page) => {
      await page.goto(`${BASE_URL}/workspace?mode=ideas`, { timeout: 30000 })
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(3000)
      await prepareForScreenshot(page)
    },
  },
  {
    id: 'workspace-timeline',
    mode: 'timeline',
    description: 'Timeline mode -- visual release planning',
    capture: async (page) => {
      await page.goto(`${BASE_URL}/workspace?mode=timeline`, { timeout: 30000 })
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(3000)
      await prepareForScreenshot(page)
    },
  },
]

async function main(): Promise<void> {
  const requested = process.argv.slice(2).map((s) => s.toLowerCase())
  const shots = requested.length > 0 ? SHOTS.filter((s) => requested.includes(s.mode)) : SHOTS

  if (shots.length === 0) {
    console.error('No matching shots. Valid modes:', SHOTS.map((s) => s.mode).join(', '))
    process.exit(1)
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()

  try {
    // Strip CSP headers that block eval() in Next.js dev mode
    await page.route('**/*', async (route) => {
      const response = await route.fetch()
      const headers = { ...response.headers() }
      delete headers['content-security-policy']
      delete headers['x-nonce']
      await route.fulfill({ response, headers })
    })

    await supabaseLogin(page)

    for (const shot of shots) {
      console.log(`Capturing ${shot.id}: ${shot.description}`)
      await shot.capture(page)

      const outPath = path.join(OUTPUT_DIR, `${shot.id}.png`)
      await page.screenshot({ path: outPath, fullPage: false })
      const stat = await fs.stat(outPath)
      console.log(`  Saved: ${outPath} (${Math.round(stat.size / 1024)}KB)`)
    }
  } finally {
    await browser.close()
  }

  console.log(`\nDone. ${shots.length} screenshot(s) saved to apps/aud-web/public/images/landing/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
