/**
 * Dashboard Modes
 * Context-switching ribbon for unified dashboard
 */

import type { FusionContext } from '@total-audio/fusion-layer'

export type DashboardMode = 'campaign' | 'contact' | 'scene' | 'creative' | 'performance' | 'team'

export interface ModeDefinition {
  id: DashboardMode
  name: string
  description: string
  icon: string
  color: string
  panels: string[]
  quickActions: QuickAction[]
}

export interface QuickAction {
  id: string
  label: string
  action: string
  icon: string
}

export interface ModeContext {
  mode: DashboardMode
  filteredContext: Partial<FusionContext>
  visiblePanels: string[]
  priorityOrder: string[]
  quickActions: QuickAction[]
}

// Mode definitions
export const DASHBOARD_MODES: Record<DashboardMode, ModeDefinition> = {
  campaign: {
    id: 'campaign',
    name: 'Campaign Mode',
    description: 'Focus on active campaigns and execution',
    icon: 'rocket',
    color: '#3AA9BE',
    panels: ['tracker', 'email', 'trajectory', 'signal-threads', 'automations'],
    quickActions: [
      { id: 'new-campaign', label: 'New Campaign', action: 'create_campaign', icon: 'plus' },
      { id: 'send-pitch', label: 'Send Pitch', action: 'send_pitch', icon: 'send' },
      { id: 'track-coverage', label: 'Track Coverage', action: 'track_coverage', icon: 'eye' },
    ],
  },

  contact: {
    id: 'contact',
    name: 'Contact Mode',
    description: 'Focus on contact intelligence and relationships',
    icon: 'users',
    color: '#8B5CF6',
    panels: ['intel', 'contact-intel', 'reply-intel', 'automations'],
    quickActions: [
      { id: 'find-contacts', label: 'Find Contacts', action: 'suggest_contacts', icon: 'search' },
      { id: 'clean-list', label: 'Clean List', action: 'clean_segments', icon: 'trash' },
      { id: 'enrich-contact', label: 'Enrich Contact', action: 'enrich_contact', icon: 'sparkles' },
    ],
  },

  scene: {
    id: 'scene',
    name: 'Scene Mode',
    description: 'Focus on scene positioning and community',
    icon: 'compass',
    color: '#F59E0B',
    panels: ['community', 'coverage-fusion', 'identity', 'signal-threads'],
    quickActions: [
      { id: 'view-map', label: 'View Coverage Map', action: 'view_coverage_map', icon: 'map' },
      {
        id: 'scene-report',
        label: 'Scene Report',
        action: 'generate_scene_report',
        icon: 'file-text',
      },
      { id: 'find-scenes', label: 'Find Scenes', action: 'find_scenes', icon: 'target' },
    ],
  },

  creative: {
    id: 'creative',
    name: 'Creative Mode',
    description: 'Focus on creative work and analysis',
    icon: 'palette',
    color: '#EC4899',
    panels: ['assets', 'identity', 'correlation', 'writers-room', 'presskit'],
    quickActions: [
      { id: 'upload-asset', label: 'Upload Asset', action: 'upload_asset', icon: 'upload' },
      { id: 'generate-copy', label: 'Generate Copy', action: 'generate_copy', icon: 'edit' },
      {
        id: 'analyze-creative',
        label: 'Analyze Creative',
        action: 'analyze_creative',
        icon: 'bar-chart',
      },
    ],
  },

  performance: {
    id: 'performance',
    name: 'Performance Mode',
    description: 'Focus on metrics and ROI',
    icon: 'trending-up',
    color: '#10B981',
    panels: ['benchmarks', 'trajectory', 'correlation', 'email-performance', 'campaign-simulator'],
    quickActions: [
      {
        id: 'view-benchmarks',
        label: 'View Benchmarks',
        action: 'view_benchmarks',
        icon: 'bar-chart-2',
      },
      {
        id: 'optimize-schedule',
        label: 'Optimize Schedule',
        action: 'optimize_schedule',
        icon: 'calendar',
      },
      { id: 'export-report', label: 'Export Report', action: 'export_report', icon: 'download' },
    ],
  },

  team: {
    id: 'team',
    name: 'Team Ops Mode',
    description: 'Focus on workspace management',
    icon: 'briefcase',
    color: '#6366F1',
    panels: ['benchmarks', 'automations-history', 'workspace-settings', 'integrations'],
    quickActions: [
      {
        id: 'compare-artists',
        label: 'Compare Artists',
        action: 'compare_artists',
        icon: 'git-compare',
      },
      { id: 'manage-team', label: 'Manage Team', action: 'manage_team', icon: 'users' },
      {
        id: 'view-automations',
        label: 'View Automations',
        action: 'view_automations',
        icon: 'zap',
      },
    ],
  },
}

export function switchMode(mode: DashboardMode, context: FusionContext): ModeContext {
  const modeDefinition = DASHBOARD_MODES[mode]

  // Filter context based on mode
  const filteredContext = filterContextByMode(mode, context)

  // Get visible panels for mode
  const visiblePanels = modeDefinition.panels

  // Determine priority order
  const priorityOrder = getPriorityOrder(mode)

  // Get quick actions
  const quickActions = modeDefinition.quickActions

  return {
    mode,
    filteredContext,
    visiblePanels,
    priorityOrder,
    quickActions,
  }
}

function filterContextByMode(mode: DashboardMode, context: FusionContext): Partial<FusionContext> {
  // Return full context filtered to relevant data for mode
  switch (mode) {
    case 'campaign':
      return {
        tracker: context.tracker,
        email: context.email,
        calendar: context.calendar,
        replyIntel: context.replyIntel,
      }

    case 'contact':
      return {
        intel: context.intel,
        contactIntel: context.contactIntel,
        replyIntel: context.replyIntel,
      }

    case 'scene':
      return {
        community: context.community,
        coverage: context.coverage,
        calendar: context.calendar,
      }

    case 'creative':
      return {
        assets: context.assets,
        writerRoom: context.writerRoom,
        pressKitIntel: context.pressKitIntel,
      }

    case 'performance':
      return {
        tracker: context.tracker,
        email: context.email,
        contactIntel: context.contactIntel,
        replyIntel: context.replyIntel,
      }

    case 'team':
      return {
        // Full context for team management
        ...context,
      }

    default:
      return context
  }
}

function getPriorityOrder(mode: DashboardMode): string[] {
  // Define which data should be shown first based on mode
  switch (mode) {
    case 'campaign':
      return ['active-campaigns', 'recent-sends', 'coverage-events', 'trajectory']

    case 'contact':
      return ['high-value-leads', 'contact-suggestions', 'responsiveness-scores', 'stale-contacts']

    case 'scene':
      return ['coverage-map', 'community-posts', 'scene-events', 'geographic-spread']

    case 'creative':
      return ['recent-assets', 'identity-profile', 'creative-correlations', 'epk-fragments']

    case 'performance':
      return ['benchmarks', 'trajectory-forecast', 'email-metrics', 'campaign-efficiency']

    case 'team':
      return ['workspace-benchmarks', 'artist-comparisons', 'automation-history', 'team-settings']

    default:
      return []
  }
}

export function getModeRecommendation(context: FusionContext): DashboardMode {
  // Recommend mode based on current context state

  // If active campaigns, suggest campaign mode
  if (context.tracker.activeCampaigns > 3) {
    return 'campaign'
  }

  // If many high-value leads, suggest contact mode
  if (context.replyIntel.highValueLeads.length > 5) {
    return 'contact'
  }

  // If recent creative activity, suggest creative mode
  if (context.assets.drops.length > 0) {
    const recentAssets = context.assets.drops.filter(
      (drop) => new Date(drop.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    )
    if (recentAssets.length > 0) {
      return 'creative'
    }
  }

  // If workspace has multiple artists, suggest team mode
  // (would need multi-artist detection in real implementation)

  // Default to campaign mode
  return 'campaign'
}

export function getModeInsights(mode: DashboardMode, context: FusionContext): string[] {
  const insights: string[] = []

  switch (mode) {
    case 'campaign':
      if (context.tracker.activeCampaigns === 0) {
        insights.push('No active campaigns - consider launching a new campaign')
      }
      if (context.email.performanceMetrics.avgReplyRate < 0.05) {
        insights.push('Low reply rate - review pitch strategy')
      }
      break

    case 'contact':
      if (context.contactIntel.avgResponsivenessScore < 0.3) {
        insights.push('Low average responsiveness - consider cleaning contact list')
      }
      if (context.replyIntel.highValueLeads.length > 0) {
        insights.push(
          `${context.replyIntel.highValueLeads.length} high-value leads awaiting follow-up`
        )
      }
      break

    case 'scene':
      if (context.community.posts.length < 5) {
        insights.push('Low community engagement - increase scene presence')
      }
      if (context.coverage.events.length > 20) {
        insights.push('Strong coverage footprint - leverage for scene positioning')
      }
      break

    case 'creative':
      if (context.assets.drops.length === 0) {
        insights.push('No creative assets uploaded - add releases to analyze')
      }
      if (context.pressKitIntel.avgQualityScore < 0.7) {
        insights.push('Press kit quality below 70% - review and improve materials')
      }
      break

    case 'performance':
      if (context.tracker.performanceMetrics.successRate < 40) {
        insights.push('Campaign success rate below 40% - review strategy')
      }
      if (context.email.performanceMetrics.avgOpenRate < 20) {
        insights.push('Email open rate below 20% - test new subject line approaches')
      }
      break

    case 'team':
      // Would need multi-artist context for real insights
      insights.push('Workspace overview mode - compare performance across artists')
      break
  }

  return insights
}
