'use client'

/**
 * Theme Demo Page
 * UI Style Guide v1.0 - Component Showcase
 *
 * Tests all design system tokens and component patterns
 */

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ThemeDemoPage() {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'motion' | 'components'>('colors')

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-primary)',
      padding: 'var(--space-5)',
    }}>
      {/* Header */}
      <header style={{ marginBottom: 'var(--space-5)' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 600,
          marginBottom: 'var(--space-2)',
          fontFamily: 'var(--font-geist)',
        }}>
          UI Style Guide v1.0
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          Cursor-Inspired Minimal Design System
        </p>
      </header>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
        borderBottom: `1px solid var(--border)`,
        paddingBottom: 'var(--space-3)',
      }}>
        {(['colors', 'typography', 'spacing', 'motion', 'components'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              background: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? '#000' : 'var(--text-secondary)',
              border: `1px solid ${activeTab === tab ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all var(--motion-fast)',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
      >
        {activeTab === 'colors' && <ColorsSection />}
        {activeTab === 'typography' && <TypographySection />}
        {activeTab === 'spacing' && <SpacingSection />}
        {activeTab === 'motion' && <MotionSection />}
        {activeTab === 'components' && <ComponentsSection />}
      </motion.div>
    </div>
  )
}

function ColorsSection() {
  const colors = [
    { name: '--bg', label: 'Background', hex: '#0F1113' },
    { name: '--surface', label: 'Surface', hex: '#1A1C1F' },
    { name: '--text-primary', label: 'Text Primary', hex: '#EAECEE' },
    { name: '--text-secondary', label: 'Text Secondary', hex: '#A0A4A8' },
    { name: '--accent', label: 'Accent (Slate Cyan)', hex: '#3AA9BE', note: 'Professional, calm, creative-tech' },
    { name: '--accent-alt', label: 'Accent Alt (Hover)', hex: '#6FC8B5', note: 'Gentle depth (updated)' },
    { name: '--accent-warm', label: 'Accent Warm', hex: '#D4A574' },
    { name: '--border', label: 'Border', hex: '#2C2F33' },
    { name: '--success', label: 'Success (Mint)', hex: '#63C69C', note: 'Matches cyan family (updated)' },
    { name: '--error', label: 'Error', hex: '#FF6B6B' },
    { name: '--warning', label: 'Warning', hex: '#FFC857' },
  ]

  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 600,
        marginBottom: 'var(--space-4)',
        fontFamily: 'var(--font-geist)',
      }}>
        Color Palette
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--space-3)',
      }}>
        {colors.map((color) => (
          <div
            key={color.name}
            style={{
              background: 'var(--surface)',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '80px',
                background: `var(${color.name})`,
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-2)',
                border: color.name.includes('bg') || color.name.includes('surface')
                  ? `1px solid var(--border)`
                  : 'none',
              }}
            />
            <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: 'var(--space-1)' }}>
              {color.label}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {color.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {color.hex}
            </div>
            {color.note && (
              <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: 'var(--space-1)', fontStyle: 'italic' }}>
                {color.note}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function TypographySection() {
  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 600,
        marginBottom: 'var(--space-4)',
        fontFamily: 'var(--font-geist)',
      }}>
        Typography
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Display */}
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
            Display / Headings (Geist Sans SemiBold, 20-28px)
          </h3>
          <div style={{ fontFamily: 'var(--font-geist)', fontSize: '28px', fontWeight: 600, lineHeight: 1.3 }}>
            Build with confidence
          </div>
        </div>

        {/* Primary/UI */}
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
            Primary / UI (Geist Sans / Inter, 14-18px)
          </h3>
          <div style={{ fontFamily: 'var(--font-geist)', fontSize: '16px', fontWeight: 400, lineHeight: 1.5 }}>
            This is primary UI text. Clean, geometric, and easy to read at small sizes.
          </div>
        </div>

        {/* Body */}
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
            Body / Paragraphs (Inter, 15-16px)
          </h3>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '16px', lineHeight: 1.7, maxWidth: '600px' }}>
            Body text provides excellent legibility at reading sizes. Inter is specifically designed for screen interfaces with generous spacing and clear letterforms. It maintains clarity even at small sizes while remaining comfortable for longer reading sessions.
          </div>
        </div>

        {/* Mono */}
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
            Mono / Code / Metrics (Geist Mono / IBM Plex Mono, 13-14px)
          </h3>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', lineHeight: 1.5 }}>
            const theme = {'{'} accent: '#3AE1C2', motion: '120ms' {'}'}
          </div>
        </div>
      </div>
    </div>
  )
}

function SpacingSection() {
  const spacings = [
    { name: '--space-1', value: '4px', label: 'Micro padding' },
    { name: '--space-2', value: '8px', label: 'Base grid unit' },
    { name: '--space-3', value: '16px', label: 'Compact gaps' },
    { name: '--space-4', value: '24px', label: 'Medium gaps' },
    { name: '--space-5', value: '32px', label: 'Large section gaps' },
  ]

  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 600,
        marginBottom: 'var(--space-4)',
        fontFamily: 'var(--font-geist)',
      }}>
        Spacing (8px rhythm)
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {spacings.map((spacing) => (
          <div key={spacing.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: spacing.value,
                height: '40px',
                background: 'var(--accent)',
                borderRadius: 'var(--radius-sm)',
              }}
            />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{spacing.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {spacing.name} — {spacing.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MotionSection() {
  const [isAnimating, setIsAnimating] = useState(false)

  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 600,
        marginBottom: 'var(--space-4)',
        fontFamily: 'var(--font-geist)',
      }}>
        Motion System
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Fast */}
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
            Fast (120ms) — Button hover, micro feedback
          </h3>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: 'var(--accent)',
              color: '#000',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Hover me (120ms)
          </motion.div>
        </div>

        {/* Normal */}
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
            Normal (240ms) — Pane transitions
          </h3>
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            style={{
              padding: '8px 16px',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: 'var(--space-3)',
            }}
          >
            Toggle Animation
          </button>
          <motion.div
            animate={{ x: isAnimating ? 100 : 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '80px',
              height: '80px',
              background: 'var(--accent)',
              borderRadius: 'var(--radius-md)',
            }}
          />
        </div>

        {/* Slow */}
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
            Slow (400ms) — Calm fades, modals
          </h3>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              padding: 'var(--space-4)',
              background: 'var(--surface)',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
            }}
          >
            This faded in over 400ms
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function ComponentsSection() {
  const [showModal, setShowModal] = useState(false)
  const [inputValue, setInputValue] = useState('')

  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 600,
        marginBottom: 'var(--space-4)',
        fontFamily: 'var(--font-geist)',
      }}>
        Component Standards
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Buttons */}
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
            Buttons (32px height, inner glow for depth, 4px radius)
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <button style={{
              height: '32px',
              padding: '0 16px',
              background: 'var(--accent)',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--motion-fast)',
              boxShadow: 'var(--button-inner-glow)',
            }}>
              Primary Button
            </button>
            <button style={{
              height: '32px',
              padding: '0 16px',
              background: 'transparent',
              color: 'var(--text-primary)',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--motion-fast)',
            }}>
              Secondary Button
            </button>
            <button style={{
              height: '32px',
              padding: '0 16px',
              background: 'var(--error)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--motion-fast)',
            }}>
              Danger Button
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
            Input (36px height, 1px border, focus ring accent @ 50% opacity)
          </h3>
          <input
            type="text"
            placeholder="Enter text..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              height: '36px',
              padding: '0 12px',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              border: `1px solid var(--border)`,
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              width: '300px',
              outline: 'none',
              transition: 'all var(--motion-fast)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent)'
              e.target.style.boxShadow = '0 0 0 3px rgba(58, 225, 194, 0.2)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Cards */}
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
            Card / Panel (8px radius, shadow 0 2px 8px rgba(0,0,0,0.2))
          </h3>
          <div style={{
            background: 'var(--surface)',
            border: `1px solid var(--border)`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            maxWidth: '400px',
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              Card Title
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Cards contain content and actions about a single subject. They use subtle shadows for depth.
            </p>
          </div>
        </div>

        {/* Modal */}
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
            Modal (Fade/scale 240ms, blurred backdrop 6px)
          </h3>
          <button
            onClick={() => setShowModal(true)}
            style={{
              height: '32px',
              padding: '0 16px',
              background: 'var(--accent)',
              color: '#000',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Show Modal
          </button>

          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: 'var(--surface)',
                  border: `1px solid var(--border)`,
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  maxWidth: '400px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                  Modal Title
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
                  Modals use backdrop blur and scale animation for smooth entry.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    height: '32px',
                    padding: '0 16px',
                    background: 'var(--accent)',
                    color: '#000',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Close Modal
                </button>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Tooltip */}
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
            Tooltip (12px text, 6px × 8px padding, 0.95 opacity background)
          </h3>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              style={{
                height: '32px',
                padding: '0 16px',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                border: `1px solid var(--border)`,
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                const tooltip = e.currentTarget.querySelector('.tooltip') as HTMLElement
                if (tooltip) tooltip.style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                const tooltip = e.currentTarget.querySelector('.tooltip') as HTMLElement
                if (tooltip) tooltip.style.opacity = '0'
              }}
            >
              Hover for tooltip
              <div
                className="tooltip"
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '8px',
                  padding: '6px 8px',
                  background: 'rgba(26, 28, 31, 0.95)',
                  border: `1px solid var(--border)`,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  pointerEvents: 'none',
                  transition: 'opacity var(--motion-fast)',
                }}
              >
                This is a tooltip
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
