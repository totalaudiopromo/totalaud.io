'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export function LandingHeader() {
  return (
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
      <nav aria-label="Main navigation" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
  )
}
