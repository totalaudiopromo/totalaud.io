/**
 * Intent Showreel Page
 * Phase 20 - Visualise Creative Score as Showreel
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { CreativeScore } from '@total-audio/agents/intent'
import {
  buildIntentShowreel,
  exportShowreelJSON,
  exportShowreelMarkdown,
  type ShowreelScript,
  type ShowreelScene,
} from '@total-audio/showreel'
import { ArrowLeft, Download, Play } from 'lucide-react'
import { toast } from 'sonner'

export default function ShowreelPage() {
  const router = useRouter()
  const [showreelScript, setShowreelScript] = useState<ShowreelScript | null>(null)
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // Load score from sessionStorage
    const storedScore = sessionStorage.getItem('intentScore')
    if (!storedScore) {
      toast.error('No creative score found')
      router.push('/intent')
      return
    }

    try {
      const score: CreativeScore = JSON.parse(storedScore)
      const script = buildIntentShowreel(score)
      setShowreelScript(script)
      toast.success('Showreel generated')
    } catch (error) {
      console.error('Failed to build showreel:', error)
      toast.error('Failed to generate showreel')
      router.push('/intent')
    }
  }, [router])

  const handleDownload = (format: 'json' | 'markdown') => {
    if (!showreelScript) return

    const content = format === 'json'
      ? exportShowreelJSON(showreelScript)
      : exportShowreelMarkdown(showreelScript)

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `showreel-${showreelScript.id}.${format === 'json' ? 'json' : 'md'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    toast.info(isPlaying ? 'Paused' : 'Playing')
  }

  if (!showreelScript) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="text-neutral-500">Loading showreel...</div>
      </div>
    )
  }

  const currentScene = showreelScript.scenes[currentSceneIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/intent')}
                className="rounded-lg p-2 transition-colours hover:bg-neutral-800"
              >
                <ArrowLeft size={20} className="text-neutral-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-100">{showreelScript.title}</h1>
                <p className="text-sm text-neutral-500">
                  {showreelScript.scenes.length} scenes • {Math.floor(showreelScript.duration / 60)}:
                  {(showreelScript.duration % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white transition-colours hover:bg-cyan-700"
              >
                <Play size={16} />
                {isPlaying ? 'Pause' : 'Play'} (Preview)
              </button>
              <button
                onClick={() => handleDownload('json')}
                className="rounded-lg bg-neutral-800 px-4 py-2 text-sm text-neutral-300 transition-colours hover:bg-neutral-700"
              >
                <Download size={16} className="inline mr-2" />
                JSON
              </button>
              <button
                onClick={() => handleDownload('markdown')}
                className="rounded-lg bg-neutral-800 px-4 py-2 text-sm text-neutral-300 transition-colours hover:bg-neutral-700"
              >
                <Download size={16} className="inline mr-2" />
                Markdown
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Scene Timeline */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-6">
              <h2 className="text-lg font-semibold text-neutral-100">Scene Timeline</h2>
              <div className="mt-4 space-y-2">
                {showreelScript.scenes.map((scene, i) => (
                  <button
                    key={scene.id}
                    onClick={() => setCurrentSceneIndex(i)}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      i === currentSceneIndex
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-neutral-700 bg-neutral-800/30 hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          i === currentSceneIndex
                            ? 'bg-cyan-500 text-white'
                            : 'bg-neutral-700 text-neutral-400'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-neutral-200">
                          Scene {i + 1}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {Math.floor(scene.startTime / 60)}:
                          {(scene.startTime % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Current Scene Details */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentScene.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Scene Preview */}
              <div className="overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900">
                <div className="aspect-video bg-gradient-to-br from-neutral-800 to-neutral-900 p-12">
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                      Scene {currentSceneIndex + 1}
                    </div>
                    <h3 className="mt-2 text-3xl font-bold text-neutral-100">
                      {currentScene.title}
                    </h3>
                    {currentScene.narration && (
                      <p className="mt-4 text-lg italic text-neutral-400">
                        "{currentScene.narration}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Scene Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Camera
                  </div>
                  <div className="mt-1 text-lg font-semibold capitalize text-cyan-400">
                    {currentScene.cameraAngle}
                  </div>
                </div>
                <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Lighting
                  </div>
                  <div className="mt-1 text-lg font-semibold capitalize text-purple-400">
                    {currentScene.lighting}
                  </div>
                </div>
                <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Primary OS
                  </div>
                  <div className="mt-1 text-lg font-semibold uppercase text-green-400">
                    {currentScene.osPresence.primary || 'None'}
                  </div>
                </div>
                <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    Tempo
                  </div>
                  <div className="mt-1 text-lg font-semibold text-amber-400">
                    {currentScene.audio.tempo} BPM
                  </div>
                </div>
              </div>

              {/* Audio Layers */}
              <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
                <div className="text-sm font-medium text-neutral-300">Audio Layers</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentScene.audio.layers.map((layer) => (
                    <span
                      key={layer}
                      className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm font-medium capitalize text-cyan-400"
                    >
                      {layer}
                    </span>
                  ))}
                </div>
              </div>

              {/* Effects */}
              <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
                <div className="text-sm font-medium text-neutral-300">Visual Effects</div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Glitch</span>
                    <span
                      className={`font-medium ${currentScene.effects.glitch ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {currentScene.effects.glitch ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Bloom</span>
                    <span
                      className={`font-medium ${currentScene.effects.bloom ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {currentScene.effects.bloom ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Vignette</span>
                    <span
                      className={`font-medium ${currentScene.effects.vignette ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {currentScene.effects.vignette ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Particle Intensity</span>
                    <span className="font-medium text-purple-400">
                      {Math.round(currentScene.effects.particleIntensity * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentSceneIndex(Math.max(0, currentSceneIndex - 1))}
                  disabled={currentSceneIndex === 0}
                  className="rounded-lg bg-neutral-800 px-4 py-2 text-sm text-neutral-300 transition-colours hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous Scene
                </button>
                <div className="text-sm text-neutral-500">
                  {currentSceneIndex + 1} / {showreelScript.scenes.length}
                </div>
                <button
                  onClick={() =>
                    setCurrentSceneIndex(
                      Math.min(showreelScript.scenes.length - 1, currentSceneIndex + 1)
                    )
                  }
                  disabled={currentSceneIndex === showreelScript.scenes.length - 1}
                  className="rounded-lg bg-neutral-800 px-4 py-2 text-sm text-neutral-300 transition-colours hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next Scene
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
