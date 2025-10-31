/**
 * Editable Title Component
 *
 * Inline editable campaign title with keyboard + hover UX.
 * Phase 12.3.5: Console UX & Visual Fixes
 *
 * Features:
 * - Click to edit (focus input)
 * - Escape to cancel
 * - Enter or blur to save
 * - Uses CSS variables for console theme compatibility
 */

'use client'

import { useState, useRef, useEffect, KeyboardEvent, FocusEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface EditableTitleProps {
  /** Initial title value */
  value: string
  /** Callback when title changes */
  onChange: (newTitle: string) => void
  /** Placeholder when empty */
  placeholder?: string
  /** Maximum character length */
  maxLength?: number
  /** Font size (CSS value) */
  fontSize?: string
  /** Font weight */
  fontWeight?: number | string
}

/**
 * EditableTitle - Click-to-edit campaign title
 *
 * @example
 * ```tsx
 * <EditableTitle
 *   value={campaignName}
 *   onChange={(newName) => setCampaignName(newName)}
 *   placeholder="Untitled Campaign"
 * />
 * ```
 */
export function EditableTitle({
  value,
  onChange,
  placeholder = 'Untitled Campaign',
  maxLength = 80,
  fontSize = '16px',
  fontWeight = 400,
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isHovered, setIsHovered] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Sync external value changes
  useEffect(() => {
    setEditValue(value)
  }, [value])

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    const trimmedValue = editValue.trim()
    if (trimmedValue && trimmedValue !== value) {
      onChange(trimmedValue)
    } else if (!trimmedValue) {
      // Reset to placeholder if empty
      setEditValue(value || placeholder)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    handleSave()
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        minWidth: '150px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.input
            key="input"
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            maxLength={maxLength}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              fontSize,
              fontWeight,
              color: 'var(--text-primary)',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--accent)',
              borderRadius: '4px',
              padding: '4px 8px',
              outline: 'none',
              width: '100%',
              fontFamily: 'inherit',
              letterSpacing: '0',
            }}
          />
        ) : (
          <motion.button
            key="display"
            onClick={handleStartEdit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              fontSize,
              fontWeight,
              color: isHovered ? 'var(--accent)' : 'var(--text-secondary)',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0',
              transition: 'color 0.15s ease',
              textAlign: 'left',
              width: '100%',
            }}
            title="Click to edit campaign name"
          >
            {value || placeholder}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Edit Icon Hint (shown on hover when not editing) */}
      {isHovered && !isEditing && (
        <motion.div
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 0.5, x: 0 }}
          exit={{ opacity: 0, x: -4 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            right: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </motion.div>
      )}
    </div>
  )
}
