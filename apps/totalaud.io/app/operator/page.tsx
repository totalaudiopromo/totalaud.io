/**
 * OperatorOS Main Entry Point (TotalAud.io)
 * Full experimental OperatorOS environment
 */

'use client'

import dynamic from 'next/dynamic'

// Provide a no-op localStorage shim during server rendering to avoid crashes
// from client-only dependencies that assume browser APIs.
if (typeof window === 'undefined') {
  const storage = new Map<string, string>()
  ;(globalThis as any).localStorage = {
    getItem: (key: string) => (storage.has(key) ? storage.get(key)! : null),
    setItem: (key: string, value: string) => {
      storage.set(key, String(value))
    },
    removeItem: (key: string) => {
      storage.delete(key)
    },
    clear: () => storage.clear(),
    key: (index: number) => Array.from(storage.keys())[index] ?? null,
    get length() {
      return storage.size
    },
  }
}

// OperatorShell pulls in OperatorOS which reads browser-only APIs (e.g., localStorage).
// Disable SSR here to avoid server-side execution errors.
const OperatorShell = dynamic(
  () => import('./components/OperatorShell').then((m) => m.OperatorShell),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-[#3AA9BE]">
        Loading OperatorOS...
      </div>
    ),
  }
)

export default function OperatorPage() {
  return <OperatorShell />
}
