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

// Thread type options with labels and descriptions - using icon names instead of emojis
const THREAD_TYPES: {
  key: ThreadType
  label: string
  iconType: 'book' | 'target' | 'sparkle' | 'mic' | 'chart'
  description: string
}[] = [
  {
    key: 'narrative',
    label: 'Story Arc',
    iconType: 'book',
    description: 'The story of your release journey',
  },
  {
    key: 'campaign',
    label: 'Campaign',
    iconType: 'target',
    description: 'Linked promotional activities',
  },
  {
    key: 'creative',
    label: 'Creative',
    iconType: 'sparkle',
    description: 'Related creative outputs',
  },
  {
    key: 'scene',
    label: 'Scene',
    iconType: 'mic',
    description: 'Live performance connections',
  },
  {
    key: 'performance',
    label: 'Performance',
    iconType: 'chart',
    description: 'Analytics and results',
  },
]

// Helper to render thread type icons as SVG
function ThreadIcon({
  type,
  size = 16,
}: {
  type: 'book' | 'target' | 'sparkle' | 'mic' | 'chart'
  size?: number
}) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (type) {
    case 'book':
      return (
        <svg {...props}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    case 'target':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    case 'sparkle':
      return (
        <svg {...props}>
          <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
        </svg>
      )
    case 'mic':
      return (
        <svg {...props}>
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      )
    case 'chart':
      return (
        <svg {...props}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
  }
}

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
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(244, 114, 182, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#F472B6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 17H7A5 5 0 0 1 7 7h2" />
                        <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    </div>
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
                        <span style={{ width: 16, height: 16, color: '#3AA9BE' }}>
                          <ThreadIcon type={type.iconType} />
                        </span>
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
          <span style={{ display: 'inline-flex', width: 12, height: 12 }}>
            {typeInfo && <ThreadIcon type={typeInfo.iconType} size={12} />}
          </span>
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
          <span style={{ display: 'inline-flex', width: 16, height: 16, color: '#3AA9BE' }}>
            {typeInfo && <ThreadIcon type={typeInfo.iconType} size={16} />}
          </span>
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
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
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
            Notes
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
