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
        className="flex items-center gap-1.5 rounded-[4px] border border-[#3AA9BE]/40 bg-[rgba(58,169,190,0.08)] px-3 py-1.5 text-[12px] font-medium text-[#3AA9BE] transition-all duration-[120ms] hover:border-[#3AA9BE]/60 hover:bg-[rgba(58,169,190,0.12)]"
      >
        <span>Export</span>
        <span className="text-[9px]">v</span>
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
              className="absolute right-0 top-full z-20 mt-1 w-44 rounded-[6px] border border-[#1F2327] bg-[#131619] p-1 shadow-xl"
            >
              <button
                type="button"
                onClick={downloadCSV}
                className="flex w-full items-center gap-2 rounded-[4px] px-3 py-2 text-left text-[13px] text-[#A9B3BF] transition-colors duration-[120ms] hover:bg-[#1A1D21] hover:text-[#E8EAED]"
              >
                <span className="text-[11px] text-[#6B7280]">CSV</span>
                <span>Download</span>
              </button>
              <button
                type="button"
                onClick={copyToClipboard}
                className="flex w-full items-center gap-2 rounded-[4px] px-3 py-2 text-left text-[13px] text-[#A9B3BF] transition-colors duration-[120ms] hover:bg-[#1A1D21] hover:text-[#E8EAED]"
              >
                <span className="text-[11px] text-[#6B7280]">{copied ? '+' : 'TXT'}</span>
                <span>{copied ? 'Copied' : 'Copy to clipboard'}</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
