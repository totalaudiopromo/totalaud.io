/**
 * FeatureCard Component
 * 2025 Brand Pivot - Minimal feature cards
 *
 * Design: Subtle, not colour-coded
 * - 1px border only
 * - No decorative elements
 */

'use client'

import { motion } from 'framer-motion'

interface FeatureCardProps {
  title: string
  description: string
  index: number
}

export function FeatureCard({ title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 * index }}
      style={{
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
      }}
    >
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#F7F8F9',
          marginBottom: '12px',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'rgba(255, 255, 255, 0.5)',
          margin: 0,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        {description}
      </p>
    </motion.div>
  )
}
