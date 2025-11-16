# Phase 31 — Creative Rhythm System

**Status**: ✅ Complete
**Date**: November 2025
**Scope**: Wellness-inspired awareness layer for tracking creative patterns

---

## 🎯 Objective

Build a calm, non-judgmental awareness system that helps artists understand their creative rhythms:
- When they tend to create (energy windows)
- How often they return to their workspace (return patterns)
- What mood or flow state they're in
- Gentle suggestions based on patterns

**Philosophy**: Not productivity tracking. Just awareness. Like a friend noticing your patterns.

**Tone**: British, calm, non-judgmental. "Awareness, not pressure."

---

## 📋 Deliverables Completed

### 1. Database Schema ✅

**Migration**: `/supabase/migrations/20251116030000_loopos_phase_31_rhythm_system.sql`

**4 New Tables**:

#### `loopos_activity_events`
Tracks every creative action (note, coach, node, designer, pack, login)

**Columns**:
- `id` (uuid, primary key)
- `workspace_id` (uuid, references loopos_workspaces)
- `user_id` (uuid, references auth.users)
- `type` (text: note | coach | node | designer | pack | login)
- `timestamp` (timestamptz)
- `metadata` (jsonb)
- `created_at` (timestamptz)

**Indexes**: workspace_id, timestamp DESC, type, user_id
**RLS**: Users can only see/insert activity for their own workspaces

#### `loopos_daily_summaries`
Aggregates daily activity counts and optional mood

**Columns**:
- `id` (uuid, primary key)
- `workspace_id` (uuid, references loopos_workspaces)
- `date` (date, unique per workspace)
- `entries` (integer, default 0)
- `nodes_added` (integer, default 0)
- `coach_messages` (integer, default 0)
- `scenes_generated` (integer, default 0)
- `mood` (text, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Indexes**: workspace_id, date DESC
**RLS**: Users can view/insert/update summaries for their own workspaces

#### `loopos_energy_windows`
Detects when user is most creatively active

**Columns**:
- `id` (uuid, primary key)
- `workspace_id` (uuid, references loopos_workspaces)
- `window` (text: early_morning | morning | afternoon | evening | late)
- `score` (integer, 0-100)
- `confidence` (numeric, 0.0-1.0)
- `last_updated` (timestamptz)
- `created_at` (timestamptz)

**Unique constraint**: workspace_id + window
**Indexes**: workspace_id, score DESC
**RLS**: Users can view/insert/update windows for their own workspaces

**Time Windows**:
- `early_morning`: 4–8am
- `morning`: 8am–noon
- `afternoon`: Noon–5pm
- `evening`: 5–10pm
- `late`: 10pm–4am

#### `loopos_return_patterns`
Tracks how often user returns to workspace

**Columns**:
- `id` (uuid, primary key)
- `workspace_id` (uuid, unique, references loopos_workspaces)
- `streak_days` (integer, default 0)
- `last_active_date` (date)
- `typical_gap_days` (integer, nullable)
- `confidence` (numeric, 0.0-1.0)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Indexes**: workspace_id, last_active_date DESC
**RLS**: Users can view/insert/update patterns for their own workspaces

---

### 2. TypeScript Schemas ✅

**File**: `/packages/loopos-db/src/types.ts` (extended)

**Zod Schemas**:
```typescript
export const ActivityTypeSchema = z.enum([
  'note', 'coach', 'node', 'designer', 'pack', 'login'
])

export const EnergyWindowSchema = z.enum([
  'early_morning', 'morning', 'afternoon', 'evening', 'late'
])
```

**Interfaces**:
```typescript
export interface ActivityEvent {
  id: string
  workspace_id: string
  user_id: string
  type: ActivityType
  timestamp: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface DailySummary {
  id: string
  workspace_id: string
  date: string
  entries: number
  nodes_added: number
  coach_messages: number
  scenes_generated: number
  mood: string | null
  created_at: string
  updated_at: string
}

export interface EnergyWindow {
  id: string
  workspace_id: string
  window: EnergyWindowType
  score: number
  confidence: number
  last_updated: string
  created_at: string
}

export interface ReturnPattern {
  id: string
  workspace_id: string
  streak_days: number
  last_active_date: string | null
  typical_gap_days: number | null
  confidence: number
  created_at: string
  updated_at: string
}
```

---

### 3. Database Module ✅

**File**: `/packages/loopos-db/src/rhythm.ts`

**Exports**:
```typescript
export const rhythmDb = {
  activity: activityDb,
  dailySummary: dailySummaryDb,
  energyWindow: energyWindowDb,
  returnPattern: returnPatternDb,
}
```

#### Activity Database Operations

**`track(workspaceId, userId, type, metadata)`**
- Fire-and-forget activity tracking
- Never throws errors (silent failure)
- Used for passive tracking

**`list(workspaceId, limit=100)`**
- Get recent activity events
- Ordered by timestamp DESC

**`getRange(workspaceId, startDate, endDate)`**
- Get activity events within date range
- Used for analysis

**`getCountByType(workspaceId, startDate, endDate)`**
- Returns counts by activity type
- Used for pattern detection

#### Daily Summary Operations

**`getOrCreate(workspaceId, date)`**
- Gets existing summary or creates new one
- Safe for concurrent calls

**`increment(workspaceId, date, field)`**
- Increments counter (entries, nodes_added, coach_messages, scenes_generated)
- Fire-and-forget (silent failures)

**`getRange(workspaceId, startDate, endDate)`**
- Get summaries for date range
- Ordered by date ASC

**`getLastNDays(workspaceId, days=7)`**
- Get last N days of summaries
- Used for charts

#### Energy Window Operations

**`list(workspaceId)`**
- Get all energy windows for workspace
- Ordered by score DESC

**`update(workspaceId, window, score, confidence)`**
- Upsert energy window score
- Clamps score (0-100) and confidence (0.0-1.0)

**`getHighest(workspaceId)`**
- Returns highest-scoring energy window
- Null if no data

#### Return Pattern Operations

**`get(workspaceId)`**
- Get return pattern for workspace
- Null if no data

**`update(workspaceId, updates)`**
- Upsert return pattern
- Partial updates supported

**`recordActivity(workspaceId)`**
- Updates streak and last active date
- Called on any creative activity
- Handles streak calculation automatically

---

### 4. API Endpoints ✅

#### POST `/api/rhythm/activity`
**Purpose**: Fire-and-forget activity tracking endpoint

**Request Body**:
```typescript
{
  workspaceId: string (uuid)
  userId: string (uuid)
  type: 'note' | 'coach' | 'node' | 'designer' | 'pack' | 'login'
  metadata?: Record<string, unknown>
}
```

**Response**: Always 200 OK (even on validation errors)
```typescript
{ success: true }
// or
{ success: false, reason: 'validation' | 'unknown' }
```

**Philosophy**: Never blocks UI. Silent failures. Just awareness.

**File**: `/apps/loopos/src/app/api/rhythm/activity/route.ts`

#### GET `/api/rhythm/analyze?workspaceId=xxx`
**Purpose**: Returns full rhythm analysis for a workspace

**Query Params**:
- `workspaceId` (required): Workspace UUID

**Response**:
```typescript
{
  success: true,
  data: {
    energyWindows: EnergyWindowAnalysis[]
    returnPattern: ReturnPatternAnalysis
    mood: MoodAnalysis
    suggestions: RhythmSuggestion[]
  }
}
```

**Analysis Period**: Last 30 days

**File**: `/apps/loopos/src/app/api/rhythm/analyze/route.ts`

---

### 5. Rhythm Engine ✅

**File**: `/apps/loopos/src/lib/rhythm/engine.ts`

#### Energy Window Detection

**Function**: `detectEnergyWindows(events: ActivityEvent[]): EnergyWindowAnalysis[]`

**Algorithm**:
1. Group events by time window (early_morning, morning, afternoon, evening, late)
2. Calculate score as percentage of total events
3. Calculate confidence based on sample size (min 10 events for confidence 1.0)
4. Sort by score DESC

**Returns**:
```typescript
interface EnergyWindowAnalysis {
  window: EnergyWindowType
  score: number         // 0-100
  confidence: number    // 0.0-1.0
  activityCount: number
}
```

#### Return Pattern Analysis

**Function**: `analyzeReturnPattern(summaries: DailySummary[]): ReturnPatternAnalysis`

**Algorithm**:
1. Filter to active days only (any activity > 0)
2. Calculate current streak (consecutive days ending today)
3. Calculate longest streak (all time)
4. Calculate average gap between sessions
5. Confidence based on total active days (min 14 for confidence 1.0)

**Returns**:
```typescript
interface ReturnPatternAnalysis {
  currentStreak: number
  longestStreak: number
  averageGapDays: number
  totalActiveDays: number
  confidence: number
}
```

#### Mood Detection

**Function**: `detectMood(recentEvents: ActivityEvent[], recentSummary?: DailySummary): MoodAnalysis`

**Algorithm** (heuristic-based):
- **Flowing**: High coach + designer (>40% combined)
- **Focused**: High timeline activity (>50%)
- **Exploratory**: High journal activity (>60%)
- **Stuck**: Many coach questions, little else (>70% coach)
- **Calm**: Balanced activity (default)

**Returns**:
```typescript
interface MoodAnalysis {
  mood: 'calm' | 'focused' | 'exploratory' | 'stuck' | 'flowing'
  confidence: number
  reason: string
}
```

#### Suggestion Generator

**Function**: `generateSuggestions(energyWindows, returnPattern, recentMood): RhythmSuggestion[]`

**Suggestion Types**:
1. **Energy window** (if confidence ≥ 0.5): "You tend to be more active [time]. Just something to notice."
2. **Streak** (if ≥ 3 days): "You've been here X days in a row. Nice rhythm."
3. **Return pattern** (if typical gap ≥ 3 days): "You usually return every X days or so."
4. **Mood-based**:
   - Stuck: "Lots of thinking lately. Sometimes a quick timeline sketch helps clear the fog."
   - Flowing: "Good flow between surfaces. Whatever you're doing, it's working."

**Max suggestions**: 4 (no overwhelming)

**Tone**: Calm, non-judgmental, British. "If it helps..." / "Just notice..." / "Whatever works."

---

### 6. React Hook ✅

**File**: `/apps/loopos/src/hooks/rhythm/useActivityTracker.ts`

**Purpose**: Simple hook for tracking activity from frontend

**Usage**:
```typescript
const { track } = useActivityTracker({ workspaceId, userId })

// When user creates a note:
track('note', { length: noteContent.length })

// When user sends coach message:
track('coach', { topic: 'release-planning' })

// When user adds timeline node:
track('node', { nodeType: 'milestone' })

// When user generates designer scene:
track('designer', { prompt: scenePrompt })

// When user creates pack:
track('pack', { packType: 'radio' })

// On login/session start:
track('login')
```

**Behaviour**: Fire-and-forget. Never blocks UI. Silent failures.

---

### 7. UI Components ✅

**Directory**: `/apps/loopos/src/components/rhythm/`

#### `ActivityChart.tsx`
**Purpose**: Bar chart showing last 7 days of activity

**Features**:
- Shows total activity per day
- Bar height scales to max activity
- Grey bars for empty days (20% opacity)
- Accent colour for active days (80% opacity)
- Hover shows activity count
- Responsive, minimal design

#### `EnergyWindowCard.tsx`
**Purpose**: Display energy window with score and confidence

**Features**:
- Window label + time range
- Score percentage (0-100)
- Progress bar visualization
- Accent border for top window (score ≥ 30 + confidence ≥ 0.5)
- Low confidence warning if needed
- Responsive card grid

#### `SuggestionsList.tsx`
**Purpose**: Display calm suggestions based on patterns

**Features**:
- Emoji icons by tone (💡 info, ✨ encouragement, 👀 awareness)
- Accent background (5% opacity)
- Accent border (15% opacity)
- Empty state: "No suggestions yet. Keep creating and patterns will emerge."

#### `MoodIndicator.tsx`
**Purpose**: Show current mood with visual styling

**Features**:
- Mood-specific colour and icon:
  - Calm 🌊 (grey)
  - Focused 🎯 (accent)
  - Exploratory 🔍 (purple)
  - Stuck 🤔 (amber)
  - Flowing ✨ (green)
- Confidence percentage
- Reason text
- Colour-coded border and background

---

### 8. Rhythm Page ✅

**File**: `/apps/loopos/src/app/rhythm/page.tsx`

**Route**: `/rhythm`

**Sections**:

1. **Header**
   - Title: "Your Creative Rhythm"
   - Subtitle: "Patterns in when you create, how often you return, and what you're working on. Not productivity tracking — just awareness."

2. **Mood Indicator**
   - Shows current detected mood
   - Confidence and reason

3. **Activity Chart**
   - Last 7 days bar chart
   - Panel background with border

4. **Energy Windows**
   - Heading: "Energy Windows"
   - Subtitle: "When you tend to be most active. No judgment — just patterns."
   - Responsive grid of 5 window cards

5. **Return Pattern** (if data exists)
   - Current streak
   - Longest streak
   - Total active days
   - Typical gap (if confidence high enough)

6. **Gentle Suggestions**
   - Heading: "Gentle Suggestions"
   - Subtitle: "Based on your patterns. Take what helps, ignore the rest."
   - List of suggestions (max 4)

7. **Footer**
   - "This is awareness, not productivity tracking. Your creative process is yours."

**States**:
- Loading: "Loading your rhythm..."
- Error: "Could not load rhythm data. Try again later."
- Empty: "No rhythm data yet. Start creating and patterns will emerge."

**Styling**: Minimal, clean, calm. Uses design tokens for colours and spacing.

---

## 🎨 Tone Guidelines

### Language Principles

**Do**:
- Use soft, observational language
- Present patterns as interesting, not prescriptive
- Prefer "You tend to..." / "Just something to notice..."
- Keep messages short and calm
- Emphasize awareness, not productivity

**Don't**:
- Use productivity language ("optimize", "maximize", "supercharge")
- Make judgments about patterns ("good", "bad", "should")
- Pressure users to change behaviour
- Compare to others or ideals
- Overwhelm with data

### Example Messages

| ❌ Avoid | ✅ Use |
|---------|--------|
| "Optimize your creative schedule!" | "You tend to be more active in the morning. Just something to notice." |
| "You should work more consistently!" | "You usually return every 3 days or so." |
| "Increase your productivity!" | "Nice rhythm. You've been here 5 days in a row." |
| "You're stuck — fix it!" | "Lots of thinking lately. Sometimes a quick timeline sketch helps clear the fog." |

---

## 📊 Integration Points

### Frontend Integration

**1. Track activities throughout the app**:
```typescript
import { useActivityTracker } from '@/hooks/rhythm/useActivityTracker'

const { track } = useActivityTracker({ workspaceId, userId })

// In journal component:
const handleCreateNote = async (content: string) => {
  await createNote(content)
  track('note', { length: content.length })
}

// In coach component:
const handleSendMessage = async (message: string) => {
  await sendMessage(message)
  track('coach')
}

// In timeline component:
const handleAddNode = async (node: Node) => {
  await addNode(node)
  track('node', { nodeType: node.type })
}

// In designer component:
const handleGenerateScene = async (prompt: string) => {
  await generateScene(prompt)
  track('designer', { prompt })
}

// On login:
useEffect(() => {
  if (isAuthenticated) {
    track('login')
  }
}, [isAuthenticated])
```

**2. Link to rhythm page from navigation**:
```typescript
<Link href="/rhythm">
  Your Rhythm
</Link>
```

### Backend Processing (Optional)

**Cron job to update energy windows and return patterns**:
```typescript
// Run daily at midnight
async function updateRhythmPatterns() {
  const workspaces = await getAllWorkspaces()

  for (const workspace of workspaces) {
    // Get last 30 days of events
    const events = await rhythmDb.activity.getRange(
      workspace.id,
      thirtyDaysAgo,
      now
    )

    // Detect energy windows
    const windows = detectEnergyWindows(events)
    for (const window of windows) {
      await rhythmDb.energyWindow.update(
        workspace.id,
        window.window,
        window.score,
        window.confidence
      )
    }

    // Update return pattern
    const summaries = await rhythmDb.dailySummary.getLastNDays(workspace.id, 30)
    const pattern = analyzeReturnPattern(summaries)
    await rhythmDb.returnPattern.update(workspace.id, {
      typical_gap_days: pattern.averageGapDays,
      confidence: pattern.confidence,
    })
  }
}
```

---

## ✅ Quality Checks

### Tone & Copy
- [x] British English throughout
- [x] Calm, non-judgmental language
- [x] No productivity pressure
- [x] Emphasis on awareness, not optimization
- [x] Gentle suggestions, not commands

### Technical
- [x] Database migration with RLS policies
- [x] TypeScript schemas with Zod validation
- [x] Fire-and-forget activity tracking (never blocks UI)
- [x] Responsive UI components
- [x] Loading and error states
- [x] Uses design tokens exclusively

### User Experience
- [x] Passive tracking (no interruptions)
- [x] Minimal data visualization
- [x] Clear empty states
- [x] Helpful but optional
- [x] No gamification
- [x] Privacy-focused (workspace-scoped data)

---

## 📦 Files Created

### Database (1 file)
1. `/supabase/migrations/20251116030000_loopos_phase_31_rhythm_system.sql`

### TypeScript Schemas (2 files)
2. `/packages/loopos-db/src/types.ts` (extended)
3. `/packages/loopos-db/src/rhythm.ts`
4. `/packages/loopos-db/src/index.ts` (export added)

### API Endpoints (2 files)
5. `/apps/loopos/src/app/api/rhythm/activity/route.ts`
6. `/apps/loopos/src/app/api/rhythm/analyze/route.ts`

### Rhythm Engine (1 file)
7. `/apps/loopos/src/lib/rhythm/engine.ts`

### React Hook (1 file)
8. `/apps/loopos/src/hooks/rhythm/useActivityTracker.ts`

### UI Components (4 files)
9. `/apps/loopos/src/components/rhythm/ActivityChart.tsx`
10. `/apps/loopos/src/components/rhythm/EnergyWindowCard.tsx`
11. `/apps/loopos/src/components/rhythm/SuggestionsList.tsx`
12. `/apps/loopos/src/components/rhythm/MoodIndicator.tsx`

### Pages (1 file)
13. `/apps/loopos/src/app/rhythm/page.tsx`

### Documentation (1 file)
14. `/apps/loopos/docs/PHASE_31_RHYTHM.md` (this file)

**Total**: 14 files

---

## 🎯 Success Criteria

✅ Database tables created with RLS
✅ TypeScript schemas defined with Zod
✅ Fire-and-forget activity tracking API
✅ Rhythm engine with pattern detection
✅ Energy window analysis (5 time windows)
✅ Return pattern analysis (streaks, gaps, frequency)
✅ Mood detection (calm, focused, exploratory, stuck, flowing)
✅ Suggestion generator (max 4 gentle suggestions)
✅ React hook for easy tracking
✅ 4 UI components (chart, cards, suggestions, mood)
✅ /rhythm page with all sections
✅ Calm, non-judgmental British tone
✅ No productivity pressure anywhere
✅ Zero breaking changes
✅ TypeScript strict mode maintained

---

## 📈 Impact Assessment

### Before Phase 31

- No awareness of creative patterns
- Users don't know when they're most productive
- No feedback on return frequency
- No gentle guidance based on behaviour

### After Phase 31

- ✅ Users see when they tend to create
- ✅ Gentle awareness of return patterns
- ✅ Mood detection shows current flow state
- ✅ Calm suggestions based on patterns
- ✅ No pressure, just helpful patterns
- ✅ Privacy-focused (workspace-scoped)
- ✅ Optional and non-intrusive

---

## 🔮 Future Enhancements (Optional)

### 1. AI-Powered Mood Analysis
Use LLM to analyze journal entries and coach conversations for deeper mood insights:
- Detect emotional themes
- Identify blockers or breakthroughs
- Generate personalized suggestions

### 2. Weekly/Monthly Summaries
Email or in-app summaries of creative rhythm:
- "This week you were most active in the morning"
- "Your longest streak this month was 7 days"
- Opt-in, never forced

### 3. Export Rhythm Data
Allow users to export their rhythm data:
- CSV export for external analysis
- PDF report with visualizations
- JSON export for integrations

### 4. Collaborative Rhythm
For shared workspaces, show team patterns:
- When team is most active together
- Overlap windows for synchronous work
- Respect individual privacy

### 5. Customizable Energy Windows
Let users define their own time windows:
- Custom work hours
- Timezone-aware
- Personal rhythm preferences

---

## 📝 Notes

**Philosophy**: This is not productivity tracking. It's wellness-inspired awareness. Like a friend who notices "you seem to do your best thinking in the morning" — not prescriptive, just observational.

**Privacy**: All data is workspace-scoped. Users only see their own patterns. No cross-workspace comparisons. No leaderboards. No competition.

**Tone**: Calm, British, non-judgmental. "Just something to notice" / "Whatever works for you" / "Take what helps, ignore the rest."

**No Pressure**: Suggestions are gentle. No notifications. No nudges. Just a page you can visit when you're curious.

**Fire-and-Forget**: Activity tracking never blocks UI. Silent failures. Awareness is nice-to-have, not critical.

---

**Implementation Date**: 2025-11-16
**Status**: ✅ Complete - Creative Rhythm awareness system implemented
**Git Commit**: `feat(rhythm): Phase 31 — Creative Rhythm awareness system`

---

**Phase 31 Complete**: LoopOS now has a calm awareness layer that helps artists notice their creative patterns without pressure or judgment. Ready for mindful creators.
