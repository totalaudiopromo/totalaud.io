/**
 * Visual Audit Test Suite
 * Captures screenshots of all pages for UI review
 */

import { test, expect } from '@playwright/test'

const PAGES = [
  { name: 'landing', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'signup', path: '/signup' },
  { name: 'workspace-ideas', path: '/workspace?mode=ideas' },
  { name: 'workspace-scout', path: '/workspace?mode=scout' },
  { name: 'workspace-timeline', path: '/workspace?mode=timeline' },
  { name: 'workspace-pitch', path: '/workspace?mode=pitch' },
  { name: 'privacy', path: '/privacy' },
  { name: 'terms', path: '/terms' },
  { name: 'settings', path: '/settings' },
]

test.describe('Visual Audit - All Pages', () => {
  for (const page of PAGES) {
    test(`Screenshot: ${page.name}`, async ({ page: browserPage }) => {
      // Navigate to page
      const response = await browserPage.goto(page.path, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })

      // Log status
      console.log(`[${page.name}] Status: ${response?.status() ?? 'unknown'}`)

      // Wait for any animations to settle
      await browserPage.waitForTimeout(1000)

      // Take full page screenshot
      await browserPage.screenshot({
        path: `tests/output/screenshots/${page.name}-desktop.png`,
        fullPage: true,
      })

      // Check for console errors
      const consoleErrors: string[] = []
      browserPage.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      // Log any issues found
      if (consoleErrors.length > 0) {
        console.log(`[${page.name}] Console errors:`, consoleErrors)
      }
    })
  }
})

test.describe('Visual Audit - Mobile Views', () => {
  test.use({ viewport: { width: 390, height: 844 } }) // iPhone 14 Pro

  for (const page of PAGES) {
    test(`Mobile Screenshot: ${page.name}`, async ({ page: browserPage }) => {
      const response = await browserPage.goto(page.path, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })

      console.log(`[${page.name} mobile] Status: ${response?.status() ?? 'unknown'}`)

      await browserPage.waitForTimeout(1000)

      await browserPage.screenshot({
        path: `tests/output/screenshots/${page.name}-mobile.png`,
        fullPage: true,
      })
    })
  }
})

test.describe('UI Component Audit', () => {
  test('Check favicon meta tags', async ({ page }) => {
    await page.goto('/')

    // Check favicon links
    const faviconLinks = await page.$$eval('link[rel*="icon"]', (links) =>
      links.map((link) => ({
        rel: link.getAttribute('rel'),
        href: link.getAttribute('href'),
        sizes: link.getAttribute('sizes'),
      }))
    )

    console.log('Favicon links found:', JSON.stringify(faviconLinks, null, 2))

    // Check if favicon files are accessible
    for (const link of faviconLinks) {
      if (link.href) {
        const response = await page.request.get(link.href)
        console.log(`Favicon ${link.href}: ${response.status()}`)
      }
    }
  })

  test('Check Pitch page header layout', async ({ page }) => {
    await page.goto('/workspace?mode=pitch')
    await page.waitForTimeout(1000)

    // Get header/nav element bounds
    const header = await page.$('header, nav, [role="navigation"]')
    if (header) {
      const box = await header.boundingBox()
      console.log('Header bounds:', box)
    }

    // Check for any overflow or hidden content
    const overflowIssues = await page.evaluate(() => {
      const issues: string[] = []
      document.querySelectorAll('*').forEach((el) => {
        const style = getComputedStyle(el)
        const rect = el.getBoundingClientRect()
        if (rect.right > window.innerWidth) {
          issues.push(`Element overflows right: ${el.tagName}.${el.className}`)
        }
        if (style.overflow === 'hidden' && el.scrollWidth > el.clientWidth) {
          issues.push(`Content hidden by overflow: ${el.tagName}.${el.className}`)
        }
      })
      return issues.slice(0, 10) // Limit to first 10 issues
    })

    if (overflowIssues.length > 0) {
      console.log('Overflow issues found:', overflowIssues)
    }

    // Take screenshot of header area
    await page.screenshot({
      path: 'tests/output/screenshots/pitch-header-detail.png',
      clip: { x: 0, y: 0, width: 1920, height: 300 },
    })
  })

  test('Check all navigation modes', async ({ page }) => {
    await page.goto('/workspace?mode=ideas')
    await page.waitForTimeout(500)

    // Find and click each nav item
    const navItems = ['Ideas', 'Scout', 'Timeline', 'Pitch']

    for (const item of navItems) {
      // Try to find the nav button/link
      const navButton = await page.$(`text=${item}`)
      if (navButton) {
        await navButton.click()
        await page.waitForTimeout(500)

        // Take screenshot of this mode
        await page.screenshot({
          path: `tests/output/screenshots/nav-${item.toLowerCase()}.png`,
          fullPage: false,
        })

        console.log(`Nav to ${item}: Success`)
      } else {
        console.log(`Nav to ${item}: Button not found`)
      }
    }
  })

  test('Check dropdown visibility on Pitch page', async ({ page }) => {
    await page.goto('/workspace?mode=pitch')
    await page.waitForTimeout(1000)

    // Look for dropdown elements
    const dropdowns = await page.$$(
      'select, [role="listbox"], [role="combobox"], .dropdown, [data-dropdown]'
    )
    console.log(`Found ${dropdowns.length} dropdown elements`)

    // Check for any popover/menu components
    const menus = await page.$$('[role="menu"], .menu, .popover')
    console.log(`Found ${menus.length} menu/popover elements`)

    // Get all clickable elements in header area
    const headerButtons = await page.$$eval(
      'header button, nav button, [class*="header"] button',
      (buttons) =>
        buttons.map((btn) => ({
          text: btn.textContent?.trim(),
          visible: btn.offsetParent !== null,
          bounds: btn.getBoundingClientRect(),
        }))
    )

    console.log('Header buttons:', JSON.stringify(headerButtons, null, 2))
  })
})
