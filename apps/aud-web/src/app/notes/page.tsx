/**
 * /notes - The Unsigned Advantage newsletter page
 *
 * Shared newsletter across totalaud.io + Total Audio Promo
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { newsletter } from '@/lib/newsletter'
import { WaitlistForm } from '@/components/landing/WaitlistForm'

export const metadata: Metadata = {
  title: 'Notes — The Unsigned Advantage',
  description:
    'Notes from building tools for independent artists. Decisions, trade-offs, and things I notice about music and releasing.',
}

export default function NotesPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0B0C',
        color: '#F7F8F9',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '80px 24px 60px',
      }}
    >
      <main
        style={{
          maxWidth: '560px',
          width: '100%',
        }}
      >
        {/* Back link */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.5)',
            textDecoration: 'none',
            marginBottom: '48px',
            transition: 'color 0.2s ease',
          }}
        >
          ← Back to totalaud.io
        </Link>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(28px, 5vw, 36px)',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            marginBottom: '8px',
          }}
        >
          {newsletter.name}
        </h1>

        {/* Subhead */}
        <p
          style={{
            fontSize: '16px',
            color: '#3AA9BE',
            marginBottom: '32px',
          }}
        >
          {newsletter.contextLabel}
        </p>

        {/* Description */}
        <div
          style={{
            fontSize: '15px',
            lineHeight: 1.8,
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: '40px',
          }}
        >
          <p style={{ marginBottom: '16px' }}>
            I write about what I'm learning while building tools for independent artists — the
            decisions, trade-offs, mistakes, and things I notice about music, releasing, and this
            industry.
          </p>
          <p style={{ marginBottom: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>
            It's a builder's log. Sometimes messy. Always honest.
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
            {newsletter.copy.sharedNote}
          </p>
        </div>

        {/* Signup form */}
        <div
          style={{
            padding: '28px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            marginBottom: '24px',
          }}
        >
          <p
            style={{
              fontSize: '15px',
              fontWeight: 500,
              marginBottom: '16px',
            }}
          >
            {newsletter.copy.formLabel}
          </p>
          <WaitlistForm />
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '12px',
            }}
          >
            {newsletter.copy.formHelper}
          </p>
        </div>

        {/* Archive link */}
        <a
          href={newsletter.archiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            color: '#3AA9BE',
            textDecoration: 'none',
            transition: 'opacity 0.2s ease',
          }}
        >
          {newsletter.copy.archiveLink} →
        </a>
      </main>
    </div>
  )
}
