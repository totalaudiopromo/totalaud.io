import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/supabase/server'

interface OpportunityUpdateRequest {
  status?: 'discovered' | 'saved' | 'pitched' | 'responded' | 'archived'
  notes?: string
}

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/scout/opportunities/[id]
 * Get a single opportunity
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteSupabaseClient()
    const { id } = params

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { data: opportunity, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      opportunity,
    })
  } catch (error) {
    console.error('Opportunity fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 })
  }
}

/**
 * PATCH /api/scout/opportunities/[id]
 * Update opportunity status or notes
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteSupabaseClient()
    const { id } = params

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body: OpportunityUpdateRequest = await request.json()

    // Validate status if provided
    const validStatuses = ['discovered', 'saved', 'pitched', 'responded', 'archived']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Build update object
    const updates: Record<string, unknown> = {}
    if (body.status) updates.status = body.status
    if (body.notes !== undefined) updates.notes = body.notes

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const { data: updated, error } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update opportunity:', error)
      return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 })
    }

    if (!updated) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      opportunity: updated,
    })
  } catch (error) {
    console.error('Opportunity update error:', error)
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 })
  }
}

/**
 * DELETE /api/scout/opportunities/[id]
 * Delete an opportunity
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteSupabaseClient()
    const { id } = params

    // Check auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to delete opportunity:', error)
      return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      deleted: id,
    })
  } catch (error) {
    console.error('Opportunity delete error:', error)
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 })
  }
}
