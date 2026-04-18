/**
 * Landing Page - totalaud.io
 *
 * Vision-aligned copy (January 2026)
 * A calm, opinionated system for independent artists
 *
 * Aesthetic: Cinematic Editorial
 * Think A24 film credits meets Bloomberg design meets Ableton's restraint
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionTemplate } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { PricingPreview } from './PricingPreview'
import { SocialProof } from './SocialProof'
import { faqs } from '@/lib/seo'

// FAQ accordion for inline landing page section
function FAQAccordion({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        paddingBottom: '24px',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          width: '100%',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: 0,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
        aria-expanded={isOpen}
      >
        <span
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: 1.4,
          }}
        >
          {question}
        </span>
        <span
          style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.3)',
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          +
        </span>
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              lineHeight: 1.6,
              marginTop: '12px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            {answer}
          </p>
        </motion.div>
      )}
    </div>
  )
}

// How it works steps - Vision aligned
const HOW_IT_WORKS = [
  {
    title: 'Upload',
    detail: "Upload a track you're preparing to release.",
  },
  {
    title: 'Choose a perspective',
    detail: 'Get finishing notes from a producer, listener, mix engineer, or industry lens.',
  },
  {
    title: 'Understand what matters',
    detail: 'Honest notes on arrangement, energy, clarity, and release readiness.',
  },
  {
    title: 'Release with confidence',
    detail: 'Plan your release, tell your story once, and move forward without second-guessing.',
  },
]

// What totalaud.io helps with - Vision aligned pillars
const PILLARS = [
  {
    id: 'finish',
    title: 'A second opinion for music you care about',
    description: "Understand what's working, what could improve, and what's already good enough.",
    features: [
      'Arrangement & energy',
      'Mix translation & clarity',
      'Release readiness (not quality scoring)',
    ],
    screenshot: '/images/landing/workspace-finish.png',
    screenshotAlt: 'Finish mode showing audio upload and analysis workspace',
  },
  {
    id: 'release',
    title: 'Release as a narrative — not a checkbox',
    description: 'Plan releases over time, not as isolated drops. Think about timing and momentum.',
    features: [],
    screenshot: '/images/landing/workspace-timeline.png',
    screenshotAlt: 'Timeline mode showing visual release planning with lanes and milestones',
  },
  {
    id: 'leverage',
    title: 'Relationships, not lists',
    description:
      'Keep track of the people who matter -- playlists, press, collaborators -- with context, not spreadsheets.',
    features: [],
    screenshot: '/images/landing/workspace-scout.png',
    screenshotAlt: 'Scout mode showing BBC Introducing, Pitchfork, and other opportunity cards',
  },
  {
    id: 'pitch',
    title: 'Tell your story once — use it everywhere',
    description: 'Write your story once. Use it across pitches, bios, playlists, and socials.',
    features: [],
    screenshot: '/images/landing/workspace-pitch.png',
    screenshotAlt: 'Pitch mode showing Radio, Press, Playlist, and Custom pitch templates',
  },
]

// Magnetic button component (touch fallback - static on touch devices)
function MagneticButton({ children, href }: { children: React.ReactNode; href: string }) {
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouchDevice || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const x = (e.clientX - centerX) * 0.15
    const y = (e.clientY - centerY) * 0.15
    setPosition({ x, y })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }}
    >
      <Link href={href} ref={buttonRef} style={{ textDecoration: 'none' }}>
        <motion.div
          animate={{ x: position.x, y: position.y }}
          transition={{ type: 'spring', stiffness: 350, damping: 15, mass: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '18px 36px',
            background: 'linear-gradient(135deg, #3AA9BE 0%, #2D8A9C 100%)',
            color: '#0A0B0C',
            borderRadius: '60px',
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            cursor: 'pointer',
            boxShadow: '0 0 60px rgba(58, 169, 190, 0.3), 0 4px 20px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {children}
          <motion.span
            aria-hidden="true"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            →
          </motion.span>
        </motion.div>
      </Link>
    </motion.div>
  )
}

// Secondary button
function SecondaryButton({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 28px',
        background: 'transparent',
        color: '#F7F8F9',
        borderRadius: '60px',
        fontSize: '15px',
        fontWeight: 500,
        letterSpacing: '0.02em',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        textDecoration: 'none',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.5)'
        e.currentTarget.style.background = 'rgba(58, 169, 190, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {children}
    </Link>
  )
}

// macOS chrome screenshot card (matches TAP landing page effect)
function ScreenshotCard({ src, alt }: { src: string; alt: string }) {
  return (
    <div style={{ position: 'relative', marginTop: '24px' }}>
      {/* Cyan glow behind screenshot */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          borderRadius: '24px',
          opacity: 0.3,
          filter: 'blur(24px)',
          background:
            'radial-gradient(ellipse at center, rgba(14, 116, 144, 0.25), transparent 70%)',
        }}
      />
      <div
        style={{
          overflow: 'hidden',
          borderRadius: '12px',
          backgroundColor: 'rgba(20, 20, 24, 0.95)',
          padding: '6px',
          boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.25), 0 8px 20px -8px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Window chrome -- macOS traffic lights */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 10px',
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#ff5f57',
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#febc2e',
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#28c840',
            }}
          />
        </div>
        <Image
          src={src}
          alt={alt}
          width={800}
          height={500}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '0 0 8px 8px',
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}

// Pillar card component
function PillarCard({ pillar, index }: { pillar: (typeof PILLARS)[0]; index: number }) {
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

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Smooth scroll progress
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  // Hero section parallax and opacity
  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0])
  const heroY = useTransform(smoothProgress, [0, 0.2], [0, -100])
  const heroScale = useTransform(smoothProgress, [0, 0.15], [1, 0.95])

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0B0C',
        color: '#F7F8F9',
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
            'radial-gradient(circle at 20% 18%, rgba(58,169,190,0.14), transparent 32%), radial-gradient(circle at 80% 12%, rgba(111,200,181,0.12), transparent 30%), radial-gradient(circle at 50% 70%, rgba(58,169,190,0.08), transparent 45%)',
          filter: 'blur(12px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Sticky Navigation Header */}
      <motion.header
        role="banner"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to bottom, rgba(10, 11, 12, 0.9) 0%, transparent 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image
            src="/brand/svg/ta-logo-cyan.svg"
            alt="totalaud.io"
            width={44}
            height={44}
            priority
          />
        </Link>
        <nav
          aria-label="Main navigation"
          style={{ display: 'flex', alignItems: 'center', gap: 16 }}
        >
          <Link
            href="/login"
            aria-label="Sign in to your account"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              padding: '8px 16px',
              transition: 'color 0.2s ease',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F8F9')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            aria-label="Get started with a free account"
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#0A0B0C',
              textDecoration: 'none',
              padding: '10px 20px',
              backgroundColor: '#3AA9BE',
              borderRadius: '8px',
              transition: 'opacity 0.2s ease',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Get started
          </Link>
        </nav>
      </motion.header>

      {/* Grain overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      />

      {/* Main content area */}
      <main>
        {/* Hero Section */}
        <motion.section
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            position: 'relative',
            opacity: heroOpacity,
            y: heroY,
            scale: heroScale,
          }}
        >
          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(58, 169, 190, 0.1)',
              border: '1px solid rgba(58, 169, 190, 0.2)',
              borderRadius: '100px',
              marginBottom: '48px',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#3AA9BE',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                letterSpacing: '0.02em',
              }}
            >
              New: Finish mode -- master-ready audio in minutes
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              fontSize: 'clamp(40px, 8vw, 80px)',
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              textAlign: 'center',
              marginBottom: '32px',
              maxWidth: '900px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Finish better.{' '}
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
              Release smarter.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.85)',
              textAlign: 'center',
              marginBottom: '56px',
              maxWidth: '560px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Clear feedback on your music. Releases that make sense. Less guessing.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'center',
            }}
          >
            <MagneticButton href="/signup">Upload a track</MagneticButton>
            <SecondaryButton href="#how-it-works">See how it works</SecondaryButton>
          </motion.div>

          {/* Secondary options */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              marginTop: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Already have an account?{' '}
              <Link
                href="/login"
                style={{
                  color: '#3AA9BE',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Sign in
              </Link>
            </span>
          </motion.div>
        </motion.section>

        {/* Hero screenshot -- overlaps into next section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '1024px',
            margin: '-80px auto 0',
            padding: '0 24px',
          }}
        >
          {/* Cyan glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: -1,
              borderRadius: '24px',
              opacity: 0.4,
              filter: 'blur(48px)',
              background:
                'radial-gradient(ellipse at center, rgba(14, 116, 144, 0.3), transparent 70%)',
            }}
          />
          <div
            style={{
              overflow: 'hidden',
              borderRadius: '16px',
              backgroundColor: 'rgba(20, 20, 24, 0.95)',
              padding: '8px',
              boxShadow:
                '0 32px 64px -12px rgba(0, 0, 0, 0.35), 0 16px 32px -8px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* macOS traffic lights */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 12px',
              }}
            >
              <span
                style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f57' }}
              />
              <span
                style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#febc2e' }}
              />
              <span
                style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28c840' }}
              />
            </div>
            <Image
              src="/images/landing/workspace-scout.png"
              alt="totalaud.io workspace showing Scout mode with BBC Introducing, Pitchfork, and playlist opportunities"
              width={1440}
              height={900}
              style={{ width: '100%', height: 'auto', borderRadius: '10px', display: 'block' }}
              priority
            />
          </div>
        </motion.div>

        {/* Problem statement section */}
        <section
          style={{
            padding: '120px 24px',
            textAlign: 'center',
            maxWidth: '700px',
            margin: '0 auto',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h2
              style={{
                fontSize: 'clamp(28px, 5vw, 40px)',
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: '-0.03em',
                marginBottom: '32px',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Most artists don't need more tools
            </h2>
            <p
              style={{
                fontSize: '20px',
                fontWeight: 500,
                color: '#3AA9BE',
                marginBottom: '24px',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              They need clarity.
            </p>
            <p
              style={{
                fontSize: '17px',
                lineHeight: 1.8,
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '24px',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Most music doesn't fail because it's bad. It fails because nobody said anything useful
              before release.
            </p>
            <p
              style={{
                fontSize: '17px',
                lineHeight: 1.8,
                color: 'rgba(255, 255, 255, 0.85)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              totalaud.io helps you decide what to fix, what to leave alone, and when your music is
              ready.
            </p>
          </motion.div>
        </section>

        {/* How it works section */}
        <motion.section
          id="how-it-works"
          aria-labelledby="how-it-works-heading"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            padding: '80px 24px',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          <h2
            id="how-it-works-heading"
            style={{
              fontSize: 'clamp(28px, 5vw, 36px)',
              fontWeight: 600,
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              marginBottom: '48px',
              textAlign: 'center',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            How it works
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: '24px',
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
                  delay: i * 0.1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                style={{
                  padding: '24px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.1 + 0.1,
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
                    marginBottom: '16px',
                  }}
                >
                  0{i + 1}
                </motion.div>
                <div
                  style={{
                    fontSize: 16,
                    color: '#EAECEE',
                    fontWeight: 600,
                    marginBottom: 8,
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
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {item.detail}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Pillars Section */}
        <section
          aria-labelledby="pillars-heading"
          style={{
            padding: '80px 24px 120px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'grid', gap: '24px' }}>
            {PILLARS.map((pillar, index) => (
              <PillarCard key={pillar.id} pillar={pillar} index={index} />
            ))}
          </div>
        </section>

        {/* Social Proof Section */}
        <SocialProof />

        {/* Pricing Preview Section */}
        <PricingPreview />

        {/* Founder credibility section */}
        <section
          style={{
            padding: '80px 24px 100px',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '32px',
            }}
          >
            {/* Founder photo */}
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(58, 169, 190, 0.3)',
                flexShrink: 0,
              }}
            >
              <Image
                src="/images/chris-founder.jpg"
                alt="Chris Schofield, founder of totalaud.io"
                width={96}
                height={96}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>

            {/* Quote + bio */}
            <div style={{ textAlign: 'center', maxWidth: '560px' }}>
              <p
                style={{
                  fontSize: '17px',
                  lineHeight: 1.8,
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  fontStyle: 'italic',
                  marginBottom: '24px',
                }}
              >
                I run a radio promotion agency. totalaud.io is the tool I wished my artists had
                before they came to me.
              </p>
              <p
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  marginBottom: '8px',
                }}
              >
                Chris Schofield
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  lineHeight: 1.6,
                }}
              >
                5+ years in radio promotion. Ran campaigns across BBC Radio 1, 6 Music, and Global.
                Built totalaud.io because the tools I needed didn&apos;t exist.
              </p>
            </div>
          </motion.div>
        </section>

        {/* FAQ Section - Compact inline, links to full /faq page */}
        <section
          aria-labelledby="faq-heading"
          style={{
            padding: '80px 24px',
            maxWidth: '640px',
            margin: '0 auto',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h2
              id="faq-heading"
              style={{
                fontSize: 'clamp(22px, 3vw, 28px)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                marginBottom: '32px',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Common questions
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {faqs.slice(0, 4).map((faq, i) => (
                <FAQAccordion key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>

            <Link
              href="/faq"
              style={{
                display: 'inline-block',
                marginTop: '24px',
                fontSize: '13px',
                color: '#3AA9BE',
                textDecoration: 'none',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              View all questions
            </Link>
          </motion.div>
        </section>

        {/* Bottom CTA Section */}
        <section
          aria-labelledby="cta-heading"
          style={{
            padding: '120px 24px 160px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Background glow */}
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
              Stop guessing.
            </h2>
            <p
              style={{
                fontSize: '20px',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.85)',
                marginBottom: '48px',
                maxWidth: '480px',
                margin: '0 auto 48px',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Know your music is ready before you put it out.
            </p>
            <MagneticButton href="/signup">Get started</MagneticButton>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer
        role="contentinfo"
        style={{
          padding: '40px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <Image
              src="/brand/svg/totalaud-wordmark-cyan.svg"
              alt="totalaud.io"
              width={100}
              height={24}
              style={{ opacity: 0.7 }}
            />
            <span
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.6)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Independent by design.
            </span>
          </div>
          <nav
            aria-label="Footer navigation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <Link
              href="/privacy"
              aria-label="Privacy policy"
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '0 4px',
              }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              aria-label="Terms of service"
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '0 4px',
              }}
            >
              Terms
            </Link>
            <Link
              href="/faq"
              aria-label="Frequently asked questions"
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '0 4px',
              }}
            >
              FAQ
            </Link>
            <span
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              © {new Date().getFullYear()}
            </span>
          </nav>
        </div>
        <p
          style={{
            maxWidth: '1100px',
            margin: '16px auto 0',
            textAlign: 'center',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Need professional PR?{' '}
          <a
            href="https://totalaudiopromo.com"
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}
          >
            Total Audio Promo
          </a>{' '}
          helps agencies run campaigns.
        </p>
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
