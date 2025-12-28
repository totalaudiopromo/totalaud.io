/**
 * Pitch Toolbar Component
 * Phase 5: Export and Draft Management
 *
 * Controls for the Pitch editor including save, load, and export
 * Uses TAP design system tokens for consistent styling
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  usePitchStore,
  buildPitchMarkdown,
  buildPitchPlainText,
  selectHasContent,
} from '@/stores/usePitchStore'
import {
  DocumentArrowDownIcon,
  FolderIcon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export function PitchToolbar() {
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showDraftsMenu, setShowDraftsMenu] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [copyFeedback, setCopyFeedback] = useState(false)

  const exportRef = useRef<HTMLDivElement>(null)
  const draftsRef = useRef<HTMLDivElement>(null)

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

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
      if (draftsRef.current && !draftsRef.current.contains(e.target as Node)) {
        setShowDraftsMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      const existingDraft = drafts.find((d) => d.id === currentDraftId)
      if (existingDraft) {
        saveDraft(existingDraft.name)
      }
    } else {
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
    <>
      <div className="px-5 py-3 border-b border-white/5 bg-ta-black/95 backdrop-blur-ta sticky top-0 z-20">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-ta-white">Pitch Builder</h2>
            <span className="text-xs px-2 py-1 bg-ta-cyan/10 border border-ta-cyan/20 rounded-ta-sm text-ta-cyan">
              AI-Powered
            </span>
            {isDirty && <span className="text-[11px] text-ta-grey/60 italic">Unsaved changes</span>}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Drafts dropdown */}
            <div ref={draftsRef} className="relative">
              <button
                onClick={() => {
                  setShowDraftsMenu(!showDraftsMenu)
                  setShowExportMenu(false)
                }}
                className="flex items-center gap-2 px-3 py-2 text-[13px] text-ta-grey hover:text-ta-white bg-transparent border border-white/10 hover:border-white/20 rounded-ta-sm transition-all duration-120"
              >
                <FolderIcon className="h-4 w-4" />
                Drafts
                {drafts.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-ta-cyan/20 rounded-ta-pill text-ta-cyan">
                    {drafts.length}
                  </span>
                )}
                <ChevronDownIcon className="h-3 w-3" />
              </button>

              <AnimatePresence>
                {showDraftsMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-60 bg-ta-panel/98 border border-white/10 rounded-ta shadow-ta-lg overflow-hidden z-50"
                  >
                    {drafts.length === 0 ? (
                      <div className="p-4 text-[13px] text-ta-grey/60 text-center">
                        No saved drafts yet
                      </div>
                    ) : (
                      drafts.map((draft) => (
                        <div
                          key={draft.id}
                          className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors duration-120"
                        >
                          <div
                            onClick={() => {
                              loadDraft(draft.id)
                              setShowDraftsMenu(false)
                            }}
                            className="flex-1"
                          >
                            <div
                              className={`text-[13px] font-medium ${
                                currentDraftId === draft.id ? 'text-ta-cyan' : 'text-ta-white/80'
                              }`}
                            >
                              {draft.name}
                            </div>
                            <div className="text-[11px] text-ta-grey/50 mt-0.5">
                              {draft.type} • {new Date(draft.updatedAt).toLocaleDateString('en-GB')}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteDraft(draft.id)
                            }}
                            className="p-1 text-ta-grey/40 hover:text-ta-error transition-colors"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export dropdown */}
            <div ref={exportRef} className="relative">
              <button
                onClick={() => {
                  setShowExportMenu(!showExportMenu)
                  setShowDraftsMenu(false)
                }}
                disabled={!hasContent}
                className={`flex items-center gap-2 px-3 py-2 text-[13px] bg-transparent border border-white/10 rounded-ta-sm transition-all duration-120 ${
                  hasContent
                    ? 'text-ta-grey hover:text-ta-white hover:border-white/20'
                    : 'text-ta-grey/30 cursor-not-allowed'
                }`}
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                {copyFeedback ? 'Copied!' : 'Export'}
                <ChevronDownIcon className="h-3 w-3" />
              </button>

              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-44 bg-ta-panel/98 border border-white/10 rounded-ta shadow-ta-lg overflow-hidden z-50"
                  >
                    {[
                      { label: 'Copy to clipboard', action: handleCopyToClipboard },
                      { label: 'Download .md', action: handleDownloadMarkdown },
                      { label: 'Download .txt', action: handleDownloadText },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="block w-full px-3 py-2.5 text-[13px] text-ta-white/70 text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors duration-120"
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
              className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium rounded-ta-sm transition-all duration-120 ${
                currentType && hasContent
                  ? 'bg-ta-cyan text-ta-black hover:opacity-90'
                  : 'bg-white/5 text-ta-grey/30 cursor-not-allowed'
              }`}
            >
              {currentDraftId ? 'Update Draft' : 'Save Draft'}
            </button>
          </div>
        </div>
      </div>

      {/* Save modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-6"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm p-6 bg-ta-panel border border-white/10 rounded-ta shadow-ta-lg"
            >
              <h3 className="text-base font-semibold text-ta-white mb-4">Save Draft</h3>
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Enter a name for your draft..."
                autoFocus
                className="w-full px-3 py-2.5 text-sm text-ta-white bg-white/5 border border-white/10 rounded-ta-sm outline-none focus:border-ta-cyan/50 focus:ring-1 focus:ring-ta-cyan/20 transition-all duration-180 mb-4"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveNewDraft()
                  if (e.key === 'Escape') setShowSaveModal(false)
                }}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 text-[13px] font-medium text-ta-grey/70 bg-transparent border border-white/10 rounded-ta-sm hover:border-white/20 transition-all duration-120"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewDraft}
                  disabled={!draftName.trim()}
                  className={`px-4 py-2 text-[13px] font-medium rounded-ta-sm transition-all duration-120 ${
                    draftName.trim()
                      ? 'bg-ta-cyan text-ta-black hover:opacity-90'
                      : 'bg-white/5 text-ta-grey/30 cursor-not-allowed'
                  }`}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
