'use client'

/**
 * Phase 33: Global Command Palette - Input Component
 *
 * Search input with icon and clear button.
 * British placeholder text, calm design.
 */

import { useRef, useEffect } from 'react'

interface PaletteInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export function PaletteInput({
  value,
  onChange,
  placeholder = 'Search or type a command...',
  autoFocus = true,
}: PaletteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  return (
    <div
      style={{
        position: 'relative',
        padding: '1rem',
        borderBottom: '1px solid var(--colour-border)',
      }}
    >
      {/* Search Icon */}
      <div
        style={{
          position: 'absolute',
          left: '1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          opacity: 0.5,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="9"
            cy="9"
            r="6"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M13.5 13.5L17.5 17.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.75rem 3rem 0.75rem 3rem',
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          color: 'var(--colour-foreground)',
          fontSize: '16px',
          fontWeight: '500',
        }}
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '1.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            opacity: 0.5,
            transition: 'opacity 120ms ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.5'
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 5L15 15M5 15L15 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
