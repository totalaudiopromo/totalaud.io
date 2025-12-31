/**
 * First-Time User Tips System
 *
 * Shows contextual onboarding tooltips for each feature
 * Persists dismissal state in localStorage
 */

'use client'

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { transition } from '@/lib/motion'

// Tip definitions
interface TipConfig {
  id: string
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const TIPS: Record<string, TipConfig> = {
  ideas: {
    id: 'ideas',
    title: 'Capture your ideas',
    description:
      'Click anywhere to create a note. Tag ideas as Content, Brand, Music, or Promo to keep them organized.',
  },
  scout: {
    id: 'scout',
    title: 'Discover opportunities',
    description:
      'Browse curated playlists, blogs, and radio stations. Click Add to save them to your Timeline.',
  },
  timeline: {
    id: 'timeline',
    title: 'Plan your release',
    description:
      'Drag events between lanes to organize your campaign. Events from Scout appear here automatically.',
  },
  pitch: {
    id: 'pitch',
    title: 'Craft your story',
    description:
      'Choose a template and write your pitch. Use the AI Coach to improve each section.',
  },
}

const STORAGE_KEY = 'totalaud-tips-dismissed'

// Context
interface TipsContextValue {
  dismissedTips: Set<string>
  dismissTip: (tipId: string) => void
  resetTips: () => void
  shouldShowTip: (tipId: string) => boolean
}

const TipsContext = createContext<TipsContextValue | null>(null)

export function TipsProvider({ children }: { children: ReactNode }) {
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set())
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setDismissedTips(new Set(JSON.parse(stored)))
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    setIsHydrated(true)
  }, [])

  // Persist to localStorage
  const dismissTip = useCallback((tipId: string) => {
    setDismissedTips((prev) => {
      const next = new Set(prev)
      next.add(tipId)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      } catch (e) {
        // Ignore
      }
      return next
    })
  }, [])

  const resetTips = useCallback(() => {
    setDismissedTips(new Set())
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      // Ignore
    }
  }, [])

  const shouldShowTip = useCallback(
    (tipId: string) => {
      return isHydrated && !dismissedTips.has(tipId)
    },
    [dismissedTips, isHydrated]
  )

  return (
    <TipsContext.Provider value={{ dismissedTips, dismissTip, resetTips, shouldShowTip }}>
      {children}
    </TipsContext.Provider>
  )
}

export function useTips() {
  const context = useContext(TipsContext)
  if (!context) {
    // Return no-op version if not in provider
    return {
      dismissedTips: new Set<string>(),
      dismissTip: () => {},
      resetTips: () => {},
      shouldShowTip: () => false,
    }
  }
  return context
}

// Tip Banner Component
interface TipBannerProps {
  tipId: keyof typeof TIPS
  className?: string
}

export function TipBanner({ tipId, className = '' }: TipBannerProps) {
  const { shouldShowTip, dismissTip } = useTips()
  const tip = TIPS[tipId]

  if (!tip || !shouldShowTip(tipId)) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={transition.normal}
        className={`
          flex items-start gap-3 px-4 py-3
          bg-[#3AA9BE]/10 border border-[#3AA9BE]/20
          rounded-lg ${className}
        `}
      >
        {/* Icon */}
        <div
          className="
          w-6 h-6 rounded-full 
          bg-[#3AA9BE]/20 
          flex items-center justify-center
          text-[#3AA9BE] text-xs font-bold
          shrink-0 mt-0.5
        "
        >
          ?
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white/90 mb-0.5">{tip.title}</h4>
          <p className="text-xs text-white/50 leading-relaxed">{tip.description}</p>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => dismissTip(tipId)}
          className="
            text-white/30 hover:text-white/50
            transition-colors p-1 -mr-1
          "
          aria-label="Dismiss tip"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

// Compact inline tip for specific features
interface InlineTipProps {
  text: string
  onDismiss?: () => void
}

export function InlineTip({ text, onDismiss }: InlineTipProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 text-xs text-white/40"
    >
      <span className="text-[#3AA9BE]">Tip:</span>
      <span>{text}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-white/30 hover:text-white/50 ml-1">
          Got it
        </button>
      )}
    </motion.div>
  )
}
