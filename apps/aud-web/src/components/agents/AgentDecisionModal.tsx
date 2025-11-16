/**
 * Agent Decision Modal - Phase 9
 * Modal for agent decisions requiring user input
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AgentType } from '@total-audio/timeline'

/**
 * Agent Decision Props
 */
export interface AgentDecisionProps {
  open: boolean
  onClose: () => void
  agentType: AgentType
  question: string
  options: string[]
  onDecision: (selectedOption: string) => void
  osTheme?: 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'
}

/**
 * Agent Decision Modal Component
 */
export function AgentDecisionModal({
  open,
  onClose,
  agentType,
  question,
  options,
  onDecision,
  osTheme = 'daw',
}: AgentDecisionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const agentColours: Record<AgentType, string> = {
    scout: '#4CAF50',
    coach: '#FF9800',
    tracker: '#9C27B0',
    insight: '#2196F3',
  }

  const handleDecision = () => {
    if (selectedOption) {
      onDecision(selectedOption)
      setSelectedOption(null)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 50,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '500px',
              backgroundColor: '#0F1113',
              border: `2px solid ${agentColours[agentType]}`,
              borderRadius: '12px',
              padding: '24px',
              zIndex: 51,
              boxShadow: `0 0 40px ${agentColours[agentType]}30`,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'centre',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: `${agentColours[agentType]}20`,
                  border: `2px solid ${agentColours[agentType]}`,
                  display: 'flex',
                  alignItems: 'centre',
                  justifyContent: 'centre',
                }}
              >
                <span style={{ fontSize: '16px' }}>
                  {agentType === 'scout' ? '🔍' : agentType === 'coach' ? '💡' : agentType === 'tracker' ? '📊' : '🧠'}
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 600,
                    color: agentColours[agentType],
                    textTransform: 'uppercase',
                  }}
                >
                  {agentType} Agent
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#808080',
                  }}
                >
                  Requires your decision
                </p>
              </div>
            </div>

            {/* Question */}
            <div
              style={{
                padding: '16px',
                backgroundColor: '#16181A',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #2A2D30',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#E0E0E0',
                  lineHeight: '1.5',
                }}
              >
                {question}
              </p>
            </div>

            {/* Options */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(option)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: selectedOption === option ? `${agentColours[agentType]}20` : '#16181A',
                    border: selectedOption === option ? `2px solid ${agentColours[agentType]}` : '1px solid #2A2D30',
                    borderRadius: '8px',
                    color: selectedOption === option ? agentColours[agentType] : '#B0B0B0',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 120ms ease',
                  }}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid #2A2D30',
                  borderRadius: '6px',
                  color: '#808080',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleDecision}
                disabled={!selectedOption}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedOption ? agentColours[agentType] : '#2A2D30',
                  border: 'none',
                  borderRadius: '6px',
                  color: selectedOption ? '#FFFFFF' : '#606060',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: selectedOption ? 'pointer' : 'not-allowed',
                  opacity: selectedOption ? 1 : 0.5,
                }}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
