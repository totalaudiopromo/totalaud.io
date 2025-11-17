import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const SessionStartSchema = z.object({
  deviceType: z.enum(['push2', 'push3', 'launchpad', 'mpk', 'generic_midi']),
  profileId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const SessionEndSchema = z.object({
  sessionId: z.string().uuid(),
});

/**
 * GET /api/hardware/sessions
 * Returns session history for the user
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const active = searchParams.get('active') === 'true';

    // Build query
    let query = supabase
      .from('hardware_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('started_at', { ascending: false });

    if (active) {
      query = query.is('ended_at', null);
    }

    query = query.limit(limit);

    const { data: sessions, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      sessions: sessions || [],
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/hardware/sessions
 * Starts a new hardware session
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const validatedData = SessionStartSchema.parse(body);

    // Check if there's already an active session
    const { data: activeSessions } = await supabase
      .from('hardware_sessions')
      .select('id')
      .eq('user_id', session.user.id)
      .is('ended_at', null);

    if (activeSessions && activeSessions.length > 0) {
      return NextResponse.json(
        { error: 'An active session already exists. Please end it first.' },
        { status: 400 }
      );
    }

    // Create new session
    const { data, error } = await supabase
      .from('hardware_sessions')
      .insert({
        user_id: session.user.id,
        device_type: validatedData.deviceType,
        profile_id: validatedData.profileId ?? null,
        metadata: validatedData.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      session: data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }

    console.error('Error starting session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/hardware/sessions
 * Ends a hardware session
 */
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const validatedData = SessionEndSchema.parse(body);

    // Verify session belongs to user
    const { data: hwSession, error: sessionError } = await supabase
      .from('hardware_sessions')
      .select('*')
      .eq('id', validatedData.sessionId)
      .eq('user_id', session.user.id)
      .single();

    if (sessionError || !hwSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (hwSession.ended_at) {
      return NextResponse.json({ error: 'Session already ended' }, { status: 400 });
    }

    // Calculate duration
    const duration = Date.now() - new Date(hwSession.started_at).getTime();

    // End session
    const { data, error } = await supabase
      .from('hardware_sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_ms: duration,
      })
      .eq('id', validatedData.sessionId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      session: data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }

    console.error('Error ending session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
