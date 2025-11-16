/**
 * Onboarding helper logic
 * Determines what suggestions to show based on workspace state
 */

export interface WorkspaceState {
  hasNotes: boolean
  hasCoachMessages: boolean
  hasTimelineNodes: boolean
  hasDesignerScenes: boolean
  hasAgentRuns: boolean
}

export interface OnboardingSuggestion {
  id: string
  text: string
  priority: number
  surface: 'journal' | 'coach' | 'timeline' | 'designer' | 'agent'
}

export function getOnboardingSuggestions(state: WorkspaceState): OnboardingSuggestion[] {
  const suggestions: OnboardingSuggestion[] = []

  // Journal suggestion (highest priority if nothing exists)
  if (!state.hasNotes) {
    suggestions.push({
      id: 'first-note',
      text: 'Add your first note in the journal',
      priority: 3,
      surface: 'journal',
    })
  }

  // Coach suggestion
  if (!state.hasCoachMessages) {
    suggestions.push({
      id: 'try-coach',
      text: 'Try asking the coach something about your project',
      priority: 2,
      surface: 'coach',
    })
  }

  // Timeline suggestion
  if (!state.hasTimelineNodes) {
    suggestions.push({
      id: 'create-idea',
      text: 'Create a quick idea on the timeline',
      priority: 2,
      surface: 'timeline',
    })
  }

  // Designer suggestion (lower priority)
  if (!state.hasDesignerScenes) {
    suggestions.push({
      id: 'try-designer',
      text: 'Describe the feeling behind your project to generate visuals',
      priority: 1,
      surface: 'designer',
    })
  }

  // Agent suggestion
  if (!state.hasAgentRuns) {
    suggestions.push({
      id: 'run-agent',
      text: 'Run a quick agent with a prompt or idea',
      priority: 1,
      surface: 'agent',
    })
  }

  // Sort by priority (highest first)
  return suggestions.sort((a, b) => b.priority - a.priority)
}

export function getNextSuggestedAction(state: WorkspaceState): OnboardingSuggestion | null {
  const suggestions = getOnboardingSuggestions(state)
  return suggestions[0] || null
}

export function getSuggestedActionsForSurface(
  state: WorkspaceState,
  surface: OnboardingSuggestion['surface']
): OnboardingSuggestion | null {
  const suggestions = getOnboardingSuggestions(state)
  return suggestions.find((s) => s.surface === surface) || null
}

/**
 * Check if user should see onboarding nudges
 * Returns false if user has made meaningful progress
 */
export function shouldShowOnboarding(state: WorkspaceState): boolean {
  const activityCount =
    (state.hasNotes ? 1 : 0) +
    (state.hasCoachMessages ? 1 : 0) +
    (state.hasTimelineNodes ? 1 : 0) +
    (state.hasDesignerScenes ? 1 : 0) +
    (state.hasAgentRuns ? 1 : 0)

  // Show onboarding if less than 2 types of activity
  return activityCount < 2
}
