'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DbCreativePack } from '@loopos/db'
import { importTemplatePack } from '@loopos/db'

interface PackDetailModalProps {
  pack: DbCreativePack
  userId?: string
  onClose: () => void
  onImported: () => void
}

export function PackDetailModal({ pack, userId, onClose, onImported }: PackDetailModalProps) {
  const [importing, setImporting] = useState(false)
  const [customName, setCustomName] = useState(pack.name)

  async function handleImport() {
    if (!userId) {
      alert('Please log in to import packs')
      return
    }

    try {
      setImporting(true)
      await importTemplatePack(pack.id, userId, {
        name: customName !== pack.name ? customName : undefined,
      })
      onImported()
    } catch (error) {
      console.error('Error importing pack:', error)
      alert('Failed to import pack')
    } finally {
      setImporting(false)
    }
  }

  const nodes = Array.isArray(pack.nodes) ? pack.nodes : []
  const microActions = Array.isArray(pack.micro_actions) ? pack.micro_actions : []
  const insights = Array.isArray(pack.insights) ? pack.insights : []
  const notes = Array.isArray(pack.notes) ? pack.notes : []

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#0F1113] border border-white/20 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{pack.name}</h2>
                {pack.description && <p className="text-white/60">{pack.description}</p>}
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Import Section (if template) */}
            {pack.is_template && userId && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <label htmlFor="pack-name" className="block text-sm font-medium text-white/80 mb-2">
                  Pack Name
                </label>
                <input
                  id="pack-name"
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#3AA9BE] mb-3"
                  placeholder="Enter pack name"
                />
                <button
                  onClick={handleImport}
                  disabled={importing || !customName}
                  className="w-full px-4 py-3 bg-[#3AA9BE] text-white font-semibold rounded-lg hover:bg-[#3AA9BE]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {importing ? 'Importing...' : 'Import Pack'}
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Nodes */}
            {nodes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#3AA9BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Nodes ({nodes.length})
                </h3>
                <div className="space-y-2">
                  {nodes.map((node: any, index: number) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{node.title}</h4>
                          {node.description && (
                            <p className="text-white/60 text-sm mt-1">{node.description}</p>
                          )}
                        </div>
                        <div className="px-2 py-1 rounded text-xs font-medium bg-white/10 text-white/60">
                          {node.type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Micro-Actions */}
            {microActions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#3AA9BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Micro-Actions
                </h3>
                <ul className="space-y-2">
                  {microActions.map((action: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-white/80">
                      <span className="text-[#3AA9BE] mt-1">•</span>
                      <span className="text-sm">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Insights */}
            {insights.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#3AA9BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Insights
                </h3>
                <ul className="space-y-2">
                  {insights.map((insight: string, index: number) => (
                    <li key={index} className="p-3 bg-[#3AA9BE]/10 border border-[#3AA9BE]/20 rounded-lg">
                      <p className="text-[#3AA9BE]/90 text-sm">{insight}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            {notes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#3AA9BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  Notes
                </h3>
                <ul className="space-y-2">
                  {notes.map((note: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-white/60">
                      <span className="text-white/40 mt-1">→</span>
                      <span className="text-sm">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
