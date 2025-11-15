'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { DbMoodboard, DbMoodboardItem } from '@loopos/db'
import { getMoodboardItems, uploadMoodboardImage, createMoodboardItem, deleteMoodboardItem } from '@loopos/db'

interface MoodboardCanvasProps {
  moodboard: DbMoodboard
  userId: string
}

export function MoodboardCanvas({ moodboard, userId }: MoodboardCanvasProps) {
  const [items, setItems] = useState<DbMoodboardItem[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadItems()
  }, [moodboard.id])

  async function loadItems() {
    try {
      const data = await getMoodboardItems(moodboard.id)
      setItems(data)
    } catch (error) {
      console.error('Error loading items:', error)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploading(true)

      for (const file of Array.from(files)) {
        // Upload to Supabase Storage
        const { url, path } = await uploadMoodboardImage(userId, moodboard.id, file)

        // Create moodboard item
        const item: Omit<DbMoodboardItem, 'id' | 'created_at'> = {
          moodboard_id: moodboard.id,
          user_id: userId,
          item_type: 'image',
          image_url: url,
          storage_path: path,
          tags: [],
          position: {
            x: Math.random() * 500,
            y: Math.random() * 500,
          },
          metadata: {
            uploaded_at: new Date().toISOString(),
            file_name: file.name,
            file_size: file.size,
          },
        }

        const created = await createMoodboardItem(item)
        setItems((prev) => [...prev, created])
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function handleDelete(item: DbMoodboardItem) {
    if (!confirm('Delete this item?')) return

    try {
      await deleteMoodboardItem(item.id)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#0F1113]">
      {/* Toolbar */}
      <div className="border-b border-white/10 p-4 flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-[#3AA9BE] text-white font-semibold rounded-lg hover:bg-[#3AA9BE]/90 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>

        <div className="flex-1" />

        <div className="text-sm text-white/60">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-8">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
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
              <p className="text-white/60">Upload images to start your moodboard</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <MoodboardItemCard key={item.id} item={item} onDelete={() => handleDelete(item)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface MoodboardItemCardProps {
  item: DbMoodboardItem
  onDelete: () => void
}

function MoodboardItemCard({ item, onDelete }: MoodboardItemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/5 hover:border-white/20 transition-colors"
    >
      {item.item_type === 'image' && item.image_url && (
        <img
          src={item.image_url}
          alt="Moodboard item"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Delete Button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onDelete}
          className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors"
          aria-label="Delete item"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}
