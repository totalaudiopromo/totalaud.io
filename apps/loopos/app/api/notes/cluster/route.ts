/**
 * Note Clustering API
 * AI-powered note clustering by themes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { clusterNotesByTheme } from '@/lib/aiOrganiseNotes'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Fetch all user notes
    const { data: notes, error: fetchError } = await supabase
      .from('loopos_notes')
      .select('*')
      .eq('user_id', user.id)

    if (fetchError || !notes) {
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
    }

    if (notes.length === 0) {
      return NextResponse.json({ clusters: [] })
    }

    // Cluster notes using AI
    const clusters = await clusterNotesByTheme(notes)

    return NextResponse.json({
      success: true,
      clusters,
      total_notes: notes.length,
    })
  } catch (error) {
    console.error('Note clustering error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
