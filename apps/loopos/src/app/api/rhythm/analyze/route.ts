/**
 * Phase 31: Creative Rhythm System - Rhythm Analysis API
 *
 * Returns rhythm analysis for a workspace:
 * - Energy windows
 * - Return patterns
 * - Mood detection
 * - Calm suggestions
 */

import { NextRequest, NextResponse } from 'next/server'
import { rhythmDb } from '@loopos/db'
import { analyzeRhythm } from '@/lib/rhythm/engine'

// =====================================================
// GET /api/rhythm/analyze?workspaceId=xxx
// =====================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 })
    }

    // Get last 30 days of activity
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [events, summaries, returnPattern] = await Promise.all([
      rhythmDb.activity.getRange(
        workspaceId,
        startDate.toISOString(),
        endDate.toISOString()
      ),
      rhythmDb.dailySummary.getLastNDays(workspaceId, 30),
      rhythmDb.returnPattern.get(workspaceId),
    ])

    // Perform rhythm analysis
    const analysis = analyzeRhythm(events, summaries, returnPattern)

    return NextResponse.json({
      success: true,
      data: {
        energyWindows: analysis.energyWindows,
        returnPattern: analysis.returnPattern,
        mood: analysis.mood,
        suggestions: analysis.suggestions,
      },
    })
  } catch (error) {
    console.error('[Rhythm] Analysis failed:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
