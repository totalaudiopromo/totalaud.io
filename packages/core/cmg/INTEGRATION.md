# CMG Integration Guide
Phase 22: Universal Creative Memory Graph

This document describes how to integrate the Creative Memory Graph (CMG) with other systems.

## Overview

The CMG is designed to capture creative memories, events, and outcomes across all campaigns. Integration points allow existing systems to feed data into the CMG automatically.

## Integration Points

### 1. OS Memory System (Phase 12A)

**When:** After an important OS memory is created (importance >= 3)

**How:**
```typescript
import { recordMemoryNode } from '@total-audio/core-cmg';

// In your memory creation function:
async function createOSMemory(memory: OSMemory) {
  // ... existing memory creation logic ...

  // If important, record in CMG
  if (memory.importance >= 3) {
    await recordMemoryNode(memory);
  }
}
```

**What it does:** Creates a CMG node of type 'memory' with the OS, sentiment, and importance preserved.

---

### 2. Evolution System (Phase 13A)

**When:** A significant evolution event occurs (importance >= 3)

**How:**
```typescript
import { recordEvolutionEvent } from '@total-audio/core-cmg';

// In your evolution event handler:
async function handleEvolutionEvent(event: EvolutionEvent) {
  // ... existing evolution logic ...

  // Record in CMG
  if (event.importance >= 3) {
    await recordEvolutionEvent(event);
  }
}
```

**What it does:** Creates a CMG node of type 'event' capturing the evolution moment.

---

### 3. Social Graph (Phase 14)

**When:** Major trust/synergy events occur

**How:**
```typescript
import { recordStructuralMarker } from '@total-audio/core-cmg';

// In your social graph analyzer:
async function analyzeSocialGraph(analysis: SocialGraphAnalysis) {
  // ... existing analysis logic ...

  // If strong alliance or conflict detected:
  if (analysis.trustDelta > 0.5 || analysis.trustDelta < -0.5) {
    await recordStructuralMarker({
      userId: analysis.userId,
      campaignId: analysis.campaignId,
      markerType: 'social_event',
      label: `${analysis.type}: ${analysis.description}`,
      position: analysis.position,
      importance: Math.min(5, Math.floor(Math.abs(analysis.trustDelta) * 5)),
      timestamp: new Date().toISOString(),
      metadata: analysis,
    });
  }
}
```

**What it does:** Creates a CMG node of type 'structural_marker' for significant social dynamics.

---

### 4. Intelligence Snapshots (Phase 15)

**When:** Intelligence snapshot is generated

**How:**
```typescript
import { recordStructuralMarker } from '@total-audio/core-cmg';

// In your intelligence snapshot generator:
async function createIntelligenceSnapshot(snapshot: IntelligenceSnapshot) {
  // ... existing snapshot logic ...

  // Record in CMG
  await recordStructuralMarker({
    userId: snapshot.userId,
    campaignId: snapshot.campaignId,
    markerType: 'intelligence_snapshot',
    label: `Intelligence: ${snapshot.summary}`,
    position: snapshot.arcPosition,
    importance: snapshot.confidence > 0.8 ? 4 : 3,
    timestamp: new Date().toISOString(),
    metadata: snapshot,
  });
}
```

**What it does:** Creates a CMG node capturing the intelligence state at a point in time.

---

### 5. Showreel/Export (Phases 17–19)

**When:** Campaign successfully completes or showreel is exported

**How:**
```typescript
import { recordOutcomeNode } from '@total-audio/core-cmg';

// In your showreel export handler:
async function exportShowreel(campaign: Campaign, metrics: CampaignMetrics) {
  // ... existing export logic ...

  // Record outcome in CMG
  await recordOutcomeNode({
    userId: campaign.userId,
    campaignId: campaign.id,
    outcomeType: metrics.completionRate > 0.8 ? 'success' :
                 metrics.completionRate > 0.5 ? 'partial' : 'failure',
    label: `Campaign "${campaign.name}" completed`,
    metrics: {
      cohesion: metrics.cohesion,
      tension: metrics.tension,
      responseRate: metrics.responseRate,
      completionRate: metrics.completionRate,
    },
    timestamp: new Date().toISOString(),
    metadata: { campaign, metrics },
  });
}
```

**What it does:** Creates a CMG node of type 'outcome' capturing campaign success/failure.

---

## Intent Engine Integration

The Intent Engine can use the Long-Term Adaptation Profile to bias future campaigns.

**How:**
```typescript
import { computeLongTermAdaptation, applyArcAdjustments, applyTempoAdjustments } from '@total-audio/core-cmg';

// In your Intent Engine:
async function parseIntent(userId: string, intent: string) {
  // ... existing intent parsing ...

  // Get adaptation profile
  const profile = await computeLongTermAdaptation(userId, '90d');

  // Apply arc adjustments to defaults
  const defaultArc = { peakPosition: 0.6, length: 10, complexity: 3 };
  const adjustedArc = applyArcAdjustments(defaultArc, profile);

  // Apply tempo adjustments
  const defaultTempo = 120;
  const adjustedTempo = applyTempoAdjustments(defaultTempo, profile);

  // Use adjustedArc and adjustedTempo in your timeline generation
  return {
    ...parsedIntent,
    arc: adjustedArc,
    tempo: adjustedTempo,
  };
}
```

**What it does:** Gently biases default values based on user's creative fingerprint.

---

## DAW OS Integration

The DAW OS can use structural fingerprints to adjust default timeline behaviour.

**How:**
```typescript
import { computeCreativeFingerprint } from '@total-audio/core-cmg';

// In your DAW OS timeline generator:
async function generateDefaultTimeline(userId: string) {
  // Get user's creative fingerprint
  const fingerprint = await computeCreativeFingerprint({ userId, window: '90d' });

  const { structural } = fingerprint;

  // Adjust default timeline based on fingerprint
  const sceneCount = Math.round(structural.typicalArcLength);
  const peakSceneIndex = Math.floor(sceneCount * structural.peakPosition);

  // Generate timeline with these biases
  const timeline = createTimeline({
    sceneCount,
    peakSceneIndex,
    cycleCount: Math.floor(structural.cycleCount),
  });

  return timeline;
}
```

**What it does:** Adjusts structural defaults based on user's typical patterns.

---

## Performance Adaptive System Integration (Phase 21)

The Performance system can use tension tolerance from the emotional fingerprint.

**How:**
```typescript
import { computeLongTermAdaptation, applyTensionThresholds } from '@total-audio/core-cmg';

// In your Performance Adaptive System:
async function getAdaptiveThresholds(userId: string) {
  // Get adaptation profile
  const profile = await computeLongTermAdaptation(userId, '90d');

  // Apply tension thresholds
  const defaultThresholds = { maxTension: 0.7, minCohesion: 0.5 };
  const adjustedThresholds = applyTensionThresholds(defaultThresholds, profile);

  return adjustedThresholds;
}
```

**What it does:** Adjusts tension/cohesion thresholds based on user's emotional fingerprint.

---

## Best Practices

### 1. Only Record Important Events

Don't record every single event - focus on:
- High importance (>= 3 out of 5)
- Structural turning points
- Clear outcomes
- Significant emotional shifts

### 2. Batch Writes When Possible

If creating multiple nodes at once, use batch functions:
```typescript
import { recordMultipleNodes, linkMultipleNodes } from '@total-audio/core-cmg';

const nodes = [/* ... */];
const createdNodes = await recordMultipleNodes(nodes);

const edges = [/* ... */];
await linkMultipleNodes(edges);
```

### 3. Link Related Nodes

Create edges between related nodes to build the graph:
```typescript
import { linkNodes } from '@total-audio/core-cmg';

// After creating two related nodes:
await linkNodes(
  fromNodeId,
  toNodeId,
  'influences', // or 'precedes', 'resolves', etc.
  0.8, // weight 0-1
  userId
);
```

### 4. Cache Fingerprints

Fingerprint computation can be expensive. The system automatically caches results, but you can also:
```typescript
import { getFingerprintSummary } from '@total-audio/core-cmg';

// Try to get cached fingerprint first
const cached = await getFingerprintSummary(userId, '90d');
if (cached) {
  // Use cached fingerprint
}
```

### 5. Use Appropriate Windows

Choose the right window for your context:
- `'30d'` - Recent patterns, quick adaptation
- `'90d'` - Default, balanced view
- `'6m'` - Long-term trends
- `'lifetime'` - All-time creative fingerprint

---

## Testing Integration

To test your integration:

1. Create some test data (memories, events, outcomes)
2. Check the CMG nodes were created:
   ```sql
   SELECT * FROM cmg_nodes WHERE user_id = 'your-user-id' ORDER BY occurred_at DESC;
   ```
3. Compute a fingerprint:
   ```typescript
   const fingerprint = await computeCreativeFingerprint({ userId, window: '30d' });
   console.log(fingerprint);
   ```
4. Visit `/memory/timeline` to visualise the graph

---

## Troubleshooting

**Problem:** Nodes not appearing in timeline

**Solution:** Check that:
- `occurred_at` is set correctly
- `user_id` matches authenticated user
- RLS policies are working (user is authenticated)

**Problem:** Fingerprint is all defaults

**Solution:**
- Need at least 5-10 nodes to generate meaningful patterns
- Ensure nodes have varied `importance`, `sentiment`, and `os` values

**Problem:** Integration is slow

**Solution:**
- Use batch functions for multiple nodes
- Don't compute fingerprints on every request - cache them
- Use background jobs for non-critical integrations

---

## Future Enhancements

Planned improvements for CMG integration:

1. **Automatic Edge Creation** - ML-based relationship detection
2. **Real-time Pattern Notifications** - Alert when new motifs emerge
3. **Collaborative Fingerprints** - Merge fingerprints from multiple users
4. **Pattern Recommendations** - Suggest structural patterns based on goals

---

Last updated: Phase 22
