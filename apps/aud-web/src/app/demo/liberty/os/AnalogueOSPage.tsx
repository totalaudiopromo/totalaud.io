'use client'

/**
 * Analogue OS Page - Liberty Campaign Notes
 * Liberty-specific notebook with campaign planning cards
 */

import { useEffect, useState } from 'react'
import { useDirector } from '@/components/demo/director/DirectorProvider'
import { BookOpen, Sparkles } from 'lucide-react'

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
    <div className="w-full h-full bg-[#2A2520] text-[#E8DCC8] p-8 overflow-auto">
      {/* Header */}
      <div className="flex items-centre gap-3 mb-8">
        <BookOpen className="w-8 h-8 text-[#D4A574]" />
        <div>
          <h1 className="text-2xl font-bold">Campaign Notebook</h1>
          <p className="text-sm text-[#E8DCC8]/60">Liberty Music PR — UK Indie Launch</p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {LIBERTY_CARDS.map((card) => {
          const isHighlighted = highlightedCardTitle?.toLowerCase() === card.title.toLowerCase()

          return (
            <div
              key={card.id}
              className={`
                bg-[#3A3228] border-2 rounded-lg p-4 transition-all duration-300
                ${
                  isHighlighted
                    ? 'border-[#D4A574] shadow-[0_0_20px_rgba(212,165,116,0.4)] scale-105'
                    : 'border-[#4A4238] hover:border-[#D4A574]/50'
                }
              `}
            >
              {/* Card title */}
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-[#E8DCC8]">{card.title}</h3>
                {isHighlighted && <Sparkles className="w-5 h-5 text-[#D4A574] animate-pulse" />}
              </div>

              {/* Card content */}
              <p className="text-sm text-[#E8DCC8]/80 mb-3">{card.content}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-[#4A4238] rounded-full text-[#D4A574]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Ambient texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-5 mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
        }}
      />
    </div>
  )
}
