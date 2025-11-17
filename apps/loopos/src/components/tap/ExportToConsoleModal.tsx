'use client'

import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import { consoleApi } from '@/integrations/console/api'
import type { Node } from '@total-audio/loopos-db'
import { toast } from 'sonner'

interface ExportToConsoleModalProps {
  nodes: Node[]
  onClose: () => void
}

export function ExportToConsoleModal({ nodes, onClose }: ExportToConsoleModalProps) {
  const [exporting, setExporting] = useState(false)
  const [selectedNodes, setSelectedNodes] = useState<string[]>(nodes.map((n) => n.id))

  const handleExport = async () => {
    setExporting(true)

    try {
      const nodesToExport = nodes.filter((n) => selectedNodes.includes(n.id))
      const tasks = await consoleApi.exportNodeSequence(nodesToExport)

      toast.success(`Exported ${tasks.length} tasks to Console!`)
      onClose()
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export to Console')
    } finally {
      setExporting(false)
    }
  }

  const toggleNode = (nodeId: string) => {
    setSelectedNodes((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-centre justify-centre bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-background border border-border rounded-lg shadow-xl">
        <div className="flex items-centre justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Export to Console</h2>
            <p className="text-sm text-foreground/60 mt-1">
              Convert your nodes into Console tasks
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground transition-colours"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Select nodes to export:</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {nodes.map((node) => (
                <label
                  key={node.id}
                  className="flex items-centre gap-3 p-3 border border-border rounded-lg hover:bg-accent/5 cursor-pointer transition-colours"
                >
                  <input
                    type="checkbox"
                    checked={selectedNodes.includes(node.id)}
                    onChange={() => toggleNode(node.id)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{node.title}</p>
                    <p className="text-xs text-foreground/60 capitalize">{node.type}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={exporting}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent/5 transition-colours disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || selectedNodes.length === 0}
              className="flex-1 flex items-centre justify-centre gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colours disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Export {selectedNodes.length} nodes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
