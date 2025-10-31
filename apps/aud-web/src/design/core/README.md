# FlowCore Design System

**Unified design tokens for totalaud.io** - Providing consistent motion, sound, typography, and textures across all themes.

## Overview

FlowCore is a comprehensive design token system that replaces scattered, string-based styling with a unified, typed design language. It provides a single source of truth for all design decisions across the application.

### Core Modules

1. **Motion** - Easing curves, durations, transitions
2. **Sound** - UI feedback, ambient audio
3. **Typography** - Fonts, sizes, text styles
4. **Textures** - Shadows, glows, gradients, borders

## Quick Start

```typescript
import { flowCore } from '@/design/core'

// Access any design token through the unified API
const transition = flowCore.motion.transitions.smooth
const clickSound = flowCore.sound.ui.click
const headingStyle = flowCore.typography.textStyles.h1
const cardShadow = flowCore.texture.shadows.md
```

---

## 1. Motion System

### Philosophy

- **Fast (120ms)**: Micro-interactions, instant feedback
- **Normal (240ms)**: Pane transitions, modals
- **Slow (400ms)**: Ambient effects, calm transitions
- **Cinematic (600ms)**: Landing page effects

### Usage with Framer Motion

```tsx
import { motion } from 'framer-motion'
import { flowCore } from '@/design/core'

// Use pre-composed transitions
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={flowCore.motion.transitions.smooth}
>
  Content
</motion.div>

// Use custom easing curves
<motion.div
  animate={{ x: 100 }}
  transition={{
    duration: flowCore.motion.duration.fast / 1000,
    ease: flowCore.motion.easing.smooth,
  }}
/>

// Use spring configurations
<motion.div
  animate={{ scale: 1.1 }}
  transition={flowCore.motion.springs.bouncy}
/>
```

### Available Transitions

```typescript
flowCore.motion.transitions = {
  micro,      // 120ms - Hover, click, focus
  smooth,     // 240ms - UI transitions
  ambient,    // 400ms - Calm animations
  command,    // 120ms - Sharp, decisive
  bounce,     // 240ms - Playful success
  cinematic,  // 600ms - Hero sections
}
```

### Utility Functions

```typescript
// Convert to CSS cubic-bezier string
toCubicBezier(easingCurves.smooth)
// => "cubic-bezier(0.22, 1, 0.36, 1)"

// Generate CSS transition string
toTransition('opacity', durations.fast, easingCurves.smooth)
// => "opacity 120ms cubic-bezier(0.22, 1, 0.36, 1)"
```

---

## 2. Sound System

### Philosophy

- **UI Sounds**: Quick feedback (100-200ms)
- **Ambient Sounds**: Background atmosphere (looping)
- **Theme-Specific**: Each theme has unique sound personality

### Basic Usage

```typescript
import { playSound, soundCore } from '@/design/core'

// Play a UI sound
playSound(soundCore.ui.click)

// Create reusable player
const playClick = createSoundPlayer(soundCore.ui.click)
playClick() // Play sound
```

### Available Sounds

```typescript
flowCore.sound.ui = {
  click,         // Button clicks
  hover,         // Hover feedback
  success,       // Success confirmation
  error,         // Error alert
  notification,  // Notification ping
  modalOpen,     // Modal open
  modalClose,    // Modal close
  command,       // Command execute
  agentSpawn,    // Agent spawn
}

flowCore.sound.ambient = {
  hum,   // Subtle background hum
  pad,   // Atmospheric pad
  pulse, // Rhythmic pulse
}
```

### Theme-Specific Overrides

Each theme has its own sound personality:

```typescript
flowCore.sound.themes = {
  operator: { // ASCII - Square waves (harsh, digital)
    click: { type: 'square', frequency: 880 },
  },
  guide: { // XP - Sine waves (soft, nostalgic)
    click: { type: 'sine', frequency: 880 },
  },
  map: { // Aqua - Triangle waves (smooth, designer)
    click: { type: 'triangle', frequency: 880 },
  },
  timeline: { // DAW - Sawtooth (producer, experimental)
    click: { type: 'sawtooth', frequency: 880 },
  },
  tape: { // Analogue - Gentle sine (warm, human)
    click: { type: 'sine', frequency: 440 },
  },
}
```

---

## 3. Typography System

### Philosophy

- **Display**: Large headings, hero text
- **Body**: Readable content (optimal 70ch line length)
- **Mono**: Code, terminal, technical UI
- **Micro**: Labels, captions, metadata

### Text Styles

```tsx
import { flowCore } from '@/design/core'

// Apply pre-composed text styles
<h1 style={flowCore.typography.textStyles.hero}>
  Hero Heading
</h1>

<p style={flowCore.typography.textStyles.body}>
  Body text with optimal line height and spacing.
</p>

<code style={flowCore.typography.textStyles.terminal}>
  $ command --flag
</code>
```

### Available Text Styles

```typescript
flowCore.typography.textStyles = {
  hero,       // 48px bold - Landing page
  h1,         // 36px bold - Page title
  h2,         // 30px semibold - Section heading
  h3,         // 24px semibold - Subsection
  h4,         // 18px medium - Card heading
  body,       // 16px regular - Standard content
  bodyLarge,  // 18px regular - Emphasis content
  label,      // 14px medium - Form labels
  caption,    // 12px regular - Metadata
  code,       // 14px mono - Inline code
  terminal,   // 16px mono - Command line
  micro,      // 10px medium - Very small labels
}
```

### Responsive Typography

```typescript
// Fluid font sizing using clamp()
const fluidHero = fluidSize(2, 4, 3) // min 2rem, preferred 4vw, max 3rem
// => "clamp(2rem, 4vw, 3rem)"
```

### Max Width for Readability

```tsx
<div style={{ maxWidth: flowCore.typography.maxWidths.prose }}>
  Long-form content with optimal 70ch line length
</div>
```

---

## 4. Texture System

### Philosophy

- **Subtle**: Background atmospherics
- **Emphasis**: Highlight important elements
- **Dramatic**: Hero sections, key moments

### Shadows

```tsx
// Apply elevation shadows
<div style={{ boxShadow: flowCore.texture.shadows.md }}>
  Card with elevation
</div>

// Combine shadow with glow
<div style={{ boxShadow: combineShadows(
  flowCore.texture.shadows.lg,
  flowCore.texture.glows.normal
)}}>
  Elevated card with accent glow
</div>
```

### Glows

```tsx
// Accent glow for emphasis
<button style={{ boxShadow: flowCore.texture.glows.strong }}>
  Glowing CTA
</button>
```

### Gradients

```tsx
// Background gradients
<div style={{ background: flowCore.texture.gradients.hero }}>
  Hero section with dramatic gradient
</div>

// Layer multiple gradients
<div style={{ background: layerGradients(
  flowCore.texture.gradients.fade,
  flowCore.texture.gradients.accent
)}}>
  Layered gradients
</div>
```

### Backdrop Filters

```tsx
// Frosted glass effect
<div style={{
  backdropFilter: flowCore.texture.backdrops.frosted,
  backgroundColor: `rgba(15, 17, 19, ${flowCore.texture.opacity.medium})`,
}}>
  Frosted modal backdrop
</div>
```

### Theme-Specific Textures

```typescript
// Each theme has unique visual personality
flowCore.texture.themes = {
  operator: { // Sharp, minimal
    border: 'thin',
    radius: 'none',
    shadow: 'none',
  },
  guide: { // Soft, rounded
    border: 'normal',
    radius: 'md',
    shadow: 'md',
  },
  map: { // Frosted, glassy
    border: 'thin',
    radius: 'lg',
    backdrop: 'frosted',
  },
  // ... timeline, tape
}
```

---

## Integration with Existing Code

### Migrating from String-Based Styles

**Before:**
```tsx
<motion.div
  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
  style={{
    fontFamily: 'Inter, sans-serif',
    fontSize: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  }}
/>
```

**After:**
```tsx
<motion.div
  transition={flowCore.motion.transitions.smooth}
  style={{
    ...flowCore.typography.textStyles.h3,
    boxShadow: flowCore.texture.shadows.md,
  }}
/>
```

### Benefits

✅ **Type Safety** - No magic strings, full TypeScript support
✅ **Consistency** - Single source of truth for all design tokens
✅ **Maintainability** - Update tokens in one place, affects entire app
✅ **Theme Awareness** - Easily override tokens per theme
✅ **Documentation** - Self-documenting design system

---

## Theme Integration

### Using with ThemeContext

```tsx
import { useFlowCore } from '@/design/core'
import { useTheme } from '@/contexts/ThemeContext'

function MyComponent() {
  const flowCore = useFlowCore() // Theme-aware tokens
  const { currentTheme } = useTheme()

  // FlowCore automatically adapts to current theme
  return (
    <motion.div
      transition={flowCore.motion.transitions.smooth}
      onClick={() => playSound(flowCore.sound.ui.click)}
    >
      Theme-aware component
    </motion.div>
  )
}
```

---

## Best Practices

### DO ✅

- Use FlowCore tokens for ALL new components
- Access tokens through `flowCore` central API
- Use pre-composed configurations (transitions, textStyles)
- Leverage utility functions for custom combinations

### DON'T ❌

- Hardcode easing curves as strings
- Use magic numbers for durations
- Create one-off font sizes
- Duplicate shadow/glow definitions

---

## File Structure

```
apps/aud-web/src/design/core/
├── flowCore.ts      # Central API, theme integration
├── motion.ts        # Easing, durations, transitions
├── sounds.ts        # UI sounds, ambient audio
├── typography.ts    # Fonts, sizes, text styles
├── textures.ts      # Shadows, glows, gradients
├── index.ts         # Barrel export
└── README.md        # This file
```

---

## Migration Guide

### Phase 1: New Components
- Use FlowCore tokens in all new components
- Build familiarity with the API

### Phase 2: Gradual Migration
- As you touch existing components, replace hardcoded values with FlowCore tokens
- No rush - migrate incrementally

### Phase 3: Theme Integration
- Connect `useFlowCore()` to ThemeContext
- Enable theme-specific token overrides

---

## Future Enhancements

- [ ] Theme-specific motion curves
- [ ] Animation presets library
- [ ] Sound mixing and layering
- [ ] Dynamic token generation
- [ ] Design token documentation site

---

**Last Updated**: October 31, 2025
**Phase**: 12.2 - FlowCore Design Layer
**Status**: Initial Implementation Complete
