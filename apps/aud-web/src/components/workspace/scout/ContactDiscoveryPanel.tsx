/**
 * ContactDiscoveryPanel
 *
 * URL-based contact discovery for Scout Mode.
 * User pastes a URL, we extract and verify B2B contacts.
 */

'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, CheckCircle, AlertCircle, ExternalLink, Plus, Mail } from 'lucide-react'
import { useTimelineStore } from '@/stores/useTimelineStore'
import { useToast } from '@/contexts/ToastContext'
import type { DiscoveredContact, DiscoveryResponse } from '@/app/api/scout/discover/route'

interface ContactDiscoveryPanelProps {
  className?: string
}

export function ContactDiscoveryPanel({ className }: ContactDiscoveryPanelProps) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<DiscoveryResponse | null>(null)
  const [addedToTimeline, setAddedToTimeline] = useState<Set<string>>(new Set())

  const addEvent = useTimelineStore((state) => state.addEvent)
  const { addedToTimeline: showAddedToast } = useToast()

  const handleDiscover = useCallback(async () => {
    if (!url.trim()) return

    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/scout/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Discovery failed')
      }

      const data: DiscoveryResponse = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Discovery failed')
    } finally {
      setIsLoading(false)
    }
  }, [url])

  const handleAddToTimeline = useCallback(
    (contact: DiscoveredContact) => {
      addEvent({
        title: `Pitch ${contact.outlet || contact.email}`,
        lane: 'promo',
        date: new Date().toISOString(),
        colour: '#3AA9BE',
        description: `Contact: ${contact.email}`,
        url: contact.sourceUrl,
        source: 'scout',
        tags: [contact.outletType || 'contact'],
      })
      setAddedToTimeline((prev) => new Set(prev).add(contact.id))
      showAddedToast()
    },
    [addEvent, showAddedToast]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleDiscover()
    }
  }

  return (
    <div className={className}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#F7F8F9',
            marginBottom: 6,
          }}
        >
          Discover Contacts
        </h3>
        <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.5 }}>
          Paste a URL (radio station, blog, label) to find contact emails
        </p>
      </div>

      {/* URL Input */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 10,
            padding: '0 14px',
          }}
        >
          <Search size={16} style={{ color: 'rgba(255, 255, 255, 0.4)', flexShrink: 0 }} />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com/contact"
            disabled={isLoading}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: '#F7F8F9',
              padding: '12px 0',
            }}
          />
        </div>
        <button
          onClick={handleDiscover}
          disabled={!url.trim() || isLoading}
          style={{
            padding: '0 20px',
            fontSize: 14,
            fontWeight: 500,
            color: url.trim() && !isLoading ? '#0F1113' : 'rgba(255, 255, 255, 0.3)',
            backgroundColor: url.trim() && !isLoading ? '#3AA9BE' : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: 10,
            cursor: url.trim() && !isLoading ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s ease',
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Scanning...
            </>
          ) : (
            'Discover'
          )}
        </button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 10,
              marginBottom: 20,
            }}
          >
            <AlertCircle size={16} style={{ color: '#EF4444', flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: '#EF4444' }}>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Stats */}
            <div
              style={{
                display: 'flex',
                gap: 16,
                marginBottom: 16,
                padding: '12px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 10,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#F7F8F9' }}>
                  {results.totalFound}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>Found</div>
              </div>
              <div style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#3AA9BE' }}>
                  {results.totalVerified}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>Verified</div>
              </div>
              <div style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#22C55E' }}>
                  {results.totalB2B}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>B2B</div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.4)' }}>
                  {results.fetchTimeMs}ms
                </div>
              </div>
            </div>

            {/* Contact Cards */}
            {results.contacts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {results.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 10,
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
                        onClick={() => handleAddToTimeline(contact)}
                        disabled={addedToTimeline.has(contact.id)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          backgroundColor: addedToTimeline.has(contact.id)
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(58, 169, 190, 0.1)',
                          border: `1px solid ${
                            addedToTimeline.has(contact.id)
                              ? 'rgba(34, 197, 94, 0.3)'
                              : 'rgba(58, 169, 190, 0.3)'
                          }`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: addedToTimeline.has(contact.id) ? '#22C55E' : '#3AA9BE',
                          cursor: addedToTimeline.has(contact.id) ? 'default' : 'pointer',
                        }}
                        title={
                          addedToTimeline.has(contact.id) ? 'Added to timeline' : 'Add to timeline'
                        }
                      >
                        {addedToTimeline.has(contact.id) ? (
                          <CheckCircle size={14} />
                        ) : (
                          <Plus size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '32px 20px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 10,
                }}
              >
                <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                  No B2B contacts found on this page.
                  <br />
                  Try a contact or about page.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!results && !isLoading && !error && (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 10,
          }}
        >
          <Search size={32} style={{ color: 'rgba(255, 255, 255, 0.2)', marginBottom: 12 }} />
          <p
            style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)', margin: 0, lineHeight: 1.5 }}
          >
            Enter a URL above to scan for contact emails.
            <br />
            Best results from contact, about, or team pages.
          </p>
        </div>
      )}

      {/* Spinner keyframe */}
      <style jsx global>{`
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
