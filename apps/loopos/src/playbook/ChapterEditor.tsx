'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { DbPlaybookChapter } from '@loopos/db'
import { updatePlaybookChapter } from '@loopos/db'

interface ChapterEditorProps {
  chapter: DbPlaybookChapter
  userId: string
  onUpdate: (chapter: DbPlaybookChapter) => void
}

export function ChapterEditor({ chapter, userId, onUpdate }: ChapterEditorProps) {
  const [title, setTitle] = useState(chapter.title)
  const [content, setContent] = useState(chapter.content)
  const [tags, setTags] = useState<string[]>(chapter.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== chapter.title || content !== chapter.content || JSON.stringify(tags) !== JSON.stringify(chapter.tags)) {
        handleSave()
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [title, content, tags])

  async function handleSave() {
    if (!title || !content) return

    try {
      setSaving(true)
      const updated = await updatePlaybookChapter(chapter.id, {
        title,
        content,
        tags,
      })
      onUpdate(updated)
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error saving chapter:', error)
    } finally {
      setSaving(false)
    }
  }

  function handleAddTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  return (
    <div className="h-full flex flex-col bg-[#0F1113]">
      {/* Editor Header */}
      <div className="border-b border-white/10 p-6">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl font-bold text-white bg-transparent border-none outline-none placeholder-white/30 mb-4"
          placeholder="Chapter title..."
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <motion.div
              key={tag}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-3 py-1 bg-[#3AA9BE]/20 text-[#3AA9BE] rounded-full text-sm flex items-center gap-2"
            >
              <span>{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-[#3AA9BE]/70 transition-colors"
                aria-label={`Remove ${tag} tag`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Add Tag Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#3AA9BE]"
            placeholder="Add tag..."
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm"
          >
            Add
          </button>
        </div>

        {/* Save Status */}
        <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
          {saving ? (
            <>
              <div className="w-3 h-3 border border-[#3AA9BE] border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full min-h-[500px] text-white/90 bg-transparent border-none outline-none resize-none font-mono text-sm leading-relaxed placeholder-white/30"
          placeholder="Write your strategic playbook chapter here...

Use markdown for formatting:

# Heading
## Subheading
**bold** and *italic*
- Bullet points
1. Numbered lists

Share insights, strategies, and actionable advice for music promotion..."
        />
      </div>

      {/* Footer Info */}
      <div className="border-t border-white/10 px-6 py-3 flex items-center justify-between text-xs text-white/40">
        <div className="flex items-center gap-4">
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
          <span>{content.length} characters</span>
        </div>
        {chapter.is_ai_generated && (
          <div className="flex items-center gap-1 text-[#3AA9BE]">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>AI Generated</span>
          </div>
        )}
      </div>
    </div>
  )
}
