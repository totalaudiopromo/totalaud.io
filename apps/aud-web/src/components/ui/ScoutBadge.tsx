/**
 * Scout Badge
 *
 * Shows when a Timeline event came from Scout Mode
 */

'use client'

import { motion } from 'framer-motion'

interface ScoutBadgeProps {
  opportunityType?: string
  size?: 'sm' | 'md'
}

const typeColors: Record<string, string> = {
  playlist: '#10B981',
  blog: '#F59E0B',
  radio: '#8B5CF6',
  press: '#3B82F6',
  curator: '#EC4899',
}

const typeLabels: Record<string, string> = {
  playlist: 'Playlist',
  blog: 'Blog',
  radio: 'Radio',
  press: 'Press',
  curator: 'Curator',
}

export function ScoutBadge({ opportunityType, size = 'sm' }: ScoutBadgeProps) {
  const color = opportunityType ? typeColors[opportunityType] || '#3AA9BE' : '#3AA9BE'
  const label = opportunityType ? typeLabels[opportunityType] || 'Scout' : 'Scout'

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center rounded font-medium ${sizeClasses}`}
      style={{
        background: `${color}12`,
        border: `1px solid ${color}25`,
        color: color,
      }}
    >
      {label}
    </motion.span>
  )
}

// Source indicator for any item
interface SourceBadgeProps {
  source: 'scout' | 'manual' | 'imported'
  type?: string
}

export function SourceBadge({ source, type }: SourceBadgeProps) {
  if (source === 'scout') {
    return <ScoutBadge opportunityType={type} />
  }

  const config = {
    manual: { label: 'Manual', color: 'rgba(247, 248, 249, 0.5)' },
    imported: { label: 'Imported', color: 'rgba(247, 248, 249, 0.5)' },
  }

  const { label, color } = config[source] || config.manual

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[10px] rounded font-medium"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        color,
      }}
    >
      {label}
    </span>
  )
}
