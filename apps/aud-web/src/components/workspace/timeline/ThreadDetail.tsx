import React, { useState } from 'react'
import { SignalThread } from '@/stores/useSignalThreadStore'
import { TypingIndicator } from '@/components/ui/EmptyState'
import { THREAD_TYPES, ThreadIcon } from './ThreadUtils'

interface ThreadDetailProps {
  thread: SignalThread
  isGenerating: boolean
  onGenerateNarrative: () => void
  onDelete: () => void
}

export function ThreadDetail({
  thread,
  isGenerating,
  onGenerateNarrative,
  onDelete,
}: ThreadDetailProps) {
  const typeInfo = THREAD_TYPES.find((t) => t.key === thread.threadType)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Thread info */}
      <div
        style={{
          padding: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: thread.colour,
              boxShadow: `0 0 12px ${thread.colour}50`,
            }}
          />
          <span style={{ display: 'inline-flex', width: 16, height: 16, color: '#3AA9BE' }}>
            {typeInfo && <ThreadIcon type={typeInfo.iconType} size={16} />}
          </span>
          <span
            style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            {typeInfo?.label}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.4)',
                marginBottom: 4,
              }}
            >
              Events
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: thread.colour,
              }}
            >
              {thread.eventIds.length}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.4)',
                marginBottom: 4,
              }}
            >
              Date Range
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              {thread.startDate && thread.endDate
                ? `${new Date(thread.startDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })} – ${new Date(thread.endDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}`
                : 'No dates'}
            </div>
          </div>
        </div>
      </div>

      {/* Narrative section */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <h3
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Narrative
          </h3>
          <button
            onClick={onGenerateNarrative}
            disabled={isGenerating || thread.eventIds.length < 2}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 500,
              color: '#3AA9BE',
              backgroundColor: 'rgba(58, 169, 190, 0.1)',
              border: '1px solid rgba(58, 169, 190, 0.2)',
              borderRadius: 6,
              cursor: isGenerating || thread.eventIds.length < 2 ? 'not-allowed' : 'pointer',
              opacity: isGenerating || thread.eventIds.length < 2 ? 0.5 : 1,
            }}
          >
            {isGenerating ? (
              <>
                <TypingIndicator />
                Generating...
              </>
            ) : (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
                Generate Story
              </>
            )}
          </button>
        </div>

        {thread.narrativeSummary ? (
          <div
            style={{
              padding: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            <p
              style={{
                fontSize: 12,
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.8)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {thread.narrativeSummary}
            </p>
          </div>
        ) : (
          <div
            style={{
              padding: 20,
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 8,
              border: '1px dashed rgba(255, 255, 255, 0.08)',
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              {thread.eventIds.length < 2
                ? 'Add at least 2 events to generate a narrative'
                : 'Click "Generate Story" to create a narrative'}
            </p>
          </div>
        )}
      </div>

      {/* Insights section */}
      {thread.insights.length > 0 && (
        <div>
          <h3
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: 12,
            }}
          >
            Notes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {thread.insights.map((insight, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'rgba(58, 169, 190, 0.05)',
                  border: '1px solid rgba(58, 169, 190, 0.1)',
                  borderRadius: 6,
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete button */}
      <div style={{ marginTop: 'auto', paddingTop: 20 }}>
        {showDeleteConfirm ? (
          <div
            style={{
              display: 'flex',
              gap: 8,
            }}
          >
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                flex: 1,
                padding: '10px 16px',
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.6)',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              style={{
                flex: 1,
                padding: '10px 16px',
                fontSize: 12,
                fontWeight: 500,
                color: 'white',
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Confirm Delete
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: 12,
              color: 'rgba(239, 68, 68, 0.8)',
              backgroundColor: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Delete Thread
          </button>
        )}
      </div>
    </div>
  )
}
