/**
 * Coming Soon Landing Page - totalaud.io
 *
 * Vision-aligned copy (January 2026)
 * A calm, opinionated system for independent artists
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { WaitlistForm } from './WaitlistForm'

// What you'll be able to do - features teaser
const FEATURES = [
  {
    id: 'finish',
    title: 'Finishing notes',
    description: 'Get finishing notes on tracks before release',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    id: 'release',
    title: 'Release timing',
    description: 'Understand when and how your music should land',
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
    id: 'relationships',
    title: 'Relationships',
    description: 'Build real relationships without starting from zero',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'story',
    title: 'Consistent story',
    description: 'Keep your story consistent everywhere',
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

// Feature card with hover effects
function FeatureCard({ feature, index }: { feature: (typeof FEATURES)[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: 0.8 + index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '24px',
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
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
        aria-hidden="true"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {feature.icon}
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
        {feature.title}
      </span>
      <span
        style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.7)',
          position: 'relative',
          zIndex: 1,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          lineHeight: 1.5,
        }}
      >
        {feature.description}
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
      {/* Ambient spotlight gradients */}
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

      {/* Grain overlay */}
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

      {/* Header with logo */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            filter: 'drop-shadow(0 0 30px rgba(58, 169, 190, 0.3))',
          }}
        >
          <Image
            src="/brand/svg/ta-logo-cyan.svg"
            alt="totalaud.io - home"
            width={48}
            height={48}
            priority
          />
        </motion.div>
      </header>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '120px 24px 60px',
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Badge */}
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

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            fontSize: 'clamp(32px, 7vw, 56px)',
            fontWeight: 600,
            lineHeight: 1.15,
            marginBottom: '24px',
            letterSpacing: '-0.03em',
          }}
        >
          Make better releases —{' '}
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
            without guessing.
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            fontSize: 'clamp(16px, 2.5vw, 18px)',
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: 1.7,
            marginBottom: '48px',
            maxWidth: '560px',
          }}
        >
          totalaud.io is a calm, opinionated system that helps independent artists finish their
          music, understand what matters, and release with confidence.
        </motion.p>

        {/* Waitlist Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            width: '100%',
            maxWidth: '440px',
            marginBottom: '16px',
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
            Join the early list
          </p>
          <WaitlistForm />
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '16px',
            }}
          >
            No spam. Just an email when it's ready.
          </p>
        </motion.div>

        {/* Newsletter mention - secondary to waitlist */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            marginTop: '24px',
            marginBottom: '48px',
            padding: '20px 24px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            borderRadius: '12px',
            maxWidth: '440px',
            textAlign: 'left',
          }}
        >
          <p
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '8px',
            }}
          >
            Notes from building this
          </p>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: 1.6,
              marginBottom: '12px',
            }}
          >
            I write occasional notes about what I'm learning — decisions, trade-offs, and things I
            notice about music and releasing. It's the same newsletter I send from Total Audio
            Promo. One list, same notes.
          </p>
          <Link
            href="/notes"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#3AA9BE',
              textDecoration: 'none',
            }}
          >
            Read the notes →
          </Link>
        </motion.div>

        {/* Why totalaud.io exists */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            marginTop: '64px',
            marginBottom: '48px',
            maxWidth: '560px',
            textAlign: 'left',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#F7F8F9',
              marginBottom: '20px',
              letterSpacing: '-0.02em',
            }}
          >
            Why totalaud.io exists
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: 1.8,
              marginBottom: '16px',
            }}
          >
            Most music doesn't fail because it's bad.
            <br />
            It fails because no one explains what matters before release.
          </p>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1.8,
              marginBottom: '16px',
            }}
          >
            Artists are left guessing — tweaking endlessly, jumping between tools, or releasing
            without clarity.
          </p>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: 1.8,
            }}
          >
            totalaud.io exists to give artists clear, human feedback on their music, their story,
            and their release — before it goes out into the world.
          </p>
        </motion.section>

        {/* Built from experience */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            marginBottom: '48px',
            maxWidth: '560px',
            textAlign: 'left',
            padding: '24px',
            background: 'rgba(58, 169, 190, 0.05)',
            border: '1px solid rgba(58, 169, 190, 0.15)',
            borderRadius: '16px',
          }}
        >
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#3AA9BE',
              marginBottom: '12px',
              letterSpacing: '-0.01em',
            }}
          >
            Built from experience, not theory
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.7,
              marginBottom: '12px',
            }}
          >
            totalaud.io is built by someone who's been an obsessed listener, a band member, a DJ, a
            producer — and worked inside radio and music PR.
          </p>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: 1.7,
            }}
          >
            It's shaped by watching great records get ignored for reasons no one explained.
          </p>
        </motion.section>

        {/* What you'll be able to do */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            marginBottom: '48px',
            width: '100%',
            maxWidth: '680px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#F7F8F9',
              marginBottom: '24px',
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}
          >
            What you'll be able to do
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: '16px',
            }}
          >
            {FEATURES.map((feature, index) => (
              <FeatureCard key={feature.id} feature={feature} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Pricing link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
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

      {/* Footer */}
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
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: 0,
            marginBottom: '16px',
          }}
        >
          Independent by design. Built with care.
        </p>
        <nav
          aria-label="Legal"
          style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/notes"
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#3AA9BE')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
          >
            Notes
          </Link>
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
        </nav>
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
      `}</style>
    </div>
  )
}
