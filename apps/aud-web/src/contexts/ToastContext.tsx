/**
 * Toast Context Provider
 *
 * Global toast state management for the entire app
 */

'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ToastContainer, Toast, ToastAction } from '@/components/ui/Toast'
import { getRandomMessage, triggerHaptic, checkMilestone } from '@/lib/celebrations'
import { generateId } from '@/lib/id'

interface ToastContextValue {
  addToast: (message: string, type?: Toast['type'], duration?: number, action?: ToastAction) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  celebrate: (message: string) => void

  // Convenience methods with random messages
  ideaCreated: () => void
  ideaDeleted: (undoCallback: () => void) => void
  addedToTimeline: () => void
  pitchCopied: () => void

  // Milestone checking
  checkAndCelebrate: (
    type: 'ideas' | 'timeline' | 'scout' | 'pitch' | 'onboarding',
    count: number
  ) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (message: string, type: Toast['type'] = 'success', duration = 3000, action?: ToastAction) => {
      const id = generateId('toast')
      setToasts((prev) => [...prev, { id, message, type, duration, action }])

      // Haptic feedback on mobile
      if (type === 'success' || type === 'celebration') {
        triggerHaptic('success')
      }
    },
    []
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((message: string) => addToast(message, 'success'), [addToast])
  const error = useCallback((message: string) => addToast(message, 'error', 4000), [addToast])
  const info = useCallback((message: string) => addToast(message, 'info'), [addToast])
  const celebrate = useCallback(
    (message: string) => addToast(message, 'celebration', 4000),
    [addToast]
  )

  // Convenience methods with random personality
  const ideaCreated = useCallback(() => {
    addToast(getRandomMessage('ideaCreated'), 'success')
  }, [addToast])

  const ideaDeleted = useCallback(
    (undoCallback: () => void) => {
      addToast('Idea deleted', 'info', 5000, {
        label: 'Undo',
        onClick: undoCallback,
      })
    },
    [addToast]
  )

  const addedToTimeline = useCallback(() => {
    addToast(getRandomMessage('addedToTimeline'), 'success')
  }, [addToast])

  const pitchCopied = useCallback(() => {
    addToast(getRandomMessage('pitchCopied'), 'success')
  }, [addToast])

  // Milestone celebrations
  const checkAndCelebrate = useCallback(
    (type: 'ideas' | 'timeline' | 'scout' | 'pitch' | 'onboarding', count: number) => {
      const message = checkMilestone(type, count)
      if (message) {
        // Delay slightly for milestone to feel special
        setTimeout(() => {
          addToast(message, 'celebration', 5000)
        }, 500)
      }
    },
    [addToast]
  )

  const value: ToastContextValue = {
    addToast,
    success,
    error,
    info,
    celebrate,
    ideaCreated,
    ideaDeleted,
    addedToTimeline,
    pitchCopied,
    checkAndCelebrate,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
