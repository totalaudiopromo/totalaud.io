'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getPlaybookChapters, type DbPlaybookChapter } from '@loopos/db'
import { PlaybookSidebar } from '@/playbook/PlaybookSidebar'
import { ChapterEditor } from '@/playbook/ChapterEditor'
import { GenerateChapterModal } from '@/playbook/GenerateChapterModal'

export default function PlaybookPage() {
  const [chapters, setChapters] = useState<DbPlaybookChapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<DbPlaybookChapter | null>(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Placeholder user ID - replace with real auth
  const userId = 'placeholder-user-id'

  useEffect(() => {
    loadChapters()
  }, [])

  async function loadChapters() {
    try {
      setLoading(true)
      const data = await getPlaybookChapters(userId)
      setChapters(data)
      if (data.length > 0 && !selectedChapter) {
        setSelectedChapter(data[0])
      }
    } catch (error) {
      console.error('Error loading chapters:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleChapterCreated(chapter: DbPlaybookChapter) {
    setChapters((prev) => [chapter, ...prev])
    setSelectedChapter(chapter)
    setShowGenerateModal(false)
  }

  function handleChapterUpdated(updated: DbPlaybookChapter) {
    setChapters((prev) => prev.map((ch) => (ch.id === updated.id ? updated : ch)))
    setSelectedChapter(updated)
  }

  function handleChapterDeleted(id: string) {
    setChapters((prev) => prev.filter((ch) => ch.id !== id))
    if (selectedChapter?.id === id) {
      setSelectedChapter(chapters[0] || null)
    }
  }

  return (
    <div className="h-screen flex bg-[#0F1113]">
      {/* Sidebar */}
      <PlaybookSidebar
        chapters={chapters}
        selectedChapterId={selectedChapter?.id}
        onSelectChapter={(chapter) => setSelectedChapter(chapter)}
        onGenerateChapter={() => setShowGenerateModal(true)}
        onChapterDeleted={handleChapterDeleted}
        loading={loading}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center px-8">
          <h1 className="text-2xl font-bold text-white">LoopOS Playbook</h1>
          <p className="ml-4 text-white/60 text-sm">Your strategic guide to music promotion</p>
        </header>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#3AA9BE] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : selectedChapter ? (
            <ChapterEditor
              chapter={selectedChapter}
              userId={userId}
              onUpdate={handleChapterUpdated}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="text-center max-w-md">
                <svg
                  className="w-16 h-16 text-white/20 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-white mb-2">No chapters yet</h2>
                <p className="text-white/60 mb-6">
                  Create your first playbook chapter to get started with strategic planning
                </p>
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="px-6 py-3 bg-[#3AA9BE] text-white font-semibold rounded-lg hover:bg-[#3AA9BE]/90 transition-colors"
                >
                  Generate Chapter with AI
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Chapter Modal */}
      {showGenerateModal && (
        <GenerateChapterModal
          userId={userId}
          onClose={() => setShowGenerateModal(false)}
          onChapterCreated={handleChapterCreated}
        />
      )}
    </div>
  )
}
