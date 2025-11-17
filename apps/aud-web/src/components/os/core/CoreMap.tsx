'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { subscribeOSBridgeEvents } from '@/components/os/navigation/OSBridges'
import type { OSSlug } from '@/components/os/navigation'

interface BridgeEvent {
  id: string
  from: OSSlug | 'loopos'
  to: OSSlug | 'loopos'
  kind: string
  createdAt: number
}

const NODES: Array<{ id: OSSlug | 'loopos'; label: string; x: number; y: number }> = [
  { id: 'ascii', label: 'ASCII', x: 10, y: 10 },
  { id: 'xp', label: 'XP', x: 75, y: 12 },
  { id: 'aqua', label: 'Aqua', x: 15, y: 70 },
  { id: 'daw', label: 'DAW', x: 45, y: 85 },
  { id: 'analogue', label: 'Analogue', x: 80, y: 72 },
  { id: 'loopos', label: 'LoopOS', x: 50, y: 32 },
]

const EDGES: Array<{ from: OSSlug | 'loopos'; to: OSSlug | 'loopos' }> = [
  { from: 'analogue', to: 'aqua' },
  { from: 'analogue', to: 'daw' },
  { from: 'analogue', to: 'xp' },
  { from: 'aqua', to: 'xp' },
  { from: 'aqua', to: 'daw' },
  { from: 'daw', to: 'loopos' },
  { from: 'loopos', to: 'aqua' },
  { from: 'loopos', to: 'analogue' },
  { from: 'loopos', to: 'xp' },
]

function resolveFromTarget(target: OSSlug | 'loopos', kind: string): OSSlug | 'loopos' {
  if (kind.startsWith('analogue-')) return 'analogue'
  if (kind.startsWith('aqua-')) return 'aqua'
  if (kind.startsWith('ascii-')) return 'ascii'
  if (kind.startsWith('daw-')) return 'daw'
  if (kind.startsWith('loopos-')) return 'loopos'
  return target
}

export function CoreMap() {
  const [bridgeEvents, setBridgeEvents] = useState<BridgeEvent[]>([])
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const unsubscribe = subscribeOSBridgeEvents((target, payload) => {
      const now = Date.now()
      const from = resolveFromTarget(target, payload.kind)
      const to = target
      const id = `${now}-${payload.kind}`

      setBridgeEvents((previous) => {
        const next = [{ id, from, to, kind: payload.kind, createdAt: now }, ...previous]
        return next.slice(0, 24)
      })
    })

    return unsubscribe
  }, [])

  const activeEdges = useMemo(() => {
    const cutoff = Date.now() - 5000
    return bridgeEvents.filter((event) => event.createdAt >= cutoff)
  }, [bridgeEvents])

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4">
      <div className="mb-2 flex items-center justify-between text-[11px] text-slate-300">
        <span className="font-semibold uppercase tracking-[0.18em] text-slate-400">
          Constellation map
        </span>
        <span className="text-[10px] text-slate-500">
          Bridges in last 5s: {activeEdges.length.toString().padStart(2, '0')}
        </span>
      </div>

      <div className="relative h-full w-full">
        {/* Connection lines */}
        <svg className="absolute inset-0 h-full w-full">
          {EDGES.map((edge) => {
            const fromNode = NODES.find((node) => node.id === edge.from)
            const toNode = NODES.find((node) => node.id === edge.to)
            if (!fromNode || !toNode) return null

            const isActive = activeEdges.some(
              (event) =>
                (event.from === edge.from && event.to === edge.to) ||
                (event.from === edge.to && event.to === edge.from),
            )

            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}%`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}%`}
                stroke={isActive ? '#22c55e' : '#1f2937'}
                strokeWidth={isActive ? 2 : 1}
                strokeOpacity={isActive ? 0.9 : 0.5}
              />
            )
          })}
        </svg>

        {/* Nodes */}
        {NODES.map((node) => {
          const isLoopOS = node.id === 'loopos'
          return (
            <motion.div
              key={node.id}
              className={`absolute -ml-6 -mt-6 flex h-12 w-12 items-center justify-center rounded-full border text-[11px] ${
                isLoopOS
                  ? 'border-cyan-400/80 bg-cyan-500/20 text-cyan-50'
                  : 'border-slate-600/80 bg-slate-900/80 text-slate-100'
              }`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
              }}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : {
                      scale: 1.08,
                    }
              }
            >
              {node.label}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}


