'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useLabelStore } from '@/stores/useLabelStore'
import type { ArtistRow } from '@/lib/label/types'
import {
  LabelModal,
  fieldInputClass,
  fieldLabelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../ui/LabelModal'

interface ArtistFormModalProps {
  open: boolean
  onClose: () => void
  labelId: string
  /** When set, the modal edits this artist instead of creating one. */
  artist?: ArtistRow | null
}

export function ArtistFormModal({ open, onClose, labelId, artist }: ArtistFormModalProps) {
  const createArtist = useLabelStore((s) => s.createArtist)
  const updateArtist = useLabelStore((s) => s.updateArtist)

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [genres, setGenres] = useState('')
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(artist?.name ?? '')
      setBio(artist?.bio ?? '')
      setGenres(artist?.genres.join(', ') ?? '')
      setSpotifyUrl(artist?.spotify_url ?? '')
      setError(null)
    }
  }, [open, artist])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)

    const genreList = genres
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean)
      .slice(0, 10)

    try {
      if (artist) {
        await updateArtist(artist.id, {
          name: name.trim(),
          bio: bio.trim() || null,
          genres: genreList,
          spotify_url: spotifyUrl.trim() || null,
        })
      } else {
        await createArtist({
          label_id: labelId,
          name: name.trim(),
          bio: bio.trim() || null,
          genres: genreList,
          spotify_url: spotifyUrl.trim() || null,
        })
      }
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <LabelModal open={open} title={artist ? 'Edit artist' : 'Add artist'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="artist-name" className={fieldLabelClass}>
            Artist name
          </label>
          <input
            id="artist-name"
            className={fieldInputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="artist-genres" className={fieldLabelClass}>
            Genres (comma separated)
          </label>
          <input
            id="artist-genres"
            className={fieldInputClass}
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
            placeholder="e.g. indie pop, electronic"
          />
        </div>
        <div>
          <label htmlFor="artist-spotify" className={fieldLabelClass}>
            Spotify URL (optional)
          </label>
          <input
            id="artist-spotify"
            type="url"
            className={fieldInputClass}
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            placeholder="https://open.spotify.com/artist/…"
          />
        </div>
        <div>
          <label htmlFor="artist-bio" className={fieldLabelClass}>
            Bio (optional)
          </label>
          <textarea
            id="artist-bio"
            className={fieldInputClass}
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={2000}
          />
        </div>
        {error && <p className="text-xs text-ta-error">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className={secondaryButtonClass} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={primaryButtonClass} disabled={saving || !name.trim()}>
            {saving ? 'Saving…' : artist ? 'Save changes' : 'Add artist'}
          </button>
        </div>
      </form>
    </LabelModal>
  )
}
