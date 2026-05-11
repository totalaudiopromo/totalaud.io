'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export function FAQAccordion({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        paddingBottom: '24px',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          width: '100%',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: 0,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
        aria-expanded={isOpen}
      >
        <span
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: 1.4,
          }}
        >
          {question}
        </span>
        <span
          style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.3)',
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          +
        </span>
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              lineHeight: 1.6,
              marginTop: '12px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            {answer}
          </p>
        </motion.div>
      )}
    </div>
  )
}
