'use client'

/**
 * Label OS — Releases list with status filters.
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/20/solid'
import { useLabelStore, selectActiveLabel } from '@/stores/useLabelStore'
import { EmptyState } from '@/components/ui/EmptyState'
import { ReleaseStatusBadge } from '@/components/label/releases/ReleaseStatusBadge'
import { CreateReleaseModal } from '@/components/label/releases/CreateReleaseModal'
import { primaryButtonClass } from '@/components/label/ui/LabelModal'
import {
  RELEASE_STATUSES,
  RELEASE_STATUS_LABELS,
  RELEASE_TYPE_LABELS,
  type ReleaseStatus,
} from '@/lib/label/types'

type Filter = 'all' | ReleaseStatus

export default function ReleasesPage() {
  const activeLabel = useLabelStore(selectActiveLabel)
  const releases = useLabelStore((s) => s.releases)
  const artists = useLabelStore((s) => s.artists)
  const isLoading = useLabelStore((s) => s.isLoadingReleases)
  const [filter, setFilter] = useState<Filter>('all')
  const [createOpen, setCreateOpen] = useState(false)

  const artistById = useMemo(() => new Map(artists.map((a) => [a.id, a])), [artists])
  const filtered = useMemo(
    () => (filter === 'all' ? releases : releases.filter((r) => r.status === filter)),
    [releases, filter]
  )

  if (!activeLabel) return null

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ta-white">Releases</h1>
          <p className="text-sm text-ta-grey mt-1">
            Every release across the label, from idea to out in the world.
          </p>
        </div>
        <button
          type="button"
          className={`${primaryButtonClass} flex items-center gap-1.5`}
          onClick={() => setCreateOpen(true)}
        >
          <PlusIcon className="h-4 w-4" />
          New release
        </button>
      </header>

      <div className="flex flex-wrap gap-2 mb-5">
        {(['all', ...RELEASE_STATUSES] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-ta-pill text-xs transition-colors duration-120 ${
              filter === f
                ? 'bg-ta-cyan/15 text-ta-cyan'
                : 'text-ta-grey hover:text-ta-white hover:bg-white/[0.05]'
            }`}
          >
            {f === 'all' ? 'All' : RELEASE_STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {isLoading && releases.length === 0 ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/[0.03] rounded-ta animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            filter === 'all'
              ? 'No releases yet'
              : `Nothing ${RELEASE_STATUS_LABELS[filter as ReleaseStatus].toLowerCase()}`
          }
          description="Create a release to start planning."
          variant="large"
        />
      ) : (
        <div className="rounded-ta border border-ta-border bg-ta-panel overflow-hidden">
          {filtered.map((release) => (
            <Link
              key={release.id}
              href={`/label/releases/${release.id}`}
              className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-ta-border last:border-b-0 hover:bg-white/[0.03] transition-colors duration-120"
            >
              <div className="min-w-0">
                <p className="text-sm text-ta-white truncate">{release.title}</p>
                <p className="text-xs text-ta-grey truncate">
                  {artistById.get(release.artist_id)?.name ?? 'Unknown artist'} ·{' '}
                  {RELEASE_TYPE_LABELS[release.type]}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {release.release_date && (
                  <span className="text-xs text-ta-grey hidden sm:block">
                    {new Date(`${release.release_date}T00:00:00`).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
                <ReleaseStatusBadge status={release.status} />
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateReleaseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        labelId={activeLabel.id}
      />
    </div>
  )
}
