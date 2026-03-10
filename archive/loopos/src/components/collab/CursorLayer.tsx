'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCursors } from '@/hooks/useCursors'
import { useRef, useEffect } from 'react'
import type { CursorContext } from '@/lib/realtime/cursors'

interface CursorLayerProps {
  workspaceId: string
  context: CursorContext
  displayName?: string
  colour?: string
  className?: string
}

/**
 * Layer component for rendering other users' live cursors
 * Overlays on Timeline Canvas or Designer Mode
 */
export function CursorLayer({
  workspaceId,
  context,
  displayName,
  colour,
  className = '',
}: CursorLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { cursors } = useCursors({
    workspaceId,
    context,
    containerRef,
    displayName,
    colour,
  })

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none z-50 ${className}`}
      style={{ overflow: 'hidden' }}
    >
      <AnimatePresence>
        {Array.from(cursors.values()).map((cursor) => (
          <RemoteCursor
            key={cursor.userId}
            x={cursor.x}
            y={cursor.y}
            colour={cursor.colour}
            displayName={cursor.displayName}
            label={cursor.label}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface RemoteCursorProps {
  x: number
  y: number
  colour: string
  displayName: string
  label?: string
}

function RemoteCursor({ x, y, colour, displayName, label }: RemoteCursorProps) {
  return (
    <motion.div
      className="absolute will-change-transform"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x,
        y,
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
        mass: 0.5,
      }}
      style={{
        left: 0,
        top: 0,
      }}
    >
      {/* Cursor pointer */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <path
          d="M5.65376 12.3673L13.1844 4.83665C13.6263 4.39477 14.3696 4.64947 14.4637 5.25256L15.9053 14.3675L19.1396 17.6018C19.4234 17.8856 19.4234 18.3449 19.1396 18.6287L18.1908 19.5775C17.907 19.8613 17.4477 19.8613 17.1639 19.5775L13.9296 16.3432L4.81466 17.7848C4.21157 17.8789 3.95687 17.1356 4.39875 16.6937L11.9294 9.16307L5.65376 12.3673Z"
          fill={colour}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>

      {/* Name label */}
      <motion.div
        className="absolute top-5 left-6 flex items-centre gap-1.5 px-2 py-1 rounded-md shadow-lg whitespace-nowrap pointer-events-none"
        style={{
          backgroundColor: colour,
          color: '#FFFFFF',
        }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-xs font-medium">{displayName}</span>
        {label && (
          <>
            <span className="text-xs opacity-60">·</span>
            <span className="text-xs opacity-80">{label}</span>
          </>
        )}
      </motion.div>

      {/* Trail effect */}
      <motion.div
        className="absolute top-0 left-0 w-3 h-3 rounded-full"
        style={{
          backgroundColor: colour,
          opacity: 0.3,
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  )
}
