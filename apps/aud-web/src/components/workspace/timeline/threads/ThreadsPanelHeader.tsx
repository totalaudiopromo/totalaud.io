'use client'

interface ThreadsPanelHeaderProps {
  view: 'list' | 'create' | 'detail'
  selectedTitle?: string
  onBack: () => void
  onClose: () => void
}

export function ThreadsPanelHeader({
  view,
  selectedTitle,
  onBack,
  onClose,
}: ThreadsPanelHeaderProps) {
  return (
    <div
      style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {view !== 'list' && (
          <button
            onClick={onBack}
            aria-label="Back to thread list"
            style={{
              padding: 4,
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            &larr;
          </button>
        )}
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          {view === 'list' && 'Signal Threads'}
          {view === 'create' && 'New Thread'}
          {view === 'detail' && selectedTitle}
        </h2>
      </div>

      <button
        onClick={onClose}
        aria-label="Close threads panel"
        style={{
          padding: 6,
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.4)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        &times;
      </button>
    </div>
  )
}
