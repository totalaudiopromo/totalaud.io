'use client'

import { colours, spacing, radii } from '@/styles/tokens'
import { duration, easing, prefersReducedMotion } from '@/styles/motion'

interface ContextualNudgeProps {
  message: string
  show: boolean
}

export function ContextualNudge({ message, show }: ContextualNudgeProps) {
  const shouldAnimate = !prefersReducedMotion()

  if (!show) return null

  return (
    <div
      style={{
        fontSize: '13px',
        color: colours.foregroundSubtle,
        padding: `${spacing[2]} ${spacing[3]}`,
        backgroundColor: `${colours.accent}08`,
        border: `1px solid ${colours.accent}20`,
        borderRadius: radii.sm,
        marginTop: spacing[2],
        opacity: shouldAnimate ? 1 : 1,
        animation: shouldAnimate ? `fadeIn ${duration.medium}s ${easing.default}` : 'none',
      }}
    >
      {message}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
