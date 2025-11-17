import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * GET /api/hardware/analytics?type=heatmap|flow-score|usage
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
    const type = searchParams.get('type');
    const sessionId = searchParams.get('sessionId');

    switch (type) {
      case 'heatmap': {
        const { data, error } = await supabase.rpc('get_hardware_usage_heatmap', {
          p_user_id: session.user.id,
          p_session_id: sessionId || null,
        });

        if (error) throw error;

        // Normalize intensity
        const maxUsage = Math.max(...data.map((d: any) => d.usage_count), 1);
        const heatmap = data.map((item: any) => ({
          inputId: item.input_id,
          usageCount: item.usage_count,
          avgVelocity: item.avg_velocity || 0,
          intensity: item.usage_count / maxUsage,
        }));

        return NextResponse.json({ success: true, heatmap });
      }

      case 'flow-score': {
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required for flow score' }, { status: 400 });
        }

        const { data, error } = await supabase.rpc('calculate_flow_score', {
          p_session_id: sessionId,
        });

        if (error) throw error;

        return NextResponse.json({ success: true, flowScore: data || 0 });
      }

      case 'usage': {
        const { data, error } = await supabase
          .from('hardware_usage')
          .select('*')
          .eq('user_id', session.user.id)
          .order('last_used_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        return NextResponse.json({ success: true, usage: data || [] });
      }

      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
