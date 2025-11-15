'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, TrendingUp, TrendingDown, Minus, Loader2, X } from 'lucide-react'
import type { AutoLoopAnalysis } from '@/agents/AutoLooper'

interface AutoLoopSummaryProps {
  isOpen: boolean
  onClose: () => void
}

export function AutoLoopSummary({ isOpen, onClose }: AutoLoopSummaryProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AutoLoopAnalysis | null>(null)

  const handleRunAnalysis = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auto-loop', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to run analysis')

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error('Auto-loop analysis failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const trendIcons = {
    increasing: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    stable: <Minus className="w-5 h-5 text-slate-400" />,
    decreasing: <TrendingDown className="w-5 h-5 text-red-400" />,
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-matte-black border border-[var(--border)] rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-cyan/20 rounded">
                  <Sparkles className="w-6 h-6 text-slate-cyan" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Auto-Loop Intelligence</h2>
                  <p className="text-sm text-slate-400">AI-driven loop analysis & suggestions</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-cyan/10 rounded transition-fast"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {!analysis && !isLoading && (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-slate-cyan mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400 mb-6">
                    Run Auto-Loop analysis to get AI-powered insights about your creative flow
                  </p>
                  <button
                    onClick={handleRunAnalysis}
                    className="px-6 py-3 bg-slate-cyan/20 hover:bg-slate-cyan/30 text-slate-cyan rounded font-medium transition-fast"
                  >
                    Run Analysis
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-slate-cyan mx-auto mb-4 animate-spin" />
                  <p className="text-slate-400">Analysing your creative loop...</p>
                </div>
              )}

              {analysis && (
                <div className="space-y-6">
                  {/* Momentum */}
                  <div className="p-4 bg-slate-cyan/5 border border-slate-cyan/20 rounded">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Momentum</h3>
                      <div className="flex items-center gap-2">
                        {trendIcons[analysis.trend]}
                        <span className="text-2xl font-bold">{analysis.momentum}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-[var(--border)] rounded-full h-2">
                      <div
                        className="bg-slate-cyan h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analysis.momentum}%` }}
                      />
                    </div>
                  </div>

                  {/* Suggested Actions */}
                  {analysis.suggestedActions.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Suggested Actions</h3>
                      <ul className="space-y-2">
                        {analysis.suggestedActions.map((action, i) => (
                          <li
                            key={i}
                            className="px-4 py-3 bg-[var(--border)] rounded hover:bg-slate-cyan/10 transition-fast cursor-pointer"
                          >
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Micro Actions */}
                  {analysis.microActions.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Micro-Actions (Quick Wins)</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.microActions.map((action, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm"
                          >
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Nodes */}
                  {analysis.suggestedNodes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Suggested New Nodes</h3>
                      <div className="space-y-3">
                        {analysis.suggestedNodes.map((node, i) => (
                          <div key={i} className="p-4 bg-[var(--border)] rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium uppercase text-slate-cyan">
                                {node.type}
                              </span>
                              <span className="text-xs text-slate-500">
                                Priority: {node.suggestedPriority}%
                              </span>
                            </div>
                            <h4 className="font-semibold mb-1">{node.title}</h4>
                            <p className="text-sm text-slate-400">{node.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Emerging Themes */}
                  {analysis.emergingThemes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Emerging Themes</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.emergingThemes.map((theme, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
