'use client'

import { X } from 'lucide-react'
import { colours, spacing, radii } from '@/styles/tokens'
import { duration, easing, prefersReducedMotion } from '@/styles/motion'

interface FirstRunBannerProps {
  onDismiss: () => void
}

export function FirstRunBanner({ onDismiss }: FirstRunBannerProps) {
  const shouldAnimate = !prefersReducedMotion()

  return (
    <div
      style={{
        position: 'fixed',
        top: spacing[4],
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        maxWidth: '600px',
        width: '90%',
        opacity: shouldAnimate ? 1 : 1,
        animation: shouldAnimate ? `fadeIn ${duration.medium}s ${easing.default}` : 'none',
      }}
    >
      <div
        style={{
          backgroundColor: colours.background,
          border: `1px solid ${colours.border}`,
          borderRadius: radii.lg,
          padding: spacing[5],
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.4)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          aria-label="Dismiss welcome message"
          style={{
            position: 'absolute',
            top: spacing[3],
            right: spacing[3],
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: colours.foregroundMuted,
            padding: spacing[1],
            borderRadius: radii.sm,
            transition: `background-color ${duration.fast}s ${easing.default}`,
          }}
          className="close-btn"
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>

        {/* Content */}
        <div style={{ paddingRight: spacing[6] }}>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colours.foreground,
              marginBottom: spacing[3],
            }}
          >
            Welcome to totalaud.io
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: colours.foregroundMuted,
              lineHeight: '1.6',
              marginBottom: spacing[4],
            }}
          >
            This is a quiet workspace for planning and exploring ideas. You could start by:
          </p>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: '14px',
              color: colours.foregroundMuted,
              lineHeight: '1.8',
            }}
          >
            <li style={{ paddingLeft: spacing[2], position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  color: colours.accent,
                }}
              >
                •
              </span>
              Adding your first note in the journal
            </li>
            <li style={{ paddingLeft: spacing[2], position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  color: colours.accent,
                }}
              >
                •
              </span>
              Trying the coach with a question or idea
            </li>
            <li style={{ paddingLeft: spacing[2], position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  color: colours.accent,
                }}
              >
                •
              </span>
              Creating a quick idea on the timeline
            </li>
          </ul>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-8px) translateX(-50%);
            }
            to {
              opacity: 1;
              transform: translateY(0) translateX(-50%);
            }
          }

          .close-btn:hover {
            background-color: ${colours.panel};
          }
        `}</style>
      </div>
    </div>
  )
}
