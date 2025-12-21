/**
 * Mode Loading Skeleton
 *
 * Shows while workspace mode components are lazy loading
 */

'use client'

import { motion } from 'framer-motion'

export function ModeLoadingSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Toolbar skeleton */}
      <div className="h-10 bg-white/[0.03] rounded-lg animate-pulse" />

      {/* Content skeleton */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="h-32 bg-white/[0.02] rounded-lg animate-pulse" />
        <div className="h-24 bg-white/[0.02] rounded-lg animate-pulse" />
        <div className="h-24 bg-white/[0.02] rounded-lg animate-pulse" />
      </div>
    </div>
  )
}

export function ToolbarSkeleton() {
  return (
    <div className="h-12 px-3 py-2 border-b border-white/[0.06] flex items-center gap-2">
      <div className="h-6 w-16 bg-white/[0.04] rounded animate-pulse" />
      <div className="h-6 w-16 bg-white/[0.04] rounded animate-pulse" />
      <div className="h-6 w-16 bg-white/[0.04] rounded animate-pulse" />
    </div>
  )
}
