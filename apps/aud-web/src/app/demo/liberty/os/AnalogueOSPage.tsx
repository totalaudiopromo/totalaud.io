'use client'

/**
 * Analogue OS Page - Liberty Campaign Notes (Phase 29 Polished)
 * Liberty-specific notebook with campaign planning cards
 * Uses design tokens with warm analogue aesthetic
 */

import { useEffect, useState } from 'react'
import { useDirector } from '@/components/demo/director/DirectorProvider'
import { BookOpen, Sparkles } from 'lucide-react'
import { spacing, radii, shadows, colours } from '@/styles/tokens'
import { duration, easing, prefersReducedMotion } from '@/styles/motion'

// Analogue OS specific colours (warm paper/sepia aesthetic)
const ANALOGUE_BG = '#2A2520'
const ANALOGUE_CARD_BG = '#3A3228'
const ANALOGUE_CARD_BORDER = '#4A4238'
const ANALOGUE_TEXT = '#E8DCC8'
const ANALOGUE_TEXT_DIM = 'rgba(232, 220, 200, 0.6)'
const ANALOGUE_TEXT_SUBTLE = 'rgba(232, 220, 200, 0.8)'
const ANALOGUE_ACCENT = '#D4A574'
const ANALOGUE_GLOW = 'rgba(212, 165, 116, 0.4)'
const PAPER_TEXTURE_OPACITY = 0.06

interface Card {
  id: string
  title: string
  content: string
  tags: string[]
}

const LIBERTY_CARDS: Card[] = [
  {
    id: 'liberty-ep',
    title: 'Liberty EP — release notes',
    content:
      'UK indie release targeting student radio, BBC Introducing, and Spotify Editorial. Working with Liberty Music PR for strategic campaign roll-out.',
    tags: ['campaign', 'uk-launch', 'liberty'],
  },
  {
    id: 'radio-targets',
    title: 'radio targets',
    content:
      'Priority: BBC Introducing, Amazing Radio, student stations across UK universities. Secondary: community and DAB stations with indie programming.',
    tags: ['radio', 'promo'],
  },
  {
    id: 'press-timeline',
    title: 'press timeline',
    content:
      '2 weeks pre-launch: Press release to indie blogs. Launch week: Featured placements, interviews. Post-launch: Review round-up, social amplification.',
    tags: ['press', 'timeline'],
  },
]

export function AnalogueOSPage() {
  const director = useDirector()
  const [highlightedCardTitle, setHighlightedCardTitle] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const shouldAnimate = !prefersReducedMotion()

  // Trigger entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Register director callback for card highlighting
  useEffect(() => {
    director.engine.setCallbacks({
      onHighlightAnalogueCard: (title: string, durationMs: number) => {
        setHighlightedCardTitle(title)

        // Clear highlight after duration
        setTimeout(() => {
          setHighlightedCardTitle(null)
        }, durationMs)
      },
    })
  }, [director])

  return (
    <div
      className="w-full h-full overflow-auto"
      style={{
        backgroundColor: ANALOGUE_BG,
        color: ANALOGUE_TEXT,
        padding: spacing[8],
        // OS transition animation
        opacity: shouldAnimate ? (isVisible ? 1 : 0) : 1,
        transform: shouldAnimate ? (isVisible ? 'scale(1)' : 'scale(0.98)') : 'scale(1)',
        transition: shouldAnimate
          ? `opacity ${duration.medium}s ${easing.default}, transform ${duration.medium}s ${easing.default}`
          : 'none',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center"
        style={{
          gap: spacing[3],
          marginBottom: spacing[8],
        }}
      >
        <BookOpen className="w-8 h-8" style={{ color: ANALOGUE_ACCENT }} />
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: ANALOGUE_TEXT,
            }}
          >
            Campaign Notebook
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: ANALOGUE_TEXT_DIM,
              marginTop: spacing[1],
            }}
          >
            Liberty Music PR — UK Indie Launch
          </p>
        </div>
      </div>

      {/* Cards grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        style={{
          gap: spacing[4],
        }}
      >
        {LIBERTY_CARDS.map((card) => {
          const isHighlighted = highlightedCardTitle?.toLowerCase() === card.title.toLowerCase()

          return (
            <div
              key={card.id}
              className="hover:scale-[1.02]"
              style={{
                backgroundColor: ANALOGUE_CARD_BG,
                border: `2px solid ${isHighlighted ? ANALOGUE_ACCENT : ANALOGUE_CARD_BORDER}`,
                borderRadius: radii.lg,
                padding: spacing[4],
                // Smooth transitions with different durations for different properties
                transition: shouldAnimate
                  ? `transform ${duration.fast}s ${easing.default},
                     border-color ${duration.fast}s ${easing.default},
                     box-shadow ${duration.fast}s ${easing.default}`
                  : 'none',
                // Fade in glow over duration.fast with colours.glow
                boxShadow: isHighlighted ? `0 0 24px ${colours.glow}` : shadows.subtle,
                // Scale 1 → 1.05 smoothly
                transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {/* Card title */}
              <div
                className="flex items-start justify-between"
                style={{
                  marginBottom: spacing[2],
                }}
              >
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: ANALOGUE_TEXT,
                  }}
                >
                  {card.title}
                </h3>
                {isHighlighted && (
                  <Sparkles
                    className="w-5 h-5 animate-pulse"
                    style={{
                      color: ANALOGUE_ACCENT,
                      animation: `pulse ${duration.slow}s ${easing.smooth} infinite`,
                    }}
                  />
                )}
              </div>

              {/* Card content */}
              <p
                style={{
                  fontSize: '14px',
                  color: ANALOGUE_TEXT_SUBTLE,
                  marginBottom: spacing[3],
                  lineHeight: '1.5',
                }}
              >
                {card.content}
              </p>

              {/* Tags */}
              <div
                className="flex flex-wrap"
                style={{
                  gap: spacing[2],
                }}
              >
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: `${spacing[1]} ${spacing[2]}`,
                      fontSize: '12px',
                      backgroundColor: ANALOGUE_CARD_BORDER,
                      borderRadius: radii.full,
                      color: ANALOGUE_ACCENT,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Paper texture overlay (subtle) */}
      <div
        className="fixed inset-0 pointer-events-none mix-blend-overlay"
        style={{
          opacity: PAPER_TEXTURE_OPACITY,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
        }}
      />
    </div>
  )
}
