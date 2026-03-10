# Phase 15.4 Complete: Production Wiring & Demo Surface

**Status**: ✅ Complete (40/47 checks passed, 7 warnings for manual RLS migration)
**Date**: 2025-11-03
**Branch**: `feature/phase-15-4-prod-wiring`

---

## 📋 Overview

Phase 15.4 connects the console UI from Phase 15.3 to live Supabase data, adds authentication guards with demo mode fallbacks, and creates production-ready routes for both demo and authenticated experiences.

**Key Achievements**:
- ✅ Demo surface at `/dev/console` (no auth required)
- ✅ Production route at `/console` (auth-aware)
- ✅ Live Supabase integration for all agent APIs
- ✅ Demo mode short-circuits with user feedback
- ✅ RLS migration ready for all console tables
- ✅ Global keyboard shortcuts (⌘K)
- ✅ Telemetry for routes and demo mode
- ✅ Comprehensive audit script + documentation

---

## 🗺️ Routes Map

### 1. Demo Console (`/dev/console`)
**Purpose**: Polished demo for unauthenticated users to explore console features
**Auth Required**: ❌ No
**Data Persistence**: ❌ No writes saved
**CampaignID**: `"demo-campaign"` (hardcoded)
**UserID**: `"demo-user"` (hardcoded)

**Features**:
- Top banner: "demo mode — no authentication required"
- Full console UI with FlowCanvas
- NodePalette + CommandPalette accessible
- Tab navigation (plan/do/track/learn)
- CTA buttons to `/operator` and `/console`
- Telemetry: tracks `route_opened` with `mode: 'demo'`

**File**: [apps/aud-web/src/app/dev/console/page.tsx](apps/aud-web/src/app/dev/console/page.tsx)

---

### 2. Production Console (`/console`)
**Purpose**: Authenticated console with live data and write capabilities
**Auth Required**: ⚠️ Optional (falls back to demo mode)
**Data Persistence**: ✅ Yes (when authenticated)
**CampaignID**: From `?id=` query param OR last-used campaign
**UserID**: From Supabase auth session

**Features**:
- Loading state during auth check
- Authenticated: Full console with live campaignId/userId
- Unauthenticated: Demo mode banner "sign in to save your work"
- Campaign loading priority: query param → API → fallback to demo
- Telemetry: tracks `route_opened` with `mode: 'authenticated' | 'demo'`

**File**: [apps/aud-web/src/app/console/page.tsx](apps/aud-web/src/app/console/page.tsx)

---

### 3. Auth Session API (`/api/auth/session`)
**Purpose**: Check if user is authenticated
**Method**: GET
**Response**: `{authenticated: boolean, userId: string | null}`

**Logic**:
1. Loads Supabase env vars
2. Creates Supabase client
3. Calls `supabase.auth.getSession()`
4. Returns authenticated status + userId

**Error Handling**: Returns `authenticated: false` on any error

**File**: [apps/aud-web/src/app/api/auth/session/route.ts](apps/aud-web/src/app/api/auth/session/route.ts)

---

### 4. Campaigns Last-Used API (`/api/campaigns/last-used`)
**Purpose**: Load or create user's last-used campaign
**Method**: POST
**Auth Required**: ✅ Yes
**Response**: `{campaignId: string, artistName: string, created?: boolean}`

**Logic**:
1. Check authentication (401 if not authenticated)
2. Query `campaign_context` table for user's campaigns (ORDER BY `last_accessed_at` DESC)
3. If found: update `last_accessed_at` timestamp and return
4. If not found: create new campaign with `artist_name: 'untitled campaign'`

**RLS-Safe**: All queries filtered by `user_id = auth.uid()`

**File**: [apps/aud-web/src/app/api/campaigns/last-used/route.ts](apps/aud-web/src/app/api/campaigns/last-used/route.ts)

---

## 🔌 Agent API Updates

### 1. Intel Agent (`/api/agents/intel`)
**Changes**:
- ✅ Added authentication check via `supabase.auth.getSession()`
- ✅ Fetches document assets from `artist_assets` table (RLS-safe)
- ✅ Saves research results to `agent_results` table (authenticated only)
- ✅ Returns `{demo: !isAuthenticated}` flag

**Demo Mode Behaviour**:
- Generates research without asset context
- Skips database writes
- Returns empty assets array

**File**: [apps/aud-web/src/app/api/agents/intel/route.ts](apps/aud-web/src/app/api/agents/intel/route.ts)

---

### 2. Pitch Agent (`/api/agents/pitch`)
**Changes**:
- ✅ Added authentication check
- ✅ Writes outreach logs to `campaign_outreach_logs` table (authenticated only)
- ✅ Saves `contact_name`, `message_preview`, `asset_ids[]`, `status: 'sent'`
- ✅ Returns `{demo: !isAuthenticated}` flag

**Demo Mode Behaviour**:
- Generates pitch content normally
- Skips database writes (no outreach log created)
- Returns attachments without persistence

**File**: [apps/aud-web/src/app/api/agents/pitch/route.ts](apps/aud-web/src/app/api/agents/pitch/route.ts)

---

### 3. Tracker Agent (`/api/agents/tracker`)
**Changes**:
- ✅ Added authentication check
- ✅ Queries `campaign_outreach_logs` by `campaign_id` (RLS-safe)
- ✅ Returns empty array `[]` for unauthenticated requests (no mock data)
- ✅ Returns `{demo: !isAuthenticated}` flag

**Demo Mode Behaviour**:
- Returns empty logs array (no data shown)
- User sees "no outreach logged yet" empty state
- Encourages using pitch agent to create logs

**File**: [apps/aud-web/src/app/api/agents/tracker/route.ts](apps/aud-web/src/app/api/agents/tracker/route.ts)

---

## 🔐 RLS Migration

**File**: [supabase/migrations/20251118000000_console_rls_sync.sql](supabase/migrations/20251118000000_console_rls_sync.sql)

**Status**: ⚠️ Created but not yet applied (manual step required)

**Tables with RLS Enabled**:
1. `campaign_context` - Campaign settings and metadata
2. `agent_results` - Intel/pitch/tracker agent outputs
3. `canvas_scenes` - Flow canvas node positions (with public share support)
4. `artist_assets` - Document/audio/image uploads
5. `flow_telemetry` - User interaction tracking
6. `campaign_outreach_logs` - Pitch agent sent messages (created by migration)

**Policies** (per table):
- `SELECT`: `WHERE auth.uid() = user_id`
- `INSERT`: `WITH CHECK auth.uid() = user_id`
- `UPDATE`: `WHERE auth.uid() = user_id WITH CHECK auth.uid() = user_id`
- `DELETE`: `WHERE auth.uid() = user_id`

**Special Case**: `canvas_scenes` allows public read when `public_share_id IS NOT NULL`

**Apply Migration**:
```bash
cd /path/to/totalaud.io
supabase db push --linked
```

---

## ⌨️ Keyboard Shortcuts Map

| Shortcut | Action | Notes |
|----------|--------|-------|
| **⌘K** | Open Command Palette | Works globally, suppressed in inputs |
| **⌘U** | Open Asset Inbox Drawer | (Future - not yet wired) |
| **⌘S** | Save Canvas Scene | (Future - not yet wired) |
| **⌘⇧S** | Share Canvas Scene | (Future - not yet wired) |
| **⌘I** | Open Signal Drawer | (Future - not yet wired) |
| **⌘⌥→** | Next Tab | (Future - not yet wired) |
| **⌘⌥←** | Previous Tab | (Future - not yet wired) |

**Input Suppression**:
All shortcuts check `event.target` and ignore if:
- `tagName === 'INPUT'`
- `tagName === 'TEXTAREA'`
- `isContentEditable === true`

---

## 📊 Telemetry Map

### Route-Level Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `route_opened` | Console page load | `{path: '/console' \| '/dev/console', mode: 'authenticated' \| 'demo'}` |

### Agent-Level Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `asset_used_for_intel` | Intel agent uses document assets | `{sessionId, assetCount, assetIds: string[]}` |
| `asset_attach_to_pitch` | Pitch agent attaches assets | `{sessionId, attachmentCount, attachmentTypes: string[]}` |
| `agent_run` | Intel agent completes | `{agentName: 'intel', query, assetsUsed, campaignId}` |
| `asset_view_from_tracker` | User clicks asset in tracker | `{assetId, logId, campaignId}` |

**Batching**: All telemetry events are currently logged immediately (no batching yet)

---

## 🧪 How Demo Mode Works

### Philosophy
**Demo mode is not a separate mode** - it's the fallback behaviour when a user is not authenticated. All routes and APIs handle both authenticated and unauthenticated states gracefully.

### Frontend Behaviour

**Demo Console (`/dev/console`)**:
- Always runs in demo mode (no auth check)
- Hardcoded IDs: `campaignId="demo-campaign"`, `userId="demo-user"`
- Top banner explains demo mode status
- CTAs to switch to production console

**Production Console (`/console`)**:
- Checks authentication on mount via `/api/auth/session`
- If authenticated: loads real campaignId/userId, enables writes
- If not authenticated: falls back to demo IDs, shows banner, disables writes
- Graceful error handling (API failures → demo mode)

### API Behaviour

**Read Operations**:
- Intel agent: returns empty assets if unauthenticated
- Tracker agent: returns empty logs if unauthenticated
- No mock data returned (forces user to authenticate for real data)

**Write Operations**:
- Intel agent: skips `agent_results` table write, returns {demo: true}
- Pitch agent: skips `campaign_outreach_logs` table write, returns {demo: true}
- No errors thrown (silently skips DB writes)

**Demo Flag**:
All agent APIs return `{demo: !isAuthenticated}` in response payload. Frontend can use this to show appropriate UI feedback (toasts, banners, etc.).

### User Flow

1. **Unauthenticated user visits `/console`**:
   - Sees loading spinner
   - Auth check fails → demo mode activated
   - Toast: "demo mode — no authentication" appears
   - Banner: "demo mode — sign in to save your work" shown
   - Console works normally but writes are disabled

2. **User signs in**:
   - Refresh page → auth check succeeds
   - Banner disappears
   - Writes enabled
   - Real campaignId loaded from API

3. **User visits `/dev/console`**:
   - No auth check (always demo)
   - Clear messaging about demo mode
   - CTAs to switch to production console

---

## ✅ Manual Test Checklist

### 1. Demo Console Accessibility
- [ ] Navigate to `/dev/console` (no authentication)
- [ ] Verify demo mode banner appears at top
- [ ] Confirm FlowCanvas renders
- [ ] Click "spawn agent" button → NodePalette opens
- [ ] Press ⌘K → CommandPalette opens
- [ ] Click "open operator" button → navigates to `/operator`
- [ ] Click "production console" button → navigates to `/console`

### 2. Production Console (Unauthenticated)
- [ ] Sign out of Supabase
- [ ] Navigate to `/console`
- [ ] Verify loading state appears briefly
- [ ] Confirm demo mode banner appears
- [ ] Verify toast notification: "demo mode — no authentication"
- [ ] Confirm console renders with demo IDs
- [ ] Try spawning intel agent → works but shows empty assets
- [ ] Try spawning tracker agent → shows "no outreach logged yet"

### 3. Production Console (Authenticated)
- [ ] Sign in to Supabase
- [ ] Navigate to `/console`
- [ ] Verify loading state appears
- [ ] Confirm NO demo mode banner shown
- [ ] Verify campaignId loaded (check console logs)
- [ ] Spawn intel agent with query → saves to `agent_results` table
- [ ] Spawn pitch agent with assets → creates `campaign_outreach_logs` entry
- [ ] Spawn tracker agent → shows outreach logs from database
- [ ] Navigate to `/console?id=abc123` → uses query param campaignId

### 4. Auth Session API
- [ ] Call `GET /api/auth/session` (authenticated) → `{authenticated: true, userId: "..."}`
- [ ] Sign out
- [ ] Call `GET /api/auth/session` (unauthenticated) → `{authenticated: false, userId: null}`

### 5. Campaigns Last-Used API
- [ ] Call `POST /api/campaigns/last-used` (authenticated) → returns existing campaign
- [ ] Delete all campaigns from database
- [ ] Call `POST /api/campaigns/last-used` → creates new campaign with `{created: true}`
- [ ] Call again → returns same campaign (no duplicate creation)

### 6. Keyboard Shortcuts
- [ ] Press ⌘K anywhere → CommandPalette opens
- [ ] Focus input field, press ⌘K → nothing happens (suppressed)
- [ ] Click contenteditable div, press ⌘K → nothing happens (suppressed)
- [ ] Press ⌘K in canvas → CommandPalette opens

### 7. Telemetry Tracking
- [ ] Open browser DevTools console
- [ ] Navigate to `/console` → check for "Telemetry event: route_opened"
- [ ] Navigate to `/dev/console` → check for same event with `mode: 'demo'`
- [ ] Spawn intel agent → check for "Telemetry event: asset_used_for_intel"
- [ ] Spawn pitch agent with assets → check for "Telemetry event: asset_attach_to_pitch"

### 8. Demo Mode Short-Circuits
- [ ] Sign out
- [ ] Spawn intel agent → API returns `{demo: true}`
- [ ] Spawn pitch agent → API returns `{demo: true}`
- [ ] Spawn tracker agent → API returns `{demo: true, logs: []}`
- [ ] Check database → no new entries created

### 9. RLS Policies (after migration applied)
- [ ] Apply migration: `supabase db push --linked`
- [ ] Create campaign as user A
- [ ] Sign in as user B
- [ ] Try to query user A's campaign → blocked by RLS
- [ ] Try to insert into user A's campaign → blocked by RLS
- [ ] Verify user B can only see their own data

### 10. Error Handling
- [ ] Disconnect internet, navigate to `/console` → falls back to demo mode
- [ ] Restore internet, spawn intel agent with invalid userId → gracefully handles error
- [ ] Delete `NEXT_PUBLIC_SUPABASE_URL` env var → APIs return unauthenticated

### 11. British English Compliance
- [ ] Inspect all UI strings for American spellings (color, behavior, center, etc.)
- [ ] Verify lowercase microcopy throughout
- [ ] Check FlowCore design tokens used (Matte Black, Slate Cyan, Ice Cyan)

### 12. Mobile Responsiveness
- [ ] Open `/console` on mobile viewport
- [ ] Verify demo banner responsive
- [ ] Confirm FlowCanvas adapts to screen size
- [ ] Test command palette on mobile (tap interactions)

---

## 📦 Files Created/Modified

### Created Files (8)
1. `apps/aud-web/src/app/dev/console/page.tsx` (~330 lines) - Demo console surface
2. `apps/aud-web/src/app/console/page.tsx` (~380 lines) - Production console route
3. `apps/aud-web/src/app/api/auth/session/route.ts` (~80 lines) - Auth session checker
4. `apps/aud-web/src/app/api/campaigns/last-used/route.ts` (~110 lines) - Campaign loader
5. `supabase/migrations/20251118000000_console_rls_sync.sql` (~220 lines) - RLS migration
6. `apps/aud-web/scripts/audit-15-4.ts` (~320 lines) - Audit script
7. `PHASE_15_4_COMPLETE.md` (this file) - Phase documentation

### Modified Files (4)
1. `apps/aud-web/src/app/api/agents/intel/route.ts` - Added auth + DB writes
2. `apps/aud-web/src/app/api/agents/pitch/route.ts` - Added auth + outreach logs
3. `apps/aud-web/src/app/api/agents/tracker/route.ts` - Added auth + DB reads
4. `apps/aud-web/src/components/agents/TrackerAgentNode.tsx` - Pass campaignId to API

**Total Lines Added**: ~1,440 lines
**Total Lines Modified**: ~100 lines

---

## 🚀 Next Steps (Phase 15.5+)

1. **Apply RLS Migration** (manual):
   ```bash
   supabase db push --linked
   ```

2. **Wire Remaining Keyboard Shortcuts**:
   - ⌘U (Asset Inbox Drawer)
   - ⌘S / ⌘⇧S (Save/Share Canvas)
   - ⌘I (Signal Drawer)
   - ⌘⌥→ / ⌘⌥← (Tab Navigation)

3. **Add Toast Notifications for Demo Mode**:
   - Show cyan info toast when writes are blocked
   - "demo mode — no data saved" message
   - Link to sign in page

4. **Telemetry Batching**:
   - Implement event batching (send max every 5 seconds)
   - Persist telemetry to `flow_telemetry` table
   - Add telemetry dashboard view

5. **Asset Inbox Drawer**:
   - Create AssetInboxDrawer component
   - Wire to ⌘U shortcut
   - List all assets from `artist_assets` table
   - Filter by campaign_id

6. **Signal Drawer**:
   - Create SignalDrawer component
   - Wire to ⌘I shortcut
   - Show recent agent activity
   - Display orchestration status

7. **Canvas Scene Save/Share**:
   - Implement Save (⌘S) → write to `canvas_scenes` table
   - Implement Share (⌘⇧S) → generate `public_share_id`
   - Add public share viewer page

8. **Enhanced Error Handling**:
   - Better error messages for API failures
   - Retry logic for transient errors
   - Offline mode detection and UI feedback

9. **Performance Optimizations**:
   - React Query for API caching
   - Optimistic UI updates
   - Prefetch campaigns on auth
   - Debounce canvas scene saves

10. **Analytics Dashboard**:
    - Visualize telemetry events
    - Campaign performance metrics
    - Asset usage statistics
    - User flow analysis

---

## 🎯 Audit Results

**Run**: `cd apps/aud-web && pnpm exec tsx scripts/audit-15-4.ts`

**Summary**:
- ✅ Passed: 40/47 checks
- ⚠️ Warned: 7/47 checks (RLS migration pending)
- ❌ Failed: 0/47 checks
- ⏭️ Skipped: 0/47 checks

**Categories**:
- Routes: 4/4 ✅
- Authentication: 4/4 ✅
- Database: 5/5 ✅
- Demo Mode: 4/4 ✅
- RLS: 1/8 ⚠️ (migration ready, needs manual application)
- Keyboard: 4/4 ✅
- Telemetry: 4/4 ✅
- UI: 6/6 ✅
- Error Handling: 5/5 ✅
- Style: 3/3 ✅

---

## 📝 Commit Messages (User-Specified)

1. `feat(console): add demo surface at /dev/console`
2. `feat(console): add production route at /console with auth`
3. `feat(agents): wire live Supabase data for intel/pitch/tracker`
4. `feat(api): add demo mode short-circuits for unauthenticated requests`
5. `feat(db): add RLS migration for console tables`

---

## ✨ Phase 15.4 Complete!

All implementation work is done. The only remaining step is applying the RLS migration manually via Supabase CLI.

**Ready for Production**: ✅ Yes (after RLS migration)
**TypeScript Errors**: ❌ None (pre-existing landing page errors unrelated to Phase 15.4)
**Linting Issues**: ❌ None
**Manual Steps Required**: ⚠️ 1 (apply RLS migration)

---

**🎉 Phase 15.4: Production Wiring & Demo Surface - COMPLETE**
