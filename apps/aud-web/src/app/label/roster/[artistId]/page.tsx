'use client'

/**
 * Label OS — Artist detail: profile plus their releases grouped by status.
 */

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/20/solid'
import {
  useLabelStore,
  selectActiveLabel,
  selectArtistById,
  selectReleasesByArtist,
} from '@/stores/useLabelStore'
import { EmptyState } from '@/components/ui/EmptyState'
import { ArtistFormModal } from '@/components/label/roster/ArtistFormModal'
import { ReleaseStatusBadge } from '@/components/label/releases/ReleaseStatusBadge'
import { RELEASE_STATUSES, RELEASE_STATUS_LABELS, RELEASE_TYPE_LABELS } from '@/lib/label/types'
import { secondaryButtonClass } from '@/components/label/ui/LabelModal'

export default function ArtistDetailPage({ params }: { params: Promise<{ artistId: string }> }) {
  const { artistId } = use(params)
  const router = useRouter()
  const activeLabel = useLabelStore(selectActiveLabel)
  const artist = useLabelStore(selectArtistById(artistId))
  const artistReleases = useLabelStore(selectReleasesByArtist(artistId))
  const isLoading = useLabelStore((s) => s.isLoadingArtists)
  const deleteArtist = useLabelStore((s) => s.deleteArtist)
  const [editOpen, setEditOpen] = useState(false)
  const [removing, setRemoving] = useState(false)

  if (!activeLabel) return null

  if (!artist) {
    if (isLoading) {
      return <div className="h-40 bg-white/[0.03] rounded-ta animate-pulse" />
    }
    return (
      <EmptyState
        title="Artist not found"
        description="They may have been removed from the roster."
        action={
          <Link href="/label/roster" className={secondaryButtonClass}>
            Back to roster
          </Link>
        }
      />
    )
  }

  async function handleDelete() {
    if (!artist || removing) return
    const confirmed = window.confirm(
      `Remove ${artist.name} from the roster? Their releases and tasks go with them.`
    )
    if (!confirmed) return
    setRemoving(true)
    try {
      await deleteArtist(artist.id)
      router.push('/label/roster')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div>
      <Link
        href="/label/roster"
        className="inline-flex items-center gap-1.5 text-xs text-ta-grey hover:text-ta-white transition-colors duration-120 mb-4"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Roster
      </Link>

      <header className="flex items-start justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-ta-white">{artist.name}</h1>
          {artist.genres.length > 0 && (
            <p className="text-sm text-ta-grey mt-1">{artist.genres.join(' · ')}</p>
          )}
          {artist.bio && <p className="text-sm text-ta-grey mt-3 max-w-2xl">{artist.bio}</p>}
          {artist.spotify_url && (
            <a
              href={artist.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-ta-cyan hover:underline underline-offset-2 mt-2"
            >
              Spotify profile
            </a>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            className={`${secondaryButtonClass} flex items-center gap-1.5`}
            onClick={() => setEditOpen(true)}
          >
            <PencilSquareIcon className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            className={`${secondaryButtonClass} flex items-center gap-1.5 hover:text-ta-error`}
            onClick={() => void handleDelete()}
          >
            <TrashIcon className="h-4 w-4" />
            Remove
          </button>
        </div>
      </header>

      <h2 className="text-sm font-semibold text-ta-white mb-3">Releases</h2>
      {artistReleases.length === 0 ? (
        <EmptyState
          title="No releases yet"
          description="Create one from the Releases page."
          variant="minimal"
        />
      ) : (
        <div className="flex flex-col gap-6">
          {RELEASE_STATUSES.map((status) => {
            const group = artistReleases.filter((r) => r.status === status)
            if (group.length === 0) return null
            return (
              <section key={status}>
                <p className="text-[11px] uppercase tracking-wider text-ta-muted mb-2">
                  {RELEASE_STATUS_LABELS[status]}
                </p>
                <div className="rounded-ta border border-ta-border bg-ta-panel overflow-hidden">
                  {group.map((release) => (
                    <Link
                      key={release.id}
                      href={`/label/releases/${release.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 border-b border-ta-border last:border-b-0 hover:bg-white/[0.03] transition-colors duration-120"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-ta-white truncate">{release.title}</p>
                        <p className="text-xs text-ta-grey">
                          {RELEASE_TYPE_LABELS[release.type]}
                          {release.release_date && ` · ${release.release_date}`}
                        </p>
                      </div>
                      <ReleaseStatusBadge status={release.status} />
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <ArtistFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        labelId={activeLabel.id}
        artist={artist}
      />
    </div>
  )
}
