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

    // Delete user data from related tables (cascade should handle most)
    // These are explicit deletes for tables that may not have cascade
    // Note: Some tables may not exist yet - errors are logged but don't block deletion
    const tablesToClean = [
      'user_ideas',
      'opportunities',
      'user_timeline_events',
      'user_pitch_drafts',
      'user_preferences',
    ]

    for (const table of tablesToClean) {
      try {
        // Using 'as any' because not all tables exist in the generated types yet
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (adminClient as any).from(table).delete().eq('user_id', userId)
        if (error) {
          // Log but don't fail - table might not exist or have different schema
          log.warn(`Failed to clean ${table}`, { error: error.message })
        }
      } catch (err) {
        // Table might not exist - log and continue
        log.warn(`Error cleaning ${table}`, { error: err })
      }
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
