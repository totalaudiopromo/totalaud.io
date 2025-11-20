/**
 * OperatorOS Layouts API
 * GET  /api/operator/layouts - List all layouts
 * POST /api/operator/layouts - Create or update a layout
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validation schema for layout
const layoutSchema = z.object({
  layout_name: z.string().min(1).max(100),
  windows: z.array(z.object({
    appId: z.string(),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    zIndex: z.number(),
    isMinimised: z.boolean(),
    isMaximised: z.boolean().optional(),
  })),
  theme: z.enum(['xp', 'aqua', 'daw', 'ascii', 'analogue']),
  persona: z.enum(['default', 'strategist', 'producer', 'campaign', 'dev']),
});

/**
 * GET /api/operator/layouts
 * List all layouts for current user
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

    // Check if requesting default layout
    const { searchParams } = new URL(request.url);
    const defaultOnly = searchParams.get('default') === 'true';

    if (defaultOnly) {
      // Fetch default layout
      const { data, error } = await supabase
        .from('operator_layouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('layout_name', 'default')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No default layout found
          return NextResponse.json({ ok: true, data: null });
        }
        throw error;
      }

      return NextResponse.json({ ok: true, data });
    }

    // Fetch all layouts
    const { data, error } = await supabase
      .from('operator_layouts')
      .select('layout_name, theme, persona, windows, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Transform to summary format
    const summaries = data.map(layout => ({
      layout_name: layout.layout_name,
      theme: layout.theme,
      persona: layout.persona,
      window_count: Array.isArray(layout.windows) ? layout.windows.length : 0,
      updated_at: layout.updated_at,
    }));

    return NextResponse.json({ ok: true, data: summaries });
  } catch (error: any) {
    console.error('GET /api/operator/layouts error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/operator/layouts
 * Create or update a layout
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
    const validatedData = layoutSchema.parse(body);

    // For now, use a default workspace_id (you might want to fetch this from user profile)
    const workspace_id = user.id; // Simplified - in production, fetch from profiles table

    // Upsert layout
    const { data, error } = await supabase
      .from('operator_layouts')
      .upsert({
        user_id: user.id,
        workspace_id,
        layout_name: validatedData.layout_name,
        windows: validatedData.windows,
        theme: validatedData.theme,
        persona: validatedData.persona,
      }, {
        onConflict: 'user_id,workspace_id,layout_name',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('POST /api/operator/layouts error:', error);

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
