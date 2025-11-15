/**
 * Campaign Mixtape Export
 * Exports timeline + cards into a shareable HTML page styled like a Spotify playlist
 */

import type { MixtapeData, MixtapeExportConfig } from '@totalaud/os-state/campaign'

export function generateMixtapeHTML(data: MixtapeData): string {
  const { campaign, timeline, cards, exportConfig } = data

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
