/**
 * DownloadReportButton
 *
 * Downloads the finishing report (measurements + finishing notes when they
 * are in) as a Markdown file, once analysis has come back. Everything is
 * built client-side — nothing extra leaves the device.
 */

'use client'

import { useFinishStore } from '@/stores/useFinishStore'
import { downloadFinishingReport } from '@/lib/finish/report'
import { capture } from '@/lib/analytics'

export function DownloadReportButton() {
  const analysis = useFinishStore((s) => s.analysis)
  const finishingNotes = useFinishStore((s) => s.finishingNotes)
  const notesStatus = useFinishStore((s) => s.notesStatus)
  const notesLocked = useFinishStore((s) => s.notesLocked)
  const trackContext = useFinishStore((s) => s.trackContext)
  const fileName = useFinishStore((s) => s.fileName)

  if (!analysis) return null

  const hasNotes = notesStatus === 'ready' && !!finishingNotes

  const handleDownload = () => {
    downloadFinishingReport({
      analysis,
      finishingNotes: hasNotes ? finishingNotes : null,
      trackContext,
      fileName,
      lockedPerspectives: notesLocked,
    })
    capture('finishing_report_downloaded', { withNotes: hasNotes })
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-ta-sm border border-ta-white/[0.06] bg-ta-panel/50 px-3 py-2.5">
      <p className="text-xs text-ta-white/50 leading-relaxed flex-1">
        {hasNotes
          ? 'Keep a copy of the measurements and finishing notes.'
          : 'Keep a copy of the measurements — finishing notes are added once they are in.'}
      </p>
      <button
        onClick={handleDownload}
        className="px-4 py-2 rounded-ta-sm border border-ta-cyan/30 text-ta-cyan text-xs font-medium hover:bg-ta-cyan/10 transition-colors whitespace-nowrap self-start sm:self-auto"
      >
        Download report
      </button>
    </div>
  )
}
