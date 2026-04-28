/**
 * CuratedContactsGrid
 *
 * Displays tier-gated curated contacts from the TAP enrichment database.
 * Shows contact cards with enrichment intelligence, save functionality,
 * and upgrade prompts for tier limits.
 */

'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useCuratedContactsStore, type CuratedContact } from '@/stores/useCuratedContactsStore'

// ============================================================================
// Icons
// ============================================================================

const RadioIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
    <circle cx="12" cy="12" r="2" />
    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
    <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
  </svg>
)

const PressIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6z" />
  </svg>
)

const PlaylistIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15V6M18.5 18a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM12 12H3M16 6H3M12 18H3" />
  </svg>
)

const BlogIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
)

const PodcastIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
  </svg>
)

const SaveIcon = ({ filled }: { filled: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
)

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
)

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
)

const PLATFORM_ICONS: Record<string, React.FC> = {
  radio: RadioIcon,
  press: PressIcon,
  playlist: PlaylistIcon,
  blog: BlogIcon,
  podcast: PodcastIcon,
}

const PLATFORM_COLOURS: Record<string, string> = {
  radio: '#F59E0B',
  press: '#8B5CF6',
  playlist: '#10B981',
  blog: '#FB923C',
  podcast: '#EC4899',
}

type PlatformFilter = 'radio' | 'press' | 'playlist' | 'blog' | 'podcast' | null
const PLATFORMS: PlatformFilter[] = ['radio', 'press', 'playlist', 'blog', 'podcast']

// ============================================================================
// Contact Card
// ============================================================================

function CuratedContactCard({
  contact,
  isSaved,
  onSave,
  onUnsave,
}: {
  contact: CuratedContact
  isSaved: boolean
  onSave: () => void
  onUnsave: () => void
}) {
  const [copied, setCopied] = useState(false)
  const colour = PLATFORM_COLOURS[contact.platformType ?? ''] ?? '#3AA9BE'
  const Icon = PLATFORM_ICONS[contact.platformType ?? '']

  const handleCopyEmail = useCallback(() => {
    if (!contact.email) return
    navigator.clipboard.writeText(contact.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [contact.email])

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 10,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${colour}33`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
      }}
    >
      {/* Header: type badge + save button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {contact.platformType && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 500,
                backgroundColor: `${colour}15`,
                color: colour,
                textTransform: 'capitalize',
              }}
            >
              {Icon && <Icon />}
              {contact.platformType}
            </span>
          )}
          {contact.enrichmentConfidence && (
            <span
              style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor:
                  contact.enrichmentConfidence === 'High'
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(245, 158, 11, 0.1)',
                color: contact.enrichmentConfidence === 'High' ? '#10B981' : '#F59E0B',
              }}
            >
              {contact.enrichmentConfidence}
            </span>
          )}
        </div>
        <button
          onClick={isSaved ? onUnsave : onSave}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: isSaved ? '#3AA9BE' : 'rgba(255, 255, 255, 0.3)',
            padding: 4,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            minWidth: 28,
            minHeight: 28,
            justifyContent: 'center',
          }}
          title={isSaved ? 'Remove from saved' : 'Save contact'}
        >
          <SaveIcon filled={isSaved} />
        </button>
      </div>

      {/* Name and outlet */}
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#F7F8F9',
            marginBottom: 2,
            fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
          }}
        >
          {contact.name ?? contact.outlet ?? 'Unknown contact'}
        </div>
        {contact.outlet && contact.name && (
          <div
            style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
            }}
          >
            {contact.outlet}
          </div>
        )}
        {contact.role && (
          <div
            style={{
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.4)',
              marginTop: 2,
              fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
            }}
          >
            {contact.role}
          </div>
        )}
      </div>

      {/* Genres */}
      {contact.genres.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {contact.genres.slice(0, 4).map((genre) => (
            <span
              key={genre}
              style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              {genre}
            </span>
          ))}
        </div>
      )}

      {/* Email or locked */}
      {contact.email ? (
        <button
          onClick={handleCopyEmail}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: '#3AA9BE',
            background: 'rgba(58, 169, 190, 0.08)',
            border: '1px solid rgba(58, 169, 190, 0.15)',
            borderRadius: 6,
            padding: '6px 10px',
            cursor: 'pointer',
            fontFamily: 'var(--font-geist-mono, monospace)',
            transition: 'background 0.15s',
            width: '100%',
            justifyContent: 'center',
            minHeight: 36,
          }}
        >
          {copied ? 'Copied' : contact.email}
        </button>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.3)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 6,
            padding: '6px 10px',
            fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
            justifyContent: 'center',
            minHeight: 36,
          }}
        >
          <LockIcon />
          Upgrade to view email
        </div>
      )}

      {/* Pitch tips (if available) */}
      {contact.pitchTips.length > 0 && (
        <div
          style={{
            fontSize: 11,
            color: 'rgba(255, 255, 255, 0.4)',
            lineHeight: 1.5,
            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
            paddingTop: 8,
            fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
          }}
        >
          <span style={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.5)' }}>Tip: </span>
          {contact.pitchTips[0]}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main Grid
// ============================================================================

export function CuratedContactsGrid() {
  const contacts = useCuratedContactsStore((s) => s.contacts)
  const loading = useCuratedContactsStore((s) => s.loading)
  const error = useCuratedContactsStore((s) => s.error)
  const total = useCuratedContactsStore((s) => s.total)
  const tier = useCuratedContactsStore((s) => s.tier)
  const maxContacts = useCuratedContactsStore((s) => s.maxContacts)
  const upgradeRequired = useCuratedContactsStore((s) => s.upgradeRequired)
  const hasFetched = useCuratedContactsStore((s) => s.hasFetched)
  const fetchContacts = useCuratedContactsStore((s) => s.fetchContacts)
  const platformFilter = useCuratedContactsStore((s) => s.platformFilter)
  const setPlatformFilter = useCuratedContactsStore((s) => s.setPlatformFilter)
  const searchQuery = useCuratedContactsStore((s) => s.searchQuery)
  const setSearchQuery = useCuratedContactsStore((s) => s.setSearchQuery)
  const savedIds = useCuratedContactsStore((s) => s.savedIds)
  const saveContact = useCuratedContactsStore((s) => s.saveContact)
  const unsaveContact = useCuratedContactsStore((s) => s.unsaveContact)

  // Search debounce
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchQuery(localSearch)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [localSearch, setSearchQuery])

  // Fetch on mount
  useEffect(() => {
    if (!hasFetched && !loading) {
      fetchContacts()
    }
  }, [hasFetched, loading, fetchContacts])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 6,
            padding: '6px 10px',
            flex: '1 1 200px',
            maxWidth: 280,
          }}
        >
          <SearchIcon />
          <input
            type="text"
            placeholder="Search contacts..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#F7F8F9',
              fontSize: 13,
              width: '100%',
              fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
            }}
          />
        </div>

        {/* Platform filters */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setPlatformFilter(null)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              backgroundColor:
                platformFilter === null ? 'rgba(58, 169, 190, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              color: platformFilter === null ? '#3AA9BE' : 'rgba(255, 255, 255, 0.5)',
              fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
              minHeight: 28,
            }}
          >
            All
          </button>
          {PLATFORMS.map((p) => {
            const Icon = PLATFORM_ICONS[p!]
            return (
              <button
                key={p}
                onClick={() => setPlatformFilter(platformFilter === p ? null : p)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor:
                    platformFilter === p
                      ? `${PLATFORM_COLOURS[p!]}15`
                      : 'rgba(255, 255, 255, 0.04)',
                  color: platformFilter === p ? PLATFORM_COLOURS[p!] : 'rgba(255, 255, 255, 0.5)',
                  fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
                  textTransform: 'capitalize',
                  minHeight: 28,
                }}
              >
                {Icon && <Icon />}
                <span className="hidden sm:inline">{p}</span>
              </button>
            )
          })}
        </div>

        {/* Count */}
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.4)',
            marginLeft: 'auto',
            fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
          }}
        >
          {total} contacts
          {tier !== 'free' && ` (${tier})`}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 12,
            padding: 16,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: 10,
                padding: 16,
                height: 160,
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: 24,
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && hasFetched && contacts.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 48,
            textAlign: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(58, 169, 190, 0.1)',
              borderRadius: 12,
              color: '#3AA9BE',
              fontSize: 20,
            }}
          >
            <RadioIcon />
          </div>
          <p style={{ fontSize: 14, color: '#F7F8F9', fontWeight: 500, margin: 0 }}>
            No contacts match your filters
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', margin: 0, maxWidth: 280 }}>
            Try adjusting your search or clearing the platform filter.
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && contacts.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 12,
            padding: 16,
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {contacts.map((contact) => (
            <CuratedContactCard
              key={contact.id}
              contact={contact}
              isSaved={savedIds.has(contact.id)}
              onSave={() => saveContact(contact.id)}
              onUnsave={() => unsaveContact(contact.id)}
            />
          ))}
        </div>
      )}

      {/* Upgrade banner */}
      {upgradeRequired && !loading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '12px 16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
            backgroundColor: 'rgba(58, 169, 190, 0.05)',
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
            }}
          >
            Showing {contacts.length} of {total}+ contacts.
          </span>
          <a
            href="/pricing"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#3AA9BE',
              textDecoration: 'none',
              fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
            }}
          >
            Upgrade for more
          </a>
        </div>
      )}

      {/* Cross-promotion attribution */}
      {!loading && contacts.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 16px',
            borderTop: upgradeRequired ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.35)',
              fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
            }}
          >
            These contacts are curated by{' '}
            <a
              href="https://totalaudiopromo.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(58, 169, 190, 0.6)', textDecoration: 'none' }}
            >
              Total Audio Promo
            </a>
          </span>
        </div>
      )}
    </div>
  )
}
