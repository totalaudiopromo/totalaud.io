/**
 * Timeline Event Card Component
 *
 * An editable timeline event card with inline title/date editing,
 * delete confirmation, click-to-expand functionality,
 * and optional TAP Tracker sync.
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { usePitchStore, type PitchType } from '@/stores/usePitchStore'
import { useScoutStore } from '@/stores/useScoutStore'
import { LANES, type LaneType, type TimelineEvent, type TrackerSyncStatus } from '@/types/timeline'
import { useAuthGate } from '@/components/auth'

interface TimelineEventCardProps {
  event: TimelineEvent
  onClose: () => void
}

export function TimelineEventCard({ event, onClose }: TimelineEventCardProps) {
  const router = useRouter()
  const { canAccess: isAuthenticated, requireAuth } = useAuthGate()

  const updateEvent = useTimelineStore((state) => state.updateEvent)
  const deleteEvent = useTimelineStore((state) => state.deleteEvent)
  const syncToTracker = useTimelineStore((state) => state.syncToTracker)
  const trackerSyncStatusById = useTimelineStore((state) => state.trackerSyncStatusById)
  const trackerSyncErrorById = useTimelineStore((state) => state.trackerSyncErrorById)

  // Pitch store for cross-mode connection
  const selectPitchType = usePitchStore((state) => state.selectType)
  const updatePitchSection = usePitchStore((state) => state.updateSection)

  // Scout store for marking opportunity as pitched
  const markAsPitched = useScoutStore((state) => state.markAsPitched)

  const [title, setTitle] = useState(event.title)
  const [description, setDescription] = useState(event.description ?? '')
  const [date, setDate] = useState(event.date.slice(0, 10)) // YYYY-MM-DD format
  const [lane, setLane] = useState<LaneType>(event.lane)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)

  // TAP Tracker sync state
  const isSynced = !!event.trackerCampaignId
  const syncStatus: TrackerSyncStatus = isSynced
    ? 'synced'
    : trackerSyncStatusById[event.id] || 'idle'
  const syncError = trackerSyncErrorById[event.id]
  const canSync = event.source !== 'sample' && !isSynced && syncStatus !== 'syncing'

  const handleSyncToTracker = useCallback(() => {
    if (!canSync) return

    // Gate behind auth
    if (!requireAuth(() => setShowAuthPrompt(true))) {
      setTimeout(() => {
        setShowAuthPrompt(false)
        router.push('/signup?feature=tracker-sync')
      }, 1500)
      return
    }

    syncToTracker(event.id)
  }, [canSync, syncToTracker, event.id, requireAuth, router])

  // Handler to create a pitch from this timeline event
  const handleCreatePitch = useCallback(() => {
    // Determine pitch type based on lane/tags
    let pitchType: PitchType = 'custom'
    const tagsLower = event.tags?.map((t) => t.toLowerCase()) || []
    const titleLower = event.title.toLowerCase()

    if (tagsLower.includes('radio') || titleLower.includes('radio') || event.lane === 'promo') {
      pitchType = 'radio'
    } else if (
      tagsLower.includes('press') ||
      titleLower.includes('press') ||
      tagsLower.includes('blog')
    ) {
      pitchType = 'press'
    } else if (tagsLower.includes('playlist') || titleLower.includes('playlist')) {
      pitchType = 'playlist'
    }

    // Set up pitch with type and pre-fill context
    selectPitchType(pitchType)

    // Pre-fill the hook section with event context
    const hookContent = event.title.replace(/^Pitch:\s*/i, '').trim()
    if (hookContent) {
      updatePitchSection('hook', hookContent)
    }

    // Pre-fill story with description if available
    if (event.description) {
      updatePitchSection('story', event.description)
    }

    // Mark the source opportunity as pitched (if this event came from Scout)
    if (event.opportunityId) {
      markAsPitched(event.opportunityId)
    }

    // Close the modal and navigate to workspace with pitch mode
    onClose()
    router.push('/workspace?mode=pitch')
  }, [event, selectPitchType, updatePitchSection, markAsPitched, onClose, router])

  // Focus title on mount
  useEffect(() => {
    titleRef.current?.select()
  }, [])

  // Track changes
  useEffect(() => {
    const originalTitle = event.title
    const originalDesc = event.description ?? ''
    const originalDate = event.date.slice(0, 10)
    const originalLane = event.lane

    const changed =
      title !== originalTitle ||
      description !== originalDesc ||
      date !== originalDate ||
      lane !== originalLane

    setHasChanges(changed)
  }, [title, description, date, lane, event])

  // Save changes
  const handleSave = useCallback(() => {
    if (!title.trim()) return

    const laneColour = LANES.find((l) => l.id === lane)?.colour ?? event.colour

    updateEvent(event.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      date: new Date(date).toISOString(),
      lane,
      colour: laneColour,
    })

    onClose()
  }, [title, description, date, lane, event, updateEvent, onClose])

  // Delete event
  const handleDelete = useCallback(() => {
    deleteEvent(event.id)
    onClose()
  }, [event.id, deleteEvent, onClose])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSave()
      }
    },
    [onClose, handleSave]
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="bg-[#1A1D21] border border-white/10 rounded-xl w-full max-w-md p-6 shadow-2xl relative"
      >
        {/* Header with lane colour indicator */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: LANES.find((l) => l.id === lane)?.colour ?? '#6B7280',
              boxShadow: `0 0 12px ${LANES.find((l) => l.id === lane)?.colour ?? '#6B7280'}40`,
            }}
          />
          <span className="text-[11px] font-medium text-tap-grey/60 uppercase tracking-wider">
            Edit Event
          </span>
        </div>

        {/* Title input */}
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-tap-grey mb-1.5">Title</label>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title..."
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-tap-white placeholder-tap-grey/30 focus:outline-none focus:border-tap-cyan/50 focus:bg-white/10 transition-colors"
          />
        </div>

        {/* Date input */}
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-tap-grey mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-tap-white focus:outline-none focus:border-tap-cyan/50 focus:bg-white/10 transition-colors [color-scheme:dark]"
          />
        </div>

        {/* Lane select */}
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-tap-grey mb-1.5">Lane</label>
          <div className="relative">
            <select
              value={lane}
              onChange={(e) => setLane(e.target.value as LaneType)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-tap-white focus:outline-none focus:border-tap-cyan/50 focus:bg-white/10 transition-colors appearance-none cursor-pointer"
            >
              {LANES.map((l) => (
                <option key={l.id} value={l.id} className="bg-[#1A1D21]">
                  {l.label}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow if needed, but standard one is usually fine in dark mode on Mac */}
          </div>
        </div>

        {/* Description textarea */}
        <div className="mb-5">
          <label className="block text-[11px] font-medium text-tap-grey mb-1.5">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes..."
            rows={3}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-tap-white placeholder-tap-grey/30 focus:outline-none focus:border-tap-cyan/50 focus:bg-white/10 transition-colors resize-none min-h-[80px]"
          />
        </div>

        {/* URL display (if present) */}
        {event.url && (
          <div className="mb-5">
            <label className="block text-[11px] font-medium text-tap-grey mb-1.5">Link</label>
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-tap-cyan truncate hover:underline"
            >
              {event.url}
            </a>
          </div>
        )}

        {/* Tags display (if present) */}
        {event.tags && event.tags.length > 0 && (
          <div className="mb-5">
            <label className="block text-[11px] font-medium text-tap-grey mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-[11px] bg-tap-cyan/15 rounded text-tap-grey/80 border border-tap-cyan/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* TAP Tracker sync section */}
        {event.source !== 'sample' && (
          <div
            className={`mb-5 p-3 rounded-lg border flex items-center justify-between gap-3
              ${
                isSynced
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-tap-cyan/5 border-tap-cyan/15'
              }
            `}
          >
            <div>
              <div
                className={`text-[11px] font-semibold uppercase tracking-wider mb-0.5
                  ${isSynced ? 'text-emerald-500' : 'text-tap-grey'}
                `}
              >
                {isSynced ? '✓ Logged to TAP Tracker' : 'TAP Tracker'}
              </div>
              {isSynced && event.trackerSyncedAt && (
                <div className="text-[11px] text-tap-grey/50">
                  Synced {new Date(event.trackerSyncedAt).toLocaleDateString('en-GB')}
                </div>
              )}
              {syncError && <div className="text-[11px] text-red-400 mt-0.5">{syncError}</div>}
            </div>

            {!isSynced && (
              <button
                onClick={handleSyncToTracker}
                disabled={!canSync && syncStatus !== 'idle'}
                title={
                  !isAuthenticated
                    ? 'Sign up to sync events to TAP Tracker'
                    : 'Sync this event to TAP Tracker'
                }
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all
                  ${
                    showAuthPrompt
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-500'
                      : syncStatus === 'syncing'
                        ? 'bg-transparent text-tap-cyan/60 border-tap-cyan/30'
                        : 'bg-transparent text-tap-cyan border-tap-cyan/30 hover:bg-tap-cyan/10'
                  }
                  ${!canSync && syncStatus !== 'idle' ? 'cursor-wait' : 'cursor-pointer'}
                `}
              >
                {showAuthPrompt ? (
                  'Sign up to unlock'
                ) : syncStatus === 'syncing' ? (
                  <>
                    <span className="w-3 h-3 border-2 border-tap-cyan/30 border-t-tap-cyan rounded-full animate-spin" />
                    Syncing...
                  </>
                ) : syncStatus === 'error' ? (
                  'Retry'
                ) : (
                  'Log to TAP'
                )}
              </button>
            )}
          </div>
        )}

        {/* Cross-mode: Create Pitch button */}
        {event.source !== 'sample' && (
          <div className="mb-4">
            <button
              onClick={handleCreatePitch}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium text-purple-400 bg-purple-500/10 border border-purple-500/25 rounded-lg hover:bg-purple-500/15 hover:text-purple-300 transition-all"
            >
              <span>✍️</span>
              Create Pitch from Event
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          {/* Delete button */}
          <AnimatePresence mode="wait">
            {showDeleteConfirm ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-xs text-tap-grey/60">Delete?</span>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-transparent border border-white/20 text-tap-grey text-xs font-medium rounded hover:text-white transition-colors"
                >
                  No
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="delete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 bg-transparent border border-red-500/30 text-red-400 text-xs font-medium rounded hover:bg-red-500/10 transition-colors"
              >
                Delete
              </motion.button>
            )}
          </AnimatePresence>

          {/* Save/Cancel */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-transparent border border-white/10 text-tap-grey text-xs font-medium rounded-lg hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className={`
                px-4 py-2 border-none rounded-lg text-xs font-medium transition-all
                ${
                  hasChanges
                    ? 'bg-tap-cyan text-tap-black hover:bg-tap-cyan/90 cursor-pointer'
                    : 'bg-tap-cyan/20 text-white/50 cursor-not-allowed'
                }
              `}
            >
              Save
            </button>
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="mt-3 text-center text-[10px] text-tap-grey/30">
          ⌘Enter to save • Esc to cancel
        </div>
      </motion.div>
    </motion.div>
  )
}
