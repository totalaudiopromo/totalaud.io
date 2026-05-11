'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ScreenshotCard } from './ScreenshotCard'
import type { Pillar } from './landing-content'

// Pillar card component
export function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

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
      }}
    >
      {/* Hover glow effect */}
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

      <h3
        style={{
          fontSize: '22px',
          fontWeight: 600,
          color: '#F7F8F9',
          marginBottom: '16px',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          letterSpacing: '-0.02em',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {pillar.title}
      </h3>
      <p
        style={{
          fontSize: '15px',
          lineHeight: 1.7,
          color: 'rgba(255, 255, 255, 0.8)',
          margin: 0,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {pillar.description}
      </p>
      {pillar.features.length > 0 && (
        <ul
          style={{
            marginTop: '20px',
            paddingLeft: '0',
            listStyle: 'none',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {pillar.features.map((feature) => (
            <li
              key={feature}
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              <span style={{ color: '#3AA9BE' }}>•</span>
              {feature}
            </li>
          ))}
        </ul>
      )}
      {pillar.screenshot && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <ScreenshotCard src={pillar.screenshot} alt={pillar.screenshotAlt} />
        </div>
      )}
    </motion.div>
  )
}
