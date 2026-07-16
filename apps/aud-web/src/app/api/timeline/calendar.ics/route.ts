/**
 * GET /api/timeline/calendar.ics?uid=<user>&token=<hmac>
 *
 * The iCalendar feed itself. Calendar clients fetch this without cookies,
 * so access is authenticated by the per-user HMAC token issued at
 * /api/timeline/calendar. Reads use the service-role client scoped to the
 * verified user id only.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRoleClient } from '@/lib/supabase/serviceRole'
import {
  buildCalendarIcs,
  isCalendarFeedAvailable,
  verifyCalendarToken,
  type CalendarEventRow,
} from '@/lib/timeline/calendar-feed'
import { logger } from '@/lib/logger'

const log = logger.scope('CalendarFeedRoute')

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isCalendarFeedAvailable()) {
    return new NextResponse('Calendar feed not configured', { status: 503 })
  }

  const uid = request.nextUrl.searchParams.get('uid')
  const token = request.nextUrl.searchParams.get('token')
  if (!uid || !token || !verifyCalendarToken(uid, token)) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const supabase = getSupabaseServiceRoleClient()
    const { data, error } = await supabase
      .from('user_timeline_events')
      .select('id, title, event_date, lane, description, url, updated_at')
      .eq('user_id', uid)
      .order('event_date', { ascending: true })
      .limit(500)

    if (error) {
      log.error('Calendar feed query failed', error)
      return new NextResponse('Feed temporarily unavailable', { status: 500 })
    }

    const ics = buildCalendarIcs((data ?? []) as CalendarEventRow[])
    return new NextResponse(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="totalaudio-release-plan.ics"',
        'Cache-Control': 'private, max-age=300',
      },
    })
  } catch (error) {
    log.error('Calendar feed failed', error instanceof Error ? error : undefined)
    return new NextResponse('Feed temporarily unavailable', { status: 500 })
  }
}
