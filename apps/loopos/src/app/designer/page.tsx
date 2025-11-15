'use client'

import { useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { useWorkspace } from '@/hooks/useWorkspace'
import { SceneRenderer } from '@/components/designer/SceneRenderer'
import { SceneControls } from '@/components/designer/SceneControls'
import { sceneGenerator } from '@/lib/designer/generator'
import type { Scene, SceneType } from '@/lib/designer/types'
import { toast } from 'sonner'
import { X } from 'lucide-react'

export default function DesignerPage() {
  return (
    <AuthGuard>
      <DesignerContent />
    </AuthGuard>
  )
}

function DesignerContent() {
  const { currentWorkspace } = useWorkspace()
  const [scene, setScene] = useState<Scene | null>(null)
  const [loading, setLoading] = useState(false)

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen flex items-centre justify-centre bg-background p-4">
        <div className="text-centre">
          <h1 className="text-2xl font-bold mb-2">AI Designer Mode</h1>
          <p className="text-foreground/60">Select or create a workspace to get started</p>
        </div>
      </div>
    )
  }

  const handleGenerate = async (type: SceneType, refinement?: string) => {
    setLoading(true)

    try {
      const generatedScene = await sceneGenerator.generateScene(
        type,
        {
          workspaceId: currentWorkspace.id,
          workspaceName: currentWorkspace.name,
        },
        refinement
      )

      setScene(generatedScene)
      toast.success('Scene generated!')
    } catch (error: any) {
      console.error('Generation error:', error)
      toast.error(error.message || 'Failed to generate scene')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = () => {
    if (scene) {
      handleGenerate(scene.type)
    }
  }

  const handleExport = () => {
    if (!scene) return

    // Convert scene to JSON and download
    const json = JSON.stringify(scene, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${scene.type}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Scene exported!')
  }

  const handleClose = () => {
    setScene(null)
  }

  return (
    <div className="fixed inset-0 bg-background">
      {scene ? (
        <>
          <SceneRenderer scene={scene} />

          <SceneControls
            currentType={scene.type}
            loading={loading}
            onGenerate={handleGenerate}
            onRegenerate={handleRegenerate}
            onExport={handleExport}
          />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-8 right-8 z-20 backdrop-blur-glass bg-background/80 border border-accent/20 rounded-lg p-3 hover:bg-accent/10 transition-colours"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Recommendations panel */}
          {scene.recommendations.length > 0 && (
            <div className="absolute top-8 right-20 z-10 max-w-sm">
              <div className="backdrop-blur-glass bg-background/80 border border-accent/20 rounded-lg p-4 shadow-xl">
                <h4 className="font-semibold text-sm mb-3 text-accent">Recommendations</h4>
                <ul className="space-y-2">
                  {scene.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex gap-2">
                      <span className="text-accent">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="h-full flex items-centre justify-centre">
          <div className="max-w-2xl text-centre">
            <h1 className="text-4xl font-bold mb-4 text-glow">AI Designer Mode</h1>
            <p className="text-lg text-foreground/60 mb-8">
              Generate visual campaign strategies with AI
            </p>

            <div className="backdrop-blur-glass bg-background/60 border border-accent/20 rounded-lg p-8">
              <SceneControls
                currentType="release-strategy"
                loading={loading}
                onGenerate={handleGenerate}
                onRegenerate={handleRegenerate}
              />
            </div>

            <p className="text-sm text-foreground/40 mt-6">
              Designer Mode creates VisionOS-inspired visual scenes for your campaigns
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
