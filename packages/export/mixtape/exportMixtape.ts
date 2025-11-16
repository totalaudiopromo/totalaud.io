/**
 * Campaign Mixtape Export
 * Exports timeline + cards into a shareable HTML page styled like a Spotify playlist
 */

import type { MixtapeData, MixtapeExportConfig } from '@totalaud/os-state/campaign'

export function generateMixtapeHTML(data: MixtapeData): string {
  const { campaign, timeline, cards, agentInsights, loopInsights, exportConfig } = data

  const themeColours = {
    ascii: { accent: '#00ff99', bg: '#000000', fg: '#00ff99' },
    xp: { accent: '#3478f6', bg: '#d7e8ff', fg: '#1a1a1a' },
    aqua: { accent: '#3b82f6', bg: '#e5e7eb', fg: '#1f2937' },
    daw: { accent: '#ff8000', bg: '#111111', fg: '#e0e0e0' },
    analogue: { accent: '#ff1aff', bg: '#0f0f0f', fg: '#ffffff' },
  }

  const theme = themeColours[exportConfig.theme]

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${exportConfig.title} - Campaign Mixtape</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, ${theme.bg} 0%, ${theme.accent}20 100%);
      color: ${theme.fg};
      min-height: 100vh;
      padding: 2rem;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .header h1 {
      font-size: 3rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, ${theme.accent}, ${theme.fg});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header p {
      color: ${theme.fg};
      opacity: 0.7;
      font-size: 1.1rem;
    }

    .meta {
      background: ${theme.accent}15;
      border: 2px solid ${theme.accent};
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid ${theme.accent}30;
    }

    .meta-row:last-child {
      border-bottom: none;
    }

    .meta-label {
      font-weight: 600;
      opacity: 0.8;
    }

    .timeline {
      background: ${theme.bg}cc;
      backdrop-filter: blur(10px);
      border: 2px solid ${theme.accent};
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .timeline h2 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      color: ${theme.accent};
    }

    .clip {
      background: ${theme.accent}20;
      border-left: 4px solid ${theme.accent};
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .clip:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px ${theme.accent}40;
    }

    .clip-header {
      display: flex;
      justify-content: space-between;
      align-items: centre;
      margin-bottom: 0.5rem;
    }

    .clip-name {
      font-weight: 700;
      font-size: 1.1rem;
    }

    .clip-time {
      font-family: 'Courier New', monospace;
      opacity: 0.7;
      font-size: 0.9rem;
    }

    .clip-agent {
      display: inline-block;
      background: ${theme.accent};
      color: ${theme.bg};
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 0.5rem;
    }

    .cards-section {
      background: ${theme.bg}cc;
      backdrop-filter: blur(10px);
      border: 2px solid ${theme.accent};
      border-radius: 12px;
      padding: 2rem;
    }

    .cards-section h2 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      color: ${theme.accent};
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .card {
      background: linear-gradient(135deg, var(--card-colour) 0%, var(--card-colour)cc 100%);
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s;
    }

    .card:hover {
      transform: translateY(-4px);
    }

    .card-type {
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
      opacity: 0.9;
    }

    .card-content {
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .card-timestamp {
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      opacity: 0.7;
    }

    .footer {
      text-align: centre;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid ${theme.accent}30;
      opacity: 0.6;
      font-size: 0.9rem;
    }

    @media print {
      body {
        background: white;
        color: black;
      }
      .clip, .card {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>${exportConfig.title}</h1>
      ${exportConfig.description ? `<p>${exportConfig.description}</p>` : ''}
    </div>

    <!-- Campaign Meta -->
    <div class="meta">
      <div class="meta-row">
        <span class="meta-label">Campaign Name</span>
        <span>${campaign.name}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Goal</span>
        <span>${campaign.goal}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Theme</span>
        <span>${exportConfig.theme.toUpperCase()}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Exported</span>
        <span>${new Date(data.exportedAt).toLocaleDateString()}</span>
      </div>
    </div>

    <!-- Timeline -->
    <div class="timeline">
      <h2>📼 Campaign Timeline (${timeline.clips.length} clips)</h2>
      ${timeline.clips
        .sort((a, b) => a.startTime - b.startTime)
        .map(
          (clip) => `
        <div class="clip">
          <div class="clip-header">
            <span class="clip-name">${clip.name}</span>
            <span class="clip-time">${formatTime(clip.startTime)} - ${formatTime(clip.startTime + clip.duration)}</span>
          </div>
          ${clip.agentSource ? `<span class="clip-agent">${clip.agentSource}</span>` : ''}
          ${
            exportConfig.includeCards && clip.cardLinks.length > 0
              ? `<div style="margin-top: 0.5rem; opacity: 0.7; font-size: 0.85rem;">🔗 ${clip.cardLinks.length} card(s) linked</div>`
              : ''
          }
        </div>
      `
        )
        .join('')}
    </div>

    <!-- Cards -->
    ${
      exportConfig.includeCards && cards && cards.length > 0
        ? `
    <div class="cards-section">
      <h2>💭 Story Cards (${cards.length})</h2>
      <div class="cards-grid">
        ${cards
          .map(
            (card) => `
          <div class="card" style="--card-colour: ${card.colour}">
            <div class="card-type">${card.type}</div>
            <div class="card-content">${card.content}</div>
            ${exportConfig.includeTimestamps ? `<div class="card-timestamp">${new Date(card.timestamp).toLocaleString()}</div>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
    </div>
    `
        : ''
    }

    <!-- Agent Insights -->
    ${
      agentInsights
        ? `
    <div class="agent-insights" style="background: ${theme.bg}cc; backdrop-filter: blur(10px); border: 2px solid ${theme.accent}; border-radius: 12px; padding: 2rem; margin-top: 2rem;">
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: ${theme.accent};">🤖 Agent Insights</h2>

      <!-- Performance Stats -->
      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.2rem; margin-bottom: 1rem; opacity: 0.9;">Performance Overview</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div style="background: ${theme.accent}15; padding: 1rem; border-radius: 8px; text-align: centre;">
            <div style="font-size: 2rem; font-weight: bold; color: ${theme.accent};">${agentInsights.totalExecutions}</div>
            <div style="opacity: 0.7; font-size: 0.9rem; margin-top: 0.25rem;">Total Executions</div>
          </div>
          ${Object.entries(agentInsights.agentBreakdown)
            .map(
              ([agent, stats]) => `
            <div style="background: ${theme.accent}15; padding: 1rem; border-radius: 8px; text-align: centre;">
              <div style="font-weight: 700; text-transform: uppercase; font-size: 0.9rem; margin-bottom: 0.5rem; color: ${theme.accent};">${agent}</div>
              <div style="font-size: 1.5rem; font-weight: bold;">${stats.executions}</div>
              <div style="opacity: 0.7; font-size: 0.85rem; margin-top: 0.25rem;">${Math.round(stats.successRate * 100)}% success</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Bottlenecks -->
      ${
        agentInsights.bottlenecks.length > 0
          ? `
      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.2rem; margin-bottom: 1rem; opacity: 0.9;">Detected Bottlenecks</h3>
        ${agentInsights.bottlenecks
          .map(
            (bottleneck) => `
          <div style="background: ${bottleneck.severity === 'high' ? '#EF444420' : theme.accent + '15'}; border-left: 4px solid ${bottleneck.severity === 'high' ? '#EF4444' : bottleneck.severity === 'medium' ? '#F59E0B' : theme.accent}; padding: 1rem; margin-bottom: 0.75rem; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: centre; margin-bottom: 0.5rem;">
              <span style="font-weight: 700; text-transform: capitalize;">${bottleneck.type.replace(/_/g, ' ')}</span>
              <span style="background: ${bottleneck.severity === 'high' ? '#EF4444' : bottleneck.severity === 'medium' ? '#F59E0B' : theme.accent}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${bottleneck.severity}</span>
            </div>
            <div style="opacity: 0.85; font-size: 0.9rem;">${bottleneck.description}</div>
          </div>
        `
          )
          .join('')}
      </div>
      `
          : ''
      }

      <!-- Recommendations -->
      ${
        agentInsights.recommendations.length > 0
          ? `
      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.2rem; margin-bottom: 1rem; opacity: 0.9;">Agent Recommendations</h3>
        ${agentInsights.recommendations
          .map(
            (rec) => `
          <div style="background: ${theme.accent}15; border: 1px solid ${theme.accent}40; padding: 1rem; margin-bottom: 0.75rem; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
              <span style="font-weight: 700; font-size: 1.05rem;">${rec.title}</span>
              <div style="display: flex; gap: 0.5rem; align-items: centre;">
                <span style="background: ${rec.impact === 'high' ? '#10B981' : rec.impact === 'medium' ? '#F59E0B' : theme.accent}; color: white; padding: 0.2rem 0.6rem; border-radius: 8px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase;">Impact: ${rec.impact}</span>
                <span style="background: ${theme.accent}; color: ${theme.bg}; padding: 0.2rem 0.6rem; border-radius: 8px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase;">${rec.agent}</span>
              </div>
            </div>
            <div style="opacity: 0.85; font-size: 0.9rem; line-height: 1.5;">${rec.description}</div>
          </div>
        `
          )
          .join('')}
      </div>
      `
          : ''
      }

      <!-- Emotional Journey -->
      ${
        agentInsights.emotionalJourney.length > 0
          ? `
      <div>
        <h3 style="font-size: 1.2rem; margin-bottom: 1rem; opacity: 0.9;">Emotional Journey</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
          ${agentInsights.emotionalJourney
            .map(
              (emotion) => `
            <div style="background: ${theme.accent}15; padding: 1rem; border-radius: 8px; text-align: centre; position: relative;">
              <div style="font-weight: 700; text-transform: capitalize; margin-bottom: 0.5rem;">${emotion.emotion}</div>
              <div style="font-size: 1.8rem; font-weight: bold; color: ${theme.accent}; margin-bottom: 0.25rem;">${emotion.count}</div>
              <div style="font-size: 0.75rem; opacity: 0.7; text-transform: uppercase;">
                ${emotion.trend === 'increasing' ? '↗ Growing' : emotion.trend === 'decreasing' ? '↘ Declining' : '→ Stable'}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
      `
          : ''
      }
    </div>
    `
        : ''
    }

    <!-- Loop Insights -->
    ${
      loopInsights
        ? `
    <div class="loop-insights" style="background: ${theme.bg}cc; backdrop-filter: blur(10px); border: 2px solid ${theme.accent}; border-radius: 12px; padding: 2rem; margin-top: 2rem;">
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: ${theme.accent};">🔁 Autonomous Loop Insights</h2>

      <!-- Loop Overview -->
      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.2rem; margin-bottom: 1rem; opacity: 0.9;">Loop Overview</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div style="background: ${theme.accent}15; padding: 1rem; border-radius: 8px; text-align: centre;">
            <div style="font-size: 2rem; font-weight: bold; color: ${theme.accent};">${loopInsights.totalLoops}</div>
            <div style="opacity: 0.7; font-size: 0.9rem; margin-top: 0.25rem;">Total Loops</div>
          </div>
          <div style="background: ${theme.accent}15; padding: 1rem; border-radius: 8px; text-align: centre;">
            <div style="font-size: 2rem; font-weight: bold; color: ${theme.accent};">${loopInsights.activeLoops}</div>
            <div style="opacity: 0.7; font-size: 0.9rem; margin-top: 0.25rem;">Active Loops</div>
          </div>
          <div style="background: ${theme.accent}15; padding: 1rem; border-radius: 8px; text-align: centre;">
            <div style="font-size: 2rem; font-weight: bold; color: ${loopInsights.loopHealthScore >= 80 ? '#51CF66' : loopInsights.loopHealthScore >= 60 ? '#F59E0B' : '#EF4444'};">${loopInsights.loopHealthScore}%</div>
            <div style="opacity: 0.7; font-size: 0.9rem; margin-top: 0.25rem;">Health Score</div>
          </div>
        </div>
      </div>

      <!-- Loop Breakdown by Agent -->
      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.2rem; margin-bottom: 1rem; opacity: 0.9;">Loop Breakdown by Agent</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          ${Object.entries(loopInsights.loopBreakdown)
            .map(
              ([agent, stats]) => `
            <div style="background: ${theme.accent}15; padding: 1rem; border-radius: 8px; text-align: centre;">
              <div style="font-weight: 700; text-transform: uppercase; font-size: 0.9rem; margin-bottom: 0.5rem; color: ${theme.accent};">${agent}</div>
              <div style="font-size: 1.5rem; font-weight: bold;">${stats.loops}</div>
              <div style="opacity: 0.7; font-size: 0.85rem; margin-top: 0.25rem;">${Math.round(stats.successRate * 100)}% success</div>
              ${stats.lastRun ? `<div style="opacity: 0.6; font-size: 0.75rem; margin-top: 0.25rem; font-family: monospace;">Last: ${new Date(stats.lastRun).toLocaleDateString()}</div>` : ''}
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Loop Suggestions Summary -->
      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.2rem; margin-bottom: 1rem; opacity: 0.9;">Loop Suggestions</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
          <div style="background: ${theme.accent}15; border-left: 4px solid #F59E0B; padding: 1rem; border-radius: 8px;">
            <div style="font-size: 1.8rem; font-weight: bold; color: #F59E0B;">${loopInsights.suggestions.pending}</div>
            <div style="opacity: 0.7; font-size: 0.85rem; margin-top: 0.25rem; text-transform: uppercase;">Pending</div>
          </div>
          <div style="background: ${theme.accent}15; border-left: 4px solid #51CF66; padding: 1rem; border-radius: 8px;">
            <div style="font-size: 1.8rem; font-weight: bold; color: #51CF66;">${loopInsights.suggestions.accepted}</div>
            <div style="opacity: 0.7; font-size: 0.85rem; margin-top: 0.25rem; text-transform: uppercase;">Accepted</div>
          </div>
          <div style="background: ${theme.accent}15; border-left: 4px solid #6B7280; padding: 1rem; border-radius: 8px;">
            <div style="font-size: 1.8rem; font-weight: bold; color: #6B7280;">${loopInsights.suggestions.declined}</div>
            <div style="opacity: 0.7; font-size: 0.85rem; margin-top: 0.25rem; text-transform: uppercase;">Declined</div>
          </div>
        </div>
      </div>

      <!-- Recent Loop Events -->
      ${
        loopInsights.recentEvents.length > 0
          ? `
      <div>
        <h3 style="font-size: 1.2rem; margin-bottom: 1rem; opacity: 0.9;">Recent Loop Events</h3>
        <div style="max-height: 300px; overflow-y: auto;">
          ${loopInsights.recentEvents
            .slice(0, 10)
            .map(
              (event) => `
            <div style="background: ${event.success ? theme.accent + '15' : '#EF444415'}; border-left: 4px solid ${event.success ? theme.accent : '#EF4444'}; padding: 0.75rem; margin-bottom: 0.5rem; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: centre; margin-bottom: 0.25rem;">
                <div style="display: flex; gap: 0.5rem; align-items: centre;">
                  <span style="background: ${theme.accent}; color: ${theme.bg}; padding: 0.2rem 0.6rem; border-radius: 8px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase;">${event.agent}</span>
                  <span style="font-weight: 600; text-transform: capitalize;">${event.loopType}</span>
                </div>
                <span style="font-family: monospace; font-size: 0.75rem; opacity: 0.7;">${new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
              <div style="opacity: 0.85; font-size: 0.85rem;">${event.message}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
      `
          : ''
      }
    </div>
    `
        : ''
    }

    <!-- Fusion Insights -->
    ${
      data.fusionInsights && data.fusionInsights.totalSessions > 0
        ? `
    <div class="fusion-insights" style="background: ${theme.bg}cc; backdrop-filter: blur(10px); border: 2px solid ${theme.accent}; border-radius: 12px; padding: 2rem; margin-top: 2rem;">
      <h2 style="font-size: 1.5rem; margin-bottom: 1.5rem; color: ${theme.accent};">✨ Fusion Mode Insights</h2>

      <!-- Session Count -->
      <div style="margin-bottom: 2rem; text-align: centre;">
        <div style="font-size: 2.5rem; font-weight: bold; color: ${theme.accent};">${data.fusionInsights.totalSessions}</div>
        <div style="opacity: 0.7; font-size: 0.9rem; margin-top: 0.25rem;">Multi-OS Collaboration Sessions</div>
      </div>

      <!-- Multi-OS Story -->
      ${
        data.fusionInsights.multiOSStory
          ? `
      <div style="margin-bottom: 2rem; padding: 1.5rem; background: ${theme.accent}15; border-radius: 12px; border-left: 4px solid ${theme.accent};">
        <h3 style="font-size: 1.2rem; margin-bottom: 1rem; opacity: 0.9;">The Multi-OS Journey</h3>
        <p style="line-height: 1.8; opacity: 0.9;">${data.fusionInsights.multiOSStory}</p>
      </div>
      `
          : ''
      }

      <!-- Top Recommendations -->
      ${
        data.fusionInsights.topRecommendations && data.fusionInsights.topRecommendations.length > 0
          ? `
      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.2rem; margin-bottom: 1rem; opacity: 0.9;">Unified Recommendations</h3>
        <div style="display: grid; gap: 0.75rem;">
          ${data.fusionInsights.topRecommendations
            .map(
              (rec, index) => `
            <div style="display: flex; gap: 1rem; align-items: start; padding: 1rem; background: ${theme.accent}10; border-radius: 8px; border-left: 3px solid ${theme.accent};">
              <div style="font-size: 1.5rem; font-weight: bold; color: ${theme.accent}; min-width: 2rem;">${index + 1}</div>
              <div style="flex: 1; opacity: 0.9;">${rec}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
      `
          : ''
      }

      <!-- Fusion Card Summary -->
      ${
        data.fusionInsights.fusionCardSummary
          ? `
      <div style="padding: 1.5rem; background: linear-gradient(135deg, ${theme.accent}20 0%, ${theme.accent}10 100%); border-radius: 12px; border: 1px solid ${theme.accent}40;">
        <h3 style="font-size: 1.2rem; margin-bottom: 1rem; color: ${theme.accent};">Synthesis Card</h3>
        <p style="line-height: 1.6; opacity: 0.9;">${data.fusionInsights.fusionCardSummary}</p>
      </div>
      `
          : ''
      }
    </div>
    `
        : ''
    }

    <!-- Footer -->
    <div class="footer">
      <p>Generated by totalaud.io • Campaign Mixtape Export</p>
      <p>Your cinematic AI-driven creative OS</p>
    </div>
  </div>
</body>
</html>

<script>
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ':' + secs.toString().padStart(2, '0');
}
</script>
`

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
}

/**
 * Download mixtape as HTML file
 */
export function downloadMixtape(data: MixtapeData) {
  const html = generateMixtapeHTML(data)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${data.exportConfig.title.replace(/\s+/g, '-').toLowerCase()}-mixtape.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
