/**
 * useShareSignal Hook
 * Phase 14.5: Generate shareable public links for FlowCanvas scenes
 *
 * Features:
 * - Generate public share URL
 * - Copy to clipboard with animation
 * - Toast notifications
 */

'use client'

import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface UseShareSignalResult {
  share: (sceneId: string) => Promise<string | null>
  isSharing: boolean
  copyToClipboard: (url: string) => Promise<void>
}

export function useShareSignal(): UseShareSignalResult {
  const [isSharing, setIsSharing] = useState(false)

  const share = useCallback(async (sceneId: string): Promise<string | null> => {
    setIsSharing(true)

    try {
      const response = await fetch('/api/canvas/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId }),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate share link: ${response.statusText}`)
      }

      const data = await response.json()
      const shareUrl = `${window.location.origin}/share/${data.publicShareId}`

      return shareUrl
    } catch (error) {
      console.error('Share failed:', error)
      toast.error("couldn't generate link — try again", {
        duration: 3000,
        style: {
          background: '#0F1113',
          color: '#FF5252',
          border: '1px solid #263238',
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '14px',
          textTransform: 'lowercase',
        },
      })
      return null
    } finally {
      setIsSharing(false)
    }
  }, [])

  const copyToClipboard = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      
      toast.success('link copied — share your signal', {
        duration: 2500,
        style: {
          background: '#0F1113',
          color: '#3AA9BE',
          border: '1px solid #3AA9BE',
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '14px',
          textTransform: 'lowercase',
        },
        icon: '🔗',
      })
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error("couldn't copy link", {
        duration: 2000,
        style: {
          background: '#0F1113',
          color: '#FF5252',
          border: '1px solid #263238',
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '14px',
          textTransform: 'lowercase',
        },
      })
    }
  }, [])

  return {
    share,
    isSharing,
    copyToClipboard,
  }
}
