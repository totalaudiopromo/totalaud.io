'use client'

import React, { useEffect, useState } from 'react'
import { subscribeOSBridgeEvents } from '@/components/os/navigation/OSBridges'
import { useAgentKernel } from '@/components/agents/useAgentKernel'
import { useOptionalMood } from '@/components/mood/useMood'
import { useOptionalPersona } from '@/components/persona/usePersona'
import { useOptionalNarrative } from '@/components/narrative/useNarrative'

type FeedKind = 'agent' | 'bridge' | 'narrative' | 'mood' | 'persona'

interface FeedItem {
  id: string
  kind: FeedKind
  message: string
  timestamp: string
}

export function CoreMiniFeed() {
  const { runs } = useAgentKernel()
  const mood = useOptionalMood()
  const persona = useOptionalPersona()
  const narrative = useOptionalNarrative()

  const [items, setItems] = useState<FeedItem[]>([])

  useEffect(() => {
    const listenerIdPrefix = Date.now().toString(36)

    const unsubscribe = subscribeOSBridgeEvents((target, payload) => {
      const timestamp = new Date().toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      const message = `Bridge [${payload.kind}] → ${target}`

      setItems((previous) => {
        const next: FeedItem[] = [
          {
            id: `${listenerIdPrefix}-${timestamp}-${payload.kind}`,
            kind: 'bridge',
            message,
            timestamp,
          },
          ...previous,
        ]
        return next.slice(0, 32)
      })
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!runs.length) return

    const last = runs[runs.length - 1]
    const timestamp = new Date(last.createdAt).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    setItems((previous) => {
      const next: FeedItem[] = [
        {
          id: `agent-${last.id}`,
          kind: 'agent',
          message: `Agent ${last.role} from ${last.originOS} → ${last.status}`,
          timestamp,
        },
        ...previous,
      ]
      return next.slice(0, 32)
    })
  }, [runs])

  useEffect(() => {
    if (!mood) return
    const timestamp = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    setItems((previous) => {
      const next: FeedItem[] = [
        {
          id: `mood-${timestamp}`,
          kind: 'mood',
          message: `Mood → ${mood.mood} (${Math.round(mood.score * 100)})`,
          timestamp,
        },
        ...previous,
      ]
      return next.slice(0, 32)
    })
  }, [mood?.mood, mood?.score])

  useEffect(() => {
    if (!persona || !persona.persona) return
    const currentPersona = persona.persona
    const timestamp = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    setItems((previous) => {
      const next: FeedItem[] = [
        {
          id: `persona-${persona.activePersonaId}-${timestamp}`,
          kind: 'persona',
          message: `Persona → ${currentPersona.name}`,
          timestamp,
        },
        ...previous,
      ]
      return next.slice(0, 32)
    })
  }, [persona?.activePersonaId, persona?.persona])

  useEffect(() => {
    if (!narrative?.activeBeat) return
    const timestamp = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    setItems((previous) => {
      const next: FeedItem[] = [
        {
          id: `narrative-${narrative.activeBeat.id}-${timestamp}`,
          kind: 'narrative',
          message: `Narrative beat → ${narrative.activeBeat.id}`,
          timestamp,
        },
        ...previous,
      ]
      return next.slice(0, 32)
    })
  }, [narrative?.activeBeat])

  return (
    <div className="h-64 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/85 p-3 text-[10px] text-slate-200">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Mini feed
        </span>
        <span className="text-[9px] text-slate-500">
          {items.length.toString().padStart(2, '0')} events
        </span>
      </div>
      <div className="h-full space-y-1 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex gap-2">
            <span className="shrink-0 text-slate-500">[{item.timestamp}]</span>
            <span
              className={
                item.kind === 'agent'
                  ? 'text-sky-200'
                  : item.kind === 'bridge'
                    ? 'text-emerald-200'
                    : item.kind === 'mood'
                      ? 'text-indigo-200'
                      : item.kind === 'persona'
                        ? 'text-pink-200'
                        : 'text-slate-200'
              }
            >
              {item.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
