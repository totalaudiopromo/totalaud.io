/**
 * Empty State Component
 *
 * Clean, helpful empty states
 */

'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { transition, duration } from '@/lib/motion'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
  variant?: 'default' | 'minimal' | 'large'
}

export function EmptyState({ title, description, action, variant = 'default' }: EmptyStateProps) {
  const sizes = {
    default: { title: 18, desc: 14, padding: 48 },
    minimal: { title: 16, desc: 13, padding: 32 },
    large: { title: 22, desc: 15, padding: 64 },
  }

  const size = sizes[variant]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition.slow}
      className="empty-state"
      style={{ padding: size.padding }}
    >
      <h3 className="empty-state-title" style={{ fontSize: size.title }}>
        {title}
      </h3>

      <p className="empty-state-description" style={{ fontSize: size.desc }}>
        {description}
      </p>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: duration.normal, ...transition.normal }}
          style={{ marginTop: 16 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}

// Pre-configured empty states for each mode
export const emptyStates = {
  ideas: {
    firstTime: {
      title: 'Your creative space',
      description:
        'Capture lyrics, melodies, marketing ideas, or anything that sparks inspiration.',
    },
    noResults: {
      title: 'No matching ideas',
      description: 'Try different keywords or clear your filters.',
    },
  },
  scout: {
    firstTime: {
      title: 'Discover opportunities',
      description: 'Browse curated playlists, blogs, radio stations, and press contacts.',
    },
    noResults: {
      title: 'No opportunities found',
      description: 'Try adjusting your filters or search terms.',
    },
    authRequired: {
      title: 'Sign in to explore',
      description: 'Create a free account to access opportunities.',
    },
  },
  timeline: {
    firstTime: {
      title: 'Plan your release',
      description: 'Start with a template or add custom events.',
    },
    noResults: {
      title: 'Nothing scheduled',
      description: 'Use Templates to get started quickly.',
    },
  },
  pitch: {
    selectType: {
      title: 'Choose your pitch type',
      description: 'Select a template to get started.',
    },
    noContent: {
      title: 'Start writing',
      description: 'Click a section to begin your pitch.',
    },
  },
}

// Typing indicator for AI responses
export function TypingIndicator() {
  // Use longer duration for ambient/looping animations
  const loopDuration = 1.4

  return (
    <div className="typing-indicator">
      <motion.span
        animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
        transition={{ duration: loopDuration, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
        transition={{ duration: loopDuration, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      />
      <motion.span
        animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
        transition={{
          duration: loopDuration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: duration.slow,
        }}
      />
    </div>
  )
}
