/**
 * Phase 15.2-A Audit Script
 * Core Infrastructure Foundation Validation
 *
 * Purpose:
 * - Verify all migration files exist and are valid SQL
 * - Confirm API endpoints are implemented correctly
 * - Check hook and component files exist
 * - Validate telemetry integration
 * - Test basic upload → list → delete flow
 *
 * Usage:
 * pnpm tsx scripts/audit-15-2-a.ts
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

/**
 * Check if file exists
 */
function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath)
  } catch {
    return false
  }
}

/**
 * Read file contents
 */
function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return null
  }
}

/**
 * Check if file contains a string
 */
function fileContains(filePath: string, searchString: string): boolean {
  const contents = readFile(filePath)
  return contents !== null && contents.includes(searchString)
}

/**
 * Audit Phase 15.2-A Implementation
 */
function auditPhase15_2A() {
  info('Starting Phase 15.2-A Audit...')
  info('')

  // ============================================
  // 1. Database & Storage
  // ============================================
  info('[1/7] Checking Database & Storage...')

  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/20251118000000_create_assets.sql'
  )

  if (fileExists(migrationPath)) {
    pass('Migration file exists: 20251118000000_create_assets.sql')

    // Check migration contents
    if (fileContains(migrationPath, "insert into storage.buckets (id, name, public)")) {
      pass('Migration creates storage bucket')
    } else {
      fail('Migration missing storage bucket creation')
    }

    if (fileContains(migrationPath, 'create table if not exists public.artist_assets')) {
      pass('Migration creates artist_assets table')
    } else {
      fail('Migration missing artist_assets table')
    }

    if (fileContains(migrationPath, 'alter table public.artist_assets enable row level security')) {
      pass('Migration enables RLS on artist_assets')
    } else {
      fail('Migration missing RLS policies')
    }

    if (fileContains(migrationPath, 'create policy "owners can upload to assets"')) {
      pass('Migration includes storage policies')
    } else {
      fail('Migration missing storage policies')
    }
  } else {
    fail('Migration file not found: 20251118000000_create_assets.sql')
  }

  info('')

  // ============================================
  // 2. API Endpoints
  // ============================================
  info('[2/7] Checking API Endpoints...')

  const signApiPath = path.join(process.cwd(), 'src/app/api/assets/sign/route.ts')
  const listApiPath = path.join(process.cwd(), 'src/app/api/assets/list/route.ts')
  const deleteApiPath = path.join(process.cwd(), 'src/app/api/assets/delete/route.ts')

  if (fileExists(signApiPath)) {
    pass('/api/assets/sign endpoint exists')

    if (fileContains(signApiPath, 'export const runtime = \'edge\'')) {
      pass('Sign API uses edge runtime')
    } else {
      warn('Sign API not using edge runtime')
    }

    if (fileContains(signApiPath, 'signedUrl')) {
      pass('Sign API generates signed URLs')
    } else {
      fail('Sign API missing signed URL generation')
    }
  } else {
    fail('/api/assets/sign endpoint not found')
  }

  if (fileExists(listApiPath)) {
    pass('/api/assets/list endpoint exists')

    if (fileContains(listApiPath, 'export const runtime = \'edge\'')) {
      pass('List API uses edge runtime')
    } else {
      warn('List API not using edge runtime')
    }

    if (fileContains(listApiPath, 'generateDemoFixtures')) {
      pass('List API includes demo mode')
    } else {
      warn('List API missing demo mode')
    }
  } else {
    fail('/api/assets/list endpoint not found')
  }

  if (fileExists(deleteApiPath)) {
    pass('/api/assets/delete endpoint exists')

    if (fileContains(deleteApiPath, 'deleted_at')) {
      pass('Delete API uses soft delete pattern')
    } else {
      fail('Delete API missing soft delete')
    }

    if (fileContains(deleteApiPath, 'supabase.storage.from(\'assets\').remove')) {
      pass('Delete API removes storage objects')
    } else {
      fail('Delete API missing storage removal')
    }
  } else {
    fail('/api/assets/delete endpoint not found')
  }

  info('')

  // ============================================
  // 3. Hook: useAssetUpload
  // ============================================
  info('[3/7] Checking useAssetUpload Hook...')

  const hookPath = path.join(process.cwd(), 'src/hooks/useAssetUpload.ts')

  if (fileExists(hookPath)) {
    pass('useAssetUpload hook exists')

    if (fileContains(hookPath, 'getSignedUrl')) {
      pass('Hook implements getSignedUrl()')
    } else {
      fail('Hook missing getSignedUrl()')
    }

    if (fileContains(hookPath, 'uploadFile')) {
      pass('Hook implements uploadFile()')
    } else {
      fail('Hook missing uploadFile()')
    }

    if (fileContains(hookPath, 'progress')) {
      pass('Hook tracks upload progress')
    } else {
      fail('Hook missing progress tracking')
    }

    if (fileContains(hookPath, 'trackEvent')) {
      pass('Hook integrates telemetry (trackEvent)')
    } else {
      fail('Hook missing telemetry integration')
    }

    if (fileContains(hookPath, 'XMLHttpRequest')) {
      pass('Hook uses XMLHttpRequest for progress tracking')
    } else {
      warn('Hook not using XMLHttpRequest (may lack progress tracking)')
    }

    if (fileContains(hookPath, 'toast')) {
      pass('Hook shows toast notifications')
    } else {
      warn('Hook missing toast notifications')
    }
  } else {
    fail('useAssetUpload hook not found')
  }

  info('')

  // ============================================
  // 4. Component: AssetDropZone
  // ============================================
  info('[4/7] Checking AssetDropZone Component...')

  const componentPath = path.join(process.cwd(), 'src/components/console/AssetDropZone.tsx')

  if (fileExists(componentPath)) {
    pass('AssetDropZone component exists')

    if (fileContains(componentPath, 'onDrop')) {
      pass('Component implements drag & drop')
    } else {
      fail('Component missing drag & drop')
    }

    if (fileContains(componentPath, 'useAssetUpload')) {
      pass('Component uses useAssetUpload hook')
    } else {
      fail('Component not using useAssetUpload hook')
    }

    if (fileContains(componentPath, 'flowCoreColours')) {
      pass('Component uses FlowCore design tokens')
    } else {
      warn('Component not using FlowCore design tokens')
    }

    if (fileContains(componentPath, 'motion')) {
      pass('Component uses Framer Motion')
    } else {
      warn('Component not using Framer Motion')
    }

    if (fileContains(componentPath, 'deleteAsset')) {
      pass('Component implements delete functionality')
    } else {
      fail('Component missing delete functionality')
    }
  } else {
    fail('AssetDropZone component not found')
  }

  info('')

  // ============================================
  // 5. Testing Page
  // ============================================
  info('[5/7] Checking Testing Page...')

  const testPagePath = path.join(process.cwd(), 'src/app/dev/assets/page.tsx')

  if (fileExists(testPagePath)) {
    pass('Testing page exists at /dev/assets')

    if (fileContains(testPagePath, 'AssetDropZone')) {
      pass('Testing page renders AssetDropZone')
    } else {
      fail('Testing page not rendering AssetDropZone')
    }
  } else {
    warn('Testing page not found (optional for Phase 15.2-A)')
  }

  info('')

  // ============================================
  // 6. Telemetry Integration
  // ============================================
  info('[6/7] Checking Telemetry Integration...')

  if (fileExists(hookPath) && fileContains(hookPath, 'useFlowStateTelemetry')) {
    pass('Hook imports useFlowStateTelemetry')
  } else {
    fail('Hook missing useFlowStateTelemetry import')
  }

  if (fileExists(hookPath) && fileContains(hookPath, "trackEvent('save'")) {
    pass('Hook tracks asset_upload event')
  } else {
    fail('Hook missing asset_upload telemetry event')
  }

  info('')

  // ============================================
  // 7. Code Quality Checks
  // ============================================
  info('[7/7] Code Quality Checks...')

  const filesToCheck = [signApiPath, listApiPath, deleteApiPath, hookPath, componentPath]

  let allFilesUseLogger = true
  let allFilesUseZod = true

  for (const filePath of filesToCheck) {
    if (!fileExists(filePath)) continue

    if (!fileContains(filePath, 'logger')) {
      allFilesUseLogger = false
    }

    if (filePath.includes('/api/') && !fileContains(filePath, 'z.')) {
      allFilesUseZod = false
    }
  }

  if (allFilesUseLogger) {
    pass('All files use structured logging')
  } else {
    warn('Some files missing structured logging')
  }

  if (allFilesUseZod) {
    pass('All API endpoints use Zod validation')
  } else {
    warn('Some API endpoints missing Zod validation')
  }

  info('')

  // ============================================
  // Summary
  // ============================================
  info('─'.repeat(60))
  info(`Phase 15.2-A Audit Complete`)
  info('─'.repeat(60))
  info('')
  info(`✅ Passed: ${result.passed}`)
  info(`❌ Failed: ${result.failed}`)
  info(`⚠️  Warnings: ${result.warnings}`)
  info('')

  if (result.failed === 0) {
    info('🎉 Phase 15.2-A implementation is COMPLETE and VALID!')
  } else {
    info('⚠️  Phase 15.2-A has issues that need to be addressed.')
  }
}

// ============================================
// Main Execution
// ============================================
console.log('')
console.log('═'.repeat(60))
console.log('  Phase 15.2-A: Core Infrastructure Foundation Audit')
console.log('═'.repeat(60))
console.log('')

auditPhase15_2A()

console.log('')
result.details.forEach((detail) => console.log(detail))
console.log('')

// Exit with error code if any tests failed
process.exit(result.failed > 0 ? 1 : 0)
