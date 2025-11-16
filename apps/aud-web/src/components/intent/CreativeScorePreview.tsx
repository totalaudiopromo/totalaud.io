/**
 * Creative Score Preview
 * Phase 20 - Display composed CreativeScore
 */

'use client'

import { motion } from 'framer-motion'
import type { CreativeScore } from '@total-audio/agents/intent'
import { getScoreSummary } from '@total-audio/agents/intent'

interface CreativeScorePreviewProps {
  score: CreativeScore | null
}

export function CreativeScorePreview({ score }: CreativeScorePreviewProps) {
  if (!score) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-neutral-700 bg-neutral-900/30 p-12">
        <p className="text-sm text-neutral-500">
          Compose a score to see the creative plan
        </p>
      </div>
    )
  }

  const summary = getScoreSummary(score)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 rounded-lg border border-neutral-700 bg-neutral-900/50 p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-100">Creative Score</h2>
        <div className="text-xs text-neutral-500">{score.id}</div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg bg-neutral-800/50 p-3">
          <div className="text-xs text-neutral-500">Scenes</div>
          <div className="mt-1 text-xl font-bold text-cyan-400">{summary.sceneCount}</div>
        </div>
        <div className="rounded-lg bg-neutral-800/50 p-3">
          <div className="text-xs text-neutral-500">Avg Tempo</div>
          <div className="mt-1 text-xl font-bold text-purple-400">
            {summary.averageTempo}
          </div>
        </div>
        <div className="rounded-lg bg-neutral-800/50 p-3">
          <div className="text-xs text-neutral-500">Peak Tension</div>
          <div className="mt-1 text-xl font-bold text-red-400">
            {Math.round(summary.peakTension * 100)}%
          </div>
        </div>
        <div className="rounded-lg bg-neutral-800/50 p-3">
          <div className="text-xs text-neutral-500">Avg Cohesion</div>
          <div className="mt-1 text-xl font-bold text-green-400">
            {Math.round(summary.averageCohesion * 100)}%
          </div>
        </div>
        <div className="rounded-lg bg-neutral-800/50 p-3">
          <div className="text-xs text-neutral-500">Events</div>
          <div className="mt-1 text-xl font-bold text-amber-400">{summary.totalEvents}</div>
        </div>
        <div className="rounded-lg bg-neutral-800/50 p-3">
          <div className="text-xs text-neutral-500">Directives</div>
          <div className="mt-1 text-xl font-bold text-blue-400">
            {summary.totalDirectives}
          </div>
        </div>
      </div>

      {/* Profiles */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Sonic Profile */}
        <div className="rounded-lg bg-neutral-800/50 p-4">
          <div className="text-sm font-medium text-neutral-300">Sonic Profile</div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Density</span>
              <span className="font-mono text-cyan-400">
                {Math.round(score.sonicProfile.density * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Brightness</span>
              <span className="font-mono text-cyan-400">
                {Math.round(score.sonicProfile.brightness * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Rhythmic Complexity</span>
              <span className="font-mono text-cyan-400">
                {Math.round(score.sonicProfile.rhythmicComplexity * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Pad Intensity</span>
              <span className="font-mono text-cyan-400">
                {Math.round(score.sonicProfile.padIntensity * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Percussive Intensity</span>
              <span className="font-mono text-cyan-400">
                {Math.round(score.sonicProfile.percussiveIntensity * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Visual Profile */}
        <div className="rounded-lg bg-neutral-800/50 p-4">
          <div className="text-sm font-medium text-neutral-300">Visual Profile</div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Palette</span>
              <span className="font-mono capitalize text-purple-400">
                {score.visualProfile.palette}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Brightness</span>
              <span className="font-mono text-purple-400">
                {Math.round(score.visualProfile.brightness * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Contrast</span>
              <span className="font-mono text-purple-400">
                {Math.round(score.visualProfile.contrast * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Saturation</span>
              <span className="font-mono text-purple-400">
                {Math.round(score.visualProfile.saturation * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Bloom</span>
              <span className="font-mono text-purple-400">
                {Math.round(score.visualProfile.bloom * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenes Timeline */}
      <div className="rounded-lg bg-neutral-800/50 p-4">
        <div className="text-sm font-medium text-neutral-300">Scene Timeline</div>
        <div className="mt-4 space-y-3">
          {score.scenes.map((scene, i) => (
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-200">
                        {scene.description}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500">
                        {Math.floor(scene.startTime / 60)}:
                        {(scene.startTime % 60).toString().padStart(2, '0')} •{' '}
                        {scene.tempo} BPM • Lead: {scene.leadOS?.toUpperCase() || 'None'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-neutral-500">Tension</div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-700">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${scene.tension * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-500">Cohesion</div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-700">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${scene.cohesion * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-neutral-500">Density</div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-700">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${scene.density * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Event Timeline */}
      <div className="rounded-lg bg-neutral-800/50 p-4">
        <div className="text-sm font-medium text-neutral-300">
          Event Timeline ({score.eventTimeline.length} events)
        </div>
        <div className="mt-3 max-h-48 overflow-y-auto">
          <div className="space-y-2">
            {score.eventTimeline.map((event, i) => (
              <div
                key={event.id}
                className="flex items-center gap-3 rounded border border-neutral-700/50 bg-neutral-900/30 px-3 py-2 text-xs"
              >
                <div className="font-mono text-neutral-500">
                  {Math.floor(event.time / 60)}:
                  {(event.time % 60).toString().padStart(2, '0')}
                </div>
                <div className="flex-1 capitalize text-neutral-300">
                  {event.type.replace(/_/g, ' ')}
                </div>
                {event.targetOS && (
                  <div className="font-mono text-xs uppercase text-cyan-400">
                    {event.targetOS}
                  </div>
                )}
                <div className="text-neutral-500">
                  {Math.round(event.intensity * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
