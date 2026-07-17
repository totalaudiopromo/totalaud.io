/**
 * WaitlistLanding — totalaud.io
 *
 * Minimal waiting list page, artist-first copy (July 2026 recommitment,
 * see docs/STRATEGY_2026.md). Captures email into totalaud_io_waitlist
 * via /api/waitlist. Links back to totalaudiopromo.com (TAP) for agencies.
 *
 * Design: same dark token (#0A0B0C) + cyan (#3AA9BE) as the rest of the app.
 * No framer-motion dependency — static server render preferred.
 */

'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { capture } from '@/lib/analytics'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      setState('error')
      return
    }

    setState('submitting')
    setError('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'totalaud-io-landing',
        }),
      })

      if (!res.ok) {
        throw new Error('Request failed')
      }

      capture('waitlist_joined', { source: 'totalaud-io-landing' })
      setState('success')
    } catch {
      setState('error')
      setError('Something went wrong. Please try again.')
    }
  }

  if (state === 'success') {
    return (
      <div
        style={{
          padding: '20px 24px',
          backgroundColor: 'rgba(58, 169, 190, 0.08)',
          border: '1px solid rgba(58, 169, 190, 0.25)',
          borderRadius: '12px',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, fontSize: '15px', color: '#3AA9BE', fontWeight: 500 }}>
          You&apos;re on the list. We&apos;ll be in touch.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          aria-label="Email address"
          required
          disabled={state === 'submitting'}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '13px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            color: '#F7F8F9',
            fontSize: '15px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(58, 169, 190, 0.5)')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
        />
        <button
          type="submit"
          disabled={state === 'submitting'}
          style={{
            padding: '13px 22px',
            background:
              state === 'submitting'
                ? 'rgba(58, 169, 190, 0.5)'
                : 'linear-gradient(135deg, #3AA9BE 0%, #2D8A9C 100%)',
            color: '#0A0B0C',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 600,
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            cursor: state === 'submitting' ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            outline: 'none',
          }}
        >
          {state === 'submitting' ? 'Joining...' : 'Join waitlist'}
        </button>
      </div>
      {state === 'error' && error && (
        <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>{error}</p>
      )}
      <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
        No spam. One email when we launch.
      </p>
    </form>
  )
}

export function WaitlistLanding() {
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
      {/* Ambient gradient */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background:
            'radial-gradient(circle at 30% 20%, rgba(58,169,190,0.12), transparent 40%), radial-gradient(circle at 70% 80%, rgba(58,169,190,0.06), transparent 35%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header
        style={{
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 1,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Image
          src="/brand/svg/ta-logo-cyan.svg"
          alt="totalaud.io"
          width={40}
          height={40}
          priority
          style={{ opacity: 0.9 }}
        />
        <a
          href="https://totalaudiopromo.com"
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#3AA9BE')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
        >
          totalaudiopromo.com →
        </a>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          maxWidth: '600px',
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            background: 'rgba(58, 169, 190, 0.08)',
            border: '1px solid rgba(58, 169, 190, 0.18)',
            borderRadius: '100px',
            marginBottom: '36px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#3AA9BE',
              flexShrink: 0,
            }}
            aria-hidden
          />
          <span
            style={{ fontSize: '12px', fontWeight: 500, color: '#3AA9BE', letterSpacing: '0.03em' }}
          >
            Coming soon — for independent artists
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(24px, 4.5vw, 40px)',
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: '-0.025em',
            marginBottom: '20px',
            maxWidth: '560px',
          }}
        >
          A calm{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #3AA9BE 0%, #56BFD4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            second opinion
          </span>{' '}
          before you release.
        </h1>

        {/* Subhead */}
        <p
          style={{
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.65,
            marginBottom: '48px',
            maxWidth: '460px',
          }}
        >
          Finish your music, plan the release, and reach the right people — with your audio never
          leaving your device. No scores. No hype. Just what matters.
        </p>

        {/* Waitlist card */}
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            padding: '32px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '18px',
            textAlign: 'left',
            marginBottom: '40px',
          }}
        >
          <p
            style={{
              margin: '0 0 20px',
              fontSize: '15px',
              fontWeight: 500,
              color: '#F7F8F9',
            }}
          >
            Join the list
          </p>
          <WaitlistForm />
        </div>

        {/* Cross-link to TAP */}
        <div
          style={{
            padding: '24px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '14px',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <p
            style={{
              margin: '0 0 8px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            Need a PR agency workspace now?
          </p>
          <p
            style={{
              margin: '0 0 14px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.6,
            }}
          >
            TAP is the tool professional music PR agencies use to run campaigns, track contacts, and
            report to clients — live today.
          </p>
          <a
            href="https://totalaudiopromo.com"
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#3AA9BE',
              textDecoration: 'none',
            }}
          >
            totalaudiopromo.com →
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '28px 32px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
          Built by the team behind{' '}
          <a
            href="https://totalaudiopromo.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
          >
            TAP
          </a>
          . © {new Date().getFullYear()} Total Audio Promo Ltd.
        </p>
        <nav aria-label="Footer" style={{ display: 'flex', gap: '20px' }}>
          <Link
            href="/privacy"
            style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
          >
            Terms
          </Link>
        </nav>
      </footer>
    </div>
  )
}
