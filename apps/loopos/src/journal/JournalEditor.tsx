'use client'

import { useState, useEffect } from 'react'
import { Save, Sparkles } from 'lucide-react'
import type { JournalEntry } from '@/types'

interface JournalEditorProps {
  entry: JournalEntry
  onSave: (entry: JournalEntry) => void
}

export function JournalEditor({ entry, onSave }: JournalEditorProps) {
  const [content, setContent] = useState(entry.content)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)

  useEffect(() => {
    setContent(entry.content)
  }, [entry.id])

  const handleSave = () => {
    onSave({
      ...entry,
      content,
    })
  }

  const handleGenerateInsights = async () => {
    setIsGeneratingInsights(true)

    try {
      const response = await fetch('/api/journal/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) throw new Error('Failed to generate insights')

      const data = await response.json()

      onSave({
        ...entry,
        content,
        aiSummary: data.summary,
        blockers: data.blockers,
        themes: data.themes,
        tomorrowActions: data.tomorrowActions,
      })
    } catch (error) {
      console.error('Failed to generate insights:', error)
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  return (
    <div className="bg-[var(--border)] border border-[var(--border-subtle)] rounded p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Today's Entry</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateInsights}
            disabled={!content || isGeneratingInsights}
            className="px-4 py-2 bg-slate-cyan/20 hover:bg-slate-cyan/30 text-slate-cyan rounded transition-fast disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isGeneratingInsights ? 'Generating...' : 'Generate Insights'}
          </button>

          <button
            onClick={handleSave}
            disabled={!content}
            className="px-4 py-2 bg-slate-cyan hover:bg-slate-cyan/90 text-white rounded transition-fast disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your creative mind today?

Write about:
• Progress on current projects
• Ideas and inspirations
• Challenges and blockers
• Wins and breakthroughs
• Plans for tomorrow

Let the words flow..."
        className="w-full h-[500px] px-4 py-3 bg-matte-black border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-slate-cyan resize-none font-mono text-sm leading-relaxed"
      />

      {/* Word Count */}
      <div className="text-sm text-slate-500 text-right">
        {content.split(/\s+/).filter(Boolean).length} words
      </div>
    </div>
  )
}
