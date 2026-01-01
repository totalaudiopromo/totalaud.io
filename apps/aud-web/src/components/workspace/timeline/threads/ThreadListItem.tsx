'use client'

import { motion } from 'framer-motion'
import type { SignalThread } from '@/stores/useSignalThreadStore'
import { THREAD_TYPES } from './constants'

interface ThreadListItemProps {
  thread: SignalThread
  isActive: boolean
  onClick: () => void
}

export function ThreadListItem({ thread, isActive, onClick }: ThreadListItemProps) {
  const typeInfo = THREAD_TYPES.find((type) => type.key === thread.threadType)

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
          <span>&bull;</span>
          <span>{thread.eventIds.length} events</span>
        </div>
      </div>
    </motion.button>
  )
}
