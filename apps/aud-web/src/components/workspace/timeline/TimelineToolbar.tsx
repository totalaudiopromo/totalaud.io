/**
 * Timeline Toolbar Component
 * 2025 Brand Pivot - Cinematic Editorial
 *
 * Controls for the Timeline view with Add Event and Export
 */

'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { LANES, getLaneColour, type LaneType } from '@/types/timeline'

type ViewMode = 'weeks' | 'months' | 'quarters'

export function TimelineToolbar() {
  const events = useTimelineStore((state) => state.events)
  const addEvent = useTimelineStore((state) => state.addEvent)
  const [viewMode, setViewMode] = useState<ViewMode>('weeks')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Add event form state
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().slice(0, 10))
  const [newEventLane, setNewEventLane] = useState<LaneType>('promo')
  const [newEventDescription, setNewEventDescription] = useState('')

  const handleAddEvent = useCallback(() => {
    if (!newEventTitle.trim()) return

    addEvent({
      title: newEventTitle.trim(),
      date: new Date(newEventDate).toISOString(),
      lane: newEventLane,
      colour: getLaneColour(newEventLane),
      description: newEventDescription.trim() || undefined,
      source: 'manual',
    })

    // Reset form
    setNewEventTitle('')
    setNewEventDate(new Date().toISOString().slice(0, 10))
    setNewEventLane('promo')
    setNewEventDescription('')
    setShowAddModal(false)
  }, [newEventTitle, newEventDate, newEventLane, newEventDescription, addEvent])

  const handleExportJSON = useCallback(() => {
    const data = JSON.stringify(events, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timeline-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }, [events])

  const handleExportMarkdown = useCallback(() => {
    // Group events by lane
    const byLane = LANES.map((lane) => ({
      lane,
      events: events
        .filter((e) => e.lane === lane.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    }))

    let md = `# Release Timeline\n\nExported: ${new Date().toLocaleDateString('en-GB', { dateStyle: 'full' })}\n\n`

    for (const { lane, events: laneEvents } of byLane) {
      if (laneEvents.length === 0) continue
      md += `## ${lane.label}\n\n`
      for (const event of laneEvents) {
        const date = new Date(event.date).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
        md += `- **${event.title}** (${date})`
        if (event.description) md += `\n  ${event.description}`
        if (event.url) md += `\n  Link: ${event.url}`
        md += '\n'
      }
      md += '\n'
    }

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timeline-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }, [events])

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: 'rgba(15, 17, 19, 0.95)',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Left: Title and event count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            Release Timeline
          </h2>
          <span
            style={{
              fontSize: 11,
              padding: '4px 8px',
              backgroundColor: 'rgba(58, 169, 190, 0.1)',
              border: '1px solid rgba(58, 169, 190, 0.2)',
              borderRadius: 4,
              color: '#3AA9BE',
            }}
          >
            {events.length} events
          </span>
        </div>

        {/* Right: View controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* View mode toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 6,
              padding: 2,
            }}
          >
            {(['weeks', 'months', 'quarters'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '6px 10px',
                  fontSize: 11,
                  fontWeight: viewMode === mode ? 500 : 400,
                  color: viewMode === mode ? '#3AA9BE' : 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: viewMode === mode ? 'rgba(58, 169, 190, 0.15)' : 'transparent',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  textTransform: 'capitalize',
                  fontFamily: 'inherit',
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Export dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.6)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Export
              <span style={{ fontSize: 9 }}>▼</span>
            </button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 4,
                    backgroundColor: '#1A1D21',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 6,
                    padding: 4,
                    minWidth: 120,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    zIndex: 50,
                  }}
                >
                  <button
                    onClick={handleExportJSON}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 12,
                      color: 'rgba(255, 255, 255, 0.8)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Export as JSON
                  </button>
                  <button
                    onClick={handleExportMarkdown}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 12,
                      color: 'rgba(255, 255, 255, 0.8)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Export as Markdown
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Add event button */}
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              color: '#0F1113',
              backgroundColor: '#3AA9BE',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'opacity 0.12s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            <span style={{ fontSize: 13 }}>+</span>
            Add
          </button>
        </div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
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
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#1A1D21',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                width: '100%',
                maxWidth: 400,
                padding: 24,
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  marginBottom: 20,
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                Add Event
              </h3>

              {/* Title */}
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
                  Title *
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Event title..."
                  autoFocus
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

              {/* Date & Lane row */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
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
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
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
                <div style={{ flex: 1 }}>
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
                    value={newEventLane}
                    onChange={(e) => setNewEventLane(e.target.value as LaneType)}
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
                    {LANES.map((lane) => (
                      <option key={lane.id} value={lane.id} style={{ backgroundColor: '#1A1D21' }}>
                        {lane.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
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
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  placeholder="Add notes..."
                  rows={2}
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
                    resize: 'none',
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  disabled={!newEventTitle.trim()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: newEventTitle.trim() ? '#3AA9BE' : 'rgba(58, 169, 190, 0.3)',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: newEventTitle.trim() ? 'white' : 'rgba(255, 255, 255, 0.5)',
                    cursor: newEventTitle.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                  }}
                >
                  Add Event
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
