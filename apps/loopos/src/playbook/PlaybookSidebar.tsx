'use client'

import { motion } from 'framer-motion'
import type { DbPlaybookChapter } from '@loopos/db'
import { toggleFavourite, deletePlaybookChapter } from '@loopos/db'

interface PlaybookSidebarProps {
  chapters: DbPlaybookChapter[]
  selectedChapterId?: string
  onSelectChapter: (chapter: DbPlaybookChapter) => void
  onGenerateChapter: () => void
  onChapterDeleted: (id: string) => void
  loading: boolean
}

const CATEGORY_LABELS: Record<DbPlaybookChapter['category'], string> = {
  'release-strategy': 'Release Strategy',
  'promo-strategy': 'Promo Strategy',
  'growth-strategy': 'Growth Strategy',
  'pr-strategy': 'PR Strategy',
  'social-strategy': 'Social Strategy',
  'audience-strategy': 'Audience Strategy',
  'creative-process': 'Creative Process',
  custom: 'Custom',
}

export function PlaybookSidebar({
  chapters,
  selectedChapterId,
  onSelectChapter,
  onGenerateChapter,
  onChapterDeleted,
  loading,
}: PlaybookSidebarProps) {
  async function handleToggleFavourite(chapter: DbPlaybookChapter, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await toggleFavourite(chapter.id, !chapter.is_favourite)
      // Optimistic update would go here
    } catch (error) {
      console.error('Error toggling favourite:', error)
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this chapter? This cannot be undone.')) return

    try {
      await deletePlaybookChapter(id)
      onChapterDeleted(id)
    } catch (error) {
      console.error('Error deleting chapter:', error)
    }
  }

  // Group chapters by category
  const groupedChapters = chapters.reduce(
    (acc, chapter) => {
      if (!acc[chapter.category]) {
        acc[chapter.category] = []
      }
      acc[chapter.category].push(chapter)
      return acc
    },
    {} as Record<string, DbPlaybookChapter[]>
  )

  const favourites = chapters.filter((ch) => ch.is_favourite)

  return (
    <div className="w-80 border-r border-white/10 flex flex-col bg-black/20">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <button
          onClick={onGenerateChapter}
          className="w-full px-4 py-3 bg-[#3AA9BE] text-white font-semibold rounded-lg hover:bg-[#3AA9BE]/90 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Generate Chapter
        </button>
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="w-6 h-6 border-2 border-[#3AA9BE] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Favourites */}
            {favourites.length > 0 && (
              <div className="p-4">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">
                  Favourites
                </h3>
                <div className="space-y-1">
                  {favourites.map((chapter) => (
                    <ChapterItem
                      key={chapter.id}
                      chapter={chapter}
                      isSelected={chapter.id === selectedChapterId}
                      onSelect={() => onSelectChapter(chapter)}
                      onToggleFavourite={handleToggleFavourite}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Grouped Chapters */}
            {Object.entries(groupedChapters).map(([category, categoryChapters]) => (
              <div key={category} className="p-4">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">
                  {CATEGORY_LABELS[category as DbPlaybookChapter['category']]}
                </h3>
                <div className="space-y-1">
                  {categoryChapters.map((chapter) => (
                    <ChapterItem
                      key={chapter.id}
                      chapter={chapter}
                      isSelected={chapter.id === selectedChapterId}
                      onSelect={() => onSelectChapter(chapter)}
                      onToggleFavourite={handleToggleFavourite}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

interface ChapterItemProps {
  chapter: DbPlaybookChapter
  isSelected: boolean
  onSelect: () => void
  onToggleFavourite: (chapter: DbPlaybookChapter, e: React.MouseEvent) => void
  onDelete: (id: string, e: React.MouseEvent) => void
}

function ChapterItem({ chapter, isSelected, onSelect, onToggleFavourite, onDelete }: ChapterItemProps) {
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
          <h4 className="text-white font-medium text-sm truncate">{chapter.title}</h4>
          {chapter.is_ai_generated && (
            <div className="flex items-center gap-1 mt-1">
              <svg className="w-3 h-3 text-[#3AA9BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-[#3AA9BE] text-xs">AI Generated</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => onToggleFavourite(chapter, e)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            aria-label={chapter.is_favourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            {chapter.is_favourite ? (
              <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            )}
          </button>

          <button
            onClick={(e) => onDelete(chapter.id, e)}
            className="p-1 hover:bg-red-500/20 rounded transition-colors"
            aria-label="Delete chapter"
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
