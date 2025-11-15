/**
 * useConsoleExport Hook
 * Client-side hook for exporting to Console
 */

'use client'

import { useState } from 'react'
import type { ConsoleExportPayload } from '@/lib/exportToConsole'
import { nodeToConsoleExport, noteToConsoleExport } from '@/lib/exportToConsole'
import type { LoopOSNode, LoopOSNote } from '@total-audio/loopos-db'
import toast from 'react-hot-toast'

interface ExportResult {
  success: boolean
  export_id?: string
  status?: string
  message?: string
  error?: string
}

export function useConsoleExport() {
  const [isExporting, setIsExporting] = useState(false)

  async function exportToConsole(payload: ConsoleExportPayload): Promise<ExportResult> {
    setIsExporting(true)

    try {
      const response = await fetch('/api/integrations/console', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Export failed')
      }

      toast.success('Exported to Console')

      return {
        success: true,
        export_id: data.export_id,
        status: data.status,
        message: data.message,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed'
      toast.error(errorMessage)

      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsExporting(false)
    }
  }

  async function exportNode(node: LoopOSNode): Promise<ExportResult> {
    const payload = nodeToConsoleExport(node)
    return exportToConsole(payload)
  }

  async function exportNote(note: LoopOSNote): Promise<ExportResult> {
    const payload = noteToConsoleExport(note)
    return exportToConsole(payload)
  }

  return {
    exportToConsole,
    exportNode,
    exportNote,
    isExporting,
  }
}
