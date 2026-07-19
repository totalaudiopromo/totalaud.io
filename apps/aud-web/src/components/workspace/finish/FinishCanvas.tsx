/**
 * FinishCanvas
 *
 * Main Finish mode component. Orchestrates the flow:
 * Upload -> Analyse (in the browser) -> Results (metrics + finishing notes)
 *
 * Left panel: analysis metrics (scrollable)
 * Right panel: suggestions + finishing-note perspectives
 * Mobile: stacked vertically
 *
 * Mastering (process/download) is parked while the engine is rebuilt --
 * ProcessingStatus still handles error recovery and the parked stages.
 */

'use client'

import { useFinishStore } from '@/stores/useFinishStore'
import { UploadZone } from './UploadZone'
import { AnalysisPanel } from './AnalysisPanel'
import { SuggestionsPanel } from './SuggestionsPanel'
import { ProcessingStatus } from './ProcessingStatus'
import { AnalysingView } from './AnalysingView'
import { PerspectivesPanel } from './PerspectivesPanel'
import { DownloadReportButton } from './DownloadReportButton'

export function FinishCanvas() {
  const stage = useFinishStore((s) => s.stage)
  const analysis = useFinishStore((s) => s.analysis)
  const suggestions = useFinishStore((s) => s.suggestions)
  const fileName = useFinishStore((s) => s.fileName)

  // Upload stage -- show the upload zone centred
  if (stage === 'upload') {
    return <UploadZone />
  }

  // Analysing stage -- show multi-step progress
  if (stage === 'analysing') {
    return <AnalysingView fileName={fileName} />
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

  // Results stage -- analysis metrics alongside suggestions + finishing notes
  if (stage === 'results' && analysis) {
    return (
      <div className="flex flex-col lg:flex-row h-full overflow-hidden">
        {/* Left: Analysis metrics */}
        <div className="lg:w-80 xl:w-96 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-ta-white/[0.06] overflow-y-auto p-4">
          <AnalysisPanel analysis={analysis} />
        </div>

        {/* Right: Suggestions + finishing notes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <SuggestionsPanel suggestions={suggestions} />

          <PerspectivesPanel />

          {/* Keep a copy of the report */}
          <DownloadReportButton />

          {/* Mastering parked */}
          <div className="rounded-ta-sm border border-ta-white/[0.06] bg-ta-panel/50 px-3 py-2.5">
            <p className="text-xs text-ta-white/40 leading-relaxed">
              Mastering is taking a break while we rebuild it. Analysis and finishing notes work
              fully — on your device.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
