# UX Flow Audit Summary

**Date**: 2026-01-09  
**Scope**: totalaud.io workspace (aud-web)  
**Goal**: Does the product reduce cognitive load at every step? If it adds load, fix or remove.

---

## PASS 1 — First-Time User Reality Check

### Starting Point Analysis

| Area | Finding | Status |
|------|---------|--------|
| Post-signup landing | User lands on `/workspace?mode=ideas` with starter prompts visible | ✅ Working well |
| Mode tabs | 4 clear modes (Ideas, Scout, Timeline, Pitch) — no paralysis | ✅ Working well |
| Initial CTA pressure | Empty state says "Your creative space" — invites, doesn't demand | ✅ Working well |
| Setup requirements | None — can start working immediately | ✅ Working well |
| ModeTour onboarding | Shows 3-4 step tour on first mode visit; dismissible | ✅ Working well |
| Starter ideas hint | "Starter prompts — edit or delete to make them yours" | ✅ Working well |

### Friction Points

| Issue | Severity | Decision |
|-------|----------|----------|
| **TipBanner appears in each mode** — could feel like repeated onboarding | Low | ⚠️ Leave — dismisses once and persists |
| **ModeTour modal on every mode's first visit** — 4 modal interruptions total | Medium | ⚠️ Consider — but tours are short (3-4 steps) and dismissible |

### Summary: PASS 1
### Verdict: ✅ Working well — leave it

The first-time experience is calm. No setup wizard, no questions before starting. User sees a creative canvas immediately with gentle starter prompts.

---

## PASS 2 — Single Track Flow (Golden Path)

### Flow: Ideas → Scout → Timeline → Pitch

| Step | Experience | Status |
|------|------------|--------|
| **Ideas: Define intent** | Canvas appears with starter prompts. Double-click or + to add. Tags for organization. | ✅ Working well |
| **Scout: Find opportunities** | Grid of opportunities. Filter bar. "Add to Timeline" button. | ✅ Working well |
| **Timeline: Plan the release** | Swim lanes. Drag-drop. Events from Scout appear automatically. | ✅ Working well |
| **Pitch: Clarify meaning** | Template selection → section editor → second opinion panel. | ✅ Working well |

### Context Continuity

| Cross-mode feature | Status |
|--------------------|--------|
| **Track Memory anchor** (Ideas intent → shows in Pitch/Timeline) | ✅ Working well |
| **CrossModePrompt** suggests next step based on data state | ✅ Working well |
| **Opportunity → Timeline sync** | ✅ Working well |
| **URL preserves track param** when switching modes | ✅ Working well |

### Friction Points

| Issue | Severity | Decision |
|-------|----------|----------|
| **CrossModePrompt language is slightly pushy** — "Ready to reach out? Craft your pitch." | Low | ⚠️ Consider softening — but message only appears when relevant |
| **Each mode starts "fresh" visually** — no breadcrumb trail | Low | ✅ Leave — modes are parallel, not sequential hierarchy |

### Summary: PASS 2
### Verdict: ✅ Working well — minor language polish possible

Context flows between modes naturally. Track Memory integration ensures intent is visible. CrossModePrompt guides without forcing.

---

## PASS 3 — Mode Transitions & Navigation

### Navigation Structure

| Element | Status |
|---------|--------|
| **Mode tabs in header** | ✅ Clean, equal weight, highlighted active |
| **Mobile bottom nav** | ✅ Same 4 modes, consistent |
| **URL behaviour** | ✅ `/workspace?mode=x&track=y` — predictable, shareable |
| **Layout stability** | ✅ No jarring shifts when switching |

### Mental State Preservation

| Scenario | Status |
|----------|--------|
| Switch Ideas → Scout → back to Ideas | ✅ Canvas state preserved |
| Switch Timeline → Pitch → back | ✅ Events preserved, pitch drafts preserved |
| Track context across modes | ✅ Preserved via URL param + stores |

### Friction Points

| Issue | Severity | Decision |
|-------|----------|----------|
| **No "back to where I was" button** when deep in a flow | Low | ✅ Leave — not needed; modes are peers |
| **Sidebar panel (e.g., Threads, OpportunityDetail)** closes on mode switch | Low | ✅ Leave — correct behaviour |

### Summary: PASS 3
### Verdict: ✅ Working well — leave it

Navigation is simple and predictable. No hierarchy confusion. Stores persist state across mode switches.

---

## PASS 4 — Empty States & Hesitation Moments

### Empty State Audit

| Mode | Empty State Title | Empty State Description | Status |
|------|-------------------|------------------------|--------|
| **Ideas** (no cards) | "Your creative space" | "Capture lyrics, melodies, marketing ideas, or anything that sparks inspiration." | ✅ Invitational |
| **Scout** (no opportunities) | "Discover opportunities" | "Find radio DJs, playlist curators, and press contacts..." | ✅ Informational |
| **Scout** (no filter results) | "No opportunities match your filters" | "Try adjusting your filters or clearing your search to see more results." | ✅ Helpful |
| **Timeline** (no events) | "Plan your release" | "Start with a template or add custom events." | ✅ Invitational |
| **Timeline** (empty NextSteps sidebar) | "Next Steps" | "No upcoming events. Add events from Scout or create them manually." | ⚠️ Slight friction |
| **Pitch** (no template selected) | "Choose your pitch type" | "Select a template to get started. You'll have help..." | ✅ Invitational |

### Hesitation Analysis

| Moment | Current UX | Status |
|--------|------------|--------|
| **Ideas is blank** | Starter prompts preloaded to reduce blank canvas anxiety | ✅ Working well |
| **Scout shows auth-gated preview** | Blurred preview with sign-in CTA | ✅ Working well |
| **Timeline has no events** | EmptyState with CrossModePrompt to Scout | ✅ Working well |
| **Pitch has no template** | Template selector with brief descriptions | ✅ Working well |

### Friction Points

| Issue | Severity | Decision |
|-------|----------|----------|
| **NextSteps sidebar says "Add events from Scout or create them manually"** — slightly instructional | Low | ⚠️ Small fix — soften to "Events will appear here" |
| **Scout empty state includes "Opportunities are loaded from your account"** — unnecessary | Low | ⚠️ Small fix — remove |

### Summary: PASS 4
### Verdict: ⚠️ Minor friction — 2 small copy fixes

Empty states are generally calm and invitational. Two micro-copy lines could be softened.

---

## PASS 5 — Exit & Return Flow

### Return Experience

| Scenario | Details | Status |
|----------|---------|--------|
| **Return to Ideas** | Cards persist (localStorage for guests, Supabase for auth) | ✅ Working well |
| **Return to Timeline** | Events persist | ✅ Working well |
| **Return to Pitch** | Drafts persist in store | ⚠️ Check |
| **Track context on return** | Requires track param in URL | ✅ Correct |

### Guilt / Pressure Signals

| Anti-pattern | Present? | Status |
|--------------|----------|--------|
| Progress bars | ❌ No | ✅ |
| Streaks / activity tracking | ❌ No | ✅ |
| "You haven't finished..." | ❌ No | ✅ |
| Last login reminders | ❌ No | ✅ |
| Completion percentages | ❌ No | ✅ |
| Notification badging | ❌ No | ✅ |

### Friction Points

| Issue | Severity | Decision |
|-------|----------|----------|
| **"Next Steps" heading implies urgency** | Low | ⚠️ Small fix — rename to "Coming Up" |
| **"overdue" label in NextSteps** (red text for past events) | Medium | ⚠️ Fix — consider softer language like "past" |

### Summary: PASS 5
### Verdict: ⚠️ Minor friction — 2 small fixes

No guilt mechanics. No progress pressure. Small language refinement in NextSteps.

---

## UX Anti-Patterns Audit (Kill List)

| Pattern | Found? | Location | Decision |
|---------|--------|----------|----------|
| "Next steps" that assume urgency | ⚠️ Partially | NextSteps sidebar | ⚠️ Rename to "Coming Up" |
| Dashboards summarising activity instead of meaning | ❌ No | — | ✅ |
| Multiple places to do the same thing | ❌ No | — | ✅ |
| Optimisation / performance / success metrics language | ❌ No (cleaned in previous sweep) | — | ✅ |
| Making the artist feel observed | ❌ No | — | ✅ |

---

## FINAL DECISION SUMMARY

### ✅ LEAVE (Working Well)
- First-time user landing
- Mode navigation structure
- Empty states (most)
- Cross-mode context flow
- Track Memory integration
- No guilt/pressure mechanics
- Store persistence

### ⚠️ SMALL FIX (Low-priority copy polish)

| File | Change |
|------|--------|
| `NextSteps.tsx` | Rename heading "Next Steps" → "Coming Up" |
| `NextSteps.tsx` | Change "overdue" → "past" for past events |
| `NextSteps.tsx` | Change empty state copy from "Add events from Scout or create them manually." → "Events will appear here." |
| `ScoutGrid.tsx` | Remove line "Opportunities are loaded from your account" |
| `CrossModePrompt.tsx` | (Optional) Soften "Ready to reach out?" → "When you're ready to reach out..." |

### ❌ REMOVE / DEFER
None identified. The workspace is clean.

---

## CONCLUSION

**The product stays out of the artist's way.**

The UX is calm, context-aware, and non-judgmental. Empty states invite rather than demand. Navigation is simple and predictable. No guilt mechanics exist.

**Recommended action**: Apply the 4-5 small copy fixes above, then ship.

These are all one-line changes and do not require new features, wireframes, or redesigns.
