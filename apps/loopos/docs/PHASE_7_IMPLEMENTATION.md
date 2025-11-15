# LoopOS Phase 7 Implementation Guide

**Status**: Phase 7a Complete ✅
**Started**: 2025-11-15
**Author**: Claude (Sonnet 4.5)

This document tracks the complete implementation of LoopOS Phase 7, covering Authentication, Workspaces, TAP Integration, AI Designer Mode, and iOS/PWA support.

---

## 📋 Implementation Checklist

### ✅ Phase 7a: Authentication + Workspaces + RLS (COMPLETE)

**Completed Tasks:**

- [x] Create LoopOS app structure (Next.js 15)
- [x] Set up loopos-db package with Supabase client
- [x] Create database migrations (12 tables + RLS policies)
- [x] Implement Supabase passwordless authentication (magic links)
- [x] Build workspace management (create, list, switch)
- [x] Add role-based access control (owner, editor, viewer)
- [x] Create workspace switcher UI component
- [x] Build AuthGuard for route protection
- [x] Create login page and auth callback
- [x] Implement dashboard with navigation (desktop + mobile)
- [x] Add environment variable validation (Zod)
- [x] Create placeholder pages (Packs, Playbook, Coach, Journal, Export, Designer)
- [x] Add PWA manifest and service worker
- [x] Write comprehensive documentation (README + this file)

**Database Tables Created:**

1. `loopos_workspaces` - Workspace management
2. `loopos_workspace_members` - Membership + roles
3. `loopos_nodes` - Timeline canvas nodes
4. `loopos_notes` - Quick notes
5. `loopos_journal_entries` - Journal (text/voice)
6. `loopos_moodboard_items` - Visual references
7. `loopos_creative_packs` - Templates
8. `loopos_playbook_chapters` - Strategic guidance
9. `loopos_flow_sessions` - Focused sessions
10. `loopos_agent_executions` - AI runs
11. `loopos_auto_chains` - Automation
12. `loopos_exports` - Generated exports

**RLS Policies:** ✅ All tables have comprehensive Row Level Security policies

---

### 🚧 Phase 7b: TAP Integration Layer (PENDING)

**Integration Points:**

| TAP Service | LoopOS Integration | Implementation Status |
|-------------|-------------------|----------------------|
| **Console** | Export sequences → tasks | ⏳ Not Started |
| **Audio Intel** | Enrich with audience insights | ⏳ Not Started |
| **Tracker** | Convert nodes → submissions | ⏳ Not Started |
| **Pitch** | Generate press materials | ⏳ Not Started |

**Implementation Plan:**

```
apps/loopos/src/integrations/
├── console/
│   ├── api.ts              # Console API client
│   ├── export.ts           # Export to Console
│   └── sync.ts             # Sync task status
├── audio-intel/
│   ├── api.ts              # Intel API client
│   ├── insights.ts         # Fetch insights
│   └── enrich.ts           # Enrich campaigns
├── tracker/
│   ├── api.ts              # Tracker API client
│   ├── submissions.ts      # Create submissions
│   └── follow-ups.ts       # Track follow-ups
└── pitch/
    ├── api.ts              # Pitch API client
    ├── press-release.ts    # Generate press releases
    ├── epk.ts              # Generate EPK copy
    └── plugger-brief.ts    # Generate radio brief
```

**TAP API Configuration:**

```typescript
// Environment variables needed
TAP_API_URL=https://api.totalaudiopromo.com
TAP_API_KEY=your-tap-api-key

// Client-side API calls only
// NO direct database access
// Use OAuth tokens later
```

**UI Components Needed:**

- [ ] TAP connection status indicator
- [ ] Export to Console modal
- [ ] Intel enrichment panel
- [ ] Tracker submission form
- [ ] Pitch generation interface

---

### 🚧 Phase 7c: AI Designer Mode (PENDING)

**VisionOS-Inspired Visual Engine:**

**Components to Build:**

```
apps/loopos/src/app/designer/
├── page.tsx                        # Main Designer Mode page
├── components/
│   ├── DesignerCanvas.tsx          # Full-screen canvas
│   ├── SceneRenderer.tsx           # Render AI scenes
│   ├── NodeCloud.tsx               # Floating node visualisation
│   ├── TimelineScene.tsx           # Timeline view
│   ├── VisualThemesScene.tsx       # Visual themes
│   └── ControlPanel.tsx            # Scene controls
└── engine/
    ├── scene-generator.ts          # AI scene generation
    ├── scene-types.ts              # Scene templates
    └── renderer.ts                 # Scene → visual mapping
```

**Scene Types:**

1. **Release Strategy Scene** - Campaign timeline with milestones
2. **Audience Development Scene** - Growth funnel visualisation
3. **30-Day Growth Scene** - Daily actions mapped visually
4. **EPK Visual Structure** - Press kit components
5. **Creative Identity Map** - Brand essence visualisation

**AI Agent Integration:**

```typescript
// Designer AI reads:
- All workspace nodes
- Creative packs applied
- Journal reflections
- Coach conversations
- Timeline structure

// Designer AI outputs:
{
  scene_type: 'release-strategy',
  elements: [
    { type: 'milestone', position: [x, y, z], ... },
    { type: 'arc', from: node1, to: node2, ... },
  ],
  narrative: 'Your release follows a three-act structure...',
  recommendations: ['Add more early engagement', ...]
}
```

**Visual Features:**

- Framer Motion 3D transforms
- Parallax depth layers
- Glass morphism panels
- Particle systems
- Cinematic transitions (400ms easing)

---

### 🚧 Phase 7d: iOS/PWA Super-Optimisation (PENDING)

**PWA Features:**

- [x] manifest.json created
- [x] Service worker for offline caching
- [ ] Install prompt UI
- [ ] Offline mode with sync queue
- [ ] Background sync for drafts

**Mobile Navigation:**

- [x] Mobile drawer navigation
- [ ] Bottom tab bar (alternative to drawer)
- [ ] Swipe gestures for navigation
- [ ] Pull-to-refresh

**Touch Gestures:**

```typescript
// Timeline Canvas
- Pinch to zoom
- Touch drag (pan canvas)
- Long-press (context menu)
- Double tap (create node)
- Swipe (navigate timeline)

// Moodboard
- Multi-touch rearrange
- Pinch to scale items
- Rotate with two fingers

// Journal
- Swipe to delete entry
- Pull-to-refresh
```

**Haptic Feedback:**

```typescript
// Web Vibration API
navigator.vibrate(10)  // Light tap
navigator.vibrate(50)  // Medium feedback
navigator.vibrate([10, 50, 10])  // Pattern
```

**Performance Optimisations:**

- Lazy load all heavy components
- Image optimisation (Next.js Image)
- Virtual scrolling for long lists
- Code splitting by route
- Prefetch on link hover

**Offline Support:**

```typescript
// Queue writes when offline
const syncQueue = {
  nodes: [],
  notes: [],
  journal: []
}

// Sync when back online
window.addEventListener('online', () => {
  syncQueue.nodes.forEach(node => createNode(node))
  // ...
})
```

---

## 🎯 Implementation Order

### Phase 7a (✅ COMPLETE)
1. App structure + database
2. Authentication system
3. Workspace management
4. Basic navigation
5. PWA foundations

### Phase 7b (NEXT)
1. TAP API client setup
2. Console export integration
3. Intel enrichment
4. Tracker submission
5. Pitch generation

### Phase 7c (AFTER 7b)
1. Designer Mode UI
2. AI scene generator
3. Scene renderer
4. Visual templates
5. Iterative regeneration

### Phase 7d (PARALLEL WITH 7c)
1. Touch gesture system
2. Mobile optimisations
3. Offline mode
4. Install prompts
5. Performance tuning

---

## 📦 Package Dependencies

### apps/loopos

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.17.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/supabase-js": "^2.39.0",
    "@total-audio/loopos-db": "workspace:*",
    "framer-motion": "^11.11.17",
    "lucide-react": "^0.546.0",
    "next": "15.0.3",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "sonner": "^2.0.7",
    "zod": "^3.22.4",
    "zustand": "^5.0.2"
  }
}
```

### packages/loopos-db

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "zod": "^3.22.4"
  }
}
```

---

## 🗂️ File Inventory

### Created Files (Phase 7a)

**App Configuration:**
- `apps/loopos/package.json`
- `apps/loopos/tsconfig.json`
- `apps/loopos/next.config.js`
- `apps/loopos/tailwind.config.js`
- `apps/loopos/postcss.config.js`
- `apps/loopos/.env.example`
- `apps/loopos/.gitignore`

**Source Code:**
- `apps/loopos/src/lib/env.ts`
- `apps/loopos/src/lib/auth.ts`
- `apps/loopos/src/hooks/useAuth.ts`
- `apps/loopos/src/hooks/useWorkspace.ts`
- `apps/loopos/src/stores/workspace.ts`
- `apps/loopos/src/app/globals.css`
- `apps/loopos/src/app/layout.tsx`
- `apps/loopos/src/app/page.tsx`
- `apps/loopos/src/app/login/page.tsx`
- `apps/loopos/src/app/auth/callback/route.ts`
- `apps/loopos/src/app/logout/route.ts`
- `apps/loopos/src/app/dashboard/page.tsx`
- `apps/loopos/src/app/packs/page.tsx`
- `apps/loopos/src/app/playbook/page.tsx`
- `apps/loopos/src/app/coach/page.tsx`
- `apps/loopos/src/app/journal/page.tsx`
- `apps/loopos/src/app/export/page.tsx`
- `apps/loopos/src/app/designer/page.tsx`
- `apps/loopos/src/components/AppShell.tsx`
- `apps/loopos/src/components/AuthGuard.tsx`
- `apps/loopos/src/components/WorkspaceSwitcher.tsx`

**Database Package:**
- `packages/loopos-db/package.json`
- `packages/loopos-db/tsconfig.json`
- `packages/loopos-db/src/client.ts`
- `packages/loopos-db/src/types.ts`
- `packages/loopos-db/src/workspace.ts`
- `packages/loopos-db/src/nodes.ts`
- `packages/loopos-db/src/journal.ts`
- `packages/loopos-db/src/packs.ts`
- `packages/loopos-db/src/playbook.ts`
- `packages/loopos-db/src/index.ts`

**Database:**
- `supabase/migrations/20251115000000_loopos_phase_7_setup.sql`

**PWA:**
- `apps/loopos/public/manifest.json`
- `apps/loopos/public/sw.js`

**Documentation:**
- `apps/loopos/README.md`
- `apps/loopos/docs/PHASE_7_IMPLEMENTATION.md` (this file)

**Total Files Created**: 43

---

## 🧪 Testing Checklist

### Authentication
- [ ] Magic link sends successfully
- [ ] Auth callback redirects to dashboard
- [ ] Logout clears session
- [ ] AuthGuard redirects unauthenticated users
- [ ] Session persists across page reloads

### Workspaces
- [ ] Create workspace
- [ ] Switch workspace
- [ ] Workspace switcher shows all workspaces
- [ ] Workspace slug is unique
- [ ] RLS policies enforce workspace isolation

### Navigation
- [ ] Desktop sidebar navigation works
- [ ] Mobile drawer opens/closes
- [ ] Active route is highlighted
- [ ] All pages load without errors

### Database
- [ ] All migrations run successfully
- [ ] RLS policies enforced
- [ ] No permission errors for valid users
- [ ] Workspace members can view workspace data
- [ ] Non-members cannot view workspace data

---

## 🐛 Known Issues

None yet (Phase 7a just completed).

---

## 📝 Notes for Next Session

**Priority Tasks:**

1. Test the complete authentication flow
2. Run database migrations
3. Verify RLS policies
4. Start TAP integration layer
5. Build Timeline canvas with React Flow

**Environment Setup:**

```bash
# Copy .env.example to .env
cd apps/loopos
cp .env.example .env

# Add real credentials
# - Supabase URL + keys
# - Anthropic API key (optional)
# - TAP API credentials (optional)

# Run migrations
pnpm db:migrate

# Start dev server
pnpm dev
```

**Next Implementation:**

Start with `apps/loopos/src/integrations/console/api.ts` for TAP Console integration.

---

**Last Updated**: 2025-11-15 19:45 UTC
**Next Review**: After Phase 7b completion
