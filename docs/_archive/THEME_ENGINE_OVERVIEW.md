# Theme Engine Overview

The TotalAud.io Theme Engine provides a unified system for visual identity, sound design, and motion across all creative OS modes.

## Philosophy

> "Marketing your music should feel like performing it."

Each theme is designed to evoke a specific creative workspace aesthetic while maintaining legal compliance and original IP.

---

## Architecture

```
packages/core/theme-engine/
├── types.ts           # TypeScript interfaces
├── themeRegistry.ts   # Theme definitions
├── sounds.ts          # Web Audio synthesis
├── textures.ts        # Texture loading & fallbacks
├── useThemeManager.ts # React state management
├── ThemeProvider.tsx  # React context provider
└── index.ts           # Public exports
```

---

## Available Themes

### 1️⃣ ASCII Terminal
**Mood**: 1980s hacker workstation meets modern synth

**Palette**:
- Background: `#000000`
- Foreground: `#00ff99`
- Accent: `#1affb2`

**Typography**: JetBrains Mono

**Effects**: Scanlines, CRT glow, flicker animations

**Sound**: Square wave bleeps, synthesized clicks

**Use case**: Developers, command-line enthusiasts, retro computing fans

---

### 2️⃣ Windows XP Studio
**Mood**: Mid-2000s nostalgia + production polish

**Palette**:
- Background: `#d7e8ff` (soft blue gradient)
- Accent: `#3478f6`

**Typography**: Inter, Segoe-like sans

**Effects**: Plastic gloss texture, bounce animations

**Sound**: Major-chord synth tones (custom, not XP samples)

**Use case**: Nostalgic producers, millennial creatives

---

### 3️⃣ macOS Retro (Aqua)
**Mood**: Reflective silver + soft light

**Palette**:
- Background: `#e5e7eb`
- Accent: `#3b82f6`

**Typography**: SF Pro Display (system fallback)

**Effects**: Brushed metal texture, soft bloom, smooth fades

**Sound**: Synth bell (custom, not Apple chime)

**Use case**: Design-focused users, Apple fans

---

### 4️⃣ Ableton Mode
**Mood**: Dark grid studio precision

**Palette**:
- Background: `#111111`
- Accent: `#ff8000` (orange)

**Typography**: Inter SemiBold, uppercase headers

**Effects**: Procedural grid, beat-synced pulse

**Sound**: Metronome clicks, rhythmic hi-hats (Tone.js)

**Use case**: Producers, DAW users, minimal UI lovers

---

### 5️⃣ Punk Zine Mode
**Mood**: DIY xerox chaos

**Palette**:
- Background: `#0f0f0f`
- Accent: `#ff1aff` (magenta)

**Typography**: Anton, Impact with jitter

**Effects**: Xerox grit, torn paper edges, jittery rotation

**Sound**: Tape hiss, record pops, white noise bursts

**Use case**: Alternative artists, DIY punk scene, anti-corporate aesthetes

---

## Sound System

All sounds are **100% synthesized** via Web Audio API - no copyrighted samples.

### Synth Engine

```typescript
audioEngine.play({
  type: 'synth',
  waveform: 'sine',
  frequency: 440,
  duration: 200,
  envelope: {
    attack: 0.01,
    decay: 0.1,
    sustain: 0.3,
    release: 0.1
  }
})
```

### Noise Generator

Supports white, pink, and brown noise for ambient textures:

```typescript
audioEngine.play({
  type: 'noise',
  noiseType: 'pink',
  duration: 60000 // 1 minute ambient loop
})
```

### Chord Synthesis

```typescript
audioEngine.playChord([523.25, 659.25, 783.99], 300) // C major
```

---

## Texture System

### Loading Strategy
1. Try primary texture path
2. Check texture cache
3. Fallback to procedural generation
4. Never block UI rendering

### Procedural Fallbacks

**Scanlines** (CSS):
```css
repeating-linear-gradient(
  0deg,
  transparent,
  transparent 2px,
  rgba(0,0,0,0.1) 2px,
  rgba(0,0,0,0.1) 4px
)
```

**Noise** (Canvas):
```typescript
generateNoiseDataUrl(256) // Returns data URI
```

**Grid** (CSS):
```typescript
generateGridTexture('#3a3a3a', 20, 1)
```

---

## React Integration

### Wrap Your App

```typescript
import { ThemeProvider } from '@total-audio/core-theme-engine'

export default function App({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
```

### Use in Components

```typescript
import { useTheme } from '@total-audio/core-theme-engine'

export function MyComponent() {
  const { theme, setTheme, cycleTheme } = useTheme()
  
  return (
    <div style={{
      backgroundColor: theme.palette.background,
      color: theme.palette.foreground
    }}>
      Current theme: {theme.name}
      <button onClick={cycleTheme}>
        Switch Theme
      </button>
    </div>
  )
}
```

### Play Sounds

```typescript
import { audioEngine, sounds } from '@total-audio/core-theme-engine'

// Play theme-specific sound
audioEngine.play(theme.sounds.click)

// Or use convenience functions
sounds.success()
sounds.error()
```

---

## Keyboard Shortcuts

- **Ctrl/⌘ + Shift + T**: Cycle through themes
- (More shortcuts can be added per component)

---

## Accessibility

### Reduced Motion

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (prefersReducedMotion) {
  theme.motion.duration = 0
}
```

### Contrast Ratios

All theme palettes meet WCAG AA standards:
- Text: 4.5:1 minimum
- UI elements: 3:1 minimum

### Sound Controls

```typescript
import { sounds } from '@total-audio/core-theme-engine'

sounds.setEnabled(false) // Mute all UI sounds
sounds.setVolume(0.5)    // Set volume (0-1)
```

---

## Legal Compliance

### ✅ What We Do
- Synthesize all sounds via Web Audio API
- Use custom textures or procedural generation
- Reference aesthetic *styles*, not specific products
- Properly attribute any CC-licensed assets

### ❌ What We DON'T Do
- Sample copyrighted audio (Windows sounds, Mac chimes, etc.)
- Extract textures from proprietary software
- Use trademarked logos or branding
- Copy patented UI patterns

---

## Future Themes (Roadmap)

### Logic Core
- Sleek silver with Logic-inspired grid
- Minimal, Apple-like precision
- Metallic percussion sounds

### BBC Radiophonic
- 1960s sci-fi synth aesthetic
- Oscilloscope visuals
- Analog-style wobbles and sweeps

### Cassette Mode
- Lo-fi tape aesthetic
- Warm analog hiss
- Vintage VU meters

### Club Rave
- Strobe effects, neon colors
- 808/909-style synth drums
- BPM-synced animations

---

## Contributing

### Adding a New Theme

1. Define theme in `themeRegistry.ts`
2. Create sound configs (synth only)
3. Add textures to `/public/textures/`
4. Update type definitions if needed
5. Test accessibility & performance
6. Document in this file

### Theme Checklist

- [ ] Palette has 8 colors minimum
- [ ] All sounds are synthesized (no samples)
- [ ] Textures are custom or CC-licensed
- [ ] Contrast ratios meet WCAG AA
- [ ] Reduced motion supported
- [ ] Mobile responsive
- [ ] Legal review complete

---

## Performance

### Benchmarks (Target)

- Theme switch: <300ms
- Sound playback: <50ms latency
- Texture load: <500ms
- Memory footprint: <10MB per theme

### Optimization Tips

- Preload next theme on hover
- Use CSS variables for instant color changes
- Lazy-load heavy textures
- Cache audio contexts
- Debounce rapid theme switches

---

## Examples

### Custom Theme Button

```typescript
function ThemeSelector() {
  const { allThemes, currentTheme, setTheme } = useTheme()
  
  return (
    <div>
      {Object.values(allThemes).map(theme => (
        <button
          key={theme.id}
          onClick={() => setTheme(theme.id)}
          className={theme.id === currentTheme ? 'active' : ''}
        >
          {theme.name}
          <span>{theme.mood}</span>
        </button>
      ))}
    </div>
  )
}
```

### Animated Theme Transition

```typescript
import { motion } from 'framer-motion'

function ThemedCard() {
  const { theme } = useTheme()
  
  return (
    <motion.div
      animate={{
        backgroundColor: theme.palette.background,
        color: theme.palette.foreground
      }}
      transition={{ duration: theme.motion.duration / 1000 }}
    >
      Content
    </motion.div>
  )
}
```

---

## Troubleshooting

**Theme not loading?**
- Check localStorage for `totalaud_theme`
- Verify theme ID is valid
- Clear browser cache

**Sounds not playing?**
- User interaction required (browser security)
- Check AudioContext state
- Verify volume settings

**Textures missing?**
- Check `/public/textures/` directory
- Fallback should auto-apply
- Check browser console for 404s

**Performance issues?**
- Disable textures on low-end devices
- Reduce motion duration
- Use simpler themes (ASCII, Ableton)

---

## Credits

**Design**: TotalAud.io Team  
**Sound Engine**: Custom Web Audio API implementation  
**Inspiration**: Classic computing aesthetics, music production tools, punk DIY culture

All assets are original or properly licensed. No copyrighted material included.

---

**Last Updated**: 2026-01-19  
**Version**: 0.1.0  
**Maintainer**: TotalAud.io Team

