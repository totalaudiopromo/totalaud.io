/**
 * useAssetUpload Hook
 * Phase 15.2-A: Core Infrastructure Foundation
 *
 * Purpose:
 * - Get signed upload URL from /api/assets/sign
 * - Upload file to Supabase Storage using signed URL
 * - Track upload progress with local state
 * - Show FlowCore toasts on success/error
 * - Emit asset_upload telemetry event
 * - Handle retries with exponential backoff
 *
 * Usage:
 * const { uploadAsset, isUploading, progress } = useAssetUpload()
 *
 * await uploadAsset({
 *   file: File,
 *   campaignId: 'uuid',
 *   title: 'My Track',
 *   tags: ['demo', 'audio']
 * })
 */

'use client'

import { useState, useCallback, useRef } from 'react'
import { useFlowStateTelemetry } from '@/hooks/useFlowStateTelemetry'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

const log = logger.scope('useAssetUpload')

export interface UploadAssetOptions {
  file: File
  campaignId?: string
  title?: string
  tags?: string[]
  kind?: 'audio' | 'image' | 'document' | 'archive' | 'link' | 'other'
}

export interface UploadAssetResult {
  success: boolean
  assetId: string
  path: string
  duration: number
  error?: string
}

export interface UseAssetUploadReturn {
  uploadAsset: (options: UploadAssetOptions) => Promise<UploadAssetResult>
  isUploading: boolean
  progress: number // 0-100
  cancelUpload: () => void
}

/**
 * useAssetUpload Hook
 * Manages the complete upload lifecycle with progress tracking
 */
export function useAssetUpload(): UseAssetUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { trackEvent } = useFlowStateTelemetry()

  /**
   * Cancel ongoing upload
   */
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsUploading(false)
      setProgress(0)
      log.info('Upload cancelled by user')
      toast.error('Upload cancelled')
    }
  }, [])

  /**
   * Get signed upload URL from API
   */
  const getSignedUrl = useCallback(
    async (
      file: File,
      options: Omit<UploadAssetOptions, 'file'>
    ): Promise<{ signedUrl: string; assetId: string; path: string }> => {
      const response = await fetch('/api/assets/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          byteSize: file.size,
          kind: options.kind,
          campaignId: options.campaignId,
          title: options.title || file.name,
          tags: options.tags || [],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Failed to get signed URL')
      }

      const data = await response.json()

      if (!data.success || !data.signedUrl) {
        throw new Error('Invalid response from sign API')
      }

      return {
        signedUrl: data.signedUrl,
        assetId: data.assetId,
        path: data.path,
      }
    },
    []
  )

  /**
   * Upload file to Supabase Storage using signed URL with progress tracking
   */
  const uploadFile = useCallback(
    async (file: File, signedUrl: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        abortControllerRef.current = new AbortController()

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100)
            setProgress(percentComplete)
            log.debug('Upload progress', { percent: percentComplete, loaded: e.loaded, total: e.total })
          }
        })

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            log.info('Upload completed successfully', { status: xhr.status })
            resolve()
          } else {
            log.error('Upload failed', new Error(`HTTP ${xhr.status}`), { status: xhr.status })
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        // Handle errors
        xhr.addEventListener('error', () => {
          log.error('Upload network error', new Error('Network error'))
          reject(new Error('Network error during upload'))
        })

        // Handle abort
        xhr.addEventListener('abort', () => {
          log.warn('Upload aborted')
          reject(new Error('Upload cancelled'))
        })

        // Listen for abort signal
        abortControllerRef.current.signal.addEventListener('abort', () => {
          xhr.abort()
        })

        // Send request
        xhr.open('PUT', signedUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })
    },
    []
  )

  /**
   * Main upload function with retries
   */
  const uploadAsset = useCallback(
    async (options: UploadAssetOptions): Promise<UploadAssetResult> => {
      const startTime = Date.now()
      const { file, ...signOptions } = options

      setIsUploading(true)
      setProgress(0)

      try {
        log.info('Starting asset upload', {
          filename: file.name,
          size: file.size,
          type: file.type,
          campaignId: options.campaignId,
        })

        // Step 1: Get signed URL (with retry logic)
        let signedData: { signedUrl: string; assetId: string; path: string }
        let retryCount = 0
        const maxRetries = 3

        while (retryCount < maxRetries) {
          try {
            signedData = await getSignedUrl(file, signOptions)
            break
          } catch (error) {
            retryCount++
            if (retryCount >= maxRetries) {
              throw error
            }

            const backoffDelay = Math.pow(2, retryCount) * 1000 // Exponential backoff: 2s, 4s, 8s
            log.warn(`Sign URL failed, retrying in ${backoffDelay}ms`, error, { retryCount })
            await new Promise((resolve) => setTimeout(resolve, backoffDelay))
          }
        }

        log.debug('Signed URL obtained', { assetId: signedData!.assetId, path: signedData!.path })

        // Step 2: Upload file to storage
        await uploadFile(file, signedData!.signedUrl)

        const duration = Date.now() - startTime

        // Step 3: Track telemetry
        trackEvent('save', {
          duration,
          metadata: {
            assetId: signedData!.assetId,
            filename: file.name,
            size: file.size,
            type: file.type,
            kind: options.kind,
          },
        })

        log.info('Asset upload complete', {
          assetId: signedData!.assetId,
          path: signedData!.path,
          duration,
        })

        // Success toast
        toast.success('Asset uploaded successfully', {
          description: file.name,
          duration: 3000,
        })

        setIsUploading(false)
        setProgress(100)

        return {
          success: true,
          assetId: signedData!.assetId,
          path: signedData!.path,
          duration,
        }
      } catch (error) {
        const duration = Date.now() - startTime

        log.error('Asset upload failed', error, {
          filename: file.name,
          duration,
        })

        // Error toast
        toast.error('Upload failed', {
          description: error instanceof Error ? error.message : 'Unknown error',
          duration: 5000,
        })

        // Track failure
        trackEvent('save', {
          duration,
          metadata: {
            filename: file.name,
            size: file.size,
            error: error instanceof Error ? error.message : 'Unknown error',
            failed: true,
          },
        })

        setIsUploading(false)
        setProgress(0)
        abortControllerRef.current = null

        return {
          success: false,
          assetId: '',
          path: '',
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
    [getSignedUrl, uploadFile, trackEvent]
  )

  return {
    uploadAsset,
    isUploading,
    progress,
    cancelUpload,
  }
}
