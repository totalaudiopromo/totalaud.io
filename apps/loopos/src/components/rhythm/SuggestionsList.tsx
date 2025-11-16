'use client'

interface RhythmSuggestion {
  id: string
  message: string
  tone: 'info' | 'encouragement' | 'awareness'
}

interface SuggestionsListProps {
  suggestions: RhythmSuggestion[]
}

const toneIcons: Record<RhythmSuggestion['tone'], string> = {
  info: '💡',
  encouragement: '✨',
  awareness: '👀',
}

export function SuggestionsList({ suggestions }: SuggestionsListProps) {
  if (suggestions.length === 0) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--colour-muted)',
          fontSize: '13px',
        }}
      >
        No suggestions yet. Keep creating and patterns will emerge.
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1rem',
      }}
    >
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(var(--colour-accent-rgb), 0.05)',
            border: '1px solid rgba(var(--colour-accent-rgb), 0.15)',
            borderRadius: '8px',
            fontSize: '13px',
            lineHeight: '1.6',
            color: 'var(--colour-foreground)',
          }}
        >
          <span style={{ marginRight: '0.5rem' }}>{toneIcons[suggestion.tone]}</span>
          {suggestion.message}
        </div>
      ))}
    </div>
  )
}
