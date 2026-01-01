'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { FeatureItem } from './landingData'

interface FeatureCardProps {
  feature: FeatureItem
  index: number
}

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isComingSoon = 'comingSoon' in feature && feature.comingSoon

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        padding: '40px',
        background: isHovered
          ? 'linear-gradient(135deg, rgba(58, 169, 190, 0.08) 0%, rgba(58, 169, 190, 0.02) 100%)'
          : 'rgba(255, 255, 255, 0.02)',
        border: '1px solid',
        borderColor: isHovered ? 'rgba(58, 169, 190, 0.3)' : 'rgba(255, 255, 255, 0.06)',
        borderRadius: '20px',
        cursor: 'default',
        transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
        overflow: 'hidden',
        opacity: isComingSoon ? 0.7 : 1,
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background:
            'radial-gradient(circle at center, rgba(58, 169, 190, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          fontSize: '12px',
          fontWeight: 500,
          color: isComingSoon
            ? '#3AA9BE'
            : isHovered
              ? 'rgba(58, 169, 190, 0.8)'
              : 'rgba(255, 255, 255, 0.2)',
          fontFamily: 'var(--font-geist-mono), monospace',
          transition: 'color 0.4s ease',
        }}
      >
        {isComingSoon ? 'Coming soon' : `0${index + 1}`}
      </div>

      <h3
        style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#F7F8F9',
          marginBottom: '16px',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          letterSpacing: '-0.02em',
        }}
      >
        {feature.title}
      </h3>
      <p
        style={{
          fontSize: '15px',
          lineHeight: 1.7,
          color: 'rgba(255, 255, 255, 0.85)',
          margin: 0,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        {feature.description}
      </p>
    </motion.div>
  )
}
