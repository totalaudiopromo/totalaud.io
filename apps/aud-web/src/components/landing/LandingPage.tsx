/**
 * Landing Page - totalaud.io
 *
 * Aesthetic: Cinematic Editorial
 * Think A24 film credits meets Bloomberg design meets Ableton's restraint
 *
 * The "holy shit" moment: Scroll-triggered typography transformation
 * with a living network visualization
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { PricingPreview } from './PricingPreview'
import { SocialProof } from './SocialProof'

// Feature data
const FEATURES = [
  {
    id: 'scout',
    title: 'Scout',
    description:
      'Find the right ears. Radio pluggers, playlist curators, music supervisors — all in one searchable database.',
  },
  {
    id: 'ideas',
    title: 'Ideas',
    description:
      'Capture fleeting inspiration. An infinite canvas where release concepts take shape.',
  },
  {
    id: 'timeline',
    title: 'Timeline',
    description:
      'See your release unfold. Drag clips across five lanes: Planning, Creative, Release, Promo, Analysis.',
  },
  {
    id: 'pitch',
    title: 'Pitch',
    description: 'Tell your story. AI-assisted pitch crafting that sounds like you, not a robot.',
  },
  {
    id: 'finish',
    title: 'Finish',
    description:
      'Polish your track. Upload, separate stems, detect structure, arrange — all in your browser.',
  },
]

const HOW_IT_WORKS = [
  {
    title: 'Scout contacts',
    detail: 'Find radio pluggers, playlist curators, and press contacts who fit your sound.',
  },
  {
    title: 'Plan your timeline',
    detail: 'Map out your release campaign with actions across promo, content, and outreach.',
  },
  {
    title: 'Craft your pitch',
    detail: 'Write compelling pitches with AI coaching that understands the music industry.',
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

// Feature card with hover reveal
function FeatureCard({ feature, index }: { feature: (typeof FEATURES)[0]; index: number }) {
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

      {/* Number indicator */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          fontSize: '12px',
          fontWeight: 500,
          color: isHovered ? 'rgba(58, 169, 190, 0.8)' : 'rgba(255, 255, 255, 0.2)',
          fontFamily: 'var(--font-geist-mono), monospace',
          transition: 'color 0.4s ease',
        }}
      >
        0{index + 1}
      </div>

      <h3
        style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#F7F8F9',
          marginBottom: '16px',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          letterSpacing: '-0.02em',
        }}
      >
        {feature.title}
      </h3>
      <p
        style={{
          fontSize: '15px',
          lineHeight: 1.7,
          color: 'rgba(255, 255, 255, 0.55)',
          margin: 0,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        {feature.description}
      </p>
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
            width={36}
            height={36}
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
            aria-hidden="true"
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#3AA9BE',
              boxShadow: '0 0 10px rgba(58, 169, 190, 0.8)',
            }}
          />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#3AA9BE',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              letterSpacing: '0.02em',
            }}
          >
            For independent artists
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            fontSize: 'clamp(40px, 8vw, 90px)',
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            textAlign: 'center',
            marginBottom: '32px',
            maxWidth: '900px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Your music
          <br />
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
            deserves to be heard
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
            color: 'rgba(255, 255, 255, 0.55)',
            textAlign: 'center',
            marginBottom: '56px',
            maxWidth: '520px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Scout contacts. Capture ideas. Plan releases. Craft pitches.
          <br />
          One workspace for everything that matters.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <MagneticButton href="/signup">Start Your Workspace</MagneticButton>
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
          <Link
            href="/workspace"
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#3AA9BE')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
          >
            Try as guest →
          </Link>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              padding: '12px 14px',
              borderRadius: '14px',
              border: '1px solid rgba(58, 169, 190, 0.2)',
              background: 'rgba(255, 255, 255, 0.02)',
              minWidth: '260px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#3AA9BE',
                boxShadow: '0 0 12px rgba(58,169,190,0.8)',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
              <span
                style={{
                  fontSize: 13,
                  color: '#EAECEE',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                Finish Mode live
              </span>
              <div
                style={{
                  width: '100%',
                  height: 6,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.05)',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  animate={{ x: ['0%', '60%', '0%'] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: '45%',
                    height: '100%',
                    background:
                      'linear-gradient(90deg, rgba(58,169,190,0.8), rgba(111,200,181,0.7))',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.55)',
                  fontFamily: 'var(--font-geist-mono), monospace',
                }}
              >
                Ideas • Scout • Timeline • Pitch • Finish
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.3)',
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

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          style={{
            position: 'absolute',
            bottom: '48px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.3)',
              fontFamily: 'var(--font-geist-mono), monospace',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '1px',
              height: '40px',
              background: 'linear-gradient(to bottom, rgba(58, 169, 190, 0.5), transparent)',
            }}
          />
        </motion.div>
      </motion.section>

      {/* How it works strip */}
      <section
        aria-labelledby="how-it-works-heading"
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
            border: '1px solid rgba(58,169,190,0.08)',
            borderRadius: '16px',
            padding: '16px',
          }}
        >
          {HOW_IT_WORKS.map((item, i) => (
            <div
              key={item.title}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '12px',
                alignItems: 'start',
              }}
            >
              <div
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
              </div>
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
                    color: 'rgba(255,255,255,0.6)',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {item.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section
        aria-labelledby="features-heading"
        style={{
          padding: '120px 24px 160px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {/* Section header */}
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
            <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Nothing you don't.</span>
          </h2>
          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.7,
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Four focused tools that work together. No bloat, no learning curve, no subscription
            fatigue.
          </p>
        </motion.div>

        {/* Feature grid */}
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
      </section>

      {/* Social Proof Section */}
      <SocialProof />

      {/* Pricing Preview Section */}
      <PricingPreview />

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
            Ready to be heard?
          </h2>
          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '48px',
              maxWidth: '420px',
              margin: '0 auto 48px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            Join hundreds of indie artists who've stopped hoping and started doing.
          </p>
          <MagneticButton href="/signup">Create free account</MagneticButton>
          <p
            style={{
              marginTop: '16px',
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.35)',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            or{' '}
            <Link
              href="/workspace"
              style={{
                color: 'rgba(255, 255, 255, 0.5)',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#3AA9BE')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
            >
              try as guest first
            </Link>
          </p>
        </motion.div>
      </section>

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
                color: 'rgba(255, 255, 255, 0.25)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              Built by{' '}
              <a
                href="https://totalaudiopromo.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#3AA9BE')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)')}
              >
                Total Audio Promo
              </a>
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
                color: 'rgba(255, 255, 255, 0.35)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              aria-label="Terms of service"
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.35)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
            >
              Terms
            </Link>
            <span
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.25)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              © {new Date().getFullYear()}
            </span>
          </nav>
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
      `}</style>
    </div>
  )
}
