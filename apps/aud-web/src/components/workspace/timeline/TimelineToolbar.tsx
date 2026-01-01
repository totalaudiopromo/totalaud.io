/**
 * Timeline Toolbar Component
 * 2025 Brand Pivot - Cinematic Editorial
 *
 * Controls for the Timeline view with Add Event and Export
 * Uses TAP design system tokens for consistent styling
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimelineStore, type ViewScale } from '@/stores/useTimelineStore'
import { LANES, getLaneColour, type LaneType } from '@/types/timeline'
import {
  PlusIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline'
import { TemplateSelector } from './TemplateSelector'

export function TimelineToolbar() {
  const events = useTimelineStore((state) => state.events)
  const addEvent = useTimelineStore((state) => state.addEvent)
  const viewScale = useTimelineStore((state) => state.viewScale)
  const setViewScale = useTimelineStore((state) => state.setViewScale)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

  const exportRef = useRef<HTMLDivElement>(null)

  // Add event form state
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().slice(0, 10))
  const [newEventLane, setNewEventLane] = useState<LaneType>('post-release')
  const [newEventDescription, setNewEventDescription] = useState('')

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    setNewEventLane('post-release')
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
      <div className="px-5 py-3 border-b border-white/5 bg-ta-black/95 backdrop-blur-ta sticky top-0 z-20">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Title and event count */}
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-ta-white">Release Timeline</h2>
            <span className="text-xs px-2 py-1 bg-ta-cyan/10 border border-ta-cyan/20 rounded-ta-sm text-ta-cyan">
              {events.length} events
            </span>
          </div>

          {/* Right: View controls */}
          <div className="flex items-center gap-2">
            {/* View scale toggle */}
            <div className="flex bg-white/5 rounded-ta-sm p-0.5">
              {(['weeks', 'months', 'quarters'] as ViewScale[]).map((scale) => (
                <button
                  key={scale}
                  onClick={() => setViewScale(scale)}
                  className={`px-2.5 py-1.5 text-[11px] rounded-ta-sm capitalize transition-all duration-120 ${
                    viewScale === scale
                      ? 'font-medium text-ta-cyan bg-ta-cyan/15'
                      : 'font-normal text-ta-grey/60 hover:text-ta-grey'
                  }`}
                >
                  {scale}
                </button>
              ))}
            </div>

            {/* Export dropdown */}
            <div ref={exportRef} className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-3 py-2 text-[13px] text-ta-grey hover:text-ta-white bg-transparent border border-white/10 hover:border-white/20 rounded-ta-sm transition-all duration-120"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                Export
                <ChevronDownIcon className="h-3 w-3" />
              </button>

              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-44 bg-ta-panel/98 border border-white/10 rounded-ta shadow-ta-lg overflow-hidden z-50"
                  >
                    {[
                      { label: 'Export as JSON', action: handleExportJSON },
                      { label: 'Export as Markdown', action: handleExportMarkdown },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="block w-full px-3 py-2.5 text-[13px] text-ta-white/70 text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors duration-120"
                      >
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Templates button */}
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-ta-grey hover:text-ta-white bg-transparent border border-white/10 hover:border-white/20 rounded-ta-sm transition-all duration-120"
            >
              <RectangleStackIcon className="h-4 w-4" />
              Templates
            </button>

            {/* Add event button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium bg-ta-cyan text-ta-black rounded-ta-sm hover:opacity-90 transition-all duration-120"
            >
              <PlusIcon className="h-4 w-4" />
              Add
            </button>
          </div>
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
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 bg-ta-panel border border-white/10 rounded-ta shadow-ta-lg"
            >
              <h3 className="text-base font-semibold text-ta-white mb-5">Add Event</h3>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-[11px] font-medium text-ta-grey/60 mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Event title..."
                  autoFocus
                  className="w-full px-3 py-2.5 text-sm text-ta-white bg-white/5 border border-white/10 rounded-ta-sm outline-none focus:border-ta-cyan/50 focus:ring-1 focus:ring-ta-cyan/20 transition-all duration-180"
                />
              </div>

              {/* Date & Lane row */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-ta-grey/60 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm text-ta-white bg-white/5 border border-white/10 rounded-ta-sm outline-none focus:border-ta-cyan/50 focus:ring-1 focus:ring-ta-cyan/20 transition-all duration-180 [color-scheme:dark]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-ta-grey/60 mb-1.5">
                    Lane
                  </label>
                  <select
                    value={newEventLane}
                    onChange={(e) => setNewEventLane(e.target.value as LaneType)}
                    className="w-full px-3 py-2.5 text-sm text-ta-white bg-white/5 border border-white/10 rounded-ta-sm outline-none focus:border-ta-cyan/50 cursor-pointer"
                  >
                    {LANES.map((lane) => (
                      <option key={lane.id} value={lane.id} className="bg-ta-panel">
                        {lane.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className="block text-[11px] font-medium text-ta-grey/60 mb-1.5">
                  Description (optional)
                </label>
                <textarea
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  placeholder="Add notes..."
                  rows={2}
                  className="w-full px-3 py-2.5 text-[13px] text-ta-white/80 bg-white/5 border border-white/10 rounded-ta-sm outline-none focus:border-ta-cyan/50 focus:ring-1 focus:ring-ta-cyan/20 transition-all duration-180 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[13px] font-medium text-ta-grey/70 bg-transparent border border-white/10 rounded-ta-sm hover:border-white/20 transition-all duration-120"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  disabled={!newEventTitle.trim()}
                  className={`px-4 py-2 text-[13px] font-medium rounded-ta-sm transition-all duration-120 ${
                    newEventTitle.trim()
                      ? 'bg-ta-cyan text-ta-black hover:opacity-90'
                      : 'bg-white/5 text-ta-grey/30 cursor-not-allowed'
                  }`}
                >
                  Add Event
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
      />
    </>
  )
}
