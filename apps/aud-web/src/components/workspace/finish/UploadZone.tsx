/**
 * UploadZone
 *
 * Drag-and-drop + click-to-upload zone for audio files.
 * Validates file type and size before accepting.
 */

'use client'

import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useFinishStore } from '@/stores/useFinishStore'

const ALLOWED_EXTENSIONS = ['wav', 'aiff', 'aif', 'flac', 'mp3']
const MAX_SIZE_MB = 50

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadZone() {
  const setFile = useFinishStore((s) => s.setFile)
  const analyze = useFinishStore((s) => s.analyze)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndSet = useCallback(
    (file: File) => {
      setError(null)

      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        setError(`Unsupported format. Use: ${ALLOWED_EXTENSIONS.join(', ')}`)
        return
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File too large (${formatFileSize(file.size)}). Max: ${MAX_SIZE_MB} MB`)
        return
      }

      if (file.size === 0) {
        setError('File is empty')
        return
      }

      setFile(file)
      // Auto-start analysis
      setTimeout(() => {
        useFinishStore.getState().analyze()
      }, 100)
    },
    [setFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) validateAndSet(file)
    },
    [validateAndSet]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) validateAndSet(file)
    },
    [validateAndSet]
  )

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-ta border-2 border-dashed
            transition-all duration-200 p-8 sm:p-12 text-center
            ${
              dragOver
                ? 'border-ta-cyan bg-ta-cyan/[0.08]'
                : 'border-ta-white/[0.12] hover:border-ta-white/[0.25] bg-ta-panel/50'
            }
          `}
        >
          {/* Upload icon */}
          <div className="flex justify-center mb-4">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              className={`transition-colors ${dragOver ? 'text-ta-cyan' : 'text-ta-white/30'}`}
            >
              <path d="M24 6L14 16h7v12h6V16h7L24 6z" fill="currentColor" />
              <path
                d="M8 34v6a2 2 0 002 2h28a2 2 0 002-2v-6H8z"
                fill="currentColor"
                opacity="0.3"
              />
            </svg>
          </div>

          <p className="text-ta-white/80 text-sm font-medium mb-1">
            {dragOver ? 'Drop your track here' : 'Drop a track or click to upload'}
          </p>
          <p className="text-ta-white/40 text-xs">
            WAV, AIFF, FLAC, or MP3 — up to {MAX_SIZE_MB} MB
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".wav,.aiff,.aif,.flac,.mp3"
            onChange={handleChange}
            className="hidden"
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 px-3 py-2 rounded-ta-sm bg-ta-error/10 border border-ta-error/20 text-center"
          >
            <p className="text-xs text-ta-error">{error}</p>
          </motion.div>
        )}

        <p className="mt-6 text-ta-white/30 text-xs text-center leading-relaxed max-w-xs mx-auto">
          Your track will be analysed for loudness, dynamics, stereo width, and spectral balance
          with genre-aware suggestions.
        </p>
      </motion.div>
    </div>
  )
}
