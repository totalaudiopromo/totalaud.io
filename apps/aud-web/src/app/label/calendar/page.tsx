'use client'

/**
 * Label OS — Calendar: month grid of release dates and task due dates.
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { useLabelStore, selectActiveLabel } from '@/stores/useLabelStore'

interface CalendarEvent {
  id: string
  kind: 'release' | 'task'
  title: string
  href: string
  overdue: boolean
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function isoDay(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function CalendarPage() {
  const activeLabel = useLabelStore(selectActiveLabel)
  const releases = useLabelStore((s) => s.releases)
  const tasks = useLabelStore((s) => s.tasks)

  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const today = isoDay(new Date())

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    const push = (day: string, event: CalendarEvent) => {
      map.set(day, [...(map.get(day) ?? []), event])
    }
    for (const release of releases) {
      if (!release.release_date) continue
      push(release.release_date, {
        id: `r-${release.id}`,
        kind: 'release',
        title: release.title,
        href: `/label/releases/${release.id}`,
        overdue: false,
      })
    }
    for (const task of tasks) {
      if (!task.due_date || task.completed) continue
      push(task.due_date, {
        id: `t-${task.id}`,
        kind: 'task',
        title: task.title,
        href: `/label/releases/${task.release_id}`,
        overdue: task.due_date < today,
      })
    }
    return map
  }, [releases, tasks, today])

  // Build the visible grid: Monday-start weeks covering the cursor month
  const days = useMemo(() => {
    const first = new Date(cursor)
    const startOffset = (first.getDay() + 6) % 7 // Monday = 0
    const start = new Date(first)
    start.setDate(first.getDate() - startOffset)

    const cells: { date: Date; inMonth: boolean }[] = []
    const d = new Date(start)
    for (let i = 0; i < 42; i++) {
      cells.push({ date: new Date(d), inMonth: d.getMonth() === cursor.getMonth() })
      d.setDate(d.getDate() + 1)
    }
    // Trim a trailing all-out-of-month week
    return cells.slice(0, 35).some((c, i) => i >= 28 && c.inMonth)
      ? cells.slice(0, 35)
      : cells.slice(0, 42)
  }, [cursor])

  if (!activeLabel) return null

  const monthLabel = cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ta-white">Calendar</h1>
          <p className="text-sm text-ta-grey mt-1">
            Release dates and task deadlines across the label.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="p-1.5 rounded-ta-sm border border-ta-border text-ta-grey hover:text-ta-white hover:bg-white/[0.04] transition-colors duration-120"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <span className="text-sm text-ta-white min-w-36 text-center">{monthLabel}</span>
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="p-1.5 rounded-ta-sm border border-ta-border text-ta-grey hover:text-ta-white hover:bg-white/[0.04] transition-colors duration-120"
            aria-label="Next month"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="rounded-ta border border-ta-border bg-ta-panel overflow-hidden">
        <div className="grid grid-cols-7 border-b border-ta-border">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-[11px] uppercase tracking-wider text-ta-muted"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map(({ date, inMonth }) => {
            const key = isoDay(date)
            const events = eventsByDay.get(key) ?? []
            const isToday = key === today
            return (
              <div
                key={key}
                className={`min-h-24 border-b border-r border-ta-border p-1.5 [&:nth-child(7n)]:border-r-0 ${
                  inMonth ? '' : 'opacity-40'
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center h-5 w-5 text-[11px] rounded-full mb-1 ${
                    isToday ? 'bg-ta-cyan text-ta-black font-semibold' : 'text-ta-grey'
                  }`}
                >
                  {date.getDate()}
                </span>
                <div className="flex flex-col gap-1">
                  {events.slice(0, 3).map((event) => (
                    <Link
                      key={event.id}
                      href={event.href}
                      title={event.title}
                      className={`block px-1.5 py-0.5 rounded-ta-sm text-[10px] truncate transition-opacity duration-120 hover:opacity-80 ${
                        event.kind === 'release'
                          ? 'bg-ta-cyan/20 text-ta-cyan'
                          : event.overdue
                            ? 'bg-ta-error/20 text-ta-error'
                            : 'bg-ta-warning/15 text-ta-warning'
                      }`}
                    >
                      {event.title}
                    </Link>
                  ))}
                  {events.length > 3 && (
                    <span className="text-[10px] text-ta-muted px-1.5">
                      +{events.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 text-[11px] text-ta-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ta-cyan" /> Release
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ta-warning" /> Task due
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ta-error" /> Overdue
        </span>
      </div>
    </div>
  )
}
