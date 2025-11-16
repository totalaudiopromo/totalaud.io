/**
 * Artist Identity API
 * Get the auto-generated artist identity summary
 */

import { NextRequest, NextResponse } from 'next/server'
import { memoryDb } from '@total-audio/loopos-db'

// =====================================================
// GET /api/memory/identity?workspaceId=xxx
// =====================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    const identity = await memoryDb.identity.get(workspaceId)

    return NextResponse.json({
      success: true,
      identity,
    })
  } catch (error) {
    console.error('Failed to get artist identity:', error)
    return NextResponse.json({ error: 'Failed to get identity' }, { status: 500 })
  }
}
