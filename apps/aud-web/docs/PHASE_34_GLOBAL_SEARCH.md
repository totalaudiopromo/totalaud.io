# Phase 34: Global Search Engine

**Status**: ✅ Complete
**Integration**: Phase 33 (Command Palette), Phase 11 (Memory Graph), Phase 31 (Rhythm), Phase 32 (Smart Linking)

---

## Overview

Phase 34 implements a unified backend search engine that powers cross-surface content discovery across totalaud.io. It fuses data from all surfaces (notebook, timeline, journal, coach, designer, rhythm, memory) with intelligent scoring, semantic awareness, and British spelling normalisation.

### Powers

1. **⌘K Command Palette** (Phase 33) - Unified search interface
2. **Future /search Page** - Dedicated search surface (coming soon)
3. **AI Agents** - Cross-surface context retrieval
4. **TAP Integration** - Multi-source creative briefing (preview mode)

---

## Architecture

### Core Layers

```
┌─────────────────────────────────────────────────┐
│           Client Applications                   │
│  ⌘K Palette  │  /search  │  AI Agents  │  TAP  │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         POST /api/search (Unified API)          │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│         Search Engine (engine.ts)               │
│  • Query normalisation                          │
│  • Parallel source aggregation                  │
│  • Result grouping & limiting                   │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│          Source Aggregators (10)                │
│  notes  │  cards  │  timeline  │  journal       │
│  coach  │  scenes │  memory    │  rhythm        │
│  workspaces  │  tap (preview)                   │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│          Scoring & Ranking System               │
│  • Fuzzy text matching                          │
│  • Recency weighting                            │
│  • Type weighting                               │
│  • Semantic bonuses (Memory Graph)              │
└─────────────────────────────────────────────────┘
```

---

## File Structure

```
apps/aud-web/src/
├── lib/search/
│   ├── index.ts                 # Public API exports
│   ├── engine.ts                # Main orchestrator
│   ├── normalise.ts             # British spelling + text normalisation
│   ├── scoring.ts               # Fuzzy matching + relevance scoring
│   ├── semantic.ts              # Memory Graph integration
│   └── sources/
│       ├── notes.ts             # Search notebook notes
│       ├── cards.ts             # Search analogue cards
│       ├── timeline.ts          # Search timeline nodes
│       ├── journal.ts           # Search journal entries
│       ├── coach.ts             # Search coach messages
│       ├── scenes.ts            # Search designer scenes
│       ├── memory.ts            # Search memory themes
│       ├── rhythm.ts            # Search rhythm insights
│       ├── workspaces.ts        # Search workspaces
│       └── tap.ts               # TAP preview (stub)
├── app/api/search/
│   └── route.ts                 # POST /api/search endpoint
└── hooks/palette/
    └── useEnhancedSearch.ts     # Palette integration hook
```

---

## Text Normalisation

### British Spelling Mappings (normalise.ts)

Ensures consistent matching across British and American spellings:

```typescript
colour → color
behaviour → behavior
centre → center
organise → organize
analyse → analyze
visualise → visualize
recognise → recognize
favourite → favorite
theatre → theater
dialogue → dialog
catalogue → catalog
licence → license
practise → practice
... (30+ mappings)
```

### Accent Removal

```typescript
café → cafe
naïve → naive
résumé → resume
façade → facade
... (15+ mappings)
```

### Processing Pipeline

```typescript
normaliseText('Café: Organise creative behaviour')
  → 'cafe organize creative behavior'

normaliseQuery('Search my favourite rhythm patterns')
  → 'favorite rhythm patterns' (also removes stop words)
```

---

## Scoring System

### Fuzzy Text Matching (scoring.ts)

**Base Scores**:
- Exact match: `1.0`
- Starts with: `0.9`
- Contains: `0.7`
- Partial fuzzy (char-by-char): `0.4-0.6`
- No match: `0.0`

**Multi-Field Weighting**:
```typescript
calculateFinalScore(query, result) {
  titleScore    × 1.0
  subtitleScore × 0.7
  bodyScore     × 0.5
  keywordsScore × 0.8
}
```

### Recency Bonus

```typescript
Last 48 hours: +0.15
Last 7 days:   +0.1
Last 30 days:  +0.05
Older:         +0.0
```

### Type Weighting

```typescript
Actions:     1.2×  // Commands, quick actions
Timeline:    1.1×  // Timeline nodes
Notes:       1.05× // Notebook notes
Scenes:      1.05× // Designer scenes
Coach:       1.0×  // Coach messages
Themes:      0.9×  // Memory themes
Rhythm:      0.9×  // Rhythm insights
Workspaces:  0.7×  // Workspace metadata
TAP:         0.6×  // TAP preview items
```

### Semantic Bonus (Future)

```typescript
// Calculated via Memory Graph (Phase 11)
Shared themes:    +0.1 to +0.25
"related_to" edge: +0.05 to +0.15
"inspires" edge:   +0.1
Core themes:       +0.2

// Currently stubbed - returns 0.0
```

### Final Score Formula

```typescript
finalScore = (
  baseTextScore
  + recencyBonus
  + semanticBonus
) × typeWeight
```

---

## Search Engine API

### Main Engine (engine.ts)

```typescript
interface SearchOptions {
  query: string
  workspaceId: string
  maxPerGroup?: number        // Default: 5
  includeActions?: boolean    // Include commands
  includeTAP?: boolean        // Include TAP preview
}

interface SearchResponse {
  groups: {
    actions?: SearchResult[]
    notes: SearchResult[]
    cards: SearchResult[]
    timeline: SearchResult[]
    journal: SearchResult[]
    coach: SearchResult[]
    scenes: SearchResult[]
    themes: SearchResult[]
    rhythm: SearchResult[]
    workspaces: SearchResult[]
    tap: SearchResult[]
  }
  query: string
  totalResults: number
}
```

### Search Functions

**1. Grouped Search (Default)**

```typescript
import { search } from '@/lib/search'

const results = await search({
  query: 'radio promotion',
  workspaceId: 'workspace-uuid',
  maxPerGroup: 5,
  includeActions: false,
  includeTAP: false,
})

console.log(results.groups.notes)    // Up to 5 notes
console.log(results.groups.timeline) // Up to 5 nodes
console.log(results.totalResults)    // Total count
```

**2. Flat Search (For AI Agents)**

```typescript
import { searchFlat } from '@/lib/search'

const results = await searchFlat({
  query: 'release planning',
  workspaceId: 'workspace-uuid',
})

// Returns flat array sorted by score DESC
results.forEach(result => {
  console.log(result.title, result.score, result.type)
})
```

---

## HTTP API Endpoint

### POST /api/search

**Request**:
```json
{
  "query": "radio promotion",
  "workspaceId": "workspace-uuid",
  "maxPerGroup": 5,
  "includeActions": false,
  "includeTAP": false
}
```

**Response** (200 OK):
```json
{
  "groups": {
    "notes": [
      {
        "id": "note-1",
        "type": "note",
        "title": "BBC Radio 1 Contact List",
        "subtitle": "Updated October 2025",
        "body": "Full list of radio contacts...",
        "date": "2025-10-15T10:30:00Z",
        "score": 0.95
      }
    ],
    "timeline": [...],
    "journal": [...],
    ...
  },
  "query": "radio promotion",
  "totalResults": 23
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Invalid request",
  "details": [
    {
      "path": ["query"],
      "message": "Query is required"
    }
  ]
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Search failed",
  "message": "Database connection timeout"
}
```

---

## Source Aggregators

Each source implements a standard interface:

```typescript
export async function searchNotes(
  query: string,
  workspaceId: string
): Promise<SearchResult[]>
```

### Result Type

```typescript
interface SearchResult {
  id: string
  type: 'note' | 'card' | 'node' | 'journal' | 'coach' |
        'scene' | 'theme' | 'rhythm' | 'workspace' | 'tap' | 'action'
  title: string
  subtitle?: string
  body?: string
  date?: string
  context?: Record<string, any>
  score: number
}
```

### Current Implementation

**Preview Mode**: All sources return mock data with realistic scoring
**Production TODO**: Replace with actual database queries

```typescript
// Current (mock)
const mockNotes = [
  { id: 'note-1', title: 'BBC Radio 1 Contact List', ... }
]

// Production (future)
const { data: notes, error } = await supabase
  .from('loopos_notes')
  .select('*')
  .eq('workspace_id', workspaceId)
  .ilike('content', `%${query}%`)
```

---

## Integration with Command Palette (Phase 33)

### Enhanced Search Hook (useEnhancedSearch.ts)

Combines local command filtering with remote content search:

```typescript
import { useEnhancedSearch } from '@/hooks/palette/useEnhancedSearch'

const { groups, isLoading, error } = useEnhancedSearch({
  query,
  commands: visibleCommands,
  workspaceId: 'workspace-uuid',
  debounceMs: 300, // Wait 300ms after typing stops
})
```

**Features**:
- Instant local command filtering (no API call)
- Debounced API search for content (300ms)
- Automatic result combining and grouping
- Loading states for UI feedback
- Error handling with fallback

### Result Navigation

When a search result is selected:

```typescript
function getNavigationUrl(type: string, id: string): string {
  const urlMap = {
    note: `/workspace/notebook?note=${id}`,
    card: `/workspace/notebook?card=${id}`,
    node: `/workspace/timeline?node=${id}`,
    journal: `/workspace/journal?entry=${id}`,
    coach: `/workspace/coach`,
    scene: `/workspace/designer?scene=${id}`,
    theme: `/workspace/memory?theme=${id}`,
    rhythm: `/workspace/rhythm`,
    workspace: `/workspace?id=${id}`,
    tap: `/workspace/tap?preview=${id}`,
  }
  return urlMap[type] || '/workspace'
}
```

---

## Performance Optimisation

### Parallel Source Aggregation

```typescript
// All sources searched simultaneously
const [
  notesResults,
  cardsResults,
  timelineResults,
  // ... 10 sources total
] = await Promise.all([
  searchNotes(query, workspaceId),
  searchCards(query, workspaceId),
  searchTimeline(query, workspaceId),
  // ... etc
])
```

**Benefit**: Search completes in time of slowest source, not sum of all sources

### Result Limiting

```typescript
// Limit results per group (default: 5)
const limitResults = (results: SearchResult[]) =>
  results.slice(0, maxPerGroup)
```

**Benefit**: Reduces payload size, improves UI rendering

### Debounced API Calls

```typescript
// Wait 300ms after user stops typing
const timeoutId = setTimeout(async () => {
  // Make API call
}, 300)
```

**Benefit**: Reduces API calls by ~80% during typing

---

## Semantic Memory Integration (Phase 11)

### Theme Extraction

```typescript
extractQueryThemes('planning my radio campaign')
  → ['Release Planning', 'Radio Promotion']

extractQueryThemes('creative studio workflow')
  → ['Studio Production', 'Creative Process']
```

**Categories** (10):
- Release Planning
- Radio Promotion
- Content Creation
- Social Media
- Live Performance
- Studio Production
- Fan Engagement
- Creative Process
- Business & Finance
- Mental Wellbeing

### Semantic Scoring (Future)

```typescript
// Query Memory Graph for relationships
const semanticBonus = await calculateSemanticBonus(
  query,
  resultId,
  workspaceId
)

// Factors:
// - Shared themes with query
// - "related_to" edges
// - "inspires" edges
// - Core theme importance
```

**Current Status**: Stubbed - returns `0.0`
**Production TODO**: Implement Memory Graph queries

---

## TAP Integration (Preview Mode)

### TAP Source (tap.ts)

Returns stubbed results to demonstrate TAP integration:

```typescript
const mockTAP = [
  {
    id: 'tap-1',
    title: 'TAP: Campaign template',
    subtitle: 'Total Audio Platform • Preview',
    body: 'Pre-built campaign template from TAP library',
  }
]
```

**Production TODO**:
- Connect to TAP API
- Fetch real campaign templates
- Integrate contact database
- Surface promotional opportunities

---

## Testing

### Manual Testing

**1. Test Command Palette Integration**:
```
1. Press ⌘K
2. Type "radio"
3. Verify: See both commands AND content results
4. Verify: Results update after 300ms typing pause
5. Verify: Loading indicator during API call
```

**2. Test API Directly**:
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "radio promotion",
    "workspaceId": "demo-workspace-id",
    "maxPerGroup": 3
  }'
```

**3. Test British Spelling**:
```typescript
// Both should match identically:
search({ query: 'colour' })
search({ query: 'color' })
```

**4. Test Scoring**:
```typescript
// Exact match beats partial:
"BBC Radio 1" vs "radio promotion" for query "BBC Radio 1"

// Recent beats older:
Created 1 day ago vs created 30 days ago (same text match)

// Type weighting works:
Action vs Note vs Workspace (same text match)
```

### Production Testing Checklist

- [ ] Replace mock data with Supabase queries
- [ ] Add authentication middleware
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Set up error monitoring
- [ ] Add caching layer (Redis)
- [ ] Implement semantic scoring with Memory Graph
- [ ] Connect real TAP API
- [ ] Add pagination for large result sets
- [ ] Implement result highlighting (matched terms)

---

## Migration from Phase 33

### Before (Phase 33 Only)

```typescript
// Local command filtering only
const results = filterCommands(visibleCommands, query)
const groups = groupResults(results)
```

### After (Phase 33 + 34)

```typescript
// Combined local + remote search
const { groups, isLoading } = useEnhancedSearch({
  query,
  commands: visibleCommands,
  workspaceId: 'workspace-uuid',
})
```

**Benefits**:
- Search across ALL surfaces (not just commands)
- Unified scoring across content types
- Semantic awareness (future)
- TAP integration (preview)

---

## Future Enhancements

### Short Term
- [ ] Replace mock data with real database queries
- [ ] Get workspace ID from auth context
- [ ] Add result highlighting (matched query terms)
- [ ] Implement pagination for /search page

### Medium Term
- [ ] Full semantic scoring with Memory Graph
- [ ] TAP API integration
- [ ] Search filters (by type, date range)
- [ ] Saved searches
- [ ] Search history

### Long Term
- [ ] Vector search with embeddings
- [ ] Natural language query understanding
- [ ] Cross-workspace search (for admins)
- [ ] Search analytics dashboard
- [ ] Personalised ranking based on user behaviour

---

## British English Compliance

All code, comments, and user-facing strings use British English:

```typescript
// ✅ Correct
normaliseText()
normaliseQuery()
recognise()
behaviour

// ❌ Incorrect
normalizeText()
normalizeQuery()
recognize()
behavior
```

**Exception**: Framework conventions preserved:
```typescript
// Keep React/JS conventions
backgroundColor (React prop)
color (CSS property)
```

---

## Credits

**Phase 34** (Global Search Engine)
Designed and implemented: October 2025
Integrates: Phase 33 (Palette), Phase 11 (Memory), Phase 31 (Rhythm), Phase 32 (Linking)

---

## Support

For questions or issues with Phase 34:
1. Check this documentation
2. Review source code comments
3. Test with mock data first
4. Verify British spelling normalisation
5. Check browser console for logs (logger.ts)

**Related Documentation**:
- [PHASE_33_COMMAND_PALETTE.md](./PHASE_33_COMMAND_PALETTE.md)
- [CLAUDE.md](../CLAUDE.md) - Project conventions
- [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) - Quality tooling

---

**Last Updated**: November 2025
**Status**: ✅ Complete - Ready for production database integration
