'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useMemo } from 'react'

/**
 * Stable Store Factory for Zustand
 *
 * Prevents store creation during Next.js SSR/prerender.
 * Ensures React Flow only receives a browser-created instance.
 * Eliminates "useStore is not a function" errors.
 *
 * IMPORTANT:
 * - Do NOT create the store during import.
 * - Do NOT create the store during prerender.
 * - Only create once, on the client.
 */
export function createZustandStore<T>(initializer: (set: any, get: any) => T) {
  let store: any = null

  function useBoundStore() {
    // Only create store on client-side (browser environment)
    if (typeof window === 'undefined') {
      // SSR: Return a placeholder that won't break
      return {
        getState: () => ({}) as T,
        setState: () => {},
        subscribe: () => () => {},
      }
    }

    // Client-side: Create store once
    if (!store) {
      store = create<T>()(devtools(initializer, { name: 'FlowCanvasStore' }))
    }

    return store
  }

  // Also provide getState for imperative access
  useBoundStore.getState = () => {
    if (typeof window === 'undefined') {
      return {} as T
    }
    if (!store) {
      store = create<T>()(devtools(initializer, { name: 'FlowCanvasStore' }))
    }
    return store.getState()
  }

  return useBoundStore
}
