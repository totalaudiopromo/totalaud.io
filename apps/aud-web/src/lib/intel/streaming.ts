/**
 * Streaming stats from the artist's own exports (Phase 5, docs/ROADMAP_2026.md).
 *
 * Spotify for Artists lets an artist download their audience timeline as a
 * CSV. This module parses that export in plain code and turns it into a calm,
 * plain-English read. Own data only — nothing is scraped and nothing touches
 * the Spotify Web API (docs/STRATEGY_2026.md §5).
 *
 * Hard rules (enforced by unit tests):
 * - The numbers are described, never marked — no targets, no judgement
 * - Thin history is stated honestly, never padded
 * - British English throughout
 */

export interface StreamingRow {
  /** ISO date, yyyy-mm-dd */
  date: string
  streams: number | null
  listeners: number | null
  saves: number | null
  followers: number | null
}

export interface StreamingSummary {
  days: number
  from: string
  to: string
  totalStreams: number
  /** Streams in the final 28 days of the data vs the 28 days before that */
  last28Streams: number
  previous28Streams: number
  peak: { date: string; streams: number } | null
  latestListeners: number | null
  latestFollowers: number | null
  summary: string
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const COLUMN_ALIASES: Record<keyof Omit<StreamingRow, 'date'>, string[]> = {
  streams: ['streams', 'plays', 'stream count'],
  listeners: ['listeners', 'monthly listeners'],
  saves: ['saves', 'library saves'],
  followers: ['followers'],
}

const DATE_ALIASES = ['date', 'day']

/** Split one CSV line, honouring double-quoted fields (including "1,234"). */
function splitCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current)
  return fields.map((field) => field.trim())
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/**
 * Normalise a date cell to ISO yyyy-mm-dd. Spotify for Artists exports ISO
 * dates; slash dates are accepted too, read day-first unless the first part
 * can only be a month (a British product reads 07/06 as 7 June).
 */
export function parseStatDate(raw: string): string | null {
  const value = raw.trim()

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    return isValidDate(Number(year), Number(month), Number(day)) ? `${year}-${month}-${day}` : null
  }

  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    let day = Number(slashMatch[1])
    let month = Number(slashMatch[2])
    if (day <= 12 && month > 12) {
      ;[day, month] = [month, day]
    }
    return isValidDate(Number(slashMatch[3]), month, day)
      ? `${slashMatch[3]}-${pad(month)}-${pad(day)}`
      : null
  }

  return null
}

function isValidDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function parseCount(raw: string | undefined): number | null {
  if (raw === undefined) return null
  const cleaned = raw.replace(/[",\s]/g, '')
  if (cleaned === '') return null
  const value = Number(cleaned)
  if (!Number.isFinite(value) || value < 0) return null
  return Math.round(value)
}

/**
 * Parse a Spotify for Artists CSV export into daily rows.
 *
 * Tolerant of column order and naming variants; rows without a readable date
 * or without any numeric metric are dropped. Duplicate dates keep the last
 * occurrence, and the result is sorted oldest first.
 */
export function parseStreamingCsv(csv: string): StreamingRow[] {
  const lines = csv
    .replace(/^\uFEFF/, '')
    .split(/\r\n|\r|\n/)
    .filter((line) => line.trim() !== '')

  if (lines.length < 2) return []

  const header = splitCsvLine(lines[0]).map((cell) => cell.replace(/"/g, '').toLowerCase())

  const dateIndex = header.findIndex((cell) => DATE_ALIASES.includes(cell))
  if (dateIndex === -1) return []

  const columnIndex: Partial<Record<keyof Omit<StreamingRow, 'date'>, number>> = {}
  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    const index = header.findIndex((cell) => aliases.includes(cell))
    if (index !== -1) columnIndex[key as keyof typeof COLUMN_ALIASES] = index
  }

  const byDate = new Map<string, StreamingRow>()

  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line)
    const date = parseStatDate(cells[dateIndex] ?? '')
    if (!date) continue

    const row: StreamingRow = {
      date,
      streams: columnIndex.streams !== undefined ? parseCount(cells[columnIndex.streams]) : null,
      listeners:
        columnIndex.listeners !== undefined ? parseCount(cells[columnIndex.listeners]) : null,
      saves: columnIndex.saves !== undefined ? parseCount(cells[columnIndex.saves]) : null,
      followers:
        columnIndex.followers !== undefined ? parseCount(cells[columnIndex.followers]) : null,
    }

    if (
      row.streams === null &&
      row.listeners === null &&
      row.saves === null &&
      row.followers === null
    ) {
      continue
    }

    byDate.set(date, row)
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

function formatBritishDate(iso: string): string {
  const day = Number(iso.slice(8, 10))
  const month = MONTHS[Number(iso.slice(5, 7)) - 1]
  return `${day} ${month}`
}

function formatCount(value: number): string {
  return value.toLocaleString('en-GB')
}

/** Days between two ISO dates, inclusive of neither end's time component. */
function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000)
}

/**
 * Turn daily rows into headline numbers and one calm, plain-English read.
 * Windows are relative to the newest date in the data, not the wall clock,
 * so an older export still reads honestly. Returns null with no rows.
 */
export function summariseStreaming(rows: StreamingRow[]): StreamingSummary | null {
  if (rows.length === 0) return null

  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date))
  const from = sorted[0].date
  const to = sorted[sorted.length - 1].date

  let totalStreams = 0
  let last28Streams = 0
  let previous28Streams = 0
  let peak: { date: string; streams: number } | null = null
  let latestListeners: number | null = null
  let latestFollowers: number | null = null

  for (const row of sorted) {
    if (row.listeners !== null) latestListeners = row.listeners
    if (row.followers !== null) latestFollowers = row.followers
    if (row.streams === null) continue

    totalStreams += row.streams
    if (peak === null || row.streams > peak.streams) {
      peak = { date: row.date, streams: row.streams }
    }

    const age = daysBetween(row.date, to)
    if (age < 28) last28Streams += row.streams
    else if (age < 56) previous28Streams += row.streams
  }

  const days = sorted.length
  const spansTwoWindows = daysBetween(from, to) >= 28

  const parts: string[] = []

  if (days < 7) {
    parts.push(
      `Early days — ${days} day${days === 1 ? '' : 's'} of streaming history imported, ${formatCount(totalStreams)} stream${totalStreams === 1 ? '' : 's'} so far.`
    )
  } else {
    parts.push(`${days} days of streaming history, ${formatCount(totalStreams)} streams in all.`)
    if (spansTwoWindows) {
      const trend =
        previous28Streams === 0
          ? null
          : last28Streams > previous28Streams * 1.05
            ? 'up on'
            : last28Streams < previous28Streams * 0.95
              ? 'down on'
              : 'about level with'
      parts.push(
        trend
          ? `The last four weeks brought ${formatCount(last28Streams)} streams — ${trend} the ${formatCount(previous28Streams)} before.`
          : `The last four weeks brought ${formatCount(last28Streams)} streams.`
      )
    }
    if (peak && peak.streams > 0) {
      parts.push(
        `Best day: ${formatCount(peak.streams)} streams on ${formatBritishDate(peak.date)}.`
      )
    }
  }

  if (latestFollowers !== null) {
    parts.push(`Followers stood at ${formatCount(latestFollowers)} at the last count.`)
  }

  return {
    days,
    from,
    to,
    totalStreams,
    last28Streams,
    previous28Streams,
    peak,
    latestListeners,
    latestFollowers,
    summary: parts.join(' '),
  }
}
