/**
 * OperatorOS App Profiles API
 * GET  /api/operator/app-profiles?appId=... - Get app profile(s)
 * POST /api/operator/app-profiles - Create or update app profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validation schema for app profile
const appProfileSchema = z.object({
  app_id: z.string().min(1),
  preferred_layout_name: z.string().optional(),
  launch_mode: z.enum(['maximized', 'floating', 'last_state']).optional(),
  pinned: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * GET /api/operator/app-profiles
 * Get app profile(s) - can filter by appId or pinned
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') || '',
        },
      },
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const pinnedOnly = searchParams.get('pinned') === 'true';

    // Build query
    let query = supabase
      .from('operator_app_profiles')
      .select('*')
      .eq('user_id', user.id);

    // Filter by appId if provided
    if (appId) {
      query = query.eq('app_id', appId);

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ ok: true, data: null });
        }
        throw error;
      }

      return NextResponse.json({ ok: true, data });
    }

    // Filter by pinned if requested
    if (pinnedOnly) {
      query = query.eq('pinned', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('GET /api/operator/app-profiles error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/operator/app-profiles
 * Create or update an app profile
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') || '',
        },
      },
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = appProfileSchema.parse(body);

    // For now, use a default workspace_id
    const workspace_id = user.id;

    // Upsert app profile
    const { data, error } = await supabase
      .from('operator_app_profiles')
      .upsert({
        user_id: user.id,
        workspace_id,
        app_id: validatedData.app_id,
        preferred_layout_name: validatedData.preferred_layout_name,
        launch_mode: validatedData.launch_mode || 'floating',
        pinned: validatedData.pinned !== undefined ? validatedData.pinned : false,
        metadata: validatedData.metadata || {},
      }, {
        onConflict: 'user_id,workspace_id,app_id',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('POST /api/operator/app-profiles error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
