'use client'

import { motion } from 'framer-motion'
import type { DbMoodboard } from '@loopos/db'
import { toggleArchive, deleteMoodboard } from '@loopos/db'

interface MoodboardListProps {
  moodboards: DbMoodboard[]
  selectedMoodboardId?: string
  onSelectMoodboard: (moodboard: DbMoodboard) => void
  onCreateMoodboard: () => void
  onMoodboardDeleted: (id: string) => void
  loading: boolean
}

export function MoodboardList({
  moodboards,
  selectedMoodboardId,
  onSelectMoodboard,
  onCreateMoodboard,
  onMoodboardDeleted,
  loading,
}: MoodboardListProps) {
  async function handleToggleArchive(moodboard: DbMoodboard, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await toggleArchive(moodboard.id, !moodboard.is_archived)
    } catch (error) {
      console.error('Error toggling archive:', error)
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this moodboard? This cannot be undone.')) return

    try {
      await deleteMoodboard(id)
      onMoodboardDeleted(id)
    } catch (error) {
      console.error('Error deleting moodboard:', error)
    }
  }

  const activeMoodboards = moodboards.filter((m) => !m.is_archived)
  const archivedMoodboards = moodboards.filter((m) => m.is_archived)

  return (
    <div className="w-80 border-r border-white/10 flex flex-col bg-black/20">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <button
          onClick={onCreateMoodboard}
          className="w-full px-4 py-3 bg-[#3AA9BE] text-white font-semibold rounded-lg hover:bg-[#3AA9BE]/90 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Moodboard
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="w-6 h-6 border-2 border-[#3AA9BE] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Active Moodboards */}
            {activeMoodboards.length > 0 && (
              <div className="p-4">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">
                  Active
                </h3>
                <div className="space-y-1">
                  {activeMoodboards.map((moodboard) => (
                    <MoodboardItem
                      key={moodboard.id}
                      moodboard={moodboard}
                      isSelected={moodboard.id === selectedMoodboardId}
                      onSelect={() => onSelectMoodboard(moodboard)}
                      onToggleArchive={handleToggleArchive}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Archived Moodboards */}
            {archivedMoodboards.length > 0 && (
              <div className="p-4">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">
                  Archived
                </h3>
                <div className="space-y-1">
                  {archivedMoodboards.map((moodboard) => (
                    <MoodboardItem
                      key={moodboard.id}
                      moodboard={moodboard}
                      isSelected={moodboard.id === selectedMoodboardId}
                      onSelect={() => onSelectMoodboard(moodboard)}
                      onToggleArchive={handleToggleArchive}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

interface MoodboardItemProps {
  moodboard: DbMoodboard
  isSelected: boolean
  onSelect: () => void
  onToggleArchive: (moodboard: DbMoodboard, e: React.MouseEvent) => void
  onDelete: (id: string, e: React.MouseEvent) => void
}

function MoodboardItem({ moodboard, isSelected, onSelect, onToggleArchive, onDelete }: MoodboardItemProps) {
  return (
    <motion.button
      onClick={onSelect}
      className={`w-full p-3 rounded-lg text-left transition-colors group relative ${
        isSelected
          ? 'bg-[#3AA9BE]/20 border border-[#3AA9BE]/40'
          : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10'
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm truncate">{moodboard.name}</h4>
          {moodboard.description && (
            <p className="text-white/40 text-xs truncate mt-1">{moodboard.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => onToggleArchive(moodboard, e)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            aria-label={moodboard.is_archived ? 'Unarchive' : 'Archive'}
          >
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </button>

          <button
            onClick={(e) => onDelete(moodboard.id, e)}
            className="p-1 hover:bg-red-500/20 rounded transition-colors"
            aria-label="Delete"
          >
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </motion.button>
  )
}
