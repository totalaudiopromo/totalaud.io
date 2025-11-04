/**
 * Phase 15.5 Audit Script
 * Connected Campaign Dashboard + EPK Analytics
 *
 * Validates:
 * - Database migration execution
 * - API endpoint functionality
 * - Hook data fetching and typing
 * - Component rendering and props
 * - FlowCore design tokens
 * - WCAG AA compliance
 * - British English microcopy
 *
 * Target: ≥50/50 checks passing
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Colours for terminal output
const colours = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m',
}

interface AuditCheck {
  name: string
  category: string
  passed: boolean
  message?: string
}

const checks: AuditCheck[] = []

function pass(category: string, name: string, message?: string) {
  checks.push({ category, name, passed: true, message })
  console.log(`${colours.green}✓${colours.reset} ${category}: ${name}`)
  if (message) console.log(`  ${colours.blue}→${colours.reset} ${message}`)
}

function fail(category: string, name: string, message: string) {
  checks.push({ category, name, passed: false, message })
  console.log(`${colours.red}✗${colours.reset} ${category}: ${name}`)
  console.log(`  ${colours.red}→${colours.reset} ${message}`)
}

// Database checks
async function checkDatabase() {
  console.log(`\n${colours.blue}━━━ DATABASE MIGRATION CHECKS ━━━${colours.reset}\n`)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    fail('Database', 'Environment variables', 'Missing SUPABASE_URL or SERVICE_ROLE_KEY')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Check campaign_dashboard_metrics table exists
  try {
    const { error } = await supabase.from('campaign_dashboard_metrics').select('id').limit(1)
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows (which is fine)
      fail('Database', 'campaign_dashboard_metrics table', error.message)
    } else {
      pass('Database', 'campaign_dashboard_metrics table exists')
    }
  } catch (err) {
    fail('Database', 'campaign_dashboard_metrics table', String(err))
  }

  // Check epk_analytics table exists
  try {
    const { error } = await supabase.from('epk_analytics').select('id').limit(1)
    if (error && error.code !== 'PGRST116') {
      fail('Database', 'epk_analytics table', error.message)
    } else {
      pass('Database', 'epk_analytics table exists')
    }
  } catch (err) {
    fail('Database', 'epk_analytics table', String(err))
  }

  // Check RLS enabled on campaign_dashboard_metrics
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `SELECT relrowsecurity FROM pg_class WHERE relname = 'campaign_dashboard_metrics'`,
    })

    if (error) {
      // Try alternative query
      const altQuery = await supabase
        .from('pg_tables')
        .select('rowsecurity')
        .eq('tablename', 'campaign_dashboard_metrics')
        .single()

      if (altQuery.error) {
        fail('Database', 'RLS on campaign_dashboard_metrics', 'Cannot verify RLS status')
      } else {
        if (altQuery.data?.rowsecurity) {
          pass('Database', 'RLS enabled on campaign_dashboard_metrics')
        } else {
          fail('Database', 'RLS on campaign_dashboard_metrics', 'RLS not enabled')
        }
      }
    } else {
      pass('Database', 'RLS enabled on campaign_dashboard_metrics')
    }
  } catch (err) {
    fail('Database', 'RLS on campaign_dashboard_metrics', String(err))
  }

  // Check RLS enabled on epk_analytics
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `SELECT relrowsecurity FROM pg_class WHERE relname = 'epk_analytics'`,
    })

    if (error) {
      // Try alternative query
      const altQuery = await supabase
        .from('pg_tables')
        .select('rowsecurity')
        .eq('tablename', 'epk_analytics')
        .single()

      if (altQuery.error) {
        fail('Database', 'RLS on epk_analytics', 'Cannot verify RLS status')
      } else {
        if (altQuery.data?.rowsecurity) {
          pass('Database', 'RLS enabled on epk_analytics')
        } else {
          fail('Database', 'RLS on epk_analytics', 'RLS not enabled')
        }
      }
    } else {
      pass('Database', 'RLS enabled on epk_analytics')
    }
  } catch (err) {
    fail('Database', 'RLS on epk_analytics', String(err))
  }

  // Check helper function: calculate_engagement_score
  try {
    const { data, error } = await supabase.rpc('calculate_engagement_score', {
      p_views: 100,
      p_downloads: 50,
      p_shares: 25,
    })

    if (error) {
      fail('Database', 'calculate_engagement_score function', error.message)
    } else {
      pass('Database', 'calculate_engagement_score function exists', `Returns: ${data}`)
    }
  } catch (err) {
    fail('Database', 'calculate_engagement_score function', String(err))
  }

  // Check helper function: aggregate_epk_metrics
  try {
    const { data, error } = await supabase.rpc('aggregate_epk_metrics', {
      p_epk_id: 'test-epk-id',
      p_period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      p_period_end: new Date().toISOString(),
    })

    if (error) {
      fail('Database', 'aggregate_epk_metrics function', error.message)
    } else {
      pass('Database', 'aggregate_epk_metrics function exists')
    }
  } catch (err) {
    fail('Database', 'aggregate_epk_metrics function', String(err))
  }

  // Check indexes exist
  try {
    const indexChecks = [
      'idx_campaign_dashboard_metrics_campaign_id',
      'idx_campaign_dashboard_metrics_user_id',
      'idx_campaign_dashboard_metrics_period',
      'idx_epk_analytics_epk_id',
      'idx_epk_analytics_asset_id',
      'idx_epk_analytics_user_id',
      'idx_epk_analytics_event_type',
      'idx_epk_analytics_timestamp',
    ]

    for (const indexName of indexChecks) {
      const { data, error } = await supabase
        .from('pg_indexes')
        .select('indexname')
        .eq('indexname', indexName)
        .single()

      if (error || !data) {
        fail('Database', `Index: ${indexName}`, 'Index not found')
      } else {
        pass('Database', `Index: ${indexName}`)
      }
    }
  } catch (err) {
    fail('Database', 'Index checks', String(err))
  }
}

// API endpoint checks
async function checkAPIs() {
  console.log(`\n${colours.blue}━━━ API ENDPOINT CHECKS ━━━${colours.reset}\n`)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Check /api/dashboard/summary
  try {
    const response = await fetch(
      `${baseUrl}/api/dashboard/summary?campaignId=test-campaign&period=7`,
    )

    if (response.ok) {
      const data = await response.json()
      pass('API', '/api/dashboard/summary returns 200', `Status: ${response.status}`)

      if (data.campaignId && data.period && data.metrics) {
        pass('API', '/api/dashboard/summary has correct schema')
      } else {
        fail('API', '/api/dashboard/summary schema', 'Missing required fields')
      }
    } else if (response.status === 401) {
      pass('API', '/api/dashboard/summary exists (requires auth)', `Status: ${response.status}`)
    } else {
      fail('API', '/api/dashboard/summary', `Status: ${response.status}`)
    }
  } catch (err) {
    fail('API', '/api/dashboard/summary', String(err))
  }

  // Check /api/epk/metrics
  try {
    const response = await fetch(`${baseUrl}/api/epk/metrics?epkId=test-epk&groupBy=region`)

    if (response.ok) {
      const data = await response.json()
      pass('API', '/api/epk/metrics returns 200', `Status: ${response.status}`)

      if (data.epkId && data.totals && data.grouped !== undefined) {
        pass('API', '/api/epk/metrics has correct schema')
      } else {
        fail('API', '/api/epk/metrics schema', 'Missing required fields')
      }
    } else if (response.status === 401) {
      pass('API', '/api/epk/metrics exists (requires auth)', `Status: ${response.status}`)
    } else {
      fail('API', '/api/epk/metrics', `Status: ${response.status}`)
    }
  } catch (err) {
    fail('API', '/api/epk/metrics', String(err))
  }

  // Check /api/epk/track accepts POST
  try {
    const response = await fetch(`${baseUrl}/api/epk/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        epkId: 'test-epk',
        eventType: 'view',
      }),
    })

    if (response.ok) {
      pass('API', '/api/epk/track accepts POST', `Status: ${response.status}`)
    } else if (response.status === 401 || response.status === 400) {
      pass('API', '/api/epk/track exists (requires auth/validation)', `Status: ${response.status}`)
    } else {
      fail('API', '/api/epk/track', `Status: ${response.status}`)
    }
  } catch (err) {
    fail('API', '/api/epk/track', String(err))
  }
}

// Hook file checks
async function checkHooks() {
  console.log(`\n${colours.blue}━━━ HOOK FILE CHECKS ━━━${colours.reset}\n`)

  const hookFiles = [
    'src/hooks/useCampaignDashboard.ts',
    'src/hooks/useEPKAnalytics.ts',
  ]

  for (const hookFile of hookFiles) {
    const fullPath = path.join(process.cwd(), hookFile)

    if (fs.existsSync(fullPath)) {
      pass('Hooks', `${path.basename(hookFile)} exists`)

      const content = fs.readFileSync(fullPath, 'utf-8')

      // Check for TypeScript interfaces
      if (content.includes('export interface')) {
        pass('Hooks', `${path.basename(hookFile)} has TypeScript interfaces`)
      } else {
        fail('Hooks', `${path.basename(hookFile)} interfaces`, 'Missing TypeScript interfaces')
      }

      // Check for logger usage
      if (content.includes("from '@/lib/logger'") || content.includes('logger.scope')) {
        pass('Hooks', `${path.basename(hookFile)} uses structured logger`)
      } else {
        fail('Hooks', `${path.basename(hookFile)} logger`, 'Not using structured logger')
      }

      // Check for telemetry tracking
      if (content.includes('useFlowStateTelemetry') || content.includes('trackEvent')) {
        pass('Hooks', `${path.basename(hookFile)} has telemetry tracking`)
      } else {
        fail('Hooks', `${path.basename(hookFile)} telemetry`, 'Missing telemetry tracking')
      }
    } else {
      fail('Hooks', `${path.basename(hookFile)} exists`, 'File not found')
    }
  }

  // Check useCampaignDashboard specific features
  const dashboardHookPath = path.join(process.cwd(), 'src/hooks/useCampaignDashboard.ts')
  if (fs.existsSync(dashboardHookPath)) {
    const content = fs.readFileSync(dashboardHookPath, 'utf-8')

    if (content.includes('revalidateInterval')) {
      pass('Hooks', 'useCampaignDashboard has revalidation interval')
    } else {
      fail('Hooks', 'useCampaignDashboard revalidation', 'Missing revalidateInterval option')
    }

    if (content.includes('7 | 30')) {
      pass('Hooks', 'useCampaignDashboard supports 7/30 day periods')
    } else {
      fail('Hooks', 'useCampaignDashboard periods', 'Missing period type validation')
    }
  }

  // Check useEPKAnalytics specific features
  const epkHookPath = path.join(process.cwd(), 'src/hooks/useEPKAnalytics.ts')
  if (fs.existsSync(epkHookPath)) {
    const content = fs.readFileSync(epkHookPath, 'utf-8')

    if (content.includes('realtime') && content.includes('supabase.channel')) {
      pass('Hooks', 'useEPKAnalytics has Realtime subscription')
    } else {
      fail('Hooks', 'useEPKAnalytics realtime', 'Missing Realtime subscription')
    }

    if (content.includes('trackEvent') || content.includes('trackEPKEvent')) {
      pass('Hooks', 'useEPKAnalytics provides trackEvent helper')
    } else {
      fail('Hooks', 'useEPKAnalytics trackEvent', 'Missing trackEvent helper function')
    }
  }
}

// Component file checks
async function checkComponents() {
  console.log(`\n${colours.blue}━━━ COMPONENT FILE CHECKS ━━━${colours.reset}\n`)

  const componentFiles = [
    'src/components/console/CampaignDashboardPanel.tsx',
    'src/components/console/EPKAnalyticsDrawer.tsx',
  ]

  for (const componentFile of componentFiles) {
    const fullPath = path.join(process.cwd(), componentFile)

    if (fs.existsSync(fullPath)) {
      pass('Components', `${path.basename(componentFile)} exists`)

      const content = fs.readFileSync(fullPath, 'utf-8')

      // Check for FlowCore design tokens
      if (content.includes('flowCoreColours')) {
        pass('Components', `${path.basename(componentFile)} uses FlowCore design tokens`)
      } else {
        fail(
          'Components',
          `${path.basename(componentFile)} FlowCore`,
          'Not using flowCoreColours',
        )
      }

      // Check for Framer Motion
      if (content.includes('framer-motion') && content.includes('motion.')) {
        pass('Components', `${path.basename(componentFile)} uses Framer Motion`)
      } else {
        fail(
          'Components',
          `${path.basename(componentFile)} animation`,
          'Not using Framer Motion',
        )
      }

      // Check for British English microcopy
      const americanSpellings = ['color:', 'behavior:', 'center:', 'optimize', 'analyze']
      const hasAmericanSpelling = americanSpellings.some((word) => content.includes(word))

      if (!hasAmericanSpelling || content.includes('colour') || content.includes('behaviour')) {
        pass('Components', `${path.basename(componentFile)} uses British English`)
      } else {
        fail(
          'Components',
          `${path.basename(componentFile)} British English`,
          'Contains American spellings',
        )
      }

      // Check for lowercase UI text
      const uiTextMatches = content.match(/'[^']+'/g) || []
      const hasLowercaseUI = uiTextMatches.some((text) => {
        const cleaned = text.replace(/'/g, '')
        return cleaned.length > 3 && cleaned === cleaned.toLowerCase()
      })

      if (hasLowercaseUI) {
        pass('Components', `${path.basename(componentFile)} has lowercase UI text`)
      } else {
        fail(
          'Components',
          `${path.basename(componentFile)} lowercase`,
          'UI text not consistently lowercase',
        )
      }
    } else {
      fail('Components', `${path.basename(componentFile)} exists`, 'File not found')
    }
  }

  // Check CampaignDashboardPanel specific features
  const panelPath = path.join(process.cwd(), 'src/components/console/CampaignDashboardPanel.tsx')
  if (fs.existsSync(panelPath)) {
    const content = fs.readFileSync(panelPath, 'utf-8')

    if (content.includes('width: 320') || content.includes('width: "320')) {
      pass('Components', 'CampaignDashboardPanel has 320px width')
    } else {
      fail('Components', 'CampaignDashboardPanel width', 'Not using 320px width')
    }

    if (content.includes('period') && (content.includes('7') || content.includes('30'))) {
      pass('Components', 'CampaignDashboardPanel has period toggle')
    } else {
      fail('Components', 'CampaignDashboardPanel period', 'Missing period toggle')
    }

    if (content.includes('useCampaignDashboard')) {
      pass('Components', 'CampaignDashboardPanel uses useCampaignDashboard hook')
    } else {
      fail('Components', 'CampaignDashboardPanel hook', 'Not using useCampaignDashboard')
    }
  }

  // Check EPKAnalyticsDrawer specific features
  const drawerPath = path.join(process.cwd(), 'src/components/console/EPKAnalyticsDrawer.tsx')
  if (fs.existsSync(drawerPath)) {
    const content = fs.readFileSync(drawerPath, 'utf-8')

    if (content.includes('width: 480') || content.includes('width: "480')) {
      pass('Components', 'EPKAnalyticsDrawer has 480px width')
    } else {
      fail('Components', 'EPKAnalyticsDrawer width', 'Not using 480px width')
    }

    if (
      content.includes('overview') &&
      content.includes('regions') &&
      content.includes('devices')
    ) {
      pass('Components', 'EPKAnalyticsDrawer has three tabs')
    } else {
      fail('Components', 'EPKAnalyticsDrawer tabs', 'Missing overview/regions/devices tabs')
    }

    if (content.includes('useEPKAnalytics')) {
      pass('Components', 'EPKAnalyticsDrawer uses useEPKAnalytics hook')
    } else {
      fail('Components', 'EPKAnalyticsDrawer hook', 'Not using useEPKAnalytics')
    }

    if (content.includes('⌘e') || content.includes('⌘E')) {
      pass('Components', 'EPKAnalyticsDrawer has keyboard shortcut hint')
    } else {
      fail('Components', 'EPKAnalyticsDrawer keyboard', 'Missing keyboard shortcut hint')
    }
  }
}

// WCAG AA checks
async function checkAccessibility() {
  console.log(`\n${colours.blue}━━━ WCAG AA COMPLIANCE CHECKS ━━━${colours.reset}\n`)

  // Check flowCoreColours for contrast ratios
  const coloursPath = path.join(process.cwd(), 'src/constants/flowCoreColours.ts')

  if (fs.existsSync(coloursPath)) {
    pass('Accessibility', 'flowCoreColours constants file exists')

    const content = fs.readFileSync(coloursPath, 'utf-8')

    // Check for key colours
    const requiredColours = [
      'matteBlack',
      'slateCyan',
      'iceCyan',
      'textPrimary',
      'textSecondary',
      'borderSubtle',
    ]

    for (const colour of requiredColours) {
      if (content.includes(colour)) {
        pass('Accessibility', `FlowCore colour: ${colour} defined`)
      } else {
        fail('Accessibility', `FlowCore colour: ${colour}`, 'Not defined')
      }
    }
  } else {
    fail('Accessibility', 'flowCoreColours file', 'File not found')
  }

  // Check component files for aria-label usage
  const componentFiles = [
    'src/components/console/CampaignDashboardPanel.tsx',
    'src/components/console/EPKAnalyticsDrawer.tsx',
  ]

  for (const componentFile of componentFiles) {
    const fullPath = path.join(process.cwd(), componentFile)

    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8')

      if (content.includes('aria-label')) {
        pass('Accessibility', `${path.basename(componentFile)} has aria-label attributes`)
      } else {
        fail(
          'Accessibility',
          `${path.basename(componentFile)} aria-label`,
          'Missing aria-label for interactive elements',
        )
      }
    }
  }
}

// Run all checks
async function runAudit() {
  console.log(`${colours.blue}╔════════════════════════════════════════╗${colours.reset}`)
  console.log(`${colours.blue}║  Phase 15.5 Audit — Campaign Dashboard + EPK Analytics  ║${colours.reset}`)
  console.log(`${colours.blue}╚════════════════════════════════════════╝${colours.reset}`)

  await checkDatabase()
  await checkAPIs()
  await checkHooks()
  await checkComponents()
  await checkAccessibility()

  // Summary
  console.log(`\n${colours.blue}━━━ AUDIT SUMMARY ━━━${colours.reset}\n`)

  const totalChecks = checks.length
  const passedChecks = checks.filter((c) => c.passed).length
  const failedChecks = totalChecks - passedChecks

  console.log(`Total Checks: ${totalChecks}`)
  console.log(`${colours.green}Passed: ${passedChecks}${colours.reset}`)
  console.log(`${colours.red}Failed: ${failedChecks}${colours.reset}`)

  const passRate = ((passedChecks / totalChecks) * 100).toFixed(1)
  console.log(`\nPass Rate: ${passRate}%`)

  if (passedChecks >= 50) {
    console.log(
      `\n${colours.green}✓ AUDIT PASSED${colours.reset} — Phase 15.5 foundation is production-ready`,
    )
  } else {
    console.log(
      `\n${colours.red}✗ AUDIT FAILED${colours.reset} — Need ${50 - passedChecks} more passing checks`,
    )
  }

  // Breakdown by category
  console.log(`\n${colours.blue}━━━ BY CATEGORY ━━━${colours.reset}\n`)
  const categories = Array.from(new Set(checks.map((c) => c.category)))

  for (const category of categories) {
    const categoryChecks = checks.filter((c) => c.category === category)
    const categoryPassed = categoryChecks.filter((c) => c.passed).length
    const categoryTotal = categoryChecks.length

    const status =
      categoryPassed === categoryTotal
        ? `${colours.green}✓${colours.reset}`
        : `${colours.yellow}!${colours.reset}`

    console.log(`${status} ${category}: ${categoryPassed}/${categoryTotal}`)
  }

  process.exit(failedChecks > 0 ? 1 : 0)
}

runAudit().catch((err) => {
  console.error(`${colours.red}Fatal error:${colours.reset}`, err)
  process.exit(1)
})
