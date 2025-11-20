/**
 * OperatorOS Single Layout API
 * GET    /api/operator/layouts/[name] - Get specific layout
 * DELETE /api/operator/layouts/[name] - Delete specific layout
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * GET /api/operator/layouts/[name]
 * Get a specific layout by name
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
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

    const layoutName = params.name;

    // Fetch layout
    const { data, error } = await supabase
      .from('operator_layouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('layout_name', layoutName)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { ok: false, error: 'Layout not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('GET /api/operator/layouts/[name] error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/operator/layouts/[name]
 * Delete a specific layout
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
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

    const layoutName = params.name;

    // Prevent deleting 'default' layout
    if (layoutName === 'default') {
      return NextResponse.json(
        { ok: false, error: 'Cannot delete default layout' },
        { status: 400 }
      );
    }

    // Delete layout
    const { error } = await supabase
      .from('operator_layouts')
      .delete()
      .eq('user_id', user.id)
      .eq('layout_name', layoutName);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('DELETE /api/operator/layouts/[name] error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
