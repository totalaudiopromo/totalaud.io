/**
 * Creative Score Exporter
 * Phase 20 - Export CreativeScore to various formats
 */

import type { CreativeScore, CreativeScene, CreativeEvent } from './intent.types'

/**
 * Export CreativeScore as JSON
 */
export function exportCreativeScoreJSON(score: CreativeScore): string {
  return JSON.stringify(score, null, 2)
}

/**
 * Export CreativeScore as Markdown
 */
export function exportCreativeScoreMarkdown(score: CreativeScore): string {
  const lines: string[] = []

  // Header
  lines.push('# Creative Score')
  lines.push('')
  lines.push(`**ID:** ${score.id}`)
  lines.push(`**Created:** ${new Date(score.createdAt).toLocaleString('en-GB')}`)
  lines.push(`**Duration:** ${score.duration}s (${formatDuration(score.duration)})`)
  lines.push('')

  // Source Intent (if available)
  if (score.sourceIntent) {
    lines.push('## Source Intent')
    lines.push('')
    lines.push(`- **Style:** ${score.sourceIntent.style}`)
    lines.push(`- **Arc:** ${score.sourceIntent.arc}`)
    lines.push(`- **Palette:** ${score.sourceIntent.palette}`)
    lines.push(`- **Lead OS:** ${score.sourceIntent.leadOS || 'None'}`)
    lines.push(`- **Resisting OS:** ${score.sourceIntent.resistingOS || 'None'}`)
    lines.push('')
    if (score.sourceIntent.keywords.length > 0) {
      lines.push(`**Keywords:** ${score.sourceIntent.keywords.join(', ')}`)
      lines.push('')
    }
  }

  // Sonic Profile
  lines.push('## Sonic Profile')
  lines.push('')
  lines.push(`- **Style:** ${score.sonicProfile.style}`)
  lines.push(`- **Density:** ${formatPercent(score.sonicProfile.density)}`)
  lines.push(`- **Brightness:** ${formatPercent(score.sonicProfile.brightness)}`)
  lines.push(
    `- **Rhythmic Complexity:** ${formatPercent(score.sonicProfile.rhythmicComplexity)}`
  )
  lines.push(`- **Pad Intensity:** ${formatPercent(score.sonicProfile.padIntensity)}`)
  lines.push(
    `- **Percussive Intensity:** ${formatPercent(score.sonicProfile.percussiveIntensity)}`
  )
  lines.push('')

  // Visual Profile
  lines.push('## Visual Profile')
  lines.push('')
  lines.push(`- **Palette:** ${score.visualProfile.palette}`)
  lines.push(`- **Brightness:** ${formatPercent(score.visualProfile.brightness)}`)
  lines.push(`- **Contrast:** ${formatPercent(score.visualProfile.contrast)}`)
  lines.push(`- **Saturation:** ${formatPercent(score.visualProfile.saturation)}`)
  lines.push(`- **Vignette:** ${formatPercent(score.visualProfile.vignette)}`)
  lines.push(`- **Bloom:** ${formatPercent(score.visualProfile.bloom)}`)
  lines.push(
    `- **Colour Bias:** R:${formatBias(score.visualProfile.colourBias.red)} G:${formatBias(score.visualProfile.colourBias.green)} B:${formatBias(score.visualProfile.colourBias.blue)}`
  )
  lines.push('')

  // Tempo Curve
  lines.push('## Tempo Curve')
  lines.push('')
  lines.push(`\`\`\``)
  lines.push(score.tempoCurve.map((t) => `${t} BPM`).join(' → '))
  lines.push(`\`\`\``)
  lines.push('')

  // Scenes
  lines.push('## Scenes')
  lines.push('')
  score.scenes.forEach((scene, i) => {
    lines.push(`### Scene ${i + 1}: ${scene.description}`)
    lines.push('')
    lines.push(`- **Time:** ${formatTime(scene.startTime)} - ${formatTime(scene.startTime + scene.duration)}`)
    lines.push(`- **Duration:** ${scene.duration}s`)
    lines.push(`- **Tempo:** ${scene.tempo} BPM`)
    lines.push(`- **Tension:** ${formatPercent(scene.tension)}`)
    lines.push(`- **Cohesion:** ${formatPercent(scene.cohesion)}`)
    lines.push(`- **Density:** ${formatPercent(scene.density)}`)
    lines.push(`- **Emotional Intensity:** ${formatPercent(scene.emotionalIntensity)}`)
    lines.push(`- **Lead OS:** ${scene.leadOS || 'None'}`)
    lines.push(`- **Resisting OS:** ${scene.resistingOS || 'None'}`)
    if (scene.supportingOS.length > 0) {
      lines.push(`- **Supporting OS:** ${scene.supportingOS.join(', ')}`)
    }
    lines.push('')
  })

  // Event Timeline
  lines.push('## Event Timeline')
  lines.push('')
  if (score.eventTimeline.length === 0) {
    lines.push('_No events scheduled_')
    lines.push('')
  } else {
    lines.push('| Time | Type | Intensity | Target OS |')
    lines.push('|------|------|-----------|-----------|')
    score.eventTimeline.forEach((event) => {
      lines.push(
        `| ${formatTime(event.time)} | ${formatEventType(event.type)} | ${formatPercent(event.intensity)} | ${event.targetOS || '-'} |`
      )
    })
    lines.push('')
  }

  // Behaviour Directives Summary
  lines.push('## Behaviour Directives Summary')
  lines.push('')
  Object.entries(score.behaviourDirectivesByOS).forEach(([osName, directives]) => {
    if (directives.length > 0) {
      lines.push(`### ${osName.toUpperCase()}`)
      lines.push('')
      lines.push(`**Total Directives:** ${directives.length}`)
      lines.push('')

      // Group by action type
      const groupedByAction = directives.reduce(
        (acc, d) => {
          if (!acc[d.action]) {
            acc[d.action] = []
          }
          acc[d.action].push(d)
          return acc
        },
        {} as Record<string, typeof directives>
      )

      Object.entries(groupedByAction).forEach(([action, actionDirectives]) => {
        lines.push(`- **${formatActionType(action)}:** ${actionDirectives.length} times`)
      })

      lines.push('')
    }
  })

  // Statistics
  const totalDirectives = Object.values(score.behaviourDirectivesByOS).reduce(
    (sum, d) => sum + d.length,
    0
  )

  lines.push('## Statistics')
  lines.push('')
  lines.push(`- **Total Scenes:** ${score.scenes.length}`)
  lines.push(`- **Total Events:** ${score.eventTimeline.length}`)
  lines.push(`- **Total Directives:** ${totalDirectives}`)
  lines.push(`- **Average Tempo:** ${Math.round(score.tempoCurve.reduce((a, b) => a + b, 0) / score.tempoCurve.length)} BPM`)
  lines.push(
    `- **Peak Tension:** ${formatPercent(Math.max(...score.scenes.map((s) => s.tension)))}`
  )
  lines.push(
    `- **Average Cohesion:** ${formatPercent(score.scenes.reduce((sum, s) => sum + s.cohesion, 0) / score.scenes.length)}`
  )
  lines.push('')

  // Footer
  lines.push('---')
  lines.push('')
  lines.push('_Generated by totalaud.io Intent Engine (Phase 20)_')
  lines.push('')

  return lines.join('\n')
}

/**
 * Export CreativeScore as CSV (scenes)
 */
export function exportCreativeScoreCSV(score: CreativeScore): string {
  const lines: string[] = []

  // Header
  lines.push(
    'Scene,Start Time,Duration,Tempo,Tension,Cohesion,Density,Emotional Intensity,Lead OS,Resisting OS,Description'
  )

  // Scenes
  score.scenes.forEach((scene, i) => {
    lines.push(
      [
        i + 1,
        scene.startTime,
        scene.duration,
        scene.tempo,
        scene.tension.toFixed(2),
        scene.cohesion.toFixed(2),
        scene.density.toFixed(2),
        scene.emotionalIntensity.toFixed(2),
        scene.leadOS || '',
        scene.resistingOS || '',
        `"${scene.description}"`,
      ].join(',')
    )
  })

  return lines.join('\n')
}

/**
 * Format duration in MM:SS
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format time in MM:SS
 */
function formatTime(seconds: number): string {
  return formatDuration(seconds)
}

/**
 * Format percentage (0-1 to 0-100%)
 */
function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

/**
 * Format bias (-1 to 1 with sign)
 */
function formatBias(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}`
}

/**
 * Format event type for display
 */
function formatEventType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format action type for display
 */
function formatActionType(action: string): string {
  return action
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Download score as file in browser
 */
export function downloadCreativeScore(
  score: CreativeScore,
  format: 'json' | 'markdown' | 'csv' = 'json'
): void {
  let content: string
  let filename: string
  let mimeType: string

  switch (format) {
    case 'json':
      content = exportCreativeScoreJSON(score)
      filename = `creative-score-${score.id}.json`
      mimeType = 'application/json'
      break

    case 'markdown':
      content = exportCreativeScoreMarkdown(score)
      filename = `creative-score-${score.id}.md`
      mimeType = 'text/markdown'
      break

    case 'csv':
      content = exportCreativeScoreCSV(score)
      filename = `creative-score-${score.id}.csv`
      mimeType = 'text/csv'
      break
  }

  // Create blob and download
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
