# Feature Wiring Audit

**Report Date**: 2026-01-12  
**Audit Scope**: aud-web workspace, console/sidebar, loopos routes  
**Status**: AUDIT ONLY — No fixes applied

---

## Executive Summary: Top 10 Most User-Visible Issues

| # | Surface | Location | Issue | Severity |
|---|---------|----------|-------|----------|
| 1 | **"Add credits" button** | `OpportunityDetailPanel.tsx:315-322` | Button opens with `onClick={() => {}}` - does nothing | **Fixed** |
| 2 | **Console Threads page** | `/console/threads/page.tsx` | Uses hardcoded `'current-artist'` slug - never loads real data | **P0** |
| 3 | **Console Insights page** | `/console/insights/page.tsx` | Uses hardcoded `'current-artist'` slug - never loads real data | **P0** |
| 4 | **Console Identity page** | `/console/identity/page.tsx` | Uses hardcoded `'current-artist'` slug - never loads real data | **P0** |
| 5 | **Navigator "Next Steps"** | `NavigatorPanel.tsx:139-157` | Recommended actions are read-only list items - clicking does nothing | **Fixed** |
| 6 | **Sidebar "threads" item** | `Sidebar.tsx:53` | Marked `comingSoon: true` but route exists and is functional | **P1** |
| 7 | **Sidebar "automations" item** | `Sidebar.tsx:54` | Marked `comingSoon: true` but route exists with full UI | **P1** |
| 8 | **LoopOS Placeholder Pages** | `loopos/src/app/*/page.tsx` | 4 routes show "coming soon" placeholder with no functionality | **P1** |
| 9 | **OperatorOS Placeholder** | `OperatorShell.tsx:61-74` | Shows "OperatorOS Placeholder" - no actual desktop | **P2** |
| 10 | **Intelligence API routes** | `/api/intelligence/*` | Only `/navigator/ask` route implemented; others return 404 | **P0** |

---

## Detailed Findings Table

### P0 (Broken) — User can click something that implies action and nothing/error happens

| Surface | Location | Trigger | Current Behavior | Expected Behavior | Fix Type |
|---------|----------|---------|------------------|-------------------|----------|
| "Add credits" button | `apps/aud-web/src/components/workspace/scout/OpportunityDetailPanel.tsx:315-322` | User clicks "Add credits" when they have insufficient balance | **Fixed** - Navigates to `/pricing` | Navigate to `/pricing` or open credits purchase modal | Wire route to `/pricing` or add credits modal |
| Console Insights API fetch | `apps/aud-web/src/app/console/insights/page.tsx:12,14-15` | Page loads | Uses `artistSlug = 'current-artist'` which never matches real user data - shows empty state | Should use actual authenticated user's artist slug | Wire to auth context / app_profiles |
| Console Threads API fetch | `apps/aud-web/src/app/console/threads/page.tsx:11,13-24` | Page loads | Uses `artistSlug = 'current-artist'` - all threads show empty/loading states | Should use actual authenticated user's artist slug | Wire to auth context / app_profiles |
| Console Identity API fetch | `apps/aud-web/src/app/console/identity/page.tsx:10-11` | Page loads | Uses `artistSlug = 'current-artist'` - shows "no identity data available" | Should use actual authenticated user's artist slug | Wire to auth context / app_profiles |
| Intelligence API routes | `apps/aud-web/src/lib/console/api/intelligence.ts` | Any console page tries to fetch correlations, trajectory, identity, etc. | Only `/api/intelligence/navigator/ask` exists - other routes 404 | All referenced routes should exist or gracefully degrade | Implement API routes or remove UI |
| Automations API | `apps/aud-web/src/app/console/automations/page.tsx:58-71` | User clicks any automation button | API call to `/api/intelligence/automations/run` which doesn't exist | Either implement endpoint or show proper "coming soon" state | Implement route or mark UI as coming soon |

### P1 (Confusing) — Click does something but feels unrelated or unclear

| Surface | Location | Trigger | Current Behavior | Expected Behavior | Fix Type |
|---------|----------|---------|------------------|-------------------|----------|
| Sidebar "threads" nav | `apps/aud-web/src/components/console/layout/Sidebar.tsx:53` | User sees "threads" in sidebar | Marked `comingSoon: true` - shows "Soon" badge, non-clickable | Page exists and has functional UI - should be navigable | Remove `comingSoon: true` |
| Sidebar "automations" nav | `apps/aud-web/src/components/console/layout/Sidebar.tsx:54` | User sees "automations" in sidebar | Marked `comingSoon: true` - shows "Soon" badge, non-clickable | Page exists with full UI - should be navigable (or backend should work) | Remove `comingSoon` or add proper placeholder state |
| Navigator recommended actions | `apps/aud-web/src/components/console/dashboard/NavigatorPanel.tsx:139-157` | User sees "Next Steps" after asking Navigator | **Fixed** - Click affordance removed as items are informational | Actions should either navigate to relevant mode or show detail | Make read-only or add click handlers |
| NextActionsList items | `apps/aud-web/src/components/console/dashboard/NextActionsList.tsx:30-128` | User clicks action item | Marks as complete locally only - never syncs to backend | Should sync completion or clearly indicate local-only state | Add backend sync or visual indicator |
| LoopOS Export page | `apps/loopos/src/app/export/page.tsx:24` | User navigates to Export | Shows "Export Centre coming soon" with no functionality | Either implement or remove from navigation | Add to nav with "coming soon" or implement |
| LoopOS Playbook page | `apps/loopos/src/app/playbook/page.tsx:24` | User navigates to Playbook | Shows "Playbook coming soon" with no functionality | Either implement or remove from navigation | Add to nav with "coming soon" or implement |
| LoopOS Journal page | `apps/loopos/src/app/journal/page.tsx:24` | User navigates to Journal | Shows "Journal coming soon" with no functionality | Either implement or remove from navigation | Add to nav with "coming soon" or implement |
| LoopOS Packs page | `apps/loopos/src/app/packs/page.tsx:24` | User navigates to Packs | Shows "Packs coming soon" with no functionality | Either implement or remove from navigation | Add to nav with "coming soon" or implement |
| Console Insights "next-steps" tab | `apps/aud-web/src/app/console/insights/page.tsx:68-76` | User clicks "next steps" tab | Shows static "coming soon" text | Either implement or mark tab as disabled | Implement or disable tab |

### P2 (Polish) — Minor affordance mismatch

| Surface | Location | Trigger | Current Behavior | Expected Behavior | Fix Type |
|---------|----------|---------|------------------|-------------------|----------|
| OperatorOS Desktop | `apps/totalaud.io/app/operator/components/OperatorShell.tsx:61-74` | Boot sequence completes | Shows "OperatorOS Placeholder" with static content | Should redirect to workspace or show actual desktop | Implement desktop or redirect |
| Operator Settings user/workspace IDs | `apps/totalaud.io/app/operator/settings/page.tsx:16-18` | Page loads | Uses hardcoded `'temp-user-id'` and `'temp-workspace-id'` | Should use actual auth context | Wire to auth context |
| LayoutPreferencesSection TODOs | `apps/totalaud.io/app/operator/settings/components/LayoutPreferencesSection.tsx:36,52,61` | User changes preferences | Preferences change locally but TODOs indicate no backend persistence | Should persist to backend or indicate local-only | Implement persistence |
| Analytics Canvas placeholder | `apps/aud-web/src/components/workspace/analytics/AnalyticsCanvas.tsx:6,129,154` | User views analytics | Shows "Chart Placeholder" comments with sample data | Should show real data or proper empty state | Implement real data or clear empty state |

---

## Click-Contract Map

### Workspace Navigation (aud-web)

| Mode | Route | Nav Trigger | Works? | Notes |
|------|-------|-------------|--------|-------|
| Ideas | `/workspace?mode=ideas` | Mode tab / Sidebar | ✅ | Fully functional |
| Scout | `/workspace?mode=scout` | Mode tab / Sidebar | ✅ | Functional, but "Add credits" CTA broken |
| Timeline | `/workspace?mode=timeline` | Mode tab / Sidebar | ✅ | Fully functional |
| Pitch | `/workspace?mode=pitch` | Mode tab / Sidebar | ✅ | Fully functional |

### Console Sidebar (aud-web)

| Item | Route | Clickable? | Works? | Notes |
|------|-------|------------|--------|-------|
| Dashboard | `/console` | ✅ | ✅ | Data fetches correctly |
| Insights | `/console/insights` | ✅ | ⚠️ | Route works but uses hardcoded slug |
| Identity | `/console/identity` | ✅ | ⚠️ | Route works but uses hardcoded slug |
| Threads | `/console/threads` | ❌ comingSoon | ⚠️ | Page exists but disabled in nav |
| Automations | `/console/automations` | ❌ comingSoon | ⚠️ | Page exists but disabled in nav |

### CrossModePrompt Actions

| Mode | Prompt Shown When | CTA | Target | Works? |
|------|-------------------|-----|--------|--------|
| Ideas | User has ideas | "Go to Scout" | `/workspace?mode=scout` | ✅ |
| Scout | No ideas exist | "Go to Ideas" | `/workspace?mode=ideas` | ✅ |
| Scout | Opportunities added | "Go to Timeline" | `/workspace?mode=timeline` | ✅ |
| Timeline | No scout data | "Go to Scout" | `/workspace?mode=scout` | ✅ |
| Timeline | Has events | "Go to Pitch" | `/workspace?mode=pitch` | ✅ |
| Pitch | No timeline data | "Go to Timeline" | `/workspace?mode=timeline` | ✅ |
| Pitch | Has drafts | "Go to Ideas" | `/workspace?mode=ideas` | ✅ |

### Console Dashboard Widgets

| Widget | Click Actions | Works? | Notes |
|--------|---------------|--------|-------|
| NavigatorPanel | Ask button submits q | ✅ | API route exists |
| NavigatorPanel | Recommended action items | ✅ | Fixed: Click affordance removed |
| NextActionsList | Action item click | ⚠️ | Local-only completion, no backend |
| PatternsGrid | Pattern items | ❌ | Read-only display |
| SnapshotCard | Stats | N/A | Display only |
| TrajectoryChart | Chart points | N/A | Display only |
| CoverageMapCard | Coverage stats | N/A | Display only |
| IdentitySummary | Identity info | N/A | Display only |
| SignalThreadsMini | Event items | N/A | Display only |

### Scout OpportunityDetailPanel CTAs

| CTA | Trigger | Works? | Notes |
|-----|---------|--------|-------|
| "Validate Contact" (with credits) | Click button | ✅ | Functional |
| "Validate Contact" (no credits) | Click button | ❌ Disabled | Correct behavior |
| "Add credits" | Click link | ✅ | Fixed: Navigates to `/pricing` |
| "Add to Timeline" | Click button | ✅ | Functional |
| "Create Pitch" | Click button | ✅ | Navigates to pitch mode |

---

## TODO/FIXME Items Corresponding to User-Facing Wiring Gaps

| File | Line | TODO/FIXME | User Impact |
|------|------|------------|-------------|
| `OpportunityDetailPanel.tsx` | 317 | `/* TODO: Navigate to credits purchase */` | **Fixed** - Navigates to `/pricing` |
| `operator/settings/page.tsx` | 16 | `// TODO: Get user/workspace IDs from auth context` | Medium - Settings won't persist correctly |
| `LayoutPreferencesSection.tsx` | 36 | `// TODO: Load saved preferences from app_profiles or other mechanism` | Medium - Preferences don't load |
| `LayoutPreferencesSection.tsx` | 52 | `// TODO: Save to backend if there's a mechanism for global preferences` | Medium - Preferences don't persist |
| `LayoutPreferencesSection.tsx` | 61 | `// TODO: Save to backend if there's a mechanism for persona preferences` | Medium - Preferences don't persist |
| `loopos/src/lib/collab/session.ts` | 32-139 | Multiple `// TODO:` for WebRTC integration | Low - Collab feature not visible to users |
| `loopos/src/hooks/usePresence.ts` | 48,54 | `// TODO: Fetch from loopos_user_profiles table` | Low - Presence feature not visible |

---

## Routes That Exist But May Be Unreachable

### aud-web Routes

| Route | Exists? | Linked From Nav? | Notes |
|-------|---------|------------------|-------|
| `/console/threads` | ✅ | ❌ (comingSoon) | Has full UI, should be reachable |
| `/console/automations` | ✅ | ❌ (comingSoon) | Has full UI, should be reachable |
| `/compare` | ✅ | ❌ | No visible link in main nav |
| `/faq` | ✅ | ❌ | No visible link in main nav (footer?) |
| `/for/[segment]` | ✅ | ❌ | Marketing pages, linked from landing |
| `/genre/[genre]` | ✅ | ❌ | SEO pages |
| `/location/[location]` | ✅ | ❌ | SEO pages |

### LoopOS Routes (loopos app)

| Route | Exists? | Functional? | Notes |
|-------|---------|-------------|-------|
| `/packs` | ✅ | ❌ Placeholder | "Coming soon" message |
| `/playbook` | ✅ | ❌ Placeholder | "Coming soon" message |
| `/journal` | ✅ | ❌ Placeholder | "Coming soon" message |
| `/export` | ✅ | ❌ Placeholder | "Coming soon" message |
| `/coach` | ✅ | ⚠️ Unknown | Need to verify |
| `/designer` | ✅ | ⚠️ Unknown | Need to verify |

---

## Feature Flags / Gates Identified

| Flag/Gate | Location | Controls | Status |
|-----------|----------|----------|--------|
| `comingSoon` prop | `Sidebar.tsx`, `SidebarOverlay.tsx` | Nav item visibility/clickability | Active - blocks threads/automations |
| `useFeatureGate` hook | `hooks/useFeatureGate.ts` | Soft limits on scout_view, pitch_coach, etc. | Functional |
| Demo director `isEnabled` | `_archive/components/demo/director/DirectorProvider.tsx` | Demo mode playback | Archived but referenced |

---

## Recommended Priority Order for Fixes

### Immediate (P0 - This Week)

1. **Wire "Add credits" button** → Fixed (Navigates to `/pricing`)
2. **Fix hardcoded `'current-artist'` slugs** in console pages → Use auth context
3. **Re-enable threads/automations nav** → Remove `comingSoon` flag (pages exist)
4. **Implement missing intelligence API routes** OR gracefully handle 404s

### Short Term (P1 - Next Sprint)

5. **Navigator recommended actions** → Fixed (Click affordance removed)
6. **NextActionsList backend sync** → Persist completions or show local-only indicator
7. **LoopOS placeholder pages** → Either implement or hide from navigation

### Polish (P2 - When Convenient)

8. **OperatorOS desktop** → Implement or redirect to main workspace
9. **Operator settings auth context** → Wire real user/workspace IDs
10. **Analytics Canvas** → Replace placeholder charts with real data

---

## Appendix: Search Queries Used

```bash
# TODOs and FIXMEs
rg -n "TODO|FIXME|HACK|XXX" apps/aud-web apps/totalaud.io apps/loopos

# Coming soon placeholders
rg -n "coming soon|placeholder|not implemented" apps/aud-web apps/totalaud.io apps/loopos

# Empty handlers
rg -n "onClick=\{?\(\)\s*=>\s*\{\s*\}\}?" apps/aud-web

# Disabled elements
rg -n "disabled|aria-disabled" apps/aud-web/src/components

# Feature flags
rg -n "useFeatureGate|featureFlag|isEnabled" apps

# Route navigation
rg -n "router\.push|navigate\(" apps/aud-web
```

---

**Report End**
