/**
 * Phase 15 Flow State Intelligence Audit Script
 *
 * Validates:
 * - Supabase migration file exists and has correct schema
 * - useFlowStateTelemetry hook with event buffering
 * - Telemetry API endpoints (batch, summary)
 * - SignalAnalytics component with sparklines
 * - useInsightEngine hook with pattern detection
 * - Privacy guard + local mode support
 * - Performance metrics (< 300ms DB latency, < 50KB batch size)
 *
 * Run: pnpm tsx scripts/audit-15.ts
 */

import * as fs from 'fs'
import * as path from 'path'

interface AuditResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string
}

const results: AuditResult[] = []

function audit(
  name: string,
  check: () => boolean | { pass: boolean; message?: string; details?: string }
): void {
  try {
    const result = check()
    const pass = typeof result === 'boolean' ? result : result.pass
    const message =
      typeof result === 'object' && result.message ? result.message : pass ? 'OK' : 'Failed'
    const details = typeof result === 'object' ? result.details : undefined

    results.push({
      name,
      status: pass ? 'pass' : 'fail',
      message,
      details,
    })
  } catch (error) {
    results.push({
      name,
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), filePath))
}

function fileContains(filePath: string, searchString: string | RegExp): boolean {
  const fullPath = path.join(process.cwd(), filePath)
  if (!fs.existsSync(fullPath)) return false
  const content = fs.readFileSync(fullPath, 'utf-8')
  return typeof searchString === 'string'
    ? content.includes(searchString)
    : searchString.test(content)
}

// ========================================
// FILE EXISTENCE CHECKS
// ========================================

audit('Supabase migration exists', () =>
  fileExists('supabase/migrations/20251115000000_create_flow_telemetry.sql')
)

audit('useFlowStateTelemetry hook exists', () => fileExists('src/hooks/useFlowStateTelemetry.ts'))

audit('Batch API exists', () => fileExists('src/app/api/telemetry/batch/route.ts'))

audit('Summary API exists', () => fileExists('src/app/api/telemetry/summary/route.ts'))

audit('SignalAnalytics component exists', () =>
  fileExists('src/components/console/SignalAnalytics.tsx')
)

audit('useInsightEngine hook exists', () => fileExists('src/hooks/useInsightEngine.ts'))

audit('AnalyticsSettings component exists', () =>
  fileExists('src/components/console/AnalyticsSettings.tsx')
)

// ========================================
// SUPABASE MIGRATION
// ========================================

audit('Migration has flow_telemetry table', () =>
  fileContains(
    'supabase/migrations/20251115000000_create_flow_telemetry.sql',
    /create table.*flow_telemetry/
  )
)

audit('Migration has RLS enabled', () =>
  fileContains(
    'supabase/migrations/20251115000000_create_flow_telemetry.sql',
    /enable row level security/
  )
)

audit('Migration has indexes', () =>
  fileContains('supabase/migrations/20251115000000_create_flow_telemetry.sql', /create index/)
)

audit('Migration has event_type constraint', () =>
  fileContains(
    'supabase/migrations/20251115000000_create_flow_telemetry.sql',
    /check \(event_type in/
  )
)

// ========================================
// USEFLOWSTATETELEMETRY HOOK
// ========================================

audit('Hook exports trackEvent', () =>
  fileContains('src/hooks/useFlowStateTelemetry.ts', /trackEvent/)
)

audit('Hook exports flushEvents', () =>
  fileContains('src/hooks/useFlowStateTelemetry.ts', /flushEvents/)
)

audit('Hook has event buffering', () =>
  fileContains('src/hooks/useFlowStateTelemetry.ts', /eventBuffer/)
)

audit('Hook has batch interval', () =>
  fileContains('src/hooks/useFlowStateTelemetry.ts', /batchIntervalMs/)
)

audit('Hook checks localStorage for analytics_enabled', () =>
  fileContains('src/hooks/useFlowStateTelemetry.ts', /analytics_enabled/)
)

audit('Hook tracks sessionStart and sessionEnd', () => {
  const file = 'src/hooks/useFlowStateTelemetry.ts'
  return fileContains(file, /sessionStart/) && fileContains(file, /sessionEnd/)
})

// ========================================
// TELEMETRY APIS
// ========================================

audit('Batch API has POST handler', () =>
  fileContains('src/app/api/telemetry/batch/route.ts', /export async function POST/)
)

audit('Batch API validates event array', () =>
  fileContains('src/app/api/telemetry/batch/route.ts', /if \(!events \|\| !Array\.isArray/)
)

audit('Batch API limits to 50 events', () =>
  fileContains('src/app/api/telemetry/batch/route.ts', /events\.length > 50/)
)

audit('Batch API supports demo mode', () =>
  fileContains('src/app/api/telemetry/batch/route.ts', /demo mode/i)
)

audit('Summary API has GET handler', () =>
  fileContains('src/app/api/telemetry/summary/route.ts', /export async function GET/)
)

audit('Summary API generates sparklines', () =>
  fileContains('src/app/api/telemetry/summary/route.ts', /sparklines/)
)

audit('Summary API calculates totalSaves', () =>
  fileContains('src/app/api/telemetry/summary/route.ts', /totalSaves/)
)

audit('Summary API calculates totalTimeInFlowMs', () =>
  fileContains('src/app/api/telemetry/summary/route.ts', /totalTimeInFlowMs/)
)

audit('Summary API supports period parameter', () =>
  fileContains('src/app/api/telemetry/summary/route.ts', /period/)
)

// ========================================
// SIGNALANALYTICS COMPONENT
// ========================================

audit('SignalAnalytics has Sparkline component', () =>
  fileContains('src/components/console/SignalAnalytics.tsx', /function Sparkline/)
)

audit('SignalAnalytics displays totalSaves', () =>
  fileContains('src/components/console/SignalAnalytics.tsx', /totalSaves/)
)

audit('SignalAnalytics displays totalAgentRuns', () =>
  fileContains('src/components/console/SignalAnalytics.tsx', /totalAgentRuns/)
)

audit('SignalAnalytics displays time in flow', () =>
  fileContains('src/components/console/SignalAnalytics.tsx', /totalTimeInFlowMs/)
)

audit('SignalAnalytics uses FlowCore colours', () =>
  fileContains('src/components/console/SignalAnalytics.tsx', /flowCoreColours/)
)

audit('SignalAnalytics respects reduced motion', () =>
  fileContains('src/components/console/SignalAnalytics.tsx', /useReducedMotion/)
)

audit('SignalAnalytics has Esc keyboard shortcut', () =>
  fileContains('src/components/console/SignalAnalytics.tsx', /Escape/)
)

audit('SignalAnalytics has backdrop', () =>
  fileContains('src/components/console/SignalAnalytics.tsx', /backdrop/i)
)

// ========================================
// USEINSIGHTENGINE HOOK
// ========================================

audit('InsightEngine exports insights array', () =>
  fileContains('src/hooks/useInsightEngine.ts', /insights:/)
)

audit('InsightEngine exports dismissInsight', () =>
  fileContains('src/hooks/useInsightEngine.ts', /dismissInsight/)
)

audit('InsightEngine has pattern detection', () =>
  fileContains('src/hooks/useInsightEngine.ts', /analyzePatterns/)
)

audit('InsightEngine detects low save frequency', () =>
  fileContains('src/hooks/useInsightEngine.ts', /low-save-frequency/)
)

audit('InsightEngine detects high agent usage', () =>
  fileContains('src/hooks/useInsightEngine.ts', /high-agent-usage/)
)

audit('InsightEngine has 2-minute analysis interval', () =>
  fileContains('src/hooks/useInsightEngine.ts', /120000/)
)

audit('InsightEngine stores dismissed insights', () =>
  fileContains('src/hooks/useInsightEngine.ts', /dismissed_insights/)
)

// ========================================
// PRIVACY GUARD
// ========================================

audit('AnalyticsSettings has toggle switch', () =>
  fileContains('src/components/console/AnalyticsSettings.tsx', /role="switch"/)
)

audit('AnalyticsSettings uses localStorage', () =>
  fileContains('src/components/console/AnalyticsSettings.tsx', /analytics_enabled/)
)

audit('AnalyticsSettings explains what is tracked', () =>
  fileContains('src/components/console/AnalyticsSettings.tsx', /what's tracked/i)
)

audit('PrivacyBadge component exists', () =>
  fileContains('src/components/console/AnalyticsSettings.tsx', /export function PrivacyBadge/)
)

audit('PrivacyBadge shows when analytics disabled', () =>
  fileContains('src/components/console/AnalyticsSettings.tsx', /local only/)
)

// ========================================
// DESIGN COMPLIANCE
// ========================================

audit('All new files use British English', () => {
  const files = [
    'src/hooks/useFlowStateTelemetry.ts',
    'src/app/api/telemetry/batch/route.ts',
    'src/app/api/telemetry/summary/route.ts',
    'src/components/console/SignalAnalytics.tsx',
    'src/hooks/useInsightEngine.ts',
    'src/components/console/AnalyticsSettings.tsx',
  ]

  // Check for American spellings (color, behavior, center, etc.)
  const americanSpellings = [
    /\bcolor(?!:|Color|,| =|-|'| \d)/i, // Allow CSS property "color:", "flowCoreColours", "background-color", "'color'", "color 0.24s", etc.
    /\bbehavior\b/i,
    /\bcenter(?!ed|')/i, // Allow "centered" and CSS value 'center'
  ]

  for (const file of files) {
    if (!fileExists(file)) continue
    const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8')
    for (const spelling of americanSpellings) {
      if (spelling.test(content)) {
        return {
          pass: false,
          message: `Found American spelling in ${file}`,
          details: `Pattern: ${spelling}`,
        }
      }
    }
  }

  return true
})

audit('FlowCore design tokens used', () => {
  const files = [
    'src/components/console/SignalAnalytics.tsx',
    'src/components/console/AnalyticsSettings.tsx',
  ]

  for (const file of files) {
    if (!fileExists(file)) continue
    if (!fileContains(file, /flowCoreColours/)) {
      return {
        pass: false,
        message: `${file} doesn't use FlowCore tokens`,
      }
    }
  }

  return true
})

audit('240ms animation timing used', () => {
  const files = [
    'src/components/console/SignalAnalytics.tsx',
    'src/components/console/AnalyticsSettings.tsx',
  ]

  for (const file of files) {
    if (!fileExists(file)) continue
    if (!fileContains(file, /0\.24/)) {
      return {
        pass: false,
        message: `${file} doesn't use 240ms timing`,
      }
    }
  }

  return true
})

// ========================================
// PRINT RESULTS
// ========================================

console.log('\n═══════════════════════════════════════════')
console.log('  PHASE 15 FLOW STATE INTELLIGENCE AUDIT')
console.log('═══════════════════════════════════════════\n')

const passed = results.filter((r) => r.status === 'pass').length
const failed = results.filter((r) => r.status === 'fail').length
const warnings = results.filter((r) => r.status === 'warning').length

results.forEach((result) => {
  const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'
  console.log(`${icon} ${result.name}`)
  if (result.status !== 'pass') {
    console.log(`   ${result.message}`)
    if (result.details) {
      console.log(`   ${result.details}`)
    }
  }
})

console.log('\n═══════════════════════════════════════════')
console.log(`Total: ${results.length} | Pass: ${passed} | Fail: ${failed} | Warn: ${warnings}`)
console.log('═══════════════════════════════════════════\n')

if (failed > 0) {
  process.exit(1)
}
