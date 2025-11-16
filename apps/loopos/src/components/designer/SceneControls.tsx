'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw, Wand2, Download } from 'lucide-react'
import type { SceneType } from '@/lib/designer/types'

const sceneTypes: { value: SceneType; label: string; description: string }[] = [
  {
    value: 'release-strategy',
    label: 'Release Strategy',
    description: 'Three-act campaign timeline',
  },
  {
    value: 'audience-development',
    label: 'Audience Development',
    description: 'Funnel from awareness to advocacy',
  },
  {
    value: 'growth-30day',
    label: '30-Day Growth',
    description: 'Focused weekly sprint plan',
  },
  {
    value: 'epk-structure',
    label: 'EPK Structure',
    description: 'Press kit core components',
  },
  {
    value: 'creative-identity',
    label: 'Creative Identity',
    description: 'Brand essence map',
  },
]

interface SceneControlsProps {
  currentType: SceneType
  loading: boolean
  onGenerate: (type: SceneType, refinement?: string) => void
  onRegenerate: () => void
  onExport?: () => void
}

export function SceneControls({
  currentType,
  loading,
  onGenerate,
  onRegenerate,
  onExport,
}: SceneControlsProps) {
  const [selectedType, setSelectedType] = useState<SceneType>(currentType)
  const [refinement, setRefinement] = useState('')
  const [showRefinement, setShowRefinement] = useState(false)

  const handleGenerate = () => {
    onGenerate(selectedType, refinement || undefined)
    setShowRefinement(false)
    setRefinement('')
  }

  return (
    <div className="absolute top-8 left-8 right-8 z-10 flex justify-between items-start">
      {/* Scene type selector */}
      <div className="backdrop-blur-glass bg-background/80 border border-accent/20 rounded-lg p-4 shadow-xl max-w-md">
        <div className="flex items-centre gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">AI Designer</h3>
        </div>

        <div className="space-y-2">
          {sceneTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              disabled={loading}
              className={`
                w-full text-left px-3 py-2 rounded transition-colours
                ${
                  selectedType === type.value
                    ? 'bg-accent/20 border border-accent text-accent'
                    : 'bg-background/40 border border-border hover:border-accent/50'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="font-medium text-sm">{type.label}</div>
              <div className="text-xs text-foreground/60">{type.description}</div>
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {showRefinement && (
            <input
              type="text"
              value={refinement}
              onChange={(e) => setRefinement(e.target.value)}
              placeholder="Refine this scene (e.g., 'make it more visual')"
              className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:border-accent"
            />
          )}

          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 flex items-centre justify-centre gap-2 px-4 py-2 bg-accent text-background rounded hover:bg-accent/90 transition-colours disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate</span>
                </>
              )}
            </button>

            {!showRefinement && (
              <button
                onClick={() => setShowRefinement(true)}
                disabled={loading}
                className="px-4 py-2 border border-border rounded hover:border-accent transition-colours disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onRegenerate}
          disabled={loading}
          className="backdrop-blur-glass bg-background/80 border border-accent/20 rounded-lg p-3 hover:bg-accent/10 transition-colours disabled:opacity-50"
          title="Regenerate scene"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        {onExport && (
          <button
            onClick={onExport}
            disabled={loading}
            className="backdrop-blur-glass bg-background/80 border border-accent/20 rounded-lg p-3 hover:bg-accent/10 transition-colours disabled:opacity-50"
            title="Export scene"
          >
            <Download className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
