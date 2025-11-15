'use client'

import { PageHeader } from '@/components/PageHeader'
import { Download, FileText, Image, Radio, Share2 } from 'lucide-react'
import { useState } from 'react'

type ExportType = 'campaign' | 'epk' | 'pr-brief' | 'radio-brief' | 'social-brief'
type ExportFormat = 'html' | 'json'

interface ExportOption {
  type: ExportType
  title: string
  description: string
  icon: React.ReactNode
  formats: ExportFormat[]
}

const exportOptions: ExportOption[] = [
  {
    type: 'campaign',
    title: 'Campaign Pack',
    description: 'Full campaign summary with nodes, insights, and journal entries',
    icon: <FileText className="w-6 h-6" />,
    formats: ['html', 'json'],
  },
  {
    type: 'epk',
    title: 'Electronic Press Kit',
    description: 'Professional EPK with bio, tracks, links, and images',
    icon: <Image className="w-6 h-6" />,
    formats: ['html', 'json'],
  },
  {
    type: 'pr-brief',
    title: 'PR Brief',
    description: 'Strategic brief for PR agencies and publicists',
    icon: <Share2 className="w-6 h-6" />,
    formats: ['html', 'json'],
  },
  {
    type: 'radio-brief',
    title: 'Radio Brief',
    description: 'Targeted brief for radio pluggers and stations',
    icon: <Radio className="w-6 h-6" />,
    formats: ['html', 'json'],
  },
  {
    type: 'social-brief',
    title: 'Social Media Brief',
    description: 'Content strategy and angles for social media teams',
    icon: <Share2 className="w-6 h-6" />,
    formats: ['html', 'json'],
  },
]

export default function ExportPage() {
  const [selectedType, setSelectedType] = useState<ExportType | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('html')
  const [isGenerating, setIsGenerating] = useState(false)
  const [includeJournal, setIncludeJournal] = useState(true)
  const [includeMoodboard, setIncludeMoodboard] = useState(false)
  const [includeInsights, setIncludeInsights] = useState(true)

  const generateExport = async () => {
    if (!selectedType) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/export/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          format: selectedFormat,
          options: {
            includeJournal,
            includeMoodboard,
            includeInsights,
          },
        }),
      })

      const data = await response.json()

      // Download the file
      const blob = new Blob([data.content], {
        type: selectedFormat === 'html' ? 'text/html' : 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedType}-export.${selectedFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedOption = exportOptions.find((opt) => opt.type === selectedType)

  return (
    <div className="min-h-screen bg-matte-black">
      <PageHeader
        title="Export Centre"
        description="Generate professional campaign deliverables"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Export Types */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-white mb-4">Export Type</h2>
            <div className="space-y-2">
              {exportOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => setSelectedType(option.type)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedType === option.type
                      ? 'bg-slate-cyan/10 border-slate-cyan'
                      : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-slate-cyan">{option.icon}</span>
                    <h3 className="text-sm font-medium text-white">{option.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Export Configuration */}
          <div className="lg:col-span-2">
            {selectedOption ? (
              <div className="space-y-6">
                {/* Selected Type Info */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-slate-cyan">{selectedOption.icon}</span>
                    <h2 className="text-xl font-semibold text-white">{selectedOption.title}</h2>
                  </div>
                  <p className="text-gray-400">{selectedOption.description}</p>
                </div>

                {/* Format Selection */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-white mb-4">Export Format</h3>
                  <div className="flex gap-3">
                    {selectedOption.formats.map((format) => (
                      <button
                        key={format}
                        onClick={() => setSelectedFormat(format)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedFormat === format
                            ? 'bg-slate-cyan text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options (for campaign type) */}
                {selectedType === 'campaign' && (
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">Include</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeInsights}
                          onChange={(e) => setIncludeInsights(e.target.checked)}
                          className="w-4 h-4 text-slate-cyan bg-gray-900 border-gray-700 rounded focus:ring-slate-cyan"
                        />
                        <span className="text-sm text-gray-300">Flow Insights & Metrics</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeJournal}
                          onChange={(e) => setIncludeJournal(e.target.checked)}
                          className="w-4 h-4 text-slate-cyan bg-gray-900 border-gray-700 rounded focus:ring-slate-cyan"
                        />
                        <span className="text-sm text-gray-300">Journal Entries</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeMoodboard}
                          onChange={(e) => setIncludeMoodboard(e.target.checked)}
                          className="w-4 h-4 text-slate-cyan bg-gray-900 border-gray-700 rounded focus:ring-slate-cyan"
                        />
                        <span className="text-sm text-gray-300">Moodboard Items</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={generateExport}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-cyan hover:bg-slate-cyan/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colours"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Generate Export
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-12 text-center">
                <Download className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">Select an export type to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
