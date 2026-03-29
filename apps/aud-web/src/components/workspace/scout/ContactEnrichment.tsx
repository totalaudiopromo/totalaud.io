import React from 'react'
import { Search, Loader2, AlertCircle, ShieldCheck } from 'lucide-react'
import { EnrichmentStatus, EnrichedContact } from '@/types/scout'

interface ContactEnrichmentProps {
  status: EnrichmentStatus
  data: EnrichedContact | null
  error: string | null
  cost: number
  hasCredits: boolean
  onValidate: () => void
  formatPounds: (pence: number) => string
}

export function ContactEnrichment({
  status,
  data,
  error,
  cost,
  hasCredits,
  onValidate,
  formatPounds,
}: ContactEnrichmentProps) {
  return (
    <div className="mt-3 pt-3 border-t border-white/6">
      {/* Idle State - Show validate button */}
      {status === 'idle' && (
        <>
          {hasCredits ? (
            <button
              onClick={onValidate}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 rounded-lg border border-white/10 hover:border-ta-cyan/30 hover:bg-ta-cyan/5 transition-all text-sm text-white/70 hover:text-white"
            >
              <Search size={14} />
              Validate Contact
              <span className="text-white/40">•</span>
              <span className="text-ta-cyan">{formatPounds(cost)}</span>
            </button>
          ) : (
            <div className="space-y-2">
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white/3 rounded-lg border border-white/6 text-sm text-white/40 cursor-not-allowed"
              >
                <Search size={14} />
                Validate Contact
                <span>•</span>
                <span>{formatPounds(cost)}</span>
              </button>
              <p className="text-xs text-white/40 text-center">
                No credits available.{' '}
                <button
                  onClick={() => {
                    window.location.href = '/pricing'
                  }}
                  className="text-ta-cyan hover:underline"
                >
                  Add credits
                </button>
              </p>
            </div>
          )}
        </>
      )}

      {/* Loading State */}
      {status === 'loading' && (
        <div className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white/3 rounded-lg border border-white/6 text-sm text-white/50">
          <Loader2 size={14} className="animate-spin" />
          Validating contact...
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 rounded-lg border border-red-500/20 text-sm text-red-400">
            <AlertCircle size={14} />
            {error || 'Validation failed'}
          </div>
          <button
            onClick={onValidate}
            className="w-full text-xs text-white/50 hover:text-white transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Success State - Show enrichment results */}
      {status === 'success' && data && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <ShieldCheck size={14} />
            Contact Validated
          </div>

          {/* Confidence Score */}
          {data.researchConfidence && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Confidence</span>
              <span
                className={
                  data.researchConfidence === 'High'
                    ? 'text-emerald-400'
                    : data.researchConfidence === 'Medium'
                      ? 'text-amber-400'
                      : 'text-red-400'
                }
              >
                {data.researchConfidence}
              </span>
            </div>
          )}

          {/* Email Validation */}
          {data.emailValidation && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Email</span>
              <span className={data.emailValidation.isValid ? 'text-emerald-400' : 'text-red-400'}>
                {data.emailValidation.isValid ? 'Verified' : 'Invalid'}
                {data.emailValidation.confidence && (
                  <span className="text-white/30 ml-1">
                    ({Math.round(data.emailValidation.confidence * 100)}%)
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Contact Intelligence */}
          {data.contactIntelligence && (
            <div className="text-xs text-white/50 leading-relaxed mt-2 p-2 bg-white/3 rounded-lg">
              {data.contactIntelligence}
            </div>
          )}

          {/* Last Researched */}
          {data.lastResearched && (
            <div className="text-xs text-white/30">
              Last researched:{' '}
              {new Date(data.lastResearched).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
