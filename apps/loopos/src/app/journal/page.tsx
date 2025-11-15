'use client'

import { PageHeader } from '@/components/PageHeader'
import { Plus, Smile, Frown, Meh, Zap, CheckCircle } from 'lucide-react'
import { useState } from 'react'

type Mood = 'inspired' | 'focused' | 'uncertain' | 'frustrated' | 'accomplished' | null

interface JournalEntry {
  id: string
  content: string
  mood: Mood
  created_at: string
}

const moodIcons: Record<NonNullable<Mood>, { icon: React.ReactNode; colour: string; label: string }> = {
  inspired: { icon: <Zap className="w-4 h-4" />, colour: 'text-yellow-500', label: 'Inspired' },
  focused: { icon: <CheckCircle className="w-4 h-4" />, colour: 'text-blue-500', label: 'Focused' },
  uncertain: { icon: <Meh className="w-4 h-4" />, colour: 'text-gray-500', label: 'Uncertain' },
  frustrated: { icon: <Frown className="w-4 h-4" />, colour: 'text-red-500', label: 'Frustrated' },
  accomplished: { icon: <Smile className="w-4 h-4" />, colour: 'text-green-500', label: 'Accomplished' },
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      content: 'Started planning the radio campaign today. Feeling optimistic about the station list.',
      mood: 'inspired',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '2',
      content: 'Sent out the first batch of pitches. Nerve-wracking but necessary.',
      mood: 'focused',
      created_at: new Date(Date.now() - 43200000).toISOString(),
    },
  ])
  const [newEntry, setNewEntry] = useState('')
  const [selectedMood, setSelectedMood] = useState<Mood>(null)

  const addEntry = () => {
    if (!newEntry.trim()) return

    const entry: JournalEntry = {
      id: String(entries.length + 1),
      content: newEntry,
      mood: selectedMood,
      created_at: new Date().toISOString(),
    }

    setEntries([entry, ...entries])
    setNewEntry('')
    setSelectedMood(null)
  }

  return (
    <div className="min-h-screen bg-matte-black">
      <PageHeader
        title="Journal"
        description="Daily reflections and campaign notes"
      />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* New Entry Form */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">New Entry</h2>
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-slate-cyan resize-none"
            rows={4}
          />

          {/* Mood Selector */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              {Object.entries(moodIcons).map(([mood, { icon, colour, label }]) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood as Mood)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedMood === mood
                      ? 'bg-slate-cyan/20 border border-slate-cyan'
                      : 'bg-gray-800 border border-transparent hover:border-gray-700'
                  }`}
                  title={label}
                >
                  <span className={colour}>{icon}</span>
                  <span className="text-gray-300 hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={addEntry}
              className="flex items-center gap-2 px-4 py-2 bg-slate-cyan hover:bg-slate-cyan/90 text-white rounded-lg text-sm font-medium transition-colours"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colours"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {entry.mood && (
                    <span className={moodIcons[entry.mood].colour}>
                      {moodIcons[entry.mood].icon}
                    </span>
                  )}
                  <span className="text-sm text-gray-400">
                    {new Date(entry.created_at).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">{entry.content}</p>
            </div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No entries yet. Start writing!</p>
          </div>
        )}
      </div>
    </div>
  )
}
