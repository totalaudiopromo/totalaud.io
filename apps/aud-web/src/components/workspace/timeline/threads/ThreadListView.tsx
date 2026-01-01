'use client'

import { TypingIndicator } from '@/components/ui/EmptyState'
import type { SignalThread } from '@/stores/useSignalThreadStore'
import { ThreadListItem } from './ThreadListItem'

interface ThreadListViewProps {
  threads: SignalThread[]
  activeThreadId: string | null
  isLoading: boolean
  onCreateClick: () => void
  onSelect: (thread: SignalThread) => void
}

export function ThreadListView({
  threads,
  activeThreadId,
  isLoading,
  onCreateClick,
  onSelect,
}: ThreadListViewProps) {
  return (
    <>
      <button
        onClick={onCreateClick}
        style={{
          width: '100%',
          padding: '12px 16px',
          marginBottom: 16,
          fontSize: 13,
          fontWeight: 500,
          color: '#3AA9BE',
          backgroundColor: 'rgba(58, 169, 190, 0.1)',
          border: '1px dashed rgba(58, 169, 190, 0.3)',
          borderRadius: 8,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all 0.12s ease',
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.15)'
          event.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.4)'
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.1)'
          event.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.3)'
        }}
      >
        <span>+</span> Create Thread
      </button>

      {isLoading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <TypingIndicator />
          <span style={{ fontSize: 12 }}>Loading threads...</span>
        </div>
      )}

      {!isLoading && threads.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>{'\u{1F9F5}'}</div>
          <div style={{ fontSize: 13, marginBottom: 4 }}>No threads yet</div>
          <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.3)' }}>
            Connect timeline events into story arcs
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {threads.map((thread) => (
          <ThreadListItem
            key={thread.id}
            thread={thread}
            isActive={activeThreadId === thread.id}
            onClick={() => onSelect(thread)}
          />
        ))}
      </div>
    </>
  )
}
