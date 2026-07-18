/**
 * Streaming stats — parser and summary tests (Phase 5, docs/ROADMAP_2026.md).
 *
 * The hard rules under test: the numbers are described without judgement,
 * thin history is stated honestly, and a re-import of the same CSV cannot
 * change the result (the parser is deterministic and dedupes by date).
 */

import { describe, expect, it } from 'vitest'
import {
  parseStatDate,
  parseStreamingCsv,
  summariseStreaming,
  type StreamingRow,
} from '../streaming'

const SPOTIFY_AUDIENCE_CSV = `"date","listeners","streams","followers"
"2026-06-01","120","340","1,010"
"2026-06-02","98","280","1,012"
"2026-06-03","145","412","1,020"`

describe('parseStatDate', () => {
  it('reads ISO dates', () => {
    expect(parseStatDate('2026-06-14')).toBe('2026-06-14')
    expect(parseStatDate('2026-06-14T00:00:00Z')).toBe('2026-06-14')
  })

  it('reads slash dates day-first, flipping only when the day part can only be a month', () => {
    expect(parseStatDate('07/06/2026')).toBe('2026-06-07')
    expect(parseStatDate('06/14/2026')).toBe('2026-06-14')
  })

  it('rejects unreadable or impossible dates', () => {
    expect(parseStatDate('June 14th')).toBeNull()
    expect(parseStatDate('2026-13-40')).toBeNull()
    expect(parseStatDate('')).toBeNull()
  })
})

describe('parseStreamingCsv', () => {
  it('parses a Spotify for Artists audience export', () => {
    const rows = parseStreamingCsv(SPOTIFY_AUDIENCE_CSV)
    expect(rows).toHaveLength(3)
    expect(rows[0]).toEqual({
      date: '2026-06-01',
      streams: 340,
      listeners: 120,
      saves: null,
      followers: 1010,
    })
  })

  it('handles unquoted headers, other column orders and the plays alias', () => {
    const rows = parseStreamingCsv(`plays,date\n512,2026-06-01`)
    expect(rows).toEqual([
      { date: '2026-06-01', streams: 512, listeners: null, saves: null, followers: null },
    ])
  })

  it('drops rows without a readable date or without any metric', () => {
    const rows = parseStreamingCsv(`date,streams\nnot-a-date,100\n2026-06-01,\n2026-06-02,200`)
    expect(rows).toEqual([
      { date: '2026-06-02', streams: 200, listeners: null, saves: null, followers: null },
    ])
  })

  it('dedupes by date (last row wins) and sorts oldest first', () => {
    const rows = parseStreamingCsv(`date,streams\n2026-06-02,50\n2026-06-01,10\n2026-06-02,60`)
    expect(rows.map((row) => [row.date, row.streams])).toEqual([
      ['2026-06-01', 10],
      ['2026-06-02', 60],
    ])
  })

  it('is deterministic on re-parse, so a re-import cannot change the result', () => {
    expect(parseStreamingCsv(SPOTIFY_AUDIENCE_CSV)).toEqual(parseStreamingCsv(SPOTIFY_AUDIENCE_CSV))
  })

  it('returns nothing for content that is not a streaming export', () => {
    expect(parseStreamingCsv('')).toEqual([])
    expect(parseStreamingCsv('hello\nworld')).toEqual([])
    expect(parseStreamingCsv('name,email\nAmy,amy@example.com')).toEqual([])
  })
})

/** Build n consecutive daily rows ending 2026-06-30, streams via fn(index). */
function dailyRows(count: number, streamsFor: (index: number) => number): StreamingRow[] {
  const rows: StreamingRow[] = []
  const end = Date.parse('2026-06-30')
  for (let i = 0; i < count; i++) {
    const date = new Date(end - (count - 1 - i) * 86_400_000).toISOString().slice(0, 10)
    rows.push({ date, streams: streamsFor(i), listeners: null, saves: null, followers: null })
  }
  return rows
}

describe('summariseStreaming', () => {
  it('returns null with no rows', () => {
    expect(summariseStreaming([])).toBeNull()
  })

  it('states thin history honestly instead of padding it', () => {
    const summary = summariseStreaming(dailyRows(3, () => 10))
    expect(summary?.summary).toContain('Early days')
    expect(summary?.summary).toContain('3 days')
    expect(summary?.totalStreams).toBe(30)
  })

  it('compares the last four weeks with the four before, relative to the data', () => {
    // 56 days: first 28 at 10 streams/day, final 28 at 20 streams/day
    const summary = summariseStreaming(dailyRows(56, (i) => (i < 28 ? 10 : 20)))
    expect(summary?.last28Streams).toBe(20 * 28)
    expect(summary?.previous28Streams).toBe(10 * 28)
    expect(summary?.summary).toContain('up on')
  })

  it('describes a quieter month without judgement', () => {
    const summary = summariseStreaming(dailyRows(56, (i) => (i < 28 ? 20 : 10)))
    expect(summary?.summary).toContain('down on')
    expect(summary?.summary).not.toMatch(/\b(bad|poor|fail|weak|should)\b/i)
  })

  it('finds the peak day and formats it in British style', () => {
    const summary = summariseStreaming(dailyRows(14, (i) => (i === 9 ? 412 : 50)))
    expect(summary?.peak).toEqual({ date: '2026-06-26', streams: 412 })
    expect(summary?.summary).toContain('412 streams on 26 June')
  })

  it('carries the latest follower count through', () => {
    const rows = parseStreamingCsv(SPOTIFY_AUDIENCE_CSV)
    const summary = summariseStreaming(rows)
    expect(summary?.latestFollowers).toBe(1020)
    expect(summary?.summary).toContain('1,020')
  })
})
