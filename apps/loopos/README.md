# LoopOS — Phase 2: Intelligence + Persistence

**Status**: ✅ Complete
**Version**: 2.0.0
**Last Updated**: 2025-11-15

---

## 🎯 Overview

LoopOS is an **intelligent, persistent creative operating system** designed for music creators. Phase 2 adds AI-powered intelligence and Supabase persistence to transform the creative loop into a self-optimizing system.

### What's New in Phase 2

- ✅ **Supabase Persistence** — All nodes, notes, and momentum saved to database
- ✅ **AI Agent Execution** — 4 specialized agents (Create, Promote, Analyse, Refine)
- ✅ **Daily Action Generation** — AI-generated priority tasks based on loop state
- ✅ **Loop Insights Engine** — Real-time AI feedback on loop health
- ✅ **React Flow Canvas** — Visual loop representation
- ✅ **Zustand State Management** — Client-side state with auto-sync
- ✅ **Responsive UI** — Mobile-first 2-column layout

---

## 🏗️ Architecture

```
apps/loopos/
├── src/
│   ├── app/                   # Next.js 15 App Router
│   │   ├── api/              # API routes
│   │   │   ├── nodes/        # Node CRUD
│   │   │   ├── notes/        # Note CRUD
│   │   │   ├── momentum/     # Momentum CRUD
│   │   │   └── ai/           # AI endpoints
│   │   ├── layout.tsx
│   │   └── page.tsx          # Main UI
│   ├── agents/               # AI Agent System
│   │   ├── types.ts          # Agent type definitions
│   │   ├── prompts.ts        # Agent system prompts
│   │   └── AgentExecutor.ts  # AI execution engine
│   ├── components/           # React components
│   │   ├── LoopCanvas.tsx    # React Flow canvas
│   │   ├── MomentumMeter.tsx # Momentum display
│   │   ├── DailyActions.tsx  # AI-generated actions
│   │   ├── NotesList.tsx     # Note management
│   │   └── LoopInsights.tsx  # AI insights
│   ├── insights/             # Loop Intelligence
│   │   └── LoopInsightsEngine.ts
│   ├── lib/                  # Utilities
│   │   ├── syncNodes.ts      # Node sync helpers
│   │   ├── syncNotes.ts      # Note sync helpers
│   │   ├── syncMomentum.ts   # Momentum sync helpers
│   │   └── generateDailyActions.ts
│   └── state/                # Zustand stores
│       ├── loopStore.ts
│       ├── notesStore.ts
│       └── momentumStore.ts
│
packages/loopos-db/           # Database package
├── src/
│   ├── dbClient.ts           # Supabase clients
│   ├── schemas/              # Zod schemas
│   │   ├── node.ts
│   │   ├── note.ts
│   │   └── momentum.ts
│   └── queries/              # Database queries
│       ├── nodes.ts
│       ├── notes.ts
│       └── momentum.ts
```

---

## 📊 Database Schema

### Tables

#### `loopos_nodes`
Stores creative loop nodes (create/promote/analyse/refine phases).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| type | text | 'create', 'promote', 'analyse', 'refine' |
| title | text | Node title |
| description | text | Optional description |
| friction | integer | 0-10 difficulty score |
| priority | integer | 0-10 priority score |
| status | text | 'upcoming', 'active', 'completed' |
| position_x | real | Canvas X position |
| position_y | real | Canvas Y position |
| metadata | jsonb | Additional data |
| last_triggered | timestamptz | Last execution time |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### `loopos_notes`
Stores creative notes categorised by type.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| category | text | 'idea', 'task', 'insight', 'blocker', 'win' |
| title | text | Note title |
| body | text | Note content |
| metadata | jsonb | Additional data |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

#### `loopos_momentum`
Stores user momentum and streak data (one row per user).

| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Primary key, FK to auth.users |
| momentum | integer | 0-100 momentum score |
| streak | integer | Consecutive days streak |
| last_gain | timestamptz | Last momentum gain time |
| last_reset | timestamptz | Last streak reset time |
| metadata | jsonb | Additional data |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### Migration

```bash
# Run Supabase migration
cd /path/to/totalaud.io
supabase db push

# Or apply manually
psql -f supabase/migrations/20251115000000_create_loopos_tables.sql
```

---

## 🤖 AI Agent System

### Agent Types

#### 1. Create Agent
**Purpose**: Generate creative ideas and content tasks

**Specializations**:
- Content ideation (songs, videos, visuals)
- Lyric brainstorming
- Visual concept development
- Pre-release planning

**Example Use**: "Generate creative tasks for my upcoming single release"

#### 2. Promote Agent
**Purpose**: Generate promotional strategies and marketing tasks

**Specializations**:
- PR and media outreach
- Playlist pitching
- Social media content
- Marketing campaigns

**Example Use**: "Create a promotional plan for my new track on Spotify"

#### 3. Analyse Agent
**Purpose**: Interpret data and generate insights

**Specializations**:
- Audience analytics
- Streaming performance
- Playlist trends
- Engagement patterns

**Example Use**: "Analyse my streaming data and suggest improvements"

#### 4. Refine Agent
**Purpose**: Optimize workflows and identify improvements

**Specializations**:
- Process optimization
- Bottleneck identification
- Strategy refinement
- Doubling-down recommendations

**Example Use**: "Analyze my loop and suggest what to focus on"

### Agent Execution

```typescript
import { runAgent } from '@/agents/AgentExecutor'

const output = await runAgent('create', 'I need content ideas for my album rollout')

console.log(output.actions)          // Generated tasks
console.log(output.insights)         // AI observations
console.log(output.recommendations)  // Strategic advice
```

### API Endpoint

```bash
POST /api/ai/run-agent
Content-Type: application/json
x-user-id: <user-id>

{
  "agentType": "create",
  "context": "I need content ideas for my album rollout",
  "additionalData": {}
}
```

---

## 📅 Daily Actions System

AI-generated priority actions based on current loop state.

### How It Works

1. Analyzes all nodes (status, priority, friction)
2. Considers momentum and streak data
3. Identifies high-priority tasks
4. Generates 5 actionable tasks for TODAY
5. Returns structured actions with time estimates

### Example Output

```json
{
  "actions": [
    {
      "id": "action-1",
      "title": "Finish album artwork",
      "description": "Complete final revisions on artwork with designer",
      "priority": "high",
      "estimatedTime": "2 hours",
      "category": "create"
    }
  ]
}
```

### API Endpoint

```bash
POST /api/ai/daily-actions
Content-Type: application/json
x-user-id: <user-id>

{
  "nodes": [...],
  "momentum": {...}
}
```

---

## 🔮 Loop Insights Engine

Real-time AI feedback on loop health and opportunities.

### Insight Types

- **Momentum**: Momentum trends and streak status
- **Balance**: Loop phase distribution (create/promote/analyse/refine)
- **Friction**: High-friction tasks blocking progress
- **Opportunity**: Strategic opportunities to amplify results
- **Warning**: Critical issues requiring immediate attention

### Example Insights

```json
{
  "insights": [
    {
      "id": "insight-1",
      "type": "warning",
      "title": "Momentum critically low",
      "message": "Your momentum has dropped below 20. Focus on completing high-priority tasks to rebuild momentum.",
      "priority": "high",
      "actionable": true
    },
    {
      "id": "insight-2",
      "type": "balance",
      "title": "Loop imbalance detected",
      "message": "Your loop is missing promote nodes. Add promotional tasks for a balanced creative process.",
      "priority": "medium",
      "actionable": true
    }
  ]
}
```

### API Endpoint

```bash
POST /api/ai/insights
Content-Type: application/json
x-user-id: <user-id>

{
  "nodes": [...],
  "notes": [...],
  "momentum": {...}
}
```

---

## 🎨 UI Components

### 1. LoopCanvas
React Flow-based visual representation of loop nodes.

**Features**:
- Drag-and-drop node positioning
- Color-coded by node type
- Shows priority and friction scores
- Minimap for navigation
- Grid background

### 2. MomentumMeter
Displays current momentum and streak.

**Features**:
- Animated progress bar
- Color-coded by momentum level
- Streak counter
- Status messages

### 3. DailyActions
Shows AI-generated priority actions.

**Features**:
- Checklist interface
- Priority color coding
- Time estimates
- Category tags
- Regenerate button

### 4. LoopInsights
Displays AI-powered loop health insights.

**Features**:
- Categorized by type
- Priority highlighting
- Actionable indicators
- Animated entry

### 5. NotesList
Manages creative notes by category.

**Features**:
- Category filtering
- Icon-coded by type
- Date stamps
- Add note button

---

## 🔧 State Management

### Zustand Stores

#### loopStore
- Manages nodes array
- Tracks sync state
- Provides filtered getters (by status, by type)

#### notesStore
- Manages notes array
- Tracks sync state
- Provides category filtering

#### momentumStore
- Manages momentum data
- Tracks sync state
- Provides update helpers

### Sync Helpers

All sync helpers include:
- Automatic state updates
- Error handling
- Sync state management
- Debounced updates (for auto-save)

**Example**:
```typescript
import { createNodeSync, updateNodeSync, deleteNodeSync } from '@/lib/syncNodes'

// Create a node
const node = await createNodeSync({
  type: 'create',
  title: 'Write new song',
  priority: 8,
  friction: 6
})

// Update a node
await updateNodeSync(node.id, { status: 'active' })

// Delete a node
await deleteNodeSync(node.id)
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd /path/to/totalaud.io
pnpm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp apps/loopos/.env.example apps/loopos/.env.local
```

Configure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Provider (choose one)
ANTHROPIC_API_KEY=your-anthropic-api-key
# OR
OPENAI_API_KEY=your-openai-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

### 3. Run Supabase Migration

```bash
# Start local Supabase
pnpm db:start

# Apply migrations
pnpm db:migrate

# Or manually
supabase db push
```

### 4. Start Development Server

```bash
cd apps/loopos
pnpm dev
```

Visit: `http://localhost:3001`

---

## 📡 API Reference

### Nodes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/nodes` | GET | Get all user nodes |
| `/api/nodes` | POST | Create new node |
| `/api/nodes/[id]` | GET | Get specific node |
| `/api/nodes/[id]` | PATCH | Update node |
| `/api/nodes/[id]` | DELETE | Delete node |

### Notes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notes` | GET | Get all user notes |
| `/api/notes` | POST | Create new note |
| `/api/notes/[id]` | GET | Get specific note |
| `/api/notes/[id]` | PATCH | Update note |
| `/api/notes/[id]` | DELETE | Delete note |

### Momentum

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/momentum` | GET | Get user momentum |
| `/api/momentum` | PATCH | Update momentum |

### AI Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/run-agent` | POST | Execute AI agent |
| `/api/ai/daily-actions` | POST | Generate daily actions |
| `/api/ai/insights` | POST | Generate loop insights |

---

## 🧪 Testing

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build verification
pnpm build
```

---

## 📦 Dependencies

### Core
- `next` (15.0.3) - React framework
- `react` (18.2.0) - UI library
- `typescript` (5.x) - Type safety

### State & Data
- `zustand` (4.5.0) - State management
- `@supabase/supabase-js` (2.39.0) - Database client
- `zod` (3.22.4) - Schema validation

### UI & Animation
- `reactflow` (11.11.4) - Flow canvas
- `framer-motion` (11.0.0) - Animations
- `lucide-react` (0.546.0) - Icons
- `tailwindcss` (3.4.0) - Styling

### AI
- Anthropic Claude API (via fetch)
- OpenAI API (optional, via fetch)

---

## 🔒 Security Notes

- All API routes require `x-user-id` header (replace with proper auth)
- Service role key is server-side only
- RLS policies protect all database tables
- AI API keys are never exposed to client

---

## 🎯 Next Steps (Phase 3)

- [ ] Add real authentication (Supabase Auth)
- [ ] Implement node connections/dependencies
- [ ] Add momentum decay system (server-side cron)
- [ ] Implement collaborative features
- [ ] Add analytics dashboard
- [ ] Deploy to production

---

## 📚 Additional Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Flow Docs](https://reactflow.dev)
- [Zustand Docs](https://zustand-demo.pmnd.rs)
- [Anthropic Claude API](https://docs.anthropic.com)

---

**Built with ❤️ for music creators**
