/**
 * Threads Panel Component
 * Phase 2: Side panel for managing Signal Threads
 *
 * Features:
 * - View all threads
 * - Create new threads
 * - Generate AI narrative
 * - Edit thread properties
 * - Delete threads
 */

'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useSignalThreadStore,
  type ThreadType,
  type SignalThread,
} from '@/stores/useSignalThreadStore'
import { TypingIndicator } from '@/components/ui/EmptyState'

// Thread type options with labels and descriptions
const THREAD_TYPES: { key: ThreadType; label: string; icon: string; description: string }[] = [
  {
    key: 'narrative',
    label: 'Story Arc',
    icon: '📖',
    description: 'The story of your release journey',
  },
  {
    key: 'campaign',
    label: 'Campaign',
    icon: '🎯',
    description: 'Linked promotional activities',
  },
  {
    key: 'creative',
    label: 'Creative',
    icon: '✨',
    description: 'Related creative outputs',
  },
  {
    key: 'scene',
    label: 'Scene',
    icon: '🎤',
    description: 'Live performance connections',
  },
  {
    key: 'performance',
    label: 'Performance',
    icon: '📊',
    description: 'Analytics and results',
  },
]

// Default thread colours
const THREAD_COLOURS = [
  '#3AA9BE', // Slate Cyan (default)
  '#F472B6', // Pink
  '#A78BFA', // Purple
  '#34D399', // Green
  '#FBBF24', // Yellow
  '#FB923C', // Orange
  '#F87171', // Red
  '#60A5FA', // Blue
]

interface ThreadsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ThreadsPanel({ isOpen, onClose }: ThreadsPanelProps) {
  const threads = useSignalThreadStore((state) => state.threads)
  const isLoading = useSignalThreadStore((state) => state.isLoading)
  const isGenerating = useSignalThreadStore((state) => state.isGenerating)
  const createThread = useSignalThreadStore((state) => state.createThread)
  const deleteThread = useSignalThreadStore((state) => state.deleteThread)
  const generateNarrative = useSignalThreadStore((state) => state.generateNarrative)
  const setActiveThread = useSignalThreadStore((state) => state.setActiveThread)
  const activeThreadId = useSignalThreadStore((state) => state.activeThreadId)

  const [view, setView] = useState<'list' | 'create' | 'detail'>('list')
  const [selectedThread, setSelectedThread] = useState<SignalThread | null>(null)
  const [newThread, setNewThread] = useState({
    title: '',
    threadType: 'narrative' as ThreadType,
    colour: '#3AA9BE',
  })

  // Handle thread creation
  const handleCreate = useCallback(async () => {
    if (!newThread.title.trim()) return

    await createThread({
      title: newThread.title,
      threadType: newThread.threadType,
      colour: newThread.colour,
    })
    setNewThread({ title: '', threadType: 'narrative', colour: '#3AA9BE' })
    setView('list')
  }, [newThread, createThread])

  // Handle thread selection
  const handleSelectThread = useCallback(
    (thread: SignalThread) => {
      setSelectedThread(thread)
      setActiveThread(thread.id)
      setView('detail')
    },
    [setActiveThread]
  )

  // Handle narrative generation
  const handleGenerateNarrative = useCallback(
    async (threadId: string) => {
      await generateNarrative(threadId)
    },
    [generateNarrative]
  )

  // Handle thread deletion
  const handleDelete = useCallback(
    async (threadId: string) => {
      await deleteThread(threadId)
      setView('list')
      setSelectedThread(null)
    },
    [deleteThread]
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 360,
            backgroundColor: 'rgba(15, 17, 19, 0.98)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {view !== 'list' && (
                <button
                  onClick={() => setView('list')}
                  aria-label="Back to thread list"
                  style={{
                    padding: 4,
                    fontSize: 14,
                    color: 'rgba(255, 255, 255, 0.5)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  ←
                </button>
              )}
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.95)',
                }}
              >
                {view === 'list' && 'Signal Threads'}
                {view === 'create' && 'New Thread'}
                {view === 'detail' && selectedThread?.title}
              </h2>
            </div>

            <button
              onClick={onClose}
              aria-label="Close threads panel"
              style={{
                padding: 6,
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.4)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              padding: 20,
              overflowY: 'auto',
            }}
          >
            {/* List View */}
            {view === 'list' && (
              <>
                {/* Create button */}
                <button
                  onClick={() => setView('create')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    marginBottom: 16,
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#3AA9BE',
                    backgroundColor: 'rgba(58, 169, 190, 0.1)',
                    border: '1px dashed rgba(58, 169, 190, 0.3)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.15)'
                    e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.1)'
                    e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.3)'
                  }}
                >
                  <span>+</span> Create Thread
                </button>

                {/* Loading state */}
                {isLoading && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 16,
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <TypingIndicator />
                    <span style={{ fontSize: 12 }}>Loading threads...</span>
                  </div>
                )}

                {/* Empty state */}
                {!isLoading && threads.length === 0 && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🧵</div>
                    <div style={{ fontSize: 13, marginBottom: 4 }}>No threads yet</div>
                    <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.3)' }}>
                      Connect timeline events into story arcs
                    </div>
                  </div>
                )}

                {/* Thread list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {threads.map((thread) => (
                    <ThreadListItem
                      key={thread.id}
                      thread={thread}
                      isActive={activeThreadId === thread.id}
                      onClick={() => handleSelectThread(thread)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Create View */}
            {view === 'create' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Title input */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginBottom: 8,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Thread Title
                  </label>
                  <input
                    type="text"
                    value={newThread.title}
                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                    placeholder="e.g., EP Release Journey"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: 13,
                      color: 'rgba(255, 255, 255, 0.9)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 6,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Thread type */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginBottom: 8,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Thread Type
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {THREAD_TYPES.map((type) => (
                      <button
                        key={type.key}
                        onClick={() => setNewThread({ ...newThread, threadType: type.key })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 14px',
                          backgroundColor:
                            newThread.threadType === type.key
                              ? 'rgba(58, 169, 190, 0.15)'
                              : 'rgba(255, 255, 255, 0.03)',
                          border:
                            newThread.threadType === type.key
                              ? '1px solid rgba(58, 169, 190, 0.3)'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: 6,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{type.icon}</span>
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: 'rgba(255, 255, 255, 0.9)',
                            }}
                          >
                            {type.label}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: 'rgba(255, 255, 255, 0.4)',
                            }}
                          >
                            {type.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colour picker */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginBottom: 8,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Thread Colour
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {THREAD_COLOURS.map((colour) => (
                      <button
                        key={colour}
                        onClick={() => setNewThread({ ...newThread, colour })}
                        aria-label={`Select colour ${colour}`}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: colour,
                          border:
                            newThread.colour === colour
                              ? '2px solid white'
                              : '2px solid transparent',
                          cursor: 'pointer',
                          boxShadow: `0 0 12px ${colour}40`,
                          transition: 'all 0.12s ease',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Create button */}
                <button
                  onClick={handleCreate}
                  disabled={!newThread.title.trim() || isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    marginTop: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#0F1113',
                    backgroundColor: '#3AA9BE',
                    border: 'none',
                    borderRadius: 8,
                    cursor: newThread.title.trim() ? 'pointer' : 'not-allowed',
                    opacity: newThread.title.trim() ? 1 : 0.5,
                    boxShadow: '0 4px 20px rgba(58, 169, 190, 0.3)',
                    transition: 'all 0.12s ease',
                  }}
                >
                  Create Thread
                </button>
              </div>
            )}

            {/* Detail View */}
            {view === 'detail' && selectedThread && (
              <ThreadDetail
                thread={selectedThread}
                isGenerating={isGenerating}
                onGenerateNarrative={() => handleGenerateNarrative(selectedThread.id)}
                onDelete={() => handleDelete(selectedThread.id)}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// Thread List Item
// ============================================================================

interface ThreadListItemProps {
  thread: SignalThread
  isActive: boolean
  onClick: () => void
}

function ThreadListItem({ thread, isActive, onClick }: ThreadListItemProps) {
  const typeInfo = THREAD_TYPES.find((t) => t.key === thread.threadType)

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 14px',
        backgroundColor: isActive ? `${thread.colour}15` : 'rgba(255, 255, 255, 0.02)',
        border: isActive ? `1px solid ${thread.colour}40` : '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: 8,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.12s ease',
      }}
    >
      {/* Colour indicator */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: thread.colour,
          marginTop: 4,
          boxShadow: `0 0 8px ${thread.colour}50`,
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {thread.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{typeInfo?.icon}</span>
          <span>{typeInfo?.label}</span>
          <span>•</span>
          <span>{thread.eventIds.length} events</span>
        </div>
      </div>
    </motion.button>
  )
}

// ============================================================================
// Thread Detail View
// ============================================================================

interface ThreadDetailProps {
  thread: SignalThread
  isGenerating: boolean
  onGenerateNarrative: () => void
  onDelete: () => void
}

function ThreadDetail({ thread, isGenerating, onGenerateNarrative, onDelete }: ThreadDetailProps) {
  const typeInfo = THREAD_TYPES.find((t) => t.key === thread.threadType)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Thread info */}
      <div
        style={{
          padding: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: thread.colour,
              boxShadow: `0 0 12px ${thread.colour}50`,
            }}
          />
          <span style={{ fontSize: 16 }}>{typeInfo?.icon}</span>
          <span
            style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            {typeInfo?.label}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.4)',
                marginBottom: 4,
              }}
            >
              Events
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: thread.colour,
              }}
            >
              {thread.eventIds.length}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.4)',
                marginBottom: 4,
              }}
            >
              Date Range
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              {thread.startDate && thread.endDate
                ? `${new Date(thread.startDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })} – ${new Date(thread.endDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}`
                : 'No dates'}
            </div>
          </div>
        </div>
      </div>

      {/* Narrative section */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <h3
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Narrative
          </h3>
          <button
            onClick={onGenerateNarrative}
            disabled={isGenerating || thread.eventIds.length < 2}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 500,
              color: '#3AA9BE',
              backgroundColor: 'rgba(58, 169, 190, 0.1)',
              border: '1px solid rgba(58, 169, 190, 0.2)',
              borderRadius: 6,
              cursor: isGenerating || thread.eventIds.length < 2 ? 'not-allowed' : 'pointer',
              opacity: isGenerating || thread.eventIds.length < 2 ? 0.5 : 1,
            }}
          >
            {isGenerating ? (
              <>
                <TypingIndicator />
                Generating...
              </>
            ) : (
              <>
                <span>✨</span>
                Generate Story
              </>
            )}
          </button>
        </div>

        {thread.narrativeSummary ? (
          <div
            style={{
              padding: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            <p
              style={{
                fontSize: 12,
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.8)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {thread.narrativeSummary}
            </p>
          </div>
        ) : (
          <div
            style={{
              padding: 20,
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 8,
              border: '1px dashed rgba(255, 255, 255, 0.08)',
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              {thread.eventIds.length < 2
                ? 'Add at least 2 events to generate a narrative'
                : 'Click "Generate Story" to create a narrative'}
            </p>
          </div>
        )}
      </div>

      {/* Insights section */}
      {thread.insights.length > 0 && (
        <div>
          <h3
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: 12,
            }}
          >
            Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {thread.insights.map((insight, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'rgba(58, 169, 190, 0.05)',
                  border: '1px solid rgba(58, 169, 190, 0.1)',
                  borderRadius: 6,
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete button */}
      <div style={{ marginTop: 'auto', paddingTop: 20 }}>
        {showDeleteConfirm ? (
          <div
            style={{
              display: 'flex',
              gap: 8,
            }}
          >
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                flex: 1,
                padding: '10px 16px',
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.6)',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              style={{
                flex: 1,
                padding: '10px 16px',
                fontSize: 12,
                fontWeight: 500,
                color: 'white',
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Confirm Delete
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: 12,
              color: 'rgba(239, 68, 68, 0.8)',
              backgroundColor: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Delete Thread
          </button>
        )}
      </div>
    </div>
  )
}
