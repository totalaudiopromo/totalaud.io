/**
 * LoopOS Desktop Shell
 * Wraps the LoopOS web app with desktop-specific features
 */

import { useEffect, useState } from 'react'
import { useConnectivity } from './hooks/useConnectivity'
import { useDesktopShortcuts } from './hooks/useDesktopShortcuts'
import { DesktopStatusBar } from './components/DesktopStatusBar'
import { OfflineBanner } from './components/OfflineBanner'

export function DesktopShell() {
  const [looposUrl, setLooposUrl] = useState<string>('http://localhost:3001')
  const [loading, setLoading] = useState(true)

  const connectivity = useConnectivity()

  // Set up global shortcuts
  useDesktopShortcuts({
    onCommandPalette: () => {
      // Emit event to LoopOS iframe
      const iframe = document.getElementById(
        'loopos-iframe'
      ) as HTMLIFrameElement
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: 'shortcut', action: 'command-palette' },
          '*'
        )
      }
    },
    onNewNode: () => {
      const iframe = document.getElementById(
        'loopos-iframe'
      ) as HTMLIFrameElement
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: 'shortcut', action: 'new-node' },
          '*'
        )
      }
    },
    onJournal: () => {
      const iframe = document.getElementById(
        'loopos-iframe'
      ) as HTMLIFrameElement
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: 'shortcut', action: 'journal' },
          '*'
        )
      }
    },
    onDesigner: () => {
      const iframe = document.getElementById(
        'loopos-iframe'
      ) as HTMLIFrameElement
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: 'shortcut', action: 'designer' },
          '*'
        )
      }
    },
    onExport: () => {
      const iframe = document.getElementById(
        'loopos-iframe'
      ) as HTMLIFrameElement
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: 'shortcut', action: 'export' },
          '*'
        )
      }
    },
  })

  useEffect(() => {
    // Check if LoopOS dev server is running
    fetch(looposUrl)
      .then(() => {
        setLoading(false)
      })
      .catch(() => {
        console.error('LoopOS dev server not running at', looposUrl)
        setLoading(false)
      })
  }, [looposUrl])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-glow mb-2">LoopOS</h1>
          <p className="text-foreground/60">Loading desktop app...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Offline Banner */}
      {!connectivity.online && <OfflineBanner queueSize={connectivity.queueSize} />}

      {/* LoopOS Iframe */}
      <div className="flex-1 relative">
        <iframe
          id="loopos-iframe"
          src={looposUrl}
          className="w-full h-full border-0"
          title="LoopOS"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>

      {/* Status Bar */}
      <DesktopStatusBar
        online={connectivity.online}
        syncing={connectivity.syncing}
        queueSize={connectivity.queueSize}
      />
    </div>
  )
}
