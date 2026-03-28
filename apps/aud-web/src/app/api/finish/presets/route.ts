/**
 * GET /api/finish/presets
 *
 * Proxy to finisher /presets endpoint.
 * Returns available genre presets. No auth required (public data).
 */

import { NextResponse } from 'next/server'
import { listPresets } from '@/lib/finisher-client'

export async function GET() {
  try {
    const presets = await listPresets()
    return NextResponse.json({ success: true, data: { presets } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list presets'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
