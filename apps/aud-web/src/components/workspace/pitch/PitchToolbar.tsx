/**
 * Pitch Toolbar Component
 * Phase 5: Export and Draft Management
 *
 * Controls for the Pitch editor including save, load, and export
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  usePitchStore,
  buildPitchMarkdown,
  buildPitchPlainText,
  selectHasContent,
} from '@/stores/usePitchStore'

export function PitchToolbar() {
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showDraftsMenu, setShowDraftsMenu] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [copyFeedback, setCopyFeedback] = useState(false)

  const {
    currentType,
    sections,
    drafts,
    isDirty,
    currentDraftId,
    saveDraft,
    loadDraft,
    deleteDraft,
  } = usePitchStore()

  const hasContent = usePitchStore(selectHasContent)

  // Export handlers
  const handleCopyToClipboard = async () => {
    if (!currentType) return
    const text = buildPitchPlainText(sections, currentType)
    await navigator.clipboard.writeText(text)
    setCopyFeedback(true)
    setTimeout(() => setCopyFeedback(false), 2000)
    setShowExportMenu(false)
  }

  const handleDownloadMarkdown = () => {
    if (!currentType) return
    const content = buildPitchMarkdown(sections, currentType)
    downloadFile(content, `pitch-${currentType}-${Date.now()}.md`, 'text/markdown')
    setShowExportMenu(false)
  }

  const handleDownloadText = () => {
    if (!currentType) return
    const content = buildPitchPlainText(sections, currentType)
    downloadFile(content, `pitch-${currentType}-${Date.now()}.txt`, 'text/plain')
    setShowExportMenu(false)
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Save handler
  const handleSave = () => {
    if (!currentType) return

    if (currentDraftId) {
      // Update existing draft
      const existingDraft = drafts.find((d) => d.id === currentDraftId)
      if (existingDraft) {
        saveDraft(existingDraft.name)
      }
    } else {
      // Show modal for new draft name
      setDraftName('')
      setShowSaveModal(true)
    }
  }

  const handleSaveNewDraft = () => {
    if (!draftName.trim()) return
    saveDraft(draftName.trim())
    setShowSaveModal(false)
    setDraftName('')
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundColor: 'rgba(15, 17, 19, 0.95)',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      {/* Left: Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          Pitch Builder
        </h2>
        <span
          style={{
            fontSize: 12,
            padding: '4px 8px',
            backgroundColor: 'rgba(58, 169, 190, 0.1)',
            border: '1px solid rgba(58, 169, 190, 0.2)',
            borderRadius: 4,
            color: '#3AA9BE',
          }}
        >
          AI-Powered
        </span>
        {isDirty && (
          <span
            style={{
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.4)',
              fontStyle: 'italic',
            }}
          >
            Unsaved changes
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
        {/* Drafts dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowDraftsMenu(!showDraftsMenu)
              setShowExportMenu(false)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.6)',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
            }}
          >
            Drafts
            {drafts.length > 0 && (
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  backgroundColor: 'rgba(58, 169, 190, 0.2)',
                  borderRadius: 10,
                  color: '#3AA9BE',
                }}
              >
                {drafts.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showDraftsMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 240,
                  backgroundColor: 'rgba(15, 17, 19, 0.98)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  overflow: 'hidden',
                  zIndex: 100,
                }}
              >
                {drafts.length === 0 ? (
                  <div
                    style={{
                      padding: 16,
                      fontSize: 13,
                      color: 'rgba(255, 255, 255, 0.5)',
                      textAlign: 'center',
                    }}
                  >
                    No saved drafts yet
                  </div>
                ) : (
                  drafts.map((draft) => (
                    <div
                      key={draft.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <div
                        onClick={() => {
                          loadDraft(draft.id)
                          setShowDraftsMenu(false)
                        }}
                        style={{ flex: 1 }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color:
                              currentDraftId === draft.id ? '#3AA9BE' : 'rgba(255, 255, 255, 0.8)',
                          }}
                        >
                          {draft.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: 'rgba(255, 255, 255, 0.4)',
                            marginTop: 2,
                          }}
                        >
                          {draft.type} • {new Date(draft.updatedAt).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteDraft(draft.id)
                        }}
                        style={{
                          padding: '4px 8px',
                          fontSize: 11,
                          color: 'rgba(255, 255, 255, 0.4)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Export dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowExportMenu(!showExportMenu)
              setShowDraftsMenu(false)
            }}
            disabled={!hasContent}
            style={{
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 400,
              color: hasContent ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.3)',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              cursor: hasContent ? 'pointer' : 'not-allowed',
              transition: 'all 0.12s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              if (hasContent) {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.color = hasContent
                ? 'rgba(255, 255, 255, 0.6)'
                : 'rgba(255, 255, 255, 0.3)'
            }}
          >
            {copyFeedback ? 'Copied!' : 'Export'}
          </button>

          <AnimatePresence>
            {showExportMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 180,
                  backgroundColor: 'rgba(15, 17, 19, 0.98)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  overflow: 'hidden',
                  zIndex: 100,
                }}
              >
                {[
                  { label: 'Copy to clipboard', action: handleCopyToClipboard },
                  { label: 'Download .md', action: handleDownloadMarkdown },
                  { label: 'Download .txt', action: handleDownloadText },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: 13,
                      color: 'rgba(255, 255, 255, 0.7)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!currentType || !hasContent}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 500,
            color: currentType && hasContent ? '#0F1113' : 'rgba(255, 255, 255, 0.3)',
            backgroundColor: currentType && hasContent ? '#3AA9BE' : 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: 6,
            cursor: currentType && hasContent ? 'pointer' : 'not-allowed',
            transition: 'opacity 0.12s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            if (currentType && hasContent) {
              e.currentTarget.style.opacity = '0.9'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          {currentDraftId ? 'Update Draft' : 'Save Draft'}
        </button>
      </div>

      {/* Save modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 360,
                padding: 24,
                backgroundColor: '#1a1c1e',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                boxShadow: '0 16px 64px rgba(0, 0, 0, 0.5)',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  marginBottom: 16,
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#F7F8F9',
                }}
              >
                Save Draft
              </h3>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Enter a name for your draft..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: 14,
                  color: '#F7F8F9',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  outline: 'none',
                  fontFamily: 'inherit',
                  marginBottom: 16,
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveNewDraft()
                  if (e.key === 'Escape') setShowSaveModal(false)
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowSaveModal(false)}
                  style={{
                    padding: '10px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.6)',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewDraft}
                  disabled={!draftName.trim()}
                  style={{
                    padding: '10px 16px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: draftName.trim() ? '#0F1113' : 'rgba(255, 255, 255, 0.3)',
                    backgroundColor: draftName.trim() ? '#3AA9BE' : 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    borderRadius: 6,
                    cursor: draftName.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                  }}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
