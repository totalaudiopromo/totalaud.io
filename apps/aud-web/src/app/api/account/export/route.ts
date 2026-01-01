/**
 * Account Data Export Endpoint (GDPR)
 * totalaud.io - December 2025
 *
 * Allows users to download all their personal data as JSON.
 * Required for GDPR compliance (right to data portability).
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requireAuth } from '@/lib/api/auth'

const log = logger.scope('AccountExport')

// Helper to safely query a table (returns null if table doesn't exist or query fails)
async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: unknown }>
): Promise<T | null> {
  try {
    const { data, error } = await queryFn()
    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      log.debug('Query error (table may not exist)', { error: errorMessage })
      return null
    }
    return data
  } catch {
    return null
  }
}

export async function GET() {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) {
    return auth
  }

  const { supabase, session } = auth
  const user = session.user

  log.info('Data export requested', { userId: user.id })

  try {
    // Fetch all user data in parallel
    // Use safeQuery for tables that may not exist in all environments
    const [
      profileResult,
      ideasResult,
      timelineEventsResult,
      pitchDraftsResult,
      preferencesResult,
      artistIdentityResult,
    ] = await Promise.all([
      // User profile
      supabase.from('user_profiles').select('*').eq('id', user.id).single(),

      // Ideas Mode data
      supabase
        .from('user_ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),

      // Timeline Mode data
      supabase
        .from('user_timeline_events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: true }),

      // Pitch Mode drafts
      supabase
        .from('user_pitch_drafts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),

      // Workspace preferences
      supabase.from('user_workspace_preferences').select('*').eq('user_id', user.id).single(),

      // Artist identity (brand voice, EPK fragments)
      supabase.from('artist_identities').select('*').eq('user_id', user.id).single(),
    ])

    // Query credit tables separately (may not exist in generated types yet)
    // Use unknown cast since these tables may not be in generated types
    const rawSupabase = supabase as unknown as {
      from: (table: string) => {
        select: (columns: string) => {
          eq: (
            column: string,
            value: string
          ) => {
            single: () => Promise<{ data: unknown; error: unknown }>
            order: (
              column: string,
              options: { ascending: boolean }
            ) => Promise<{ data: unknown; error: unknown }>
          }
        }
      }
    }
    const creditsData = await safeQuery(() =>
      rawSupabase.from('user_credits').select('*').eq('user_id', user.id).single()
    )
    const creditTransactionsData = await safeQuery(() =>
      rawSupabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    )

    // Compile export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0',
      userId: user.id,
      email: user.email,

      // Account data
      profile: profileResult.data || null,

      // Workspace data
      workspace: {
        preferences: preferencesResult.data || null,
        ideas: ideasResult.data || [],
        timelineEvents: timelineEventsResult.data || [],
        pitchDrafts: pitchDraftsResult.data || [],
      },

      // Artist profile
      artistIdentity: artistIdentityResult.data || null,

      // Credits and transactions
      credits: {
        balance: creditsData || null,
        transactions: creditTransactionsData || [],
      },

      // Summary statistics
      summary: {
        totalIdeas: ideasResult.data?.length || 0,
        totalTimelineEvents: timelineEventsResult.data?.length || 0,
        totalPitchDrafts: pitchDraftsResult.data?.length || 0,
        totalCreditTransactions: Array.isArray(creditTransactionsData)
          ? creditTransactionsData.length
          : 0,
      },
    }

    log.info('Data export completed', {
      userId: user.id,
      ideas: exportData.summary.totalIdeas,
      events: exportData.summary.totalTimelineEvents,
      drafts: exportData.summary.totalPitchDrafts,
    })

    // Return as downloadable JSON file
    const filename = `totalaud-export-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    log.error('Data export failed', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
