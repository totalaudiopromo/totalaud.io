/**
 * Hero Component
 * 2025 Brand Pivot - Minimal, premium landing
 *
 * Design: Apple-level restraint
 * - Single headline + subtext
 * - One CTA button
 * - Subtle fade-in animation
 */

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function Hero() {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: '64px 24px',
        textAlign: 'center',
      }}
    >
      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          fontSize: 'clamp(32px, 6vw, 56px)',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: '#F7F8F9',
          marginBottom: '24px',
          maxWidth: '700px',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        Helping indie artists get heard
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          lineHeight: 1.6,
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '48px',
          maxWidth: '540px',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        Intelligent tools that simplify discovery, planning, pitching and creative direction.
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
      >
        <Link
          href="/workspace"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px 32px',
            backgroundColor: '#3AA9BE',
            color: '#0F1113',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 500,
            textDecoration: 'none',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          Start free
        </Link>
      </motion.div>

      {/* Secondary note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
        style={{
          marginTop: '24px',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.4)',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        No signup required
      </motion.p>
    </section>
  )
}
