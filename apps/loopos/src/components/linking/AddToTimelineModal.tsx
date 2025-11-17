'use client'

/**
 * Phase 32: Creative Continuity — Add to Timeline Modal
 *
 * Converts notes/cards into timeline nodes with AI suggestions.
 * British tone: "Add to timeline" not "Promote".
 * Calm, optional, never forceful.
 */

import { useState, useEffect } from 'react'
import type { NodeType } from '@loopos/db'

interface NodeSuggestion {
  title: string
  type: NodeType
  content?: string
  confidence?: number
}

interface AddToTimelineModalProps {
  isOpen: boolean
  onClose: () => void
  sourceTitle: string
  sourceContent: string
  sourceType: 'note' | 'analogue' | 'journal'
  onConfirm: (nodeType: NodeType, title?: string, content?: string) => Promise<void>
}

const nodeTypes: Array<{ value: NodeType; label: string; description: string }> = [
  { value: 'idea', label: 'Idea', description: 'A creative concept or possibility' },
  { value: 'milestone', label: 'Milestone', description: 'A significant moment or deadline' },
  { value: 'task', label: 'Task', description: 'Something specific to do' },
  { value: 'reference', label: 'Reference', description: 'Inspiration or research' },
  { value: 'insight', label: 'Insight', description: 'A realisation or learning' },
  { value: 'decision', label: 'Decision', description: 'A choice or commitment' },
]

export function AddToTimelineModal({
  isOpen,
  onClose,
  sourceTitle,
  sourceContent,
  sourceType,
  onConfirm,
}: AddToTimelineModalProps) {
  const [selectedType, setSelectedType] = useState<NodeType>('idea')
  const [customTitle, setCustomTitle] = useState('')
  const [customContent, setCustomContent] = useState('')
  const [suggestions, setSuggestions] = useState<NodeSuggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load AI suggestions when modal opens
  useEffect(() => {
    if (!isOpen) return

    async function loadSuggestions() {
      setLoadingSuggestions(true)
      try {
        const response = await fetch('/api/links/suggest-nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: sourceTitle,
            content: sourceContent,
            sourceType,
          }),
        })

        const data = await response.json()
        if (data.suggestions) {
          setSuggestions(data.suggestions)
        }
      } catch (error) {
        console.warn('[AddToTimeline] Failed to load suggestions:', error)
      } finally {
        setLoadingSuggestions(false)
      }
    }

    loadSuggestions()
  }, [isOpen, sourceTitle, sourceContent, sourceType])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedType('idea')
      setCustomTitle('')
      setCustomContent('')
      setSuggestions([])
    }
  }, [isOpen])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onConfirm(selectedType, customTitle || sourceTitle, customContent)
      onClose()
    } catch (error) {
      console.error('[AddToTimeline] Failed to add to timeline:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUseSuggestion = (suggestion: NodeSuggestion) => {
    setCustomTitle(suggestion.title)
    setCustomContent(suggestion.content || '')
    setSelectedType(suggestion.type)
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--colour-background)',
          border: '1px solid var(--colour-border)',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '2rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: 'var(--colour-foreground)',
            marginBottom: '0.5rem',
          }}
        >
          Add to timeline
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--colour-muted)',
            marginBottom: '1.5rem',
            lineHeight: '1.6',
          }}
        >
          What kind of timeline item is this?
        </p>

        {/* AI Suggestions */}
        {loadingSuggestions && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(var(--colour-accent-rgb), 0.05)',
              border: '1px solid rgba(var(--colour-accent-rgb), 0.15)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '13px',
              color: 'var(--colour-muted)',
            }}
          >
            Looking for suggestions...
          </div>
        )}

        {!loadingSuggestions && suggestions.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--colour-muted)',
                marginBottom: '0.75rem',
              }}
            >
              You could try:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleUseSuggestion(suggestion)}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'rgba(var(--colour-accent-rgb), 0.05)',
                    border: '1px solid rgba(var(--colour-accent-rgb), 0.15)',
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 120ms ease-out',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(var(--colour-accent-rgb), 0.1)'
                    e.currentTarget.style.borderColor = 'var(--colour-accent)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(var(--colour-accent-rgb), 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(var(--colour-accent-rgb), 0.15)'
                  }}
                >
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'var(--colour-foreground)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {suggestion.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--colour-muted)' }}>
                    {suggestion.content || nodeTypes.find((t) => t.value === suggestion.type)?.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Node Type Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--colour-foreground)',
              marginBottom: '0.5rem',
            }}
          >
            Type
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {nodeTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                style={{
                  padding: '0.75rem',
                  border: `1px solid ${selectedType === type.value ? 'var(--colour-accent)' : 'var(--colour-border)'}`,
                  borderRadius: '8px',
                  backgroundColor:
                    selectedType === type.value
                      ? 'rgba(var(--colour-accent-rgb), 0.1)'
                      : 'transparent',
                  color:
                    selectedType === type.value
                      ? 'var(--colour-accent)'
                      : 'var(--colour-foreground)',
                  fontSize: '13px',
                  fontWeight: selectedType === type.value ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 120ms ease-out',
                  textAlign: 'center',
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Title (Optional) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--colour-foreground)',
              marginBottom: '0.5rem',
            }}
          >
            Title (optional)
          </label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder={sourceTitle}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--colour-border)',
              borderRadius: '8px',
              backgroundColor: 'var(--colour-panel)',
              color: 'var(--colour-foreground)',
              fontSize: '14px',
            }}
          />
          <p
            style={{
              fontSize: '12px',
              color: 'var(--colour-muted)',
              marginTop: '0.25rem',
            }}
          >
            Leave blank to use original title
          </p>
        </div>

        {/* Custom Content (Optional) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--colour-foreground)',
              marginBottom: '0.5rem',
            }}
          >
            Note (optional)
          </label>
          <textarea
            value={customContent}
            onChange={(e) => setCustomContent(e.target.value)}
            placeholder="Add any extra context..."
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--colour-border)',
              borderRadius: '8px',
              backgroundColor: 'var(--colour-panel)',
              color: 'var(--colour-foreground)',
              fontSize: '14px',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid var(--colour-border)',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: 'var(--colour-foreground)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid var(--colour-accent)',
              borderRadius: '8px',
              backgroundColor: 'var(--colour-accent)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.5 : 1,
            }}
          >
            {submitting ? 'Adding...' : 'Add to timeline'}
          </button>
        </div>
      </div>
    </div>
  )
}
