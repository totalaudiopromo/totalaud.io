import type { PitchSection, PitchType } from '@/types/pitch'

export function buildPitchMarkdown(sections: PitchSection[], type: PitchType): string {
  const typeLabels: Record<PitchType, string> = {
    radio: 'Radio Pitch',
    press: 'Press Release',
    playlist: 'Playlist Pitch',
    custom: 'Custom Pitch',
  }

  const lines = [
    `# ${typeLabels[type]}`,
    '',
    `*Generated on ${new Date().toLocaleDateString('en-GB')}*`,
    '',
  ]

  for (const section of sections) {
    if (section.content.trim()) {
      lines.push(`## ${section.title}`, '', section.content.trim(), '')
    }
  }

  return lines.join('\n')
}

export function buildPitchPlainText(sections: PitchSection[], type: PitchType): string {
  const typeLabels: Record<PitchType, string> = {
    radio: 'RADIO PITCH',
    press: 'PRESS RELEASE',
    playlist: 'PLAYLIST PITCH',
    custom: 'CUSTOM PITCH',
  }

  const lines = [typeLabels[type], '='.repeat(typeLabels[type].length), '']

  for (const section of sections) {
    if (section.content.trim()) {
      lines.push(section.title.toUpperCase(), '-'.repeat(section.title.length), '')
      lines.push(section.content.trim(), '')
    }
  }

  return lines.join('\n')
}
