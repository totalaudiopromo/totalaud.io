import type { SkillExecutionResult } from '../types'

// Temporary mock — later, replace with real Audio Intel API call
export async function researchContactsCustom(input: {
  query: string
  type: 'playlist' | 'radio' | 'journalist' | 'curator' | 'blogger'
  genres: string[]
  regions: string[]
  max_results: number
}): Promise<SkillExecutionResult['output']> {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock data based on input
  const mockContacts = [
    {
      name: 'DJ Nova',
      email: 'dj.nova@indieradio.uk',
      outlet: 'Indie Wave FM',
      role: 'Radio Host',
      relevance_score: 0.93,
      genres: input.genres,
      regions: input.regions,
      notes: 'Prefers upbeat electronic submissions. Responds within 48hrs.',
      source_url: 'https://indiewave.fm/contact',
    },
    {
      name: 'Sarah Thompson',
      email: 'sarah@freshsounds.co.uk',
      outlet: 'Fresh Sounds Radio',
      role: 'Music Director',
      relevance_score: 0.89,
      genres: input.genres,
      regions: input.regions,
      notes: 'Focus on emerging artists. Best to submit Monday-Wednesday.',
      source_url: 'https://freshsounds.co.uk/submissions',
    },
    {
      name: 'Alex Rivera',
      email: 'alex@nightwaveradio.com',
      outlet: 'Nightwave Radio',
      role: 'Show Producer',
      relevance_score: 0.85,
      genres: input.genres,
      regions: input.regions,
      notes: 'Specializes in late-night electronic. Include Spotify links.',
      source_url: 'https://nightwaveradio.com/contact',
    },
  ].slice(0, input.max_results)

  return { contacts: mockContacts }
}
