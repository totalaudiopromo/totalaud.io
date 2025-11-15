'use client'

import { useState } from 'react'
import { ConsoleSurface } from '@/surfaces/ConsoleSurface'
import { AudioIntelSurface } from '@/surfaces/AudioIntelSurface'

export default function SurfacesPage() {
  const [activeSurface, setActiveSurface] = useState<'console' | 'audio-intel'>('console')

  return (
    <div className="min-h-screen bg-matte-black">
      {/* Navigation */}
      <div className="border-b border-[var(--border)] bg-matte-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold mb-4">Cross-App Surfaces</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSurface('console')}
              className={`px-4 py-2 rounded transition-fast ${
                activeSurface === 'console'
                  ? 'bg-slate-cyan text-white'
                  : 'bg-[var(--border)] text-slate-400 hover:bg-slate-cyan/10'
              }`}
            >
              Console Integration
            </button>
            <button
              onClick={() => setActiveSurface('audio-intel')}
              className={`px-4 py-2 rounded transition-fast ${
                activeSurface === 'audio-intel'
                  ? 'bg-slate-cyan text-white'
                  : 'bg-[var(--border)] text-slate-400 hover:bg-slate-cyan/10'
              }`}
            >
              Audio Intel Integration
            </button>
          </div>
        </div>
      </div>

      {/* Surface Content */}
      {activeSurface === 'console' && <ConsoleSurface />}
      {activeSurface === 'audio-intel' && <AudioIntelSurface />}
    </div>
  )
}
