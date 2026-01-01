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

import { useRef } from 'react'
import { useMotionTemplate, useScroll, useSpring, useTransform } from 'framer-motion'
import { PricingPreview } from './PricingPreview'
import { SocialProof } from './SocialProof'
import { LandingBackgrounds } from './LandingBackgrounds'
import { LandingCTA } from './LandingCTA'
import { LandingFeatures } from './LandingFeatures'
import { LandingFooter } from './LandingFooter'
import { LandingHeader } from './LandingHeader'
import { LandingHero } from './LandingHero'
import { LandingHowItWorks } from './LandingHowItWorks'

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0])
  const heroY = useTransform(smoothProgress, [0, 0.2], [0, -100])
  const heroScale = useTransform(smoothProgress, [0, 0.15], [1, 0.95])

  const mockupRotateX = useTransform(smoothProgress, [0, 0.12], [2, -4])
  const mockupGlow = useTransform(smoothProgress, [0, 0.1], [0.1, 0.3])
  const mockupY = useTransform(smoothProgress, [0, 0.15], [0, -30])

  const featuresY = useTransform(smoothProgress, [0.3, 0.6], [60, 0])
  const featuresOpacity = useTransform(smoothProgress, [0.25, 0.4], [0, 1])

  const mockupBoxShadow = useMotionTemplate`0 40px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(58, 169, 190, ${mockupGlow})`

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
      <LandingBackgrounds />
      <LandingHeader />

      <main>
        <LandingHero
          heroOpacity={heroOpacity}
          heroY={heroY}
          heroScale={heroScale}
          mockupRotateX={mockupRotateX}
          mockupBoxShadow={mockupBoxShadow}
          mockupY={mockupY}
        />
        <LandingHowItWorks />
        <LandingFeatures featuresY={featuresY} featuresOpacity={featuresOpacity} />
        <SocialProof />
        <PricingPreview />
        <LandingCTA />
      </main>

      <LandingFooter />

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
