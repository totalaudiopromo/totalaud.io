'use client'

/**
 * Label OS — Release detail: metadata, tracklist and task checklist.
 */

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/20/solid'
import { useLabelStore, selectActiveLabel, selectReleaseById } from '@/stores/useLabelStore'
import { EmptyState } from '@/components/ui/EmptyState'
import { ReleaseStatusBadge } from '@/components/label/releases/ReleaseStatusBadge'
import { TracksPanel } from '@/components/label/releases/TracksPanel'
import { TasksChecklist } from '@/components/label/releases/TasksChecklist'
import { fieldInputClass, secondaryButtonClass } from '@/components/label/ui/LabelModal'
import {
  RELEASE_STATUSES,
  RELEASE_STATUS_LABELS,
  RELEASE_TYPE_LABELS,
  type ReleaseStatus,
} from '@/lib/label/types'

export default function ReleaseDetailPage({ params }: { params: Promise<{ releaseId: string }> }) {
  const { releaseId } = use(params)
  const router = useRouter()
  const activeLabel = useLabelStore(selectActiveLabel)
  const release = useLabelStore(selectReleaseById(releaseId))
  const artists = useLabelStore((s) => s.artists)
  const isLoading = useLabelStore((s) => s.isLoadingReleases)
  const loadTracks = useLabelStore((s) => s.loadTracks)
  const updateRelease = useLabelStore((s) => s.updateRelease)
  const deleteRelease = useLabelStore((s) => s.deleteRelease)
  const [notes, setNotes] = useState<string | null>(null)

  useEffect(() => {
    void loadTracks(releaseId)
  }, [releaseId, loadTracks])

  if (!activeLabel) return null

  if (!release) {
    if (isLoading) return <div className="h-40 bg-white/[0.03] rounded-ta animate-pulse" />
    return (
      <EmptyState
        title="Release not found"
        description="It may have been deleted."
        action={
          <Link href="/label/releases" className={secondaryButtonClass}>
            Back to releases
          </Link>
        }
      />
    )
  }

  const artist = artists.find((a) => a.id === release.artist_id)

  async function handleDelete() {
    if (!release) return
    if (!window.confirm(`Delete "${release.title}"? Tracks and tasks go with it.`)) return
    await deleteRelease(release.id)
    router.push('/label/releases')
  }

  return (
    <div>
      <Link
        href="/label/releases"
        className="inline-flex items-center gap-1.5 text-xs text-ta-grey hover:text-ta-white transition-colors duration-120 mb-4"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Releases
      </Link>

      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-ta-white">{release.title}</h1>
            <p className="text-sm text-ta-grey mt-1">
              {artist ? (
                <Link
                  href={`/label/roster/${artist.id}`}
                  className="hover:text-ta-cyan transition-colors duration-120"
                >
                  {artist.name}
                </Link>
              ) : (
                'Unknown artist'
              )}{' '}
              · {RELEASE_TYPE_LABELS[release.type]}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleDelete()}
            className={`${secondaryButtonClass} flex items-center gap-1.5 hover:text-ta-error shrink-0`}
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <ReleaseStatusBadge status={release.status} />
          <select
            value={release.status}
            onChange={(e) =>
              void updateRelease(release.id, { status: e.target.value as ReleaseStatus })
            }
            className="bg-transparent text-xs text-ta-grey border border-ta-border rounded-ta-sm px-2 py-1 cursor-pointer focus:outline-none focus:border-ta-cyan"
            aria-label="Change status"
          >
            {RELEASE_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-ta-panel text-ta-white">
                {RELEASE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs text-ta-grey">
            Release date
            <input
              type="date"
              value={release.release_date ?? ''}
              onChange={(e) =>
                void updateRelease(release.id, { release_date: e.target.value || null })
              }
              className="bg-transparent border border-ta-border rounded-ta-sm px-2 py-1 text-xs text-ta-white focus:outline-none focus:border-ta-cyan"
            />
          </label>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TracksPanel labelId={activeLabel.id} releaseId={release.id} />
        <TasksChecklist labelId={activeLabel.id} releaseId={release.id} />
      </div>

      <section className="rounded-ta border border-ta-border bg-ta-panel">
        <div className="px-5 py-3 border-b border-ta-border">
          <h2 className="text-sm font-semibold text-ta-white">Notes</h2>
        </div>
        <div className="p-5">
          <textarea
            className={fieldInputClass}
            rows={4}
            placeholder="Anything worth remembering about this release…"
            value={notes ?? release.notes ?? ''}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => {
              if (notes !== null && notes !== (release.notes ?? '')) {
                void updateRelease(release.id, { notes: notes || null })
              }
            }}
            maxLength={5000}
          />
        </div>
      </section>
    </div>
  )
}
