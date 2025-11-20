'use client'

export type XPClipboardUpdateMode = 'replace' | 'append'

type XPClipboardListener = (text: string, mode: XPClipboardUpdateMode) => void

const listeners = new Set<XPClipboardListener>()

export function subscribeXPClipboard(listener: XPClipboardListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function pushXPClipboardUpdate(text: string, mode: XPClipboardUpdateMode) {
  listeners.forEach((listener) => {
    listener(text, mode)
  })
}



