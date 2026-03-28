/**
 * ProcessingStatus
 *
 * Shows progress while the mastering engine processes audio.
 * Displays before/after metrics once complete, with download button.
 */

'use client'

import { motion } from 'framer-motion'
import { useFinishStore } from '@/stores/useFinishStore'

export function ProcessingStatus() {
  const stage = useFinishStore((s) => s.stage)
  const jobStatus = useFinishStore((s) => s.jobStatus)
  const downloadResult = useFinishStore((s) => s.downloadResult)
  const reset = useFinishStore((s) => s.reset)
  const error = useFinishStore((s) => s.error)

  if (stage === 'processing') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 py-12"
      >
        {/* Spinner */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-ta-cyan animate-spin"
        >
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
        </svg>

        <div className="text-center">
          <p className="text-sm text-ta-white/80">Processing your track...</p>
          <p className="text-xs text-ta-white/40 mt-1">This usually takes 10-30 seconds</p>
        </div>
      </motion.div>
    )
  }

  if (stage === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 py-8"
      >
        <div className="px-4 py-3 rounded-ta-sm bg-ta-error/10 border border-ta-error/20 text-center">
          <p className="text-xs text-ta-error font-medium">Something went wrong</p>
          <p className="text-xs text-ta-white/50 mt-1">{error}</p>
        </div>
        <button
          onClick={reset}
          className="text-xs text-ta-cyan hover:text-ta-cyan/80 transition-colors"
        >
          Try again
        </button>
      </motion.div>
    )
  }

  if (stage === 'complete' && jobStatus) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        {/* Success banner */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-ta-sm bg-ta-success/10 text-ta-success text-xs font-medium">
          Processing complete
          {jobStatus.qc_passed !== undefined && (
            <span className="text-ta-white/40">
              -- QC {jobStatus.qc_passed ? 'passed' : 'warnings'}
            </span>
          )}
        </div>

        {/* Before/After comparison */}
        {jobStatus.input_lufs !== undefined && jobStatus.output_lufs !== undefined && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-ta-sm bg-ta-panel p-3 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-ta-white/40">Before</span>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-ta-white/50">LUFS</span>
                  <span className="font-mono text-ta-white/70">
                    {jobStatus.input_lufs.toFixed(1)}
                  </span>
                </div>
                {jobStatus.input_true_peak !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-ta-white/50">Peak</span>
                    <span className="font-mono text-ta-white/70">
                      {jobStatus.input_true_peak.toFixed(1)} dBFS
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-ta-sm bg-ta-cyan/[0.06] border border-ta-cyan/10 p-3 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-ta-cyan/60">After</span>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-ta-white/50">LUFS</span>
                  <span className="font-mono text-ta-cyan">{jobStatus.output_lufs.toFixed(1)}</span>
                </div>
                {jobStatus.output_true_peak !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-ta-white/50">Peak</span>
                    <span className="font-mono text-ta-cyan">
                      {jobStatus.output_true_peak.toFixed(1)} dBFS
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Download + Reset buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={downloadResult}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-ta-sm bg-ta-cyan text-ta-black text-sm font-medium hover:bg-ta-cyan/90 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Download
          </button>

          <button
            onClick={reset}
            className="px-4 py-2.5 rounded-ta-sm border border-ta-white/[0.12] text-ta-white/60 text-sm hover:border-ta-white/25 hover:text-ta-white/80 transition-colors"
          >
            New track
          </button>
        </div>
      </motion.div>
    )
  }

  return null
}
