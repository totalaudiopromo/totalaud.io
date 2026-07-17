/**
 * FinishToolbar
 *
 * Slim toolbar for the Finish mode: file info, analysing indicator, and
 * a Clear action.
 *
 * The mastering controls (genre/platform/macros + Process) are parked
 * while the engine is rebuilt -- the store keeps the processing state and
 * actions, but they are intentionally not offered here.
 */

'use client'

import { useFinishStore } from '@/stores/useFinishStore'

export function FinishToolbar() {
  const stage = useFinishStore((s) => s.stage)
  const fileName = useFinishStore((s) => s.fileName)
  const fileSize = useFinishStore((s) => s.fileSize)
  const reset = useFinishStore((s) => s.reset)

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-ta-white/[0.06] min-h-[44px] flex-wrap">
      {/* Left: file info */}
      <div className="flex items-center gap-3 min-w-0">
        {fileName && (
          <div className="flex items-center gap-2 min-w-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="text-ta-cyan flex-shrink-0"
            >
              <path d="M7 1L2 4v6l5 3 5-3V4L7 1z" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <span className="text-xs text-ta-white/60 truncate max-w-[200px]">{fileName}</span>
            {fileSize && (
              <span className="text-[10px] text-ta-white/30 flex-shrink-0">
                {(fileSize / (1024 * 1024)).toFixed(1)} MB
              </span>
            )}
          </div>
        )}

        {stage === 'analysing' && (
          <span className="text-xs text-ta-cyan animate-pulse">Analysing on your device...</span>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {fileName && stage !== 'processing' && (
          <button
            onClick={reset}
            className="px-2 py-1.5 rounded-ta-sm text-xs text-ta-white/40 hover:text-ta-white/60 transition-colors"
            title="Clear and start over"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
