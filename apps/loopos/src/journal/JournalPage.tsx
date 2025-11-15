'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Calendar, Sparkles } from 'lucide-react'
import { JournalEditor } from './JournalEditor'
import { JournalInsights } from './JournalInsights'
import type { JournalEntry } from '@/types'

export function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null)

  useEffect(() => {
    // Load entry for selected date
    loadEntry(selectedDate)
  }, [selectedDate])

  const loadEntry = async (date: Date) => {
    // In production, fetch from database
    const mockEntry: JournalEntry = {
      id: `entry-${date.toISOString()}`,
      date,
      content: '',
      linkedNodes: [],
    }

    setCurrentEntry(mockEntry)
  }

  const handleSaveEntry = async (entry: JournalEntry) => {
    setCurrentEntry(entry)
    setEntries([entry, ...entries.filter((e) => e.id !== entry.id)])

    // In production, save to database
    console.log('Saving entry:', entry)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-matte-black">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-cyan/20 rounded">
              <BookOpen className="w-8 h-8 text-slate-cyan" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Loop Journal</h1>
              <p className="text-slate-400">Your daily creative narrative</p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-4 py-2 bg-[var(--border)] border border-[var(--border-subtle)] rounded focus:outline-none focus:ring-2 focus:ring-slate-cyan"
            />
          </div>
        </div>

        {/* Current Date */}
        <div className="text-center py-4 border-b border-[var(--border)]">
          <p className="text-2xl font-semibold">{formatDate(selectedDate)}</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Editor */}
          <div className="col-span-2">
            {currentEntry && (
              <JournalEditor entry={currentEntry} onSave={handleSaveEntry} />
            )}
          </div>

          {/* Insights Sidebar */}
          <div className="col-span-1">
            {currentEntry && <JournalInsights entry={currentEntry} />}
          </div>
        </div>

        {/* Recent Entries */}
        {entries.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Recent Entries</h2>
            <div className="space-y-4">
              {entries.slice(0, 5).map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedDate(entry.date)}
                  className="w-full p-4 bg-[var(--border)] hover:bg-slate-cyan/10 border border-[var(--border-subtle)] rounded text-left transition-fast"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{formatDate(entry.date)}</span>
                    {entry.momentum && (
                      <span className="text-sm text-slate-400">Momentum: {entry.momentum}%</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">{entry.content}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
