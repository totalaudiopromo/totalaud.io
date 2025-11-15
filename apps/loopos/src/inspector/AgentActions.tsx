'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import type { LoopNode } from '@/types'

interface AgentActionsProps {
  node: LoopNode
}

export function AgentActions({ node }: AgentActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true)

    // Simulate AI generation (in production, this would call an API route)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockSuggestions = [
      'Break this task into 3 smaller subtasks',
      'Add dependency on research node',
      'Schedule for tomorrow morning',
      'Reduce friction by clarifying requirements',
      'Increase priority - blocks other work',
    ]

    setSuggestions(mockSuggestions.slice(0, 3))
    setIsGenerating(false)
  }

  return (
    <div className="p-4 space-y-4 border-b border-[var(--border)]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-cyan" />
          AI Suggestions
        </h3>

        <button
          onClick={handleGenerateSuggestions}
          disabled={isGenerating}
          className="px-3 py-1 bg-slate-cyan/20 hover:bg-slate-cyan/30 text-slate-cyan rounded text-sm font-medium transition-fast disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
              Generating...
            </>
          ) : (
            'Generate'
          )}
        </button>
      </div>

      {suggestions.length > 0 && (
        <ul className="space-y-2">
          {suggestions.map((suggestion, i) => (
            <li
              key={i}
              className="px-3 py-2 bg-slate-cyan/5 border border-slate-cyan/20 rounded text-sm hover:bg-slate-cyan/10 transition-fast cursor-pointer"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      {/* Run Agent Panel */}
      <div className="pt-4 border-t border-[var(--border)]">
        <h4 className="text-sm font-semibold mb-3">Run Agent</h4>

        <div className="space-y-2">
          <button className="w-full px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded transition-fast text-sm font-medium">
            Create Agent
          </button>
          <button className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-fast text-sm font-medium">
            Promote Agent
          </button>
          <button className="w-full px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded transition-fast text-sm font-medium">
            Analyse Agent
          </button>
          <button className="w-full px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded transition-fast text-sm font-medium">
            Refine Agent
          </button>
        </div>
      </div>

      {/* Export to Console */}
      <button className="w-full px-4 py-2 bg-slate-cyan/10 hover:bg-slate-cyan/20 text-slate-cyan rounded transition-fast text-sm font-medium border border-slate-cyan/30">
        Export to Console →
      </button>
    </div>
  )
}
