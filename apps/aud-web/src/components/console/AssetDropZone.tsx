/**
 * AssetDropZone Component
 * Phase 15.2-A: Core Infrastructure Foundation
 *
 * Purpose:
 * - Minimal drag-and-drop UI for asset uploads
 * - FlowCore design (Matte Black, Slate Cyan, Ice Cyan)
 * - Displays upload progress with progress bar
 * - Lists uploaded assets with delete action
 * - Integrates with useAssetUpload hook
 *
 * Design:
 * - Monospace typography
 * - 240ms animations
 * - Reduced motion support
 * - WCAG AA+ accessible
 *
 * Usage:
 * <AssetDropZone campaignId="uuid" />
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAssetUpload } from '@/hooks/useAssetUpload'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

const log = logger.scope('AssetDropZone')

interface Asset {
  id: string
  kind: string
  title: string
  mime_type: string
  byte_size: number
  created_at: string
}

export interface AssetDropZoneProps {
  campaignId?: string
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`
}

/**
 * Format date to relative time
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function AssetDropZone({ campaignId }: AssetDropZoneProps) {
  const prefersReducedMotion = useReducedMotion()
  const { uploadAsset, isUploading, progress, cancelUpload } = useAssetUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoadingAssets, setIsLoadingAssets] = useState(true)

  /**
   * Fetch assets from API
   */
  const fetchAssets = useCallback(async () => {
    setIsLoadingAssets(true)

    try {
      const params = new URLSearchParams({ size: '20' })
      if (campaignId) params.append('campaignId', campaignId)

      const response = await fetch(`/api/assets/list?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setAssets(data.assets || [])

      log.debug('Assets loaded', { count: data.assets.length })
    } catch (error) {
      log.error('Failed to load assets', error)
      toast.error('Failed to load assets')
    } finally {
      setIsLoadingAssets(false)
    }
  }, [campaignId])

  /**
   * Load assets on mount
   */
  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  /**
   * Handle file drop
   */
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)

      if (files.length === 0) {
        log.warn('No files dropped')
        return
      }

      const file = files[0] // Only handle first file for now

      log.info('File dropped', { filename: file.name, size: file.size, type: file.type })

      const result = await uploadAsset({ file, campaignId })

      if (result.success) {
        // Reload assets after successful upload
        await fetchAssets()
      }
    },
    [uploadAsset, campaignId, fetchAssets]
  )

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files

      if (!files || files.length === 0) return

      const file = files[0]

      log.info('File selected', { filename: file.name, size: file.size, type: file.type })

      const result = await uploadAsset({ file, campaignId })

      if (result.success) {
        await fetchAssets()
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [uploadAsset, campaignId, fetchAssets]
  )

  /**
   * Handle drag events
   */
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  /**
   * Open file picker
   */
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  /**
   * Delete asset
   */
  const deleteAsset = useCallback(
    async (assetId: string) => {
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
        await fetchAssets()
      } catch (error) {
        log.error('Failed to delete asset', error)
        toast.error('Failed to delete asset')
      }
    },
    [fetchAssets]
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        fontFamily:
          'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
      }}
    >
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFilePicker}
        style={{
          position: 'relative',
          padding: '48px 24px',
          backgroundColor: isDragging ? 'rgba(58, 169, 190, 0.1)' : flowCoreColours.darkGrey,
          border: `2px dashed ${isDragging ? flowCoreColours.slateCyan : flowCoreColours.borderGrey}`,
          borderRadius: '8px',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.24s ease',
          textAlign: 'center',
        }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          disabled={isUploading}
          style={{ display: 'none' }}
        />

        {/* Upload Icon */}
        <div
          style={{
            fontSize: '48px',
            marginBottom: '16px',
            color: isDragging ? flowCoreColours.slateCyan : flowCoreColours.textTertiary,
          }}
        >
          ↑
        </div>

        {/* Text */}
        {isUploading ? (
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: flowCoreColours.textPrimary,
                marginBottom: '8px',
              }}
            >
              uploading... {progress}%
            </div>
            <div
              style={{
                fontSize: '13px',
                color: flowCoreColours.textSecondary,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  cancelUpload()
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: flowCoreColours.slateCyan,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: flowCoreColours.textPrimary,
                marginBottom: '8px',
              }}
            >
              {isDragging ? 'drop file here' : 'drag & drop file'}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: flowCoreColours.textSecondary,
              }}
            >
              or click to browse
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '16px',
              height: '4px',
              backgroundColor: flowCoreColours.borderGrey,
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: 'easeOut' }}
              style={{
                height: '100%',
                backgroundColor: flowCoreColours.slateCyan,
              }}
            />
          </motion.div>
        )}
      </div>

      {/* Asset List */}
      <div>
        <h3
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: flowCoreColours.textSecondary,
            textTransform: 'lowercase',
            margin: '0 0 12px 0',
          }}
        >
          uploaded assets ({assets.length})
        </h3>

        {isLoadingAssets ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              fontSize: '13px',
              color: flowCoreColours.textTertiary,
            }}
          >
            loading...
          </div>
        ) : assets.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              fontSize: '13px',
              color: flowCoreColours.textTertiary,
            }}
          >
            no assets yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AnimatePresence>
              {assets.map((asset) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.24 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: flowCoreColours.darkGrey,
                    border: `1px solid ${flowCoreColours.borderGrey}`,
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: flowCoreColours.textPrimary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: '4px',
                      }}
                    >
                      {asset.title}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: flowCoreColours.textTertiary,
                      }}
                    >
                      {asset.kind} · {formatBytes(asset.byte_size)} ·{' '}
                      {formatRelativeTime(asset.created_at)}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteAsset(asset.id)}
                    aria-label={`Delete ${asset.title}`}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      border: `1px solid ${flowCoreColours.borderGrey}`,
                      borderRadius: '4px',
                      color: flowCoreColours.textSecondary,
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.24s ease',
                      marginLeft: '12px',
                      textTransform: 'lowercase',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#E57373'
                      e.currentTarget.style.color = '#E57373'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = flowCoreColours.borderGrey
                      e.currentTarget.style.color = flowCoreColours.textSecondary
                    }}
                  >
                    delete
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
