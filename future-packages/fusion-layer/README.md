# Fusion Layer

**Unified Intelligence Context Aggregation for Total Audio Platform**

The Fusion Layer is the single source of truth for aggregating data from across the Total Audio ecosystem. It normalizes and merges data from Intel, Pitch Generator, Campaign Tracker, Asset Drop, Email Campaigns, Community Hub, and all intelligence systems.

## Purpose

- **Unified Context**: Aggregate data from all Total Audio apps into a single context object
- **Normalized Data**: Transform disparate data structures into consistent, typed interfaces
- **Performance**: Load all contexts in parallel for optimal performance
- **Intelligence Integration**: Power AI agents with comprehensive cross-system insights

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FUSION LAYER                             │
│  buildFusionContext() → Aggregates all system data          │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌──────────────────────┐          ┌──────────────────────┐
│  Data Loaders        │          │  Type Definitions    │
│  - Intel             │          │  - FusionContext     │
│  - Pitch             │          │  - IntelContext      │
│  - Tracker           │          │  - TrackerContext    │
│  - Assets            │          │  - ...               │
│  - Email             │          └──────────────────────┘
│  - Intelligence      │
│  - Discovery         │
│  - Analytics         │
└──────────────────────┘
```

## Usage

### Basic Usage

```typescript
import { buildFusionContext } from '@total-audio/fusion-layer';
import { createClient } from '@total-audio/core-db/server';

const supabase = createClient();
const userId = 'user-id';

const fusionContext = await buildFusionContext(supabase, userId);

// Access all system data
console.log(fusionContext.intel.totalContacts);
console.log(fusionContext.tracker.activeCampaigns);
console.log(fusionContext.contactIntel.avgResponsivenessScore);
```

### Partial Context Loading

```typescript
import { buildPartialFusionContext } from '@total-audio/fusion-layer';

// Load only specific contexts for performance
const partialContext = await buildPartialFusionContext(supabase, userId, [
  'intel',
  'tracker',
  'contactIntel',
]);
```

### With Workspace

```typescript
const fusionContext = await buildFusionContext(supabase, userId, workspaceId);

// Multi-client agency access
console.log(fusionContext.tracker.campaigns); // Filtered by workspace
```

## Data Loaders

Each loader is responsible for fetching and normalizing data from a specific system:

- **Intel Loader**: Contact enrichment, recent enrichments, top genres/regions
- **Tracker Loader**: Campaigns, activities, performance metrics
- **Pitch Loader**: Generated pitches, templates, voice profiles
- **Asset Loader**: Uploaded assets, storage metrics
- **Email Loader**: Campaigns, segments, performance
- **Community Loader**: Posts, followers, engagement
- **Contact Intel Loader**: Contact intelligence graph, preferences, patterns
- **Press Kit Intel Loader**: Quality reports, suggestions
- **Writer's Room Loader**: Creative angles, narratives
- **Reply Intel Loader**: Email classification, sentiment
- **Campaign Watcher Loader**: Real-time activity feed
- **Discovery Loader**: Artist/scene suggestions (AI-powered)
- **Audience Builder Loader**: AI-suggested contacts
- **Success Profile Loader**: Genre-specific insights
- **Simulator Loader**: Campaign predictions
- **Coverage Loader**: Geographic coverage tracking
- **Calendar Loader**: Industry events, deadlines

## Type System

All data is strongly typed with TypeScript interfaces:

```typescript
interface FusionContext {
  userId: string;
  workspaceId?: string;

  // Core data
  intel: IntelContext;
  pitch: PitchContext;
  tracker: TrackerContext;

  // Features
  assets: AssetContext;
  email: EmailContext;
  lists: ListContext;
  releases: ReleaseContext;
  community: CommunityContext;
  integrations: IntegrationContext;

  // Intelligence
  contactIntel: ContactIntelContext;
  pressKitIntel: PressKitIntelContext;
  writerRoom: WriterRoomContext;
  replyIntel: ReplyIntelContext;
  campaigns: CampaignWatcherContext;

  // Discovery
  discovery: DiscoveryContext;
  audienceBuilder: AudienceBuilderContext;

  // Analytics
  successProfiles: SuccessProfileContext;
  simulator: SimulatorContext;
  coverage: CoverageContext;
  calendar: CalendarContext;

  // Metadata
  metadata: FusionMetadata;
  lastUpdated: Date;
}
```

## Powers

The Fusion Layer powers:

- **Unified Dashboard**: Single-screen view of all Total Audio data
- **AI Agents**: Comprehensive context for intelligent suggestions
- **Success Profiles**: Genre-specific insights based on aggregated data
- **Email Builder**: Smart segmentation with intelligence
- **Press Kit Intelligence**: Quality analysis across assets
- **Predictive Simulator**: Campaign predictions using historical data
- **Writer's Room**: Creative generation with full context
- **Discovery Engine**: AI-powered recommendations
- **Audience Builder**: Contact suggestions from patterns

## Performance

- **Parallel Loading**: All loaders run in parallel for ~3-5x speedup
- **Error Handling**: Individual loader failures don't break entire context
- **Metadata Tracking**: Load times, errors, cache hits tracked per request
- **Partial Loading**: Load only needed contexts for performance

## Caching (TODO)

Future implementation will include:

- Redis caching layer
- TTL-based invalidation
- Per-user cache keys
- Selective cache refresh

## Contributing

When adding new features to Total Audio:

1. Add database tables to migration
2. Create a new loader in `src/loaders/`
3. Add types to `src/types/index.ts`
4. Update `buildFusionContext()` to include new loader
5. Export loader from `src/loaders/index.ts`

## License

UNLICENSED - Total Audio Promo internal use only
