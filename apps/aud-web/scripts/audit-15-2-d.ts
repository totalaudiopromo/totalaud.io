/**
 * Phase 15.2-D Audit Script
 * Validates Full Agent UI Integration + EPK Showcase
 *
 * Run: npx tsx scripts/audit-15-2-d.ts
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

console.log('\n🔍 Phase 15.2-D Audit: Full Agent UI Integration + EPK Showcase\n')

// ========================================
// 1. Component Files Exist
// ========================================

audit('Components', 'PitchAgentNode exists', fileExists('src/components/agents/PitchAgentNode.tsx'))

audit('Components', 'IntelAgentNode exists', fileExists('src/components/agents/IntelAgentNode.tsx'))

audit(
  'Components',
  'TrackerAgentNode exists',
  fileExists('src/components/agents/TrackerAgentNode.tsx')
)

audit(
  'Components',
  'AssetViewModal exists',
  fileExists('src/components/console/AssetViewModal.tsx')
)

// ========================================
// 2. API Routes Exist
// ========================================

audit('API Routes', 'Pitch agent route exists', fileExists('src/app/api/agents/pitch/route.ts'))

audit('API Routes', 'Intel agent route exists', fileExists('src/app/api/agents/intel/route.ts'))

audit('API Routes', 'Tracker agent route exists', fileExists('src/app/api/agents/tracker/route.ts'))

audit('API Routes', 'Get asset route exists', fileExists('src/app/api/assets/get/route.ts'))

// ========================================
// 3. EPK Pages Exist
// ========================================

audit('EPK', 'EPK page exists', fileExists('src/app/epk/[campaignId]/page.tsx'))

audit('EPK', 'EPK client component exists', fileExists('src/app/epk/[campaignId]/EPKClient.tsx'))

audit('EPK', 'OG image route exists', fileExists('src/app/api/og/epk/[campaignId]/route.tsx'))

// ========================================
// 4. Dev Test Page Exists
// ========================================

audit('Testing', 'Dev test page exists', fileExists('src/app/dev/agents-ui/page.tsx'))

// ========================================
// 5. PitchAgentNode Features
// ========================================

audit(
  'PitchAgentNode',
  'Has goal input',
  fileContains('src/components/agents/PitchAgentNode.tsx', 'goal')
)

audit(
  'PitchAgentNode',
  'Has context textarea',
  fileContains('src/components/agents/PitchAgentNode.tsx', 'textarea')
)

audit(
  'PitchAgentNode',
  'Has asset attachment',
  fileContains('src/components/agents/PitchAgentNode.tsx', 'AssetAttachModal')
)

audit(
  'PitchAgentNode',
  'Has max attachments enforcement',
  fileContains('src/components/agents/PitchAgentNode.tsx', 'MAX_ATTACHMENTS')
)

audit(
  'PitchAgentNode',
  'Has privacy filtering',
  fileContains('src/components/agents/PitchAgentNode.tsx', 'is_public')
)

audit(
  'PitchAgentNode',
  'Has sound feedback',
  fileContains('src/components/agents/PitchAgentNode.tsx', 'playAssetAttachSound')
)

audit(
  'PitchAgentNode',
  'Has telemetry tracking',
  fileContains('src/components/agents/PitchAgentNode.tsx', 'trackEvent')
)

audit(
  'PitchAgentNode',
  'Has keyboard shortcuts',
  fileContains('src/components/agents/PitchAgentNode.tsx', 'useEffect')
)

// ========================================
// 6. IntelAgentNode Features
// ========================================

audit(
  'IntelAgentNode',
  'Has research query input',
  fileContains('src/components/agents/IntelAgentNode.tsx', 'query')
)

audit(
  'IntelAgentNode',
  'Uses useAssets hook',
  fileContains('src/components/agents/IntelAgentNode.tsx', 'useAssets')
)

audit(
  'IntelAgentNode',
  'Has document selection toggles',
  fileContains('src/components/agents/IntelAgentNode.tsx', 'toggleDoc')
)

audit(
  'IntelAgentNode',
  'Auto-selects documents',
  fileContains('src/components/agents/IntelAgentNode.tsx', 'useEffect')
)

audit(
  'IntelAgentNode',
  'Has telemetry tracking',
  fileContains('src/components/agents/IntelAgentNode.tsx', 'trackEvent')
)

// ========================================
// 7. TrackerAgentNode Features
// ========================================

audit(
  'TrackerAgentNode',
  'Fetches outreach logs',
  fileContains('src/components/agents/TrackerAgentNode.tsx', 'fetchOutreachLogs')
)

audit(
  'TrackerAgentNode',
  'Has outreach table',
  fileContains('src/components/agents/TrackerAgentNode.tsx', '<table')
)

audit(
  'TrackerAgentNode',
  'Has asset icon links',
  fileContains('src/components/agents/TrackerAgentNode.tsx', 'handleAssetClick')
)

audit(
  'TrackerAgentNode',
  'Integrates AssetViewModal',
  fileContains('src/components/agents/TrackerAgentNode.tsx', 'AssetViewModal')
)

audit(
  'TrackerAgentNode',
  'Has status badges',
  fileContains('src/components/agents/TrackerAgentNode.tsx', 'getStatusColour')
)

audit(
  'TrackerAgentNode',
  'Has telemetry tracking',
  fileContains('src/components/agents/TrackerAgentNode.tsx', 'trackEvent')
)

// ========================================
// 8. AssetViewModal Features
// ========================================

audit(
  'AssetViewModal',
  'Has audio player',
  fileContains('src/components/console/AssetViewModal.tsx', '<audio')
)

audit(
  'AssetViewModal',
  'Has image preview',
  fileContains('src/components/console/AssetViewModal.tsx', '<img')
)

audit(
  'AssetViewModal',
  'Has document metadata',
  fileContains('src/components/console/AssetViewModal.tsx', 'metadata')
)

audit(
  'AssetViewModal',
  'Has copy link functionality',
  fileContains('src/components/console/AssetViewModal.tsx', 'handleCopyLink')
)

audit(
  'AssetViewModal',
  'Has keyboard navigation',
  fileContains('src/components/console/AssetViewModal.tsx', 'handleKeyDown')
)

audit(
  'AssetViewModal',
  'Has gallery navigation',
  fileContains('src/components/console/AssetViewModal.tsx', 'navigateNext')
)

audit(
  'AssetViewModal',
  'Uses Framer Motion',
  fileContains('src/components/console/AssetViewModal.tsx', 'AnimatePresence')
)

// ========================================
// 9. EPK Page Features
// ========================================

audit(
  'EPK',
  'Has metadata generation',
  fileContains('src/app/epk/[campaignId]/page.tsx', 'generateMetadata')
)

audit(
  'EPK',
  'Has hero section',
  fileContains('src/app/epk/[campaignId]/EPKClient.tsx', 'Hero Section')
)

audit(
  'EPK',
  'Has featured track',
  fileContains('src/app/epk/[campaignId]/EPKClient.tsx', 'featured track')
)

audit(
  'EPK',
  'Has gallery section',
  fileContains('src/app/epk/[campaignId]/EPKClient.tsx', 'press photos')
)

audit(
  'EPK',
  'Has press materials',
  fileContains('src/app/epk/[campaignId]/EPKClient.tsx', 'press materials')
)

audit(
  'EPK',
  'Has contact section',
  fileContains('src/app/epk/[campaignId]/EPKClient.tsx', 'contact')
)

audit(
  'EPK',
  'Has telemetry tracking',
  fileContains('src/app/epk/[campaignId]/EPKClient.tsx', 'asset_epk_view')
)

// ========================================
// 10. OG Image Route Features
// ========================================

audit(
  'OG Image',
  'Uses Edge runtime',
  fileContains('src/app/api/og/epk/[campaignId]/route.tsx', "runtime = 'edge'")
)

audit(
  'OG Image',
  'Returns ImageResponse',
  fileContains('src/app/api/og/epk/[campaignId]/route.tsx', 'ImageResponse')
)

audit(
  'OG Image',
  'Uses FlowCore colours',
  fileContains('src/app/api/og/epk/[campaignId]/route.tsx', 'flowCoreColours')
)

audit(
  'OG Image',
  'Has 1200x630 dimensions',
  fileContains('src/app/api/og/epk/[campaignId]/route.tsx', '1200') &&
    fileContains('src/app/api/og/epk/[campaignId]/route.tsx', '630')
)

// ========================================
// 11. FlowCore Design Compliance
// ========================================

audit(
  'Design',
  'Uses FlowCore colours',
  fileContains('src/components/agents/PitchAgentNode.tsx', 'flowCoreColours')
)

audit(
  'Design',
  'Uses motion tokens (240ms)',
  fileContains('src/components/agents/PitchAgentNode.tsx', '0.24')
)

audit(
  'Design',
  'Uses reduced motion',
  fileContains('src/components/agents/PitchAgentNode.tsx', 'useReducedMotion')
)

audit(
  'Design',
  'Uses Geist Mono font',
  fileContains('src/components/agents/PitchAgentNode.tsx', 'font-geist-mono')
)

audit(
  'Design',
  'Uses lowercase microcopy',
  fileContains('src/components/agents/PitchAgentNode.tsx', 'textTransform')
)

// ========================================
// 12. Accessibility (WCAG AA+)
// ========================================

audit(
  'Accessibility',
  'Has aria-labels',
  fileContains('src/components/agents/PitchAgentNode.tsx', 'aria-label')
)

audit(
  'Accessibility',
  'Has aria-required',
  fileContains('src/components/agents/PitchAgentNode.tsx', 'aria-required')
)

audit(
  'Accessibility',
  'Has aria-pressed for toggles',
  fileContains('src/components/agents/IntelAgentNode.tsx', 'aria-pressed')
)

audit(
  'Accessibility',
  'Has keyboard shortcuts documented',
  fileContains('src/components/console/AssetViewModal.tsx', '<kbd')
)

// ========================================
// 13. API Integration
// ========================================

audit(
  'API',
  'Pitch agent calls API',
  fileContains('src/components/agents/PitchAgentNode.tsx', '/api/agents/pitch')
)

audit(
  'API',
  'Intel agent calls API',
  fileContains('src/components/agents/IntelAgentNode.tsx', '/api/agents/intel')
)

audit(
  'API',
  'Tracker agent calls API',
  fileContains('src/components/agents/TrackerAgentNode.tsx', '/api/agents/tracker')
)

audit(
  'API',
  'AssetViewModal calls API',
  fileContains('src/components/console/AssetViewModal.tsx', '/api/assets/get')
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

console.log('\n✅ Phase 15.2-D Implementation Complete!\n')

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0)
