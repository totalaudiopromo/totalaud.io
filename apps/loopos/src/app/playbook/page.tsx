'use client'

import { PageHeader } from '@/components/PageHeader'
import { Plus, CheckCircle, Circle } from 'lucide-react'
import { useState } from 'react'

interface Chapter {
  id: string
  title: string
  content: string
  order_index: number
  is_completed: boolean
}

export default function PlaybookPage() {
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: '1',
      title: 'Understanding Your Audience',
      content: 'Before pitching to radio or playlists, you must deeply understand who listens to your music. Demographics, psychographics, and listening habits all matter.',
      order_index: 0,
      is_completed: true,
    },
    {
      id: '2',
      title: 'Crafting the Perfect Pitch',
      content: 'Your pitch should be concise, personalised, and demonstrate you've done your research. Avoid generic templates.',
      order_index: 1,
      is_completed: false,
    },
    {
      id: '3',
      title: 'Follow-Up Strategy',
      content: 'Timing is everything. Wait 7-10 days before following up. Be polite, add value, and know when to move on.',
      order_index: 2,
      is_completed: false,
    },
  ])

  const toggleComplete = (id: string) => {
    setChapters(
      chapters.map((ch) =>
        ch.id === id ? { ...ch, is_completed: !ch.is_completed } : ch
      )
    )
  }

  return (
    <div className="min-h-screen bg-matte-black">
      <PageHeader
        title="Playbook"
        description="Strategic chapters for campaign planning"
        action={
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-cyan hover:bg-slate-cyan/90 text-white rounded-lg text-sm font-medium transition-colours">
            <Plus className="w-4 h-4" />
            New Chapter
          </button>
        }
      />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className={`bg-gray-900/50 border rounded-lg p-6 transition-all ${
                chapter.is_completed
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleComplete(chapter.id)}
                  className="flex-shrink-0 mt-1"
                >
                  {chapter.is_completed ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-600 hover:text-gray-400 transition-colours" />
                  )}
                </button>

                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    chapter.is_completed ? 'text-gray-400 line-through' : 'text-white'
                  }`}>
                    {chapter.order_index + 1}. {chapter.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">{chapter.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {chapters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No chapters yet. Start building your playbook!</p>
          </div>
        )}
      </div>
    </div>
  )
}
