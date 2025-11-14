/**
 * useAssets Hook
 * Phase 15.2-B: Multi-File UX + Agent Integration Layer
 *
 * Purpose:
 * - CRUD wrapper around /api/assets/list + /api/assets/delete
 * - Optimistic updates with rollback on error
 * - Real-time asset list management
 * - Polling for updates (optional)
 *
 * Usage:
 * const { assets, loading, error, refresh, remove, togglePublic } = useAssets({
 *   campaignId: 'uuid',
 *   kind: 'audio',
 *   autoRefresh: true
 * })
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

const log = logger.scope('useAssets')

export interface Asset {
  id: string
  user_id: string
  campaign_id: string | null
  kind: 'audio' | 'image' | 'document' | 'archive' | 'link' | 'other'
  title: string
  description: string | null
  tags: string[]
  path: string | null
  url: string | null
  mime_type: string
  byte_size: number
  is_public: boolean
  public_share_id: string
  checksum: string | null
  created_at: string
  updated_at: string
}

export interface UseAssetsOptions {
  campaignId?: string
  kind?: 'audio' | 'image' | 'document' | 'archive' | 'link' | 'other'
  q?: string
  tag?: string
  autoRefresh?: boolean
  refreshInterval?: number // ms, default: 30000 (30s)
}

export interface UseAssetsReturn {
  assets: Asset[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  remove: (assetId: string) => Promise<boolean>
  togglePublic: (assetId: string, isPublic: boolean) => Promise<boolean>
  count: number
}

/**
 * useAssets Hook
 * Manages asset list with CRUD operations and optimistic updates
 */
export function useAssets(options: UseAssetsOptions = {}): UseAssetsReturn {
  const { campaignId, kind, q, tag, autoRefresh = false, refreshInterval = 30000 } = options

  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  /**
   * Fetch assets from API
   */
  const fetchAssets = useCallback(async () => {
    try {
      const params = new URLSearchParams({ size: '100' })
      if (campaignId) params.append('campaignId', campaignId)
      if (kind) params.append('kind', kind)
      if (q) params.append('q', q)
      if (tag) params.append('tag', tag)

      const response = await fetch(`/api/assets/list?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!isMountedRef.current) return

      setAssets(data.assets || [])
      setCount(
        typeof data.total === 'number'
          ? data.total
          : typeof data.count === 'number'
          ? data.count
          : data.assets?.length || 0
      )
      setError(null)

      log.debug('Assets loaded', { count: data.assets.length, campaignId, kind })
    } catch (err) {
      log.error('Failed to load assets', err)

      if (!isMountedRef.current) return

      setError(err instanceof Error ? err.message : 'Failed to load assets')
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [campaignId, kind, q, tag])

  /**
   * Refresh assets
   */
  const refresh = useCallback(async () => {
    setLoading(true)
    await fetchAssets()
  }, [fetchAssets])

  /**
   * Remove asset with optimistic update
   */
  const remove = useCallback(
    async (assetId: string): Promise<boolean> => {
      // Optimistic update: remove from UI immediately
      const originalAssets = [...assets]
      setAssets((prev) => prev.filter((asset) => asset.id !== assetId))

      try {
        log.info('Deleting asset', { assetId })

        const response = await fetch('/api/assets/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId }),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        toast.success('Asset deleted')
        log.debug('Asset deleted successfully', { assetId })

        // Update count
        setCount((prev) => Math.max(0, prev - 1))

        return true
      } catch (err) {
        log.error('Failed to delete asset', err)

        // Rollback optimistic update
        setAssets(originalAssets)

        toast.error('Failed to delete asset', {
          description: err instanceof Error ? err.message : 'Unknown error',
        })

        return false
      }
    },
    [assets]
  )

  /**
   * Toggle public/private status
   * NOTE: This requires a new API endpoint /api/assets/update (to be implemented)
   * For now, this is a placeholder that shows the optimistic update pattern
   */
  const togglePublic = useCallback(
    async (assetId: string, isPublic: boolean): Promise<boolean> => {
      // Optimistic update
      const originalAssets = [...assets]
      setAssets((prev) =>
        prev.map((asset) => (asset.id === assetId ? { ...asset, is_public: isPublic } : asset))
      )

      try {
        log.info('Toggling asset visibility', { assetId, isPublic })

        // TODO: Implement /api/assets/update endpoint
        // For now, we'll just log a warning
        log.warn('togglePublic not yet implemented - requires /api/assets/update endpoint')

        toast.success(isPublic ? 'Asset made public' : 'Asset made private')

        return true
      } catch (err) {
        log.error('Failed to toggle asset visibility', err)

        // Rollback optimistic update
        setAssets(originalAssets)

        toast.error('Failed to update asset')

        return false
      }
    },
    [assets]
  )

  /**
   * Initial load and auto-refresh setup
   */
  useEffect(() => {
    isMountedRef.current = true

    // Initial load
    fetchAssets()

    // Setup auto-refresh if enabled
    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => {
        fetchAssets()
      }, refreshInterval)

      log.debug('Auto-refresh enabled', { interval: refreshInterval })
    }

    return () => {
      isMountedRef.current = false

      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [fetchAssets, autoRefresh, refreshInterval])

  return {
    assets,
    loading,
    error,
    refresh,
    remove,
    togglePublic,
    count,
  }
}
