'use client'

import { PageHeader } from '@/components/PageHeader'
import { Plus, Image as ImageIcon, Link as LinkIcon, Type, Palette } from 'lucide-react'
import { useState } from 'react'

type ItemType = 'image' | 'link' | 'text' | 'colour'

interface MoodboardItem {
  id: string
  type: ItemType
  content: string
  title?: string
}

const typeIcons: Record<ItemType, React.ReactNode> = {
  image: <ImageIcon className="w-4 h-4" />,
  link: <LinkIcon className="w-4 h-4" />,
  text: <Type className="w-4 h-4" />,
  colour: <Palette className="w-4 h-4" />,
}

export default function MoodboardPage() {
  const [items, setItems] = useState<MoodboardItem[]>([
    { id: '1', type: 'colour', content: '#3AA9BE', title: 'Slate Cyan' },
    { id: '2', type: 'text', content: 'Cinematic, calm, intentional', title: 'Vibe' },
    { id: '3', type: 'link', content: 'https://totalaudio.com', title: 'Reference' },
  ])
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="min-h-screen bg-matte-black">
      <PageHeader
        title="Moodboard"
        description="Visual inspiration and references"
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-cyan hover:bg-slate-cyan/90 text-white rounded-lg text-sm font-medium transition-colours"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-slate-cyan/50 transition-all group"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-slate-cyan">{typeIcons[item.type]}</span>
                <span className="text-xs text-gray-500 uppercase">{item.type}</span>
              </div>

              {item.type === 'colour' && (
                <div
                  className="w-full h-32 rounded-lg mb-3"
                  style={{ backgroundColor: item.content }}
                />
              )}

              {item.type === 'image' && (
                <div className="w-full h-32 rounded-lg mb-3 bg-gray-800 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                </div>
              )}

              {item.title && (
                <h3 className="text-sm font-medium text-white mb-1">{item.title}</h3>
              )}

              <p className="text-xs text-gray-400 break-all">{item.content}</p>
            </div>
          ))}

          {/* Add New Card */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gray-900/30 border-2 border-dashed border-gray-800 rounded-lg p-6 hover:border-slate-cyan/50 transition-all flex flex-col items-center justify-center min-h-[200px] group"
          >
            <Plus className="w-8 h-8 text-gray-600 group-hover:text-slate-cyan transition-colours mb-2" />
            <span className="text-sm text-gray-500 group-hover:text-gray-400">Add Item</span>
          </button>
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items yet. Start building your moodboard!</p>
          </div>
        )}
      </div>
    </div>
  )
}
