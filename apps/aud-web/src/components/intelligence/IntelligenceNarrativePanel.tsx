/**
 * Intelligence Narrative Panel
 * Phase 15: CIB 2.0 - Story generation and display
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Sparkles, Clock, TrendingUp } from 'lucide-react'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { useIntelligence, useSocialGraph } from '@totalaud/os-state/campaign'
import { generateIntelligenceNarrative } from '@totalaud/agents/intelligence'
import type { IntelligenceNarrative } from '@totalaud/agents/intelligence'

export function IntelligenceNarrativePanel() {
  const { intelligence } = useIntelligence()
  const { socialGraph } = useSocialGraph()
  const [narrative, setNarrative] = useState<IntelligenceNarrative | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateStory = () => {
    setIsGenerating(true)

    // Simulate brief generation delay for UX
    setTimeout(() => {
      const generated = generateIntelligenceNarrative({
        snapshots: intelligence.snapshots,
        evolutionSeries: intelligence.evolutionSeries,
        relationshipSeries: intelligence.relationshipSeries,
        currentRelationships: socialGraph.relationships,
      })

      setNarrative(generated)
      setIsGenerating(false)
    }, 400)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        backgroundColor: flowCoreColours.matteBlack,
        border: `1px solid ${flowCoreColours.borderSubtle}`,
        borderRadius: '8px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={16} strokeWidth={1.6} style={{ color: flowCoreColours.slateCyan }} />
          <h4
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: flowCoreColours.textPrimary,
              margin: 0,
            }}
          >
            Intelligence Story
          </h4>
        </div>

        {!narrative && (
          <motion.button
            onClick={handleGenerateStory}
            disabled={isGenerating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              color: flowCoreColours.slateCyan,
              backgroundColor: `${flowCoreColours.slateCyan}15`,
              border: `1px solid ${flowCoreColours.slateCyan}`,
              borderRadius: '6px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 120ms cubic-bezier(0.22, 1, 0.36, 1)',
              opacity: isGenerating ? 0.6 : 1,
            }}
          >
            <Sparkles size={14} strokeWidth={1.6} />
            {isGenerating ? 'Generating...' : 'Generate Story'}
          </motion.button>
        )}
      </div>

      {/* Narrative content */}
      <AnimatePresence mode="wait">
        {narrative ? (
          <motion.div
            key="narrative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            {/* Headline */}
            <div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: flowCoreColours.textPrimary,
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {narrative.headline}
              </h3>
            </div>

            {/* Paragraphs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {narrative.paragraphs.map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                  style={{
                    fontSize: '13px',
                    color: flowCoreColours.textSecondary,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

            {/* Key moments timeline */}
            {narrative.keyMoments.length > 0 && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                  }}
                >
                  <Clock size={14} strokeWidth={1.6} style={{ color: flowCoreColours.textSecondary }} />
                  <h5
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: flowCoreColours.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      margin: 0,
                    }}
                  >
                    Key Moments
                  </h5>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {narrative.keyMoments.map((moment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 + 0.5, duration: 0.24 }}
                      style={{
                        padding: '12px',
                        backgroundColor: `${flowCoreColours.borderSubtle}15`,
                        border: `1px solid ${flowCoreColours.borderSubtle}`,
                        borderRadius: '6px',
                        borderLeft: `3px solid ${getMomentColour(moment.type)}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '4px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: getMomentColour(moment.type),
                          }}
                        >
                          {moment.title}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            color: flowCoreColours.textTertiary,
                          }}
                        >
                          {formatDate(moment.at)}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '12px',
                          color: flowCoreColours.textSecondary,
                          lineHeight: 1.4,
                          margin: 0,
                        }}
                      >
                        {moment.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights summary */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                padding: '16px',
                backgroundColor: `${flowCoreColours.slateCyan}10`,
                border: `1px solid ${flowCoreColours.slateCyan}40`,
                borderRadius: '6px',
              }}
            >
              <TrendingUp size={16} strokeWidth={1.6} style={{ color: flowCoreColours.slateCyan, marginTop: '2px' }} />
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: flowCoreColours.slateCyan,
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Quick Insights
                </div>
                <div style={{ fontSize: '12px', color: flowCoreColours.textSecondary, lineHeight: 1.5 }}>
                  Cohesion {narrative.insights.cohesionTrend} •{' '}
                  {(narrative.insights.averageCohesion * 100).toFixed(0)}% average
                  {narrative.insights.dominantOS && ` • ${narrative.insights.dominantOS.toUpperCase()} leading`}
                </div>
              </div>
            </div>

            {/* Regenerate button */}
            <motion.button
              onClick={handleGenerateStory}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                padding: '8px 12px',
                fontSize: '11px',
                fontWeight: 500,
                color: flowCoreColours.textSecondary,
                backgroundColor: 'transparent',
                border: `1px solid ${flowCoreColours.borderSubtle}`,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              Regenerate Story
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: flowCoreColours.textTertiary,
            }}
          >
            <BookOpen size={32} strokeWidth={1} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
              Generate an intelligence story to understand
              <br />
              how your OS collective has evolved
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Get colour for moment type
 */
function getMomentColour(type: string): string {
  switch (type) {
    case 'cohesion_peak':
      return '#00ff99'
    case 'cohesion_drop':
      return '#ff5555'
    case 'leader_shift':
      return '#3478f6'
    case 'alliance':
      return '#00ff99'
    case 'conflict':
      return '#ff8800'
    case 'evolution':
      return '#ff1aff'
    default:
      return '#3AA9BE'
  }
}

/**
 * Format date for display (British format)
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
