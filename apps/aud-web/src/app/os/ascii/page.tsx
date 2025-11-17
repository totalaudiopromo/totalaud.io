/**
 * ASCII OS Theme - Terminal-Inspired Creative Workspace
 * Route: /os/ascii
 * 
 * A full-screen terminal-style operating system surface with:
 * - Scanline and glow effects
 * - Blinking cursor
 * - Monospace ASCII borders
 * - Command bar interface
 * - Terminal green aesthetic
 */

'use client'

import { useEffect } from 'react'
import { AsciiOSContainer } from '@/components/os/ascii/AsciiOSContainer'
import { useOS } from '@/components/os/navigation'
import { useProjectEngine } from '@/components/projects/useProjectEngine'

export default function AsciiOSPage() {
  const { registerHooks, setOS } = useOS()
  const { currentProject } = useProjectEngine()

  useEffect(() => {
    const unregister = registerHooks('ascii', {
      onEnter: () => {
        // Placeholder: blink the ASCII cursor when this OS is fully active
      },
      onExit: () => {},
      onFocus: () => {},
    })

    return unregister
  }, [registerHooks])

  return <AsciiOSContainer onSetOS={setOS} />
}

