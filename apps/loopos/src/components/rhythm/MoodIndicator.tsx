'use client'

interface MoodAnalysis {
  mood: 'calm' | 'focused' | 'exploratory' | 'stuck' | 'flowing'
  confidence: number
  reason: string
}

interface MoodIndicatorProps {
  mood: MoodAnalysis
}

const moodConfig: Record<
  MoodAnalysis['mood'],
  {
    label: string
    colour: string
    icon: string
  }
> = {
  calm: {
    label: 'Calm',
    colour: '#6B7280',
    icon: '🌊',
  },
  focused: {
    label: 'Focused',
    colour: '#3AA9BE',
    icon: '🎯',
  },
  exploratory: {
    label: 'Exploratory',
    colour: '#8B5CF6',
    icon: '🔍',
  },
  stuck: {
    label: 'Stuck',
    colour: '#F59E0B',
    icon: '🤔',
  },
  flowing: {
    label: 'Flowing',
    colour: '#10B981',
    icon: '✨',
  },
}

export function MoodIndicator({ mood }: MoodIndicatorProps) {
  const config = moodConfig[mood.mood]

  return (
    <div
      style={{
        padding: '1.5rem',
        border: `1px solid ${config.colour}40`,
        borderRadius: '12px',
        backgroundColor: `${config.colour}10`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.75rem',
        }}
      >
        <span style={{ fontSize: '24px' }}>{config.icon}</span>
        <div>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: config.colour,
              marginBottom: '0.25rem',
            }}
          >
            {config.label}
          </h3>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--colour-muted)',
            }}
          >
            {Math.round(mood.confidence * 100)}% confidence
          </p>
        </div>
      </div>

      <p
        style={{
          fontSize: '13px',
          color: 'var(--colour-foreground)',
          lineHeight: '1.6',
        }}
      >
        {mood.reason}
      </p>
    </div>
  )
}
