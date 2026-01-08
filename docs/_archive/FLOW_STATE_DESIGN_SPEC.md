# Flow State Design Specification

**totalaud.io flow studio**
**Location**: Brighton, UK
**Last Updated**: 19 October 2026
**Version**: 1.0.0

---

## ✳️ Purpose

To make totalaud.io flow studio feel like an instrument, not a dashboard — enabling deep focus, creative rhythm, and immediate feedback.

---

## 🎯 Design Goals

| Goal | Description |
|------|-------------|
| **Flow psychology** | Encourage deep focus through clarity, rhythm, and autonomy |
| **Tactile immersion** | Every action should have a sound, motion, or visual response within 150ms |
| **Progressive disclosure** | Show only what matters for the current action; hide the rest |
| **Temporal continuity** | No resets — the system remembers where you left off and resumes gracefully |

---

## 🧩 Behavioural Layers

### 1️⃣ Focus Mode

**Shortcut**: `⌘ F` or `Ctrl F`

**Behaviour**:
- Dims sidebars and header (opacity 0.2)
- Locks mouse panning, enables keyboard-only navigation
- Reduces ambient motion by 20%
- Ambient "hum" sound fades in (low-volume sine pad)
- Exit: `Escape` or click background

**Visual State**:
```typescript
{
  headerOpacity: 0.2,
  sidebarOpacity: 0.2,
  canvasLocked: false,
  ambientVolume: 0.15,
  motionScale: 0.8
}
```

### 2️⃣ Command Palette

**Shortcut**: `⌘ K`

**Searchable Commands**:
- `run campaign`
- `generate mixdown`
- `connect integrations`
- `open coach composer`
- `switch theme`
- `toggle focus mode`
- `mute sounds`

**Design**:
- Appears centred with blurred backdrop (Glass / Vignette)
- Keyboard-first; every command can be triggered in < 500ms
- Fuzzy search with instant results
- Recent commands shown first

### 3️⃣ Real-Time Feedback

**Node Activation Triggers**:
- Border pulse + agent sound cue (60ms attack, 300ms decay)
- Status text typed-out effect (35ms/char)
- Subtle scale animation (1.0 → 1.03)

**Completion**:
- Brief glow (200ms)
- Resolution tone (major third chord, 440Hz root)
- Status update with smooth transition

### 4️⃣ Ambient Motion System

| Element | Animation | Timing |
|---------|-----------|--------|
| Canvas grid | Slow parallax (±2px, 10s loop) | ease-in-out |
| Node active | Subtle scale 1 → 1.03 | 150ms |
| Sidebar panels | Slide-in/out (x ± 16px) | 200ms |
| Progress bars | Smooth continuous fill | 60 fps |

---

## 🎨 Visual System

### Colour Palette

| Layer | Style | Notes |
|-------|-------|-------|
| **Background** | Deep navy `#0a0d10` | Matte, non-reflective |
| **Grid** | 1px dotted, opacity 0.08 | Moving subtly |
| **Nodes** | Flat, soft inner glow | Minimal shadow |
| **Accent** | Per-agent colour | green / amber / indigo / purple |
| **Typography** | Inter (400–600) + JetBrains Mono (500) | All lowercase |
| **Texture** | DRS grit overlay < 4% opacity | Optional aesthetic cohesion |

### Agent Colours

| Agent | Colour | Hex | Desaturated |
|-------|--------|-----|-------------|
| **scout** | Green | `#10b981` | `#0ea271` |
| **coach** | Indigo | `#6366f1` | `#5a5de1` |
| **tracker** | Amber | `#f59e0b` | `#e58f0a` |
| **insight** | Purple | `#8b5cf6` | `#7c52e6` |

### Typography Rhythm

```css
/* Headings */
h1 { font: 600 48px/1.2 'JetBrains Mono', monospace; text-transform: lowercase; }
h2 { font: 600 32px/1.3 'JetBrains Mono', monospace; text-transform: lowercase; }
h3 { font: 600 24px/1.4 'JetBrains Mono', monospace; }
h4 { font: 600 18px/1.4 'JetBrains Mono', monospace; text-transform: lowercase; }

/* Body */
p { font: 400 16px/1.6 'Inter', sans-serif; }
.mono { font: 500 14px/1.5 'JetBrains Mono', monospace; }
```

---

## 🎧 Audio System

Built on existing `useUISound` + Theme Engine.

### Global Mix

| Layer | Type | Level | Notes |
|-------|------|-------|-------|
| **Ambient pad** | C minor sine wave | -24 dB | Constant background hum |
| **Agent sounds** | Per-agent tone | -18 dB | Triggered on status change |
| **UI feedback** | Click/hover tones | -20 dB | Brief, crisp |
| **Completion** | Major third chord | -16 dB | Reward tone |

### Audio Settings

- Volume saved in `user_preferences.audio_volume`
- Respect `reduced_motion` / `mute_sounds` accessibility flags
- Fade in/out: 2s ease-in-out curve
- Audio latency target: < 150ms

---

## 🧠 Cognitive Flow Cycle

```
1. Cue → User initiates action (Enter / Click)
2. Focus → UI narrows, sidebars dim
3. Feedback → Motion + sound within 150ms
4. Reward → Glow + tone at completion
5. Continuation → Next action automatically highlighted
```

**Example Flow**:
```
User presses "Start" on scout node
  ↓
Border pulses green (60ms)
  ↓
Sound cue plays (scout discovery tone, 300ms)
  ↓
Status text types out: "discovering contacts..."
  ↓
Progress bar fills smoothly
  ↓
Completion glow + resolution tone
  ↓
Next node (coach) highlighted automatically
```

---

## 🧩 Technical Implementation

### Core Hooks

#### `useFlowMode`
```typescript
interface FlowModeState {
  isActive: boolean
  ambientVolume: number
  sidebarOpacity: number
  headerOpacity: number
  toggleFocus: () => void
  exitFocus: () => void
}
```

#### `useCommandPalette`
```typescript
interface CommandPaletteState {
  isOpen: boolean
  commands: Command[]
  selectedIndex: number
  open: () => void
  close: () => void
  execute: (command: Command) => void
}
```

#### Extended `useUISound`
```typescript
interface UISound {
  play: (soundId: string) => void
  playAmbient: (soundId: string, volume: number) => void
  fadeAmbient: (targetVolume: number, duration: number) => void
  stopAmbient: () => void
  mute: () => void
  unmute: () => void
}
```

### Components

#### `CommandPalette.tsx`
- Centred modal with backdrop blur
- Fuzzy search with instant results
- Keyboard navigation (↑↓ to select, Enter to execute)
- Recent commands shown first
- Escape to close

#### `AmbientSoundLayer.tsx`
- Manages ambient audio loop
- Fades in/out based on focus mode
- Respects `mute_sounds` preference
- Uses Web Audio API for precise timing

#### Updated `FlowCanvas.tsx`
- Reacts to focus mode state (dim sidebars)
- Adds ambient motion (subtle parallax grid)
- Node activation animations
- Keyboard shortcuts

#### Updated `MissionPanel.tsx`
- Fades when focus mode active
- Shows "Generate Mixdown" button when campaign complete
- Auto-highlights next action

---

## 🧱 Accessibility Principles

### Reduced Motion

- Respects OS preference (`prefers-reduced-motion`)
- Stored in `user_preferences.reduced_motion`
- Disables:
  - Parallax grid motion
  - Node scale animations
  - Typing effects
- Keeps:
  - Colour changes
  - Opacity transitions
  - Essential feedback

### Mute Sounds

- Toggle: `⌘ M` or `Ctrl M`
- Stored in `user_preferences.mute_sounds`
- Mutes all audio except critical alerts
- Visual feedback always present

### Keyboard Navigation

- All actions accessible via keyboard
- Visible focus indicators
- Command palette for quick access
- Tab order follows visual hierarchy

### Contrast

- Minimum ratio: 4.5:1 for all text
- Focus indicators: 3:1 against background
- Status colours meet WCAG AA

---

## 🧩 Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| **Input Latency** | < 100ms | From keypress to visual feedback |
| **Animation Frame Rate** | 60 fps | Smooth motion, no jank |
| **Audio Delay** | < 150ms | From trigger to sound |
| **Cognitive Overhead** | ≤ 1 visible choice | Progressive disclosure |
| **First Paint** | < 1.5s | Initial page load |
| **Time to Interactive** | < 2.5s | Ready for user input |

---

## 🎯 Tone and Language

**Principles**:
- All lowercase headings
- UK English spelling (colour, organise, synchronise)
- No emojis in UI
- Calm, factual, lightly poetic

**Examples**:
```
"agents are ready."
"mission running."
"mixdown complete — review your work."
"press start to begin your flow."
"focus mode active."
"campaign synchronised."
```

---

## 🧪 Testing Checklist

### Functional Tests
- [ ] Focus mode activates/deactivates correctly
- [ ] Command palette opens with ⌘K
- [ ] Keyboard shortcuts work on Mac and Windows
- [ ] Ambient sound fades smoothly
- [ ] Reduced motion disables animations
- [ ] Mute sounds stops all audio
- [ ] Session state persists across refreshes

### Visual Tests
- [ ] Animations run at 60fps
- [ ] Colours meet contrast requirements
- [ ] Typography renders correctly in all browsers
- [ ] Grid parallax is subtle (not distracting)
- [ ] Focus indicators are visible

### Audio Tests
- [ ] Audio latency < 150ms
- [ ] Volume levels consistent
- [ ] No audio clipping or distortion
- [ ] Fade in/out is smooth
- [ ] Ambient loop seamless

### Accessibility Tests
- [ ] Screen reader announces status changes
- [ ] All controls keyboard accessible
- [ ] Reduced motion preference respected
- [ ] Focus visible at all times
- [ ] ARIA labels accurate

---

## 📚 Related Documentation

- [TOTALAUDIO_MICROCOPY_TONE_SHEET.md](./TOTALAUDIO_MICROCOPY_TONE_SHEET.md) - Microcopy guidelines
- [UX_FLOW_STUDIO_GUIDE.md](./UX_FLOW_STUDIO_GUIDE.md) - UX patterns and principles
- [CRITICAL_FIXES_START_BUTTON.md](./CRITICAL_FIXES_START_BUTTON.md) - Technical implementation notes

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-10-19 | Initial specification |

---

## 🎯 Implementation Roadmap

### Phase 1: Foundation (This Session)
- [x] Create specification document
- [ ] Add database flags for accessibility
- [ ] Create core hooks (useFlowMode, useCommandPalette)
- [ ] Extend useUISound for ambient audio

### Phase 2: Components (Next Session)
- [ ] Build CommandPalette component
- [ ] Build AmbientSoundLayer component
- [ ] Update FlowCanvas for focus mode
- [ ] Update MissionPanel for flow state

### Phase 3: Polish (Future)
- [ ] Add DRS texture overlay
- [ ] Fine-tune animation timing
- [ ] Record custom audio samples
- [ ] Performance optimization

### Phase 4: User Testing
- [ ] A/B test focus mode
- [ ] Gather feedback on audio levels
- [ ] Measure flow state metrics
- [ ] Iterate based on data

---

**Last Updated**: 19 October 2026
**Status**: Specification Complete, Implementation In Progress
**Location**: Brighton, UK
**Contributors**: Claude Code, Total Audio Team
