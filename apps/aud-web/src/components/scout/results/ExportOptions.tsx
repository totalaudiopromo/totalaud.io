'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Opportunity } from '../ScoutWizard'

interface ExportOptionsProps {
  opportunities: Opportunity[]
}

export function ExportOptions({ opportunities }: ExportOptionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateCSV = useCallback(() => {
    const headers = [
      'Name',
      'Type',
      'Contact Name',
      'Email',
      'Submission URL',
      'Relevance Score',
      'Genres',
    ]
    const rows = opportunities.map((opp) => [
      opp.name,
      opp.type,
      opp.contact.name || '',
      opp.contact.email || '',
      opp.contact.submissionUrl || '',
      opp.relevanceScore.toString(),
      opp.genres.join('; '),
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n')

    return csvContent
  }, [opportunities])

  const downloadCSV = useCallback(() => {
    const csv = generateCSV()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `scout-opportunities-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setIsOpen(false)
  }, [generateCSV])

  const copyToClipboard = useCallback(async () => {
    const text = opportunities
      .map(
        (opp) =>
          `${opp.name} (${opp.type})\n` +
          (opp.contact.email ? `Email: ${opp.contact.email}\n` : '') +
          (opp.contact.submissionUrl ? `Link: ${opp.contact.submissionUrl}\n` : '') +
          `Match: ${opp.relevanceScore}%`
      )
      .join('\n\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy to clipboard')
    }
    setIsOpen(false)
  }, [opportunities])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full border border-sky-500/50 bg-sky-500/10 px-3 py-1.5 text-[11px] font-medium text-sky-300 transition-colors hover:bg-sky-500/20"
      >
        <span>Export</span>
        <span className="text-[10px]">▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-xl"
            >
              <button
                type="button"
                onClick={downloadCSV}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
              >
                <span>📄</span>
                <span>Download CSV</span>
              </button>
              <button
                type="button"
                onClick={copyToClipboard}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
              >
                <span>{copied ? '✓' : '📋'}</span>
                <span>{copied ? 'Copied!' : 'Copy to clipboard'}</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
