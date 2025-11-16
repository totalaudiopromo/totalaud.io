'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { colours, spacing, radii } from '@/styles/tokens'
import { duration, easing, prefersReducedMotion } from '@/styles/motion'

interface ZeroStateProps {
  icon?: LucideIcon
  title?: string
  message: string
  children?: ReactNode
}

export function ZeroState({ icon: Icon, title, message, children }: ZeroStateProps) {
  const shouldAnimate = !prefersReducedMotion()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[12],
        textAlign: 'center',
        opacity: shouldAnimate ? 1 : 1,
        animation: shouldAnimate ? `fadeIn ${duration.medium}s ${easing.default}` : 'none',
      }}
    >
      {Icon && (
        <div
          style={{
            width: '64px',
            height: '64px',
            backgroundColor: `${colours.accent}10`,
            borderRadius: radii.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing[4],
          }}
        >
          <Icon style={{ width: '32px', height: '32px', color: colours.accent, opacity: 0.6 }} />
        </div>
      )}

      {title && (
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colours.foreground,
            marginBottom: spacing[2],
          }}
        >
          {title}
        </h3>
      )}

      <p
        style={{
          fontSize: '14px',
          color: colours.foregroundMuted,
          lineHeight: '1.6',
          maxWidth: '400px',
          marginBottom: children ? spacing[4] : 0,
        }}
      >
        {message}
      </p>

      {children}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
