'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { isInstalledPWA } from '@/lib/offline'

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Don't show if already installed
    if (isInstalledPWA()) return

    // Check if user dismissed before
    const dismissed = localStorage.getItem('loopos:pwa-prompt-dismissed')
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('loopos:pwa-prompt-dismissed', 'true')
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="backdrop-blur-glass bg-background/95 border border-accent/20 rounded-lg shadow-xl p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-centre gap-2">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-centre justify-centre">
              <Download className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Install LoopOS</h3>
              <p className="text-xs text-foreground/60">Works offline</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-foreground/40 hover:text-foreground transition-colours"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-foreground/80 mb-4">
          Install LoopOS on your device for a native app experience with offline support.
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 px-3 py-2 border border-border rounded hover:bg-accent/5 transition-colours text-sm"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 px-3 py-2 bg-accent text-background rounded hover:bg-accent/90 transition-colours text-sm font-medium"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}
