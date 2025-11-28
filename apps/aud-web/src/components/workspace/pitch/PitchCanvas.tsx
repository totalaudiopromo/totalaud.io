/**
 * Pitch Canvas Component
 * 2025 Brand Pivot - Cinematic Editorial
 *
 * AI-powered pitch builder with coach integration
 * Helps artists craft compelling stories for radio, press, and playlists
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Pitch template types
type PitchType = 'radio' | 'press' | 'playlist' | 'custom'

interface PitchSection {
  id: string
  title: string
  content: string
  aiSuggestion?: string
  isEditing: boolean
}

const PITCH_TYPES: { key: PitchType; label: string; description: string }[] = [
  {
    key: 'radio',
    label: 'Radio Pitch',
    description: 'For BBC Radio 1, 6 Music, specialist shows',
  },
  {
    key: 'press',
    label: 'Press Release',
    description: 'For music blogs, magazines, and media outlets',
  },
  {
    key: 'playlist',
    label: 'Playlist Pitch',
    description: 'For Spotify editorial and curator submissions',
  },
  {
    key: 'custom',
    label: 'Custom Pitch',
    description: 'Start from scratch with AI assistance',
  },
]

const DEFAULT_SECTIONS: PitchSection[] = [
  {
    id: 'hook',
    title: 'The Hook',
    content: '',
    aiSuggestion:
      'Start with something memorable - a striking fact, an emotional moment, or a bold statement about your music.',
    isEditing: false,
  },
  {
    id: 'story',
    title: 'Your Story',
    content: '',
    aiSuggestion:
      'Share the journey behind this release. What inspired it? What makes it personal?',
    isEditing: false,
  },
  {
    id: 'sound',
    title: 'The Sound',
    content: '',
    aiSuggestion:
      'Describe your sound using reference points listeners will recognise. "If X met Y in a dimly lit studio..."',
    isEditing: false,
  },
  {
    id: 'traction',
    title: 'Proof Points',
    content: '',
    aiSuggestion:
      'Include any relevant achievements: streams, radio plays, notable support, press coverage.',
    isEditing: false,
  },
  {
    id: 'ask',
    title: 'The Ask',
    content: '',
    aiSuggestion:
      'Be specific about what you want: airplay, review, playlist inclusion. Make it easy to say yes.',
    isEditing: false,
  },
]

export function PitchCanvas() {
  const [selectedType, setSelectedType] = useState<PitchType | null>(null)
  const [sections, setSections] = useState<PitchSection[]>(DEFAULT_SECTIONS)
  const [isCoachOpen, setIsCoachOpen] = useState(false)

  const handleSelectType = (type: PitchType) => {
    setSelectedType(type)
  }

  const handleSectionEdit = (id: string, content: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, content, isEditing: true } : s)))
  }

  const handleSectionBlur = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, isEditing: false } : s)))
  }

  // Template selection view
  if (!selectedType) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '24px 16px',
          overflowY: 'auto',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: '#F7F8F9',
            marginBottom: 8,
            letterSpacing: '-0.02em',
            textAlign: 'center',
          }}
        >
          Choose your pitch type
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: 32,
            maxWidth: 400,
            textAlign: 'center',
            padding: '0 16px',
          }}
        >
          Select a template to get started. Our AI coach will help you craft the perfect pitch.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 12,
            maxWidth: 600,
            width: '100%',
          }}
        >
          {PITCH_TYPES.map((type) => (
            <motion.button
              key={type.key}
              onClick={() => handleSelectType(type.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 24,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 12,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.4)'
                e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#F7F8F9',
                  marginBottom: 8,
                }}
              >
                {type.label}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.5)',
                  lineHeight: 1.4,
                }}
              >
                {type.description}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // Pitch editor view
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        position: 'relative',
      }}
    >
      {/* Main editor */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
        }}
      >
        {/* Back button */}
        <button
          onClick={() => setSelectedType(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            marginBottom: 24,
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.5)',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'color 0.2s ease, border-color 0.2s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#3AA9BE'
            e.currentTarget.style.borderColor = 'rgba(58, 169, 190, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          Back to templates
        </button>

        {/* Pitch type header */}
        <div style={{ marginBottom: 32 }}>
          <h2
            style={{
              margin: 0,
              marginBottom: 8,
              fontSize: 22,
              fontWeight: 600,
              color: '#F7F8F9',
            }}
          >
            {PITCH_TYPES.find((t) => t.key === selectedType)?.label}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            {PITCH_TYPES.find((t) => t.key === selectedType)?.description}
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              {/* Section header */}
              <div
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#3AA9BE',
                  }}
                >
                  {section.title}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: 'rgba(255, 255, 255, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {index + 1}/{sections.length}
                </span>
              </div>

              {/* AI suggestion */}
              {section.aiSuggestion && !section.content && (
                <div
                  style={{
                    padding: '12px 20px',
                    backgroundColor: 'rgba(58, 169, 190, 0.05)',
                    borderBottom: '1px solid rgba(58, 169, 190, 0.1)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: 'rgba(58, 169, 190, 0.9)',
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                    }}
                  >
                    {section.aiSuggestion}
                  </span>
                </div>
              )}

              {/* Content textarea */}
              <textarea
                value={section.content}
                onChange={(e) => handleSectionEdit(section.id, e.target.value)}
                onBlur={() => handleSectionBlur(section.id)}
                placeholder="Start writing..."
                style={{
                  width: '100%',
                  minHeight: 120,
                  padding: '16px 20px',
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: '#F7F8F9',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Coach sidebar */}
      <AnimatePresence>
        {isCoachOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
              backgroundColor: 'rgba(15, 17, 19, 0.95)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 24, width: 320 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 20,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#F7F8F9',
                  }}
                >
                  AI Coach
                </h3>
                <button
                  onClick={() => setIsCoachOpen(false)}
                  style={{
                    padding: '4px 8px',
                    fontSize: 12,
                    color: 'rgba(255, 255, 255, 0.4)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Close
                </button>
              </div>

              <div
                style={{
                  padding: 16,
                  backgroundColor: 'rgba(58, 169, 190, 0.08)',
                  border: '1px solid rgba(58, 169, 190, 0.2)',
                  borderRadius: 8,
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: 1.5,
                }}
              >
                I&apos;m here to help you craft a compelling pitch. Select a section and I&apos;ll
                provide suggestions based on your content and target audience.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coach toggle button (when closed) */}
      {!isCoachOpen && (
        <button
          onClick={() => setIsCoachOpen(true)}
          style={{
            position: 'absolute',
            right: 24,
            bottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 18px',
            fontSize: 14,
            fontWeight: 500,
            color: '#0F1113',
            backgroundColor: '#3AA9BE',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(58, 169, 190, 0.3)',
            transition: 'transform 0.12s ease, box-shadow 0.12s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(58, 169, 190, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(58, 169, 190, 0.3)'
          }}
        >
          Ask AI Coach
        </button>
      )}
    </div>
  )
}
