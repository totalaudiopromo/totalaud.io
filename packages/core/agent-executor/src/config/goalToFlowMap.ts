/**
 * Goal to Flow Mapping
 *
 * Maps user promotional goals to pre-configured workflow templates.
 * When Broker completes onboarding, these templates are used to
 * auto-generate the first Flow Canvas with relevant nodes.
 *
 * Each flow step corresponds to a skill or agent action.
 */

export interface FlowStep {
  /** Unique identifier for this step */
  id: string

  /** Display label for the node */
  label: string

  /** Type of node (skill, agent, decision) */
  type: 'skill' | 'agent' | 'decision'

  /** Icon emoji */
  icon?: string

  /** Default position on canvas */
  position?: { x: number; y: number }

  /** Agent ID if type is 'agent' */
  agentId?: string

  /** Skill ID if type is 'skill' */
  skillId?: string

  /** Input parameters for execution */
  input?: Record<string, any>
}

export interface FlowTemplate {
  /** Template name */
  name: string

  /** Description of what this flow achieves */
  description: string

  /** Array of steps in execution order */
  steps: FlowStep[]

  /** Estimated time to complete */
  estimatedTime?: string

  /** Difficulty level */
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

/**
 * Goal-based flow templates
 *
 * Maps user goals (from Broker conversation) to pre-configured workflows
 */
export const goalToFlowMap: Record<string, FlowTemplate> = {
  // Radio airplay campaign
  'radio': {
    name: 'Radio Airplay Campaign',
    description: 'Research radio contacts, prepare your pitch, and send professional emails',
    estimatedTime: '2-3 hours',
    difficulty: 'intermediate',
    steps: [
      {
        id: 'research-radio-contacts',
        label: 'Research Radio Contacts',
        type: 'skill',
        icon: '🔍',
        skillId: 'research-contacts',
        position: { x: 100, y: 100 },
      },
      {
        id: 'score-contacts',
        label: 'Score Contact Relevance',
        type: 'skill',
        icon: '⭐',
        skillId: 'score-contacts',
        position: { x: 300, y: 100 },
      },
      {
        id: 'prep-pitch',
        label: 'Prepare Radio Pitch',
        type: 'skill',
        icon: '📝',
        skillId: 'generate-pitch',
        position: { x: 500, y: 100 },
      },
      {
        id: 'send-email',
        label: 'Send Pitch Emails',
        type: 'agent',
        icon: '📧',
        agentId: 'agent-scout',
        position: { x: 700, y: 100 },
      },
    ],
  },

  // Press coverage campaign
  'press': {
    name: 'Press Coverage Campaign',
    description: 'Find journalists, draft your press release, and pitch your story',
    estimatedTime: '3-4 hours',
    difficulty: 'intermediate',
    steps: [
      {
        id: 'research-journalists',
        label: 'Research Music Journalists',
        type: 'skill',
        icon: '🔍',
        skillId: 'research-contacts',
        position: { x: 100, y: 100 },
      },
      {
        id: 'draft-press-release',
        label: 'Draft Press Release',
        type: 'skill',
        icon: '📰',
        skillId: 'generate-pitch',
        position: { x: 300, y: 100 },
      },
      {
        id: 'personalize-pitches',
        label: 'Personalize Each Pitch',
        type: 'agent',
        icon: '✍️',
        agentId: 'agent-coach',
        position: { x: 500, y: 100 },
      },
      {
        id: 'send-pitches',
        label: 'Send Press Pitches',
        type: 'agent',
        icon: '📧',
        agentId: 'agent-scout',
        position: { x: 700, y: 100 },
      },
    ],
  },

  // Playlist placement campaign
  'playlists': {
    name: 'Playlist Placement Campaign',
    description: 'Find relevant playlists, research curators, and submit your track',
    estimatedTime: '2-3 hours',
    difficulty: 'beginner',
    steps: [
      {
        id: 'research-playlists',
        label: 'Find Relevant Playlists',
        type: 'skill',
        icon: '🎵',
        skillId: 'research-contacts',
        position: { x: 100, y: 100 },
      },
      {
        id: 'analyze-playlists',
        label: 'Analyze Playlist Fit',
        type: 'agent',
        icon: '📊',
        agentId: 'agent-insight',
        position: { x: 300, y: 100 },
      },
      {
        id: 'prep-submission',
        label: 'Prepare Submission',
        type: 'skill',
        icon: '📋',
        skillId: 'generate-pitch',
        position: { x: 500, y: 100 },
      },
      {
        id: 'submit-track',
        label: 'Submit to Curators',
        type: 'agent',
        icon: '🚀',
        agentId: 'agent-scout',
        position: { x: 700, y: 100 },
      },
    ],
  },

  // Live bookings campaign
  'live': {
    name: 'Live Bookings Campaign',
    description: 'Research venues and promoters, prepare your EPK, and pitch your live show',
    estimatedTime: '3-4 hours',
    difficulty: 'intermediate',
    steps: [
      {
        id: 'research-venues',
        label: 'Research Venues',
        type: 'skill',
        icon: '🎪',
        skillId: 'research-contacts',
        position: { x: 100, y: 100 },
      },
      {
        id: 'prep-epk',
        label: 'Prepare EPK',
        type: 'skill',
        icon: '📦',
        skillId: 'generate-pitch',
        position: { x: 300, y: 100 },
      },
      {
        id: 'pitch-venues',
        label: 'Pitch to Venues',
        type: 'agent',
        icon: '📧',
        agentId: 'agent-scout',
        position: { x: 500, y: 100 },
      },
    ],
  },

  // Comprehensive campaign (all of the above)
  'all': {
    name: 'Full Promotional Campaign',
    description: 'Comprehensive multi-channel campaign: radio, press, playlists, and live',
    estimatedTime: '8-10 hours',
    difficulty: 'advanced',
    steps: [
      {
        id: 'define-strategy',
        label: 'Define Campaign Strategy',
        type: 'agent',
        icon: '🎯',
        agentId: 'agent-coach',
        position: { x: 100, y: 100 },
      },
      {
        id: 'research-all-contacts',
        label: 'Research All Contacts',
        type: 'skill',
        icon: '🔍',
        skillId: 'research-contacts',
        position: { x: 300, y: 100 },
      },
      {
        id: 'branch-radio',
        label: 'Radio Campaign',
        type: 'decision',
        icon: '📻',
        position: { x: 500, y: 50 },
      },
      {
        id: 'branch-press',
        label: 'Press Campaign',
        type: 'decision',
        icon: '📰',
        position: { x: 500, y: 150 },
      },
      {
        id: 'branch-playlists',
        label: 'Playlist Campaign',
        type: 'decision',
        icon: '🎵',
        position: { x: 500, y: 250 },
      },
      {
        id: 'track-results',
        label: 'Track Campaign Results',
        type: 'agent',
        icon: '📊',
        agentId: 'agent-tracker',
        position: { x: 700, y: 150 },
      },
    ],
  },
}

/**
 * Normalize goal text to match template keys
 *
 * Handles variations like:
 * - "🎙️ Radio airplay" → "radio"
 * - "Press coverage" → "press"
 * - "📈 All of the above" → "all"
 */
export function normalizeGoal(goal: string): string {
  const normalized = goal.toLowerCase().trim()

  if (normalized.includes('radio')) return 'radio'
  if (normalized.includes('press')) return 'press'
  if (normalized.includes('playlist')) return 'playlists'
  if (normalized.includes('live') || normalized.includes('booking')) return 'live'
  if (normalized.includes('all')) return 'all'

  // Default to radio if no match
  return 'radio'
}

/**
 * Get flow template for a given goal
 */
export function getFlowTemplateForGoal(goal: string): FlowTemplate | null {
  const normalizedGoal = normalizeGoal(goal)
  return goalToFlowMap[normalizedGoal] || null
}

/**
 * Serialize flow template for URL param
 */
export function serializeFlowTemplate(template: FlowTemplate): string {
  return encodeURIComponent(JSON.stringify({
    name: template.name,
    steps: template.steps.map(s => ({
      id: s.id,
      label: s.label,
      type: s.type,
      icon: s.icon,
      position: s.position,
      agentId: s.agentId,
      skillId: s.skillId,
    })),
  }))
}

/**
 * Deserialize flow template from URL param
 */
export function deserializeFlowTemplate(serialized: string): FlowTemplate | null {
  try {
    return JSON.parse(decodeURIComponent(serialized))
  } catch (err) {
    console.error('[GoalToFlowMap] Error deserializing template:', err)
    return null
  }
}
