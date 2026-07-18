/**
 * StreamingSection
 *
 * Streaming stats inside Intel (Phase 5, docs/ROADMAP_2026.md): the artist
 * imports their own Spotify for Artists CSV and gets a plain-English read
 * first, a small chart second. The file is read in the browser and only its
 * text reaches the import route — own data, brought by the artist.
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { capture } from '@/lib/analytics'
import type { StreamingSummary } from '@/lib/intel/streaming'

const NORMAL_TRANSITION = { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const }

interface SeriesPoint {
  date: string
  streams: number
}

type Status = 'loading' | 'empty' | 'ready' | 'error'

export function StreamingSection() {
  const [status, setStatus] = useState<Status>('loading')
  const [summary, setSummary] = useState<StreamingSummary | null>(null)
  const [series, setSeries] = useState<SeriesPoint[]>([])
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/intel/streaming')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const payload = (await response.json()) as {
        empty: boolean
        summary?: StreamingSummary
        series?: SeriesPoint[]
      }
      if (payload.empty || !payload.summary) {
        setStatus('empty')
        return
      }
      setSummary(payload.summary)
      setSeries(payload.series ?? [])
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const importFile = async (file: File) => {
    setImporting(true)
    setImportError(null)
    try {
      const csv = await file.text()
      const response = await fetch('/api/intel/streaming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      })
      const payload = (await response.json()) as { imported?: number; error?: string }
      if (!response.ok) {
        setImportError(payload.error ?? 'Could not read that file — try the CSV download again.')
        return
      }
      capture('streaming_stats_imported', { days: payload.imported })
      await load()
    } catch {
      setImportError('Could not read that file — try the CSV download again.')
    } finally {
      setImporting(false)
    }
  }

  const maxStreams = Math.max(1, ...series.map((point) => point.streams))

  const importButton = (label: string, subtle = false) => (
    <button
      onClick={() => fileInputRef.current?.click()}
      disabled={importing}
      className={
        subtle
          ? 'text-[11px] text-ta-white/40 hover:text-ta-white/70 transition-colors disabled:opacity-50'
          : 'px-4 py-2.5 rounded-ta-sm border border-ta-cyan/30 text-ta-cyan text-xs font-medium hover:border-ta-cyan/60 transition-colors disabled:opacity-50'
      }
    >
      {importing ? 'Reading the export…' : label}
    </button>
  )

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h4 className="text-xs font-medium text-ta-white/50 border-b border-ta-white/[0.06] pb-1.5">
          Streaming
        </h4>
        <p className="text-xs text-ta-white/40 leading-relaxed pt-1">
          Your streaming numbers, from your own export. In Spotify for Artists, open Audience and
          download the CSV — the file is read here in your browser.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void importFile(file)
          event.target.value = ''
        }}
      />

      {status === 'loading' && (
        <div className="space-y-2.5 pt-1">
          <motion.div
            className="h-3 rounded-ta-sm bg-ta-white/[0.06]"
            style={{ width: '75%' }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      {status === 'error' && (
        <p className="text-xs text-ta-white/40 leading-relaxed">
          Could not reach your streaming stats just now. They will be here when the connection is
          back.
        </p>
      )}

      {status === 'empty' && (
        <div className="space-y-2">
          <p className="text-xs text-ta-white/40 leading-relaxed">
            Nothing imported yet. One CSV gives you an honest read of the last few months.
          </p>
          {importButton('Import a Spotify for Artists CSV')}
        </div>
      )}

      {status === 'ready' && summary && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={NORMAL_TRANSITION}
          className="space-y-3"
        >
          <p className="text-xs text-ta-white/70 leading-relaxed">{summary.summary}</p>

          {series.length > 1 && (
            <div className="rounded-ta-sm border border-ta-white/[0.06] bg-ta-panel/50 p-3 space-y-2">
              <div className="flex items-end gap-[3px] h-16">
                {series.map((point) => (
                  <motion.div
                    key={point.date}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, (point.streams / maxStreams) * 100)}%` }}
                    transition={NORMAL_TRANSITION}
                    className="flex-1 rounded-[2px] bg-ta-cyan/30 min-h-[3px]"
                    title={`${point.date}: ${point.streams.toLocaleString('en-GB')} streams`}
                  />
                ))}
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-mono text-ta-white/30">
                  {series[0].date.slice(5)}
                </span>
                <span className="text-[10px] font-mono text-ta-white/30">daily streams</span>
                <span className="text-[10px] font-mono text-ta-white/30">
                  {series[series.length - 1].date.slice(5)}
                </span>
              </div>
            </div>
          )}

          {importButton('Import a newer export', true)}
        </motion.div>
      )}

      {importError && <p className="text-xs text-ta-white/40 leading-relaxed">{importError}</p>}
    </section>
  )
}
