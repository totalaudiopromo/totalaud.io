/**
 * Pitch Toolbar Component
 * 2025 Brand Pivot - Cinematic Editorial
 *
 * Controls for the Pitch editor
 */

'use client'

export function PitchToolbar() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundColor: 'rgba(15, 17, 19, 0.95)',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      {/* Left: Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          Pitch Builder
        </h2>
        <span
          style={{
            fontSize: 12,
            padding: '4px 8px',
            backgroundColor: 'rgba(58, 169, 190, 0.1)',
            border: '1px solid rgba(58, 169, 190, 0.2)',
            borderRadius: 4,
            color: '#3AA9BE',
          }}
        >
          AI-Powered
        </span>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Export dropdown placeholder */}
        <button
          style={{
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.6)',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all 0.12s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
          }}
        >
          Export
        </button>

        {/* Save button */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 500,
            color: '#0F1113',
            backgroundColor: '#3AA9BE',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'opacity 0.12s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          Save Draft
        </button>
      </div>
    </div>
  )
}
