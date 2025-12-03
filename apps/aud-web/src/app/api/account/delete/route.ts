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

export async function DELETE() {
  try {
    // Get the current user from session
    const supabase = createRouteSupabaseClient()
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
    const tablesToClean = [
      'ideas',
      'opportunities',
      'timeline_events',
      'pitches',
      'user_preferences',
    ]

    for (const table of tablesToClean) {
      // Using 'as any' because not all tables exist yet
      await (adminClient as any).from(table).delete().eq('user_id', userId)
    }

    // Delete the auth user (this will cascade to profiles if set up)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
