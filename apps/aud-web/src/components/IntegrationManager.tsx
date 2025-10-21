/**
 * Integration Manager Component
 *
 * Manages Gmail and Google Sheets connections with:
 * - Connection status badges
 * - Connect/Disconnect buttons
 * - Manual sync trigger
 * - Last sync timestamps
 *
 * Can be rendered inline or as a modal.
 */

'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@aud-web/lib/supabase'
import { playAgentSound } from '@total-audio/core-theme-engine'

interface IntegrationConnection {
  provider: string
  status: string
  connected_at: string
  metadata?: Record<string, any>
}

interface IntegrationManagerProps {
  inline?: boolean
  onSyncComplete?: (result: any) => void
}

export function IntegrationManager({ inline = false, onSyncComplete }: IntegrationManagerProps) {
  const [connections, setConnections] = useState<IntegrationConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient()

  // Fetch integration status
  useEffect(() => {
    fetchIntegrations()
  }, [])

  async function fetchIntegrations() {
    try {
      setLoading(true)
      const response = await fetch('/api/integrations/sync')
      const data = await response.json()

      if (data.connections) {
        setConnections(data.connections)
      }

      if (data.lastSyncs) {
        const syncMap: Record<string, string> = {}
        data.lastSyncs.forEach((sync: any) => {
          if (!syncMap[sync.integration_type]) {
            syncMap[sync.integration_type] = sync.synced_at
          }
        })
        setLastSync(syncMap)
      }
    } catch (err) {
      console.error('[IntegrationManager] Failed to fetch integrations:', err)
      setError('Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect(provider: 'gmail' | 'google_sheets') {
    try {
      setConnecting(provider)
      setError(null)

      const response = await fetch('/api/oauth/google/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start OAuth flow')
      }

      // Redirect to Google OAuth
      window.location.href = data.redirectUrl
    } catch (err) {
      console.error('[IntegrationManager] Connect error:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect')
      setConnecting(null)
    }
  }

  async function handleDisconnect(provider: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('integration_connections')
        .update({ status: 'inactive', auto_sync_enabled: false })
        .eq('user_id', user.id)
        .eq('provider', provider)

      // Refresh connections
      await fetchIntegrations()

      // Play sound cue
      playAgentSound('broker', 'complete')
    } catch (err) {
      console.error('[IntegrationManager] Disconnect error:', err)
      setError('Failed to disconnect')
    }
  }

  async function handleSync() {
    try {
      setSyncing(true)
      setError(null)

      const response = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed')
      }

      // Update last sync times
      const now = new Date().toISOString()
      const newLastSync: Record<string, string> = { ...lastSync }

      if (data.metrics?.gmail) {
        newLastSync.gmail = now
      }
      if (data.metrics?.sheets) {
        newLastSync.google_sheets = now
      }

      setLastSync(newLastSync)

      // Play success sound
      playAgentSound('tracker', 'complete')

      // Notify parent
      if (onSyncComplete) {
        onSyncComplete(data)
      }
    } catch (err) {
      console.error('[IntegrationManager] Sync error:', err)
      setError(err instanceof Error ? err.message : 'Sync failed')
      playAgentSound('tracker', 'error')
    } finally {
      setSyncing(false)
    }
  }

  const isConnected = (provider: string) =>
    connections.some((c) => c.provider === provider && c.status === 'active')

  const gmailConnected = isConnected('gmail')
  const sheetsConnected = isConnected('google_sheets')

  return (
    <div className={inline ? 'space-y-4' : 'p-6 space-y-4'}>
      {/* Header */}
      {!inline && (
        <div>
          <h2 className="text-xl font-mono font-bold text-white">Integrations</h2>
          <p className="text-sm text-slate-400 mt-1">
            Connect Gmail and Google Sheets to track campaign metrics automatically.
          </p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gmail Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📧</span>
              <div>
                <h3 className="font-mono font-bold text-white">Gmail</h3>
                <p className="text-xs text-slate-400">Email tracking</p>
              </div>
            </div>
            <div>
              {gmailConnected ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 border border-green-500 rounded text-xs text-green-400">
                  ✓ Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-slate-400">
                  Not Connected
                </span>
              )}
            </div>
          </div>

          {gmailConnected && lastSync.gmail && (
            <p className="text-xs text-slate-500 mb-3">
              Last sync: {new Date(lastSync.gmail).toLocaleString()}
            </p>
          )}

          <div className="flex gap-2">
            {gmailConnected ? (
              <>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 rounded text-sm font-mono text-white transition-colors"
                >
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
                <button
                  onClick={() => handleDisconnect('gmail')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm font-mono text-slate-300 transition-colors"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => handleConnect('gmail')}
                disabled={connecting === 'gmail'}
                className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 rounded text-sm font-mono text-white transition-colors"
              >
                {connecting === 'gmail' ? 'Connecting...' : 'Connect Gmail'}
              </button>
            )}
          </div>
        </div>

        {/* Google Sheets Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-mono font-bold text-white">Google Sheets</h3>
                <p className="text-xs text-slate-400">Contact sync</p>
              </div>
            </div>
            <div>
              {sheetsConnected ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 border border-green-500 rounded text-xs text-green-400">
                  ✓ Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-slate-400">
                  Not Connected
                </span>
              )}
            </div>
          </div>

          {sheetsConnected && lastSync.google_sheets && (
            <p className="text-xs text-slate-500 mb-3">
              Last sync: {new Date(lastSync.google_sheets).toLocaleString()}
            </p>
          )}

          <div className="flex gap-2">
            {sheetsConnected ? (
              <>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 rounded text-sm font-mono text-white transition-colors"
                >
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
                <button
                  onClick={() => handleDisconnect('google_sheets')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm font-mono text-slate-300 transition-colors"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => handleConnect('google_sheets')}
                disabled={connecting === 'google_sheets'}
                className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 rounded text-sm font-mono text-white transition-colors"
              >
                {connecting === 'google_sheets' ? 'Connecting...' : 'Connect Sheets'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3">
        <p className="text-xs text-slate-400">
          <span className="font-mono text-slate-300">Privacy:</span> We only request read-only
          access. Email bodies are never stored—only metadata like thread counts and labels. You can
          disconnect anytime.
        </p>
      </div>
    </div>
  )
}
