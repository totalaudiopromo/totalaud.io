/**
 * Coming Soon Landing Page - totalaud.io
 *
 * Premium teaser with the same cinematic quality as the main landing page.
 * Features: ambient gradients, grain texture, animated headline, hover effects.
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { WaitlistForm } from './WaitlistForm'

// The 4 core modes to tease
const MODES = [
  {
    id: 'ideas',
    name: 'Ideas',
    description: 'Capture fleeting inspiration',
    icon: (
      <svg
        width="28"
        height="28"
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
    description: 'Find the right ears',
    icon: (
      <svg
        width="28"
        height="28"
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
    icon: (
      <svg
        width="28"
        height="28"
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
    icon: (
      <svg
        width="28"
        height="28"
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

// Mode card with hover effects
function ModeCard({ mode, index }: { mode: (typeof MODES)[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: 0.5 + index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '24px 16px',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: isHovered ? 'rgba(58, 169, 190, 0.3)' : 'rgba(255, 255, 255, 0.06)',
        background: isHovered
          ? 'linear-gradient(135deg, rgba(58, 169, 190, 0.08) 0%, rgba(58, 169, 190, 0.02) 100%)'
          : 'rgba(255, 255, 255, 0.02)',
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
            'radial-gradient(circle at center, rgba(58, 169, 190, 0.12) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      <motion.span
        animate={{
          color: isHovered ? '#56BFD4' : '#3AA9BE',
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
        aria-hidden="true"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {mode.icon}
      </motion.span>
      <span
        style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#F7F8F9',
          position: 'relative',
          zIndex: 1,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        {mode.name}
      </span>
      <span
        style={{
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.6)',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          lineHeight: 1.4,
        }}
      >
        {mode.description}
      </span>
    </motion.div>
  )
}

export function ComingSoonLanding() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0B0C',
        color: '#F7F8F9',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Ambient spotlight gradients - matching main landing */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(circle at 30% 20%, rgba(58,169,190,0.15), transparent 40%), radial-gradient(circle at 70% 80%, rgba(111,200,181,0.1), transparent 35%), radial-gradient(circle at 50% 50%, rgba(58,169,190,0.06), transparent 50%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Grain overlay - matching main landing */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      />

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 24px',
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo with glow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            marginBottom: '40px',
            filter: 'drop-shadow(0 0 30px rgba(58, 169, 190, 0.3))',
          }}
        >
          <Image
            src="/brand/svg/ta-logo-cyan.svg"
            alt="totalaud.io"
            width={72}
            height={72}
            priority
          />
        </motion.div>

        {/* Badge - matching main landing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(58, 169, 190, 0.1)',
            border: '1px solid rgba(58, 169, 190, 0.2)',
            borderRadius: '100px',
            marginBottom: '32px',
          }}
        >
          <motion.span
            animate={{
              boxShadow: [
                '0 0 10px rgba(58, 169, 190, 0.8)',
                '0 0 20px rgba(58, 169, 190, 1)',
                '0 0 10px rgba(58, 169, 190, 0.8)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#3AA9BE',
            }}
          />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#3AA9BE',
              letterSpacing: '0.02em',
            }}
          >
            For independent artists
          </span>
        </motion.div>

        {/* Headline with animated gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            fontSize: 'clamp(40px, 8vw, 72px)',
            fontWeight: 600,
            lineHeight: 1.1,
            marginBottom: '24px',
            letterSpacing: '-0.04em',
          }}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #3AA9BE 0%, #56BFD4 50%, #3AA9BE 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 4s ease infinite',
            }}
          >
            Coming Soon
          </span>
        </motion.h1>

        {/* Value prop - enhanced */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: 1.7,
            marginBottom: '56px',
            maxWidth: '520px',
          }}
        >
          A calm workspace for independent artists.
          <br />
          <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Scout opportunities. Capture ideas. Plan releases. Craft pitches.
          </span>
        </motion.p>

        {/* 4 Mode Cards with hover effects */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '56px',
            width: '100%',
            maxWidth: '520px',
          }}
          className="sm:grid-cols-4"
        >
          {MODES.map((mode, index) => (
            <ModeCard key={mode.id} mode={mode} index={index} />
          ))}
        </motion.div>

        {/* Waitlist Form - enhanced container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            width: '100%',
            maxWidth: '440px',
            marginBottom: '40px',
            padding: '32px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '20px',
          }}
        >
          <p
            style={{
              fontSize: '15px',
              fontWeight: 500,
              color: '#F7F8F9',
              marginBottom: '20px',
            }}
          >
            Get early access
          </p>
          <WaitlistForm />
        </motion.div>

        {/* Pricing link with arrow animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Link
            href="/pricing"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '15px',
              fontWeight: 500,
              color: '#3AA9BE',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(58, 169, 190, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            View pricing
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </main>

      {/* Footer - enhanced */}
      <footer
        style={{
          padding: '32px 24px',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.5)',
            margin: 0,
            marginBottom: '16px',
          }}
        >
          Built by radio promotion veterans in the UK
        </p>
        <div
          style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/privacy"
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#3AA9BE')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#3AA9BE')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
          >
            Terms
          </Link>
        </div>
      </footer>

      {/* Global styles for gradient animation */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @media (min-width: 640px) {
          .sm\\:grid-cols-4 {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </div>
  )
}
