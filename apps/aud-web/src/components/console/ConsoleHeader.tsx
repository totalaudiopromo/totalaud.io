/**
 * Console Header Component
 * Phase 14: Unified Product Polish
 *
 * Features:
 * - Editable campaign title (click to edit, auto-save)
 * - Save button with toast feedback
 * - Share button with URL copy functionality
 * - FlowCore design system integration
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Save, Share2, Check, Copy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { flowCoreColours, flowCoreMotion } from '@/constants/flowCoreColours'
import { toast } from 'react-hot-toast'

interface ConsoleHeaderProps {
  campaignId?: string
  initialTitle?: string
  onTitleChange?: (newTitle: string) => Promise<void>
  onSave?: () => Promise<void>
}

export function ConsoleHeader({
  campaignId,
  initialTitle = 'untitled campaign',
  onTitleChange,
  onSave,
}: ConsoleHeaderProps) {
  const [title, setTitle] = useState(initialTitle)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Handle title edit
  const handleTitleClick = () => {
    setIsEditing(true)
  }

  const handleTitleBlur = async () => {
    setIsEditing(false)

    // Only save if title changed
    if (title !== initialTitle && onTitleChange) {
      try {
        await onTitleChange(title)
        toast.success('campaign title updated', {
          duration: 2000,
          style: {
            background: flowCoreColours.darkGrey,
            colour: flowCoreColours.textPrimary,
            border: `1px solid ${flowCoreColours.slateCyan}`,
            fontFamily: flowCoreColours.fontMono || 'monospace',
            textTransform: 'lowercase',
          },
        })
      } catch (error) {
        console.error('[ConsoleHeader] Failed to update title:', error)
        toast.error('failed to update title', {
          duration: 3000,
          style: {
            background: flowCoreColours.darkGrey,
            colour: flowCoreColours.error,
            border: `1px solid ${flowCoreColours.error}`,
            fontFamily: flowCoreColours.fontMono || 'monospace',
            textTransform: 'lowercase',
          },
        })
        // Revert to initial title on error
        setTitle(initialTitle)
      }
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      setTitle(initialTitle)
      setIsEditing(false)
    }
  }

  // Handle save
  const handleSave = async () => {
    if (isSaving) return

    setIsSaving(true)

    try {
      if (onSave) {
        await onSave()
      }

      toast.success('campaign saved', {
        duration: 2000,
        icon: '✓',
        style: {
          background: flowCoreColours.darkGrey,
          colour: flowCoreColours.success,
          border: `1px solid ${flowCoreColours.success}`,
          fontFamily: flowCoreColours.fontMono || 'monospace',
          textTransform: 'lowercase',
        },
      })
    } catch (error) {
      console.error('[ConsoleHeader] Save failed:', error)
      toast.error('failed to save campaign', {
        duration: 3000,
        style: {
          background: flowCoreColours.darkGrey,
          colour: flowCoreColours.error,
          border: `1px solid ${flowCoreColours.error}`,
          fontFamily: flowCoreColours.fontMono || 'monospace',
          textTransform: 'lowercase',
        },
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle share (copy URL to clipboard)
  const handleShare = async () => {
    if (!campaignId) {
      toast.error('no campaign ID available', {
        duration: 2000,
        style: {
          background: flowCoreColours.darkGrey,
          colour: flowCoreColours.warning,
          border: `1px solid ${flowCoreColours.warning}`,
          fontFamily: flowCoreColours.fontMono || 'monospace',
          textTransform: 'lowercase',
        },
      })
      return
    }

    try {
      const shareUrl = `${window.location.origin}/console?campaign=${campaignId}`
      await navigator.clipboard.writeText(shareUrl)

      setIsCopied(true)
      toast.success('campaign URL copied to clipboard', {
        duration: 2000,
        icon: '✓',
        style: {
          background: flowCoreColours.darkGrey,
          colour: flowCoreColours.iceCyan,
          border: `1px solid ${flowCoreColours.iceCyan}`,
          fontFamily: flowCoreColours.fontMono || 'monospace',
          textTransform: 'lowercase',
        },
      })

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (error) {
      console.error('[ConsoleHeader] Failed to copy URL:', error)
      toast.error('failed to copy URL', {
        duration: 3000,
        style: {
          background: flowCoreColours.darkGrey,
          colour: flowCoreColours.error,
          border: `1px solid ${flowCoreColours.error}`,
          fontFamily: flowCoreColours.fontMono || 'monospace',
          textTransform: 'lowercase',
        },
      })
    }
  }

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        backgroundColor: flowCoreColours.matteBlack,
        borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
      }}
    >
      {/* Left: Editable Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            style={{
              fontSize: '20px',
              fontWeight: 600,
              colour: flowCoreColours.slateCyan,
              backgroundColor: flowCoreColours.darkGrey,
              border: `2px solid ${flowCoreColours.slateCyan}`,
              borderRadius: '6px',
              padding: '8px 12px',
              outline: 'none',
              fontFamily: 'var(--font-mono)',
              textTransform: 'lowercase',
              minWidth: '300px',
            }}
            placeholder="enter campaign title"
          />
        ) : (
          <motion.button
            onClick={handleTitleClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: flowCoreMotion.fast / 1000 }}
            style={{
              fontSize: '20px',
              fontWeight: 600,
              colour: flowCoreColours.slateCyan,
              background: 'transparent',
              border: '2px solid transparent',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              textTransform: 'lowercase',
              transition: `border-colour ${flowCoreMotion.fast}ms ${flowCoreMotion.easeStandard}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = flowCoreColours.borderGrey
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            {title}
          </motion.button>
        )}

        <span
          style={{
            fontSize: '12px',
            colour: flowCoreColours.textTertiary,
            fontFamily: 'var(--font-mono)',
            textTransform: 'lowercase',
          }}
        >
          {isEditing ? '(press enter to save, esc to cancel)' : '(click to edit)'}
        </span>
      </div>

      {/* Right: Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Save Button */}
        <motion.button
          onClick={handleSave}
          disabled={isSaving}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: flowCoreMotion.fast / 1000 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: flowCoreColours.slateCyan,
            colour: flowCoreColours.matteBlack,
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            textTransform: 'lowercase',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.6 : 1,
            transition: `opacity ${flowCoreMotion.fast}ms ${flowCoreMotion.easeStandard}`,
          }}
        >
          <AnimatePresence mode="wait">
            {isSaving ? (
              <motion.div
                key="saving"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Save className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div key="save" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Save className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
          {isSaving ? 'saving...' : 'save'}
        </motion.button>

        {/* Share Button */}
        <motion.button
          onClick={handleShare}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: flowCoreMotion.fast / 1000 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: flowCoreColours.darkGrey,
            colour: flowCoreColours.textPrimary,
            border: `1px solid ${flowCoreColours.borderGrey}`,
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            textTransform: 'lowercase',
            cursor: 'pointer',
            transition: `border-colour ${flowCoreMotion.fast}ms ${flowCoreMotion.easeStandard}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = flowCoreColours.iceCyan
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = flowCoreColours.borderGrey
          }}
        >
          <AnimatePresence mode="wait">
            {isCopied ? (
              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Check className="w-4 h-4" style={{ colour: flowCoreColours.success }} />
              </motion.div>
            ) : (
              <motion.div key="copy" initial={{ scale: 1 }} exit={{ scale: 0 }}>
                <Share2 className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
          {isCopied ? 'copied!' : 'share'}
        </motion.button>
      </div>
    </header>
  )
}
