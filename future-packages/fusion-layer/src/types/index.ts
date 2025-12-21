/**
 * Fusion Layer Types
 *
 * Unified type definitions for the Total Audio intelligence dashboard
 */

// ========================================
// Core Fusion Context
// ========================================

export interface FusionContext {
  userId: string
  workspaceId?: string

  // Core data aggregations
  intel: IntelContext
  pitch: PitchContext
  tracker: TrackerContext

  // Feature contexts
  assets: AssetContext
  email: EmailContext
  lists: ListContext
  releases: ReleaseContext
  community: CommunityContext
  integrations: IntegrationContext

  // Intelligence contexts
  contactIntel: ContactIntelContext
  pressKitIntel: PressKitIntelContext
  writerRoom: WriterRoomContext
  replyIntel: ReplyIntelContext
  campaigns: CampaignWatcherContext

  // Discovery contexts
  discovery: DiscoveryContext
  audienceBuilder: AudienceBuilderContext

  // Analytics contexts
  successProfiles: SuccessProfileContext
  simulator: SimulatorContext
  coverage: CoverageContext
  calendar: CalendarContext

  // Meta
  metadata: FusionMetadata
  lastUpdated: Date
}

export interface FusionMetadata {
  loadTime: number
  sources: string[]
  errors: string[]
  warnings: string[]
  cacheHits: number
  cacheMisses: number
}

// ========================================
// Intel Context
// ========================================

export interface IntelContext {
  contacts: ContactSummary[]
  totalContacts: number
  recentEnrichments: EnrichmentSummary[]
  enrichmentRate: number
  topGenres: string[]
  topRegions: string[]
}

export interface ContactSummary {
  id: string
  name: string
  email?: string
  outlet?: string
  role?: string
  genre?: string[]
  region?: string
  lastEnriched?: Date
  enrichmentScore?: number
}

export interface EnrichmentSummary {
  id: string
  contactId: string
  timestamp: Date
  fields: string[]
  success: boolean
}

// ========================================
// Pitch Context
// ========================================

export interface PitchContext {
  pitches: PitchSummary[]
  totalPitches: number
  templates: PitchTemplate[]
  voiceProfile?: VoiceProfile
  recentActivity: PitchActivity[]
}

export interface PitchSummary {
  id: string
  artistName: string
  subject: string
  tone: string
  createdAt: Date
  sent?: boolean
  opened?: boolean
  replied?: boolean
}

export interface PitchTemplate {
  id: string
  name: string
  type: string
  usageCount: number
}

export interface VoiceProfile {
  id: string
  tone: string
  characteristics: string[]
  examples: string[]
}

export interface PitchActivity {
  id: string
  pitchId: string
  type: 'created' | 'sent' | 'opened' | 'clicked' | 'replied'
  timestamp: Date
}

// ========================================
// Tracker Context
// ========================================

export interface TrackerContext {
  campaigns: CampaignSummary[]
  totalCampaigns: number
  activeCampaigns: number
  recentActivities: CampaignActivity[]
  performanceMetrics: CampaignMetrics
}

export interface CampaignSummary {
  id: string
  artistName: string
  releaseName: string
  status: string
  startDate: Date
  contactCount: number
  responseRate: number
}

export interface CampaignActivity {
  id: string
  campaignId: string
  type: string
  timestamp: Date
  metadata: Record<string, unknown>
}

export interface CampaignMetrics {
  totalSent: number
  totalOpened: number
  totalReplied: number
  avgResponseTime: number
  successRate: number
}

// ========================================
// Asset Context
// ========================================

export interface AssetContext {
  assets: AssetSummary[]
  totalAssets: number
  byType: Record<string, number>
  recentUploads: AssetSummary[]
  storageUsed: number
}

export interface AssetSummary {
  id: string
  type: string
  fileName: string
  url: string
  size: number
  uploadedAt: Date
  tags: string[]
}

// ========================================
// Email Context
// ========================================

export interface EmailContext {
  campaigns: EmailCampaignSummary[]
  totalCampaigns: number
  scheduledCampaigns: number
  recentActivity: EmailActivity[]
  performanceMetrics: EmailMetrics
}

export interface EmailCampaignSummary {
  id: string
  name: string
  subject: string
  status: string
  scheduledFor?: Date
  sentAt?: Date
  recipientCount: number
  openRate: number
  clickRate: number
}

export interface EmailActivity {
  id: string
  campaignId: string
  contactId: string
  type: string
  timestamp: Date
}

export interface EmailMetrics {
  totalSent: number
  avgOpenRate: number
  avgClickRate: number
  avgReplyRate: number
}

// ========================================
// List Context
// ========================================

export interface ListContext {
  segments: SegmentSummary[]
  totalSegments: number
  totalContacts: number
  recentlyUpdated: SegmentSummary[]
}

export interface SegmentSummary {
  id: string
  name: string
  contactCount: number
  isDynamic: boolean
  aiGenerated: boolean
  lastComputed?: Date
}

// ========================================
// Release Context
// ========================================

export interface ReleaseContext {
  plans: ReleasePlanSummary[]
  upcoming: ReleasePlanSummary[]
  inProgress: ReleasePlanSummary[]
  completed: ReleasePlanSummary[]
}

export interface ReleasePlanSummary {
  id: string
  artistName: string
  releaseName: string
  releaseType: string
  releaseDate: Date
  status: string
  completionPercentage: number
}

// ========================================
// Community Context
// ========================================

export interface CommunityContext {
  profile?: CommunityProfile
  posts: CommunityPostSummary[]
  followingCount: number
  followerCount: number
  engagementScore: number
  recentActivity: CommunityActivity[]
}

export interface CommunityProfile {
  id: string
  displayName: string
  bio?: string
  avatarUrl?: string
  profileType: string
  isVerified: boolean
}

export interface CommunityPostSummary {
  id: string
  title?: string
  postType: string
  upvotes: number
  viewCount: number
  createdAt: Date
}

export interface CommunityActivity {
  id: string
  type: string
  timestamp: Date
  metadata: Record<string, unknown>
}

// ========================================
// Integration Context
// ========================================

export interface IntegrationContext {
  connected: IntegrationSummary[]
  available: string[]
  syncStatus: Record<string, SyncStatus>
}

export interface IntegrationSummary {
  id: string
  provider: string
  status: string
  lastSync?: Date
  scopes: string[]
}

export interface SyncStatus {
  isActive: boolean
  lastSync?: Date
  nextSync?: Date
  errorCount: number
}

// ========================================
// Contact Intelligence Context
// ========================================

export interface ContactIntelContext {
  graphs: ContactIntelGraph[]
  totalContacts: number
  avgResponsivenessScore: number
  topPerformingContacts: ContactIntelGraph[]
}

export interface ContactIntelGraph {
  contactId: string
  contactName?: string
  genreAffinity: Record<string, number>
  responsivenessScore: number
  preferredPitchStyle: string[]
  bestTimeToSend: TimePreference
  avgResponseTimeHours: number
  conversionRate: number
}

export interface TimePreference {
  hourOfDay: number[]
  dayOfWeek: string[]
}

// ========================================
// Press Kit Intelligence Context
// ========================================

export interface PressKitIntelContext {
  reports: PressKitReport[]
  latestReport?: PressKitReport
  avgQualityScore: number
}

export interface PressKitReport {
  id: string
  artistName?: string
  qualityScore: number
  completenessScore: number
  professionalismScore: number
  issues: PressKitIssue[]
  suggestions: PressKitSuggestion[]
  strengths: string[]
}

export interface PressKitIssue {
  severity: 'critical' | 'warning' | 'info'
  category: string
  message: string
}

export interface PressKitSuggestion {
  priority: 'high' | 'medium' | 'low'
  category: string
  message: string
  actionable: boolean
}

// ========================================
// Writer's Room Context
// ========================================

export interface WriterRoomContext {
  results: WriterRoomResult[]
  recentGenerated: WriterRoomResult[]
}

export interface WriterRoomResult {
  id: string
  artistName?: string
  releaseName?: string
  angles: CreativeAngle[]
  taglines: string[]
  tiktokHooks: string[]
  radioTalkingPoints: string[]
  narratives: Narrative[]
  createdAt: Date
}

export interface CreativeAngle {
  title: string
  description: string
  targetAudience: string
  confidence: number
}

export interface Narrative {
  title: string
  story: string
  hooks: string[]
  mediaTargets: string[]
}

// ========================================
// Reply Intelligence Context
// ========================================

export interface ReplyIntelContext {
  classifications: ReplyClassification[]
  highValueLeads: ReplyClassification[]
  needsFollowup: ReplyClassification[]
  avgInterestScore: number
  avgUrgencyScore: number
}

export interface ReplyClassification {
  id: string
  campaignId?: string
  contactId?: string
  classification: string
  interestScore: number
  urgencyScore: number
  requiresFollowup: boolean
  suggestedResponse?: string
  timestamp: Date
}

// ========================================
// Campaign Watcher Context
// ========================================

export interface CampaignWatcherContext {
  feed: CampaignFeedEvent[]
  recentEvents: CampaignFeedEvent[]
  eventsByType: Record<string, number>
}

export interface CampaignFeedEvent {
  id: string
  campaignId: string
  campaignName?: string
  eventType: string
  eventData: Record<string, unknown>
  timestamp: Date
}

// ========================================
// Discovery Context
// ========================================

export interface DiscoveryContext {
  similarArtists: ArtistSuggestion[]
  risingScenes: SceneSuggestion[]
  suggestedAgencies: AgencySuggestion[]
  potentialCollaborators: CollaboratorSuggestion[]
}

export interface ArtistSuggestion {
  name: string
  genre: string[]
  similarityScore: number
  reason: string
}

export interface SceneSuggestion {
  name: string
  region: string
  momentum: number
  keyPlayers: string[]
}

export interface AgencySuggestion {
  name: string
  specialization: string[]
  fitScore: number
  reason: string
}

export interface CollaboratorSuggestion {
  userId: string
  displayName: string
  profileType: string
  matchScore: number
  commonInterests: string[]
}

// ========================================
// Audience Builder Context
// ========================================

export interface AudienceBuilderContext {
  suggestions: AudienceSuggestion[]
  autoGeneratedSegments: SegmentSummary[]
}

export interface AudienceSuggestion {
  id: string
  type: string
  contacts: ContactSummary[]
  reasoning: string
  confidenceScore: number
  isApplied: boolean
}

// ========================================
// Success Profile Context
// ========================================

export interface SuccessProfileContext {
  profiles: SuccessProfile[]
  relevantProfiles: SuccessProfile[]
}

export interface SuccessProfile {
  id: string
  genre: string
  profileType: string
  insights: ProfileInsight[]
  typicalTimeline: TimelinePhase[]
  keyOutlets: OutletInsight[]
  bestPractices: string[]
  warningSign: string[]
  confidenceScore: number
}

export interface ProfileInsight {
  category: string
  insight: string
  dataPoints: number
}

export interface TimelinePhase {
  phase: string
  durationWeeks: number
  keyActivities: string[]
}

export interface OutletInsight {
  outletName: string
  relevanceScore: number
  avgResponseRate: number
}

// ========================================
// Simulator Context
// ========================================

export interface SimulatorContext {
  simulations: SimulationResult[]
  recentSimulations: SimulationResult[]
}

export interface SimulationResult {
  id: string
  name?: string
  inputs: SimulationInput
  predictedOutcomes: PredictedOutcome[]
  suggestions: SimulationSuggestion[]
  weakPoints: WeakPoint[]
  confidenceScore: number
  createdAt: Date
}

export interface SimulationInput {
  campaignType: string
  targetGenres: string[]
  contactCount: number
  budget?: number
  timeline?: string
}

export interface PredictedOutcome {
  metric: string
  predicted: number
  range: { min: number; max: number }
  confidence: number
}

export interface SimulationSuggestion {
  priority: 'high' | 'medium' | 'low'
  category: string
  suggestion: string
  expectedImpact: string
}

export interface WeakPoint {
  severity: 'critical' | 'warning' | 'info'
  area: string
  issue: string
  recommendation: string
}

// ========================================
// Coverage Context
// ========================================

export interface CoverageContext {
  events: CoverageEvent[]
  byCountry: Record<string, number>
  byType: Record<string, number>
  totalReach: number
}

export interface CoverageEvent {
  id: string
  artistName?: string
  outlet: string
  outletType: string
  country: string
  coverageType: string
  url?: string
  reachEstimate: number
  publicationDate?: Date
}

// ========================================
// Calendar Context
// ========================================

export interface CalendarContext {
  events: CalendarEvent[]
  upcomingDeadlines: CalendarEvent[]
  relevantEvents: CalendarEvent[]
}

export interface CalendarEvent {
  id: string
  name: string
  category: string
  date: Date
  endDate?: Date
  region?: string
  country?: string
  description?: string
  websiteUrl?: string
}

// ========================================
// Loader Options
// ========================================

export interface LoaderOptions {
  userId: string
  workspaceId?: string
  includeArchived?: boolean
  limit?: number
  dateRange?: {
    start: Date
    end: Date
  }
}

// ========================================
// Loader Results
// ========================================

export interface LoaderResult<T> {
  data: T
  error?: string
  loadTime: number
  cached: boolean
}
