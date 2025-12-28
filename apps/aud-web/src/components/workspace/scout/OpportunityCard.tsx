/**
 * OpportunityCard Component
 *
 * Phase 3: MVP Pivot - Scout Mode
 *
 * A card displaying an opportunity (radio, playlist, blog, curator, press).
 * Calm, minimal design matching the Ideas Mode aesthetic.
 */

'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { Opportunity, EnrichedContact, EnrichmentStatus } from '@/types/scout'
import {
  TYPE_ICONS,
  TYPE_LABELS,
  TYPE_COLOURS,
  AUDIENCE_SIZE_LABELS,
  AUDIENCE_SIZE_COLOURS,
} from '@/types/scout'
import { useAuthGate } from '@/components/auth'

interface OpportunityCardProps {
  opportunity: Opportunity
  isAddedToTimeline: boolean
  enrichedData: EnrichedContact | null
  enrichmentStatus: EnrichmentStatus
  enrichmentError: string | null
  onSelect: () => void
  onAddToTimeline: () => void
  onCopyEmail: () => void
  onValidateContact: () => void
}

export function OpportunityCard({
  opportunity,
  isAddedToTimeline,
  enrichedData,
  enrichmentStatus,
  enrichmentError,
  onSelect,
  onAddToTimeline,
  onCopyEmail,
  onValidateContact,
}: OpportunityCardProps) {
  const router = useRouter()
  const { canAccess: isAuthenticated, requireAuth } = useAuthGate()
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [addFeedback, setAddFeedback] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  // Confidence badge colour
  const getConfidenceColour = (confidence: string | undefined) => {
    switch (confidence) {
      case 'High':
        return { bg: 'rgba(73, 163, 108, 0.15)', text: '#49A36C' }
      case 'Medium':
        return { bg: 'rgba(196, 160, 82, 0.15)', text: '#C4A052' }
      case 'Low':
        return { bg: 'rgba(249, 115, 22, 0.15)', text: '#F97316' }
      default:
        return { bg: 'rgba(255, 255, 255, 0.06)', text: 'rgba(255, 255, 255, 0.5)' }
    }
  }

  const handleValidate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (enrichmentStatus === 'loading' || enrichmentStatus === 'success') return

      // Gate behind auth - redirect to signup if not authenticated
      if (!requireAuth(() => setShowAuthPrompt(true))) {
        // Show brief prompt, then redirect
        setTimeout(() => {
          setShowAuthPrompt(false)
          router.push('/signup?feature=validate')
        }, 1500)
        return
      }

      onValidateContact()
    },
    [enrichmentStatus, onValidateContact, requireAuth, router]
  )

  const typeColour = TYPE_COLOURS[opportunity.type]

  const handleCopyEmail = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!opportunity.contactEmail) return

      navigator.clipboard.writeText(opportunity.contactEmail)
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2000)
      onCopyEmail()
    },
    [opportunity.contactEmail, onCopyEmail]
  )

  const handleAddToTimeline = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isAddedToTimeline) return

      onAddToTimeline()
      setAddFeedback(true)
      setTimeout(() => setAddFeedback(false), 2000)
    },
    [isAddedToTimeline, onAddToTimeline]
  )

  // Show max 3 genres
  const displayGenres = opportunity.genres.slice(0, 3)
  const hasMoreGenres = opportunity.genres.length > 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.16 }}
      onClick={onSelect}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 8,
        padding: 16,
        cursor: 'pointer',
        transition: 'all 0.16s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'
      }}
    >
      {/* Header: Type badge + Audience size */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        {/* Type badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            backgroundColor: typeColour.bg,
            border: `1px solid ${typeColour.border}`,
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 500,
            color: typeColour.text,
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          <span style={{ fontSize: 10 }}>{TYPE_ICONS[opportunity.type]}</span>
          {TYPE_LABELS[opportunity.type]}
        </div>

        {/* Right side: Enrichment badge + Audience size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Enrichment confidence badge */}
          {enrichedData?.researchConfidence && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                backgroundColor: getConfidenceColour(enrichedData.researchConfidence).bg,
                borderRadius: 10,
                fontSize: 9,
                fontWeight: 600,
                color: getConfidenceColour(enrichedData.researchConfidence).text,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
              title={enrichedData.contactIntelligence || 'Validated contact'}
            >
              ✓ {enrichedData.researchConfidence}
            </div>
          )}

          {/* Audience size indicator */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: AUDIENCE_SIZE_COLOURS[opportunity.audienceSize],
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
          >
            {AUDIENCE_SIZE_LABELS[opportunity.audienceSize]}
          </div>
        </div>
      </div>

      {/* Name */}
      <h3
        style={{
          margin: 0,
          marginBottom: 8,
          fontSize: 14,
          fontWeight: 600,
          color: '#E8EAED',
          lineHeight: 1.3,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {opportunity.name}
      </h3>

      {/* Description (truncated) */}
      {opportunity.description && (
        <p
          style={{
            margin: 0,
            marginBottom: 12,
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.5)',
            lineHeight: 1.5,
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {opportunity.description}
        </p>
      )}

      {/* Genre pills */}
      {displayGenres.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 16,
          }}
        >
          {displayGenres.map((genre) => (
            <span
              key={genre}
              style={{
                padding: '3px 8px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 10,
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.6)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              {genre}
            </span>
          ))}
          {hasMoreGenres && (
            <span
              style={{
                padding: '3px 8px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 10,
                fontSize: 10,
                color: 'rgba(255, 255, 255, 0.4)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              }}
            >
              +{opportunity.genres.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: 12,
          marginTop: 'auto',
        }}
      >
        {/* Validate contact button - only show if has email and not yet validated */}
        {opportunity.contactEmail && enrichmentStatus !== 'success' && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleValidate}
            disabled={enrichmentStatus === 'loading'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '8px 12px',
              backgroundColor: showAuthPrompt ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
              border: `1px solid ${showAuthPrompt ? 'rgba(249, 115, 22, 0.3)' : 'rgba(58, 169, 190, 0.3)'}`,
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 500,
              color: showAuthPrompt
                ? '#F97316'
                : enrichmentStatus === 'loading'
                  ? 'rgba(58, 169, 190, 0.5)'
                  : enrichmentStatus === 'error'
                    ? '#F97316'
                    : '#3AA9BE',
              cursor: enrichmentStatus === 'loading' ? 'wait' : 'pointer',
              transition: 'all 0.16s ease',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              minWidth: 70,
            }}
            title={
              showAuthPrompt
                ? 'Sign up to validate contacts'
                : !isAuthenticated
                  ? 'Sign up to validate contacts with TAP Intel'
                  : enrichmentError || 'Validate contact with TAP Intel'
            }
          >
            {showAuthPrompt
              ? 'Sign up to unlock'
              : enrichmentStatus === 'loading'
                ? 'Validating…'
                : enrichmentStatus === 'error'
                  ? 'Retry'
                  : 'Validate'}
          </motion.button>
        )}

        {/* Copy email button */}
        {opportunity.contactEmail && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyEmail}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 500,
              color: copyFeedback ? '#49A36C' : 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              transition: 'all 0.16s ease',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            }}
            onMouseEnter={(e) => {
              if (!copyFeedback) {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
              }
            }}
            onMouseLeave={(e) => {
              if (!copyFeedback) {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
              }
            }}
          >
            {copyFeedback ? 'Copied!' : 'Copy Email'}
          </motion.button>
        )}

        {/* Add to Timeline button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToTimeline}
          disabled={isAddedToTimeline}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 12px',
            backgroundColor: isAddedToTimeline
              ? 'rgba(73, 163, 108, 0.15)'
              : addFeedback
                ? 'rgba(73, 163, 108, 0.2)'
                : '#3AA9BE',
            border: 'none',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 500,
            color: isAddedToTimeline ? '#49A36C' : addFeedback ? '#49A36C' : '#0F1113',
            cursor: isAddedToTimeline ? 'default' : 'pointer',
            transition: 'all 0.16s ease',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          {isAddedToTimeline ? '✓ Added' : addFeedback ? 'Added!' : '+ Timeline'}
        </motion.button>
      </div>
    </motion.div>
  )
}
