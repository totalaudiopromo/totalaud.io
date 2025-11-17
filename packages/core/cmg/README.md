# Creative Memory Graph (CMG)

Phase 22: Universal Creative Memory Graph

A cross-campaign creative memory system that mines patterns, builds long-term creative fingerprints, and gently biases future behaviour in the totalaud.io platform.

---

## Overview

The Creative Memory Graph (CMG) is a graph-based system that:

1. **Stores** memories, events, and outcomes across all campaigns
2. **Mines** structural and emotional patterns
3. **Builds** long-term creative fingerprints for users and each OS
4. **Adapts** future Intent Engine, DAW OS, and Performance Engine behaviour
5. **Visualises** creative evolution over time

**Key principle:** All analysis is deterministic and rule-based. No AI calls inside CMG code.

---

## Architecture

```
CMG System
├── Database Layer (Supabase)
│   ├── cmg_nodes          - Memories, events, outcomes
│   ├── cmg_edges          - Relationships between nodes
│   ├── cmg_fingerprints   - Cached fingerprints
│   └── cmg_metrics        - Time-series metrics
│
├── Core Modules
│   ├── cmgWriter          - Data ingestion
│   ├── cmgQuery           - Data retrieval
│   ├── patternMiner       - Fingerprint extraction
│   ├── longTermAdaptation - Behaviour biasing
│   └── fingerprintExporter - Export to JSON/Markdown
│
├── API Routes
│   ├── /api/cmg/fingerprint - Get creative fingerprint
│   ├── /api/cmg/timeline    - Get timeline buckets
│   ├── /api/cmg/motifs      - Get structural motifs
│   └── /api/cmg/os-drift    - Get OS evolution data
│
└── UI Components
    ├── CreativeMemoryTimelineCanvas
    ├── FingerprintSummaryCard
    ├── OSDriftPanel
    ├── StructuralMotifsPanel
    └── EmotionalArcPanel
```

---

## Quick Start

### 1. Run Database Migration

```bash
# Apply the CMG schema
supabase db reset
# Or if already set up:
supabase migration up
```

### 2. Record Data

```typescript
import { recordMemoryNode, recordOutcomeNode } from '@total-audio/core-cmg';

// Record an OS memory
await recordMemoryNode({
  userId: 'user-123',
  campaignId: 'campaign-456',
  os: 'ascii',
  memoryType: 'achievement',
  content: 'Successfully pitched to BBC Radio 1',
  importance: 5,
  sentiment: 'positive',
  timestamp: new Date().toISOString(),
});

// Record a campaign outcome
await recordOutcomeNode({
  userId: 'user-123',
  campaignId: 'campaign-456',
  outcomeType: 'success',
  label: 'Campaign completed with 85% response rate',
  metrics: {
    cohesion: 0.8,
    tension: 0.3,
    responseRate: 0.85,
    completionRate: 0.9,
  },
  timestamp: new Date().toISOString(),
});
```

### 3. Compute Creative Fingerprint

```typescript
import { computeCreativeFingerprint } from '@total-audio/core-cmg';

const fingerprint = await computeCreativeFingerprint({
  userId: 'user-123',
  window: '90d', // Last 90 days
});

console.log(fingerprint.structural); // Arc patterns
console.log(fingerprint.emotional);  // Sentiment patterns
console.log(fingerprint.os);         // OS behaviour patterns
console.log(fingerprint.sonic);      // Tempo/palette patterns
```

### 4. Use Adaptation Profile

```typescript
import {
  computeLongTermAdaptation,
  applyArcAdjustments,
  applyTempoAdjustments
} from '@total-audio/core-cmg';

// Get adaptation profile
const profile = await computeLongTermAdaptation('user-123', '90d');

// Apply to defaults
const defaultArc = { peakPosition: 0.6, length: 10, complexity: 3 };
const adjustedArc = applyArcAdjustments(defaultArc, profile);

const defaultTempo = 120;
const adjustedTempo = applyTempoAdjustments(defaultTempo, profile);

// Use adjusted values in your system
```

### 5. View Timeline UI

Navigate to `/memory/timeline` to see:
- Timeline of all creative memories
- OS drift over time
- Structural motifs
- Emotional patterns
- Creative fingerprint summary

---

## Core Concepts

### Nodes

Nodes represent discrete moments in creative history:

- **memory** - OS memories (from Phase 12A)
- **event** - Evolution events (from Phase 13A)
- **outcome** - Campaign outcomes
- **structural_marker** - Arc markers, intelligence snapshots
- **clip** - Audio/video clips (future)
- **os_profile** - OS state snapshots (future)

Each node has:
- `importance` (1-5)
- `sentiment` (positive/negative/neutral/mixed)
- `os` (which OS it came from, optional)
- `occurred_at` (timestamp)
- `payload` (arbitrary structured data)

### Edges

Edges represent relationships between nodes:

- **influences** - One node affects another
- **precedes** - Temporal sequence
- **resolves** - One node resolves tension from another
- **contradicts** - Opposing nodes
- **amplifies** - One node strengthens another
- **relates** - General relationship

Each edge has a `weight` (0-1) indicating strength.

### Creative Fingerprint

A Creative Fingerprint captures patterns across 4 dimensions:

1. **Structural** - Arc shapes, peak positions, complexity
2. **Emotional** - Sentiment ratios, volatility, resolution patterns
3. **OS** - Which OS leads, resolves, or creates tension
4. **Sonic** - Tempo ranges, harmonic palette, timbral preferences

Fingerprints are computed over a time window (e.g., 90 days) and cached in the database.

### Structural Motifs

Motifs are recurring patterns detected across campaigns:

- **Tension-Resolution Arc** - Negative sentiment followed by positive
- **Gradual Build-Up** - Progressive increase in importance
- **Three-Act Structure** - Peak in middle third
- (More motifs detected as data grows)

### Long-Term Adaptation Profile

An Adaptation Profile translates the Creative Fingerprint into subtle biases for future behaviour:

- **Arc adjustments** - Shift peak position, length, complexity
- **Tempo defaults** - Preferred tempo range
- **Tension tolerance** - How much tension user typically accepts
- **OS role biases** - Which OS tends to lead/resolve/tension
- **Palette biases** - Harmonic and timbral preferences

These biases are applied with **gentle influence** (typically ±20% adjustments) to maintain creative flexibility.

---

## API Reference

### Data Ingestion

```typescript
// Record nodes
await recordMemoryNode(memory: OSMemory): Promise<CMGNode | null>
await recordEvolutionEvent(event: EvolutionEvent): Promise<CMGNode | null>
await recordStructuralMarker(marker: StructuralMarker): Promise<CMGNode | null>
await recordOutcomeNode(outcome: CampaignOutcome): Promise<CMGNode | null>

// Batch operations
await recordMultipleNodes(nodes: CMGNode[]): Promise<CMGNode[]>

// Link nodes
await linkNodes(fromId, toId, edgeType, weight, userId): Promise<CMGEdge | null>
await linkMultipleNodes(edges): Promise<CMGEdge[]>
```

### Data Retrieval

```typescript
// Get nodes and edges
await getNodesForUser(userId, fromDate, toDate): Promise<CMGNode[]>
await getEdgesForUser(userId, fromDate, toDate): Promise<CMGEdge[]>
await getRelatedMemories(nodeId, options): Promise<CMGNode[]>
await getNodesForCampaign(campaignId): Promise<CMGNode[]>

// Get patterns
await getStructuralMotifs(userId, params): Promise<StructuralMotif[]>
await getOSDrift(userId, params): Promise<OSDriftData>
await getOutcomeCorrelations(userId, params): Promise<OutcomeCorrelation>
await getFingerprintSummary(userId, window): Promise<CreativeFingerprint | null>
await getTimelineBuckets(userId, window): Promise<TimelineBucket[]>
```

### Pattern Mining

```typescript
// Compute fingerprints
await computeCreativeFingerprint({ userId, window }): Promise<CreativeFingerprint>

// Individual fingerprint types
mineStructuralFingerprint(nodes, edges): StructuralFingerprint
mineEmotionalFingerprint(nodes): EmotionalFingerprint
mineOSFingerprint(nodes, edges): OSFingerprint
mineSonicFingerprint(nodes): SonicFingerprint
```

### Long-Term Adaptation

```typescript
// Compute adaptation profile
await computeLongTermAdaptation(userId, window): Promise<LongTermAdaptationProfile>

// Apply adjustments
applyArcAdjustments(defaultArc, profile)
applyTempoAdjustments(defaultTempo, profile)
applyTensionThresholds(defaultThresholds, profile)
getPreferredOSForRole(role, profile): OSName | null
applyPaletteBiases(defaultPalette, profile)

// Utilities
isProfileFresh(profile, maxAgeHours): boolean
mergeAdaptationProfiles(profiles): LongTermAdaptationProfile
```

### Export

```typescript
exportCreativeFingerprintJSON(fingerprint): string
exportCreativeFingerprintMarkdown(fingerprint): string
exportFingerprintSummaryMarkdown(fingerprint): string
exportCreativeFingerprint(fingerprint, options): string
```

---

## Integration

See [INTEGRATION.md](./INTEGRATION.md) for detailed integration guides with:

- OS Memory System (Phase 12A)
- Evolution System (Phase 13A)
- Social Graph (Phase 14)
- Intelligence Snapshots (Phase 15)
- Performance Adaptive System (Phase 21)
- Intent Engine
- DAW OS

---

## Database Schema

### cmg_nodes

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User who owns this node |
| campaign_id | uuid | Associated campaign (nullable) |
| node_type | text | 'memory', 'event', 'outcome', etc. |
| os | text | 'ascii', 'xp', 'aqua', 'daw', 'analogue' (nullable) |
| label | text | Human-readable label |
| sentiment | text | 'positive', 'negative', 'neutral', 'mixed' (nullable) |
| importance | integer | 1-5 |
| payload | jsonb | Arbitrary structured data |
| occurred_at | timestamptz | When this happened |
| created_at | timestamptz | When recorded |

### cmg_edges

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User who owns this edge |
| from_node_id | uuid | Source node |
| to_node_id | uuid | Target node |
| edge_type | text | 'influences', 'precedes', 'resolves', etc. |
| weight | float8 | 0-1 |
| created_at | timestamptz | When created |

### cmg_fingerprints

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User who owns this fingerprint |
| snapshot_type | text | 'structural', 'emotional', 'os', 'sonic', 'combined' |
| snapshot_window | text | '30d', '90d', 'lifetime', etc. |
| data | jsonb | Fingerprint data |
| created_at | timestamptz | When computed |

### cmg_metrics

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User who owns this metric |
| metric_type | text | 'cohesion_trend', 'tension_tolerance', 'os_drift', etc. |
| window | text | Time window |
| data | jsonb | Metric data |
| computed_at | timestamptz | When computed |

All tables have Row-Level Security (RLS) enabled. Users can only access their own data.

---

## Testing

```bash
# Type check
cd packages/core/cmg
pnpm typecheck

# Manual testing
# 1. Create some test nodes via API or direct DB insert
# 2. Visit /memory/timeline
# 3. Check fingerprint in browser console:
fetch('/api/cmg/fingerprint?window=30d').then(r => r.json()).then(console.log)
```

---

## Performance Considerations

1. **Fingerprint Caching** - Fingerprints are automatically cached in `cmg_fingerprints` table. Reuse cached versions when possible.

2. **Batch Operations** - Use `recordMultipleNodes` and `linkMultipleNodes` for bulk operations.

3. **Appropriate Windows** - Smaller windows (30d) are faster to compute than lifetime.

4. **Indexing** - All critical columns are indexed for fast queries.

5. **Background Jobs** - For non-critical integrations, record nodes asynchronously.

---

## Roadmap

**Phase 22 (Current):**
- ✅ Graph database layer
- ✅ Pattern mining
- ✅ Creative fingerprints
- ✅ Long-term adaptation
- ✅ Timeline UI
- ✅ Integration hooks

**Future:**
- Automatic edge creation (ML-based relationship detection)
- Real-time pattern notifications
- Collaborative fingerprints (multi-user)
- Pattern recommendations
- Advanced motif detection
- Cross-user pattern analysis

---

## British English Note

All UI copy, documentation, and exports use British English spelling:
- colour (not color)
- behaviour (not behavior)
- analyse (not analyze)
- visualise (not visualize)
- etc.

---

## License

Part of the totalaud.io platform.

---

Last updated: Phase 22
