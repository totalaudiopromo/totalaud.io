"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface CommandPaletteProps {
  onSubmit: (query: string) => void
}

export function CommandPalette({ onSubmit }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  // Handle ⌘K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSubmit = () => {
    if (query.trim()) {
      onSubmit(query)
      setQuery("")
      setOpen(false)
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-medium z-40"
      >
        <span className="text-lg">⌘K</span>
        <span>Ask TotalAud.io</span>
      </button>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 pt-[20vh]"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-800 text-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
            >
              {/* Input area */}
              <div className="p-6 border-b border-slate-700">
                <input
                  autoFocus
                  className="w-full bg-transparent outline-none text-2xl placeholder-slate-500"
                  placeholder="Ask anything... e.g. 'Find UK indie radio curators'"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      handleSubmit()
                    }
                  }}
                />
              </div>

              {/* Suggestions */}
              <div className="p-6 space-y-3">
                <p className="text-slate-400 text-sm font-medium mb-3">Try these:</p>
                {[
                  "Find UK indie radio curators for synthpop",
                  "Research playlist curators for electronic music",
                  "Get contact info for music journalists in London"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(suggestion)
                      onSubmit(suggestion)
                      setOpen(false)
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-200 transition-colors duration-150"
                  >
                    <span className="text-blue-400 mr-2">→</span>
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700 flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center gap-4">
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">↵</kbd>
                  <span>to submit</span>
                </div>
                <div className="flex items-center gap-4">
                  <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">ESC</kbd>
                  <span>to close</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

