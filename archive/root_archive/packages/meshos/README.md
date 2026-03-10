# @total-audio/meshos

MeshOS Phase 13: Scheduled Reasoning, Contradiction Graph & Insight Summaries

**READ-ONLY meta-coordination layer** for Total Audio Platform

## Overview

MeshOS is a coordination system that reads from multiple platform systems (Autopilot, MAL, CoachOS, CIS, Scenes, Talent, MIG, CMG, Identity, RCF, Fusion) and produces:

- **Scheduled reasoning cycles** (hourly, daily, weekly)
- **Contradiction graphs** showing system conflicts
- **Daily insight summaries** aggregating opportunities, conflicts, plans, and drift

**IMPORTANT**: MeshOS is READ-ONLY. It reads from other systems but only writes to `mesh_*` tables. It produces recommendations and reports but does NOT execute side effects (no emails, no campaigns).

## Features

### 1. Scheduled Reasoning Cycles

Run reasoning cycles at different intervals with adaptive thresholds:

- **Hourly**: High-impact opportunities, high+ severity conflicts
- **Daily**: Medium+ impact opportunities, medium+ severity conflicts
- **Weekly**: All opportunities and conflicts

```typescript
import { runScheduledCycle } from '@total-audio/meshos';

const result = await runScheduledCycle('daily');
// Returns: ScheduledReasoningResult with opportunities, conflicts, drift counts
```

### 2. Contradiction Graph

Build a graph showing contradictions between systems:

```typescript
import { getContradictionGraphSnapshot } from '@total-audio/meshos';

const graph = await getContradictionGraphSnapshot();
// Returns: MeshContradictionGraph with nodes (systems) and edges (contradictions)
```

### 3. Insight Summaries

Generate daily summaries aggregating opportunities, conflicts, plans, and drift:

```typescript
import { generateDailySummary } from '@total-audio/meshos';

const summary = await generateDailySummary();
// Returns: DailySummary with top opportunities, conflicts, plans (7d/30d/90d), drift
```

## Installation

```bash
npm install @total-audio/meshos
# or
pnpm add @total-audio/meshos
```

## API Endpoints

When integrated with command-centre app:

- `POST /api/meshos/reasoning/run` - Run scheduled reasoning cycle
- `GET /api/meshos/drift/graph` - Get contradiction graph snapshot
- `GET /api/meshos/summary/today` - Get today's insight summary
- `GET /api/meshos/summary/[date]` - Get summary for specific date (YYYY-MM-DD)

## UI Pages

Available at `/meshos` in command-centre:

- `/meshos` - Main dashboard with Today's Summary
- `/meshos/drift` - Contradiction graph visualization
- `/meshos/plans` - Plans referenced in summaries (7d/30d/90d)
- `/meshos/negotiations` - Cross-system negotiations (placeholder)

## Database Tables

MeshOS uses these tables (not included in package, defined in platform):

- `mesh_state` - Key-value store for reasoning results and summaries
- `mesh_drift_reports` - Drift and contradiction reports
- `mesh_plans` - Cross-system coordination plans
- `mesh_messages` - Inter-system messages
- `mesh_negotiations` - Conflict resolution negotiations
- `mesh_insight_routes` - Insight routing configuration

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm run test

# Type checking
npm run typecheck
```

## Testing

Comprehensive test suite covering:

- Reasoning scheduler (time windows, thresholds, aggregation)
- Contradiction graph (node/edge structure, filtering, top conflicts)
- Insight summariser (summary generation, helpers, metrics)

Run tests: `npm test`

## Architecture

```
MeshOS (READ-ONLY)
    ↓ reads from
[Autopilot, MAL, CoachOS, CIS, Scenes, Talent, MIG, CMG, Identity, RCF, Fusion]
    ↓ writes to
[mesh_state, mesh_drift_reports, mesh_plans, etc.]
    ↓ consumed by
[Command Centre UI, External schedulers, Notification systems]
```

## Example Outputs

See `examples/` directory for:

- Scheduled reasoning result JSON
- Contradiction graph JSON
- Daily summary JSON

## License

Proprietary - Total Audio Platform
