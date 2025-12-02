/**
 * XP OS Theme - Windows XP–inspired creative workspace
 * Route: /os/xp
 */

'use client'

import { useEffect, useState } from 'react'
import { XPContainer, XPTaskbar, XPWindow, XPStartMenu } from '@/components/os/xp'
import { useXPWindowStore } from '@/components/os/xp/state/xpWindowStore'
import { XPNotesApp } from '@/components/os/xp/apps/XPNotesApp'
import { XPProcessViewer } from '@/components/os/xp/apps/XPProcessViewer'
import { XPClipboardApp } from '@/components/os/xp/apps/XPClipboardApp'
import { XPSystemInfoApp } from '@/components/os/xp/apps/XPSystemInfoApp'
import { useOS } from '@/components/os/navigation'
import { consumeOSBridges } from '@/components/os/navigation/OSBridges'
import { pushXPClipboardUpdate } from '@/components/os/xp/state/xpClipboardBridge'

export default function XPOSPage() {
  const { registerHooks } = useOS()
  const { windows, focusedWindowId, zOrder, focusWindow, openWindow } = useXPWindowStore()
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)

  useEffect(() => {
    const unregister = registerHooks('xp', {
      onEnter: () => {
        // Placeholder: bounce primary XP window when this OS becomes active
      },
      onExit: () => {},
      onFocus: () => {},
    })

    return unregister
  }, [registerHooks])

  useEffect(() => {
    const payloads = consumeOSBridges('xp')
    if (!payloads.length) return

    const clipboardTexts: string[] = []

    payloads.forEach((payload) => {
      if (payload.kind === 'analogue-to-xp' || payload.kind === 'aqua-to-xp') {
        clipboardTexts.push(payload.clipboardText)
      }
      if (payload.kind === 'ascii-logxp') {
        clipboardTexts.push(payload.text)
      }
      if (payload.kind === 'loopos-to-xp') {
        clipboardTexts.push(payload.clipboardText)
      }
    })

    if (!clipboardTexts.length) return

    openWindow('clipboard')
    pushXPClipboardUpdate(clipboardTexts.join('\n'), 'append')
  }, [openWindow])

  const orderedWindows = [...windows].sort((a, b) => {
    const ziA = zOrder.indexOf(a.id)
    const ziB = zOrder.indexOf(b.id)
    return ziA - ziB
  })

  return (
    <XPContainer
      onDesktopClick={() => {
        focusWindow('')
        setIsStartMenuOpen(false)
      }}
    >
      {orderedWindows.map((window) => {
        const isFocused = focusedWindowId === window.id
        const zIndex = (zOrder.indexOf(window.id) + 1) * 10

        let content: JSX.Element | null = null
        if (window.type === 'notes') {
          content = <XPNotesApp />
        } else if (window.type === 'processes') {
          content = <XPProcessViewer />
        } else if (window.type === 'clipboard') {
          content = <XPClipboardApp />
        } else if (window.type === 'systemInfo') {
          content = <XPSystemInfoApp />
        }

        if (!content) return null

        return (
          <XPWindow
            key={window.id}
            id={window.id}
            title={window.title}
            initialPosition={window.position}
            isFocused={isFocused}
            minimized={window.minimized}
            zIndex={zIndex}
          >
            {content}
          </XPWindow>
        )
      })}

      <XPStartMenu isOpen={isStartMenuOpen} onClose={() => setIsStartMenuOpen(false)} />

      <XPTaskbar onToggleStartMenu={() => setIsStartMenuOpen((value) => !value)} />
    </XPContainer>
  )
}
