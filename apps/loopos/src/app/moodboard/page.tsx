'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getMoodboards, type DbMoodboard } from '@loopos/db'
import { MoodboardCanvas } from '@/moodboard/MoodboardCanvas'
import { MoodboardList } from '@/moodboard/MoodboardList'
import { CreateMoodboardModal } from '@/moodboard/CreateMoodboardModal'

export default function MoodboardPage() {
  const [moodboards, setMoodboards] = useState<DbMoodboard[]>([])
  const [selectedMoodboard, setSelectedMoodboard] = useState<DbMoodboard | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Placeholder user ID
  const userId = 'placeholder-user-id'

  useEffect(() => {
    loadMoodboards()
  }, [])

  async function loadMoodboards() {
    try {
      setLoading(true)
      const data = await getMoodboards(userId)
      setMoodboards(data)
      if (data.length > 0 && !selectedMoodboard) {
        setSelectedMoodboard(data[0])
      }
    } catch (error) {
      console.error('Error loading moodboards:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleMoodboardCreated(moodboard: DbMoodboard) {
    setMoodboards((prev) => [moodboard, ...prev])
    setSelectedMoodboard(moodboard)
    setShowCreateModal(false)
  }

  function handleMoodboardDeleted(id: string) {
    setMoodboards((prev) => prev.filter((m) => m.id !== id))
    if (selectedMoodboard?.id === id) {
      setSelectedMoodboard(moodboards[0] || null)
    }
  }

  return (
    <div className="h-screen flex bg-[#0F1113]">
      {/* Sidebar */}
      <MoodboardList
        moodboards={moodboards}
        selectedMoodboardId={selectedMoodboard?.id}
        onSelectMoodboard={setSelectedMoodboard}
        onCreateMoodboard={() => setShowCreateModal(true)}
        onMoodboardDeleted={handleMoodboardDeleted}
        loading={loading}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center px-8">
          <h1 className="text-2xl font-bold text-white">Moodboard</h1>
          <p className="ml-4 text-white/60 text-sm">Visual inspiration hub</p>
        </header>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#3AA9BE] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : selectedMoodboard ? (
            <MoodboardCanvas moodboard={selectedMoodboard} userId={userId} />
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-white mb-2">No moodboards yet</h2>
                <p className="text-white/60 mb-6">
                  Create your first moodboard to collect visual inspiration
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-[#3AA9BE] text-white font-semibold rounded-lg hover:bg-[#3AA9BE]/90 transition-colors"
                >
                  Create Moodboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateMoodboardModal
          userId={userId}
          onClose={() => setShowCreateModal(false)}
          onMoodboardCreated={handleMoodboardCreated}
        />
      )}
    </div>
  )
}
