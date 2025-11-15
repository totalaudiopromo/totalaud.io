/**
 * Note Summarisation API
 * AI-powered note summarisation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { summariseNote } from '@/lib/aiOrganiseNotes'

const requestSchema = z.object({
  note_id: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json()
    const { note_id } = requestSchema.parse(body)

    // Fetch note
    const { data: note, error: fetchError } = await supabase
      .from('loopos_notes')
      .select('*')
      .eq('id', note_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Summarise note using AI
    const summary = await summariseNote(note)

    // Update note with AI summary and themes
    const { error: updateError } = await supabase
      .from('loopos_notes')
      .update({
        ai_summary: summary.summary,
        ai_themes: summary.themes,
      })
      .eq('id', note_id)

    if (updateError) {
      console.error('Failed to update note with summary:', updateError)
      return NextResponse.json(
        { error: 'Failed to save summary' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      summary: summary.summary,
      themes: summary.themes,
    })
  } catch (error) {
    console.error('Note summarisation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
