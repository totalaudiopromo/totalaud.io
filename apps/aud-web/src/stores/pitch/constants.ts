import type { PitchSection } from '@/types/pitch'

export const DEFAULT_SECTIONS: PitchSection[] = [
  {
    id: 'hook',
    title: 'The Hook',
    content: '',
    placeholder:
      'Start with something memorable - a striking fact, an emotional moment, or a bold statement about your music.',
  },
  {
    id: 'story',
    title: 'Your Story',
    content: '',
    placeholder: 'Share the journey behind this release. What inspired it? What makes it personal?',
  },
  {
    id: 'sound',
    title: 'The Sound',
    content: '',
    placeholder:
      'Describe your sound using reference points listeners will recognise. "If X met Y in a dimly lit studio..."',
  },
  {
    id: 'traction',
    title: 'Proof Points',
    content: '',
    placeholder:
      'Include any relevant achievements: streams, radio plays, notable support, press coverage.',
  },
  {
    id: 'ask',
    title: 'The Ask',
    content: '',
    placeholder:
      'Be specific about what you want: airplay, review, playlist inclusion. Make it easy to say yes.',
  },
]
