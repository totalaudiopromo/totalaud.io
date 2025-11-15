'use client'

import { motion } from 'framer-motion'
import type { DbCreativePack } from '@loopos/db'

interface PackCardProps {
  pack: DbCreativePack
  onClick: () => void
}

const PACK_TYPE_LABELS: Record<DbCreativePack['pack_type'], string> = {
  release: 'Release',
  promo: 'Promo',
  'audience-growth': 'Audience Growth',
  'creative-sprint': 'Creative Sprint',
  'social-accelerator': 'Social Accelerator',
  'press-pr': 'Press & PR',
  'tiktok-momentum': 'TikTok Momentum',
}

const PACK_TYPE_COLOURS: Record<DbCreativePack['pack_type'], string> = {
  release: '#3AA9BE',
  promo: '#BE3A6B',
  'audience-growth': '#6BBE3A',
  'creative-sprint': '#BE8A3A',
  'social-accelerator': '#8A3ABE',
  'press-pr': '#3A6BBE',
  'tiktok-momentum': '#BE3A3A',
}

export function PackCard({ pack, onClick }: PackCardProps) {
  const colour = PACK_TYPE_COLOURS[pack.pack_type]
  const label = PACK_TYPE_LABELS[pack.pack_type]
  const nodeCount = Array.isArray(pack.nodes) ? pack.nodes.length : 0

  return (
    <motion.button
      onClick={onClick}
      className="w-full p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.12 }}
    >
      {/* Pack Type Badge */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ backgroundColor: `${colour}20`, color: colour }}
        >
          {label}
        </div>
        {pack.is_template && (
          <div className="px-2 py-1 rounded text-xs font-medium bg-white/10 text-white/60">
            Template
          </div>
        )}
      </div>

      {/* Pack Name */}
      <h3 className="text-white font-semibold mb-1">{pack.name}</h3>

      {/* Description */}
      {pack.description && (
        <p className="text-white/60 text-sm mb-3 line-clamp-2">{pack.description}</p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-white/40">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span>{nodeCount} nodes</span>
        </div>
        {pack.metadata && typeof pack.metadata === 'object' && 'estimated_duration_days' in pack.metadata && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{pack.metadata.estimated_duration_days} days</span>
          </div>
        )}
      </div>
    </motion.button>
  )
}
