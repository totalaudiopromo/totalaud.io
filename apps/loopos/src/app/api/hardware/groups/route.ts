import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const GroupCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  deviceIds: z.array(z.string()),
  primaryDeviceId: z.string().optional(),
  settings: z.object({
    ledSync: z.boolean().default(true),
    sharedMappings: z.boolean().default(true),
    failover: z.enum(['auto', 'manual']).default('auto'),
  }),
});

/**
 * GET /api/hardware/groups
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

    const { data: groups, error } = await supabase
      .from('hardware_device_groups')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, groups: groups || [] });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/hardware/groups
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
    const validatedData = GroupCreateSchema.parse(body);

    const { data, error } = await supabase
      .from('hardware_device_groups')
      .insert({
        user_id: session.user.id,
        name: validatedData.name,
        description: validatedData.description,
        device_ids: validatedData.deviceIds,
        primary_device_id: validatedData.primaryDeviceId,
        settings: validatedData.settings,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, group: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/hardware/groups
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
    const groupId = searchParams.get('id');

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('hardware_device_groups')
      .delete()
      .eq('id', groupId)
      .eq('user_id', session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
