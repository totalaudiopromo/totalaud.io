'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGlobalSearch } from './useGlobalSearch'

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function GlobalSearch({ isOpen, onClose, userId }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const { results, search, loading } = useGlobalSearch(userId)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
    }
  }, [isOpen])

  useEffect(() => {
    if (query.length > 1) {
      search(query)
    }
  }, [query, search])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0F1113] border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white text-lg outline-none placeholder-white/30"
                    placeholder="Search nodes, journals, packs, moodboards..."
                    autoFocus
                  />
                  <kbd className="px-2 py-1 bg-white/10 text-white/40 text-xs rounded">ESC</kbd>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-[#3AA9BE] border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : query.length < 2 ? (
                  <div className="p-8 text-center text-white/40 text-sm">
                    Type at least 2 characters to search
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-8 text-center text-white/40 text-sm">
                    No results found for "{query}"
                  </div>
                ) : (
                  <div className="p-2">
                    {results.map((result, index) => (
                      <SearchResult key={`${result.type}-${result.id}-${index}`} result={result} onClick={onClose} />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/10 rounded">⏎</kbd>
                    <span>Open</span>
                  </div>
                </div>
                <div>{results.length} results</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface SearchResultProps {
  result: {
    type: string
    id: string
    title: string
    description?: string
    url?: string
  }
  onClick: () => void
}

function SearchResult({ result, onClick }: SearchResultProps) {
  const typeColors: Record<string, string> = {
    node: '#3AA9BE',
    journal: '#BE3A6B',
    pack: '#6BBE3A',
    moodboard: '#BE8A3A',
    playbook: '#8A3ABE',
  }

  const typeIcons: Record<string, string> = {
    node: '◆',
    journal: '✎',
    pack: '📦',
    moodboard: '🎨',
    playbook: '📖',
  }

  return (
    <motion.button
      onClick={onClick}
      className="w-full p-3 rounded-lg hover:bg-white/5 transition-colors text-left group"
      whileHover={{ x: 4 }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 text-sm"
          style={{ color: typeColors[result.type] || '#fff' }}
        >
          {typeIcons[result.type] || '•'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-medium truncate">{result.title}</h4>
            <span className="text-xs text-white/40 uppercase">{result.type}</span>
          </div>
          {result.description && (
            <p className="text-sm text-white/60 truncate">{result.description}</p>
          )}
        </div>
        <svg
          className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.button>
  )
}
