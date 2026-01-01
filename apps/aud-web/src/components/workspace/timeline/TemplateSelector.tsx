/**
 * Template Selector Modal
 * totalaud.io - December 2025
 *
 * A modal for selecting release templates and setting a release date.
 * Provides visual preview of each template's task distribution.
 */

'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Check, ChevronRight } from 'lucide-react'
import {
  RELEASE_TEMPLATES,
  type ReleaseTemplate,
  calculateTaskDate,
  getTemplateLaneColour,
} from '@/lib/timeline/templates'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { generateEventId, LANES } from '@/types/timeline'
import type { LaneType, NewTimelineEvent } from '@/types/timeline'

// ============================================================================
// Types
// ============================================================================

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
}

// ============================================================================
// Component
// ============================================================================

export function TemplateSelector({ isOpen, onClose }: TemplateSelectorProps) {
  const addEvent = useTimelineStore((state) => state.addEvent)
  const clearSampleEvents = useTimelineStore((state) => state.clearSampleEvents)

  const [selectedTemplate, setSelectedTemplate] = useState<ReleaseTemplate | null>(null)
  const [releaseDate, setReleaseDate] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'select' | 'configure'>('select')

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setSelectedTemplate(null)
    setReleaseDate('')
    setStep('select')
    setIsLoading(false)
    onClose()
  }, [onClose])

  // Handle template selection
  const handleSelectTemplate = useCallback((template: ReleaseTemplate) => {
    setSelectedTemplate(template)
    // Default to 8 weeks from now
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 56)
    setReleaseDate(defaultDate.toISOString().split('T')[0])
    setStep('configure')
  }, [])

  // Handle template loading
  const handleLoadTemplate = useCallback(async () => {
    if (!selectedTemplate || !releaseDate) return

    setIsLoading(true)

    try {
      // Clear sample events first
      await clearSampleEvents()

      // Parse release date
      const releaseDateObj = new Date(releaseDate)

      // Create events from template tasks
      for (const task of selectedTemplate.tasks) {
        const taskDate = calculateTaskDate(releaseDateObj, task.weeksBeforeRelease)

        const newEvent: NewTimelineEvent = {
          lane: task.lane as LaneType,
          title: task.title,
          date: taskDate.toISOString(),
          colour: getTemplateLaneColour(task.lane as LaneType),
          description: task.description,
          tags: task.tags,
          source: 'manual',
        }

        await addEvent(newEvent)
      }

      handleClose()
    } catch (error) {
      console.error('Failed to load template:', error)
      setIsLoading(false)
    }
  }, [selectedTemplate, releaseDate, addEvent, clearSampleEvents, handleClose])

  // Go back to template selection
  const handleBack = useCallback(() => {
    setStep('select')
    setSelectedTemplate(null)
  }, [])

  // Get task count by lane for preview
  const getTaskCountsByLane = (template: ReleaseTemplate): Record<LaneType, number> => {
    return template.tasks.reduce(
      (acc, task) => {
        acc[task.lane as LaneType] = (acc[task.lane as LaneType] || 0) + 1
        return acc
      },
      {
        'pre-release': 0,
        release: 0,
        'post-release': 0,
      } as Record<LaneType, number>
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 24,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#161A1D',
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
            width: '100%',
            maxWidth: step === 'select' ? 720 : 480,
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {step === 'configure' && (
                <button
                  onClick={handleBack}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 6,
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  ← Back
                </button>
              )}
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#F7F8F9',
                  margin: 0,
                }}
              >
                {step === 'select' ? 'Choose a Template' : `Set Up: ${selectedTemplate?.name}`}
              </h2>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close modal"
              style={{
                padding: 8,
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                color: 'rgba(255, 255, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.12s ease',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 24,
            }}
          >
            {step === 'select' ? (
              // Template selection grid
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 16,
                }}
              >
                {RELEASE_TEMPLATES.map((template) => {
                  const taskCounts = getTaskCountsByLane(template)
                  return (
                    <motion.button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: 20,
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 12,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Name and duration */}
                      <div style={{ marginBottom: 12 }}>
                        <h3
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: '#F7F8F9',
                            margin: 0,
                          }}
                        >
                          {template.name}
                        </h3>
                        <span
                          style={{
                            fontSize: 12,
                            color: '#3AA9BE',
                            fontWeight: 500,
                          }}
                        >
                          {template.duration}
                        </span>
                      </div>

                      {/* Description */}
                      <p
                        style={{
                          fontSize: 13,
                          color: 'rgba(255, 255, 255, 0.5)',
                          margin: '0 0 16px 0',
                          lineHeight: 1.4,
                        }}
                      >
                        {template.description}
                      </p>

                      {/* Lane distribution preview */}
                      <div style={{ display: 'flex', gap: 4 }}>
                        {LANES.map((lane) => {
                          const count = taskCounts[lane.id]
                          if (count === 0) return null
                          return (
                            <div
                              key={lane.id}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: `${lane.colour}15`,
                                borderRadius: 4,
                                fontSize: 10,
                                fontWeight: 500,
                                color: lane.colour,
                              }}
                              title={`${count} ${lane.label} tasks`}
                            >
                              {count}
                            </div>
                          )
                        })}
                      </div>

                      {/* Arrow indicator */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          marginTop: 12,
                          color: 'rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        <ChevronRight size={16} />
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            ) : (
              // Configuration step
              <div style={{ maxWidth: 400, margin: '0 auto' }}>
                {/* Template summary */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: 20,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 12,
                    marginBottom: 24,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: '#F7F8F9',
                        margin: '0 0 4px 0',
                      }}
                    >
                      {selectedTemplate?.name}
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: 'rgba(255, 255, 255, 0.5)',
                        margin: 0,
                      }}
                    >
                      {selectedTemplate?.tasks.length} tasks • {selectedTemplate?.duration}
                    </p>
                  </div>
                </div>

                {/* Release date input */}
                <div style={{ marginBottom: 24 }}>
                  <label
                    htmlFor="release-date"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#F7F8F9',
                      marginBottom: 8,
                    }}
                  >
                    <Calendar size={16} style={{ color: '#3AA9BE' }} />
                    Release Date
                  </label>
                  <input
                    id="release-date"
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      fontSize: 15,
                      color: '#F7F8F9',
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
                    }}
                  />
                  <p
                    style={{
                      fontSize: 12,
                      color: 'rgba(255, 255, 255, 0.4)',
                      marginTop: 8,
                    }}
                  >
                    Tasks will be scheduled relative to this date
                  </p>
                </div>

                {/* Task preview */}
                <div
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(58, 169, 190, 0.05)',
                    border: '1px solid rgba(58, 169, 190, 0.15)',
                    borderRadius: 8,
                    marginBottom: 24,
                  }}
                >
                  <h4
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#3AA9BE',
                      margin: '0 0 12px 0',
                    }}
                  >
                    Preview
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedTemplate?.tasks.slice(0, 4).map((task, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 13,
                          color: 'rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: getTemplateLaneColour(task.lane as LaneType),
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ flex: 1 }}>{task.title}</span>
                        <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12 }}>
                          {task.weeksBeforeRelease > 0
                            ? `${task.weeksBeforeRelease}w before`
                            : task.weeksBeforeRelease < 0
                              ? `${Math.abs(task.weeksBeforeRelease)}w after`
                              : 'Release day'}
                        </span>
                      </div>
                    ))}
                    {selectedTemplate && selectedTemplate.tasks.length > 4 && (
                      <p
                        style={{
                          fontSize: 12,
                          color: 'rgba(255, 255, 255, 0.4)',
                          margin: '4px 0 0 0',
                        }}
                      >
                        + {selectedTemplate.tasks.length - 4} more tasks
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer (only on configure step) */}
          {step === 'configure' && (
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
              }}
            >
              <button
                onClick={handleClose}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLoadTemplate}
                disabled={!releaseDate || isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  backgroundColor: '#3AA9BE',
                  border: 'none',
                  borderRadius: 8,
                  color: '#0F1113',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: releaseDate && !isLoading ? 'pointer' : 'not-allowed',
                  opacity: releaseDate && !isLoading ? 1 : 0.5,
                  transition: 'all 0.12s ease',
                }}
              >
                {isLoading ? (
                  'Loading...'
                ) : (
                  <>
                    <Check size={16} />
                    Load Template
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
