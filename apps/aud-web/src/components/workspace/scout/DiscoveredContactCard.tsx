import {
  Mail,
  ExternalLink,
  CheckCircle,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'
import type { DiscoveredContact } from '@/app/api/scout/discover/route'
import { useScoutStore } from '@/stores/useScoutStore'
import { useCredits } from '@/hooks/useCredits'
import { useCallback } from 'react'

interface DiscoveredContactCardProps {
  contact: DiscoveredContact
  isAdded: boolean
  onAdd: () => void
}

export function DiscoveredContactCard({ contact, isAdded, onAdd }: DiscoveredContactCardProps) {
  const enrichmentStatus = useScoutStore(
    (state) => state.enrichmentStatusById[contact.id] || 'idle'
  )
  const enrichedData = useScoutStore((state) => state.enrichedById[contact.id] || null)
  const enrichmentError = useScoutStore((state) => state.enrichmentErrorById[contact.id] || null)
  const enrichDiscoveredContact = useScoutStore((state) => state.enrichDiscoveredContact)

  const { hasSufficientCredits, deductForEnrichment, formatPounds, balance } = useCredits()
  const enrichmentCost = balance?.enrichmentCostPence || 20

  const handleEnrich = useCallback(async () => {
    if (enrichmentStatus === 'loading' || enrichmentStatus === 'success') return

    if (!hasSufficientCredits) {
      alert('Insufficient credits for enrichment')
      return
    }

    const success = await deductForEnrichment(contact.id, contact.outlet || contact.email)
    if (success) {
      await enrichDiscoveredContact({
        id: contact.id,
        email: contact.email,
        name: contact.name,
        outlet: contact.outlet,
        genres: [], // Could be passed if available
      })
    }
  }, [
    contact,
    enrichmentStatus,
    hasSufficientCredits,
    deductForEnrichment,
    enrichDiscoveredContact,
  ])

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
          {enrichmentStatus === 'idle' && (
            <button
              onClick={handleEnrich}
              style={{
                height: 32,
                padding: '0 10px',
                borderRadius: 6,
                backgroundColor: 'rgba(58, 169, 190, 0.1)',
                border: '1px solid rgba(58, 169, 190, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#3AA9BE',
                fontSize: 12,
                cursor: 'pointer',
              }}
              title={`Enrich with TAP API - ${formatPounds(enrichmentCost)}`}
            >
              <Search size={14} />
              <span>Enrich</span>
            </button>
          )}

          {enrichmentStatus === 'loading' && (
            <div
              style={{
                height: 32,
                padding: '0 10px',
                borderRadius: 6,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: 12,
              }}
            >
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}

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

      {/* Enrichment Results */}
      {enrichmentStatus === 'success' && enrichedData && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(58, 169, 190, 0.05)',
            borderTop: '1px solid rgba(58, 169, 190, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: '#3AA9BE',
            }}
          >
            <ShieldCheck size={14} />
            <span>Enriched via TAP API</span>
            {enrichedData.researchConfidence && (
              <span style={{ fontSize: 10, opacity: 0.6 }}>
                • {enrichedData.researchConfidence} Confidence
              </span>
            )}
          </div>
          {enrichedData.contactIntelligence && (
            <div
              style={{
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: 1.5,
                padding: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 6,
              }}
            >
              {enrichedData.contactIntelligence}
            </div>
          )}
        </div>
      )}

      {/* Enrichment Error */}
      {enrichmentStatus === 'error' && (
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            borderTop: '1px solid rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
            color: '#EF4444',
          }}
        >
          <AlertCircle size={14} />
          <span>{enrichmentError || 'Enrichment failed'}</span>
          <button
            onClick={handleEnrich}
            style={{
              marginLeft: 'auto',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#EF4444',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            Retry
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
