'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useLabelStore } from '@/stores/useLabelStore'
import { RELEASE_TYPES, RELEASE_TYPE_LABELS, type ReleaseType } from '@/lib/label/types'
import {
  LabelModal,
  fieldInputClass,
  fieldLabelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../ui/LabelModal'

interface CreateReleaseModalProps {
  open: boolean
  onClose: () => void
  labelId: string
  /** Preselect an artist (e.g. when opened from an artist page). */
  defaultArtistId?: string
}

export function CreateReleaseModal({
  open,
  onClose,
  labelId,
  defaultArtistId,
}: CreateReleaseModalProps) {
  const artists = useLabelStore((s) => s.artists)
  const createRelease = useLabelStore((s) => s.createRelease)

  const [title, setTitle] = useState('')
  const [artistId, setArtistId] = useState('')
  const [type, setType] = useState<ReleaseType>('single')
  const [releaseDate, setReleaseDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setTitle('')
      setArtistId(defaultArtistId ?? artists[0]?.id ?? '')
      setType('single')
      setReleaseDate('')
      setError(null)
    }
  }, [open, defaultArtistId, artists])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !artistId) return
    setSaving(true)
    setError(null)
    try {
      await createRelease({
        label_id: labelId,
        artist_id: artistId,
        title: title.trim(),
        type,
        status: releaseDate ? 'scheduled' : 'idea',
        release_date: releaseDate || null,
      })
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <LabelModal open={open} title="New release" onClose={onClose}>
      {artists.length === 0 ? (
        <p className="text-sm text-ta-grey">
          Add an artist to the roster first — releases belong to an artist.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="release-title" className={fieldLabelClass}>
              Title
            </label>
            <input
              id="release-title"
              className={fieldInputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="release-artist" className={fieldLabelClass}>
                Artist
              </label>
              <select
                id="release-artist"
                className={fieldInputClass}
                value={artistId}
                onChange={(e) => setArtistId(e.target.value)}
              >
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="release-type" className={fieldLabelClass}>
                Type
              </label>
              <select
                id="release-type"
                className={fieldInputClass}
                value={type}
                onChange={(e) => setType(e.target.value as ReleaseType)}
              >
                {RELEASE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {RELEASE_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="release-date" className={fieldLabelClass}>
              Release date (optional — setting one schedules it)
            </label>
            <input
              id="release-date"
              type="date"
              className={fieldInputClass}
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-ta-error">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className={secondaryButtonClass} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={primaryButtonClass}
              disabled={saving || !title.trim() || !artistId}
            >
              {saving ? 'Creating…' : 'Create release'}
            </button>
          </div>
        </form>
      )}
    </LabelModal>
  )
}
