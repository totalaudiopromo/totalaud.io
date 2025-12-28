/**
 * Vitest Test Setup
 *
 * Phase 6: MVP Pivot - Test Infrastructure
 * Phase 10: Updated localStorage mock for Zustand persist middleware
 *
 * This setup only runs in jsdom environment (browser tests).
 * Node environment tests skip this setup.
 */

// Only set up browser mocks if window exists (jsdom environment)
if (typeof window !== 'undefined') {
  // Import jest-dom matchers for DOM testing
  import('@testing-library/jest-dom/vitest')

  // Mock localStorage with full Storage interface
  class LocalStorageMock implements Storage {
    private store: Record<string, string> = {}

    get length(): number {
      return Object.keys(this.store).length
    }

    key(index: number): string | null {
      const keys = Object.keys(this.store)
      return keys[index] || null
    }

    getItem(key: string): string | null {
      return this.store[key] ?? null
    }

    setItem(key: string, value: string): void {
      this.store[key] = String(value)
    }

    removeItem(key: string): void {
      delete this.store[key]
    }

    clear(): void {
      this.store = {}
    }
  }

  const localStorageMock = new LocalStorageMock()

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })

  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })
}
