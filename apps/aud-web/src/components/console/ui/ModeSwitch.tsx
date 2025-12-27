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
    <div className="flex gap-2 bg-ta-black/50 p-2 rounded-ta">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium lowercase transition-all duration-180',
            {
              'bg-ta-cyan text-ta-black': currentMode === mode.id,
              'text-ta-grey hover:text-ta-white hover:bg-ta-panel': currentMode !== mode.id,
            }
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}
