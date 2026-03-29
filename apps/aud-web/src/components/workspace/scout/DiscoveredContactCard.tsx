import { Mail, ExternalLink, CheckCircle, Plus } from 'lucide-react'
import type { DiscoveredContact } from '@/app/api/scout/discover/route'

interface DiscoveredContactCardProps {
  contact: DiscoveredContact
  isAdded: boolean
  onAdd: () => void
}

export function DiscoveredContactCard({ contact, isAdded, onAdd }: DiscoveredContactCardProps) {
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
    </div>
  )
}
