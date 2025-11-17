import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const GestureCreateSchema = z.object({
  profileId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  gestureType: z.enum(['double_tap', 'hold', 'combo', 'sequence', 'velocity_sensitive']),
  data: z.record(z.unknown()),
  action: z.string().optional(),
  actionParam: z.record(z.unknown()).optional(),
});

/**
 * GET /api/hardware/gestures
 * Returns all gestures for a profile
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
    }

    // Verify profile access
    const { data: profile } = await supabase
      .from('hardware_profiles')
      .select('id')
      .eq('id', profileId)
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: gestures, error } = await supabase
      .from('hardware_gestures')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, gestures: gestures || [] });
  } catch (error) {
    console.error('Error fetching gestures:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/hardware/gestures
 * Creates a new gesture
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = GestureCreateSchema.parse(body);

    // Verify profile access
    const { data: profile } = await supabase
      .from('hardware_profiles')
      .select('id')
      .eq('id', validatedData.profileId)
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('hardware_gestures')
      .insert({
        profile_id: validatedData.profileId,
        name: validatedData.name,
        description: validatedData.description,
        gesture_type: validatedData.gestureType,
        data: validatedData.data,
        action: validatedData.action,
        action_param: validatedData.actionParam || {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, gesture: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }

    console.error('Error creating gesture:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/hardware/gestures
 * Deletes a gesture
 */
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gestureId = searchParams.get('id');

    if (!gestureId) {
      return NextResponse.json({ error: 'Gesture ID required' }, { status: 400 });
    }

    // Verify ownership through profile
    const { data: gesture } = await supabase
      .from('hardware_gestures')
      .select('profile_id')
      .eq('id', gestureId)
      .single();

    if (!gesture) {
      return NextResponse.json({ error: 'Gesture not found' }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from('hardware_profiles')
      .select('id')
      .eq('id', gesture.profile_id)
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabase
      .from('hardware_gestures')
      .delete()
      .eq('id', gestureId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting gesture:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
