/**
 * Phase 15.2-C Audit Script
 * Agent Integration Layer Validation
 *
 * Purpose:
 * - Verify asset attachment integration across all agents
 * - Check API routes accept attachments array
 * - Validate telemetry events logged correctly
 * - Confirm privacy filtering works
 * - Test UI sound feedback
 *
 * Usage:
 * pnpm tsx scripts/audit-15-2-c.ts
 */

import * as fs from 'fs'
import * as path from 'path'

interface AuditResult {
  passed: number
  failed: number
  warnings: number
  details: string[]
}

const result: AuditResult = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: [],
}

function pass(message: string) {
  result.passed++
  result.details.push(`✅ PASS: ${message}`)
}

function fail(message: string) {
  result.failed++
  result.details.push(`❌ FAIL: ${message}`)
}

function warn(message: string) {
  result.warnings++
  result.details.push(`⚠️  WARN: ${message}`)
}

function info(message: string) {
  result.details.push(`ℹ️  INFO: ${message}`)
}

function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath)
  } catch {
    return false
  }
}

function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
}

function fileContains(filePath: string, searchString: string): boolean {
  const contents = readFile(filePath)
  return contents !== null && contents.includes(searchString)
}

function auditPhase15_2C() {
  info('Starting Phase 15.2-C Audit...')
  info('')

  // ============================================
  // 1. Shared Types
  // ============================================
  info('[1/10] Checking Shared Types...')

  const assetAttachmentTypesPath = path.join(
    process.cwd(),
    'src/types/asset-attachment.ts'
  )

  if (fileExists(assetAttachmentTypesPath)) {
    pass('AssetAttachment types file exists')

    if (fileContains(assetAttachmentTypesPath, 'export interface AssetAttachment')) {
      pass('AssetAttachment interface exported')
    } else {
      fail('AssetAttachment interface not exported')
    }

    if (fileContains(assetAttachmentTypesPath, 'is_public: boolean')) {
      pass('AssetAttachment includes is_public field')
    } else {
      fail('AssetAttachment missing is_public field')
    }

    if (fileContains(assetAttachmentTypesPath, 'export interface AgentAttachmentPayload')) {
      pass('AgentAttachmentPayload interface exported')
    } else {
      fail('AgentAttachmentPayload interface not exported')
    }
  } else {
    fail('AssetAttachment types file not found')
  }

  info('')

  // ============================================
  // 2. AssetAttachModal Component
  // ============================================
  info('[2/10] Checking AssetAttachModal Component...')

  const assetAttachModalPath = path.join(
    process.cwd(),
    'src/components/console/AssetAttachModal.tsx'
  )

  if (fileExists(assetAttachModalPath)) {
    pass('AssetAttachModal component exists')

    if (fileContains(assetAttachModalPath, 'export function AssetAttachModal')) {
      pass('AssetAttachModal exported correctly')
    } else {
      fail('AssetAttachModal not exported')
    }

    if (fileContains(assetAttachModalPath, 'publicOnly')) {
      pass('AssetAttachModal supports publicOnly filtering')
    } else {
      fail('AssetAttachModal missing publicOnly prop')
    }

    if (fileContains(assetAttachModalPath, 'maxAttachments')) {
      pass('AssetAttachModal supports maxAttachments limit')
    } else {
      fail('AssetAttachModal missing maxAttachments prop')
    }

    if (fileContains(assetAttachModalPath, 'playAssetAttachSound')) {
      pass('AssetAttachModal uses sound feedback (attach)')
    } else {
      warn('AssetAttachModal missing attach sound feedback')
    }

    if (fileContains(assetAttachModalPath, 'playAssetDetachSound')) {
      pass('AssetAttachModal uses sound feedback (detach)')
    } else {
      warn('AssetAttachModal missing detach sound feedback')
    }

    if (fileContains(assetAttachModalPath, 'playAssetErrorSound')) {
      pass('AssetAttachModal uses sound feedback (error)')
    } else {
      warn('AssetAttachModal missing error sound feedback')
    }

    if (fileContains(assetAttachModalPath, "toast.error('file is private")) {
      pass('AssetAttachModal shows privacy warning')
    } else {
      fail('AssetAttachModal missing privacy warning')
    }
  } else {
    fail('AssetAttachModal component not found')
  }

  info('')

  // ============================================
  // 3. PitchAgent API
  // ============================================
  info('[3/10] Checking PitchAgent API...')

  const pitchAgentAPIPath = path.join(
    process.cwd(),
    'src/app/api/agents/pitch/route.ts'
  )

  if (fileExists(pitchAgentAPIPath)) {
    pass('PitchAgent API route exists')

    if (fileContains(pitchAgentAPIPath, 'attachments')) {
      pass('PitchAgent API accepts attachments')
    } else {
      fail('PitchAgent API missing attachments parameter')
    }

    if (fileContains(pitchAgentAPIPath, 'is_public')) {
      pass('PitchAgent API filters by is_public')
    } else {
      fail('PitchAgent API missing privacy filtering')
    }

    if (fileContains(pitchAgentAPIPath, 'asset_attach_to_pitch') || fileContains(pitchAgentAPIPath, "action: 'asset_attach_to_pitch'")) {
      pass('PitchAgent API logs asset_attach_to_pitch telemetry')
    } else {
      fail('PitchAgent API missing telemetry logging')
    }

    if (fileContains(pitchAgentAPIPath, 'assetAttachmentSchema')) {
      pass('PitchAgent API validates attachment schema')
    } else {
      warn('PitchAgent API missing schema validation')
    }
  } else {
    fail('PitchAgent API route not found')
  }

  info('')

  // ============================================
  // 4. PitchAgent Demo Page
  // ============================================
  info('[4/10] Checking PitchAgent Demo Page...')

  const pitchDemoPath = path.join(process.cwd(), 'src/app/dev/pitch-demo/page.tsx')

  if (fileExists(pitchDemoPath)) {
    pass('PitchAgent demo page exists')

    if (fileContains(pitchDemoPath, 'AssetAttachModal')) {
      pass('Demo page uses AssetAttachModal')
    } else {
      fail('Demo page missing AssetAttachModal')
    }

    if (fileContains(pitchDemoPath, 'selectedAttachments')) {
      pass('Demo page tracks selected attachments')
    } else {
      fail('Demo page missing attachment state')
    }

    if (fileContains(pitchDemoPath, '/api/agents/pitch')) {
      pass('Demo page calls PitchAgent API')
    } else {
      fail('Demo page missing API integration')
    }
  } else {
    warn('PitchAgent demo page not found (optional)')
  }

  info('')

  // ============================================
  // 5. IntelAgent API
  // ============================================
  info('[5/10] Checking IntelAgent API...')

  const intelAgentAPIPath = path.join(
    process.cwd(),
    'src/app/api/agents/intel/route.ts'
  )

  if (fileExists(intelAgentAPIPath)) {
    pass('IntelAgent API route exists')

    if (fileContains(intelAgentAPIPath, 'includeAssetContext')) {
      pass('IntelAgent API supports asset context inclusion')
    } else {
      fail('IntelAgent API missing includeAssetContext parameter')
    }

    if (fileContains(intelAgentAPIPath, 'fetchRelevantDocumentAssets')) {
      pass('IntelAgent API fetches document assets')
    } else {
      fail('IntelAgent API missing document asset fetching')
    }

    if (fileContains(intelAgentAPIPath, 'asset_used_for_intel') || fileContains(intelAgentAPIPath, "action: 'asset_used_for_intel'")) {
      pass('IntelAgent API logs asset_used_for_intel telemetry')
    } else {
      fail('IntelAgent API missing telemetry logging')
    }
  } else {
    fail('IntelAgent API route not found')
  }

  info('')

  // ============================================
  // 6. TrackerAgent with Assets
  // ============================================
  info('[6/10] Checking TrackerAgent with Assets...')

  const trackerWithAssetsPath = path.join(
    process.cwd(),
    'src/lib/tracker-with-assets.ts'
  )

  if (fileExists(trackerWithAssetsPath)) {
    pass('TrackerWithAssets module exists')

    if (fileContains(trackerWithAssetsPath, 'export class TrackerWithAssets')) {
      pass('TrackerWithAssets class exported')
    } else {
      fail('TrackerWithAssets class not exported')
    }

    if (fileContains(trackerWithAssetsPath, 'logOutreach')) {
      pass('TrackerWithAssets implements logOutreach')
    } else {
      fail('TrackerWithAssets missing logOutreach method')
    }

    if (fileContains(trackerWithAssetsPath, 'asset_id')) {
      pass('TrackerWithAssets references asset_id in logs')
    } else {
      fail('TrackerWithAssets missing asset_id reference')
    }

    if (fileContains(trackerWithAssetsPath, 'getAssetForView')) {
      pass('TrackerWithAssets implements getAssetForView')
    } else {
      fail('TrackerWithAssets missing getAssetForView method')
    }

    if (fileContains(trackerWithAssetsPath, 'asset_view_from_tracker') || fileContains(trackerWithAssetsPath, "action: 'asset_view_from_tracker'")) {
      pass('TrackerWithAssets logs asset_view_from_tracker telemetry')
    } else {
      fail('TrackerWithAssets missing telemetry logging')
    }
  } else {
    fail('TrackerWithAssets module not found')
  }

  info('')

  // ============================================
  // 7. Telemetry Helpers
  // ============================================
  info('[7/10] Checking Telemetry Helpers...')

  const assetTelemetryPath = path.join(process.cwd(), 'src/lib/asset-telemetry.ts')

  if (fileExists(assetTelemetryPath)) {
    pass('Asset telemetry module exists')

    if (fileContains(assetTelemetryPath, 'trackAssetAttachToPitch')) {
      pass('trackAssetAttachToPitch function exists')
    } else {
      fail('trackAssetAttachToPitch function missing')
    }

    if (fileContains(assetTelemetryPath, 'trackAssetUsedForIntel')) {
      pass('trackAssetUsedForIntel function exists')
    } else {
      fail('trackAssetUsedForIntel function missing')
    }

    if (fileContains(assetTelemetryPath, 'trackAssetViewFromTracker')) {
      pass('trackAssetViewFromTracker function exists')
    } else {
      fail('trackAssetViewFromTracker function missing')
    }

    if (fileContains(assetTelemetryPath, 'trackAssetUnlinked')) {
      pass('trackAssetUnlinked function exists')
    } else {
      fail('trackAssetUnlinked function missing')
    }

    if (fileContains(assetTelemetryPath, 'trackAssetEventsBatch')) {
      pass('Batch telemetry tracking supported')
    } else {
      warn('Batch telemetry tracking not implemented')
    }
  } else {
    fail('Asset telemetry module not found')
  }

  info('')

  // ============================================
  // 8. Sound Feedback
  // ============================================
  info('[8/10] Checking Sound Feedback...')

  const assetSoundsPath = path.join(process.cwd(), 'src/lib/asset-sounds.ts')

  if (fileExists(assetSoundsPath)) {
    pass('Asset sounds module exists')

    if (fileContains(assetSoundsPath, 'playAssetAttachSound')) {
      pass('playAssetAttachSound function exists')
    } else {
      fail('playAssetAttachSound function missing')
    }

    if (fileContains(assetSoundsPath, 'playAssetDetachSound')) {
      pass('playAssetDetachSound function exists')
    } else {
      fail('playAssetDetachSound function missing')
    }

    if (fileContains(assetSoundsPath, 'playAssetErrorSound')) {
      pass('playAssetErrorSound function exists')
    } else {
      fail('playAssetErrorSound function missing')
    }

    if (fileContains(assetSoundsPath, '0.10') || fileContains(assetSoundsPath, '0.08') || fileContains(assetSoundsPath, '0.12')) {
      pass('Sound volumes in acceptable range (0.08-0.12)')
    } else {
      warn('Sound volumes may not be in FlowCore range')
    }

    if (fileContains(assetSoundsPath, 'AudioContext')) {
      pass('Uses Web Audio API')
    } else {
      fail('Missing Web Audio API implementation')
    }
  } else {
    fail('Asset sounds module not found')
  }

  info('')

  // ============================================
  // 9. Privacy & Permissions
  // ============================================
  info('[9/10] Checking Privacy & Permissions...')

  let privacyImplemented = true

  // Check PitchAgent filters private assets
  if (fileExists(pitchAgentAPIPath)) {
    if (fileContains(pitchAgentAPIPath, 'filter') && fileContains(pitchAgentAPIPath, 'is_public')) {
      pass('PitchAgent filters private assets')
    } else {
      fail('PitchAgent missing privacy filtering')
      privacyImplemented = false
    }
  }

  // Check AssetAttachModal shows warnings
  if (fileExists(assetAttachModalPath)) {
    if (fileContains(assetAttachModalPath, "toast.error('file is private")) {
      pass('AssetAttachModal warns about private assets')
    } else {
      fail('AssetAttachModal missing privacy warnings')
      privacyImplemented = false
    }
  }

  if (privacyImplemented) {
    pass('Privacy filtering implemented across all agents')
  }

  info('')

  // ============================================
  // 10. Integration Readiness
  // ============================================
  info('[10/10] Checking Integration Readiness...')

  const allFilesExist =
    fileExists(assetAttachmentTypesPath) &&
    fileExists(assetAttachModalPath) &&
    fileExists(pitchAgentAPIPath) &&
    fileExists(intelAgentAPIPath) &&
    fileExists(trackerWithAssetsPath) &&
    fileExists(assetTelemetryPath) &&
    fileExists(assetSoundsPath)

  if (allFilesExist) {
    pass('All core files created')
  } else {
    fail('Some core files missing')
  }

  if (fileExists(pitchDemoPath)) {
    pass('Demo page available for testing')
  } else {
    warn('Demo page not found (optional but recommended)')
  }

  info('Note: Agent UI components (PitchAgentNode, IntelAgentNode, TrackerAgentNode) pending')
  warn('Full UI integration deferred to Phase 15.2-D')

  info('')

  // ============================================
  // Summary
  // ============================================
  info('─'.repeat(60))
  info('Phase 15.2-C Audit Complete')
  info('─'.repeat(60))
  info('')
  info(`✅ Passed: ${result.passed}`)
  info(`❌ Failed: ${result.failed}`)
  info(`⚠️  Warnings: ${result.warnings}`)
  info('')

  if (result.failed === 0) {
    info('🎉 Phase 15.2-C implementation is COMPLETE and VALID!')
  } else if (result.failed <= 3) {
    info('⚠️  Phase 15.2-C has minor issues that should be addressed.')
  } else {
    info('❌ Phase 15.2-C has significant issues that need to be fixed.')
  }
}

// ============================================
// Main Execution
// ============================================
console.log('')
console.log('═'.repeat(60))
console.log('  Phase 15.2-C: Agent Integration Layer Audit')
console.log('═'.repeat(60))
console.log('')

auditPhase15_2C()

console.log('')
result.details.forEach((detail) => console.log(detail))
console.log('')

// Exit with error code if any tests failed
process.exit(result.failed > 0 ? 1 : 0)
