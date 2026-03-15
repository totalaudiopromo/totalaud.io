# Collaborative UX Guide - Studio Session Etiquette

**Project**: totalaud.io (Experimental Multi-Agent System)
**Stage**: 8.5 - Shared Session UX & Multi-User QA
**Version**: 1.0
**Last Updated**: 2025-10-24

---

## Table of Contents

1. [Overview](#overview)
2. [Join/Leave Notifications](#joinleave-notifications)
3. [Simultaneous Editing Conflicts](#simultaneous-editing-conflicts)
4. [Calm Mode Negotiation](#calm-mode-negotiation)
5. [Color & Tone Etiquette](#color--tone-etiquette)
6. [Visual Feedback Patterns](#visual-feedback-patterns)
7. [Best Practices](#best-practices)
8. [Conflict Resolution](#conflict-resolution)
9. [Performance Guidelines](#performance-guidelines)

---

## Overview

The Console is a **collaborative presence workspace**, not a real-time collaborative editor. Think of it as a shared studio where multiple people can work on the same campaign simultaneously, with awareness of each other's presence and actions, but without live co-editing of the same document (like Google Docs).

### Design Philosophy

**"See each other, respect each other's space"**

- **Presence Awareness**: See who's online and what they're working on
- **Visual Identity**: Each user's theme color creates personal visual identity
- **Accessibility First**: Calm Mode is global - if one person needs it, everyone gets it
- **Async Coordination**: Collaborate through awareness, not real-time editing

---

## Join/Leave Notifications

### User Joins Campaign

**What Happens**:
1. New avatar fades in (120ms easeOutSoft) with theme-colored border
2. Active indicator dot appears (green)
3. Presence count updates
4. No toast notification (reduces noise)

**Expected Behavior**:
```
User opens Console → usePresence() connects → broadcasts { theme, mode, calm_mode }
→ Other users receive 'join' event → PresenceAvatars adds new avatar
```

**UX Guidance**:
- **Silent by default**: No audio/visual notification (reduces interruptions)
- **Visible in avatars**: Check PresenceAvatars to see new collaborators
- **Hover for details**: Tooltip shows user name, theme, mode

**When to Notify (Future Enhancement)**:
- Owner joins during active editing session
- More than 5 users join (unusual activity)
- User joins from unexpected location (security)

### User Leaves Campaign

**What Happens**:
1. Avatar fades out (120ms easeOutSoft)
2. Presence count updates
3. No toast notification

**Expected Behavior**:
```
User closes browser → Presence timeout (30s) → broadcasts 'leave' event
→ Other users receive → PresenceAvatars removes avatar
```

**UX Guidance**:
- **30-second grace period**: Brief network disconnections don't trigger leave
- **Silent departure**: No notification to avoid interruption
- **Activity history persists**: Past actions remain in ActivityStream

**Edge Cases**:
- **Network disconnect**: Avatar stays visible for 30s, then fades
- **Browser crash**: Same as network disconnect (30s timeout)
- **Multiple tabs**: Each tab = separate presence (may show duplicate avatars)

---

## Simultaneous Editing Conflicts

### Current Architecture

**No Real-Time Collaborative Editing**

The Console does NOT support real-time co-editing like Google Docs. Users can work on the same campaign, but each action is atomic and server-validated.

### Conflict Scenarios

#### 1. Two Users Spawn Same Agent

**Scenario**: Alice and Bob both click "Spawn Agent: Radio Scout" simultaneously.

**What Happens**:
- Both requests hit `/api/agents/spawn`
- Database enforces unique agent names per campaign
- First request succeeds, second fails with `409 Conflict`

**UX Handling**:
```typescript
try {
  await spawnAgent({ name: 'radio-scout', role: 'scout' })
  toast.success('Agent spawned: Radio Scout')
} catch (error) {
  if (error.status === 409) {
    toast.error('Agent already exists: Radio Scout')
  }
}
```

**Best Practice**: Use unique, timestamped agent names:
- ❌ `radio-scout` (generic, will conflict)
- ✅ `radio-scout-alice-1730123456` (unique)
- ✅ `radio-scout-oct24-14:30` (human-readable, unique)

#### 2. Two Users Edit Same Flow Node

**Scenario**: Alice edits node position while Bob edits node config.

**Current State**: Last write wins (no conflict detection)

**What Happens**:
- Alice moves node → Updates `node.position`
- Bob edits config → Updates `node.data`
- Both succeed, changes merge naturally (different fields)

**Conflict Case**:
- Alice moves node to (100, 200)
- Bob moves node to (300, 400)
- Last API response wins → Bob's position overrides Alice's

**UX Handling** (Future Enhancement):
```typescript
// Optimistic locking with version numbers
await updateNode({
  id: 'node-123',
  position: { x: 100, y: 200 },
  version: 5, // Current version
})

// Server response:
// 409 Conflict if version !== current
// 200 OK if version matches → increment to version 6
```

**Best Practice**: Communicate via Slack/Discord when editing same nodes
- "Editing flow studio, touching Release Strategy node"
- "I'm done with that node, all yours"

#### 3. Two Users Delete Same Agent

**Scenario**: Alice deletes agent while Bob is viewing it.

**What Happens**:
- Alice clicks "Delete Agent" → API removes from database
- Bob's UI still shows agent (stale state)
- Bob clicks agent → 404 Not Found

**UX Handling**:
```typescript
// Real-time subscription updates all users
useEffect(() => {
  const channel = supabase.channel('agents')
    .on('postgres_changes', { event: 'DELETE', table: 'agents' }, (payload) => {
      removeAgentFromUI(payload.old.id)
      toast.info(`Agent removed: ${payload.old.name}`)
    })
    .subscribe()
}, [])
```

**Best Practice**: Use real-time subscriptions for deletions
- Agents, flows, events → subscribe to DELETE events
- Remove from UI immediately when other user deletes

---

## Calm Mode Negotiation

### Philosophy: "One person needs it, everyone gets it"

**Global Calm Mode** is an accessibility feature. If any collaborator enables Calm Mode, motion reduction applies to all users in that campaign.

### Why Global?

1. **Accessibility > Preference**: Motion sensitivity is a medical need, not just a preference
2. **Shared Space**: Like dimming lights in a shared office - respect the most sensitive person
3. **Subtle Impact**: Reduced motion still feels smooth, just faster (0.01ms animations)

### How It Works

```typescript
// Detect if any collaborator has Calm Mode enabled
const hasAnyCalmMode = collaborators.some((c) => c.calm_mode)

useEffect(() => {
  if (hasAnyCalmMode) {
    document.documentElement.classList.add('reduce-motion')
  } else {
    document.documentElement.classList.remove('reduce-motion')
  }
}, [hasAnyCalmMode])
```

**CSS**:
```css
.reduce-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
```

### User Communication

**Banner (Recommended Future Enhancement)**:
```
┌────────────────────────────────────────────────────────┐
│ ℹ️  Calm Mode is active (Alice prefers reduced motion) │
└────────────────────────────────────────────────────────┘
```

**When to Show Banner**:
- Another user enables Calm Mode (not self)
- On join, if any existing user has Calm Mode
- Hide after 10 seconds (informational, not intrusive)

**Tooltip on PresenceAvatar**:
```
Alice (CALM MODE ACTIVE)
DAW theme
Track mode
```

### Conflict: User Disables Their Own Calm Mode

**Scenario**: Alice enables Calm Mode → Bob sees reduced motion → Alice disables Calm Mode.

**What Happens**:
- Alice's presence updates: `{ calm_mode: false }`
- Bob checks: `hasAnyCalmMode = false` → Removes `.reduce-motion` class
- Motion returns for everyone

**UX Guidance**:
- **No negotiation needed**: System handles automatically
- **No user-to-user messages**: Presence system handles coordination
- **Respects most restrictive setting**: If 3 users, 1 has Calm Mode → all get reduced motion

---

## Color & Tone Etiquette

### Theme Colors as Personal Identity

Each user's theme color creates their visual identity across the Console:

| Theme | Color | Personality |
|-------|-------|-------------|
| ASCII | Cyan (#3AE1C2) | Minimalist producer |
| XP | Blue (#0078D7) | Nostalgic optimist |
| Aqua | Blue (#007AFF) | Perfectionist designer |
| DAW | Orange (#FF6B35) | Experimental creator |
| Analogue | Warm Brown (#D4A574) | Human hands, lo-fi |

### Visual Feedback by User

**PresenceAvatars**:
- Avatar border matches user's theme color
- Hover shows theme name in tooltip

**ActivityStream Events**:
- Own actions: Subtle glow (20% opacity theme color)
- Other users: 3px solid border-left (theme color)
- Tooltip: "{name} triggered this action"

**Future Enhancements**:
- Collaborative cursors (theme-colored)
- Chat messages (theme-colored username)
- Flow node ownership (theme-colored border)

### Color Clash Scenarios

**Scenario**: Two users both using Aqua theme.

**What Happens**: Avatars have same color.

**Resolution**:
- **Initials distinguish users**: "AM" vs. "JD"
- **Tooltip shows full name**: Hover to see who's who
- **Accept collision**: No automatic theme switching

**Best Practice**: Encourage diverse themes in teams
- Owner: "Let's use different themes so we can tell each other apart!"
- Team picks themes during onboarding

### Tone (Messaging Style)

Each theme has a distinct messaging tone (see [ADAPTIVE_THEME_SPEC.md](../ADAPTIVE_THEME_SPEC.md)):

- **ASCII**: "executed." (terse, direct)
- **XP**: "done!" (friendly, energetic)
- **Aqua**: "all clear." (calm, precise)
- **DAW**: "track armed." (studio slang)
- **Analogue**: "recorded." (human, warm)

**UX Guidance**:
- **Respect user's tone preference**: Don't override system messages
- **Match tone in notifications**: Use theme's formatMessage() for toasts
- **Collaborative messages**: Keep neutral ("Agent spawned" not "agent executed")

---

## Visual Feedback Patterns

### Join Animation

```typescript
// PresenceAvatars - 120ms easeOutSoft
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{
    duration: 0.12,
    ease: [0.25, 0.1, 0.25, 1], // easeOutSoft
    delay: index * 0.02, // 20ms stagger prevents jitter
  }}
>
```

**Why 120ms**: Feels instant but not jarring, respects Calm Mode (1ms when active).

### Action Glow (Recent Activity)

```typescript
// When user performs action, trigger 1.5s glow
<motion.button
  animate={{
    boxShadow: isGlowing
      ? [
          `0 0 8px ${borderColor}40`,          // Start
          `0 0 20px ${borderColor}FF`,         // Peak
          `0 0 40px ${borderColor}80`,         // Glow
          `0 0 8px ${borderColor}40`,          // End
        ]
      : `0 0 8px ${borderColor}40`,
  }}
  transition={{
    duration: 0.8,
    repeat: isGlowing ? 1 : 0, // Pulse once
  }}
/>
```

**When to Trigger**:
- User spawns agent
- User changes theme
- User executes command palette action

**Duration**: 1.5 seconds (0.8s pulse × 2 repeats)

### Collaborator Border (ActivityStream)

```typescript
// Own actions: 20% opacity glow
boxShadow: `0 0 12px ${borderColor}33`

// Other users: 3px solid border-left
borderLeft: `3px solid ${borderColor}`
```

**Why Border-Left**: Familiar pattern (VS Code, GitHub PR diffs)

---

## Best Practices

### For Campaign Owners

1. **Invite with context**: "I'm inviting you as Editor to help with Radio 1 contacts"
2. **Set theme etiquette**: "Let's use different themes to tell us apart"
3. **Communicate heavy edits**: "Working on flow studio for next 30 min, don't touch nodes"
4. **Respect Calm Mode**: If someone enables it, don't ask them to disable

### For Collaborators

1. **Check presence before big changes**: See who's online via PresenceAvatars
2. **Use unique agent names**: Append your name or timestamp
3. **Enable Calm Mode if needed**: System enforces globally, no shame
4. **Coordinate deletions**: Check Slack/Discord before deleting agents others are using

### For All Users

1. **Trust the visual system**: Colored borders tell you who did what
2. **Hover for details**: Tooltips explain everything
3. **Don't fight the system**: If Calm Mode is on, accept reduced motion
4. **Report conflicts**: File issues for unexpected behavior

---

## Conflict Resolution

### User-Level Conflicts

**Issue**: "Alice is editing the node I need"

**Resolution**:
1. Check PresenceAvatars - is Alice still online?
2. Message Alice via Slack/Discord: "Can I edit Release node?"
3. If no response after 5 min, assume offline (edit anyway)

**Future Enhancement**: In-Console chat
- Quick "@alice can I edit this?" messages
- No need for external Slack

### System-Level Conflicts

**Issue**: "My action glow is stuck on"

**Resolution**:
1. Refresh page (clears local state)
2. Check browser console for errors
3. File bug report with reproduction steps

**Issue**: "Other user's avatar won't disappear"

**Resolution**:
1. Wait 30 seconds (presence timeout)
2. If still visible, they're still connected (check with them)
3. If confirmed offline, refresh page

### Data-Level Conflicts

**Issue**: "I deleted an agent but it's still showing for other users"

**Resolution**:
1. Check real-time subscription is active
2. Have other users refresh page
3. File bug report - likely subscription issue

---

## Performance Guidelines

### Target Latency

| Metric | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| Presence sync | < 250ms | < 500ms | > 1000ms |
| Theme sync | < 150ms | < 300ms | > 500ms |
| Avatar animation | < 120ms | < 200ms | > 300ms |
| Action glow | < 100ms | < 200ms | > 400ms |
| ActivityStream event | < 200ms | < 400ms | > 1000ms |

### Collaboration Limits

**Recommended**:
- **Collaborators**: 3-5 active users
- **Max visible avatars**: 5 (rest under "+N more")
- **ActivityStream events**: 200 max (older pruned)
- **Presence updates**: 1 per second (debounced)

**Soft Limits** (performance degrades):
- **10 collaborators**: FPS may drop to 50
- **15 collaborators**: Presence sync may lag to 500ms
- **20+ collaborators**: Not recommended (use multiple campaigns)

### Optimization Tips

1. **Batch presence updates**: Don't broadcast every mouse move
2. **Debounce theme changes**: Wait 500ms before broadcasting
3. **Prune old events**: Keep last 200 ActivityStream events only
4. **Lazy load avatars**: Render "+N more" instead of all 20
5. **Monitor FPS**: Alert if < 55 FPS with multiple users

---

## Accessibility

### WCAG 2.2 Level AA Compliance

**Keyboard Navigation**:
- ✅ All avatars focusable with Tab
- ✅ Tooltips show on focus (not just hover)
- ✅ Escape closes expanded avatar list

**Screen Reader Support**:
- ✅ ARIA labels: "Alice - DAW theme - Track mode"
- ✅ Status announcements: "New collaborator: Bob"
- ✅ Activity descriptions: "Alice triggered workflow"

**Visual Accessibility**:
- ✅ Color contrast: 7:1 for text (WCAG AAA)
- ✅ Non-color indicators: Initials + color borders
- ✅ Focus indicators: 2px cyan ring

**Motion Reduction**:
- ✅ Global Calm Mode (any user enables → all get it)
- ✅ Respects `prefers-reduced-motion`
- ✅ Animations disabled without breaking functionality

---

## Future Enhancements

### Phase 2: Enhanced Communication

**In-Console Chat**:
- Quick @mentions for collaborators
- Theme-colored usernames
- Ephemeral (no history, real-time only)

**Activity Notifications**:
- Optional toast for join/leave
- Configurable per-user: "Notify me when Owner joins"
- Sound effects (muted by default)

### Phase 3: Advanced Conflict Detection

**Optimistic Locking**:
- Version numbers on all editable entities
- Conflict detection on save
- Merge UI: "Alice edited this. Keep yours or theirs?"

**Collaborative Cursors**:
- Show mouse positions on Flow Canvas
- Theme-colored cursors
- Fade after 2s of inactivity

### Phase 4: Team Workflows

**Role-Based Workflows**:
- Owner approves changes before they're visible
- Editor proposes, Owner merges
- Viewer can comment but not edit

**Audit Log**:
- "Who changed what, when" history
- Filterable by user, action type
- Exportable for compliance

---

## Conclusion

The Console is designed for **collaborative awareness, not collaborative editing**. Users work together by seeing each other's presence and actions, coordinating asynchronously, and respecting shared accessibility needs.

**Key Principles**:
1. **Presence over co-editing**: See who's there, what they're doing
2. **Visual identity**: Theme colors create personal brand
3. **Accessibility first**: Calm Mode is global, no exceptions
4. **Conflict avoidance**: Coordinate via external tools (Slack) until in-Console chat exists
5. **Performance matters**: 3-5 users is sweet spot, 10+ requires optimization

**Remember**: If in doubt, communicate! A quick Slack message prevents most conflicts.

---

**Last Updated**: 2025-10-24
**Status**: Stage 8.5 Complete
**Next**: Implement Phase 2 enhancements based on user feedback
