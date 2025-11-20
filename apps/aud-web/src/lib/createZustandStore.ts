'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

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
  let storeCreated = false

  function useBoundStore(selector?: any, equalityFn?: any) {
    // Only create store on client-side (browser environment)
    if (typeof window === 'undefined') {
      // SSR: Return a dummy selector function that returns empty state
      if (selector) {
        return selector({} as T)
      }
      return {} as T
    }

    // Client-side: Create store once
    if (!storeCreated) {
      store = create<T>()(devtools(initializer, { name: 'FlowCanvasStore' }))
      storeCreated = true
    }

    // Use the store hook normally
    if (selector) {
      return store(selector, equalityFn)
    }
    return store
  }

  // Also provide getState for imperative access
  useBoundStore.getState = () => {
    if (typeof window === 'undefined') {
      return {} as T
    }
    if (!storeCreated) {
      store = create<T>()(devtools(initializer, { name: 'FlowCanvasStore' }))
      storeCreated = true
    }
    return store.getState()
  }

  // Provide setState for imperative updates
  useBoundStore.setState = (partial: any, replace?: boolean) => {
    if (typeof window === 'undefined') {
      return
    }
    if (!storeCreated) {
      store = create<T>()(devtools(initializer, { name: 'FlowCanvasStore' }))
      storeCreated = true
    }
    return store.setState(partial, replace)
  }

  return useBoundStore as any
}
