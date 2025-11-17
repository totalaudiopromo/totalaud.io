'use client'

import type { OSSlug } from './OSMetadata'

export type DawLane = 'creative' | 'promo' | 'analysis' | 'refine'

type LoopOSLane = 'creative' | 'action' | 'promo' | 'analysis' | 'refine'

export type OSBridgePayload =
  | {
      kind: 'analogue-to-aqua'
      artistName: string
      story: string
      note: string
    }
  | {
      kind: 'analogue-to-daw'
      lane: DawLane
      name: string
      type: DawLane
      notes: string
    }
  | {
      kind: 'analogue-to-xp'
      clipboardText: string
    }
  | {
      kind: 'analogue-to-ascii'
      message: string
    }
  | {
      kind: 'aqua-to-xp'
      clipboardText: string
    }
  | {
      kind: 'aqua-to-daw'
      name: string
      notes: string
      lane: DawLane
    }
  | {
      kind: 'aqua-to-analogue'
      title: string
      body: string
      tag: 'idea'
    }
  | {
      kind: 'ascii-sendnote-aqua'
      story: string
    }
  | {
      kind: 'ascii-sendnote-daw'
      name: string
      lane: DawLane
    }
  | {
      kind: 'ascii-logxp'
      text: string
    }
  | {
      kind: 'daw-to-aqua'
      story: string
    }
  | {
      kind: 'daw-to-analogue'
      title: string
      body: string
      tag: 'idea' | 'campaign' | 'note'
    }
  | {
      kind: 'daw-to-loopos'
      lane: LoopOSLane
      name: string
      notes: string
    }
  | {
      kind: 'loopos-to-aqua'
      name: string
      notes: string
      lane: LoopOSLane
      summaryText?: string
      momentumLabel?: string
      source?: 'loopos' | 'other'
    }
  | {
      kind: 'loopos-to-analogue'
      title: string
      body: string
      lane: LoopOSLane
      summaryText?: string
      momentumLabel?: string
      tag?: 'idea' | 'campaign' | 'note'
      source?: 'loopos' | 'other'
    }
  | {
      kind: 'loopos-to-xp'
      clipboardText: string
      summaryText?: string
      momentumLabel?: string
      source?: 'loopos' | 'other'
    }

type BridgeTarget = OSSlug | 'loopos'

type BridgeStore = Partial<Record<BridgeTarget, OSBridgePayload[]>>

const bridgeStore: BridgeStore = {}

type BridgeListener = (target: BridgeTarget, payload: OSBridgePayload) => void

const bridgeListeners = new Set<BridgeListener>()

export function queueOSBridge(target: BridgeTarget, payload: OSBridgePayload) {
  bridgeStore[target] = [...(bridgeStore[target] ?? []), payload]
  bridgeListeners.forEach((listener) => {
    listener(target, payload)
  })
}

export function consumeOSBridges(target: BridgeTarget): OSBridgePayload[] {
  const payloads = bridgeStore[target] ?? []
  if (payloads.length > 0) {
    delete bridgeStore[target]
  }
  return payloads
}

export function subscribeOSBridgeEvents(listener: BridgeListener): () => void {
  bridgeListeners.add(listener)
  return () => {
    bridgeListeners.delete(listener)
  }
}



