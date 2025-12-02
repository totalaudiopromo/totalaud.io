'use client'

import clsx from 'clsx'

export type DashboardMode = 'campaign' | 'contact' | 'scene' | 'creative' | 'performance' | 'team'

interface ModeSwitchProps {
  currentMode: DashboardMode
  onModeChange: (mode: DashboardMode) => void
}

const MODES: { id: DashboardMode; label: string }[] = [
  { id: 'campaign', label: 'campaign' },
  { id: 'contact', label: 'contact' },
  { id: 'scene', label: 'scene' },
  { id: 'creative', label: 'creative' },
  { id: 'performance', label: 'performance' },
  { id: 'team', label: 'team' },
]

export function ModeSwitch({ currentMode, onModeChange }: ModeSwitchProps) {
  return (
    <div className="flex gap-2 bg-tap-black/50 p-2 rounded-tap">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium lowercase transition-all duration-180',
            {
              'bg-tap-cyan text-tap-black': currentMode === mode.id,
              'text-tap-grey hover:text-tap-white hover:bg-tap-panel': currentMode !== mode.id,
            }
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}
