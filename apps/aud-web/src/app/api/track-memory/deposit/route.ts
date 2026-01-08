/**
 * Track Memory Deposit API
 *
 * POST /api/track-memory/deposit
 *
 * Accepts silent deposits from the client when track context is available.
 * This is the v0 approach - deposits are triggered client-side but persisted server-side.
 *
 * Failure-safe: returns success even if deposit fails (silent).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { appendTrackMemoryEntry, MemoryEntryType, SourceMode } from '@/lib/track-memory'
import { logger } from '@/lib/logger'

const log = logger.scope('TrackMemory/Deposit')

// Allowed entry types for v0 deposits
const ALLOWED_TYPES: MemoryEntryType[] = [
  'intent',
  'perspective',
  'story_fragment',
  'sequence_decision',
  'scout_consideration',
  'version_note',
  'note',
]

// Allowed source modes
const ALLOWED_SOURCES: SourceMode[] = [
  'ideas',
  'finish',
  'story',
  'scout',
  'timeline',
  'content',
  'manual',
]

interface DepositRequest {
  trackId: string
  entryType: MemoryEntryType
  payload: Record<string, unknown>
  sourceMode?: SourceMode
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createRouteSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      // Silent failure - don't block the user
      log.debug('Deposit skipped: not authenticated')
      return NextResponse.json({ success: true, deposited: false })
    }

    // Parse request body
    const body = (await request.json()) as DepositRequest

    // Validate required fields
    if (!body.trackId || !body.entryType || !body.payload) {
      log.warn('Deposit skipped: missing required fields')
      return NextResponse.json({ success: true, deposited: false })
    }

    // Validate entry type
    if (!ALLOWED_TYPES.includes(body.entryType)) {
      log.warn('Deposit skipped: invalid entry type', { entryType: body.entryType })
      return NextResponse.json({ success: true, deposited: false })
    }

    // Validate source mode if provided
    if (body.sourceMode && !ALLOWED_SOURCES.includes(body.sourceMode)) {
      log.warn('Deposit skipped: invalid source mode', { sourceMode: body.sourceMode })
      return NextResponse.json({ success: true, deposited: false })
    }

    // Attempt deposit (failure-safe)
    const entry = await appendTrackMemoryEntry(
      user.id,
      body.trackId,
      body.entryType,
      body.payload,
      body.sourceMode
    )

    if (entry) {
      log.debug('Deposit successful', {
        trackId: body.trackId,
        entryType: body.entryType,
        sourceMode: body.sourceMode,
      })
      return NextResponse.json({ success: true, deposited: true, entryId: entry.id })
    } else {
      log.debug('Deposit failed silently', {
        trackId: body.trackId,
        entryType: body.entryType,
      })
      return NextResponse.json({ success: true, deposited: false })
    }
  } catch (error) {
    // Silent failure - log but return success
    log.error('Deposit error (silent)', error)
    return NextResponse.json({ success: true, deposited: false })
  }
}
