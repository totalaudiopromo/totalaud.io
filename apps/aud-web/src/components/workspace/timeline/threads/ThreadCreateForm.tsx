'use client'

import type { ThreadType } from '@/stores/useSignalThreadStore'
import { THREAD_COLOURS, THREAD_TYPES } from './constants'

interface NewThreadState {
  title: string
  threadType: ThreadType
  colour: string
}

interface ThreadCreateFormProps {
  newThread: NewThreadState
  setNewThread: (next: NewThreadState) => void
  onCreate: () => void
  isLoading: boolean
}

export function ThreadCreateForm({
  newThread,
  setNewThread,
  onCreate,
  isLoading,
}: ThreadCreateFormProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Thread Title
        </label>
        <input
          type="text"
          value={newThread.title}
          onChange={(event) => setNewThread({ ...newThread, title: event.target.value })}
          placeholder="e.g., EP Release Journey"
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.9)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 6,
            outline: 'none',
          }}
        />
      </div>

      <div>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Thread Type
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {THREAD_TYPES.map((type) => (
            <button
              key={type.key}
              onClick={() => setNewThread({ ...newThread, threadType: type.key })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                backgroundColor:
                  newThread.threadType === type.key
                    ? 'rgba(58, 169, 190, 0.15)'
                    : 'rgba(255, 255, 255, 0.03)',
                border:
                  newThread.threadType === type.key
                    ? '1px solid rgba(58, 169, 190, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 6,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.12s ease',
              }}
            >
              <span style={{ fontSize: 16 }}>{type.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  {type.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  {type.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Thread Colour
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {THREAD_COLOURS.map((colour) => (
            <button
              key={colour}
              onClick={() => setNewThread({ ...newThread, colour })}
              aria-label={`Select colour ${colour}`}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: colour,
                border: newThread.colour === colour ? '2px solid white' : '2px solid transparent',
                cursor: 'pointer',
                boxShadow: `0 0 12px ${colour}40`,
                transition: 'all 0.12s ease',
              }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onCreate}
        disabled={!newThread.title.trim() || isLoading}
        style={{
          width: '100%',
          padding: '12px 16px',
          marginTop: 8,
          fontSize: 13,
          fontWeight: 600,
          color: '#0F1113',
          backgroundColor: '#3AA9BE',
          border: 'none',
          borderRadius: 8,
          cursor: newThread.title.trim() ? 'pointer' : 'not-allowed',
          opacity: newThread.title.trim() ? 1 : 0.5,
          boxShadow: '0 4px 20px rgba(58, 169, 190, 0.3)',
          transition: 'all 0.12s ease',
        }}
      >
        Create Thread
      </button>
    </div>
  )
}
