'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCursors } from '@/hooks/useCursors'
import { MousePointer2 } from 'lucide-react'

interface CursorLayerProps {
  workspaceId: string
  userId: string
}

export function CursorLayer({ workspaceId, userId }: CursorLayerProps) {
  const { cursors, broadcastCursor, broadcastLeave } = useCursors(
    workspaceId,
    userId
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      broadcastCursor(x, y)
    }

    const handleMouseLeave = () => {
      broadcastLeave()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      broadcastLeave()
    }
  }, [broadcastCursor, broadcastLeave])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50"
    >
      <AnimatePresence>
        {cursors.map((cursor) => (
          <motion.div
            key={cursor.user_id}
            className="absolute"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            style={{
              left: cursor.x,
              top: cursor.y,
              color: cursor.colour,
            }}
          >
            <MousePointer2 className="w-5 h-5" fill="currentColor" />
            <div
              className="absolute left-6 top-0 px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
              style={{
                backgroundColor: cursor.colour,
                color: '#0F1113',
              }}
            >
              {cursor.display_name}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
