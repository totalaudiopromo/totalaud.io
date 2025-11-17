/**
 * CMG Motifs API
 * Phase 22: Creative Memory Graph
 *
 * GET /api/cmg/motifs - Returns structural motifs for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStructuralMotifs } from '@total-audio/core-cmg';
import { logger } from '@/lib/logger';

const log = logger.scope('CMGMotifsAPI');

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      log.warn('Unauthorised motifs request');
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // Get parameters
    const { searchParams } = new URL(request.url);
    const window = searchParams.get('window') || '90d';
    const minRecurrence = parseInt(searchParams.get('minRecurrence') || '2', 10);

    log.info('Fetching structural motifs', { userId: user.id, window, minRecurrence });

    // Get structural motifs
    const motifs = await getStructuralMotifs(user.id, {
      window,
      minRecurrence,
    });

    return NextResponse.json({
      motifs,
      userId: user.id,
      window,
      minRecurrence,
      totalMotifs: motifs.length,
    });
  } catch (error) {
    log.error('Error fetching structural motifs', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
