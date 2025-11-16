import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, BookOpen, Play } from 'lucide-react'
import { colours, spacing, radii, shadows } from '@/styles/tokens'
import { duration, easing } from '@/styles/motion'

export const metadata: Metadata = {
  title: 'Start',
  description:
    'Begin your creative journey with totalaud.io. Try the demo, create a workspace, or learn more about the tools.',
}

export default function StartPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: colours.background,
        padding: spacing[8],
      }}
    >
      <div style={{ maxWidth: '840px', width: '100%' }}>
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: spacing[12],
          }}
        >
          <h1
            style={{
              fontSize: '48px',
              fontWeight: '600',
              color: colours.foreground,
              marginBottom: spacing[3],
              lineHeight: '1.1',
            }}
          >
            totalaud.io
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: colours.foregroundMuted,
              lineHeight: '1.6',
            }}
          >
            A calm workspace for planning releases, exploring ideas, and using small helpful agents.
          </p>
        </div>

        {/* Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: spacing[4],
            marginBottom: spacing[8],
          }}
        >
          {/* Try Demo Card */}
          <Link
            href="/demo"
            style={{
              textDecoration: 'none',
              padding: spacing[6],
              backgroundColor: colours.panel,
              border: `1px solid ${colours.border}`,
              borderRadius: radii.lg,
              transition: `all ${duration.medium}s ${easing.default}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
            className="hover-lift"
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: `${colours.accent}15`,
                borderRadius: radii.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing[4],
              }}
            >
              <Play style={{ width: '24px', height: '24px', color: colours.accent }} />
            </div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: colours.foreground,
                marginBottom: spacing[2],
              }}
            >
              Try the demo
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: colours.foregroundMuted,
                lineHeight: '1.6',
              }}
            >
              Watch how artists plan and explore ideas. Two short demos, no sign-up needed.
            </p>
          </Link>

          {/* Create Workspace Card */}
          <Link
            href="/workspace/new"
            style={{
              textDecoration: 'none',
              padding: spacing[6],
              backgroundColor: colours.panel,
              border: `1px solid ${colours.border}`,
              borderRadius: radii.lg,
              transition: `all ${duration.medium}s ${easing.default}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
            className="hover-lift"
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: `${colours.accent}15`,
                borderRadius: radii.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing[4],
              }}
            >
              <Sparkles style={{ width: '24px', height: '24px', color: colours.accent }} />
            </div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: colours.foreground,
                marginBottom: spacing[2],
              }}
            >
              Create a workspace
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: colours.foregroundMuted,
                lineHeight: '1.6',
              }}
            >
              Start your own project. Add notes, build timelines, and explore with agents.
            </p>
          </Link>

          {/* About Card */}
          <Link
            href="/about"
            style={{
              textDecoration: 'none',
              padding: spacing[6],
              backgroundColor: colours.panel,
              border: `1px solid ${colours.border}`,
              borderRadius: radii.lg,
              transition: `all ${duration.medium}s ${easing.default}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
            className="hover-lift"
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: `${colours.accent}15`,
                borderRadius: radii.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing[4],
              }}
            >
              <BookOpen style={{ width: '24px', height: '24px', color: colours.accent }} />
            </div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: colours.foreground,
                marginBottom: spacing[2],
              }}
            >
              About totalaud.io
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: colours.foregroundMuted,
                lineHeight: '1.6',
              }}
            >
              Learn what this is for, who built it, and why it exists.
            </p>
          </Link>
        </div>

        {/* Footer note */}
        <div
          style={{
            textAlign: 'center',
            paddingTop: spacing[6],
            borderTop: `1px solid ${colours.border}`,
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: colours.foregroundSubtle,
            }}
          >
            No rush. Here if you want it.
          </p>
        </div>

        <style jsx>{`
          .hover-lift:hover {
            transform: translateY(-2px);
            border-color: ${colours.accent};
            box-shadow: ${shadows.glow};
          }
        `}</style>
      </div>
    </div>
  )
}
