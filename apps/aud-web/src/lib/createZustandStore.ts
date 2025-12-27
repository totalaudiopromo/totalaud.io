'use client'

import { create, type StoreApi, type UseBoundStore } from 'zustand'
import { devtools } from 'zustand/middleware'

type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean
) => void
type GetState<T> = () => T
type StoreInitialiser<T> = (set: SetState<T>, get: GetState<T>) => T

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
export function createZustandStore<T>(initializer: StoreInitialiser<T>) {
  let store: UseBoundStore<StoreApi<T>> | null = null
  let storeCreated = false

  function useBoundStore<U>(
    selector?: (state: T) => U,
    equalityFn?: (a: U, b: U) => boolean
  ): U | T {
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
    if (selector && store) {
      // Only pass equalityFn if it's defined
      if (equalityFn) {
        return store(selector, equalityFn)
      }
      return store(selector)
    }
    return store as unknown as T
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
    store!.setState(partial, replace)
  }

  return useBoundStore
}
