'use client'

/**
 * Label OS — Dashboard.
 * A calm overview: what's coming, what's slipping, how the roster stands.
 */

import Link from 'next/link'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/motion'
import {
  useLabelStore,
  selectActiveLabel,
  selectOverdueTasks,
  selectUpcomingReleases,
} from '@/stores/useLabelStore'
import { EmptyState } from '@/components/ui/EmptyState'
import { ReleaseStatusBadge } from '@/components/label/releases/ReleaseStatusBadge'

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function daysUntil(iso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((new Date(`${iso}T00:00:00`).getTime() - today.getTime()) / 86400000)
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <motion.div
      variants={staggerItem.slideUp}
      className="rounded-ta border border-ta-border bg-ta-panel p-5"
    >
      <p className="text-xs text-ta-grey mb-1">{label}</p>
      <p className="text-2xl font-semibold text-ta-white">{value}</p>
      {hint && <p className="text-xs text-ta-muted mt-1">{hint}</p>}
    </motion.div>
  )
}

export default function LabelDashboardPage() {
  const activeLabel = useLabelStore(selectActiveLabel)
  const artists = useLabelStore((s) => s.artists)
  const releases = useLabelStore((s) => s.releases)
  const tasks = useLabelStore((s) => s.tasks)
  const upcoming = useLabelStore(selectUpcomingReleases)
  const overdue = useLabelStore(selectOverdueTasks)
  const isLoading = useLabelStore((s) => s.isLoadingReleases || s.isLoadingArtists)
  const toggleTask = useLabelStore((s) => s.toggleTask)

  if (!activeLabel) return null

  const nextRelease = upcoming[0]
  const artistById = new Map(artists.map((a) => [a.id, a]))

  return (
    <motion.div variants={staggerContainer.normal} initial="initial" animate="animate">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-ta-white">{activeLabel.name}</h1>
        <p className="text-sm text-ta-grey mt-1">
          {isLoading ? 'Loading your label…' : 'Here is where your label stands today.'}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatTile
          label="Roster"
          value={String(artists.length)}
          hint={artists.length === 1 ? 'artist signed' : 'artists signed'}
        />
        <StatTile
          label="Next release"
          value={nextRelease?.release_date ? `${daysUntil(nextRelease.release_date)} days` : '—'}
          hint={nextRelease ? nextRelease.title : 'nothing scheduled yet'}
        />
        <StatTile
          label="Overdue tasks"
          value={String(overdue.length)}
          hint={overdue.length === 0 ? 'all caught up' : 'need attention'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming releases */}
        <motion.section
          variants={staggerItem.slideUp}
          className="rounded-ta border border-ta-border bg-ta-panel"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-ta-border">
            <h2 className="text-sm font-semibold text-ta-white">Upcoming releases</h2>
            <Link
              href="/label/releases"
              className="text-xs text-ta-cyan hover:underline underline-offset-2"
            >
              View all
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Nothing scheduled"
                description="Plan your next release from the Releases page."
                variant="minimal"
              />
            </div>
          ) : (
            <ul>
              {upcoming.map((release) => (
                <li key={release.id} className="border-b border-ta-border last:border-b-0">
                  <Link
                    href={`/label/releases/${release.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors duration-120"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-ta-white truncate">{release.title}</p>
                      <p className="text-xs text-ta-grey truncate">
                        {artistById.get(release.artist_id)?.name ?? 'Unknown artist'}
                        {release.release_date && ` · ${formatDate(release.release_date)}`}
                      </p>
                    </div>
                    <ReleaseStatusBadge status={release.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        {/* Overdue tasks */}
        <motion.section
          variants={staggerItem.slideUp}
          className="rounded-ta border border-ta-border bg-ta-panel"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-ta-border">
            <h2 className="text-sm font-semibold text-ta-white">Overdue tasks</h2>
            <span className="text-xs text-ta-muted">
              {tasks.filter((t) => !t.completed).length} open in total
            </span>
          </div>
          {overdue.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="All caught up"
                description="No tasks past their due date."
                variant="minimal"
              />
            </div>
          ) : (
            <ul>
              {overdue.slice(0, 8).map((task) => {
                const release = releases.find((r) => r.id === task.release_id)
                return (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 px-5 py-3 border-b border-ta-border last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => void toggleTask(task.id, e.target.checked)}
                      className="h-4 w-4 rounded accent-[#3AA9BE] cursor-pointer"
                      aria-label={`Mark "${task.title}" complete`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ta-white truncate">{task.title}</p>
                      <p className="text-xs text-ta-grey truncate">
                        {release?.title ?? 'Release'}
                        {task.due_date && ` · due ${formatDate(task.due_date)}`}
                      </p>
                    </div>
                    <span className="text-[11px] text-ta-error shrink-0">overdue</span>
                  </li>
                )
              })}
            </ul>
          )}
        </motion.section>
      </div>
    </motion.div>
  )
}
