'use client'

import { create, useStore, type StateCreator, type StoreApi } from 'zustand'
import { devtools } from 'zustand/middleware'

/**
 * Stable Store Factory for Zustand
 *
 * Prevents store creation during Next.js SSR/prerender.
 * Ensures React Flow only receives a browser-created instance.
 * Eliminates "useStore is not a function" errors.
 */
export function createZustandStore<T>(initializer: StateCreator<T, [['zustand/devtools', never]]>) {
  let store: StoreApi<T> | null = null
  let storeCreated = false

  function useBoundStore<U>(selector?: (state: T) => U): U {
    // Only create store on client-side (browser environment)
    if (typeof window === 'undefined') {
      // SSR: Return a dummy selector function that returns empty state
      if (selector) {
        return selector({} as T)
      }
      return {} as unknown as U
    }

    // Client-side: Create store once
    if (!storeCreated) {
      store = create<T>()(devtools(initializer, { name: 'FlowCanvasStore' }))
      storeCreated = true
    }

    // Use the useStore hook which is the recommended way in v5 for external stores
    return useStore(store!, selector as any)
  }

  // Also provide getState for imperative access
  useBoundStore.getState = (): T => {
    if (typeof window === 'undefined') {
      return {} as T
    }
    if (!storeCreated) {
      store = create<T>()(devtools(initializer, { name: 'FlowCanvasStore' }))
      storeCreated = true
    }
    return store!.getState()
  }

  // Provide setState for imperative updates
  useBoundStore.setState = (
    partial: T | Partial<T> | ((state: T) => T | Partial<T>),
    replace?: boolean
  ): void => {
    if (typeof window === 'undefined') {
      return
    }
    if (!storeCreated) {
      store = create<T>()(devtools(initializer, { name: 'FlowCanvasStore' }))
      storeCreated = true
    }
    store!.setState(partial as any, replace as any)
  }

  return useBoundStore
}
