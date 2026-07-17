/**
 * Account Deletion API
 * Phase 9: MVP Polish - GDPR Compliance
 *
 * Handles complete account deletion including:
 * - User data from all tables
 * - Auth user deletion via service role
 */

import { NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/supabase/server'
import { getSupabaseServiceRoleClient } from '@/lib/supabase/serviceRole'
import { logger } from '@/lib/logger'

const log = logger.scope('AccountDeleteAPI')

export async function DELETE() {
  try {
    // Get the current user from session
    const supabase = await createRouteSupabaseClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const userId = user.id

    // Get admin client with service role for deletion
    const adminClient = getSupabaseServiceRoleClient()

    // Explicitly delete every table that stores this user's data, rather
    // than trusting cascade rules that may not exist. Everything the
    // workspace syncs to Supabase is covered here.
    const tablesToClean = [
      'user_ideas',
      'user_timeline_events',
      'user_pitch_drafts',
      'user_workspace_preferences',
      'finish_notes',
      'artist_identities',
      'signal_threads',
      'flow_telemetry',
      'flow_hub_summary_cache',
      'credit_transactions',
      'user_credits',
      'agent_manifests',
      'label_members',
    ] as const

    for (const table of tablesToClean) {
      const { error } = await adminClient.from(table).delete().eq('user_id', userId)
      if (error) {
        // Log but continue; the auth-user delete below cascades where FKs exist
        log.warn(`Failed to clean ${table}`, { error: error.message })
      }
    }

    // user_profiles is keyed by the auth user id directly
    const { error: profileError } = await adminClient
      .from('user_profiles')
      .delete()
      .eq('id', userId)
    if (profileError) {
      log.warn('Failed to clean user_profiles', { error: profileError.message })
    }

    // Delete the auth user (this will cascade to profiles if set up)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      log.error('Error deleting user', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    log.error('Account deletion error', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
