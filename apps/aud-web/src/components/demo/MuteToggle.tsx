/**
 * Mute Toggle - Phase 29 Pass 5
 * Toggle button for ambient audio mute state
 */

import { Volume2, VolumeX } from 'lucide-react'
import { spacing, radii, colours } from '@/styles/tokens'
import { transitions } from '@/styles/motion'

export interface MuteToggleProps {
  isMuted: boolean
  onToggle: () => void
}

export function MuteToggle({ isMuted, onToggle }: MuteToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
      title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
      style={{
        padding: spacing[2],
        borderRadius: radii.sm,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        transition: transitions.colors,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className="hover:bg-accent/10"
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4" style={{ color: colours.foregroundSubtle }} />
      ) : (
        <Volume2 className="w-4 h-4" style={{ color: colours.accent }} />
      )}
    </button>
  )
}
