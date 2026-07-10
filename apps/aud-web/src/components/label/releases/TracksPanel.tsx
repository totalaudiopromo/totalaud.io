'use client'

import { useState, type FormEvent } from 'react'
import { TrashIcon } from '@heroicons/react/20/solid'
import { useLabelStore } from '@/stores/useLabelStore'
import { TRACK_STATUSES, type TrackStatus } from '@/lib/label/types'
import { fieldInputClass, secondaryButtonClass } from '../ui/LabelModal'

function formatDuration(seconds: number | null): string {
  if (seconds == null) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const STATUS_TONE: Record<TrackStatus, string> = {
  draft: 'text-ta-grey',
  mixed: 'text-ta-warning',
  mastered: 'text-ta-cyan',
  delivered: 'text-ta-success',
}

export function TracksPanel({ labelId, releaseId }: { labelId: string; releaseId: string }) {
  const tracks = useLabelStore((s) => s.tracksByRelease[releaseId] ?? [])
  const createTrack = useLabelStore((s) => s.createTrack)
  const updateTrack = useLabelStore((s) => s.updateTrack)
  const deleteTrack = useLabelStore((s) => s.deleteTrack)

  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || saving) return
    setSaving(true)
    // Accept m:ss or plain seconds
    let durationSeconds: number | null = null
    if (duration.trim()) {
      const match = duration.trim().match(/^(\d+):([0-5]\d)$/)
      durationSeconds = match
        ? Number(match[1]) * 60 + Number(match[2])
        : Number.parseInt(duration, 10) || null
    }
    try {
      await createTrack({
        label_id: labelId,
        release_id: releaseId,
        title: title.trim(),
        track_number: tracks.length + 1,
        duration_seconds: durationSeconds,
      })
      setTitle('')
      setDuration('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-ta border border-ta-border bg-ta-panel">
      <div className="px-5 py-3 border-b border-ta-border">
        <h2 className="text-sm font-semibold text-ta-white">Tracklist</h2>
      </div>

      {tracks.length === 0 ? (
        <p className="px-5 py-4 text-sm text-ta-grey">No tracks yet — add the first one below.</p>
      ) : (
        <ul>
          {tracks.map((track) => (
            <li
              key={track.id}
              className="flex items-center gap-3 px-5 py-2.5 border-b border-ta-border last:border-b-0 group"
            >
              <span className="w-6 text-xs text-ta-muted text-right shrink-0">
                {track.track_number ?? '·'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ta-white truncate">
                  {track.title}
                  {track.version && <span className="text-ta-grey"> ({track.version})</span>}
                </p>
                {track.isrc && <p className="text-[11px] text-ta-muted">ISRC {track.isrc}</p>}
              </div>
              <span className="text-xs text-ta-grey shrink-0">
                {formatDuration(track.duration_seconds)}
              </span>
              <select
                value={track.status}
                onChange={(e) =>
                  void updateTrack(track.id, releaseId, { status: e.target.value as TrackStatus })
                }
                className={`bg-transparent text-xs capitalize border border-transparent hover:border-ta-border rounded-ta-sm px-1 py-0.5 cursor-pointer focus:outline-none ${STATUS_TONE[track.status]}`}
                aria-label={`Status for ${track.title}`}
              >
                {TRACK_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-ta-panel text-ta-white">
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void deleteTrack(track.id, releaseId)}
                className="opacity-0 group-hover:opacity-100 text-ta-muted hover:text-ta-error transition-all duration-120"
                aria-label={`Delete ${track.title}`}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex gap-2 px-5 py-3 border-t border-ta-border">
        <input
          className={`${fieldInputClass} flex-1`}
          placeholder="Track title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />
        <input
          className={`${fieldInputClass} w-24`}
          placeholder="3:45"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <button type="submit" className={secondaryButtonClass} disabled={saving || !title.trim()}>
          Add
        </button>
      </form>
    </section>
  )
}
