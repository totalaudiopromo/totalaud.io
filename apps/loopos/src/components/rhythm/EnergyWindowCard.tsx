'use client'

import type { EnergyWindowType } from '@loopos/db'

interface EnergyWindowCardProps {
  window: EnergyWindowType
  score: number
  confidence: number
  activityCount: number
}

const windowLabels: Record<EnergyWindowType, string> = {
  early_morning: 'Early Morning',
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  late: 'Late Night',
}

const windowTimes: Record<EnergyWindowType, string> = {
  early_morning: '4–8am',
  morning: '8am–noon',
  afternoon: 'Noon–5pm',
  evening: '5–10pm',
  late: '10pm–4am',
}

export function EnergyWindowCard({
  window,
  score,
  confidence,
  activityCount,
}: EnergyWindowCardProps) {
  const isHighConfidence = confidence >= 0.5
  const isTopWindow = score >= 30 && isHighConfidence

  return (
    <div
      style={{
        padding: '1rem',
        border: `1px solid ${isTopWindow ? 'var(--colour-accent)' : 'var(--colour-border)'}`,
        borderRadius: '8px',
        backgroundColor: isTopWindow ? 'rgba(var(--colour-accent-rgb), 0.05)' : 'transparent',
        transition: 'all 240ms ease-out',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.5rem',
        }}
      >
        <div>
          <h4
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--colour-foreground)',
              marginBottom: '0.25rem',
            }}
          >
            {windowLabels[window]}
          </h4>
          <p
            style={{
              fontSize: '11px',
              color: 'var(--colour-muted)',
            }}
          >
            {windowTimes[window]}
          </p>
        </div>
        <span
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: isTopWindow ? 'var(--colour-accent)' : 'var(--colour-muted)',
          }}
        >
          {score}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'var(--colour-border)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: 'var(--colour-accent)',
            opacity: isHighConfidence ? 0.8 : 0.3,
            transition: 'width 240ms ease-out',
          }}
        />
      </div>

      {!isHighConfidence && (
        <p
          style={{
            fontSize: '10px',
            color: 'var(--colour-muted)',
            marginTop: '0.5rem',
            fontStyle: 'italic',
          }}
        >
          {activityCount < 10
            ? `${activityCount} activities recorded — needs more data`
            : 'Low confidence'}
        </p>
      )}
    </div>
  )
}
