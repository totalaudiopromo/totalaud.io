'use client'

import { motion } from 'framer-motion'
import { HOW_IT_WORKS } from './landingData'

export function LandingHowItWorks() {
  return (
    <motion.section
      aria-labelledby="how-it-works-heading"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        padding: '64px 24px 40px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >
      <h2 id="how-it-works-heading" className="sr-only">
        How it works
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          padding: '16px',
        }}
      >
        {HOW_IT_WORKS.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.5,
              delay: i * 0.15,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '12px',
              alignItems: 'start',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: i * 0.15 + 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'rgba(58,169,190,0.12)',
                border: '1px solid rgba(58,169,190,0.25)',
                display: 'grid',
                placeItems: 'center',
                color: '#3AA9BE',
                fontWeight: 600,
                fontSize: 14,
                fontFamily: 'var(--font-geist-mono), monospace',
              }}
            >
              0{i + 1}
            </motion.div>
            <div>
              <div
                style={{
                  fontSize: 16,
                  color: '#EAECEE',
                  fontWeight: 600,
                  marginBottom: 6,
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  letterSpacing: '-0.01em',
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.9)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {item.detail}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
