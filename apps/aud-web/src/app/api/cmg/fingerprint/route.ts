/**
 * CMG Fingerprint API
 * Phase 22: Creative Memory Graph
 *
 * GET /api/cmg/fingerprint - Returns current CreativeFingerprint for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { computeCreativeFingerprint, getFingerprintSummary } from '@total-audio/core-cmg';
import { logger } from '@/lib/logger';

const log = logger.scope('CMGFingerprintAPI');

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      log.warn('Unauthorised fingerprint request');
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // Get window parameter (default: 90d)
    const { searchParams } = new URL(request.url);
    const window = searchParams.get('window') || '90d';

    log.info('Fetching creative fingerprint', { userId: user.id, window });

    // Try to get cached fingerprint first
    let fingerprint = await getFingerprintSummary(user.id, window);

    // If no cached fingerprint or it's old, compute new one
    if (!fingerprint) {
      log.info('Computing new fingerprint', { userId: user.id, window });
      fingerprint = await computeCreativeFingerprint({ userId: user.id, window });
    }

    return NextResponse.json({
      fingerprint,
      userId: user.id,
      window,
    });
  } catch (error) {
    log.error('Error fetching creative fingerprint', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
