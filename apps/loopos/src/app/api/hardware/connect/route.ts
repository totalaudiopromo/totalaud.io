import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const ConnectSchema = z.object({
  deviceType: z.enum(['push2', 'push3', 'launchpad', 'mpk', 'generic_midi']),
  deviceId: z.string().optional(),
  midiInPort: z.string().optional(),
  midiOutPort: z.string().optional(),
  layout: z.record(z.unknown()).optional(),
});

/**
 * POST /api/hardware/connect
 * Creates or updates hardware profile and returns available mappings
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
    const validatedData = ConnectSchema.parse(body);

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('hardware_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('device_type', validatedData.deviceType)
      .single();

    let profileId: string;

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('hardware_profiles')
        .update({
          device_id: validatedData.deviceId,
          midi_in_port: validatedData.midiInPort,
          midi_out_port: validatedData.midiOutPort,
          layout: validatedData.layout || {},
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProfile.id)
        .select()
        .single();

      if (error) throw error;
      profileId = data.id;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('hardware_profiles')
        .insert({
          user_id: session.user.id,
          device_type: validatedData.deviceType,
          device_id: validatedData.deviceId,
          midi_in_port: validatedData.midiInPort,
          midi_out_port: validatedData.midiOutPort,
          layout: validatedData.layout || {},
        })
        .select()
        .single();

      if (error) throw error;
      profileId = data.id;
    }

    // Get mappings for this profile
    const { data: mappings, error: mappingsError } = await supabase
      .from('hardware_mappings')
      .select('*')
      .eq('profile_id', profileId)
      .eq('enabled', true);

    if (mappingsError) throw mappingsError;

    return NextResponse.json({
      success: true,
      profileId,
      mappings: mappings || [],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }

    console.error('Error connecting hardware:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
