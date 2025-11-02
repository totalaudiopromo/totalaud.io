/**
 * Landing Page Component
 * Phase 14: Unified Product Polish
 *
 * Standalone marketing page with:
 * - Hero section with clear value proposition
 * - "Launch Console" CTA
 * - FlowCore design system integration
 * - ConvertKit email capture
 */

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  flowCoreColours,
  flowCoreMotion,
  flowCoreTypography,
} from '@aud-web/constants/flowCoreColours'
import { ArrowRight, Sparkles } from 'lucide-react'

export function LandingPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: flowCoreColours.matteBlack,
        color: flowCoreColours.textPrimary,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Grain Effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
            opacity: 0.03,
            pointerEvents: 'none',
          }}
        />

        {/* Gradient Glow */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: `radial-gradient(circle, ${flowCoreColours.slateCyan}15 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <div
          style={{
            maxWidth: '800px',
            textAlign: 'center',
            zIndex: 1,
          }}
        >
          {/* Logo Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: flowCoreMotion.normal / 1000 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: flowCoreColours.darkGrey,
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '999px',
              fontSize: flowCoreTypography.tiny,
              fontWeight: 600,
              color: flowCoreColours.iceCyan,
              marginBottom: '32px',
              fontFamily: 'var(--font-mono)',
              textTransform: 'lowercase',
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span>experimental campaign os</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: flowCoreMotion.normal / 1000, delay: 0.1 }}
            style={{
              fontSize: flowCoreTypography.hero,
              fontWeight: 700,
              lineHeight: flowCoreTypography.heroLineHeight,
              letterSpacing: flowCoreTypography.heroTracking,
              color: flowCoreColours.textPrimary,
              marginBottom: '24px',
              fontFamily: 'var(--font-sans)',
            }}
          >
            The Campaign OS for{' '}
            <span style={{ color: flowCoreColours.slateCyan }}>Indie Artists</span> & Music PRs
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: flowCoreMotion.normal / 1000, delay: 0.2 }}
            style={{
              fontSize: flowCoreTypography.body,
              lineHeight: flowCoreTypography.bodyLineHeight,
              color: flowCoreColours.textSecondary,
              marginBottom: '48px',
              maxWidth: '600px',
              margin: '0 auto 48px',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Plan, Pitch and Track every release in one Flow-state workspace. Visualise agent
            workflows, automate contact research, and orchestrate campaigns with AI.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: flowCoreMotion.normal / 1000, delay: 0.3 }}
          >
            <Link href="/console" passHref legacyBehavior>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: flowCoreMotion.fast / 1000 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  backgroundColor: flowCoreColours.slateCyan,
                  color: flowCoreColours.matteBlack,
                  borderRadius: '8px',
                  fontSize: flowCoreTypography.body,
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'lowercase',
                  boxShadow: `0 0 30px -10px ${flowCoreColours.slateCyan}`,
                  cursor: 'pointer',
                }}
              >
                <span>launch console</span>
                <ArrowRight className="w-5 h-5" />
              </motion.a>
            </Link>
          </motion.div>

          {/* Secondary Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: flowCoreMotion.normal / 1000, delay: 0.4 }}
            style={{
              marginTop: '32px',
              fontSize: flowCoreTypography.small,
              color: flowCoreColours.textTertiary,
              fontFamily: 'var(--font-mono)',
              textTransform: 'lowercase',
            }}
          >
            no signup required → dive straight in
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '32px 24px',
          borderTop: `1px solid ${flowCoreColours.borderGrey}`,
          backgroundColor: flowCoreColours.darkGrey,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Footer Content */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            {/* Brand */}
            <div>
              <div
                style={{
                  fontSize: flowCoreTypography.body,
                  fontWeight: 600,
                  color: flowCoreColours.slateCyan,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'lowercase',
                  marginBottom: '4px',
                }}
              >
                totalaud.io
              </div>
              <div
                style={{
                  fontSize: flowCoreTypography.small,
                  color: flowCoreColours.textTertiary,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Experimental campaign OS by{' '}
                <a
                  href="https://totalaudiopromo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: flowCoreColours.iceCyan,
                    textDecoration: 'none',
                  }}
                >
                  Total Audio Promo
                </a>
              </div>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: '24px' }}>
              <Link
                href="/console"
                style={{
                  fontSize: flowCoreTypography.small,
                  color: flowCoreColours.textSecondary,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'lowercase',
                  transition: `color ${flowCoreMotion.fast}ms ${flowCoreMotion.easeStandard}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = flowCoreColours.slateCyan
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = flowCoreColours.textSecondary
                }}
              >
                console
              </Link>
              <a
                href="https://github.com/totalaudpromo"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: flowCoreTypography.small,
                  color: flowCoreColours.textSecondary,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'lowercase',
                  transition: `color ${flowCoreMotion.fast}ms ${flowCoreMotion.easeStandard}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = flowCoreColours.slateCyan
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = flowCoreColours.textSecondary
                }}
              >
                github
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div
            style={{
              fontSize: flowCoreTypography.tiny,
              color: flowCoreColours.textTertiary,
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              paddingTop: '16px',
              borderTop: `1px solid ${flowCoreColours.borderGrey}`,
            }}
          >
            © {new Date().getFullYear()} totalaud.io — experimental. use at your own risk.
          </div>
        </div>
      </footer>
    </main>
  )
}
