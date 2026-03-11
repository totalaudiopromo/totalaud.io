import React from 'react'

interface TimelineFooterProps {
  threadsPanelOpen: boolean
  setThreadsPanelOpen: (open: boolean) => void
  handleScrollToToday: () => void
  eventCount: number
}

export function TimelineFooter({
  threadsPanelOpen,
  setThreadsPanelOpen,
  handleScrollToToday,
  eventCount,
}: TimelineFooterProps) {
  return (
    <div
      style={{
        padding: '12px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <span
        className="hidden md:inline"
        style={{
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.4)',
        }}
      >
        Drag events between lanes • Scroll to view weeks
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => setThreadsPanelOpen(!threadsPanelOpen)}
          aria-label={threadsPanelOpen ? 'Close threads panel' : 'Open threads panel'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 500,
            color: threadsPanelOpen ? '#F472B6' : 'rgba(255, 255, 255, 0.6)',
            backgroundColor: threadsPanelOpen
              ? 'rgba(244, 114, 182, 0.15)'
              : 'rgba(255, 255, 255, 0.05)',
            border: threadsPanelOpen
              ? '1px solid rgba(244, 114, 182, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all 0.12s ease',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 17H7A5 5 0 0 1 7 7h2" />
            <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Threads
        </button>
        <button
          onClick={handleScrollToToday}
          aria-label="Scroll to today"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 500,
            color: '#3AA9BE',
            backgroundColor: 'rgba(58, 169, 190, 0.1)',
            border: '1px solid rgba(58, 169, 190, 0.2)',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all 0.12s ease',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.15)'
            e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.1)'
            e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.2)'
          }}
        >
          <span style={{ fontSize: 10 }} aria-hidden="true">
            ◉
          </span>
          Today
        </button>
        <span
          style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.3)',
          }}
        >
          {eventCount} events
        </span>
      </div>
    </div>
  )
}
