/**
 * Campaign Memory Drawer
 * Phase 12A: OS Memory & Context Persistence
 *
 * 520px drawer with tabs by OS (ASCII/XP/Aqua/DAW/Analogue)
 * Shows memory history with expandable cards
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import { Brain, X, ChevronDown, ChevronRight } from 'lucide-react'
import type { OSMemory, ThemeId, MemoryType } from '@totalaud/os-state/campaign'

const log = logger.scope('CampaignMemoryDrawer')

export interface CampaignMemoryDrawerProps {
  campaignId?: string
  isOpen: boolean
  onClose: () => void
}

const OS_TABS: { id: ThemeId; label: string; colour: string }[] = [
  { id: 'ascii', label: 'ASCII', colour: '#00ff99' },
  { id: 'xp', label: 'XP', colour: '#3478f6' },
  { id: 'aqua', label: 'Aqua', colour: '#3b82f6' },
  { id: 'daw', label: 'DAW', colour: '#ff8000' },
  { id: 'analogue', label: 'Analogue', colour: '#ff1aff' },
]

const MEMORY_TYPE_LABELS: Record<MemoryType, string> = {
  fact: 'Fact',
  pattern: 'Pattern',
  reflection: 'Reflection',
  emotion: 'Emotion',
  warning: 'Warning',
}

export function CampaignMemoryDrawer({
  campaignId,
  isOpen,
  onClose,
}: CampaignMemoryDrawerProps) {
  const [activeOS, setActiveOS] = useState<ThemeId>('ascii')
  const [memories, setMemories] = useState<OSMemory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedMemoryId, setExpandedMemoryId] = useState<string | null>(null)

  // Fetch memories when OS tab changes or drawer opens
  useEffect(() => {
    if (!isOpen) return

    const fetchMemories = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          os: activeOS,
          limit: '50',
        })

        if (campaignId) {
          params.append('campaignId', campaignId)
        }

        const response = await fetch(`/api/memory/list?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch memories')
        }

        const data = await response.json()
        setMemories(data.memories || [])
        log.debug('Fetched memories', { os: activeOS, count: data.memories?.length || 0 })
      } catch (err) {
        log.error('Failed to fetch memories', err)
        setError('Failed to load memories')
      } finally {
        setLoading(false)
      }
    }

    fetchMemories()
  }, [activeOS, campaignId, isOpen])

  const handleOSChange = (os: ThemeId) => {
    setActiveOS(os)
    setExpandedMemoryId(null) // Collapse when switching tabs
  }

  const toggleMemoryExpand = (memoryId: string) => {
    setExpandedMemoryId((prev) => (prev === memoryId ? null : memoryId))
  }

  const activeOSColour = OS_TABS.find((t) => t.id === activeOS)?.colour || flowCoreColours.slateCyan

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 100,
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '520px',
              maxWidth: '90vw',
              background: flowCoreColours.matteBlack,
              borderLeft: `1px solid ${flowCoreColours.borderSubtle}`,
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px',
                borderBottom: `1px solid ${flowCoreColours.borderSubtle}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 600,
                    color: activeOSColour,
                    textTransform: 'lowercase',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Brain size={20} strokeWidth={1.6} />
                    memory stream
                  </span>
                </h2>
                <button
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: flowCoreColours.textSecondary,
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px',
                    lineHeight: 1,
                  }}
                  aria-label="Close drawer"
                >
                  <X size={18} strokeWidth={1.6} />
                </button>
              </div>

              {/* OS Tabs */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '16px', flexWrap: 'wrap' }}>
                {OS_TABS.map((os) => (
                  <button
                    key={os.id}
                    onClick={() => handleOSChange(os.id)}
                    style={{
                      padding: '6px 12px',
                      background: activeOS === os.id ? os.colour : 'transparent',
                      border: `1px solid ${activeOS === os.id ? os.colour : flowCoreColours.borderSubtle}`,
                      borderRadius: '4px',
                      color: activeOS === os.id ? flowCoreColours.matteBlack : os.colour,
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      transition: 'all var(--flowcore-motion-fast) ease',
                    }}
                  >
                    {os.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      color: flowCoreColours.textSecondary,
                      fontSize: '14px',
                      textAlign: 'center',
                      padding: '40px 0',
                    }}
                  >
                    loading memories...
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      color: flowCoreColours.errorRed,
                      fontSize: '14px',
                      textAlign: 'center',
                      padding: '40px 0',
                    }}
                  >
                    {error}
                  </motion.div>
                )}

                {!loading && !error && memories.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      color: flowCoreColours.textTertiary,
                      fontSize: '13px',
                      textAlign: 'center',
                      padding: '40px 20px',
                    }}
                  >
                    no memories yet for {activeOS} OS
                  </motion.div>
                )}

                {!loading && !error && memories.length > 0 && (
                  <motion.div
                    key="memories"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.24 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    {memories.map((memory) => (
                      <MemoryCard
                        key={memory.id}
                        memory={memory}
                        osColour={activeOSColour}
                        isExpanded={expandedMemoryId === memory.id}
                        onToggle={() => toggleMemoryExpand(memory.id)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '12px 20px',
                borderTop: `1px solid ${flowCoreColours.borderSubtle}`,
                fontSize: '11px',
                color: flowCoreColours.textTertiary,
                textAlign: 'center',
              }}
            >
              {memories.length} {memories.length === 1 ? 'memory' : 'memories'} •{' '}
              {campaignId ? 'campaign' : 'global'} scope
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * Individual Memory Card
 */
interface MemoryCardProps {
  memory: OSMemory
  osColour: string
  isExpanded: boolean
  onToggle: () => void
}

function MemoryCard({ memory, osColour, isExpanded, onToggle }: MemoryCardProps) {
  const formattedDate = new Date(memory.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <motion.div
      layout
      style={{
        padding: '14px',
        background: flowCoreColours.cardBackground,
        border: `1px solid ${flowCoreColours.borderSubtle}`,
        borderRadius: '6px',
        cursor: 'pointer',
      }}
      whileHover={{ borderColor: osColour }}
      onClick={onToggle}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: osColour,
                background: `${osColour}20`,
                padding: '2px 6px',
                borderRadius: '3px',
              }}
            >
              {MEMORY_TYPE_LABELS[memory.memoryType]}
            </span>
            {memory.agent && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  color: flowCoreColours.textTertiary,
                }}
              >
                {memory.agent}
              </span>
            )}
            <span
              style={{
                fontSize: '10px',
                color: flowCoreColours.textTertiary,
                marginLeft: 'auto',
              }}
            >
              ★ {memory.importance}/5
            </span>
          </div>
          <h4
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 600,
              color: flowCoreColours.textPrimary,
              lineHeight: 1.4,
            }}
          >
            {memory.title}
          </h4>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '11px',
              color: flowCoreColours.textTertiary,
            }}
          >
            {formattedDate}
          </p>
        </div>
        <div style={{ marginLeft: '12px', color: flowCoreColours.textSecondary }}>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: `1px solid ${flowCoreColours.borderSubtle}`,
            }}
          >
            {/* Content */}
            <div
              style={{
                fontSize: '13px',
                color: flowCoreColours.textSecondary,
                marginBottom: '12px',
                lineHeight: 1.5,
              }}
            >
              <pre
                style={{
                  fontFamily: 'inherit',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                }}
              >
                {JSON.stringify(memory.content, null, 2)}
              </pre>
            </div>

            {/* Metadata */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                fontSize: '11px',
                color: flowCoreColours.textTertiary,
              }}
            >
              <span>ID: {memory.id.slice(0, 8)}...</span>
              {memory.campaignId && <span>Campaign: {memory.campaignId.slice(0, 8)}...</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
