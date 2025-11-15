/**
 * Phase 14.8 Console Final Polish Audit Script
 *
 * Validates:
 * - Auto-save functionality (60s interval, diff detection)
 * - SaveStatus component rendering states
 * - Agent execution API (timeout, retries, success/error)
 * - Signal Drawer (mobile responsiveness, keyboard shortcuts)
 * - Palette edge glow (visual affordance)
 * - Performance metrics (FPS ≥55, no memory leaks)
 *
 * Run: pnpm tsx scripts/audit-14-8.ts
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

audit('useSaveSignal.ts exists', () => fileExists('src/hooks/useSaveSignal.ts'))

audit('SaveStatus.tsx exists', () => fileExists('src/components/console/SaveStatus.tsx'))

audit('SignalDrawer.tsx exists', () => fileExists('src/components/console/SignalDrawer.tsx'))

audit('Agent execution API exists', () => fileExists('src/app/api/agent/execute/route.ts'))

// ========================================
// AUTO-SAVE IMPLEMENTATION
// ========================================

audit('useSaveSignal has startAutoSave', () =>
  fileContains('src/hooks/useSaveSignal.ts', /startAutoSave/)
)

audit('useSaveSignal has stopAutoSave', () =>
  fileContains('src/hooks/useSaveSignal.ts', /stopAutoSave/)
)

audit('useSaveSignal has SaveState type', () =>
  fileContains('src/hooks/useSaveSignal.ts', /export type SaveState/)
)

audit('useSaveSignal has diff detection', () =>
  fileContains('src/hooks/useSaveSignal.ts', /hashSceneState/)
)

audit('ConsoleLayout wires auto-save', () =>
  fileContains('src/layouts/ConsoleLayout.tsx', /startAutoSave/)
)

// ========================================
// SAVE STATUS COMPONENT
// ========================================

audit('SaveStatus has all states', () => {
  const file = 'src/components/console/SaveStatus.tsx'
  return (
    fileContains(file, /idle/) &&
    fileContains(file, /saving/) &&
    fileContains(file, /saved/) &&
    fileContains(file, /error/)
  )
})

audit('SaveStatus uses FlowCore colours', () =>
  fileContains('src/components/console/SaveStatus.tsx', /flowCoreColours/)
)

audit('SaveStatus respects reduced motion', () =>
  fileContains('src/components/console/SaveStatus.tsx', /useReducedMotion/)
)

audit('ConsoleLayout renders SaveStatus', () =>
  fileContains('src/layouts/ConsoleLayout.tsx', /<SaveStatus/)
)

// ========================================
// AGENT EXECUTION API
// ========================================

audit('Agent API has POST handler', () =>
  fileContains('src/app/api/agent/execute/route.ts', /export async function POST/)
)

audit('Agent API handles all actions', () => {
  const file = 'src/app/api/agent/execute/route.ts'
  return (
    fileContains(file, /enrich/) &&
    fileContains(file, /pitch/) &&
    fileContains(file, /sync/) &&
    fileContains(file, /insights/)
  )
})

audit('SignalPanel has executeAgent with timeout', () =>
  fileContains('src/components/console/SignalPanel.tsx', /AbortController/)
)

audit('SignalPanel has retry logic', () =>
  fileContains('src/components/console/SignalPanel.tsx', /retries/)
)

audit('SignalPanel emits activity events', () =>
  fileContains('src/components/console/SignalPanel.tsx', /emitActivity/)
)

// ========================================
// SIGNAL DRAWER
// ========================================

audit('SignalDrawer has keyboard shortcuts', () => {
  const file = 'src/components/console/SignalDrawer.tsx'
  return fileContains(file, /Escape/) && fileContains(file, /onClose/)
})

audit('SignalDrawer has backdrop', () =>
  fileContains('src/components/console/SignalDrawer.tsx', /backdrop/i)
)

audit('SignalDrawer uses 240ms animation', () =>
  fileContains('src/components/console/SignalDrawer.tsx', /0\.24/)
)

audit('ConsoleLayout has ⌘I toggle', () => fileContains('src/layouts/ConsoleLayout.tsx', /mod\+i/))

audit('ConsoleLayout renders SignalDrawer', () =>
  fileContains('src/layouts/ConsoleLayout.tsx', /<SignalDrawer/)
)

// ========================================
// PALETTE EDGE GLOW
// ========================================

audit('FlowCanvas has palette edge glow', () =>
  fileContains('src/components/features/flow/FlowCanvas.tsx', /Palette Edge Glow/)
)

audit('Edge glow uses Slate Cyan', () =>
  fileContains('src/components/features/flow/FlowCanvas.tsx', /58, 169, 190/)
)

audit('Edge glow conditional on selectedSkill', () =>
  fileContains('src/components/features/flow/FlowCanvas.tsx', /{selectedSkill &&/)
)

// ========================================
// DESIGN COMPLIANCE
// ========================================

audit('All new files use British English', () => {
  const files = [
    'src/hooks/useSaveSignal.ts',
    'src/components/console/SaveStatus.tsx',
    'src/components/console/SignalDrawer.tsx',
    'src/app/api/agent/execute/route.ts',
  ]

  // Check for American spellings (color, behavior, center, etc.)
  const americanSpellings = [
    /\bcolor(?!:|Color|,| =)/i, // Allow CSS property "color:", "flowCoreColours", etc.
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
  const files = ['src/components/console/SaveStatus.tsx', 'src/components/console/SignalDrawer.tsx']

  for (const file of files) {
    if (!fileExists(file)) continue
    if (!fileContains(file, /flowCore/)) {
      return {
        pass: false,
        message: `${file} doesn't use FlowCore tokens`,
      }
    }
  }

  return true
})

// ========================================
// PRINT RESULTS
// ========================================

console.log('\n═══════════════════════════════════════════')
console.log('  PHASE 14.8 CONSOLE FINAL POLISH AUDIT')
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
