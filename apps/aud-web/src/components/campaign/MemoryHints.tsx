/**
 * Memory Hints Component
 * Phase 12A: OS Memory & Context Persistence
 *
 * Shows "Last time..." contextual hints when creating clips/loops
 * Fetches top 3 relevant memories and displays them subtly
 */

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import { Lightbulb } from 'lucide-react'
import type { ThemeId, AgentName } from '@totalaud/os-state/campaign'

const log = logger.scope('MemoryHints')

export interface MemoryHintsProps {
  campaignId?: string
  os?: ThemeId
  agent?: AgentName
  enabled?: boolean
}

interface MemoryHint {
  title: string
  createdAt: string
}

const OS_COLOURS: Record<ThemeId, string> = {
  ascii: '#00ff99',
  xp: '#3478f6',
  aqua: '#3b82f6',
  daw: '#ff8000',
  analogue: '#ff1aff',
}

export function MemoryHints({ campaignId, os, agent, enabled = true }: MemoryHintsProps) {
  const [hints, setHints] = useState<MemoryHint[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setHints([])
      return
    }

    const fetchHints = async () => {
      setLoading(true)

      try {
        const params = new URLSearchParams({
          limit: '3',
          minImportance: '3',
        })

        if (campaignId) {
          params.append('campaignId', campaignId)
        }

        if (os) {
          params.append('os', os)
        }

        if (agent) {
          params.append('agent', agent)
        }

        const response = await fetch(`/api/memory/list?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch memory hints')
        }

        const data = await response.json()
        const memories = data.memories || []

        // Map to hints
        const memoryHints: MemoryHint[] = memories.slice(0, 3).map((mem: any) => ({
          title: mem.title,
          createdAt: mem.createdAt,
        }))

        setHints(memoryHints)
        log.debug('Fetched memory hints', { count: memoryHints.length, os, agent })
      } catch (err) {
        log.error('Failed to fetch memory hints', err)
        setHints([])
      } finally {
        setLoading(false)
      }
    }

    fetchHints()
  }, [campaignId, os, agent, enabled])

  if (!enabled || hints.length === 0) {
    return null
  }

  const osColour = os ? OS_COLOURS[os] : flowCoreColours.slateCyan

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.24 }}
        style={{
          padding: '12px',
          background: `${osColour}08`,
          border: `1px solid ${osColour}30`,
          borderRadius: '6px',
          marginBottom: '16px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'centre',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <Lightbulb size={14} strokeWidth={1.6} style={{ color: osColour }} />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: osColour,
              letterSpacing: '0.5px',
            }}
          >
            Last time...
          </span>
        </div>

        {/* Hints */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {hints.map((hint, index) => {
            const timeAgo = getTimeAgo(hint.createdAt)

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  fontSize: '12px',
                  color: flowCoreColours.textSecondary,
                  lineHeight: 1.5,
                  paddingLeft: '22px',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    color: osColour,
                    opacity: 0.6,
                  }}
                >
                  •
                </span>
                <span>{hint.title}</span>
                <span
                  style={{
                    marginLeft: '8px',
                    fontSize: '10px',
                    color: flowCoreColours.textTertiary,
                  }}
                >
                  ({timeAgo})
                </span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Helper: Format time ago
 */
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return 'just now'
  } else if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks}w ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months}mo ago`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years}y ago`
  }
}
