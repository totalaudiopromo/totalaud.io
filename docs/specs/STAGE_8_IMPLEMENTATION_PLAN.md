# Stage 8: Studio Personalisation & Collaboration - Implementation Plan

**Status**: 25% Complete (2/8 tasks)
**Date**: 2025-10-24
**Objective**: Evolve single-user Console into collaborative, personalised studio environment

---

## ✅ Completed Tasks

### 1. Realtime Engineer - Presence & Sync System
**Status**: ✅ Complete
**Files Created**:
- `/apps/aud-web/src/lib/realtimePresence.ts` - PresenceManager class
- `/apps/aud-web/src/hooks/usePresence.ts` - React hook for presence

**Features Implemented**:
- Realtime presence channel via Supabase Realtime
- User join/leave detection
- Theme, mode, and calm_mode broadcasting
- < 250ms latency target architecture
- Collaborator state synchronization
- Global Calm Mode detection

**API**:
```typescript
const { collaborators, updatePresence, isConnected } = usePresence(
  campaignId,
  userId,
  { theme: 'ascii', mode: 'plan', calm_mode: false }
)
```

### 2. Flow Architect - Schema & Access Control
**Status**: ✅ Complete
**Files Created**:
- `/supabase/migrations/20251024120000_add_collaboration_tables.sql`
- Updated `/apps/aud-web/src/lib/supabaseClient.ts` with new types

**Tables Created**:
1. `user_prefs` - Personal settings (theme, comfort, calm, sound, tone)
2. `campaign_collaborators` - Access control (owner/editor/viewer roles)
3. `collaboration_invites` - Temporary invite tokens (24h expiry)

**RLS Policies**:
- User prefs: Users can only access their own
- Collaborators: View-only for campaign members, manage for owners
- Invites: View for sender/recipient, create for owners
- Updated campaign policies: Check collaborator role for all operations

**Auto-triggers**:
- Campaign owner auto-created on campaign insert
- `updated_at` triggers for user_prefs
- Cleanup function for expired invites

---

## 🔧 Remaining Tasks

### 3. UI Designer - Presence & Sharing Components
**Status**: ⏳ Pending
**Priority**: High

**Components to Create**:

#### a) PresenceAvatars Component
**File**: `/apps/aud-web/src/components/ui/PresenceAvatars.tsx`

**Requirements**:
- Show active collaborators in Console header
- Display user initials or avatar
- Colored border matching collaborator's theme:
  - ASCII: `#3AE1C2` (cyan)
  - XP: `#0078D7` (blue)
  - Aqua: `#007AFF` (blue)
  - DAW: `#FF6B35` (orange)
  - Analogue: `#D4A574` (warm brown)
- Fade in/out animation (150ms) on join/leave
- Tooltip showing user name + theme + mode
- Stack avatars with overlap (−8px offset)
- Max 5 visible, "+N more" indicator
- Click to see full collaborator list

**Example Structure**:
```typescript
interface PresenceAvatarsProps {
  collaborators: Collaborator[]
  onCollaboratorClick?: (collaborator: Collaborator) => void
}

export function PresenceAvatars({ collaborators, onCollaboratorClick }: PresenceAvatarsProps) {
  // Implementation
}
```

#### b) ShareCampaignModal Component
**File**: `/apps/aud-web/src/components/ui/ShareCampaignModal.tsx`

**Requirements**:
- Modal overlay with backdrop blur
- Email input for inviting new collaborators
- Role selector (Editor / Viewer)
- List of current collaborators with roles
- Remove collaborator button (owner only)
- "Copy invite link" button
- Uses API route: `/api/collaboration/invite`
- Validation: valid email, not already invited
- Success/error toast notifications

**API Integration**: `/apps/aud-web/src/app/api/collaboration/invite/route.ts`

---

### 4. Experience Composer - User Preferences Sync
**Status**: ⏳ Pending
**Priority**: High

**Tasks**:

#### a) Extend useUserPrefs Hook
**File**: `/apps/aud-web/src/hooks/useUserPrefs.ts`

**Current State**: Check if hook exists, extend or create

**Requirements**:
- Fetch user prefs from `user_prefs` table on mount
- Auto-create default prefs if none exist
- Sync changes to Supabase in real-time (debounced 500ms)
- Update local state immediately for smooth UX
- Persist preferences:
  - `theme`: 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'
  - `comfort_mode`: boolean
  - `calm_mode`: boolean
  - `sound_muted`: boolean
  - `tone`: 'minimal' | 'balanced' | 'verbose'

**API**:
```typescript
const { prefs, updatePrefs, isLoading } = useUserPrefs(userId)

// Update single pref
await updatePrefs({ theme: 'daw' })

// Update multiple prefs
await updatePrefs({ calm_mode: true, sound_muted: true })
```

#### b) Auto-apply Preferences on Login
**File**: `/apps/aud-web/src/app/console/page.tsx` or ConsoleLayout

**Requirements**:
- Fetch user prefs on console mount
- Apply theme via `ThemeResolver.setTheme(prefs.theme)`
- Apply comfort/calm modes to motion system
- Apply sound muted state to audio system
- Show loading state while fetching prefs

---

### 5. Aesthetic Curator - Collaborative Visual Accents
**Status**: ⏳ Pending
**Priority**: Medium

**Tasks**:

#### a) Collaborator-Colored Activity Stream
**File**: `/apps/aud-web/src/components/console/ActivityStream.tsx`

**Requirements**:
- Add colored accent ring to events based on collaborator theme
- Own events: subtle glow (accent color at 20% opacity)
- Other collaborators: distinct accent border-left (3px solid)
- Hover: Show collaborator name + theme
- Animation: Fade in from left with theme-specific easing

#### b) Shared Calm Mode Visual Feedback
**File**: Multiple theme files + ConsoleLayout

**Requirements**:
- When any collaborator enables Calm Mode:
  - Reduce all animation durations by 80%
  - Replace spring animations with fade transitions
  - Add subtle banner: "Calm Mode active (shared by [name])"
  - Apply motion override globally via `isGlobalCalmModeActive()`
- Visual indicator in header (feather icon with tooltip)

---

### 6. Sound Director - Collaboration Audio Cues
**Status**: ⏳ Pending
**Priority**: Low

**Tasks**:

#### a) Collaboration Sound Assets
**Files**: Create procedural Web Audio API sounds

**Sounds to Create**:
1. **join.wav** (Collaborator joins)
   - Soft whoosh (250-300ms)
   - Frequency sweep 440Hz → 880Hz
   - Sine wave, fade in/out
   - Volume: −18 LUFS

2. **leave.wav** (Collaborator leaves)
   - Fade-out click (150ms)
   - Frequency decay 880Hz → 220Hz
   - Triangle wave
   - Volume: −20 LUFS

3. **message.wav** (Collaborator action)
   - Short ping (80ms)
   - Single tone 1046Hz (C6)
   - Sine wave
   - Volume: −16 LUFS

#### b) Sound Integration
**File**: `/apps/aud-web/src/hooks/useStudioSound.ts` (extend)

**Requirements**:
- Add collaboration sounds to sound banks
- Trigger `join` sound on `onCollaboratorJoin` callback
- Trigger `leave` sound on `onCollaboratorLeave` callback
- Respect user `sound_muted` preference
- Throttle: Max 1 sound per 500ms to avoid spam

---

### 7. Security Auditor - Invite & RLS Testing
**Status**: ⏳ Pending
**Priority**: Critical

**Tasks**:

#### a) Create Invite API Route
**File**: `/apps/aud-web/src/app/api/collaboration/invite/route.ts`

**Endpoints**:

**POST /api/collaboration/invite** - Create invite
```typescript
{
  campaign_id: string
  invited_email: string
  role: 'editor' | 'viewer'
}

Response:
{
  invite_token: string
  invite_url: string
  expires_at: string
}
```

**POST /api/collaboration/accept** - Accept invite
```typescript
{
  invite_token: string
}

Response:
{
  campaign_id: string
  role: string
}
```

**Requirements**:
- Generate secure random token (32 bytes, base64url)
- Set expiry: 24 hours from creation
- Check: User is campaign owner
- Check: Email not already invited
- Check: Campaign exists
- Send invite email (optional, Phase 2)

#### b) RLS Security Tests
**File**: `/apps/aud-web/tests/security/rls.spec.ts` (create)

**Test Scenarios**:
1. User A cannot view User B's campaigns
2. Viewer cannot insert campaign_events
3. Editor can insert campaign_events
4. Only owner can add/remove collaborators
5. Only owner can delete campaigns
6. Expired invites cannot be accepted
7. User cannot use someone else's invite token
8. User prefs are isolated per user

**Run via**: `pnpm test:security` (create script)

---

### 8. QA Coordinator - Documentation & Performance
**Status**: ⏳ Pending
**Priority**: High

**Tasks**:

#### a) Create STUDIO_COLLAB_SPEC.md
**File**: `/specs/STUDIO_COLLAB_SPEC.md`

**Contents**:
- Architecture overview
- Database schema (ERD diagram)
- RLS policies documentation
- Presence system flow diagram
- API endpoint specifications
- User flows (invite, accept, collaborate)
- Security considerations
- Performance targets and metrics

#### b) Create STUDIO_PERFORMANCE_REPORT.md
**File**: `/specs/STUDIO_PERFORMANCE_REPORT.md`

**Metrics to Measure**:
- Presence sync latency (target: < 250ms)
- Theme sync latency (target: < 150ms)
- Calm Mode broadcast latency (target: < 150ms)
- FPS with 3+ collaborators (target: ≥ 60fps)
- Database query times (user_prefs, collaborators)
- Memory usage with presence channels
- Network bandwidth (presence broadcasts)

**Tools**:
- Chrome DevTools Performance tab
- `performance.mark()` / `performance.measure()`
- Supabase Dashboard Logs
- Network tab (WebSocket frames)

#### c) Accessibility Audit
**Requirements**:
- ARIA labels on all interactive elements
- Keyboard navigation (Tab/Enter/Escape)
- Focus management in modals
- Screen reader testing (VoiceOver/NVDA)
- Color contrast (WCAG AA: 4.5:1)
- Focus visible indicators

**Checklist**: Document in STUDIO_COLLAB_SPEC.md

---

## 📋 Pre-Implementation Checklist

Before starting UI/hook implementation:

1. **Apply Database Migration**:
   ```bash
   # Copy SQL from supabase/migrations/20251024120000_add_collaboration_tables.sql
   # Paste into Supabase SQL Editor
   # Run migration
   # Verify tables exist
   ```

2. **Start Dev Server**:
   ```bash
   pnpm dev
   ```

3. **Test Presence System**:
   ```typescript
   // In ConsoleLayout.tsx
   const { collaborators, updatePresence } = usePresence(
     'test-campaign-id',
     'test-user-id',
     { theme: 'ascii', mode: 'plan', calm_mode: false }
   )

   console.log('Collaborators:', collaborators)
   ```

4. **Verify Types**:
   ```bash
   pnpm typecheck
   ```

---

## 🎯 Implementation Order

**Recommended sequence**:

1. **Apply database migration** (required for all subsequent work)
2. **Extend useUserPrefs hook** (foundational)
3. **Build PresenceAvatars component** (visible progress)
4. **Build ShareCampaignModal** (core feature)
5. **Create invite API route** (enables invites)
6. **Add visual accents** (polish)
7. **Add audio cues** (optional polish)
8. **Security testing** (validation)
9. **Documentation** (final deliverable)

---

## 🚀 Quick Start (Next Session)

```bash
# 1. Apply migration
# (Run SQL in Supabase Dashboard)

# 2. Verify types compile
pnpm typecheck

# 3. Start dev server
pnpm dev

# 4. Create useUserPrefs hook
# apps/aud-web/src/hooks/useUserPrefs.ts

# 5. Create PresenceAvatars component
# apps/aud-web/src/components/ui/PresenceAvatars.tsx

# 6. Integrate into ConsoleLayout
# apps/aud-web/src/layouts/ConsoleLayout.tsx
```

---

## 📊 Progress Tracker

| Task | Status | Files | Priority |
|------|--------|-------|----------|
| Presence System | ✅ | 2 files | Critical |
| Schema & RLS | ✅ | 2 files | Critical |
| PresenceAvatars | ⏳ | 1 file | High |
| ShareCampaignModal | ⏳ | 1 file | High |
| useUserPrefs | ⏳ | 1 file | High |
| Invite API | ⏳ | 1 file | Critical |
| Visual Accents | ⏳ | Multiple | Medium |
| Audio Cues | ⏳ | 1 file | Low |
| Security Tests | ⏳ | 1 file | Critical |
| Documentation | ⏳ | 2 files | High |

**Overall**: 2/10 tasks complete (20%)

---

## 🔥 Critical Path

**Must complete before Stage 8 can be considered functional**:

1. ✅ Presence system
2. ✅ Database schema
3. ⏳ useUserPrefs hook
4. ⏳ PresenceAvatars component
5. ⏳ Invite API route
6. ⏳ Security testing

**Nice-to-have (can defer)**:
- Visual accents
- Audio cues
- Performance documentation

---

## 💡 Notes for Next Session

- All background processes were running (9 dev servers) - killed before starting
- Supabase client types updated with new table definitions
- Migration file ready to apply
- Consider batch processing remaining UI components
- Audio cues are lowest priority (can be added post-launch)

---

**Last Updated**: 2025-10-24
**Next Review**: After database migration applied
