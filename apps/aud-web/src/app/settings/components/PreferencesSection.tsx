'use client'

export function PreferencesSection() {
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
        Preferences
      </h2>
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 12,
          padding: '20px',
        }}
      >
        <p
          style={{
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            textAlign: 'center',
            padding: '20px 0',
          }}
        >
          More preferences coming soon...
        </p>
      </div>
    </section>
  )
}
