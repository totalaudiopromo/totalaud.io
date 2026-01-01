'use client'

interface TapModalHeaderProps {
  onClose: () => void
}

export function TapModalHeader({ onClose }: TapModalHeaderProps) {
  return (
    <div
      style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <h2
          id="tap-modal-title"
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: '#F7F8F9',
          }}
        >
          Generate with TAP
        </h2>
        <p
          id="tap-modal-description"
          style={{
            margin: 0,
            marginTop: 4,
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          Create a pitch using Total Audio Platform
        </p>
      </div>
      <button
        onClick={onClose}
        aria-label="Close modal"
        style={{
          padding: 8,
          fontSize: 18,
          color: 'rgba(255, 255, 255, 0.4)',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  )
}
