'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, ExternalLink, CheckCircle, Plus } from 'lucide-react'
import type { DiscoveredContact } from '@/app/api/scout/discover/route'
import type { EnrichmentStatus, EnrichedContact } from '@/types/scout'
import { ContactEnrichment } from './ContactEnrichment'
import { ENRICHMENT_COST_PENCE } from '@/lib/credits/constants'

interface DiscoveredContactCardProps {
  contact: DiscoveredContact
  isAdded: boolean
  onAdd: () => void
}

function formatPounds(pence: number): string {
  return `\u00A3${(pence / 100).toFixed(2)}`
}

export function DiscoveredContactCard({ contact, isAdded, onAdd }: DiscoveredContactCardProps) {
  const [enrichmentStatus, setEnrichmentStatus] = useState<EnrichmentStatus>('idle')
  const [enrichmentData, setEnrichmentData] = useState<EnrichedContact | null>(null)
  const [enrichmentError, setEnrichmentError] = useState<string | null>(null)
  const [hasCredits, setHasCredits] = useState(false)

  // Fetch credit balance on mount
  useEffect(() => {
    let cancelled = false

    async function fetchBalance() {
      try {
        const res = await fetch('/api/credits')
        if (!res.ok) return
        const body = await res.json()
        if (!cancelled && body.success) {
          setHasCredits(body.balance.balancePence >= ENRICHMENT_COST_PENCE)
        }
      } catch {
        // Silently fail -- button will show as no credits
      }
    }

    fetchBalance()
    return () => {
      cancelled = true
    }
  }, [])

  const handleValidate = useCallback(async () => {
    setEnrichmentStatus('loading')
    setEnrichmentError(null)

    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contact.name || contact.outlet || contact.email.split('@')[0],
          email: contact.email,
          outlet: contact.outlet || contact.sourceDomain,
        }),
      })

      const body = await res.json()

      if (!res.ok || !body.success) {
        setEnrichmentStatus('error')
        setEnrichmentError(body.error || 'Enrichment failed')

        // If insufficient credits, update the hasCredits flag
        if (res.status === 402) {
          setHasCredits(false)
        }
        return
      }

      // Map EnrichmentOutput to EnrichedContact shape expected by ContactEnrichment
      const data = body.data
      setEnrichmentData({
        contactIntelligence: [
          data.role && `Role: ${data.role}`,
          data.platform && `Platform: ${data.platform}`,
          data.coverage && `Coverage: ${data.coverage}`,
          data.contactMethod && `Preferred contact: ${data.contactMethod}`,
          data.bestTiming && `Best timing: ${data.bestTiming}`,
          data.submissionGuidelines && `Guidelines: ${data.submissionGuidelines}`,
          data.geographicScope && `Scope: ${data.geographicScope}`,
          data.bbcStation && `BBC Station: ${data.bbcStation}`,
          data.genres?.length && `Genres: ${data.genres.join(', ')}`,
          data.pitchTips?.length && `Tips: ${data.pitchTips.join('; ')}`,
        ]
          .filter(Boolean)
          .join('\n'),
        researchConfidence: data.confidence,
        lastResearched: new Date().toISOString(),
      })
      setEnrichmentStatus('success')

      // Update credit state after deduction
      if (typeof body.newBalance === 'number') {
        setHasCredits(body.newBalance >= ENRICHMENT_COST_PENCE)
      }
    } catch {
      setEnrichmentStatus('error')
      setEnrichmentError('Network error -- please try again')
    }
  }, [contact])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: 'rgba(58, 169, 190, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Mail size={16} style={{ color: '#3AA9BE' }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#F7F8F9',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {contact.email}
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>{contact.outlet || contact.sourceDomain}</span>
            {contact.outletType && (
              <span
                style={{
                  padding: '2px 6px',
                  backgroundColor: 'rgba(58, 169, 190, 0.1)',
                  borderRadius: 4,
                  fontSize: 10,
                  color: '#3AA9BE',
                  textTransform: 'uppercase',
                }}
              >
                {contact.outletType}
              </span>
            )}
            <CheckCircle size={12} style={{ color: '#22C55E' }} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <a
            href={contact.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              textDecoration: 'none',
            }}
            title="View source"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={onAdd}
            disabled={isAdded}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              backgroundColor: isAdded ? 'rgba(34, 197, 94, 0.1)' : 'rgba(58, 169, 190, 0.1)',
              border: `1px solid ${isAdded ? 'rgba(34, 197, 94, 0.3)' : 'rgba(58, 169, 190, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isAdded ? '#22C55E' : '#3AA9BE',
              cursor: isAdded ? 'default' : 'pointer',
            }}
            title={isAdded ? 'Added to timeline' : 'Add to timeline'}
          >
            {isAdded ? <CheckCircle size={14} /> : <Plus size={14} />}
          </button>
        </div>
      </div>

      {/* Enrichment section */}
      <div style={{ padding: '0 16px 14px' }}>
        <ContactEnrichment
          status={enrichmentStatus}
          data={enrichmentData}
          error={enrichmentError}
          cost={ENRICHMENT_COST_PENCE}
          hasCredits={hasCredits}
          onValidate={handleValidate}
          formatPounds={formatPounds}
        />
      </div>
    </div>
  )
}
