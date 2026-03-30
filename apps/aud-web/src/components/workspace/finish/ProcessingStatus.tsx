/**
 * ProcessingStatus
 *
 * Shows progress while the mastering engine processes audio.
 * Displays before/after metrics once complete, with download button.
 * Better error recovery with context-aware retry options.
 */

'use client'

import { motion } from 'framer-motion'
import { useFinishStore } from '@/stores/useFinishStore'

function ProgressShimmer({
  label,
  subtitle,
  fileName,
  duration,
}: {
  label: string
  subtitle?: string
  fileName: string | null
  duration: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-4 py-12"
    >
      <div className="w-48 h-1 bg-ta-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-ta-cyan rounded-full"
          initial={{ x: '-100%', width: '40%' }}
          animate={{ x: '250%' }}
          transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="text-center">
        <p className="text-sm text-ta-white/80">{label}</p>
        {subtitle && <p className="text-xs text-ta-white/40 mt-1">{subtitle}</p>}
        {fileName && (
          <p className="text-xs text-ta-white/30 mt-1 font-mono truncate max-w-[260px]">
            {fileName}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export function ProcessingStatus() {
  const stage = useFinishStore((s) => s.stage)
  const jobStatus = useFinishStore((s) => s.jobStatus)
  const downloadResult = useFinishStore((s) => s.downloadResult)
  const reset = useFinishStore((s) => s.reset)
  const error = useFinishStore((s) => s.error)
  const fileName = useFinishStore((s) => s.fileName)
  const analyze = useFinishStore((s) => s.analyze)
  const process = useFinishStore((s) => s.process)

  if (stage === 'analysing') {
    return <ProgressShimmer label="Analysing your track..." fileName={fileName} duration={1.2} />
  }

  if (stage === 'processing') {
    return (
      <ProgressShimmer
        label="Processing your track..."
        subtitle="This usually takes 10-30 seconds"
        fileName={fileName}
        duration={1.5}
      />
    )
  }

  if (stage === 'error') {
    // Determine if error was during analysis or processing for appropriate retry
    const hasFile = useFinishStore.getState().file !== null
    const hadAnalysis = useFinishStore.getState().analysis !== null

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-5 py-8 max-w-sm mx-auto"
      >
        <div className="w-full px-4 py-3 rounded-ta-sm bg-ta-error/10 border border-ta-error/20 text-center">
          <p className="text-xs text-ta-error font-medium">Something went wrong</p>
          <p className="text-xs text-ta-white/50 mt-1">{error}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
          {/* Retry with same settings */}
          {hasFile && (
            <button
              onClick={() => {
                if (hadAnalysis) {
                  // Had analysis, so error was during processing -- retry process
                  process()
                } else {
                  // Error was during analysis -- retry analysis
                  analyze()
                }
              }}
              className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-ta-sm bg-ta-cyan text-ta-black text-xs font-medium hover:bg-ta-cyan/90 transition-colors"
            >
              Try again with same file
            </button>
          )}
          {/* Start fresh */}
          <button
            onClick={reset}
            className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-ta-sm border border-ta-white/[0.12] text-ta-white/60 text-xs hover:border-ta-white/25 hover:text-ta-white/80 transition-colors"
          >
            Try a different track
          </button>
        </div>
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
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={downloadResult}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-ta-sm bg-ta-cyan text-ta-black text-sm font-medium hover:bg-ta-cyan/90 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Download
          </button>

          <button
            onClick={reset}
            className="w-full sm:w-auto px-4 py-2.5 rounded-ta-sm border border-ta-white/[0.12] text-ta-white/60 text-sm hover:border-ta-white/25 hover:text-ta-white/80 transition-colors"
          >
            New track
          </button>
        </div>
      </motion.div>
    )
  }

  return null
}
