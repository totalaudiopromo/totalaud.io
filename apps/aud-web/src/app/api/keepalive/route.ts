import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

const log = logger.scope('Keepalive')

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expected = process.env.CRON_SECRET
  if (expected && authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const { error } = await supabase.from('user_profiles').select('id').limit(1)

  if (error) {
    log.error('Keepalive query failed', error)
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 })
  }

  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}
