'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Database, Mic, BarChart3 } from 'lucide-react'
import { playSound } from '@aud-web/tokens/sounds'

export type Tool = 'intel' | 'pitch' | 'tracker'

interface ToolSwitcherProps {
  activeTool: Tool
  onToolChange: (tool: Tool) => void
  muted?: boolean
}

const TOOLS = [
  {
    id: 'intel' as Tool,
    name: 'Intel',
    icon: Database,
    description: 'Contact research & enrichment',
  },
  {
    id: 'pitch' as Tool,
    name: 'Pitch',
    icon: Mic,
    description: 'Campaign generation',
  },
  {
    id: 'tracker' as Tool,
    name: 'Tracker',
    icon: BarChart3,
    description: 'Analytics & insights',
  },
]

/**
 * ToolSwitcher - Tool navigation component
 *
 * Design Principles:
 * - Slate Cyan (#3AA9BE) active indicator
 * - 120ms spring hover animation (fast)
 * - Sharp 2px borders
 * - Minimal, cinematic aesthetic
 */
export function ToolSwitcher({ activeTool, onToolChange, muted = false }: ToolSwitcherProps) {
  const prefersReducedMotion = useReducedMotion()

  const handleToolClick = (tool: Tool) => {
    if (tool === activeTool) return

    // Play tool switch sound
    if (!muted) {
      playSound('task-armed', { volume: 0.1 })
    }

    onToolChange(tool)
  }

  return (
    <div
      className="tool-switcher"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '1rem',
        background: '#1A1C1F', // Surface
        border: '2px solid rgba(58, 169, 190, 0.25)',
        borderRadius: 0, // Sharp edges
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#A0A4A8', // Text secondary
          marginBottom: '0.5rem',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        Tools
      </div>

      {/* Tool buttons */}
      {TOOLS.map((tool) => {
        const Icon = tool.icon
        const isActive = tool.id === activeTool

        return (
          <motion.button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className="tool-button"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              background: isActive ? 'rgba(58, 169, 190, 0.1)' : 'transparent',
              border: `2px solid ${isActive ? 'rgba(58, 169, 190, 0.4)' : 'transparent'}`,
              borderLeft: isActive ? '3px solid #3AA9BE' : '3px solid transparent',
              borderRadius: 0, // Sharp edges
              color: isActive ? '#3AA9BE' : '#A0A4A8',
              cursor: isActive ? 'default' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: isActive ? 500 : 400,
              letterSpacing: '0.3px',
              textAlign: 'left',
              transition: 'none', // Framer Motion handles transitions
            }}
            whileHover={
              !isActive && !prefersReducedMotion
                ? {
                    x: 4,
                    backgroundColor: 'rgba(58, 169, 190, 0.05)',
                    borderColor: 'rgba(58, 169, 190, 0.2)',
                    color: '#EAECEE',
                  }
                : {}
            }
            whileTap={!isActive ? { scale: 0.98 } : {}}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              duration: 0.12, // 120ms - fast
            }}
          >
            {/* Icon */}
            <Icon
              size={18}
              style={{
                flexShrink: 0,
                opacity: isActive ? 1 : 0.6,
              }}
            />

            {/* Tool info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 500 : 400,
                  marginBottom: '0.125rem',
                }}
              >
                {tool.name}
              </div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  color: '#7A7E82', // Darker text secondary
                  letterSpacing: '0.2px',
                }}
              >
                {tool.description}
              </div>
            </div>

            {/* Active indicator glow */}
            {isActive && !prefersReducedMotion && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at center, rgba(58, 169, 190, 0.05) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
