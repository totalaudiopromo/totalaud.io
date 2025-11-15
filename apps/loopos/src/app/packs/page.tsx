'use client'

import { PageHeader } from '@/components/PageHeader'
import { Download, Radio, Music, Truck, ListMusic } from 'lucide-react'

interface CreativePack {
  id: string
  name: string
  description: string
  category: string
  nodeCount: number
  estimatedDuration: string
  difficulty: string
}

const packs: CreativePack[] = [
  {
    id: '1',
    name: 'Radio Promo Starter',
    description: 'Essential nodes for securing radio airplay: research stations, pitch contacts, follow up, track results',
    category: 'radio-promo',
    nodeCount: 6,
    estimatedDuration: '6 weeks',
    difficulty: 'intermediate',
  },
  {
    id: '2',
    name: 'Single Release Campaign',
    description: 'Complete workflow for independent single release: pre-save, playlist pitch, PR, social content',
    category: 'release-campaign',
    nodeCount: 8,
    estimatedDuration: '8 weeks',
    difficulty: 'intermediate',
  },
  {
    id: '3',
    name: 'Playlist Pitching Pro',
    description: 'Systematic approach to Spotify, Apple Music, and independent playlist placements',
    category: 'playlist-push',
    nodeCount: 7,
    estimatedDuration: '4 weeks',
    difficulty: 'beginner',
  },
  {
    id: '4',
    name: 'Tour Announcement Strategy',
    description: 'Maximise ticket sales with strategic tour announcement and promotion',
    category: 'tour-support',
    nodeCount: 7,
    estimatedDuration: '6 weeks',
    difficulty: 'advanced',
  },
]

const categoryIcons: Record<string, React.ReactNode> = {
  'radio-promo': <Radio className="w-5 h-5" />,
  'release-campaign': <Music className="w-5 h-5" />,
  'playlist-push': <ListMusic className="w-5 h-5" />,
  'tour-support': <Truck className="w-5 h-5" />,
}

const difficultyColours: Record<string, string> = {
  beginner: 'text-green-500',
  intermediate: 'text-yellow-500',
  advanced: 'text-red-500',
}

export default function PacksPage() {
  return (
    <div className="min-h-screen bg-matte-black">
      <PageHeader
        title="Creative Packs"
        description="Pre-built campaign templates to accelerate your workflow"
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-slate-cyan/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-slate-cyan">
                    {categoryIcons[pack.category]}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{pack.name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{pack.category.replace('-', ' ')}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-4 leading-relaxed">{pack.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{pack.nodeCount} nodes</span>
                <span>{pack.estimatedDuration}</span>
                <span className={difficultyColours[pack.difficulty] || 'text-gray-500'}>
                  {pack.difficulty}
                </span>
              </div>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-cyan/10 hover:bg-slate-cyan/20 text-slate-cyan rounded-lg text-sm font-medium transition-colours group-hover:bg-slate-cyan group-hover:text-white">
                <Download className="w-4 h-4" />
                Import Pack
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
