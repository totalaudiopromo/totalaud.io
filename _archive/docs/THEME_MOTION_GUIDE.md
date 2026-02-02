# Theme Motion Guide

**Phase 9.5: Framer Motion Cohesion Layer**
**Date**: October 2025
**Status**: Implementation Ready

---

## Philosophy

> "If the landing page is the cinematic trailer, the themes should feel like chapters in the same film."

The motion grammar, parallax, blur, and light cues from Framer Motion on the landing page carry through into the working environment — **toned to serve flow, not show**.

---

## Core Principles

1. **Same Physics, Different Amplitude**
   - All themes use identical easing curves from landing page
   - Motion varies by theme personality, not arbitrary differences
   - Operator = instant (0ms), Others = 120ms/240ms/400ms

2. **GPU-Accelerated Performance**
   - All animations use `transform` and `opacity` (GPU layers)
   - 60fps target on M1 Mac / modern mobile
   - Heavy effects disabled under Calm Mode

3. **Reduced Motion Support**
   - Respects `prefers-reduced-motion: reduce`
   - 70% amplitude reduction in Calm Mode
   - Critical animations only (no decorative motion)

4. **Cinematic Consistency**
   - Slate Cyan (`#3AA9BE`) as primary accent across all motion
   - Matching easing curves: `cubic-bezier(0.22, 1, 0.36, 1)`
   - Shared spring presets: fast/medium/soft

---

## Motion Tokens

### Durations (from `tokens/motion.ts`)

```typescript
export const motionTokens = {
  fast: {
    duration: 120, // ms - Micro feedback, key confirmations
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  normal: {
    duration: 240, // ms - Pane transitions, modal opens
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  slow: {
    duration: 400, // ms - Calm fades, ambient effects
    easing: 'ease-in-out',
  },
}
```

### Spring Presets (Framer Motion)

```typescript
export const springPresets = {
  fast: { type: 'spring', stiffness: 180, damping: 18 },
  medium: { type: 'spring', stiffness: 140, damping: 20 },
  soft: { type: 'spring', stiffness: 100, damping: 26 },
}
```

### Extended Tokens

```typescript
export const extendedMotionTokens = {
  fadeDuration: 0.24, // seconds
  longDrift: 12.0, // seconds for ambient loops
  parallaxRange: { min: 20, max: 60 }, // px
  magneticRange: 8, // px for cursor magnetics
  scaleSubtle: { from: 0.9, to: 1.0 },
  scaleHover: { from: 1.0, to: 1.03 },
  glowBloom: { from: 0, to: 6 }, // px
  velocityBlurThreshold: 500, // scroll velocity
}
```

---

## Global Motion Patterns

### Cohesion with Landing Page

| Landing Page Motif | In-App Mirror | Implementation |
|--------------------|---------------|----------------|
| **Velocity Blur** | Scroll blur in Map/Timeline | `useVelocity` transform |
| **Ambient Pulse** | Light sweep across console header | `keyframes` opacity loop |
| **Magnetic CTA** | Run / Save buttons | `useMotionValue` logic |
| **Parallax Glow** | Shared background gradient | `motion.div` behind content |
| **Calm Mode** | Reduces amplitude by 70% | `useReducedMotion()` |

### Shared Components

#### FramerThemeLayer

Wraps content with theme-appropriate motion layers:

```tsx
import { FramerThemeLayer } from '@/components/FramerThemeLayer'

<FramerThemeLayer
  theme="map"
  enableParallax={true}
  enableAmbientGlow={true}
  calmMode={false}
>
  {/* Your content */}
</FramerThemeLayer>
```

**Features**:
- Parallax background (Map, Timeline)
- Ambient glow (Guide, Map)
- Velocity blur (Map, Timeline)
- Respects Calm Mode

#### LightSweep

Subtle gradient sweep for headers:

```tsx
import { LightSweep } from '@/components/FramerThemeLayer'

<LightSweep duration={6} calmMode={false}>
  <h1>Campaign Title</h1>
</LightSweep>
```

#### MagneticCTA

Cursor pull effect for primary buttons:

```tsx
import { MagneticCTA } from '@/components/FramerThemeLayer'

<MagneticCTA onClick={handleSubmit} calmMode={false}>
  <button>Run Campaign</button>
</MagneticCTA>
```

---

## Per-Theme Motion Specifications

### 1. Operator (The Fast Lane)

**Personality**: Instant, minimal motion
**Durations**: 0ms (all transitions)
**Spring**: None (instant snaps)

#### Key Animations

**Command Palette**:
```tsx
const presets = useFramerMotionPresets('operator')

<motion.div {...presets.slideUp}>
  <CommandInput />
</motion.div>
```

**Feedback Spark** (on successful command):
```tsx
<motion.div {...presets.commandSpark}>
  <div className="radial-glow" />
</motion.div>
```

**CTA Magnetics**: Disabled (instant feedback only)

#### Example Implementation

```tsx
import { motion } from 'framer-motion'
import { useFramerMotionPresets } from '@/hooks/useFramerMotionPresets'

function OperatorCommandBar() {
  const presets = useFramerMotionPresets('operator')

  return (
    <motion.div {...presets.slideUp}>
      <input placeholder="Type command..." />
    </motion.div>
  )
}
```

---

### 2. Guide (The Pathfinder)

**Personality**: Reassuring, step-by-step
**Durations**: 120ms (fast), 240ms (normal), 400ms (slow)
**Spring**: Medium (stiffness 140, damping 20)

#### Key Animations

**Step Transitions**:
```tsx
const presets = useFramerMotionPresets('guide')

<AnimatePresence mode="wait">
  <motion.div key={step} {...presets.stepTransition}>
    <StepContent />
  </motion.div>
</AnimatePresence>
```

**Progress Bar**:
```tsx
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${progress}%` }}
  transition={springPresets.medium}
/>
```

**Ambient Glow** (header):
```tsx
<LightSweep duration={6}>
  <h1>Step 2: Find Targets</h1>
</LightSweep>
```

#### Example Implementation

```tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useFramerMotionPresets } from '@/hooks/useFramerMotionPresets'
import { LightSweep } from '@/components/FramerThemeLayer'

function GuideWizard({ step }: { step: number }) {
  const presets = useFramerMotionPresets('guide')

  return (
    <div>
      <LightSweep>
        <h1>Step {step}</h1>
      </LightSweep>

      <AnimatePresence mode="wait">
        <motion.div key={step} {...presets.stepTransition}>
          <StepContent step={step} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
```

---

### 3. Map (The Strategist)

**Personality**: Spatial, floating depth
**Durations**: 120ms (fast), 240ms (normal), 400ms (slow)
**Spring**: Fast (stiffness 180, damping 18)

#### Key Animations

**Node Introduction**:
```tsx
const presets = useFramerMotionPresets('map')

<motion.div {...presets.nodeIntro}>
  <PhaseNode />
</motion.div>
```

**Edge Drawing** (SVG path):
```tsx
<motion.path
  d="M0,0 L100,100"
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 0.24, ease: framerEasing.fast }}
/>
```

**Background Parallax**:
```tsx
<FramerThemeLayer
  theme="map"
  enableParallax={true}
  enableAmbientGlow={true}
>
  <MapCanvas />
</FramerThemeLayer>
```

#### Example Implementation

```tsx
import { motion } from 'framer-motion'
import { useFramerMotionPresets } from '@/hooks/useFramerMotionPresets'
import { FramerThemeLayer } from '@/components/FramerThemeLayer'

function MapCanvas() {
  const presets = useFramerMotionPresets('map')

  return (
    <FramerThemeLayer theme="map" enableParallax enableAmbientGlow>
      <motion.div {...presets.nodeIntro}>
        <PhaseNode title="Research" />
      </motion.div>

      <svg>
        <motion.path
          d="M0,0 L100,100"
          stroke="#3AA9BE"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.24 }}
        />
      </svg>
    </FramerThemeLayer>
  )
}
```

---

### 4. Timeline (The Sequencer)

**Personality**: Precise, tempo-synced
**Durations**: 120ms (fast), 240ms (normal), 400ms (slow)
**Spring**: Fast (stiffness 180, damping 18)

#### Key Animations

**Clip Movement** (drag):
```tsx
const presets = useFramerMotionPresets('timeline')

<motion.div {...presets.clipDrag}>
  <ClipBlock />
</motion.div>
```

**Playhead Sweep**:
```tsx
<motion.div
  initial={{ x: 0 }}
  animate={{ x: playheadPosition }}
  transition={{ duration: 0.12, ease: framerEasing.fast }}
  style={{
    boxShadow: '0 0 8px rgba(58,169,190,0.6)',
  }}
/>
```

**Track Activation** (pulse):
```tsx
<motion.div
  animate={{ opacity: [0, 0.15, 0] }}
  transition={{ duration: 0.4 }}
  className="track-pulse"
/>
```

#### Example Implementation

```tsx
import { motion } from 'framer-motion'
import { useFramerMotionPresets } from '@/hooks/useFramerMotionPresets'

function TimelineLane() {
  const presets = useFramerMotionPresets('timeline')

  return (
    <div className="lane">
      <motion.div {...presets.clipDrag}>
        <ClipBlock title="Research" duration={2} />
      </motion.div>

      <motion.div
        className="playhead"
        animate={{ x: playheadX }}
        transition={{ duration: 0.12 }}
      />
    </div>
  )
}
```

---

### 5. Tape (The Receipt)

**Personality**: Grounded, gentle
**Durations**: 120ms (fast), 240ms (normal), 400ms (slow)
**Spring**: Soft (stiffness 100, damping 26)

#### Key Animations

**Entry Creation**:
```tsx
const presets = useFramerMotionPresets('tape')

<motion.div {...presets.noteEntry}>
  <NoteBlock />
</motion.div>
```

**Text Parse Feedback**:
```tsx
<motion.span
  animate={{
    color: ['#f0eee9', '#3AA9BE', '#f0eee9'],
  }}
  transition={{ duration: 0.3 }}
>
  #radio
</motion.span>
```

**Tag Hover**:
```tsx
<motion.span {...presets.hoverScale}>
  <Tag>#press</Tag>
</motion.span>
```

#### Example Implementation

```tsx
import { motion } from 'framer-motion'
import { useFramerMotionPresets } from '@/hooks/useFramerMotionPresets'

function TapeNote({ content }: { content: string }) {
  const presets = useFramerMotionPresets('tape')

  return (
    <motion.div {...presets.noteEntry}>
      <div className="note-content">{content}</div>

      <motion.button {...presets.hoverScale}>
        Make it a Run
      </motion.button>
    </motion.div>
  )
}
```

---

## Performance Guidelines

### 60fps Targets

**Optimization Checklist**:
- ✅ Use `transform` and `opacity` (GPU-accelerated)
- ✅ Avoid `width`, `height`, `top`, `left` animations
- ✅ Use `will-change` sparingly (only during animation)
- ✅ Limit simultaneous animations (max 5 at once)
- ✅ Use `layoutId` for shared element transitions

**Example**:
```tsx
// ✅ Good (GPU-accelerated)
<motion.div
  animate={{ opacity: 1, x: 0, scale: 1 }}
/>

// ❌ Bad (triggers layout reflow)
<motion.div
  animate={{ width: '100%', marginLeft: 20 }}
/>
```

### Calm Mode Behavior

When Calm Mode is enabled:
- Motion amplitude reduced by 70%
- Heavy effects disabled (parallax, velocity blur)
- Ambient loops paused
- Only critical feedback animations remain

**Implementation**:
```tsx
const amplitude = calmMode ? value * 0.3 : value
```

### Reduced Motion Support

Automatically detected via `useReducedMotion()`:
```tsx
import { useReducedMotion } from 'framer-motion'

const prefersReducedMotion = useReducedMotion()

<motion.div
  animate={{ opacity: 1 }}
  transition={{
    duration: prefersReducedMotion ? 0 : 0.24,
  }}
/>
```

---

## Component Usage Patterns

### Standard Pattern

```tsx
import { motion } from 'framer-motion'
import { useFramerMotionPresets } from '@/hooks/useFramerMotionPresets'
import { FramerThemeLayer } from '@/components/FramerThemeLayer'
import { useTheme } from '@/components/themes/ThemeResolver'

function MyComponent() {
  const { currentTheme } = useTheme()
  const presets = useFramerMotionPresets(currentTheme)

  return (
    <FramerThemeLayer
      theme={currentTheme}
      enableParallax={currentTheme === 'map' || currentTheme === 'timeline'}
      enableAmbientGlow={currentTheme === 'guide' || currentTheme === 'map'}
    >
      <motion.div {...presets.fadeIn}>
        {/* Content */}
      </motion.div>
    </FramerThemeLayer>
  )
}
```

### List Stagger Pattern

```tsx
<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item, i) => (
    <motion.li
      key={item.id}
      variants={itemVariants}
      custom={i}
    >
      {item.content}
    </motion.li>
  ))}
</motion.ul>

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // 80ms delay per item
    },
  },
}

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 },
}
```

### Shared Layout Transitions

```tsx
import { LayoutGroup } from 'framer-motion'

<LayoutGroup>
  <motion.div layoutId="campaign-header">
    <h1>{campaignName}</h1>
  </motion.div>
</LayoutGroup>

// In different theme view
<LayoutGroup>
  <motion.div layoutId="campaign-header">
    <h2>{campaignName}</h2>
  </motion.div>
</LayoutGroup>
```

---

## Testing Checklist

### Visual QA

- [ ] All themes load without motion jank
- [ ] 60fps confirmed via Chrome DevTools Performance tab
- [ ] Slate Cyan accent consistent across all motion
- [ ] Motion curves match landing page feel
- [ ] Transitions feel cohesive when switching themes

### Performance QA

- [ ] No layout shift during animations
- [ ] GPU layers used for all motion (check Layers panel)
- [ ] Memory usage stable (no leaks after 100+ animations)
- [ ] Mobile performance 60fps on mid-range device
- [ ] Calm Mode reduces amplitude by 70%

### Accessibility QA

- [ ] `prefers-reduced-motion` respected
- [ ] Keyboard navigation unaffected by motion
- [ ] Focus states visible during animations
- [ ] Screen reader announcements not interrupted
- [ ] All interactive elements remain accessible

---

## Migration Guide

### Updating Existing Components

**Before** (static/CSS transitions):
```tsx
<div className="card">
  <h1>Title</h1>
</div>
```

**After** (Framer Motion):
```tsx
import { motion } from 'framer-motion'
import { useFramerMotionPresets } from '@/hooks/useFramerMotionPresets'

function Card({ theme }: { theme: OSTheme }) {
  const presets = useFramerMotionPresets(theme)

  return (
    <motion.div className="card" {...presets.fadeIn}>
      <h1>Title</h1>
    </motion.div>
  )
}
```

### Adding Theme-Specific Motion

```tsx
import { useFramerMotionPresets } from '@/hooks/useFramerMotionPresets'

function ThemeSpecificComponent({ theme }: { theme: OSTheme }) {
  const presets = useFramerMotionPresets(theme)

  // Different motion per theme
  const motionPreset = {
    operator: presets.fadeIn, // Instant
    guide: presets.stepTransition, // Horizontal slide
    map: presets.nodeIntro, // Scale + rotate
    timeline: presets.clipDrag, // Draggable
    tape: presets.noteEntry, // Gentle slide
  }[theme]

  return <motion.div {...motionPreset}>{/* Content */}</motion.div>
}
```

---

## Troubleshooting

### Animation Not Running

**Check**:
1. Is `initial` state different from `animate` state?
2. Is `AnimatePresence` wrapping exit animations?
3. Is component mounted in DOM tree?
4. Is Calm Mode accidentally enabled?

### Performance Issues

**Solutions**:
1. Use `will-change: transform` (sparingly)
2. Reduce simultaneous animations
3. Use `layoutId` for shared transitions
4. Disable heavy effects in Calm Mode

### Motion Feels "Off"

**Verify**:
1. Easing curve matches token (`cubic-bezier(0.22, 1, 0.36, 1)`)
2. Duration matches theme (Operator = 0ms, others = 120/240/400ms)
3. Spring stiffness/damping correct for theme
4. Amplitude respects Calm Mode setting

---

## Resources

### Official Documentation
- [Framer Motion Docs](https://www.framer.com/motion/)
- [useReducedMotion](https://www.framer.com/motion/use-reduced-motion/)
- [AnimatePresence](https://www.framer.com/motion/animate-presence/)

### Internal Files
- `apps/aud-web/src/tokens/motion.ts` - Motion token definitions
- `apps/aud-web/src/hooks/useFramerMotionPresets.ts` - Theme presets
- `apps/aud-web/src/components/FramerThemeLayer.tsx` - Shared layers

### Performance Tools
- Chrome DevTools > Performance tab
- Chrome DevTools > Rendering > Frame Rendering Stats
- React DevTools > Profiler

---

**Last Updated**: October 2025
**Status**: Implementation Ready
**Phase**: 9.5 (Framer Motion Cohesion Layer)
