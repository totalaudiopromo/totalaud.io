import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const MappingCreateSchema = z.object({
  profileId: z.string().uuid(),
  inputType: z.enum(['pad', 'encoder', 'button', 'fader', 'strip', 'key', 'knob']),
  inputId: z.string(),
  action: z.enum([
    'open_window',
    'focus_window',
    'close_window',
    'cycle_window',
    'trigger_scene',
    'switch_scene',
    'run_agent',
    'spawn_agent',
    'run_skill',
    'control_param',
    'adjust_param',
    'toggle_mode',
    'save_snapshot',
    'trigger_command',
    'navigate',
    'cycle_theme',
    'toggle_flow_mode',
    'trigger_boot',
  ]),
  param: z.record(z.unknown()),
  feedback: z.string().nullable().optional(),
  enabled: z.boolean().optional(),
  context: z.string().nullable().optional(),
});

const MappingUpdateSchema = z.object({
  id: z.string().uuid(),
  enabled: z.boolean().optional(),
  param: z.record(z.unknown()).optional(),
  feedback: z.string().nullable().optional(),
  context: z.string().nullable().optional(),
});

/**
 * GET /api/hardware/mappings
 * Returns all mappings for the user's active profile
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

    // Get profile ID from query params
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
    }

    // Verify profile belongs to user
    const { data: profile, error: profileError } = await supabase
      .from('hardware_profiles')
      .select('id')
      .eq('id', profileId)
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get mappings
    const { data: mappings, error } = await supabase
      .from('hardware_mappings')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      mappings: mappings || [],
    });
  } catch (error) {
    console.error('Error fetching mappings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/hardware/mappings
 * Creates or updates a mapping
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
    const validatedData = MappingCreateSchema.parse(body);

    // Verify profile belongs to user
    const { data: profile, error: profileError } = await supabase
      .from('hardware_profiles')
      .select('id')
      .eq('id', validatedData.profileId)
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Upsert mapping
    const { data, error } = await supabase
      .from('hardware_mappings')
      .upsert(
        {
          profile_id: validatedData.profileId,
          input_type: validatedData.inputType,
          input_id: validatedData.inputId,
          action: validatedData.action,
          param: validatedData.param,
          feedback: validatedData.feedback ?? null,
          enabled: validatedData.enabled ?? true,
          context: validatedData.context ?? null,
        },
        {
          onConflict: 'profile_id,input_id',
        }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      mapping: data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }

    console.error('Error creating mapping:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/hardware/mappings
 * Updates an existing mapping
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
    const validatedData = MappingUpdateSchema.parse(body);

    // Verify mapping belongs to user's profile
    const { data: mapping, error: mappingError } = await supabase
      .from('hardware_mappings')
      .select('profile_id')
      .eq('id', validatedData.id)
      .single();

    if (mappingError || !mapping) {
      return NextResponse.json({ error: 'Mapping not found' }, { status: 404 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('hardware_profiles')
      .select('id')
      .eq('id', mapping.profile_id)
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update mapping
    const updateData: Record<string, any> = {};
    if (validatedData.enabled !== undefined) updateData.enabled = validatedData.enabled;
    if (validatedData.param !== undefined) updateData.param = validatedData.param;
    if (validatedData.feedback !== undefined) updateData.feedback = validatedData.feedback;
    if (validatedData.context !== undefined) updateData.context = validatedData.context;

    const { data, error } = await supabase
      .from('hardware_mappings')
      .update(updateData)
      .eq('id', validatedData.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      mapping: data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }

    console.error('Error updating mapping:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/hardware/mappings
 * Deletes a mapping
 */
export async function DELETE(request: NextRequest) {
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

    // Get mapping ID from query params
    const { searchParams } = new URL(request.url);
    const mappingId = searchParams.get('id');

    if (!mappingId) {
      return NextResponse.json({ error: 'Mapping ID required' }, { status: 400 });
    }

    // Verify mapping belongs to user's profile
    const { data: mapping, error: mappingError } = await supabase
      .from('hardware_mappings')
      .select('profile_id')
      .eq('id', mappingId)
      .single();

    if (mappingError || !mapping) {
      return NextResponse.json({ error: 'Mapping not found' }, { status: 404 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('hardware_profiles')
      .select('id')
      .eq('id', mapping.profile_id)
      .eq('user_id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete mapping
    const { error } = await supabase.from('hardware_mappings').delete().eq('id', mappingId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting mapping:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
