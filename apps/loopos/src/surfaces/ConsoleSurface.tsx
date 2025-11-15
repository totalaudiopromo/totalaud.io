'use client'

import { useState } from 'react'
import { ExternalLink, Database, ArrowRight } from 'lucide-react'
import { consoleSurface, examplePipelines } from './SurfaceDefinitions'

export function ConsoleSurface() {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="min-h-screen bg-matte-black p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{consoleSurface.name}</h1>
            <p className="text-slate-400">
              Preview of data exchange between LoopOS and Console
            </p>
            <div className="mt-4 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded inline-block">
              <p className="text-sm text-amber-400">
                ⚠️ Preview Only - No actual API calls are made
              </p>
            </div>
          </div>

          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2 bg-slate-cyan/20 text-slate-cyan rounded hover:bg-slate-cyan/30 transition-fast"
          >
            <ExternalLink className="w-4 h-4" />
            View Console
          </a>
        </div>

        {/* Data Schema */}
        <div className="p-6 bg-[var(--border)] border border-[var(--border-subtle)] rounded">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-slate-cyan" />
            <h2 className="text-xl font-semibold">Data Schema</h2>
          </div>

          <pre className="p-4 bg-matte-black rounded font-mono text-sm text-slate-300 overflow-x-auto">
            {JSON.stringify(consoleSurface.dataSchema, null, 2)}
          </pre>
        </div>

        {/* Preview Data */}
        <div className="p-6 bg-[var(--border)] border border-[var(--border-subtle)] rounded">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Preview Data</h2>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-slate-cyan/20 text-slate-cyan rounded hover:bg-slate-cyan/30 transition-fast"
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>

          {showPreview && (
            <pre className="p-4 bg-matte-black rounded font-mono text-sm text-emerald-400 overflow-x-auto">
              {JSON.stringify(consoleSurface.previewData, null, 2)}
            </pre>
          )}
        </div>

        {/* Example Pipeline */}
        <div className="p-6 bg-[var(--border)] border border-[var(--border-subtle)] rounded">
          <h2 className="text-xl font-semibold mb-4">Example Pipeline</h2>
          <p className="text-slate-400 mb-6">
            {examplePipelines['loopos-to-console'].description}
          </p>

          <div className="space-y-3">
            {examplePipelines['loopos-to-console'].steps.map((step) => (
              <div
                key={step.step}
                className="flex items-start gap-4 p-4 bg-matte-black rounded"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-cyan/20 text-slate-cyan font-bold text-sm flex-shrink-0">
                  {step.step}
                </div>

                <div className="flex-1">
                  <p className="text-sm mb-1">{step.action}</p>
                  <span className="text-xs text-slate-500 uppercase">{step.app}</span>
                </div>

                {step.step < examplePipelines['loopos-to-console'].steps.length && (
                  <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded">
          <h3 className="font-semibold text-purple-400 mb-3">Implementation Notes</h3>
          <ul className="space-y-2 text-sm text-purple-300">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>
                This surface prepares the data structure for Console integration
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>No API endpoints are called - this is preview-only</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>
                When ready to integrate, add POST /api/surfaces/console endpoint
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>Validate data against schema using Zod before sending</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
