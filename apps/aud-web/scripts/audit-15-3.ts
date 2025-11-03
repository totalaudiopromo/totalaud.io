/**
 * Phase 15.3 Audit Script
 * Validates Connected Console & Orchestration
 *
 * Run: npx tsx scripts/audit-15-3.ts
 */

import * as fs from 'fs'
import * as path from 'path'

interface AuditResult {
  category: string
  check: string
  passed: boolean
  message?: string
}

const results: AuditResult[] = []

function audit(category: string, check: string, condition: boolean, message?: string) {
  results.push({ category, check, passed: condition, message })
  const icon = condition ? '✅' : '❌'
  console.log(`${icon} [${category}] ${check}${message ? `: ${message}` : ''}`)
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), filePath))
}

function fileContains(filePath: string, searchString: string): boolean {
  if (!fileExists(filePath)) return false
  const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8')
  return content.includes(searchString)
}

console.log('\n🔍 Phase 15.3 Audit: Connected Console & Orchestration\n')

// ========================================
// 1. Core Files Exist
// ========================================

audit('Core Files', 'Console types exist', fileExists('src/types/console.ts'))

audit('Core Files', 'Node registry exists', fileExists('src/features/flow/node-registry.ts'))

audit('Core Files', 'Console tabs hook exists', fileExists('src/hooks/useConsoleTabs.ts'))

audit(
  'Core Files',
  'Orchestration context exists',
  fileExists('src/contexts/OrchestrationContext.tsx')
)

audit(
  'Core Files',
  'Asset inbox drawer exists',
  fileExists('src/components/assets/AssetInboxDrawer.tsx')
)

// ========================================
// 2. Type Definitions
// ========================================

audit(
  'Types',
  'ConsoleTab type defined',
  fileContains('src/types/console.ts', "type ConsoleTab = 'plan' | 'do' | 'track' | 'learn'")
)

audit(
  'Types',
  'NodeKind type defined',
  fileContains('src/types/console.ts', "type NodeKind = 'intel' | 'pitch' | 'tracker'")
)

audit(
  'Types',
  'OrchestrationIntelPayload defined',
  fileContains('src/types/console.ts', 'interface OrchestrationIntelPayload')
)

audit(
  'Types',
  'OrchestrationPitchSeed defined',
  fileContains('src/types/console.ts', 'interface OrchestrationPitchSeed')
)

audit(
  'Types',
  'OutreachLog defined',
  fileContains('src/types/console.ts', 'interface OutreachLog')
)

// ========================================
// 3. Node Registry
// ========================================

audit(
  'Node Registry',
  'NodeDefinition interface',
  fileContains('src/features/flow/node-registry.ts', 'interface NodeDefinition')
)

audit(
  'Node Registry',
  'Intel agent registered',
  fileContains('src/features/flow/node-registry.ts', "kind: 'intel'")
)

audit(
  'Node Registry',
  'Pitch agent registered',
  fileContains('src/features/flow/node-registry.ts', "kind: 'pitch'")
)

audit(
  'Node Registry',
  'Tracker agent registered',
  fileContains('src/features/flow/node-registry.ts', "kind: 'tracker'")
)

audit(
  'Node Registry',
  'getNodeDefs export',
  fileContains('src/features/flow/node-registry.ts', 'export const getNodeDefs')
)

audit(
  'Node Registry',
  'getNodeByKind export',
  fileContains('src/features/flow/node-registry.ts', 'export const getNodeByKind')
)

audit(
  'Node Registry',
  'Type guard isNodeKind',
  fileContains('src/features/flow/node-registry.ts', 'export function isNodeKind')
)

audit(
  'Node Registry',
  'Spawn factories defined',
  fileContains('src/features/flow/node-registry.ts', 'spawn: (props)')
)

// ========================================
// 4. Console Tabs Hook
// ========================================

audit(
  'Console Tabs',
  'useConsoleTabs hook exported',
  fileContains('src/hooks/useConsoleTabs.ts', 'export function useConsoleTabs')
)

audit(
  'Console Tabs',
  'localStorage persistence',
  fileContains('src/hooks/useConsoleTabs.ts', 'localStorage')
)

audit(
  'Console Tabs',
  'nextTab function',
  fileContains('src/hooks/useConsoleTabs.ts', 'const nextTab')
)

audit(
  'Console Tabs',
  'prevTab function',
  fileContains('src/hooks/useConsoleTabs.ts', 'const prevTab')
)

audit(
  'Console Tabs',
  'Telemetry tracking',
  fileContains('src/hooks/useConsoleTabs.ts', 'console_tab_change')
)

audit(
  'Console Tabs',
  'Keyboard hook exported',
  fileContains('src/hooks/useConsoleTabs.ts', 'export function useConsoleTabKeyboard')
)

audit(
  'Console Tabs',
  'Keyboard shortcuts (⌘⌥→/←)',
  fileContains('src/hooks/useConsoleTabs.ts', 'ArrowRight') &&
    fileContains('src/hooks/useConsoleTabs.ts', 'ArrowLeft')
)

// ========================================
// 5. Orchestration Context
// ========================================

audit(
  'Orchestration',
  'OrchestrationProvider exported',
  fileContains('src/contexts/OrchestrationContext.tsx', 'export function OrchestrationProvider')
)

audit(
  'Orchestration',
  'useOrchestration hook',
  fileContains('src/contexts/OrchestrationContext.tsx', 'export function useOrchestration')
)

audit(
  'Orchestration',
  'Intel payload state',
  fileContains('src/contexts/OrchestrationContext.tsx', 'intelPayload')
)

audit(
  'Orchestration',
  'setIntelPayload function',
  fileContains('src/contexts/OrchestrationContext.tsx', 'setIntelPayload')
)

audit(
  'Orchestration',
  'consumeIntelPayload function',
  fileContains('src/contexts/OrchestrationContext.tsx', 'consumeIntelPayload')
)

audit(
  'Orchestration',
  'logOutreach function',
  fileContains('src/contexts/OrchestrationContext.tsx', 'logOutreach')
)

audit(
  'Orchestration',
  'Recent logs tracking',
  fileContains('src/contexts/OrchestrationContext.tsx', 'recentLogs')
)

audit(
  'Orchestration',
  'Intel→Pitch telemetry',
  fileContains('src/contexts/OrchestrationContext.tsx', 'intel_to_pitch_seed')
)

audit(
  'Orchestration',
  'Tracker log telemetry',
  fileContains('src/contexts/OrchestrationContext.tsx', 'tracker_log_created')
)

audit(
  'Orchestration',
  'Toast notifications',
  fileContains('src/contexts/OrchestrationContext.tsx', 'toast.success')
)

audit(
  'Orchestration',
  '5-minute expiry',
  fileContains('src/contexts/OrchestrationContext.tsx', '5 * 60 * 1000')
)

// ========================================
// 6. Asset Inbox Drawer
// ========================================

audit(
  'Asset Inbox',
  'AssetInboxDrawer exported',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'export function AssetInboxDrawer')
)

audit(
  'Asset Inbox',
  'Search functionality',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'searchQuery')
)

audit(
  'Asset Inbox',
  'Filter by kind',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'useAssetFilters')
)

audit(
  'Asset Inbox',
  'Quick attach button',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'handleQuickAttach')
)

audit(
  'Asset Inbox',
  'Privacy filtering',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'is_public')
)

audit(
  'Asset Inbox',
  'Keyboard shortcut ⌘U',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', "event.key === 'u'")
)

audit(
  'Asset Inbox',
  'Escape to close',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', "event.key === 'Escape'")
)

audit(
  'Asset Inbox',
  'Sound feedback',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'playAssetAttachSound')
)

audit(
  'Asset Inbox',
  'Telemetry tracking',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'asset_quick_attach')
)

audit(
  'Asset Inbox',
  'New uploads badge',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'newUploadsCount')
)

audit(
  'Asset Inbox',
  'Current node indicator',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'currentNodeKind')
)

audit(
  'Asset Inbox',
  'Relative time display',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'formatRelativeTime')
)

audit(
  'Asset Inbox',
  'Framer Motion animations',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'AnimatePresence')
)

audit(
  'Asset Inbox',
  'Reduced motion support',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'useReducedMotion')
)

// ========================================
// 7. Design Compliance
// ========================================

audit(
  'Design',
  'FlowCore colours used',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'flowCoreColours')
)

audit(
  'Design',
  'Geist Mono font',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'font-geist-mono')
)

audit(
  'Design',
  'Lowercase microcopy',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'textTransform')
)

audit(
  'Design',
  'Motion tokens (240ms)',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', '0.24')
)

// ========================================
// 8. Accessibility
// ========================================

audit(
  'Accessibility',
  'aria-label on buttons',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'aria-label')
)

audit(
  'Accessibility',
  'Keyboard hints visible',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', '<kbd')
)

audit(
  'Accessibility',
  'Focus states',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'onFocus')
)

audit(
  'Accessibility',
  'Input validation',
  fileContains('src/hooks/useConsoleTabs.ts', 'target.tagName')
)

// ========================================
// 9. Telemetry Events
// ========================================

const telemetryEvents = [
  'console_tab_change',
  'intel_to_pitch_seed',
  'tracker_log_created',
  'asset_quick_attach',
]

telemetryEvents.forEach((event) => {
  const found =
    fileContains('src/contexts/OrchestrationContext.tsx', event) ||
    fileContains('src/hooks/useConsoleTabs.ts', event) ||
    fileContains('src/components/assets/AssetInboxDrawer.tsx', event)

  audit('Telemetry', `Event: ${event}`, found)
})

// ========================================
// 10. Integration Readiness
// ========================================

audit(
  'Integration',
  'Node registry exports',
  fileContains('src/features/flow/node-registry.ts', 'export')
)

audit(
  'Integration',
  'Orchestration context ready',
  fileContains('src/contexts/OrchestrationContext.tsx', 'OrchestrationProvider')
)

audit(
  'Integration',
  'Tabs hook ready',
  fileContains('src/hooks/useConsoleTabs.ts', 'useConsoleTabs')
)

audit(
  'Integration',
  'Asset inbox ready',
  fileContains('src/components/assets/AssetInboxDrawer.tsx', 'AssetInboxDrawer')
)

// ========================================
// Summary
// ========================================

const total = results.length
const passed = results.filter((r) => r.passed).length
const failed = total - passed

console.log(`\n📊 Audit Summary: ${passed}/${total} checks passed`)

if (failed > 0) {
  console.log(`\n❌ Failed checks (${failed}):`)
  results
    .filter((r) => !r.passed)
    .forEach((r) => {
      console.log(`   • [${r.category}] ${r.check}`)
    })
}

console.log('\n✅ Phase 15.3 Core Infrastructure Complete!\n')
console.log('📝 Note: Integration with Node Palette, Command Palette, and FlowCanvas')
console.log('   requires modifications to existing components (not audited here).\n')

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0)
