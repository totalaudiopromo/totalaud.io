'use client'

interface SessionSectionProps {
  onSignOut: () => Promise<void>
}

export function SessionSection({ onSignOut }: SessionSectionProps) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#F7F8F9',
          marginBottom: 16,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        Session
      </h2>
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 12,
          padding: '20px',
        }}
      >
        <button
          onClick={async () => {
            await onSignOut()
            window.location.href = '/'
          }}
          style={{
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.7)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 6,
            cursor: 'pointer',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            transition: 'all 0.12s ease',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
            event.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
            event.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          Sign out
        </button>
      </div>
    </section>
  )
}
