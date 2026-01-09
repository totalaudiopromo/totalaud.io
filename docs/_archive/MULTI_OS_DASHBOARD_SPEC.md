# Multi-OS Flow Dashboard System

**Project**: totalaud.io flow studio
**Concept**: "Every OS personality has its own visual rhythm, tone, and sense of focus"
**Goal**: Transform totalaud.io from SaaS to an instrument of identity
**Location**: Brighton, UK
**Last Updated**: 19 October 2025

---

## 🎯 Core Concept

Each "OS" theme should feel like a **distinct creative environment** — same data, different vibe.

Think: Ableton's skins meets Spotify Wrapped storytelling — aesthetic, tone, and motion tuned to how the user likes to think.

**Key Principle**: You're not just switching colours — you're switching how the app **behaves**.

---

## 🧩 OS Personality Matrix

| OS | Creative Archetype | Visual Motif | Interaction Tone | Dashboard Experience |
|----|-------------------|--------------|------------------|---------------------|
| **ascii** | Minimalist producer | Monochrome, no shadows, tight grid | Mechanical precision, no frills | Stripped-down command-line flow; data streams update like code logs |
| **xp** | Nostalgic optimist | Soft gradients, drop shadows, baby blue | Reassuring, friendly | Skeuomorphic dashboard panels; gentle pop sounds; "assistant" vibe |
| **aqua** | Perfectionist designer | Glassy surfaces, blur, light reflections | Meditative, fluid | Flowing transitions between nodes; dashboard uses ripples, soft easing |
| **ableton** | Experimental creator | Flat monochrome, minimal accent colours | Rhythmic, loop-based | Timeline pulses to BPM; dashboard animates with tempo feedback |
| **punk** | Anti-system hustler | Black-white-red, distorted overlays | Direct, raw, glitchy | Dashboard is chaotic collage; data animates like zine cutouts |

---

## 🎨 Thematic Behaviours

| Behaviour | ascii | xp | aqua | ableton | punk |
|-----------|-------|-----|------|---------|------|
| **Motion** | No easing, snappy | Gentle bounce | Smooth fade | Tempo-sync pulse | Jump cuts, stutters |
| **Sound** | Bleeps, key clicks | Soft "boop"s | Airy chimes | Percussive hits | Static bursts |
| **Lighting** | Pure contrast | Warm glow | Translucence | Strobe rhythm | Harsh shadows |
| **Copy Tone** | Lowercase, blunt | Friendly, rounded | Minimal | Concise, rhythmic | Anarchic, typewriter |
| **Feedback** | Instant text | Dialogue box | Wave motion | Visual tempo | Glitch flash |

---

## 🧠 Flow State Alignment

Each OS has a different entry to flow:

| OS | Flow Trigger |
|----|--------------|
| **ascii** | Mastery through precision |
| **xp** | Comfort and familiarity |
| **aqua** | Calm focus and continuity |
| **ableton** | Rhythm and iteration |
| **punk** | Rebellion and motion |

**Psychology**: You're letting users pick how they work best. That's the psychology of flow — personal, not universal.

---

## 🗣️ Personality-Aware Narration

Every report, onboarding message, and dashboard caption adapts to the OS voice:

### ascii
```
mission complete.
contacts: 42
open rate: 67%
no errors detected.
```

### xp
```
nice one! your campaign's wrapped up and the numbers look solid.
everything completed smoothly — ready for the next one.
```

### aqua
```
your agents completed the mixdown.
the data settles like water — everything in balance.
```

### ableton
```
all channels bounced clean.
campaign tempo locked at 120 BPM — ready for next mix.
```

### punk
```
done.
noise made.
42 contacts didn't know what hit 'em.
```

---

## 🧱 Architecture

```
apps/aud-web/src/components/themes/
  ├── core/
  │   ├── BaseFlowCanvas.tsx       # Core flow logic
  │   ├── BaseDashboard.tsx        # Core dashboard logic
  │   └── ThemeResolver.tsx        # Dynamic theme loader
  ├── ascii/
  │   ├── FlowCanvasAscii.tsx
  │   └── DashboardAscii.tsx
  ├── xp/
  │   ├── FlowCanvasXp.tsx
  │   └── DashboardXp.tsx
  ├── aqua/
  │   ├── FlowCanvasAqua.tsx
  │   └── DashboardAqua.tsx
  ├── ableton/
  │   ├── FlowCanvasAbleton.tsx
  │   └── DashboardAbleton.tsx
  └── punk/
      ├── FlowCanvasPunk.tsx
      └── DashboardPunk.tsx
```

---

## 🎨 ASCII Theme

### Visual Language
- **Colours**: Pure black `#000000`, pure white `#ffffff`, terminal green `#00ff00`
- **Typography**: JetBrains Mono exclusively, all caps for headers
- **Grid**: Visible ASCII characters (+ | -) instead of dots
- **Shadows**: None
- **Motion**: Instant state changes, no transitions

### Motion Grammar
```css
.ascii-transition {
  transition: none;
}

.ascii-node {
  border: 2px solid #00ff00;
  box-shadow: none;
}
```

### Copy Tone
```
> SYSTEM READY
> AGENTS: 4 ACTIVE
> PROGRESS: 75%
> STATUS: RUNNING
```

---

## 🎨 XP Theme

### Visual Language
- **Colours**: Baby blue `#0078d4`, soft white `#f0f0f0`, warm grey `#e8e8e8`
- **Typography**: Inter, friendly and round
- **Shadows**: Soft drop shadows (0 2px 8px rgba(0,0,0,0.1))
- **Gradients**: Subtle linear gradients on panels
- **Motion**: Gentle spring animations

### Motion Grammar
```css
.xp-transition {
  transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.xp-panel {
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
}
```

### Copy Tone
```
✓ Great work! Your campaign is running smoothly.
📊 4 agents are working together on this.
💚 Everything looks good — sit back and relax.
```

---

## 🎨 Aqua Theme

### Visual Language
- **Colours**: Soft blue `#5ac8fa`, translucent white `rgba(255,255,255,0.1)`, deep ocean `#001529`
- **Typography**: Inter, light weight (300-400)
- **Blur**: backdrop-filter: blur(20px) on all panels
- **Reflections**: Subtle shimmer effects
- **Motion**: Smooth ease-in-out, 400ms duration

### Motion Grammar
```css
.aqua-transition {
  transition: all 400ms ease-in-out;
}

.aqua-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Copy Tone
```
your agents are flowing.
data ripples through the system.
everything moves in balance.
```

---

## 🎨 Ableton Theme

### Visual Language
- **Colours**: Pure black `#000000`, white `#ffffff`, single accent (green `#00ff00` or amber `#ffaa00`)
- **Typography**: JetBrains Mono, consistent weights
- **Grid**: 8×8 clip grid visible
- **Tempo**: All animations sync to 120 BPM (500ms = 1 beat)
- **Motion**: Rhythmic pulse

### Motion Grammar
```css
.ableton-pulse {
  animation: pulse 500ms steps(1) infinite;
}

@keyframes pulse {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.6; }
}

.ableton-grid {
  background-size: 8px 8px;
  background-image:
    linear-gradient(to right, #333 1px, transparent 1px),
    linear-gradient(to bottom, #333 1px, transparent 1px);
}
```

### Copy Tone
```
4/4 time. agents locked.
bpm: 120. campaign in loop.
all channels active. mixdown ready.
```

---

## 🎨 Punk Theme

### Visual Language
- **Colours**: Black `#000000`, white `#ffffff`, hot pink `#ff00ff`, blood-red `#ff0000`
- **Typography**: JetBrains Mono, bold weights, glitchy effects
- **Collage**: Overlapping elements, intentional visual chaos
- **Noise**: Film grain overlay
- **Motion**: Jitter, jump cuts, no smooth transitions

### Motion Grammar
```css
.punk-jitter {
  animation: jitter 0.1s steps(4) infinite;
}

@keyframes jitter {
  0% { transform: translate(0, 0); }
  25% { transform: translate(-2px, 2px); }
  50% { transform: translate(2px, -2px); }
  75% { transform: translate(-2px, -2px); }
  100% { transform: translate(0, 0); }
}

.punk-noise::before {
  content: '';
  background: url('data:image/svg+xml,...'); /* Film grain */
  opacity: 0.15;
}
```

### Copy Tone
```
AGENTS RUNNING
DATA STREAM LIVE
NO ERRORS (YET)
CHAOS CONTROLLED
```

---

## ⚙️ Technical Implementation

### 1. Base Components

All themes inherit from base components that handle:
- Supabase realtime connections
- Agent execution logic
- State management
- Session handling

```typescript
// BaseFlowCanvas.tsx
export interface FlowCanvasBaseProps {
  sessionId: string
  initialTemplate?: FlowTemplate
  onExecuteNode: (nodeId: string, agent: string) => void
  // ... shared props
}

export function BaseFlowCanvas(props: FlowCanvasBaseProps) {
  // All functional logic here
  // No UI rendering
  return null
}
```

### 2. Theme-Specific Components

Each theme extends the base and adds its own UI:

```typescript
// FlowCanvasAscii.tsx
export function FlowCanvasAscii(props: FlowCanvasBaseProps) {
  const baseLogic = useBaseFlowLogic(props)

  return (
    <div className="ascii-theme">
      {/* ASCII-specific rendering */}
      <AsciiGrid>
        {baseLogic.nodes.map(node => (
          <AsciiNode key={node.id} {...node} />
        ))}
      </AsciiGrid>
    </div>
  )
}
```

### 3. Theme Resolver

Dynamically loads the correct theme based on user preference:

```typescript
// ThemeResolver.tsx
import { useUserPrefs } from '@/hooks/useUserPrefs'
import * as AsciiTheme from './ascii'
import * as XpTheme from './xp'
import * as AquaTheme from './aqua'
import * as AbletonTheme from './ableton'
import * as PunkTheme from './punk'

const themes = {
  ascii: AsciiTheme,
  xp: XpTheme,
  aqua: AquaTheme,
  ableton: AbletonTheme,
  punk: PunkTheme,
}

export function ThemedFlowCanvas(props: FlowCanvasBaseProps) {
  const { prefs } = useUserPrefs()
  const theme = prefs?.preferred_theme || 'ascii'
  const ThemeCanvas = themes[theme].FlowCanvas

  return <ThemeCanvas {...props} />
}
```

---

## 🎧 Sound Palette by Theme

| Theme | Start | Complete | Error | Hover |
|-------|-------|----------|-------|-------|
| **ascii** | 200Hz sine, 50ms | 440Hz square, 100ms | 100Hz saw, 200ms | Click (5ms) |
| **xp** | Soft boop (C major) | Rising chime | Gentle descend | Subtle pop |
| **aqua** | Water drop (reverb) | Harmonic wash | Dissonant pad | Ripple effect |
| **ableton** | Kick drum | Snare hit | Hi-hat | Tick (metronome) |
| **punk** | Static burst | Distorted stab | Noise spike | Glitch crackle |

---

## 📊 Motion Timing Reference

| Theme | Transition | Easing | Duration |
|-------|-----------|--------|----------|
| **ascii** | None | `steps(1)` | 0ms |
| **xp** | Spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 300ms |
| **aqua** | Smooth | `ease-in-out` | 400ms |
| **ableton** | Pulse | `steps(4)` | 500ms (120 BPM) |
| **punk** | Jitter | `steps(4)` | 100ms |

---

## 🧪 Testing Matrix

| Feature | ascii | xp | aqua | ableton | punk |
|---------|-------|-----|------|---------|------|
| Node click | ✓ Instant | ✓ Bounce | ✓ Fade | ✓ Pulse | ✓ Glitch |
| Agent complete | ✓ Text only | ✓ Dialogue | ✓ Ripple | ✓ Beat sync | ✓ Flash |
| Dashboard transition | ✓ Cut | ✓ Slide | ✓ Blur fade | ✓ Grid shift | ✓ Collage |
| Reduced motion | ✓ Already minimal | ✓ Disable spring | ✓ Disable blur | ✓ Disable pulse | ✓ Disable jitter |

---

## 📚 Related Documentation

- [FLOW_STATE_DESIGN_SPEC.md](./FLOW_STATE_DESIGN_SPEC.md) - Technical flow state spec
- [FLOW_STATE_MOODBOARD_BRIEF.md](./FLOW_STATE_MOODBOARD_BRIEF.md) - Visual moodboard
- [UX_FLOW_STUDIO_GUIDE.md](./UX_FLOW_STUDIO_GUIDE.md) - UX patterns

---

## 🎯 Implementation Roadmap

### Phase 1: Foundation
- [x] Create specification document
- [ ] Create base components (BaseFlowCanvas, BaseDashboard)
- [ ] Create ThemeResolver component

### Phase 2: ASCII Theme (Proof of Concept)
- [ ] Build FlowCanvasAscii
- [ ] Build DashboardAscii
- [ ] Test theme switching

### Phase 3: Remaining Themes
- [ ] XP theme
- [ ] Aqua theme
- [ ] Ableton theme
- [ ] Punk theme

### Phase 4: Polish
- [ ] Theme-specific sound palettes
- [ ] Motion refinement
- [ ] Copy tone consistency
- [ ] User testing

---

**Last Updated**: 19 October 2025
**Status**: Specification Complete, Implementation Pending
**Location**: Brighton, UK
**Contributors**: Claude Code, Total Audio Team

---

**Bottom Line**: This transforms totalaud.io from "a tool for music promotion" into "the way I work" — deeply personal, aesthetically coherent, and emotionally resonant.
