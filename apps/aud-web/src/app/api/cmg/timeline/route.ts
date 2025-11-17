/**
 * CMG Timeline API
 * Phase 22: Creative Memory Graph
 *
 * GET /api/cmg/timeline - Returns time-bucketed cmg_nodes for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTimelineBuckets } from '@total-audio/core-cmg';
import { logger } from '@/lib/logger';

const log = logger.scope('CMGTimelineAPI');

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      log.warn('Unauthorised timeline request');
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // Get window parameter (default: 90d)
    const { searchParams } = new URL(request.url);
    const window = searchParams.get('window') || '90d';

    log.info('Fetching timeline buckets', { userId: user.id, window });

    // Get timeline buckets
    const buckets = await getTimelineBuckets(user.id, window);

    return NextResponse.json({
      buckets,
      userId: user.id,
      window,
      totalBuckets: buckets.length,
      totalNodes: buckets.reduce((sum, b) => sum + b.stats.totalNodes, 0),
    });
  } catch (error) {
    log.error('Error fetching timeline buckets', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
