'use client'

import type { TAPTone } from '@/stores/usePitchStore'
import { TONE_OPTIONS } from './constants'

interface TapFormProps {
  artistName: string
  setArtistName: (value: string) => void
  trackTitle: string
  setTrackTitle: (value: string) => void
  genre: string
  setGenre: (value: string) => void
  trackLink: string
  setTrackLink: (value: string) => void
  releaseDate: string
  setReleaseDate: (value: string) => void
  keyHook: string
  setKeyHook: (value: string) => void
  tone: TAPTone
  setTone: (value: TAPTone) => void
  tapError: string | null
}

export function TapForm({
  artistName,
  setArtistName,
  trackTitle,
  setTrackTitle,
  genre,
  setGenre,
  trackLink,
  setTrackLink,
  releaseDate,
  setReleaseDate,
  keyHook,
  setKeyHook,
  tone,
  setTone,
  tapError,
}: TapFormProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label
          htmlFor="tap-artist-name"
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 8,
          }}
        >
          Artist Name{' '}
          <span style={{ color: '#3AA9BE' }} aria-hidden="true">
            *
          </span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          id="tap-artist-name"
          type="text"
          value={artistName}
          onChange={(event) => setArtistName(event.target.value)}
          placeholder="Your artist or band name"
          required
          aria-required="true"
          style={{
            width: '100%',
            padding: '12px 14px',
            fontSize: 14,
            color: '#F7F8F9',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div>
        <label
          htmlFor="tap-track-title"
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 8,
          }}
        >
          Track Title{' '}
          <span style={{ color: '#3AA9BE' }} aria-hidden="true">
            *
          </span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          id="tap-track-title"
          type="text"
          value={trackTitle}
          onChange={(event) => setTrackTitle(event.target.value)}
          placeholder="Name of the track you're pitching"
          required
          aria-required="true"
          style={{
            width: '100%',
            padding: '12px 14px',
            fontSize: 14,
            color: '#F7F8F9',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label
            htmlFor="tap-genre"
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: 8,
            }}
          >
            Genre
          </label>
          <input
            id="tap-genre"
            type="text"
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            placeholder="e.g. Indie Pop, Electronic"
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: 14,
              color: '#F7F8F9',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            htmlFor="tap-release-date"
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: 8,
            }}
          >
            Release Date
          </label>
          <input
            id="tap-release-date"
            type="date"
            value={releaseDate}
            onChange={(event) => setReleaseDate(event.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: 14,
              color: '#F7F8F9',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="tap-track-link"
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 8,
          }}
        >
          Track Link
        </label>
        <input
          id="tap-track-link"
          type="url"
          value={trackLink}
          onChange={(event) => setTrackLink(event.target.value)}
          placeholder="Spotify, SoundCloud, or private link"
          style={{
            width: '100%',
            padding: '12px 14px',
            fontSize: 14,
            color: '#F7F8F9',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div>
        <label
          htmlFor="tap-key-hook"
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 8,
          }}
        >
          Key Hook{' '}
          <span style={{ color: '#3AA9BE' }} aria-hidden="true">
            *
          </span>
          <span className="sr-only">(required)</span>
          <span
            id="tap-key-hook-hint"
            style={{
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.4)',
              marginLeft: 8,
            }}
          >
            (min 10 chars)
          </span>
        </label>
        <textarea
          id="tap-key-hook"
          value={keyHook}
          onChange={(event) => setKeyHook(event.target.value)}
          placeholder="What makes this track special? E.g. 'A dreamy synth-pop anthem about finding hope in urban isolation'"
          rows={3}
          required
          aria-required="true"
          aria-describedby="tap-key-hook-hint"
          style={{
            width: '100%',
            padding: '12px 14px',
            fontSize: 14,
            color: '#F7F8F9',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            outline: 'none',
            fontFamily: 'inherit',
            resize: 'vertical',
            lineHeight: 1.5,
          }}
        />
      </div>

      <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
        <legend
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 12,
          }}
        >
          Tone
        </legend>
        <div style={{ display: 'flex', gap: 8 }} role="radiogroup" aria-label="Select pitch tone">
          {TONE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setTone(option.value)}
              role="radio"
              aria-checked={tone === option.value}
              aria-label={`${option.label}: ${option.description}`}
              style={{
                flex: 1,
                padding: '10px 12px',
                fontSize: 13,
                fontWeight: 500,
                color: tone === option.value ? '#0F1113' : 'rgba(255, 255, 255, 0.6)',
                backgroundColor: tone === option.value ? '#3AA9BE' : 'rgba(255, 255, 255, 0.05)',
                border:
                  tone === option.value
                    ? '1px solid #3AA9BE'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      {tapError && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            padding: 12,
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: 8,
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          {tapError}
        </div>
      )}
    </div>
  )
}
