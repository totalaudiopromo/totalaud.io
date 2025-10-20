# Flow Studio UX Enhancement Guide

**TotalAud.io - Intelligent DAW for Music Promotion**

---

## 🎯 Design Philosophy

> "I'm inside an intelligent DAW for my promo campaign."
> "I know what's happening and what to do next."

The Flow Studio transforms complex multi-agent orchestration into an intuitive, immersive experience that feels like operating a creative production rig.

---

## 🧩 Core Components

### 1. Onboarding Overlay (`OnboardingOverlay.tsx`)

**Purpose**: First-time user orientation with theme-aware Broker personality

**Features**:
- 3-step guided tour with animated highlights
- Theme-specific messaging matching OS personality
- Non-intrusive dismissal (stored in user_preferences)
- Accessibility-aware (respects reduced motion)

**Theme-Specific Copy**:

#### ASCII Mode
```
Step 1: > BROKER.EXE INITIALIZED
"systems online_ each node is an agent. agents execute skills. you direct the flow."

Step 2: > NODE EXECUTION
"press start on any node to begin. agents work in parallel. watch the status glow."

Step 3: > READY TO PROC
"drag skills from the palette. connect nodes with edges. build your campaign flow."
```

#### XP Mode
```
Step 1: 👋 Welcome to Flow Studio!
"It looks like you're planning a campaign! Each box below is an agent—they help automate your promo work."

Step 2: Starting Your Campaign
"Click Start on any agent to begin. They'll work together automatically!"

Step 3: Adding Skills
"Drag skills from the right panel to add more steps. Connect them to build your workflow!"
```

#### Aqua Mode
```
Step 1: ✨ Welcome to Your Creative Rig
"Think of this as your promo DAW. Each module is an intelligent agent ready to work for you."

Step 2: Simply Press Start
"Tap any agent to begin. They'll coordinate seamlessly, handling research, outreach, and tracking."

Step 3: Build Intuitively
"Drag skills from the palette. Connect modules. Create your perfect campaign flow."
```

#### Ableton Mode
```
Step 1: 🎚 Broker Synced
"You're looking at your campaign rack. Each module is an agent. Let's build your set."

Step 2: Hit Play
"Press Start to trigger the sequence. Agents run in parallel, mixing your campaign data."

Step 3: Add to the Chain
"Drag effects (skills) from the browser. Patch them in. Create your signal flow."
```

#### Punk Mode
```
Step 1: ⚡ OI! BROKER HERE
"This is your promo rig. Each box is an agent that does the boring work. You're the director."

Step 2: SMASH THAT START
"Hit Start and let the agents rip. They'll handle the grind while you make noise."

Step 3: BUILD YOUR CHAOS
"Throw skills on the canvas. Wire 'em up. Make your campaign scream."
```

---

### 2. Mission Panel (`MissionPanel.tsx`)

**Purpose**: Real-time campaign status sidebar with contextual guidance

**Layout** (Always visible on desktop, slide-up drawer on mobile):

```
┌────────────────────────┐
│ MISSION CONTROL        │
│ 14:32:15              │
├────────────────────────┤
│ 🎯 Current Campaign    │
│    Radio Airplay       │
├────────────────────────┤
│ ⚙️  Active Agents      │
│  ● 🧭 Scout            │
│     researching 25     │
│  ● 🎯 Coach            │
│     drafting follow-ups│
│  ● 📊 Tracker          │
│     syncing metrics    │
├────────────────────────┤
│ 📈 Progress            │
│  2 / 4 agents          │
│  ████████░░ 50%        │
├────────────────────────┤
│ 💡 Next Action         │
│  Agents are working... │
│  watch the flow        │
├────────────────────────┤
│ [Toggle Dashboard View]│
└────────────────────────┘
```

**Dynamic Next Actions**:
- Running: "Agents are working... watch the flow"
- Complete: "Campaign complete! Generate Mixdown →"
- Error: "Some agents encountered errors. Check logs"
- Idle: "Click Start on an agent to begin"

---

### 3. Mission Dashboard (`MissionDashboard.tsx`)

**Purpose**: Simplified narrative view for non-technical users

**Layout**:
```
┌──────────────────────────────────────┐
│ 🎧 Radio Airplay Campaign – Live     │
├──────────────────────────────────────┤
│ 🧭 Scout     25 contacts found       │
│ 🎯 Coach     3 follow-ups sent       │
│ 📊 Tracker   67% open rate          │
│ 💡 Insight   Mixdown ready          │
└──────────────────────────────────────┘
[Run Again] [Generate Mixdown] [View Report]
```

**Features**:
- Simple, glanceable metrics
- Agent-colored icons with status
- Action buttons for next steps
- Subtle background animation
- Maintains dark grid aesthetic

---

## 🔧 Technical Implementation

### Database Schema

**`user_preferences` table**:
- `show_onboarding_overlay` (boolean) - Show tutorial on next visit
- `onboarding_completed_at` (timestamptz) - When user finished onboarding
- `preferred_view` (text) - 'flow' or 'dashboard'
- `demo_mode` (boolean) - Enable sample data
- `auto_sync_enabled` (boolean) - Auto-sync integrations
- `reduced_motion` (boolean) - Disable animations
- `mute_sounds` (boolean) - Disable audio cues
- `preferred_theme` (text) - OS theme preference

### State Management

**`useUserPrefs()` Hook**:
```typescript
const { prefs, updatePrefs, dismissOnboarding, toggleView } = useUserPrefs()

// Check if should show onboarding
if (prefs?.show_onboarding_overlay) {
  return <OnboardingOverlay theme={theme} onDismiss={dismissOnboarding} />
}
```

### View Toggle Integration

```tsx
// In FlowCanvas header
<ToggleGroup value={view} onValueChange={setView}>
  <Toggle value="flow">⚙️ Flow</Toggle>
  <Toggle value="dashboard">📊 Dashboard</Toggle>
</ToggleGroup>

{view === 'flow' ? <ReactFlowCanvas /> : <MissionDashboard />}
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ + ↵` / `Ctrl + Enter` | Send/Execute current action |
| `Space` | Start selected node |
| `Esc` | Cancel/Close overlay |
| `⌘ + D` / `Ctrl + D` | Toggle Dashboard view |
| `⌘ + K` / `Ctrl + K` | Open command palette |

---

## 🎨 Design System

### Typography
- **Monospace**: IBM Plex Mono, JetBrains Mono, or system monospace
- **Sans-serif**: Inter, system-ui for body text

### Colors (Theme-Specific)
- **ASCII**: #00ff00 (Matrix green) on #000000
- **XP**: #0078d4 (Windows blue) on #001e3c
- **Aqua**: #5ac8fa (macOS teal) on #001529
- **Ableton**: #ff764d (Ableton orange) on #1a1a1a
- **Punk**: #ff00ff (Hot magenta) on #000000

### Animations
- **Pulse**: 2s ease-in-out infinite (status indicators)
- **Glow**: Soft neon accent on active elements
- **Slide**: 300ms spring (panel transitions)
- **Scale**: Subtle hover effects (1.05x max)

**Accessibility**:
- All animations disabled when `reducedMotion` is true
- Sufficient color contrast (WCAG AA minimum)
- Keyboard navigation fully supported

---

## 🧪 Testing Checklist

### Onboarding Flow
- [ ] Overlay appears on first visit
- [ ] Theme-specific copy displays correctly
- [ ] Animated highlights appear on correct elements
- [ ] "Got it → Begin" dismisses overlay permanently
- [ ] "Skip Tutorial" dismisses immediately
- [ ] Reduced motion mode disables animations

### Mission Panel
- [ ] Shows current campaign name
- [ ] Lists all active agents with status dots
- [ ] Progress bar updates in real-time
- [ ] Next action updates contextually
- [ ] View toggle switches between flow/dashboard
- [ ] Panel collapses/expands smoothly
- [ ] Mobile drawer slides up correctly

### View Persistence
- [ ] Preferred view persists across sessions
- [ ] User preferences sync via Supabase
- [ ] Real-time updates across tabs

### Accessibility
- [ ] Keyboard navigation works end-to-end
- [ ] Screen reader announces status changes
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA

---

## 📱 Responsive Behavior

### Desktop (> 1024px)
- Mission Panel always visible on right
- Onboarding overlay centered
- Full keyboard shortcuts enabled

### Tablet (768px - 1024px)
- Mission Panel collapsible by default
- Touch-friendly hit targets (48px min)

### Mobile (< 768px)
- Mission Panel as slide-up drawer
- Onboarding steps optimized for portrait
- Swipe gestures for panel

---

## 🚀 Future Enhancements

### Phase 2
- Command palette (⌘K) for quick actions
- Agent-specific notification toasts
- Campaign templates library
- Undo/redo for flow edits

### Phase 3
- Voice control ("Hey Broker, start the flow")
- Collaborative real-time editing
- Advanced analytics dashboard
- Export flow as reusable template

---

## 📊 Success Metrics

**Onboarding**:
- 80%+ users complete tutorial
- < 5% skip immediately
- Average completion time: 60-90 seconds

**Engagement**:
- 70%+ users prefer dashboard view for status checks
- 50%+ users use keyboard shortcuts regularly
- Real-time status updates reduce support queries by 40%

**Accessibility**:
- 100% keyboard navigable
- 0 critical WCAG violations
- Positive feedback from users with disabilities

---

## 🎨 Brand & Tone Commit - 2025-10-19

**All UI text uses UK English spelling and lowercase headings.**
**Emojis removed.**
**Motion and tone adjusted to match totalaud.io micro-brand guide.**
**React duplicate-key warnings resolved.**
**Database schema updated to support Flow Studio sessions.**

### Key Refinements Applied

1. **Typography**
   - All headings in lowercase (except ASCII art)
   - Removed title case and capitals
   - Consistent monospace for technical elements

2. **Content Polish**
   - Short, confident sentences (no filler)
   - Prefer "continue" or "proceed" over "next"
   - Replace "click" with "select" or "press"
   - Remove all emojis from UI components

3. **British Creative-Tech Voice**
   - UK English spelling: colour, organise, synchronise, realise
   - Measured tone: no exclamation marks, no cheer
   - Active voice: "press start" not "you can press start"
   - Present tense: "agents running" not "agents are running"

4. **Visual Refinement**
   - Font pairing: Inter + IBM Plex Mono verified in context
   - Colour temperature: slight desaturation for timeless feel
   - Motion speed: slowed by 10-20ms for "studio gear" feel
   - Accessibility: reduced-motion support tested

### Reference Documentation

- [TOTALAUDIO_MICROCOPY_TONE_SHEET.md](./TOTALAUDIO_MICROCOPY_TONE_SHEET.md) - Complete microcopy guide (10-15 lines per screen)
- [CRITICAL_FIXES_START_BUTTON.md](./CRITICAL_FIXES_START_BUTTON.md) - Technical fixes applied

### Future Contributors

Use the tone sheet above for ALL new microcopy, error messages, and UI labels.
This prevents re-litigating design choices and maintains voice consistency.

---

Last Updated: 2025-10-19
Version: 1.1.0
Contributors: Claude Code, Total Audio Team
Location: Brighton, UK
