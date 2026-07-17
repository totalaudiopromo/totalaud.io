/**
 * ArtistLanding — the totalaud.io homepage.
 *
 * Artist-first story (docs/STRATEGY_2026.md): a calm second opinion before
 * you release. Tells the whole loop — finish, plan, reach, remember — with
 * the trust commitments up front and the waitlist as the single CTA.
 *
 * Design: matte black, slate cyan used sparingly, generous space, soft
 * motion on the house tokens. Calm, not chaotic.
 */

'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { capture } from '@/lib/analytics'

const EASE = [0.22, 1, 0.36, 1] as const

// ---------------------------------------------------------------------------
// Waitlist form
// ---------------------------------------------------------------------------

type FormState = 'idle' | 'submitting' | 'success' | 'error'

function WaitlistForm({ source }: { source: string }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) {
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
        body: JSON.stringify({ email, source }),
      })
      if (!res.ok) throw new Error('Request failed')
      capture('waitlist_joined', { source })
      setState('success')
    } catch {
      setState('error')
      setError('Something went wrong. Please try again.')
    }
  }

  if (state === 'success') {
    return (
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: EASE }}
        className="rounded-xl border border-ta-cyan/25 bg-ta-cyan/[0.07] px-5 py-4 text-sm text-ta-cyan"
      >
        You&apos;re on the list. One email when we launch — that&apos;s it.
      </motion.p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          required
          disabled={state === 'submitting'}
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[15px] text-ta-white placeholder-white/30 outline-none transition-colors focus:border-ta-cyan/50 focus:bg-white/[0.06]"
        />
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="rounded-xl bg-ta-cyan px-6 py-3.5 text-[15px] font-medium text-ta-black transition-colors hover:bg-ta-cyan/90 disabled:opacity-50 whitespace-nowrap"
        >
          {state === 'submitting' ? 'Joining…' : 'Join the waitlist'}
        </button>
      </div>
      {state === 'error' && error && <p className="mt-2 text-[13px] text-red-400">{error}</p>}
      <p className="mt-2.5 text-xs text-white/35">No spam. One email when we launch.</p>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  // Animate on mount, not on scroll: content must never be able to stay
  // hidden (fast scrolls can skip intersection triggers entirely)
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ta-cyan/70">
      {children}
    </p>
  )
}

// ---------------------------------------------------------------------------
// Finishing-notes mock — shows the tone better than any copy could
// ---------------------------------------------------------------------------

function NotesMock() {
  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-white/[0.08] bg-ta-panel/80 p-6 text-left shadow-[0_0_80px_rgba(58,169,190,0.07)]">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-ta-white/90">night drive — final mix 3.wav</p>
        <p className="font-mono text-[11px] text-white/35">analysed on your device</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {['-9.8 LUFS', '-0.6 dBTP', 'LRA 5.2', '3:47'].map((chip) => (
          <span
            key={chip}
            className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-white/50"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ta-cyan/70">
            Mix perspective
          </p>
          <p className="text-[13px] leading-relaxed text-white/75">
            The true peak is sitting close to the ceiling, so some encoders will clip the loudest
            moments. Half a decibel of headroom would keep the chorus clean everywhere.
          </p>
        </div>
        <div>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-ta-cyan/70">
            Listener perspective
          </p>
          <p className="text-[13px] leading-relaxed text-white/75">
            The intro earns its patience — but on small speakers the first hook lands at 0:52, which
            is a long wait. Worth considering whether the edit for playlists opens closer to it.
          </p>
        </div>
      </div>

      <p className="mt-5 border-t border-white/[0.06] pt-4 text-[12px] text-white/40">
        Finishing notes, never scores. You decide what matters.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// The loop
// ---------------------------------------------------------------------------

const LOOP_STEPS = [
  {
    number: '01',
    title: 'Finish',
    body: 'A second opinion from four perspectives — producer, mix, listener, industry. Your audio is analysed on your own device and never uploaded anywhere.',
  },
  {
    number: '02',
    title: 'Plan',
    body: 'One release date becomes a week-by-week plan: mastering, distribution, pitching, release day, and the follow-through most releases skip.',
  },
  {
    number: '03',
    title: 'Reach',
    body: 'Real outlets, curators and radio worth your time — and a quiet check that every pitch, bio and caption still sounds like you.',
  },
  {
    number: '04',
    title: 'Remember',
    body: 'Log what happened, thank the people who showed up, and start the next release already knowing what worked.',
  },
]

// ---------------------------------------------------------------------------
// Trust commitments
// ---------------------------------------------------------------------------

const COMMITMENTS = [
  'Your audio never leaves your device',
  'Nothing sends itself — you decide, always',
  'Your work is never used to train anything',
  'Export everything, any time',
  'Independent, like you',
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ArtistLanding() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ta-black font-sans text-ta-white">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(58,169,190,0.10), transparent 70%), radial-gradient(ellipse 40% 30% at 85% 90%, rgba(58,169,190,0.05), transparent 70%)',
        }}
      />

      {/* Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/svg/ta-logo-cyan.svg"
            alt=""
            width={30}
            height={30}
            priority
            className="opacity-90"
          />
          <span className="text-[15px] font-medium tracking-tight text-ta-white/90">
            totalaud.io
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <Link
            href="/pricing"
            className="hidden text-[13px] text-white/50 transition-colors hover:text-ta-white sm:block"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-[13px] text-white/50 transition-colors hover:text-ta-white"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto w-full max-w-3xl px-6 pb-24 pt-16 text-center sm:pt-24">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-ta-cyan/20 bg-ta-cyan/[0.07] px-4 py-1.5">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ta-cyan" />
              <span className="text-xs font-medium tracking-wide text-ta-cyan">
                For independent artists
              </span>
            </div>

            <h1
              className="mx-auto mb-6 max-w-2xl text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl"
              style={{ textShadow: '0 0 40px rgba(58, 169, 190, 0.15)' }}
            >
              A calm second opinion <span className="text-ta-cyan">before you release.</span>
            </h1>

            <p className="mx-auto mb-10 max-w-xl text-[15px] leading-relaxed text-white/60 sm:text-base">
              Finish your music, turn one date into a real release plan, and remember every person
              who cared. No scores, no hype, nothing sent on your behalf — and your audio never
              leaves your device.
            </p>

            <div className="mx-auto max-w-md">
              <WaitlistForm source="totalaud-io-landing" />
            </div>
          </motion.div>
        </section>

        {/* Finishing-notes mock */}
        <section className="mx-auto w-full max-w-4xl px-6 pb-28">
          <FadeIn>
            <NotesMock />
          </FadeIn>
        </section>

        {/* The loop */}
        <section className="mx-auto w-full max-w-5xl px-6 pb-28">
          <FadeIn className="mb-12 text-center">
            <SectionLabel>The release loop</SectionLabel>
            <h2 className="mx-auto max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
              One less thing to think about, at every step
            </h2>
          </FadeIn>

          <div className="grid gap-4 sm:grid-cols-2">
            {LOOP_STEPS.map((step, i) => (
              <FadeIn key={step.number} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-colors hover:border-ta-cyan/25">
                  <p className="mb-3 font-mono text-[12px] text-ta-cyan/60">{step.number}</p>
                  <h3 className="mb-2 text-lg font-medium text-ta-white">{step.title}</h3>
                  <p className="text-[14px] leading-relaxed text-white/55">{step.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="border-y border-white/[0.05] bg-white/[0.015] py-16">
          <div className="mx-auto w-full max-w-5xl px-6">
            <FadeIn className="mb-10 text-center">
              <SectionLabel>On your side</SectionLabel>
              <h2 className="mx-auto max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
                Trust is the whole point
              </h2>
            </FadeIn>
            <FadeIn>
              <ul className="mx-auto grid max-w-3xl gap-x-10 gap-y-4 sm:grid-cols-2">
                {COMMITMENTS.map((commitment) => (
                  <li key={commitment} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ta-cyan/70"
                    />
                    <span className="text-[14px] leading-relaxed text-white/70">{commitment}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </section>

        {/* Bring your own assistant */}
        <section className="mx-auto w-full max-w-5xl px-6 py-28">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <FadeIn>
              <SectionLabel>Agentic first</SectionLabel>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                Bring your own assistant
              </h2>
              <p className="mb-4 text-[15px] leading-relaxed text-white/60">
                Most tools bolt AI on. totalaud.io opens itself up instead: connect Claude or any
                assistant you already trust, and it can read your release plan, finishing notes and
                follow-ups — with a key you create and can revoke at any moment.
              </p>
              <p className="text-[15px] leading-relaxed text-white/60">
                It can look things up and add to your timeline. It cannot send a single thing on
                your behalf. That line does not move.
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <div className="rounded-2xl border border-white/[0.08] bg-ta-panel/80 p-5 font-mono text-[12px] leading-relaxed">
                <p className="mb-3 text-white/35"># your assistant, your workspace</p>
                <p className="text-white/70">
                  <span className="text-ta-cyan">&gt;</span> what&apos;s left before the single on
                  the 14th?
                </p>
                <p className="mt-3 text-white/50">
                  Three things: the master is due back Friday, the playlist pitch window opens
                  Monday, and two people who covered your last release haven&apos;t heard this one
                  yet.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto w-full max-w-3xl px-6 pb-28 text-center">
          <FadeIn>
            <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Release with confidence
            </h2>
            <p className="mx-auto mb-8 max-w-md text-[15px] leading-relaxed text-white/55">
              Built for any stage of an independent career — first single or fiftieth.
            </p>
            <div className="mx-auto max-w-md">
              <WaitlistForm source="totalaud-io-landing-footer" />
            </div>
            <p className="mt-8 text-[13px] text-white/40">
              Run a PR agency?{' '}
              <a
                href="https://totalaudiopromo.com"
                target="_blank"
                rel="noreferrer"
                className="text-ta-cyan/80 transition-colors hover:text-ta-cyan"
              >
                TAP is the agency workspace — live today
              </a>
            </p>
          </FadeIn>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05]">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-7">
          <p className="text-xs text-white/30">
            Built by the team behind{' '}
            <a
              href="https://totalaudiopromo.com"
              target="_blank"
              rel="noreferrer"
              className="text-white/50 transition-colors hover:text-ta-white"
            >
              TAP
            </a>
            . © {new Date().getFullYear()} Total Audio Promo Ltd.
          </p>
          <nav aria-label="Footer" className="flex gap-5">
            <Link
              href="/faq"
              className="text-xs text-white/30 transition-colors hover:text-white/60"
            >
              FAQ
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-white/30 transition-colors hover:text-white/60"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-white/30 transition-colors hover:text-white/60"
            >
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
