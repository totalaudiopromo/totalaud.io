/**
 * SocialProof Component
 *
 * Displays trust indicators and social proof for landing page.
 * Shows stats about users, features, and credibility markers.
 */

'use client'

import { motion } from 'framer-motion'

const STATS = [
  {
    value: '500+',
    label: 'Artists using totalaud',
    icon: '◉',
  },
  {
    value: '2,000+',
    label: 'Opportunities discovered',
    icon: '◎',
  },
  {
    value: '5 years',
    label: 'Radio promotion expertise',
    icon: '◈',
  },
]

const TRUST_BADGES = ['Built by radio promotion veterans', 'GDPR compliant', 'UK-based']

export function SocialProof() {
  return (
    <section
      style={{
        padding: '80px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        background: 'rgba(58, 169, 190, 0.02)',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {/* Stats grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    color: '#3AA9BE',
                  }}
                >
                  {stat.icon}
                </span>
                <span
                  style={{
                    fontSize: 'clamp(28px, 4vw, 36px)',
                    fontWeight: 600,
                    color: '#F7F8F9',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {stat.value}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.45)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '100px',
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              <span style={{ color: '#3AA9BE', fontSize: '8px' }}>●</span>
              {badge}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
