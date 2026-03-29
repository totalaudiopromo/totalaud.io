/**
 * FinishCanvas
 *
 * Main Finish mode component. Orchestrates the flow:
 * Upload -> Analyse -> Results (metrics + suggestions) -> Process -> Download
 *
 * Left panel: metrics + suggestions (scrollable)
 * Right panel: upload zone or processing status
 * Mobile: stacked vertically
 */

'use client'

import { useFinishStore } from '@/stores/useFinishStore'
import { UploadZone } from './UploadZone'
import { AnalysisPanel } from './AnalysisPanel'
import { SuggestionsPanel } from './SuggestionsPanel'
import { ProcessingStatus } from './ProcessingStatus'

export function FinishCanvas() {
  const stage = useFinishStore((s) => s.stage)
  const analysis = useFinishStore((s) => s.analysis)
  const suggestions = useFinishStore((s) => s.suggestions)

  // Upload stage -- show the upload zone centred
  if (stage === 'upload') {
    return <UploadZone />
  }

  // Analysing stage -- show spinner
  if (stage === 'analysing') {
    return (
      <div className="flex items-center justify-center h-full gap-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-ta-cyan animate-spin"
        >
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
        </svg>
        <span className="text-sm text-ta-white/60">Analysing your track...</span>
      </div>
    )
  }

  // Processing / Complete / Error -- show processing status
  if (stage === 'processing' || stage === 'complete' || stage === 'error') {
    return (
      <div className="flex flex-col lg:flex-row h-full overflow-hidden">
        {/* Left: Analysis results (if available) */}
        {analysis && (
          <div className="lg:w-80 xl:w-96 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-ta-white/[0.06] overflow-y-auto p-4">
            <AnalysisPanel analysis={analysis} />
          </div>
        )}

        {/* Right: Processing status */}
        <div className="flex-1 overflow-y-auto p-4">
          <ProcessingStatus />
        </div>
      </div>
    )
  }

  // Results stage -- show analysis + suggestions side by side
  if (stage === 'results' && analysis) {
    return (
      <div className="flex flex-col lg:flex-row h-full overflow-hidden">
        {/* Left: Analysis metrics */}
        <div className="lg:w-80 xl:w-96 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-ta-white/[0.06] overflow-y-auto p-4">
          <AnalysisPanel analysis={analysis} />
        </div>

        {/* Right: Suggestions */}
        <div className="flex-1 overflow-y-auto p-4">
          <SuggestionsPanel suggestions={suggestions} />

          {/* Hint about processing */}
          <p className="mt-6 text-xs text-ta-white/30 leading-relaxed">
            Choose a genre preset and settings in the toolbar above, then hit Process to master your
            track. The engine applies EQ, compression, limiting, and stereo treatment tuned for your
            genre and target platform.
          </p>
        </div>
      </div>
    )
  }

  return null
}
