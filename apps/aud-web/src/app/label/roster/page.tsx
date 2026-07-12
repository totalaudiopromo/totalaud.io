'use client'

/**
 * Label OS — Roster.
 */

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PlusIcon } from '@heroicons/react/20/solid'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { useLabelStore, selectActiveLabel } from '@/stores/useLabelStore'
import { EmptyState } from '@/components/ui/EmptyState'
import { ArtistFormModal } from '@/components/label/roster/ArtistFormModal'
import { primaryButtonClass } from '@/components/label/ui/LabelModal'
import type { ArtistRow } from '@/lib/label/types'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function RosterPage() {
  const activeLabel = useLabelStore(selectActiveLabel)
  const artists = useLabelStore((s) => s.artists)
  const releases = useLabelStore((s) => s.releases)
  const isLoading = useLabelStore((s) => s.isLoadingArtists)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ArtistRow | null>(null)

  if (!activeLabel) return null

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ta-white">Roster</h1>
          <p className="text-sm text-ta-grey mt-1">
            {artists.length === 0
              ? 'The artists you work with, in one place.'
              : `${artists.length} ${artists.length === 1 ? 'artist' : 'artists'} on ${activeLabel.name}.`}
          </p>
        </div>
        <button
          type="button"
          className={`${primaryButtonClass} flex items-center gap-1.5`}
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          <PlusIcon className="h-4 w-4" />
          Add artist
        </button>
      </header>

      {isLoading && artists.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-white/[0.03] rounded-ta animate-pulse" />
          ))}
        </div>
      ) : artists.length === 0 ? (
        <EmptyState
          title="No artists yet"
          description="Add your first artist to start building the roster."
          variant="large"
        />
      ) : (
        <motion.div
          variants={staggerContainer.normal}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {artists.map((artist) => {
            const artistReleases = releases.filter((r) => r.artist_id === artist.id)
            return (
              <motion.div key={artist.id} variants={staggerItem.slideUp}>
                <Link
                  href={`/label/roster/${artist.id}`}
                  className="block rounded-ta border border-ta-border bg-ta-panel p-5 hover:border-ta-border-light hover:shadow-ta-glow transition-all duration-180"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-11 w-11 rounded-full bg-ta-cyan/15 text-ta-cyan flex items-center justify-center text-sm font-semibold shrink-0">
                      {initials(artist.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ta-white truncate">{artist.name}</p>
                      <p className="text-xs text-ta-grey">
                        {artistReleases.length}{' '}
                        {artistReleases.length === 1 ? 'release' : 'releases'}
                      </p>
                    </div>
                  </div>
                  {artist.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {artist.genres.slice(0, 4).map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-0.5 rounded-ta-pill bg-white/[0.05] text-[11px] text-ta-grey"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <ArtistFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        labelId={activeLabel.id}
        artist={editing}
      />
    </div>
  )
}
