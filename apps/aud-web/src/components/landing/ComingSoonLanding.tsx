/**
 * Coming Soon Landing Page - totalaud.io
 *
 * Teaser style: Logo + value prop + 4 mode icons + waitlist form
 * Maintains the calm, minimal aesthetic of the main brand
 */

'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { WaitlistForm } from './WaitlistForm'

// The 4 core modes to tease
const MODES = [
  {
    id: 'ideas',
    name: 'Ideas',
    description: 'Capture inspiration',
    icon: '💡',
  },
  {
    id: 'scout',
    name: 'Scout',
    description: 'Find opportunities',
    icon: '🔍',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Plan your release',
    icon: '📅',
  },
  {
    id: 'pitch',
    name: 'Pitch',
    description: 'Craft your story',
    icon: '✍️',
  },
]

export function ComingSoonLanding() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0F1113',
        color: '#F7F8F9',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          maxWidth: '640px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '48px' }}
        >
          <Image
            src="/brand/svg/ta-logo-cyan.svg"
            alt="totalaud.io"
            width={64}
            height={64}
            priority
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: 'clamp(32px, 6vw, 48px)',
            fontWeight: 600,
            lineHeight: 1.2,
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}
        >
          Coming Soon
        </motion.h1>

        {/* Value prop */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.6,
            marginBottom: '48px',
            maxWidth: '480px',
          }}
        >
          A calm workspace for independent artists. Scout opportunities, capture ideas, plan
          releases, craft pitches — all in one place.
        </motion.p>

        {/* 4 Mode Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '48px',
            width: '100%',
            maxWidth: '480px',
          }}
        >
          {MODES.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <span style={{ fontSize: '24px' }} role="img" aria-label={mode.name}>
                {mode.icon}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#F7F8F9',
                }}
              >
                {mode.name}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  textAlign: 'center',
                }}
              >
                {mode.description}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Waitlist Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ width: '100%', maxWidth: '400px', marginBottom: '32px' }}
        >
          <WaitlistForm />
        </motion.div>

        {/* Pricing link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link
            href="/pricing"
            style={{
              fontSize: '14px',
              color: '#3AA9BE',
              textDecoration: 'none',
            }}
          >
            View pricing →
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '24px 20px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <p
          style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
            margin: 0,
          }}
        >
          Built by radio promotion veterans in the UK
        </p>
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/privacy"
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.4)',
              textDecoration: 'none',
            }}
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.4)',
              textDecoration: 'none',
            }}
          >
            Terms
          </Link>
        </div>
      </footer>
    </div>
  )
}
