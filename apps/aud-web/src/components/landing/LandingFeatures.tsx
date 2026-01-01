'use client'

import { motion, type MotionValue } from 'framer-motion'
import { FEATURES } from './landingData'
import { FeatureCard } from './FeatureCard'

interface LandingFeaturesProps {
  featuresY: MotionValue<number>
  featuresOpacity: MotionValue<number>
}

export function LandingFeatures({ featuresY, featuresOpacity }: LandingFeaturesProps) {
  return (
    <motion.section
      aria-labelledby="features-heading"
      style={{
        padding: '120px 24px 160px',
        maxWidth: '1100px',
        margin: '0 auto',
        y: featuresY,
        opacity: featuresOpacity,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          marginBottom: '80px',
          maxWidth: '600px',
        }}
      >
        <h2
          id="features-heading"
          style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '24px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Everything you need.
          <br />
          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Nothing you don't.</span>
        </h2>
        <p
          style={{
            fontSize: '17px',
            lineHeight: 1.7,
            color: 'rgba(255, 255, 255, 0.85)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Five focused tools that work together. No bloat, no learning curve, no per-pitch fees.
        </p>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '20px',
        }}
      >
        {FEATURES.map((feature, index) => (
          <FeatureCard key={feature.id} feature={feature} index={index} />
        ))}
      </div>
    </motion.section>
  )
}
