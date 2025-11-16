'use client'

/**
 * Fusion Output Renderer
 * Displays each OS's perspective in its unique visual style
 */

import { motion, AnimatePresence } from 'framer-motion'
import type { ThemeId, FusionOutput } from '@totalaud/os-state/campaign'

interface FusionOutputRendererProps {
  fusionOutput: FusionOutput
  activeOS?: ThemeId | null
}

const OS_COLOURS: Record<ThemeId, string> = {
  ascii: '#00ff99',
  xp: '#3478f6',
  aqua: '#3b82f6',
  daw: '#ff8000',
  analogue: '#ff1aff',
}

export function FusionOutputRenderer({
  fusionOutput,
  activeOS,
}: FusionOutputRendererProps) {
  // If an OS is active, show only that one
  const osToDisplay = activeOS
    ? [activeOS]
    : (['ascii', 'xp', 'aqua', 'daw', 'analogue'] as ThemeId[])

  return (
    <div className="space-y-4">
      {/* Unified Summary (always shown) */}
      <div className="rounded-lg border border-[var(--flowcore-colour-accent)] bg-[var(--flowcore-colour-accent)]/5 p-4">
        <h3 className="mb-2 font-mono text-sm font-semibold uppercase text-[var(--flowcore-colour-accent)]">
          Unified Summary
        </h3>
        <p className="font-mono text-sm leading-relaxed text-[var(--flowcore-colour-fg)]">
          {fusionOutput.unifiedSummary}
        </p>

        {/* Points of Agreement */}
        {fusionOutput.pointsOfAgreement.length > 0 && (
          <div className="mt-3">
            <h4 className="mb-1 font-mono text-xs font-semibold uppercase text-[var(--flowcore-colour-accent)]/70">
              Consensus:
            </h4>
            <ul className="space-y-1">
              {fusionOutput.pointsOfAgreement.map((point, i) => (
                <li
                  key={i}
                  className="font-mono text-xs text-[var(--flowcore-colour-fg)]/80"
                >
                  • {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Points of Tension */}
        {fusionOutput.pointsOfTension.length > 0 && (
          <div className="mt-3">
            <h4 className="mb-1 font-mono text-xs font-semibold uppercase text-[#EF4444]">
              Tensions:
            </h4>
            <ul className="space-y-1">
              {fusionOutput.pointsOfTension.map((point, i) => (
                <li key={i} className="font-mono text-xs text-[#EF4444]/80">
                  ⚠ {point}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Individual OS Perspectives */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {osToDisplay.map((os) => {
            const contribution = fusionOutput.perOS[os]
            if (!contribution) return null

            return (
              <OSPerspectiveCard
                key={os}
                os={os}
                contribution={contribution}
                isExpanded={activeOS === os}
              />
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface OSPerspectiveCardProps {
  os: ThemeId
  contribution: {
    summary: string
    recommendations: string[]
    sentiment?: 'positive' | 'neutral' | 'cautious' | 'critical'
  }
  isExpanded?: boolean
}

function OSPerspectiveCard({ os, contribution, isExpanded }: OSPerspectiveCardProps) {
  const colour = OS_COLOURS[os]

  // Apply OS-specific styling
  const styleConfig = getOSStyleConfig(os)

  return (
    <motion.div
      className={`rounded-lg border p-4 ${styleConfig.className}`}
      style={{
        borderColor: colour,
        backgroundColor: `${colour}10`,
        ...styleConfig.style,
      }}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* OS Header */}
      <div className="mb-2 flex items-centre justify-between">
        <h3
          className={`font-mono text-sm font-semibold uppercase ${styleConfig.headerClass}`}
          style={{ color: colour }}
        >
          {os}
        </h3>

        {contribution.sentiment && (
          <span
            className="rounded px-2 py-0.5 font-mono text-[10px] font-semibold uppercase"
            style={{
              backgroundColor: `${colour}30`,
              color: colour,
            }}
          >
            {contribution.sentiment}
          </span>
        )}
      </div>

      {/* Summary */}
      <div className={`mb-3 ${styleConfig.summaryClass}`}>
        <p
          className="font-mono text-sm leading-relaxed"
          style={{ color: colour }}
        >
          {contribution.summary}
        </p>
      </div>

      {/* Recommendations */}
      {contribution.recommendations.length > 0 && (
        <div className={styleConfig.recommendationsClass}>
          <h4
            className="mb-1 font-mono text-xs font-semibold uppercase"
            style={{ color: `${colour}cc` }}
          >
            Recommendations:
          </h4>
          <ul className="space-y-0.5">
            {contribution.recommendations.map((rec, i) => (
              <li
                key={i}
                className="font-mono text-xs"
                style={{ color: `${colour}cc` }}
              >
                {styleConfig.bulletChar} {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}

/**
 * Get OS-specific styling configuration
 */
function getOSStyleConfig(os: ThemeId) {
  const configs: Record<
    ThemeId,
    {
      className: string
      style: React.CSSProperties
      headerClass: string
      summaryClass: string
      recommendationsClass: string
      bulletChar: string
    }
  > = {
    ascii: {
      className: 'border-2',
      style: { fontFamily: 'monospace' },
      headerClass: 'tracking-widest',
      summaryClass: 'border-l-2 pl-2',
      recommendationsClass: '',
      bulletChar: '>',
    },
    xp: {
      className: 'shadow-lg',
      style: {
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(52, 120, 246, 0.2)',
      },
      headerClass: '',
      summaryClass: '',
      recommendationsClass: '',
      bulletChar: '•',
    },
    aqua: {
      className: 'backdrop-blur-sm',
      style: {
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
      },
      headerClass: '',
      summaryClass: '',
      recommendationsClass: '',
      bulletChar: '→',
    },
    daw: {
      className: 'border-l-4',
      style: {},
      headerClass: 'tracking-wide',
      summaryClass: '',
      recommendationsClass: '',
      bulletChar: '■',
    },
    analogue: {
      className: '',
      style: {
        background: 'linear-gradient(135deg, rgba(255, 26, 255, 0.08), rgba(255, 26, 255, 0.03))',
        backdropFilter: 'blur(2px)',
      },
      headerClass: 'italic',
      summaryClass: 'italic',
      recommendationsClass: '',
      bulletChar: '~',
    },
  }

  return configs[os]
}
