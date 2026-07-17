/**
 * Calendar feed helpers — token signing and ICS generation for the
 * Timeline calendar subscription (see api/timeline/calendar*).
 *
 * Calendar clients fetch the feed URL without cookies, so the feed is
 * authenticated by a per-user HMAC token derived from a server secret.
 * Rotating CALENDAR_FEED_SECRET invalidates every issued URL.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'

export interface CalendarEventRow {
  id: string
  title: string
  event_date: string
  lane: string
  description: string | null
  url: string | null
  updated_at: string
}

function feedSecret(): string | null {
  return process.env.CALENDAR_FEED_SECRET || process.env.CRON_SECRET || null
}

export function isCalendarFeedAvailable(): boolean {
  return feedSecret() !== null
}

export function signCalendarToken(userId: string): string | null {
  const secret = feedSecret()
  if (!secret) return null
  return createHmac('sha256', secret).update(`calendar-feed:${userId}`).digest('hex')
}

export function verifyCalendarToken(userId: string, token: string): boolean {
  const expected = signCalendarToken(userId)
  if (!expected || token.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(token, 'utf8'), Buffer.from(expected, 'utf8'))
}

/** Escape text per RFC 5545 §3.3.11. */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Fold lines longer than 75 octets per RFC 5545 §3.1. */
function foldIcsLine(line: string): string {
  if (line.length <= 75) return line
  const parts: string[] = []
  let remaining = line
  parts.push(remaining.slice(0, 75))
  remaining = remaining.slice(75)
  while (remaining.length > 0) {
    parts.push(` ${remaining.slice(0, 74)}`)
    remaining = remaining.slice(74)
  }
  return parts.join('\r\n')
}

function toIcsUtc(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
}

const LANE_LABELS: Record<string, string> = {
  'pre-release': 'Pre-release',
  release: 'Release',
  promo: 'Promo',
  content: 'Content',
  analytics: 'Review',
}

export function buildCalendarIcs(events: CalendarEventRow[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//totalaud.io//Release Timeline//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    foldIcsLine('X-WR-CALNAME:totalaud.io — release plan'),
    foldIcsLine('X-WR-CALDESC:Your release timeline from totalaud.io'),
  ]

  for (const event of events) {
    const laneLabel = LANE_LABELS[event.lane] ?? event.lane
    lines.push('BEGIN:VEVENT')
    lines.push(foldIcsLine(`UID:${event.id}@totalaud.io`))
    lines.push(`DTSTAMP:${toIcsUtc(event.updated_at)}`)
    lines.push(`DTSTART:${toIcsUtc(event.event_date)}`)
    lines.push(foldIcsLine(`SUMMARY:${escapeIcsText(`${event.title} (${laneLabel})`)}`))
    if (event.description) {
      lines.push(foldIcsLine(`DESCRIPTION:${escapeIcsText(event.description)}`))
    }
    if (event.url) {
      lines.push(foldIcsLine(`URL:${escapeIcsText(event.url)}`))
    }
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return `${lines.join('\r\n')}\r\n`
}
