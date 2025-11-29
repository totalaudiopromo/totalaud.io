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
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 100,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{
          backgroundColor: '#1A1D21',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          width: '100%',
          maxWidth: 420,
          padding: 24,
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Header with lane colour indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: LANES.find((l) => l.id === lane)?.colour ?? '#6B7280',
              boxShadow: `0 0 12px ${LANES.find((l) => l.id === lane)?.colour ?? '#6B7280'}40`,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Edit Event
          </span>
        </div>

        {/* Title input */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: 6,
            }}
          >
            Title
          </label>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title..."
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.9)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Date input */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: 6,
            }}
          >
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.9)',
              outline: 'none',
              fontFamily: 'inherit',
              colorScheme: 'dark',
            }}
          />
        </div>

        {/* Lane select */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: 6,
            }}
          >
            Lane
          </label>
          <select
            value={lane}
            onChange={(e) => setLane(e.target.value as LaneType)}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.9)',
              outline: 'none',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            {LANES.map((l) => (
              <option key={l.id} value={l.id} style={{ backgroundColor: '#1A1D21' }}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description textarea */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: 6,
            }}
          >
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.8)',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: 60,
            }}
          />
        </div>

        {/* URL display (if present) */}
        {event.url && (
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: 6,
              }}
            >
              Link
            </label>
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                fontSize: 12,
                color: '#3AA9BE',
                textDecoration: 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {event.url}
            </a>
          </div>
        )}

        {/* Tags display (if present) */}
        {event.tags && event.tags.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: 6,
              }}
            >
              Tags
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11,
                    padding: '4px 8px',
                    backgroundColor: 'rgba(58, 169, 190, 0.15)',
                    borderRadius: 4,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
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
            style={{
              marginBottom: 20,
              padding: 12,
              backgroundColor: isSynced ? 'rgba(73, 163, 108, 0.1)' : 'rgba(58, 169, 190, 0.05)',
              border: isSynced
                ? '1px solid rgba(73, 163, 108, 0.2)'
                : '1px solid rgba(58, 169, 190, 0.15)',
              borderRadius: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: isSynced ? '#49A36C' : 'rgba(255, 255, 255, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 4,
                  }}
                >
                  {isSynced ? '✓ Logged to TAP Tracker' : 'TAP Tracker'}
                </div>
                {isSynced && event.trackerSyncedAt && (
                  <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.4)' }}>
                    Synced {new Date(event.trackerSyncedAt).toLocaleDateString('en-GB')}
                  </div>
                )}
                {syncError && (
                  <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{syncError}</div>
                )}
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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    fontSize: 12,
                    fontWeight: 500,
                    color: showAuthPrompt
                      ? '#F97316'
                      : syncStatus === 'syncing'
                        ? 'rgba(58, 169, 190, 0.6)'
                        : '#3AA9BE',
                    backgroundColor: showAuthPrompt ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                    border: `1px solid ${showAuthPrompt ? 'rgba(249, 115, 22, 0.3)' : 'rgba(58, 169, 190, 0.3)'}`,
                    borderRadius: 6,
                    cursor: canSync || !isAuthenticated ? 'pointer' : 'wait',
                    transition: 'all 0.15s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  {showAuthPrompt ? (
                    'Sign up to unlock'
                  ) : syncStatus === 'syncing' ? (
                    <>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          border: '2px solid rgba(58, 169, 190, 0.3)',
                          borderTopColor: '#3AA9BE',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }}
                      />
                      Syncing...
                    </>
                  ) : syncStatus === 'error' ? (
                    'Retry'
                  ) : !isAuthenticated ? (
                    '🔒 Log to TAP'
                  ) : (
                    'Log to TAP'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: 16,
          }}
        >
          {/* Delete button */}
          <AnimatePresence mode="wait">
            {showDeleteConfirm ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', gap: 8, alignItems: 'center' }}
              >
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.5)' }}>Delete?</span>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#EF4444',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                  }}
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
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#EF4444',
                  cursor: 'pointer',
                }}
              >
                Delete
              </motion.button>
            )}
          </AnimatePresence>

          {/* Save/Cancel */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: hasChanges ? '#3AA9BE' : 'rgba(58, 169, 190, 0.3)',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                color: hasChanges ? 'white' : 'rgba(255, 255, 255, 0.5)',
                cursor: title.trim() ? 'pointer' : 'not-allowed',
                opacity: title.trim() ? 1 : 0.5,
              }}
            >
              Save
            </button>
          </div>
        </div>

        {/* Keyboard hint */}
        <div
          style={{
            marginTop: 12,
            textAlign: 'center',
            fontSize: 10,
            color: 'rgba(255, 255, 255, 0.3)',
          }}
        >
          ⌘Enter to save • Esc to cancel
        </div>
      </motion.div>
    </motion.div>
  )
}
