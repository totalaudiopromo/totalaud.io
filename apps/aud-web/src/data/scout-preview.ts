/**
 * Scout Preview Data
 *
 * Static preview opportunities shown to unauthenticated users.
 * These are representative examples, not real contact details.
 * Used to demonstrate value before requiring sign-in.
 */

import type { Opportunity } from '@/types/scout'

export const PREVIEW_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'preview-1',
    name: 'BBC Radio 1 Introducing',
    type: 'radio',
    genres: ['indie', 'alternative', 'electronic'],
    vibes: ['energetic', 'fresh'],
    audienceSize: 'large',
    link: 'https://bbc.co.uk/introducing',
    contactEmail: 'introducing@bbc.co.uk',
    contactName: 'Music Team',
    description:
      'UK national radio programme supporting unsigned and emerging artists. Excellent platform for breakthrough moments.',
    source: 'curated',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'preview-2',
    name: 'Pollen Playlist Curators',
    type: 'playlist',
    genres: ['pop', 'r&b', 'hip-hop'],
    vibes: ['vibey', 'smooth'],
    audienceSize: 'large',
    link: 'https://spotify.com',
    contactEmail: 'submissions@example.com',
    contactName: 'Editorial Team',
    description:
      'Spotify-owned playlist brand covering pop culture and emerging sounds. Strong influence on streaming performance.',
    source: 'curated',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'preview-3',
    name: 'The Line of Best Fit',
    type: 'blog',
    genres: ['indie', 'folk', 'singer-songwriter'],
    vibes: ['thoughtful', 'artistic'],
    audienceSize: 'medium',
    link: 'https://thelineofbestfit.com',
    contactEmail: 'music@example.com',
    contactName: 'Reviews Editor',
    description:
      'Influential UK music blog known for championing emerging talent. Features, reviews, and exclusive premieres.',
    source: 'curated',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'preview-4',
    name: 'Indie Shuffle Curator',
    type: 'curator',
    genres: ['indie', 'dream-pop', 'shoegaze'],
    vibes: ['atmospheric', 'dreamy'],
    audienceSize: 'medium',
    link: 'https://indieshuffle.com',
    contactEmail: 'curator@example.com',
    contactName: 'Alex Mitchell',
    description:
      'Independent tastemaker with a dedicated following. Specialises in discovering hidden gems before they break.',
    source: 'curated',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'preview-5',
    name: 'NME Magazine',
    type: 'press',
    genres: ['rock', 'alternative', 'indie'],
    vibes: ['bold', 'iconic'],
    audienceSize: 'large',
    link: 'https://nme.com',
    contactEmail: 'press@example.com',
    contactName: 'Features Desk',
    description:
      'Legendary music publication with global reach. Print and digital coverage of emerging and established artists.',
    source: 'curated',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
]
