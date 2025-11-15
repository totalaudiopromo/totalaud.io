# LoopOS - Phase 3: Deep Ecosystem Integration Prep

**Version**: 1.0.0
**Status**: ✅ Complete
**Last Updated**: 15 November 2025

---

## 🎯 Overview

LoopOS is the artist-facing OS for music promotion within the TotalAudio ecosystem. Phase 3 adds deep ecosystem integration prep with:

- ✅ Supabase authentication & multi-user isolation
- ✅ Node dependencies & sequencing engine
- ✅ Console export pipeline (stub integration)
- ✅ Loop Health v2 with advanced insights
- ✅ Notes v2 with tags, backlinks, and AI organisation
- ✅ Momentum automation with decay & anti-drop
- ✅ Command palette (⌘K) with global search
- ✅ Loop templates & JSON import/export

---

## 🏗️ Architecture

```
apps/loopos/
├── app/                          # Next.js 15 App Router
│   ├── login/                    # Authentication pages
│   ├── app/                      # Protected app routes
│   ├── api/                      # API routes
│   │   ├── notes/                # Note APIs
│   │   ├── momentum/             # Momentum APIs
│   │   ├── integrations/         # Console export
│   │   └── loops/                # Template import
│   └── auth/                     # Auth callback
├── src/
│   ├── components/               # React components
│   │   └── CommandPalette.tsx    # ⌘K command palette
│   ├── lib/                      # Utilities
│   │   ├── supabase/             # Supabase clients
│   │   ├── env.ts                # Environment validation
│   │   ├── exportLoop.ts         # JSON export
│   │   ├── importLoop.ts         # JSON import
│   │   ├── exportToConsole.ts    # Console integration
│   │   └── aiOrganiseNotes.ts    # AI note organisation
│   ├── hooks/                    # React hooks
│   │   ├── useUser.ts            # Auth state
│   │   ├── useMomentum.ts        # Momentum tracking
│   │   ├── useConsoleExport.ts   # Export to Console
│   │   └── useCommandPalette.ts  # Command palette control
│   ├── state/                    # Zustand stores
│   │   └── authStore.ts          # Authentication state
│   ├── sequence/                 # Sequencing engine
│   │   └── SequenceEngine.ts     # Dependency resolution
│   ├── insights/                 # Health monitoring
│   │   └── LoopInsightsEngineV2.ts  # Advanced insights
│   ├── momentum/                 # Momentum system
│   │   └── MomentumAutomation.ts # Decay & anti-drop
│   ├── notes/                    # Note system
│   │   └── NoteLinker.ts         # Backlinks & relationships
│   └── templates/                # Loop templates
│       └── defaultLoops.ts       # Prebuilt workflows
└── middleware.ts                 # Route protection

packages/loopos-db/               # Database package
├── src/
│   ├── types.ts                  # TypeScript types
│   ├── schemas.ts                # Zod validation
│   └── utils.ts                  # Database utilities
```

---

## 🗄️ Database Schema

### Tables Created

1. **loopos_nodes** - Core workflow nodes
2. **loopos_notes** - Enhanced notes system
3. **loopos_momentum** - User momentum tracking
4. **loopos_exports** - Console integration exports
5. **loopos_node_executions** - Execution history
6. **loopos_loop_templates** - Prebuilt templates

All tables include:
- Row-Level Security (RLS) policies
- User isolation (`user_id` foreign key)
- Automatic timestamps
- Indexes for performance

### Migration

```bash
# Apply migration
supabase db push
```

Migration file: `supabase/migrations/20251115120000_create_loopos_tables.sql`

---

## 🔑 Authentication

### Features

- Magic link authentication (passwordless)
- Session management via Supabase
- Protected routes via middleware
- Client + server auth state sync

### Usage

```typescript
// Client components
import { useUser } from '@/hooks/useUser'

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useUser()

  if (!isAuthenticated) return <div>Please log in</div>

  return <div>Welcome, {user.email}!</div>
}
```

```typescript
// Server components
import { createClient } from '@/lib/supabase/server'

export default async function ServerPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ...
}
```

---

## 🔗 Node Dependencies & Sequencing

### Sequence Engine

The `SequenceEngine` provides:

- **Dependency resolution** - Topological sorting
- **Circular dependency detection** - DFS-based cycle detection
- **Auto-start nodes** - Automatic progression
- **Sequence mapping** - Visual dependency graph
- **Health warnings** - Missing/blocked dependencies

### Usage

```typescript
import { SequenceEngine } from '@/sequence/SequenceEngine'

// Analyse sequence
const sequenceMap = SequenceEngine.analyseSequence(nodes)

// Check for warnings
sequenceMap.warnings.forEach(warning => {
  console.log(warning.type, warning.message)
})

// Get ready nodes
const ready = SequenceEngine.getReadyNodes(nodes)

// Get next auto-start node
const next = SequenceEngine.getNextAutoStartNode(nodes)
```

---

## 📤 Console Export Pipeline

### Status

**Stub integration** - Prepares for future Console sync

### Features

- Convert nodes/notes to Console export format
- Store exports in `loopos_exports` table
- Validate export payloads with Zod
- Track sync status (pending/synced/failed)

### Usage

```typescript
import { useConsoleExport } from '@/hooks/useConsoleExport'

function NodeCard({ node }) {
  const { exportNode, isExporting } = useConsoleExport()

  async function handleExport() {
    const result = await exportNode(node)
    if (result.success) {
      console.log('Exported:', result.export_id)
    }
  }

  return (
    <button onClick={handleExport} disabled={isExporting}>
      Export to Console
    </button>
  )
}
```

### API Endpoint

```bash
POST /api/integrations/console
Content-Type: application/json

{
  "type": "promotion",
  "content": "...",
  "metadata": {
    "source": "loopos",
    "source_id": "uuid",
    "source_type": "node"
  },
  "suggested_date": "2025-12-01"
}
```

---

## 💚 Loop Health v2

### Health Dimensions

1. **Dependency Health** - No circular/missing deps
2. **Sequence Health** - Progress & completion rate
3. **Momentum Health** - Current momentum level
4. **Balance Health** - Creative vs promotional mix
5. **Workload Health** - Not overloaded/idle

### Insights Generated

- Circular dependency errors
- Workload overheating warnings
- Creative fatigue detection
- Balance imbalance alerts
- Momentum drop warnings
- Streak achievements

### Usage

```typescript
import { LoopInsightsEngineV2 } from '@/insights/LoopInsightsEngineV2'

const report = LoopInsightsEngineV2.analyseLoopHealth(nodes, momentum)

console.log('Overall health:', report.health_score.overall)
console.log('Warnings:', report.warnings)
console.log('Insights:', report.insights)
console.log('Next actions:', report.recommended_next_actions)
console.log('Momentum trend:', report.momentum_trend)
console.log('Workload:', report.workload_status)
```

---

## 📝 Notes v2

### Features

- **Tags** - Multi-tag organisation
- **Backlinks** - Automatic `[[Note Title]]` detection
- **Node linking** - `@NodeTitle` syntax
- **AI summarisation** - Claude-powered summaries
- **AI clustering** - Thematic organisation
- **Note networks** - Connected note graphs

### Syntax

```markdown
# My Note

This references [[Another Note]] and links to @MyNode.

#creative #planning
```

### NoteLinker

```typescript
import { NoteLinker } from '@/notes/NoteLinker'

// Extract references
const noteRefs = NoteLinker.extractNoteReferences(content, allNotes)
const nodeRefs = NoteLinker.extractNodeReferences(content, allNodes)

// Calculate backlinks
const backlinks = NoteLinker.calculateBacklinks(noteId, allNotes)

// Get note network
const network = NoteLinker.getNoteNetwork(noteId, allNotes, 2)

// Suggest related notes
const related = NoteLinker.suggestRelatedNotes(note, allNotes, 5)
```

### AI Organisation

```typescript
import { summariseNote, clusterNotesByTheme } from '@/lib/aiOrganiseNotes'

// Summarise single note
const summary = await summariseNote(note)

// Cluster multiple notes
const clusters = await clusterNotesByTheme(notes)
```

### API Endpoints

```bash
# Summarise note
POST /api/notes/summarise
{ "note_id": "uuid" }

# Cluster notes
POST /api/notes/cluster
```

---

## ⚡ Momentum Automation

### Features

- **Automatic decay** - Every 6 hours
- **Streak tracking** - Daily action streaks
- **Anti-drop suggestions** - When momentum low
- **Milestone rewards** - Momentum cap increases
- **Sequence boosts** - Bonus for completed sequences

### Momentum Mechanics

- **Base max**: 100
- **Decay rate**: Configurable per user
- **Decay interval**: Every 6 hours
- **Cap increase**: +10 per 20 tasks completed

### Usage

```typescript
import { MomentumAutomation } from '@/momentum/MomentumAutomation'

// Apply decay (called by cron)
const decayResult = await MomentumAutomation.applyDecay(supabase, userId)

// Add momentum on completion
const update = await MomentumAutomation.addMomentum(supabase, userId, 5)

// Generate suggestions
const suggestions = MomentumAutomation.generateAntiDropSuggestions(momentum, nodes)
```

### Cron Job

```bash
# Call every 6 hours
POST /api/momentum/cron
Authorization: Bearer YOUR_CRON_SECRET
```

---

## ⌘K Command Palette

### Features

- **Global search** - Nodes, notes, actions
- **Keyboard navigation** - ↑↓ arrow keys
- **Quick actions** - Create node/note
- **Navigation** - Jump to any route
- **Fuzzy search** - Title + subtitle matching

### Shortcuts

- `⌘K` / `Ctrl+K` - Open palette
- `Escape` - Close palette
- `↑` / `↓` - Navigate items
- `Enter` - Select item

### Usage

```typescript
import { useCommandPalette } from '@/hooks/useCommandPalette'

function MyComponent() {
  const { open, close, toggle } = useCommandPalette()

  return (
    <button onClick={open}>Open Command Palette</button>
  )
}
```

---

## 📦 Loop Templates & Import/Export

### Export Loop

```typescript
import { exportLoop, downloadLoopAsJSON, copyLoopToClipboard } from '@/lib/exportLoop'

// Export loop
const loopExport = exportLoop(nodes, notes, 'My Workflow', 'Description')

// Download as JSON
downloadLoopAsJSON(loopExport)

// Copy to clipboard
await copyLoopToClipboard(loopExport)
```

### Import Loop

```typescript
import { validateLoopImport, importLoop, readLoopFromFile } from '@/lib/importLoop'

// Read from file
const { json } = await readLoopFromFile(file)

// Validate
const { valid, data, errors } = validateLoopImport(json)

// Import
const result = importLoop(data, userId)

// Insert to database
await supabase.from('loopos_nodes').insert(result.nodes)
await supabase.from('loopos_notes').insert(result.notes)
```

### API Endpoint

```bash
POST /api/loops/import
Content-Type: application/json

{
  "loop_json": "{\"version\":\"1.0\", ...}"
}
```

### Default Templates

3 prebuilt templates available:

1. **Single Release Campaign** - Complete single release workflow
2. **Album Pre-Release Workflow** - Build momentum before album
3. **Creative Sprint** - 7-day intensive creative workflow

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd apps/loopos
pnpm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-key
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

### 3. Run Migrations

```bash
# From project root
pnpm db:migrate
```

### 4. Start Dev Server

```bash
pnpm dev
```

LoopOS runs on **http://localhost:3001**

---

## 📚 Key Features Checklist

- [x] Supabase authentication with magic links
- [x] Multi-user isolation with RLS
- [x] Node dependency system
- [x] Sequence engine with circular detection
- [x] Auto-start nodes
- [x] Console export pipeline (stub)
- [x] Loop Health v2 with 5 health dimensions
- [x] Advanced insights generation
- [x] Notes v2 with tags & backlinks
- [x] AI note summarisation (Claude)
- [x] AI note clustering
- [x] Momentum automation with decay
- [x] Streak tracking
- [x] Anti-drop suggestions
- [x] Command palette (⌘K)
- [x] Global search
- [x] Loop templates
- [x] JSON import/export
- [x] Default workflows (3 templates)

---

## 🎨 Design System

- **Matte Black**: `#0F1113` (background)
- **Slate Cyan**: `#3AA9BE` (accent)
- **Motion**: 120ms/240ms/400ms cubic-bezier
- **Typography**: Inter (sans), JetBrains Mono (mono)
- **British English**: All text uses British spelling

---

## 🔐 Security

- All routes protected by middleware
- Row-Level Security on all tables
- User isolation enforced at database level
- Environment variables validated on startup
- API request validation with Zod

---

## 🧪 Testing

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format
pnpm format
```

---

## 📝 API Reference

### Authentication

- `GET /` - Redirect to app or login
- `GET /login` - Magic link login page
- `GET /auth/callback` - Auth callback

### Nodes

(Coming in Phase 4 - UI implementation)

### Notes

- `POST /api/notes/summarise` - AI summarise note
- `POST /api/notes/cluster` - AI cluster notes

### Momentum

- `POST /api/momentum/cron` - Apply decay (scheduled)

### Integrations

- `POST /api/integrations/console` - Export to Console
- `GET /api/integrations/console` - List exports

### Loops

- `POST /api/loops/import` - Import loop from JSON

---

## 🚧 Future Enhancements (Phase 4+)

- [ ] Full UI implementation (Canvas, NodeEditor, etc.)
- [ ] Drag-select on canvas
- [ ] Snapping + guides
- [ ] Light/Lux mode
- [ ] Real-time collaboration
- [ ] Live Console integration (remove stub)
- [ ] Mobile app
- [ ] Offline mode

---

## 📦 Dependencies

### Core

- Next.js 15.0.3
- React 18.2.0
- TypeScript 5
- Supabase (auth + database)
- Zustand (state management)

### UI

- Tailwind CSS 3.4.0
- Framer Motion 11.0.0
- React Hot Toast 2.6.0
- Lucide React 0.546.0

### Utilities

- Zod 3.22.4 (validation)
- Nanoid 5.1.6 (ID generation)
- Anthropic SDK 0.17.0 (AI)

---

## 👥 Team

Built by Claude Code following the LoopOS Phase 3 specification.

---

## 📄 License

Proprietary - TotalAudio Platform

---

**Status**: ✅ Phase 3 Complete - Ready for UI implementation
