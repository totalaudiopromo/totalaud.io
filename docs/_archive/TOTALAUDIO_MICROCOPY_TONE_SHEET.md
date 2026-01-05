# TotalAud.io Microcopy & Tone Sheet

**Location**: Brighton, UK
**Last Updated**: 19 October 2025
**Voice**: Confident, minimal, creative-professional (British)

---

## Core Principles

### Writing Style
- **Short, confident sentences** - No filler, no cheer
- **UK English spelling** - colour, organise, synchronise, realise
- **Lowercase headings** - Typography rhythm, not shouty capitals
- **No exclamation marks** - Confidence doesn't need emphasis
- **Active voice** - "press start" not "you can press start"
- **Present tense** - "agents running" not "agents are running"

### Word Choices
- **Prefer**: continue, proceed, select, press
- **Avoid**: next, click, tap, awesome, great, nice
- **Replace**: "It looks like..." with direct statements
- **Remove**: "Please", "just", "simply", "easy", "quick"

### Tone Temperature
- **Not**: Playful, American startup, excitable
- **Is**: Measured British creative-tech, studio professional
- **Like**: Ableton Live, Logic Pro, BBC Sounds
- **Not like**: Notion, Slack, Intercom

---

## Screen-by-Screen Microcopy

### Landing Page (page.tsx)

```
totalaud.io flow studio

marketing your music should be as creative as making it. visualise
and orchestrate agent workflows in real time.

4 agents active • real-time synchronisation • console mode ready

session_active ●

agent workflow orchestrator

[flow view]  [dashboard view]

[scout]     [coach]     [tracker]     [insight]
ready       ready       ready         ready

current campaign

radio airplay campaign
23:10

agents
no agents active

progress
0 of 4 agents

next action
press start on an agent to begin
```

### Onboarding Overlay (OnboardingOverlay.tsx)

```
welcome to totalaud.io flow studio

everything is set up and ready. each module below is an agent.
press start to get your campaign moving.

[continue]

your campaign agents are ready

select an agent skill from the palette on the left. click anywhere
on the canvas to place it. connect agents by dragging between nodes.

[continue]

execute your workflow

press the start button on any agent to begin execution. watch agents
work in real time. results appear as they complete.

[begin]
```

### Mission Panel (MissionPanel.tsx)

```
current campaign

radio airplay campaign

agents

scout          pending
coach          pending
tracker        pending
insight        pending

progress

0 of 4 agents

next action

press start on an agent to begin
agents running in real time
campaign complete — generate mixdown
```

### Mission Dashboard (MissionDashboard.tsx)

```
mission dashboard

campaign overview

radio airplay campaign
started: 19 oct 2025, 23:10
status: in progress

agent activity

scout          running     45s
coach          pending     —
tracker        pending     —
insight        complete    1m 23s

campaign metrics

contacts researched    127
pitches generated      0
success rate          —

recent activity

[23:11] scout discovered 45 radio contacts
[23:10] campaign started
[23:10] session created

[export results]  [generate mixdown]
```

### Flow Canvas (FlowCanvas.tsx)

```
skills palette

research contacts
score contacts
generate pitch

[flow view]  [dashboard view]

current campaign: radio airplay campaign
session_active ● 23:10
```

### Flow Node (FlowNode.tsx)

```
[node in pending state]
scout
pending

[▶ start]

[node in running state]
scout
running

discovering contacts...

[node in complete state]
scout
complete

found 127 contacts

[node in error state]
scout
error

connection timeout

[↻ retry]
```

### Console Shell (ConsoleShell.tsx)

```
totalaud.io // creative console

[content area]

session_active ● 23:10
```

---

## Button & Action Labels

### Primary Actions
- `start` - Begin agent execution
- `continue` - Move to next step
- `proceed` - Confirm and advance
- `begin` - Start workflow
- `execute` - Run agent

### Secondary Actions
- `retry` - Attempt again after error
- `cancel` - Stop current action
- `reset` - Return to initial state
- `clear` - Remove all items
- `export` - Save results

### Navigation
- `flow view` - Canvas interface
- `dashboard view` - Metrics interface
- `skills palette` - Agent selector
- `console mode` - Terminal interface

---

## Status Messages

### Success States
- `session created`
- `campaign complete`
- `agents synchronised`
- `results exported`
- `connection established`

### Progress States
- `agents running in real time`
- `discovering contacts...`
- `generating pitches...`
- `analysing results...`
- `synchronising data...`

### Error States
- `connection timeout`
- `session expired`
- `export failed`
- `authentication required`
- `rate limit exceeded`

### Neutral States
- `no agents active`
- `campaign pending`
- `waiting for input`
- `session inactive`
- `no data available`

---

## Conversational Patterns

### DO Use
```
your campaign agents are ready
press start to begin your flow
agents running in real time
session created successfully
campaign complete — generate mixdown
```

### DON'T Use
```
Great! Your campaign agents are ready! 🎉
Click the Start button to begin your awesome flow!
Your agents are working... watch the magic happen!
Yay! Session created! ✨
Campaign complete! You did it! Generate Mixdown →
```

---

## Accessibility Labels

### ARIA Labels (for screen readers)
- `aria-label="start agent execution"`
- `aria-label="retry failed agent"`
- `aria-label="toggle flow view"`
- `aria-label="session status: active"`
- `aria-label="agent status: running"`

### Status Announcements
- `role="status"` - For live region updates
- `aria-live="polite"` - For non-urgent updates
- `aria-live="assertive"` - For urgent errors

---

## Typography Rhythm

### Headings
```
totalaud.io flow studio          (h1, lowercase)
current campaign                 (h2, lowercase)
radio airplay campaign           (h3, sentence case)
agent activity                   (h4, lowercase)
```

### Body Text
```
marketing your music should be as creative as making it.
visualise and orchestrate agent workflows in real time.
```

### Status Text
```
session_active ● 23:10           (monospace, lowercase)
4 agents active                  (sans-serif, lowercase)
```

---

## Motion Language

### Transition Speeds (British "studio gear" feel)
- **Fast actions**: 180ms - Button clicks, hovers
- **Medium transitions**: 350ms - Panel slides, view switches
- **Slow reveals**: 550ms - Onboarding steps, modals
- **Real-time updates**: Instant - Agent status changes

### Motion Easing
- **Ease-in-out**: Default for most transitions
- **Ease-out**: For appearing elements
- **Linear**: For progress indicators, loading states

---

## Colour Temperature

### Desaturation for Timeless Feel
- **Agent colours**: Slightly desaturated from pure RGB
  - Scout: `#10b981` → Consider `#0ea271` (10% less saturated)
  - Coach: `#6366f1` → Consider `#5a5de1` (10% less saturated)
  - Tracker: `#f59e0b` → Consider `#e58f0a` (10% less saturated)
  - Insight: `#8b5cf6` → Consider `#7c52e6` (10% less saturated)

### Background Tones
- Keep dark mode pure: `#000000` for true black
- Panels: `#0a0a0a` for subtle depth
- Borders: `#1a1a1a` for minimal contrast

---

## Font Pairing Context

### Inter (Sans-serif)
- **Use for**: Body text, buttons, status messages
- **Weights**: 400 (regular), 600 (semibold)
- **Line height**: 1.5 for readability

### IBM Plex Mono (Monospace)
- **Use for**: Headings, session IDs, timestamps, code
- **Weights**: 400 (regular), 600 (semibold)
- **Line height**: 1.4 for tighter technical feel

---

## Brand & Tone Commit - 2025-10-19

All UI text uses UK English spelling and lowercase headings.
Emojis removed.
Motion and tone adjusted to match totalaud.io micro-brand guide.
React duplicate-key warnings resolved.
Database schema updated to support Flow Studio sessions.

---

## Future Tone Evolution

As the product matures, consider:
- Adding subtle British music industry references
- Location markers: "Built in Brighton, UK" in footer
- Studio metaphors: "mix", "master", "track", "session"
- Radio terminology: "on air", "off air", "live", "playback"

---

**Reference**: This tone sheet aligns with [UX_FLOW_STUDIO_GUIDE.md](./UX_FLOW_STUDIO_GUIDE.md)
**Implementation**: Use this for ALL new microcopy, error messages, and UI labels
**Compliance**: Check against this sheet during code review
