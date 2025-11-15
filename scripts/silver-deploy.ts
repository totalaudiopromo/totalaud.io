#!/usr/bin/env tsx
/**
 * Silver Deploy - Lightweight deployment health check
 * Phase 18: Silver Deployment System
 *
 * Usage:
 *   pnpm silver:check [url]
 *
 * Checks:
 * - HTTP 200 response from /api/health
 * - Valid JSON response
 * - status: "ok"
 * - uptime > 0
 * - version matches package.json
 *
 * Exit codes:
 * - 0: Success (healthy)
 * - 1: Failed (unhealthy)
 */

import { readFileSync } from 'fs'
import { join } from 'path'

interface HealthResponse {
  status: string
  uptime: number
  version: string
  timestamp: string
}

async function checkHealth(url: string): Promise<void> {
  console.log('🔍 Silver Deploy Health Check')
  console.log(`📡 Target: ${url}`)
  console.log('')

  try {
    // Fetch health endpoint
    const response = await fetch(`${url}/api/health`, {
      method: 'GET',
      headers: { 'User-Agent': 'silver-deploy/1.0' },
    })

    console.log(`✓ HTTP Status: ${response.status}`)

    if (!response.ok) {
      console.error('✗ Health check failed: non-200 response')
      process.exit(1)
    }

    // Parse JSON
    const data = (await response.json()) as HealthResponse

    console.log(`✓ Response: ${JSON.stringify(data, null, 2)}`)
    console.log('')

    // Validate response shape
    if (data.status !== 'ok') {
      console.error(`✗ Health check failed: status="${data.status}" (expected "ok")`)
      process.exit(1)
    }

    console.log('✓ Status: ok')

    if (typeof data.uptime !== 'number' || data.uptime < 0) {
      console.error(`✗ Health check failed: invalid uptime=${data.uptime}`)
      process.exit(1)
    }

    console.log(`✓ Uptime: ${data.uptime}s`)

    if (!data.version) {
      console.error('✗ Health check failed: missing version')
      process.exit(1)
    }

    console.log(`✓ Version: ${data.version}`)

    // Optional: Check version matches package.json
    try {
      const packageJson = JSON.parse(
        readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
      )
      if (data.version !== packageJson.version) {
        console.warn(`⚠ Version mismatch: deployed=${data.version}, local=${packageJson.version}`)
      }
    } catch {
      // Ignore if package.json not found
    }

    console.log('')
    console.log('✅ Health check passed')
    process.exit(0)
  } catch (error) {
    console.error('')
    console.error('✗ Health check failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

// Main
const url = process.argv[2] || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

checkHealth(url).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

