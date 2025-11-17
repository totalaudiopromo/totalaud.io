/**
 * CMG OS Drift API
 * Phase 22: Creative Memory Graph
 *
 * GET /api/cmg/os-drift - Returns OS drift data for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOSDrift, type OSName } from '@total-audio/core-cmg';
import { logger } from '@/lib/logger';

const log = logger.scope('CMGOSDriftAPI');

const VALID_OS_NAMES: OSName[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue'];

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      log.warn('Unauthorised OS drift request');
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // Get parameters
    const { searchParams } = new URL(request.url);
    const os = searchParams.get('os') as OSName;
    const window = searchParams.get('window') || '90d';

    // Validate OS name
    if (!os || !VALID_OS_NAMES.includes(os)) {
      log.warn('Invalid OS name', { os });
      return NextResponse.json(
        { error: 'Invalid OS name. Must be one of: ascii, xp, aqua, daw, analogue' },
        { status: 400 }
      );
    }

    log.info('Fetching OS drift', { userId: user.id, os, window });

    // Get OS drift data
    const drift = await getOSDrift(user.id, { os, window });

    return NextResponse.json({
      drift,
      userId: user.id,
      os,
      window,
    });
  } catch (error) {
    log.error('Error fetching OS drift', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
