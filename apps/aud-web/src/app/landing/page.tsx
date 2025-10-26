/**
 * Totalaud.io Landing Page - Phase 10.3 Cinematic Rebuild
 *
 * Philosophy: Wispr Flow-inspired emotional design
 * Promise → Proof → Path → CTA Close
 *
 * Motion: Editorial breathing (600ms+), magnetic spring physics
 * Copy: "Campaigns that move like music" - honest maker voice
 * Structure: 4-act cinematic journey with persistent proof rhythm
 */

'use client'

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { track } from '@vercel/analytics'
import { WaitlistModal } from '@aud-web/components/modals/WaitlistModal'
import { motionDurations, framerEasing } from '@aud-web/tokens/motion'

// Motion grammar - Wispr Flow editorial breathing
const easeCubic = framerEasing.fast // [0.22, 1, 0.36, 1]
const easeEditorial = framerEasing.slow // Smooth parallax

// Testimonial quotes for rotation
const heroTestimonials = [
  { quote: 'The first tool that feels designed by someone who has done it.', author: 'Tom R' },
  {
    quote: 'Feels like a creative DAW for promotion — fast and strangely calming.',
    author: 'Lisa D',
  },
  { quote: 'This changes how we pitch radio.', author: 'Chris S' },
]

// Social proof ticker logos
const socialProofLogos = [
  'Warm FM',
  'Echo Agency',
  'Reverb Club',
  'Lisa D',
  'Total Audio Promo',
  'Unsigned Advantage',
]

// Ambient sound system
function useAmbientSound() {
  const [isMuted, setIsMuted] = useState(true)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Initialize Web Audio API on first interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)()
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

  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const { isMuted, playCTATone } = useAmbientSound()

  // Magnetic CTA effect - stronger spring for cinematic feel
  const ctaX = useMotionValue(0)
  const ctaY = useMotionValue(0)
  const springConfig = { damping: 20, stiffness: 150 } // Wispr Flow: damping 20
  const ctaXSpring = useSpring(ctaX, springConfig)
  const ctaYSpring = useSpring(ctaY, springConfig)

  // Track landing page view on mount
  useEffect(() => {
    track('landing_view')
  }, [])

  // Testimonial rotation (8 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % heroTestimonials.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // Track scroll milestones
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (progress) => {
      if (progress > 0.25) track('scroll_milestone_promise')
      if (progress > 0.5) track('scroll_milestone_proof')
      if (progress > 0.75) track('scroll_milestone_path')
    })

    return () => unsubscribe()
  }, [scrollYProgress])

  // Parallax effects
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  // Ambient gradient pulse - tied to scroll
  const ambientOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.04, 0.08, 0.04])

  return (
    <>
      {/* Sticky Header CTA - Wispr Flow persistent access */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0F1113]/90 border-b border-[#2A2F33]/50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.4, ease: easeCubic }}
      >
        <div className="flex justify-between items-center px-6 md:px-8 py-3 max-w-7xl mx-auto">
          <motion.span
            className="text-[#3AA9BE] text-sm md:text-base font-medium tracking-wide"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            totalaud.io
          </motion.span>
          <motion.button
            onClick={() => {
              setIsWaitlistOpen(true)
              playCTATone()
              track('cta_click', { location: 'sticky_header' })
            }}
            className="text-xs md:text-sm text-[#3AA9BE] border border-[#3AA9BE]/60 px-3 md:px-4 py-2 rounded-md"
            style={{ fontFamily: 'var(--font-mono)' }}
            whileHover={{
              boxShadow: '0 0 20px rgba(58, 169, 190, 0.25)',
              borderColor: 'rgba(58, 169, 190, 1)',
              backgroundColor: 'rgba(58, 169, 190, 0.05)',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: motionDurations.fast / 1000, ease: easeCubic }}
          >
            Request Access →
          </motion.button>
        </div>
      </motion.header>

      <div
        ref={containerRef}
        className="relative min-h-[400vh] bg-[#0F1113] text-[#E5E7EB] overflow-x-hidden"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        {/* Ambient radial gradient pulse - 12s loop */}
        <motion.div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background:
              'radial-gradient(circle at 50% 100%, rgba(58, 169, 190, 0.04) 0%, transparent 70%)',
            opacity: ambientOpacity,
          }}
        />

        {/* ACT 1: PROMISE - Hero with rotating testimonial */}
        <motion.section
          className="sticky top-0 h-screen flex flex-col items-center justify-center px-4"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* Ambient pulse background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] rounded-full blur-[200px]"
              style={{
                background: 'radial-gradient(circle, #3AA9BE 0%, transparent 70%)',
              }}
              animate={{
                opacity: [0.06, 0.12, 0.06],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          {/* Hero content */}
          <div className="relative z-10 text-center max-w-4xl">
            {/* Main headline - Editorial serif for emotion */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: motionDurations.editorial / 1000, ease: easeCubic }}
              className="text-[#F9FAFB] text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.15] mb-4"
              style={{ fontFamily: 'var(--font-editorial)', letterSpacing: '-0.02em' }}
            >
              Campaigns that move like music.
            </motion.h1>

            {/* Subheadline - Sans for clarity */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: motionDurations.editorial / 1000,
                delay: 0.15,
                ease: easeCubic,
              }}
              className="text-[#E5E7EB] text-lg md:text-xl lg:text-2xl font-light tracking-wide mb-8"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Creative control for artists — built by someone who still sends their own emails.
            </motion.p>

            {/* Rotating testimonial quote - proof above fold */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: motionDurations.slow / 1000,
                delay: 0.4,
                ease: easeCubic,
              }}
              className="mt-12 max-w-2xl mx-auto"
            >
              <motion.blockquote
                key={testimonialIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: motionDurations.slow / 1000, ease: easeCubic }}
              >
                <p
                  className="text-[#A0A4A8] text-sm md:text-base italic leading-relaxed mb-2"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  "{heroTestimonials[testimonialIndex].quote}"
                </p>
                <footer
                  className="text-[#6B7280] text-xs"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  — {heroTestimonials[testimonialIndex].author}
                </footer>
              </motion.blockquote>
            </motion.div>

            {/* Built by credit */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: motionDurations.slow / 1000,
                delay: 0.6,
                ease: easeCubic,
              }}
              className="mt-12 text-[#6B7280] text-xs font-medium tracking-wider uppercase"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              from total audio promo
            </motion.p>
          </div>

          {/* ⌘K hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: motionDurations.slow / 1000, delay: 1.2 }}
            className="absolute bottom-12 right-8 md:right-12 text-[#6B7280] text-sm"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            ⌘K
          </motion.div>
        </motion.section>

        {/* ACT 2: PROOF - Console preview + social proof ticker */}
        <section className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4">
          <div className="max-w-7xl mx-auto w-full">
            {/* Console preview placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: motionDurations.editorial / 1000, ease: easeCubic }}
              className="relative aspect-video bg-[#1A1D21] border border-[#2A3744] rounded-lg overflow-hidden shadow-2xl max-w-4xl mx-auto mb-16"
            >
              {/* TODO: Replace with actual /videos/console-preview.mp4 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div
                    className="text-[#3AA9BE] text-sm mb-2"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Console Preview
                  </div>
                  <div className="text-[#6B7280] text-xs">
                    (Export 6s loop to /public/videos/console-preview.mp4)
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Copy + CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: motionDurations.editorial / 1000,
                delay: 0.2,
                ease: easeCubic,
              }}
              className="text-center space-y-8 max-w-2xl mx-auto"
            >
              <p
                className="text-xl md:text-2xl font-light text-[#E5E7EB] leading-relaxed"
                style={{ fontFamily: 'var(--font-editorial)' }}
              >
                the creative workspace built from real promotion work.
              </p>

              <p
                className="text-[#6B7280] text-xs tracking-wider uppercase"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                ready for real campaigns
              </p>

              {/* Magnetic CTA - instant, no delay */}
              <motion.button
                style={{
                  x: ctaXSpring,
                  y: ctaYSpring,
                  fontFamily: 'var(--font-mono)',
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-[#3AA9BE]/60 text-[#3AA9BE] rounded-md text-sm font-medium tracking-wide"
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
                whileHover={{
                  backgroundColor: 'rgba(58, 169, 190, 0.12)',
                  borderColor: 'rgba(58, 169, 190, 1)',
                  boxShadow: [
                    '0 0 0 rgba(58, 169, 190, 0)',
                    '0 0 24px rgba(58, 169, 190, 0.25)',
                  ],
                }}
                whileTap={{ scale: 0.98 }}
                transition={{
                  duration: motionDurations.ringPulse / 1000,
                  ease: easeCubic,
                }}
              >
                Request Access
                <span>→</span>
              </motion.button>

              <p
                className="text-[#6B7280] text-xs"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                No AI hype, just workflow clarity.
              </p>
            </motion.div>
          </div>

          {/* Social proof ticker - infinite horizontal scroll */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: motionDurations.slow / 1000, delay: 0.4 }}
            className="mt-24 w-full overflow-hidden"
          >
            <p
              className="text-center text-[#6B7280] text-xs uppercase tracking-wider mb-8"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Used by real creators
            </p>
            <div className="relative flex">
              <motion.div
                className="flex gap-8"
                animate={{
                  x: ['0%', '-50%'],
                }}
                transition={{
                  duration: 60,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {/* Duplicate array for seamless loop */}
                {[...socialProofLogos, ...socialProofLogos].map((logo, i) => (
                  <div
                    key={i}
                    className="px-6 py-3 border border-[#2A2F33] text-[#A0A4A8] text-sm rounded-md whitespace-nowrap"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    {logo}
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ACT 3: PATH - Testimonials + mid-scroll quote */}
        <section className="relative py-32 px-4 border-t border-[#2A2F33]/80">
          <div className="max-w-2xl mx-auto space-y-16 text-center">
            <motion.blockquote
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: motionDurations.editorial / 1000,
                ease: easeCubic,
              }}
              className="text-[#E5E7EB] leading-relaxed text-lg md:text-xl font-light"
              style={{ fontFamily: 'var(--font-editorial)' }}
            >
              "This changes how we pitch radio. It's the first tool that feels designed by someone
              who's done it."
              <footer
                className="mt-4 text-sm text-[#6B7280]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                — Tom R, Radio Plugger
              </footer>
            </motion.blockquote>

            <motion.blockquote
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: motionDurations.editorial / 1000,
                delay: 0.2,
                ease: easeCubic,
              }}
              className="text-[#E5E7EB] leading-relaxed text-lg md:text-xl font-light"
              style={{ fontFamily: 'var(--font-editorial)' }}
            >
              "totalaud.io feels like a creative DAW for promotion — fast, musical, and strangely
              calming."
              <footer
                className="mt-4 text-sm text-[#6B7280]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                — Lisa D, Artist / DJ
              </footer>
            </motion.blockquote>
          </div>
        </section>

        {/* ACT 4: CTA CLOSE - Footer with privacy badge */}
        <footer className="relative py-16 px-4 border-t border-[#2A2F33]/80">
          <div className="max-w-4xl mx-auto">
            {/* Dual-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              {/* Left: From practical to poetic */}
              <div>
                <p
                  className="text-[#6B7280] text-xs uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Total Audio Promo → totalaud.io
                </p>
                <p
                  className="text-[#4B5563] text-xs italic"
                  style={{ fontFamily: 'var(--font-inter)' }}
                >
                  from practical to poetic.
                </p>
              </div>

              {/* Right: Contact */}
              <div className="text-right">
                <a
                  href="mailto:hello@totalaud.io"
                  className="text-[#3AA9BE] text-sm hover:underline"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  hello@totalaud.io
                </a>
              </div>
            </div>

            {/* Privacy badge - Wispr Flow trust signal */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: motionDurations.slow / 1000 }}
              className="border-t border-[#2A2F33]/50 pt-8 text-center"
            >
              <p className="text-[#6B7280] text-sm mb-2 flex items-center justify-center gap-2">
                <span>🔒</span>
                <span>Your data stays yours. We don't sell contact lists.</span>
              </p>
              <p className="text-[#4B5563] text-xs opacity-60">
                Built for creators, by creators since 2019.
              </p>
            </motion.div>

            {/* Sound toggle indicator */}
            <div
              className="absolute bottom-4 left-4 md:bottom-8 md:left-8 text-[#6B7280] text-xs flex items-center gap-2"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span className={isMuted ? 'opacity-30' : 'opacity-100'}>
                {isMuted ? '🔇' : '🔊'}
              </span>
              <span className="opacity-50">⌘M</span>
            </div>

            {/* Copyright */}
            <p
              className="text-center text-[#4B5563] text-xs mt-8"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              © 2025 TOTAL AUDIO STUDIO
            </p>
          </div>
        </footer>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        onSuccess={() => track('waitlist_signup_success')}
      />
    </>
  )
}
