/**
 * Loop Import API
 * Import loop from JSON
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateLoopImport, importLoop } from '@/lib/importLoop'

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
    const { loop_json } = body

    if (!loop_json) {
      return NextResponse.json(
        { error: 'loop_json is required' },
        { status: 400 }
      )
    }

    // Validate loop JSON
    const validation = validateLoopImport(loop_json)

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          error: 'Invalid loop JSON',
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    // Import loop
    const importResult = importLoop(validation.data, user.id)

    if (!importResult.success) {
      return NextResponse.json(
        {
          error: 'Import failed',
          errors: importResult.errors,
        },
        { status: 400 }
      )
    }

    // Insert nodes
    const { data: insertedNodes, error: nodesError } = await supabase
      .from('loopos_nodes')
      .insert(importResult.nodes)
      .select()

    if (nodesError) {
      console.error('Failed to insert nodes:', nodesError)
      return NextResponse.json(
        { error: 'Failed to import nodes' },
        { status: 500 }
      )
    }

    // Insert notes (if any)
    let insertedNotes = []
    if (importResult.notes.length > 0) {
      const { data, error: notesError } = await supabase
        .from('loopos_notes')
        .insert(importResult.notes)
        .select()

      if (notesError) {
        console.error('Failed to insert notes:', notesError)
      } else {
        insertedNotes = data || []
      }
    }

    return NextResponse.json({
      success: true,
      imported: {
        nodes: insertedNodes.length,
        notes: insertedNotes.length,
      },
      loop_name: validation.data.name,
    })
  } catch (error) {
    console.error('Loop import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
