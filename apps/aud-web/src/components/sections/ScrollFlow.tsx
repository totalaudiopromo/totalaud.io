/**
 * ScrollFlow - Cinematic Scroll Sequence
 *
 * Transforms the "plan → send → see" sequence into a continuous,
 * depth-driven scroll experience with:
 * - Seamless phrase transitions
 * - Ambient parallax motion
 * - Velocity-based blur
 * - Scroll-linked depth perception
 * - Musical rhythm and tempo
 *
 * Style reference: motion.dev × Linear × Ableton × Framer
 */

'use client'

import { motion, useScroll, useTransform, useVelocity, useSpring } from 'framer-motion'
import { useRef } from 'react'

interface ScrollFlowProps {
  onPhraseEnter?: (phraseIndex: number) => void
}

const phrases = [
  { text: 'plan your release', color: '#3AA9BE', delay: 0 },
  { text: 'send with precision', color: '#3AA9BE', delay: 0.05 },
  { text: 'see what resonates', color: '#3AA9BE', delay: 0.1 },
]

export function ScrollFlow({ onPhraseEnter }: ScrollFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Phrase 1: plan your release (stays centred, fades out in place)
  const y1 = useTransform(scrollYProgress, [0.0, 0.3], [0, 0])
  const opacity1 = useTransform(scrollYProgress, [0.0, 0.2, 0.3], [1, 1, 0])
  const scale1 = useTransform(scrollYProgress, [0.0, 0.3], [1, 0.95])

  // Phrase 2: send with precision (enters from below, stays centred, fades in place)
  const y2 = useTransform(scrollYProgress, [0.25, 0.35, 0.65], [60, 0, 0])
  const opacity2 = useTransform(scrollYProgress, [0.25, 0.35, 0.55, 0.65], [0, 1, 1, 0])
  const scale2 = useTransform(scrollYProgress, [0.25, 0.35, 0.65], [0.95, 1, 0.95])

  // Phrase 3: see what resonates (enters from below, stays centred, fades out)
  const y3 = useTransform(scrollYProgress, [0.6, 0.7, 0.95], [60, 0, 0])
  const opacity3 = useTransform(scrollYProgress, [0.6, 0.7, 0.85, 0.95], [0, 1, 1, 0])
  const scale3 = useTransform(scrollYProgress, [0.6, 0.7, 0.95], [0.95, 1, 0.95])

  // Velocity-based blur for scroll tempo feeling
  const velocity = useVelocity(scrollYProgress)
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 })
  const blur = useTransform(
    smoothVelocity,
    [-0.05, 0, 0.05],
    ['4px', '0px', '4px']
  )

  // Ambient parallax background
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const bgOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.05, 0.1, 0.1, 0.05])

  return (
    <div
      ref={containerRef}
      className="relative h-[200vh]"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      {/* Sticky viewport - no flex, pure absolute positioning */}
      <div className="sticky top-0 left-0 right-0 h-screen overflow-hidden">
        {/* Ambient parallax layer - behind phrases */}
        <motion.div
          style={{
            y: bgY,
            opacity: bgOpacity,
          }}
          className="absolute inset-0 pointer-events-none will-change-transform z-0"
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px]"
            style={{
              background: 'radial-gradient(circle, #3AA9BE 0%, transparent 70%)',
            }}
          />
        </motion.div>

        {/* Pulsing background glow - behind phrases */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="bg-ambient" />
        </div>

        {/* Phrase 1: plan your release - locked to viewport centre with vh */}
        <motion.h2
          style={{
            y: y1,
            opacity: opacity1,
            scale: scale1,
            filter: blur,
            top: '50vh',
            transform: 'translateY(-50%)',
          }}
          className="fixed left-0 right-0 text-center text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-[#E5E7EB] text-glow will-change-transform z-10"
        >
          {phrases[0].text}
        </motion.h2>

        {/* Phrase 2: send with precision - locked to viewport centre with vh */}
        <motion.h2
          style={{
            y: y2,
            opacity: opacity2,
            scale: scale2,
            filter: blur,
            top: '50vh',
            transform: 'translateY(-50%)',
          }}
          className="fixed left-0 right-0 text-center text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-[#E5E7EB] text-glow will-change-transform z-10"
        >
          {phrases[1].text}
        </motion.h2>

        {/* Phrase 3: see what resonates - locked to viewport centre with vh */}
        <motion.h2
          style={{
            y: y3,
            opacity: opacity3,
            scale: scale3,
            filter: blur,
            top: '50vh',
            transform: 'translateY(-50%)',
          }}
          className="fixed left-0 right-0 text-center text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-[#E5E7EB] text-glow will-change-transform z-10"
        >
          {phrases[2].text}
        </motion.h2>

        {/* Closing subtitle (appears with phrase 3, fades out before end) - locked to viewport centre with vh */}
        <motion.p
          style={{
            opacity: useTransform(scrollYProgress, [0.55, 0.65, 0.85, 0.95], [0, 1, 1, 0]),
            y: useTransform(scrollYProgress, [0.55, 0.65], [140, 100]),
            top: '50vh',
          }}
          className="fixed left-0 right-0 text-center text-2xl md:text-3xl font-light text-[#6B7280] tracking-tight will-change-transform z-10"
        >
          your campaign, in flow.
        </motion.p>
      </div>

      <style jsx>{`
        .text-glow {
          text-shadow: 0 0 40px rgba(58, 169, 190, 0.15);
        }

        .bg-ambient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, #3aa9be 10%, transparent 70%);
          animation: pulse-bg 12s ease-in-out infinite;
          filter: blur(120px);
          opacity: 0.04;
        }

        @keyframes pulse-bg {
          0%,
          100% {
            opacity: 0.04;
            transform: scale(1);
          }
          50% {
            opacity: 0.1;
            transform: scale(1.02);
          }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .bg-ambient {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
