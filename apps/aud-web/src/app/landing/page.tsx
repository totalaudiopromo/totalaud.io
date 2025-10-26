/**
 * Totalaud.io Landing Page - "Mystique" Edition
 *
 * Philosophy: Less copy, more confidence. Show glimpses, not explanations.
 * Emotion > features. The system speaks for itself.
 *
 * Think: Ableton × Linear × Future Nostalgia
 */

'use client'

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { track } from '@vercel/analytics'
import { SocialProof } from '@aud-web/components/sections/SocialProof'
import { Testimonials } from '@aud-web/components/sections/Testimonials'
import { FAQAccordion } from '@aud-web/components/ui/FAQAccordion'
import { ScrollNarrative } from '@aud-web/components/sections/ScrollNarrative'
import { LandingFooter } from '@aud-web/components/layout/LandingFooter'
import { ConsoleDemoModal } from '@aud-web/components/modals/ConsoleDemoModal'
import { WaitlistModal } from '@aud-web/components/modals/WaitlistModal'
import { ThemeSlider } from '@aud-web/components/sections/ThemeSlider'
import { CursorFloatingTarget } from '@aud-web/components/effects/CursorFloatingTarget'
import { useScrollSound } from '@aud-web/hooks/useScrollSound'
import { ScrollFlow } from '@aud-web/components/sections/ScrollFlow'

// Motion grammar
const easeCubic = [0.22, 1, 0.36, 1] as const

// Ambient sound system
function useAmbientSound() {
  const [isMuted, setIsMuted] = useState(true)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Initialize Web Audio API on first interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
    }

    window.addEventListener('click', initAudio, { once: true })
    return () => window.removeEventListener('click', initAudio)
  }, [])

  // ⌘M toggle
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault()
        setIsMuted((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const playCTATone = () => {
    if (isMuted || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 880 // A5 (880 Hz)
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02) // -20 LUFS approx
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.08)
  }

  return { isMuted, playCTATone }
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const [showCTA, setShowCTA] = useState(false)
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  const { isMuted, playCTATone} = useAmbientSound()

  // Magnetic CTA effect
  const ctaX = useMotionValue(0)
  const ctaY = useMotionValue(0)
  const springConfig = { damping: 15, stiffness: 150 }
  const ctaXSpring = useSpring(ctaX, springConfig)
  const ctaYSpring = useSpring(ctaY, springConfig)

  // Track scroll milestones for analytics
  const [scrollMilestones, setScrollMilestones] = useState({
    reveal1: false,
    reveal2: false,
    reveal3: false,
    proof: false,
  })

  // Track landing page view on mount
  useEffect(() => {
    track('landing_view')
  }, [])

  // Progressive scroll sound (optional, respects mute state)
  useScrollSound({ scrollProgress: scrollYProgress, isMuted })

  // Show CTA after 8 seconds + play tone
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCTA(true)
      playCTATone()
    }, 8000)
    return () => clearTimeout(timer)
  }, [playCTATone])

  // Track scroll milestones
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (progress) => {
      if (progress > 0.2 && !scrollMilestones.reveal1) {
        setScrollMilestones((prev) => ({ ...prev, reveal1: true }))
        track('scroll_milestone_reveal1')
      }
      if (progress > 0.35 && !scrollMilestones.reveal2) {
        setScrollMilestones((prev) => ({ ...prev, reveal2: true }))
        track('scroll_milestone_reveal2')
      }
      if (progress > 0.5 && !scrollMilestones.reveal3) {
        setScrollMilestones((prev) => ({ ...prev, reveal3: true }))
        track('scroll_milestone_reveal3')
      }
      if (progress > 0.65 && !scrollMilestones.proof) {
        setScrollMilestones((prev) => ({ ...prev, proof: true }))
        track('scroll_milestone_proof_section')
      }
    })

    return () => unsubscribe()
  }, [scrollYProgress, scrollMilestones])

  // Parallax effects
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  // Visual Proof Strip - fade in quickly and stay at full opacity
  const proofY = useTransform(scrollYProgress, [0.45, 0.55], [100, 0])
  const proofOpacity = useTransform(scrollYProgress, [0.45, 0.55], [0, 1])

  return (
    <div
      ref={containerRef}
      className="relative min-h-[400vh] bg-[#0F1113] text-[#E5E7EB] overflow-x-hidden"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      {/* Hero - The Transmission */}
      <motion.section
        className="sticky top-0 h-screen flex flex-col items-center justify-center"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Subtle pulse background - enhanced visibility */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px]"
            style={{
              background: 'radial-gradient(circle, #3AA9BE 0%, transparent 70%)',
            }}
            animate={{
              opacity: [0.08, 0.15, 0.08],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Main hero text */}
        <div className="relative z-10 text-center px-4">
          <div className="relative inline-block overflow-hidden">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: easeCubic }}
              className="text-[#3AA9BE] text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-6"
              style={{ fontFamily: 'var(--font-inter)', letterSpacing: '-0.01em' }}
            >
              totalaud.io
            </motion.h1>

            {/* Dynamic light sweep */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(58, 169, 190, 0.12) 50%, transparent 100%)',
                filter: 'blur(30px)',
              }}
              animate={{
                x: ['-200%', '300%'],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'linear',
                delay: 2, // Start after hero appears
              }}
            />
          </div>

          {/* Staggered text reveal */}
          <motion.p
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.2,
                },
              },
            }}
            className="text-[#E5E7EB] text-lg md:text-2xl font-light tracking-wide italic"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            {['Creative', 'control', 'for', 'artists.'].map((word, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="inline-block"
              >
                {word}
                {i < 3 ? '\u00A0' : ''}
              </motion.span>
            ))}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: easeCubic }}
            className="mt-12 text-[#6B7280] text-xs font-medium tracking-wider uppercase"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            built by the team behind total audio promo
          </motion.p>
        </div>

        {/* ⌘K hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute bottom-12 right-12 text-[#6B7280] text-sm"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          ⌘K
        </motion.div>
      </motion.section>

      {/* Scroll-Based Reveal Sequence - Cinematic ScrollFlow */}
      <div className="relative">
        <ScrollFlow />

        {/* Visual Proof Strip */}
        <motion.section
          className="min-h-screen flex items-center justify-center py-24"
          style={{ y: proofY, opacity: proofOpacity }}
        >
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Console Preview Video with Modal */}
            <CursorFloatingTarget strength={0.08}>
              <ConsoleDemoModal
                trigger={
                  <motion.div
                    layoutId="console-preview"
                    className="relative aspect-video bg-[#1A1D21] border border-[#2A3744] rounded-lg overflow-hidden shadow-2xl cursor-pointer
                      hover:shadow-[0_0_40px_-10px_rgba(58,169,190,0.3)] transition-shadow duration-300"
                  >
                    {/* TODO: Replace with actual video once exported */}
                    {/* <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover"
                    >
                      <source src="/videos/console-preview.mp4" type="video/mp4" />
                    </video> */}

                    {/* Temporary placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-[#3AA9BE] text-sm mb-2" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                          Console Preview
                        </div>
                        <div className="text-[#6B7280] text-xs">
                          Click to expand
                        </div>
                        <div className="text-[#4B5563] text-xs mt-2">
                          (Export screen recording to /public/videos/console-preview.mp4)
                        </div>
                      </div>
                    </div>
                  </motion.div>
                }
              />
            </CursorFloatingTarget>

            {/* Right: Copy + CTA */}
            <div className="space-y-8">
              <p className="text-xl md:text-2xl font-light text-[#E5E7EB] leading-relaxed">
                the creative workspace built from real promotion work.
              </p>

              <p
                className="text-[#6B7280] text-xs tracking-wider uppercase"
                style={{ fontFamily: 'var(--font-geist-mono)' }}
              >
                now in private beta
              </p>

              {/* Magnetic CTA - fades in after 8 seconds */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: showCTA ? 1 : 0, y: showCTA ? 0 : 10 }}
                transition={{ duration: 0.8, ease: easeCubic }}
              >
                <motion.button
                  style={{
                    x: ctaXSpring,
                    y: ctaYSpring,
                    fontFamily: 'var(--font-geist-mono)'
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-[#3AA9BE]/60 text-[#3AA9BE] rounded-md
                    hover:bg-[#3AA9BE]/10 transition-colors
                    text-sm font-medium tracking-wide"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const centerX = rect.left + rect.width / 2
                    const centerY = rect.top + rect.height / 2
                    ctaX.set((e.clientX - centerX) * 0.25)
                    ctaY.set((e.clientY - centerY) * 0.25)
                  }}
                  onMouseLeave={() => {
                    ctaX.set(0)
                    ctaY.set(0)
                  }}
                  onClick={() => {
                    setIsWaitlistOpen(true)
                    playCTATone()
                    track('cta_click', { location: 'hero' })
                  }}
                >
                  Request Access
                  <span>→</span>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Phase 3: Content & Trust Layer */}
        <SocialProof />

        {/* Phase 4: Interactive Showcase */}
        <ThemeSlider />

        <Testimonials />
        <FAQAccordion />
        <ScrollNarrative />

        {/* Footer with sound toggle */}
        <div className="relative">
          <LandingFooter
            onCTAClick={() => {
              setIsWaitlistOpen(true)
              playCTATone()
              track('cta_click', { location: 'footer' })
            }}
          />
          {/* Sound toggle indicator */}
          <div
            className="absolute bottom-4 left-4 md:bottom-12 md:left-12 text-[#6B7280] text-xs flex items-center gap-2"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            <span className={isMuted ? 'opacity-30' : 'opacity-100'}>
              {isMuted ? '🔇' : '🔊'}
            </span>
            <span className="opacity-50">⌘M</span>
          </div>
        </div>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        onSuccess={() => track('waitlist_signup_success')}
      />
    </div>
  )
}
