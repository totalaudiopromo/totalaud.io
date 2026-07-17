/**
 * GET /api/timeline/calendar
 *
 * Returns the signed-in user's calendar subscription URL for their release
 * timeline. Paste into Google Calendar ("From URL") or Apple Calendar
 * (File → New Calendar Subscription) — the plan then lives where the artist
 * already looks every day.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/requireAuth'
import { isCalendarFeedAvailable, signCalendarToken } from '@/lib/timeline/calendar-feed'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  if (!isCalendarFeedAvailable()) {
    return NextResponse.json(
      { error: 'Calendar feed is not configured on this environment' },
      { status: 503 }
    )
  }

  const token = signCalendarToken(auth.user.id)
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  const feedUrl = `${origin.replace(/\/$/, '')}/api/timeline/calendar.ics?uid=${auth.user.id}&token=${token}`

  return NextResponse.json({
    feedUrl,
    webcalUrl: feedUrl.replace(/^https?:/, 'webcal:'),
  })
}
