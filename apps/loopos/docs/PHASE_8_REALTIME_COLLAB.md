# Phase 8: Real-Time Collaboration & Presence

**Status**: ✅ Complete
**Date**: 2025-11-16
**Goal**: Transform LoopOS into a collaborative workspace with Figma-meets-Ableton real-time features

---

## 📋 Overview

Phase 8 adds comprehensive real-time collaboration features to LoopOS, enabling multiple users to work together seamlessly in the same workspace:

- **Presence tracking** - See who's online and where they are
- **Live cursors** - View other users' cursor movements in real-time
- **Node collaboration** - Collaborative editing of timeline nodes
- **Designer scenes** - Shared AI-generated visual strategies
- **Activity indicators** - Know when someone is editing the same content
- **Session hooks** - Infrastructure for future voice/WebRTC features

---

## 🏗️ Architecture

### Realtime Channels

All collaboration features use Supabase Realtime channels:

| Channel | Purpose | Payload |
|---------|---------|---------|
| `loopos:presence:workspace:{id}` | Workspace presence | User location, focus, activity |
| `loopos:cursor:timeline:{id}` | Timeline cursors | Cursor position, label |
| `loopos:cursor:designer:{id}` | Designer cursors | Cursor position, label |
| `loopos:nodes:workspace:{id}` | Node collaboration | Node events (move, update, create, delete) |
| `loopos:designer:workspace:{id}` | Designer scenes | Scene events (update, create, delete, activate) |

### Database Tables

New tables added in Phase 8:

```sql
-- User profiles for collaboration display
loopos_user_profiles (
  id UUID PRIMARY KEY,
  display_name TEXT,
  cursor_colour TEXT DEFAULT '#3AA9BE',
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- AI-generated designer scenes
loopos_designer_scenes (
  id UUID PRIMARY KEY,
  workspace_id UUID,
  user_id UUID,
  name TEXT,
  type TEXT,
  prompt TEXT,
  data JSONB,
  is_active BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Enhanced existing tables:**
- `loopos_nodes`: Added `version` and `last_edited_by` for conflict resolution

---

## 🔧 Implementation Details

### 1. Presence System

**Files:**
- `src/lib/realtime/presence.ts` - Core presence logic
- `src/hooks/usePresence.ts` - React hook for presence
- `src/components/collab/PresenceBar.tsx` - Presence UI (avatars)
- `src/components/collab/WorkspaceParticipants.tsx` - Detailed participant list

**How it works:**
1. User joins workspace → Track presence with location
2. Presence updates broadcast to all workspace members
3. Idle detection (2 minutes of inactivity)
4. Automatic cleanup on disconnect

**Usage example:**
```tsx
import { usePresence } from '@/hooks/usePresence'

function MyComponent({ workspaceId }) {
  const { participants, updatePresence } = usePresence({
    workspaceId,
    location: 'timeline',
  })

  // Update focus when editing a node
  const handleNodeEdit = (nodeId) => {
    updatePresence({ focusNodeId: nodeId })
  }

  return (
    <div>
      {participants.map(p => (
        <div key={p.userId}>{p.displayName} is in {p.location}</div>
      ))}
    </div>
  )
}
```

### 2. Live Cursors

**Files:**
- `src/lib/realtime/cursors.ts` - Cursor broadcasting logic
- `src/hooks/useCursors.ts` - React hook for cursors
- `src/components/collab/CursorLayer.tsx` - Cursor rendering

**How it works:**
1. Capture mouse movement in canvas container
2. Throttle broadcasts to 60ms (~16fps)
3. Render cursors with name labels and colour coding
4. Auto-remove stale cursors (10 seconds)

**Usage example:**
```tsx
import { CursorLayer } from '@/components/collab/CursorLayer'

function TimelineCanvas({ workspaceId }) {
  return (
    <div className="relative">
      {/* Main canvas content */}
      <ReactFlow ... />

      {/* Cursor overlay */}
      <CursorLayer
        workspaceId={workspaceId}
        context="timeline"
        displayName="Chris"
        colour="#3AA9BE"
      />
    </div>
  )
}
```

**Features:**
- Throttled broadcasting (avoid network spam)
- Smooth cursor interpolation with Framer Motion
- Contextual labels (e.g., "Editing: Release Strategy")
- Automatic stale cursor removal

### 3. Node Collaboration

**Files:**
- `src/lib/realtime/nodes.ts` - Node event broadcasting
- `src/hooks/useRealtimeNodes.ts` - React hook for node sync

**How it works:**
1. User moves/updates node → Broadcast event
2. Other users receive event → Apply update optimistically
3. Database subscription provides authoritative source
4. Version tracking for conflict resolution (last-write-wins)

**Conflict Resolution:**
- Each node has a `version` field (auto-incremented)
- Incoming events checked against local version
- If incoming version ≥ local version → Apply update
- Database triggers ensure version consistency

**Usage example:**
```tsx
import { useRealtimeNodes } from '@/hooks/useRealtimeNodes'

function Timeline({ workspaceId }) {
  const { broadcastMove, broadcastUpdate } = useRealtimeNodes({
    workspaceId,
    onNodeUpdate: (node) => {
      // Update local state when remote user edits
      updateNodeInState(node)
    },
  })

  const handleNodeDrag = (nodeId, x, y) => {
    // Update locally
    moveNodeLocally(nodeId, x, y)

    // Broadcast to others
    broadcastMove(nodeId, x, y)
  }

  return <canvas />
}
```

### 4. Designer Scene Collaboration

**Files:**
- `src/lib/realtime/designer.ts` - Scene event broadcasting
- `src/hooks/useDesignerRealtime.ts` - React hook for scene sync
- `packages/loopos-db/src/designer.ts` - Database helpers

**How it works:**
1. AI generates scene → Save to database
2. Broadcast scene creation event
3. Other users see scene appear in real-time
4. Scene updates (regeneration, tweaks) broadcast instantly

**Scene versioning:**
- Scenes have `version` field for conflict resolution
- `is_active` flag marks currently displayed scene
- Only one active scene per workspace

**Usage example:**
```tsx
import { useDesignerRealtime } from '@/hooks/useDesignerRealtime'
import { designerDb } from '@total-audio/loopos-db'

function Designer({ workspaceId }) {
  const { broadcastCreate, broadcastActivate } = useDesignerRealtime({
    workspaceId,
    onSceneCreate: (scene) => {
      // Add to local scene list
      addSceneToList(scene)
    },
  })

  const handleGenerateScene = async (prompt) => {
    // Generate with AI
    const sceneData = await generateScene(prompt)

    // Save to database
    const scene = await designerDb.create(workspaceId, userId, {
      name: 'New Strategy',
      type: 'strategy',
      prompt,
      data: sceneData,
    })

    // Broadcast to collaborators
    await broadcastCreate(scene)
  }

  return <canvas />
}
```

### 5. Collaboration UI Components

#### PresenceBar
**Location:** `src/components/collab/PresenceBar.tsx`

Compact presence indicator showing:
- Avatar chips with initials
- Colour-coded by user
- Online count
- Hover for details

```tsx
<PresenceBar workspaceId={workspaceId} location="timeline" />
```

#### WorkspaceParticipants
**Location:** `src/components/collab/WorkspaceParticipants.tsx`

Detailed participant panel showing:
- All online users
- Current location (Timeline, Designer, etc.)
- Focus state (editing node/scene)
- Idle status
- Location breakdown

```tsx
<WorkspaceParticipants
  workspaceId={workspaceId}
  currentLocation="timeline"
/>
```

#### CursorLayer
**Location:** `src/components/collab/CursorLayer.tsx`

Live cursor overlay for canvases:
- Smooth cursor rendering
- Name labels
- Contextual labels (optional)
- Auto-cleanup of stale cursors

```tsx
<CursorLayer
  workspaceId={workspaceId}
  context="timeline"
/>
```

---

## 🔮 Future: Voice & Video (WebRTC)

Phase 8 includes stub functions for future WebRTC integration:

**Files:**
- `src/lib/collab/session.ts` - Session management stubs

**Planned features:**
- Voice channels per workspace
- Video presence
- Screen sharing
- Mute/unmute controls
- Session recording

**Integration approach:**
1. Use Supabase Realtime for signaling (offer/answer/ICE candidates)
2. Implement STUN/TURN servers for NAT traversal
3. Create session table in database
4. Build UI components (SessionControls, ParticipantGrid)

**Example stub usage:**
```ts
import { createSession, joinSession } from '@/lib/collab/session'

// Start a voice session
const session = await createSession(workspaceId, 'Design Review')

// Join the session
await joinSession(session.id, {
  userId: user.id,
  displayName: user.name,
})
```

---

## 🎨 Design Principles

### Performance
- **Throttled broadcasts:** Cursor updates limited to 60ms
- **Debounced updates:** Node movements batched at 120ms
- **Stale cleanup:** Remove inactive cursors after 10 seconds
- **Efficient rendering:** AnimatePresence for smooth enter/exit

### User Experience
- **Colour coding:** Each user assigned a unique cursor colour
- **Idle detection:** Fade out inactive users (2+ minutes)
- **Context awareness:** Show what users are focused on
- **Non-intrusive:** Cursors don't block interaction

### Conflict Resolution
- **Last-write-wins:** Simple conflict strategy using timestamps
- **Version tracking:** Database triggers manage versions
- **Optimistic updates:** Apply changes immediately, sync with DB
- **Authoritative source:** Database subscription ensures consistency

---

## 📊 Data Flow Diagrams

### Presence Flow
```
User joins workspace
    ↓
Create presence channel (Supabase Realtime)
    ↓
Track presence state { userId, location, focus, lastActiveAt }
    ↓
Broadcast to all workspace members
    ↓
Other users receive → Update participant list
    ↓
On location change → Update presence
    ↓
On disconnect → Untrack presence
```

### Node Collaboration Flow
```
User moves node (drag)
    ↓
Update local state (optimistic)
    ↓
Save to database (Supabase)
    ↓
Broadcast node_moved event
    ↓
Other users receive event
    ↓
Check version (conflict resolution)
    ↓
If version >= current → Apply update
    ↓
Update React Flow nodes
```

### Cursor Broadcasting Flow
```
Mouse move in canvas
    ↓
Get relative position
    ↓
Throttle (60ms)
    ↓
Broadcast { userId, x, y, label, timestamp }
    ↓
Other users receive
    ↓
Render cursor at position (Framer Motion)
    ↓
If no movement for 10s → Remove cursor
```

---

## 🧪 Testing Instructions

### Manual Testing (Two Browser Windows)

1. **Start LoopOS:**
   ```bash
   cd apps/loopos
   pnpm dev
   ```

2. **Open two browsers:**
   - Chrome: `http://localhost:3001`
   - Chrome Incognito: `http://localhost:3001`

3. **Test Presence:**
   - Log in as two different users
   - Join the same workspace
   - ✅ See two avatars in PresenceBar
   - Switch pages → Presence updates

4. **Test Cursors:**
   - Both users go to Timeline
   - Move mouse in one window
   - ✅ See cursor appear in other window
   - Hover over nodes → Label updates

5. **Test Node Collaboration:**
   - Create a node in Window 1
   - ✅ Node appears in Window 2
   - Drag node in Window 1
   - ✅ Node moves in Window 2
   - Edit node content in Window 2
   - ✅ Content updates in Window 1

6. **Test Designer Scenes:**
   - Generate scene in Window 1
   - ✅ Scene appears in Window 2
   - Activate different scene in Window 2
   - ✅ Active scene changes in Window 1

### Automated Testing (Future)

**Unit tests:**
- Presence state management
- Cursor throttling logic
- Version conflict resolution
- Event broadcasting

**Integration tests:**
- Channel subscriptions
- Database triggers
- Real-time event flow

**E2E tests:**
- Multi-user workflows
- Conflict scenarios
- Network disconnection handling

---

## 🚀 Deployment Considerations

### Environment Variables

No new environment variables required - uses existing Supabase configuration:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Database Migration

Run the Phase 8 migration:
```bash
supabase db push
```

Or manually apply:
```bash
psql -f supabase/migrations/20251116000000_loopos_phase_8_realtime_collab.sql
```

### Supabase Realtime

Ensure Realtime is enabled in Supabase:
1. Go to Database → Replication
2. Enable replication for:
   - `loopos_nodes`
   - `loopos_designer_scenes`
   - `loopos_user_profiles`

### Performance Monitoring

Monitor these metrics:
- Realtime connections per workspace
- Broadcast message frequency
- Database update frequency
- Presence sync latency

**Recommended limits:**
- Max 50 concurrent users per workspace
- Max 100 messages/second per channel
- Presence heartbeat: 30 seconds

---

## 📝 API Reference

### usePresence()

```ts
function usePresence(options: {
  workspaceId: string
  location: PresenceLocation
  initialFocusNodeId?: string | null
  initialFocusSceneId?: string | null
}): {
  participants: PresenceParticipant[]
  isConnected: boolean
  updatePresence: (updates: PresenceUpdate) => Promise<void>
  participantCount: number
  lastUpdated: string | null
}
```

### useCursors()

```ts
function useCursors(options: {
  workspaceId: string
  context: 'timeline' | 'designer'
  containerRef: React.RefObject<HTMLElement>
  displayName?: string
  colour?: string
  throttleDelay?: number
}): {
  cursors: Map<string, CursorPosition>
  isConnected: boolean
  updateLabel: (label?: string) => void
}
```

### useRealtimeNodes()

```ts
function useRealtimeNodes(options: {
  workspaceId: string
  onNodeUpdate?: (node: Partial<Node> & { id: string }) => void
  onNodeCreate?: (node: Node) => void
  onNodeDelete?: (nodeId: string) => void
}): {
  isConnected: boolean
  broadcastMove: (nodeId: string, x: number, y: number, version?: number) => Promise<void>
  broadcastUpdate: (nodeId: string, updates: Partial<Node>, version?: number) => Promise<void>
  broadcastCreate: (node: Node) => Promise<void>
  broadcastDelete: (nodeId: string) => Promise<void>
}
```

### useDesignerRealtime()

```ts
function useDesignerRealtime(options: {
  workspaceId: string
  onSceneUpdate?: (scene: DesignerScene) => void
  onSceneCreate?: (scene: DesignerScene) => void
  onSceneDelete?: (sceneId: string) => void
  onSceneActivate?: (sceneId: string) => void
}): {
  isConnected: boolean
  broadcastUpdate: (sceneId: string, scene: DesignerScene) => Promise<void>
  broadcastCreate: (scene: DesignerScene) => Promise<void>
  broadcastDelete: (sceneId: string) => Promise<void>
  broadcastActivate: (sceneId: string) => Promise<void>
}
```

---

## 🐛 Known Limitations

1. **Cursor accuracy:** React Flow transformations may cause slight cursor position drift at high zoom levels
2. **Conflict resolution:** Last-write-wins may overwrite concurrent edits (acceptable for Phase 8)
3. **Presence scaling:** Not optimised for >50 concurrent users per workspace
4. **Offline support:** Realtime features disabled when offline (offline sync queue still works)
5. **Mobile cursors:** Touch interactions don't broadcast cursor positions (intentional)

---

## 🔄 Migration from Phase 7

Phase 8 is fully backwards-compatible with Phase 7:

- All existing features work unchanged
- No breaking changes to database schema (only additions)
- Collaboration features are opt-in (no impact if unused)
- Can deploy Phase 8 without enabling Realtime

**Migration steps:**
1. Run database migration (`20251116000000_loopos_phase_8_realtime_collab.sql`)
2. Enable Supabase Realtime replication
3. Deploy updated code
4. Test with multiple users

---

## 📚 Related Documentation

- [Phase 7 Implementation](./PHASE_7_IMPLEMENTATION.md) - Foundation features
- [LoopOS README](../README.md) - Project overview
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime) - Realtime API reference

---

**Last Updated:** 2025-11-16
**Status:** ✅ Complete - Ready for testing
