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

// The 4 core modes to tease - using simple SVG icons for calm aesthetic
const MODES = [
  {
    id: 'ideas',
    name: 'Ideas',
    description: 'Capture inspiration',
    // Lightbulb icon
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M9 21h6M12 3a6 6 0 0 0-6 6c0 2.22 1.21 4.16 3 5.19V17a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2.81c1.79-1.03 3-2.97 3-5.19a6 6 0 0 0-6-6z" />
      </svg>
    ),
  },
  {
    id: 'scout',
    name: 'Scout',
    description: 'Find opportunities',
    // Search/magnifying glass icon
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Plan your release',
    // Calendar icon
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    id: 'pitch',
    name: 'Pitch',
    description: 'Craft your story',
    // Pen/edit icon
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    ),
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

        {/* 4 Mode Icons - Mobile-first: 2 cols on small screens, 4 on sm+ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 w-full max-w-[480px]"
        >
          {MODES.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              className="flex flex-col items-center gap-2 px-2 py-4 rounded-xl border border-white/[0.06] bg-white/[0.03]"
            >
              <span className="text-[#3AA9BE]" aria-hidden="true">
                {mode.icon}
              </span>
              <span className="text-[13px] font-medium text-[#F7F8F9]">{mode.name}</span>
              <span className="text-[11px] text-white/50 text-center">{mode.description}</span>
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
