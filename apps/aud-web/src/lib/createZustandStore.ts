'use client'

import { create, type StoreApi, type UseBoundStore, type StateCreator } from 'zustand'
import { devtools, type DevtoolsOptions } from 'zustand/middleware'

type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean
) => void
type GetState<T> = () => T
type StoreInitialiser<T> = (set: SetState<T>, get: GetState<T>) => T

const DEVTOOLS_OPTIONS: DevtoolsOptions = { name: 'FlowCanvasStore' }

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
      // Cast initializer to satisfy devtools middleware typing
      const stateCreator = initializer as unknown as StateCreator<
        T,
        [['zustand/devtools', never]],
        []
      >
      store = create<T>()(devtools(stateCreator, DEVTOOLS_OPTIONS))
      storeCreated = true
    }

    // Use the store hook normally
    if (selector && store) {
      // Cast store to accept equalityFn - Zustand's types changed but runtime still supports it
      type StoreHook = (selector: (state: T) => U, equalityFn?: (a: U, b: U) => boolean) => U
      const storeHook = store as unknown as StoreHook
      if (equalityFn) {
        return storeHook(selector, equalityFn)
      }
      return storeHook(selector)
    }
    return store as unknown as T
  }

  // Also provide getState for imperative access
  useBoundStore.getState = (): T => {
    if (typeof window === 'undefined') {
      return {} as T
    }
    if (!storeCreated) {
      const stateCreator = initializer as unknown as StateCreator<
        T,
        [['zustand/devtools', never]],
        []
      >
      store = create<T>()(devtools(stateCreator, DEVTOOLS_OPTIONS))
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
      const stateCreator = initializer as unknown as StateCreator<
        T,
        [['zustand/devtools', never]],
        []
      >
      store = create<T>()(devtools(stateCreator, DEVTOOLS_OPTIONS))
      storeCreated = true
    }
    // Use type assertion for the setState call - Zustand's types are strict about replace parameter
    ;(
      store!.setState as (
        partial: T | Partial<T> | ((state: T) => T | Partial<T>),
        replace?: boolean
      ) => void
    )(partial, replace)
  }

  return useBoundStore
}
