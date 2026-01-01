'use client'

import type { TAPGenerationStatus } from '@/stores/usePitchStore'

interface TapModalFooterProps {
  hasResult: boolean
  isFormValid: boolean
  status: TAPGenerationStatus
  onClose: () => void
  onGenerate: () => void
  onRegenerate: () => void
  onApply: () => void
}

export function TapModalFooter({
  hasResult,
  isFormValid,
  status,
  onClose,
  onGenerate,
  onRegenerate,
  onApply,
}: TapModalFooterProps) {
  return (
    <div
      style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 12,
      }}
    >
      <button
        onClick={onClose}
        style={{
          padding: '10px 20px',
          fontSize: 13,
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.6)',
          backgroundColor: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 6,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Cancel
      </button>

      {hasResult ? (
        <>
          <button
            onClick={onRegenerate}
            style={{
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.6)',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Regenerate
          </button>
          <button
            onClick={onApply}
            style={{
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 500,
              color: '#0F1113',
              backgroundColor: '#3AA9BE',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Apply to Pitch
          </button>
        </>
      ) : (
        <button
          onClick={onGenerate}
          disabled={!isFormValid || status === 'loading'}
          style={{
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 500,
            color: isFormValid ? '#0F1113' : 'rgba(255, 255, 255, 0.3)',
            backgroundColor: isFormValid ? '#3AA9BE' : 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: 6,
            cursor: isFormValid && status !== 'loading' ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {status === 'loading' ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  border: '2px solid rgba(15, 17, 19, 0.3)',
                  borderTopColor: '#0F1113',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              Generating...
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </>
          ) : (
            'Generate Pitch'
          )}
        </button>
      )}
    </div>
  )
}
