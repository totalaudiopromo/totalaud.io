'use client'

import type { TAPPitchResult } from '@/stores/usePitchStore'

interface TapResultViewProps {
  result: TAPPitchResult
}

export function TapResultView({ result }: TapResultViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {result.confidence && (
        <div
          style={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            backgroundColor:
              result.confidence === 'High'
                ? 'rgba(73, 163, 108, 0.15)'
                : result.confidence === 'Medium'
                  ? 'rgba(196, 160, 82, 0.15)'
                  : 'rgba(249, 115, 22, 0.15)',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 600,
            color:
              result.confidence === 'High'
                ? '#49A36C'
                : result.confidence === 'Medium'
                  ? '#C4A052'
                  : '#F97316',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          &check; {result.confidence} Confidence
        </div>
      )}

      {result.subject && (
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 8,
            }}
          >
            Subject Line
          </label>
          <div
            style={{
              padding: 12,
              backgroundColor: 'rgba(58, 169, 190, 0.08)',
              border: '1px solid rgba(58, 169, 190, 0.2)',
              borderRadius: 8,
              fontSize: 14,
              color: '#F7F8F9',
              fontWeight: 500,
            }}
          >
            {result.subject}
          </div>
        </div>
      )}

      <div>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}
        >
          Pitch Body
        </label>
        <div
          style={{
            padding: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 8,
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.85)',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            maxHeight: 280,
            overflowY: 'auto',
          }}
        >
          {result.body}
        </div>
      </div>

      {result.signature && (
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 8,
            }}
          >
            Signature
          </label>
          <div
            style={{
              padding: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 8,
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.7)',
              fontStyle: 'italic',
            }}
          >
            {result.signature}
          </div>
        </div>
      )}
    </div>
  )
}
