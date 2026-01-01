'use client'

import { motion } from 'framer-motion'
import { MagneticButton } from './MagneticButton'

export function LandingCTA() {
  return (
    <section
      aria-labelledby="cta-heading"
      style={{
        padding: '120px 24px 160px',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(58, 169, 190, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <h2
          id="cta-heading"
          style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '24px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Ready to be heard?
        </h2>
        <p
          style={{
            fontSize: '17px',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: '48px',
            maxWidth: '420px',
            margin: '0 auto 48px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Join hundreds of indie artists who've stopped hoping and started doing.
        </p>
        <MagneticButton href="/signup">Start Your Workspace</MagneticButton>
        <p
          style={{
            marginTop: '16px',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          From &pound;5/month &bull; Cancel anytime
        </p>
      </motion.div>
    </section>
  )
}
