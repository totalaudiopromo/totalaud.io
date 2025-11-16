import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { colours, spacing, radii } from '@/styles/tokens'

export const metadata: Metadata = {
  title: 'About',
  description:
    'totalaud.io is a calm workspace for independent artists to plan releases, develop ideas, and use small helpful agents. Built in Britain.',
}

export default function AboutPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: colours.background,
        padding: spacing[8],
      }}
    >
      <div style={{ maxWidth: '640px', width: '100%' }}>
        {/* Back link */}
        <Link
          href="/"
          className="hover:opacity-70"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: spacing[2],
            color: colours.foregroundMuted,
            fontSize: '14px',
            textDecoration: 'none',
            marginBottom: spacing[8],
            transition: 'opacity 0.12s',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Content */}
        <article>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '600',
              color: colours.foreground,
              marginBottom: spacing[4],
              lineHeight: '1.2',
            }}
          >
            About totalaud.io
          </h1>

          <div
            style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: colours.foregroundMuted,
            }}
          >
            <p style={{ marginBottom: spacing[4] }}>
              <strong style={{ color: colours.foreground }}>totalaud.io</strong> is a calm
              workspace for independent artists to plan releases, develop ideas, and use small
              helpful agents.
            </p>

            <p style={{ marginBottom: spacing[4] }}>
              It tries to make the messy parts of music release planning feel more manageable:
              turning scattered notes into structured timelines, getting feedback on promotional
              ideas, and keeping track of radio contacts and press targets.
            </p>

            <p style={{ marginBottom: spacing[4] }}>
              This project exists because independent artists deserve tools that respect their
              creative process—not enterprise software dressed up for individuals. No growth hacks,
              no hype, no unnecessary complexity.
            </p>

            <p style={{ marginBottom: spacing[4] }}>
              It's built for musicians releasing their own work, small labels managing a handful of
              artists, and PR agencies like Liberty Music PR who need clarity without corporate
              overhead.
            </p>

            <p style={{ marginBottom: spacing[6], paddingBottom: spacing[6] }}>
              Made for independent artists.
              <br />
              <span style={{ color: colours.foregroundSubtle }}>Built in Britain.</span>
            </p>

            {/* Contact */}
            <div
              style={{
                paddingTop: spacing[6],
                borderTop: `1px solid ${colours.border}`,
              }}
            >
              <p style={{ fontSize: '14px', color: colours.foregroundSubtle }}>
                Questions or feedback?{' '}
                <a
                  href="mailto:hello@totalaud.io"
                  style={{
                    color: colours.accent,
                    textDecoration: 'none',
                  }}
                  className="hover:underline"
                >
                  hello@totalaud.io
                </a>
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
