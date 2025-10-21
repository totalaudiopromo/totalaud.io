# totalaud.io Onboarding Sequence

cinematic operator → signal journey

---

## Overview

The totalaud.io onboarding experience transforms a minimal operator terminal into an immersive Flow Studio environment through a four-phase sequence:

1. **operator** - Minimal retro terminal with boot sequence
2. **selection** - Interactive OS/theme selection
3. **transition** - Cinematic reveal with logo morph and ambient audio
4. **signal** - Full Flow Studio with theme-aware UI and ambient sound

---

## Architecture

### File Structure

```
apps/aud-web/src/
├── app/
│   ├── page.tsx                          # Main entry point with phase orchestration
│   └── globals.css                       # Imports onboarding.css
│
├── components/
│   ├── Onboarding/
│   │   ├── OperatorTerminal.tsx          # Phase 1: Terminal interface
│   │   ├── OSSelector.tsx                # Phase 2: Theme picker
│   │   ├── TransitionSequence.tsx        # Phase 3: Cinematic reveal
│   │   └── index.ts                      # Barrel exports
│   ├── Ambient/
│   │   ├── AmbientSound.tsx              # Ambient audio component
│   │   └── index.ts                      # Barrel exports
│   └── FlowStudio.tsx                    # Phase 4: Main application
│
├── hooks/
│   ├── useOnboardingPhase.ts             # Phase state management
│   ├── useOperatorInput.ts               # Terminal input + easter eggs
│   ├── useOSSelection.ts                 # Arrow-key navigation
│   └── useAmbientAudio.ts                # Ambient sound synthesis
│
├── lib/
│   └── transitions.ts                    # Framer Motion presets
│
└── styles/
    └── onboarding.css                    # Terminal + reveal styling
```

---

## Phase Details

### Phase 1: Operator Terminal

**Component:** `OperatorTerminal.tsx`
**Hook:** `useOperatorInput.ts`

Boot sequence plays automatically:
```
operator> booting patchbay...
operator> checking signal path...
operator> line check complete.
operator> welcome to totalaud.io
operator> what are we working on today?
```

**Features:**
- 50Hz sine hum ambient audio (−24dB)
- Blinking cursor (800ms interval)
- User can type freely
- Enter key advances to next phase
- Easter eggs triggered by specific inputs

**Easter Eggs:**
| Input | Response |
|-------|----------|
| `who are you?` | `depends who's asking.` |
| `play the demo` | `unlocking daw mode...` |
| `make it louder` | Increases ambient volume by 10% |
| `total audio promo` | `ah, you know the name. welcome back.` |

---

### Phase 2: OS Selector

**Component:** `OSSelector.tsx`
**Hook:** `useOSSelection.ts`

Interactive theme selection with arrow-key navigation:

```
operator> one last thing — choose your environment.
[ ascii terminal ]
[ xp workstation ]
[ aqua interface ]
[ daw console ]
[ analogue studio ]
```

**Controls:**
- ↑↓ arrow keys to navigate
- Enter to confirm selection
- Click sound on navigation (sine wave)
- Success sound on confirmation (two-tone beep)

**Theme Persistence:**
Selected theme is saved to `user_preferences.preferred_theme` via Supabase.

---

### Phase 3: Transition Sequence

**Component:** `TransitionSequence.tsx`
**Hook:** `useAmbientAudio.ts`

Cinematic 4-second reveal:

1. **Fade to black** (500ms)
2. **C minor drone** fades in (C3, Eb3, G3)
3. **Logo morph** animation (waveform SVG path draw)
4. **Messages appear:**
   ```
   operator> signal online.
   signal> hello. ready when you are.
   ```
5. **Transition glide** (440Hz → 220Hz sine, 2s)
6. **Load Flow Studio**

**Motion:**
- Framer Motion keyframe animations
- Theme-specific background colour applied
- Accessibility: respects `prefers-reduced-motion`

---

### Phase 4: Flow Studio

**Component:** `FlowStudio.tsx`

Full application environment with:
- Theme-aware layout (colours, typography, spacing)
- Ambient sound loop (theme-specific)
- FlowCanvas with agent orchestration
- MissionPanel with status indicators
- CommandPalette (⌘K) and Focus Mode (⌘F)
- All messages prefixed with `signal>`

---

## Hooks API

### useOnboardingPhase

```typescript
const { phase, next, setPhase, reset } = useOnboardingPhase();
// phase: 'operator' | 'selection' | 'transition' | 'signal'
```

### useOperatorInput

```typescript
const { lines, userInput, isComplete, handleKeyPress, resetInput } = useOperatorInput(onComplete);
```

### useOSSelection

```typescript
const { options, activeIndex, selectedTheme, isConfirmed, handleKeyPress } = useOSSelection(onConfirm);
```

### useAmbientAudio

```typescript
const { play, stop, fadeOut, increaseVolume, isPlaying } = useAmbientAudio({
  type: 'operator-hum' | 'transition-glide' | 'theme-ambient',
  theme?: string,
  volume?: number,
});
```

---

## Ambient Audio System

Three distinct audio modes:

### Operator Hum
- **Type:** Continuous sine wave
- **Frequency:** 50Hz
- **Gain:** −24dB (~0.063 linear)
- **Use:** Background presence during terminal phase

### Transition Glide
- **Type:** Frequency glide
- **Range:** 440Hz → 220Hz
- **Duration:** 2 seconds
- **Envelope:** Fade in 200ms, fade out at end
- **Use:** Cinematic reveal moment

### Theme Ambient
- **Type:** Theme-specific oscillator
- **Themes:**
  - `ascii`: 110Hz square wave
  - `xp`: 220Hz sine wave
  - `aqua`: 165Hz triangle wave
  - `daw`: 130.81Hz sawtooth (C3)
  - `analogue`: 130.81Hz sine (C3)
- **Gain:** 0.1 * user volume
- **Use:** Persistent ambient throughout Flow Studio

**Respects:**
- `user_preferences.mute_sounds`
- `user_preferences.audio_volume`
- `prefers-reduced-motion` (disables audio)

---

## Persistence & Skip Logic

### localStorage

```javascript
localStorage.setItem('onboarding_completed', 'true');
```

Once set, user skips directly to Flow Studio on future visits.

### URL Parameters

```
/?skip_onboarding=true    # Skip to Flow Studio immediately
```

Useful for development and returning users.

---

## Styling

### CSS Classes

**Operator Terminal:**
```css
.operator-terminal
.operator-terminal__window
.operator-terminal__line
.operator-terminal__cursor (800ms blink animation)
```

**OS Selector:**
```css
.os-selector__option--active (blue glow)
.os-selector__option--selected (green glow)
```

**Transition:**
```css
.transition-sequence__waveform (SVG path animation)
.transition-sequence__message--signal (green text)
```

### Typography
- **Font:** JetBrains Mono (monospace)
- **Case:** lowercase throughout
- **Size:** 16px base, 14px mobile
- **Letter spacing:** 0.3-0.5px

### Colour Palette
- Background: `#0a0d10` (deep navy)
- Text: `#c0c0c0` (grey)
- Accent: `#60a5fa` (blue)
- Success: `#22c55e` (green)
- Border: `rgba(255, 255, 255, 0.1)`

---

## Accessibility

### Reduced Motion
All animations disabled when `prefers-reduced-motion: reduce` detected:
- Cursor blink static
- Logo morph instant
- Audio disabled
- Phase transitions fade only

### Keyboard Navigation
- Full keyboard control (no mouse required)
- Clear visual focus indicators
- Escape key to exit (where applicable)

### Screen Readers
- Semantic HTML structure
- ARIA labels on interactive elements
- Status messages announced

---

## Development

### Running Locally

```bash
cd apps/aud-web
pnpm dev
```

Navigate to `http://localhost:3002`

### Testing Phases

**Skip onboarding:**
```
http://localhost:3002/?skip_onboarding=true
```

**Reset onboarding:**
```javascript
localStorage.removeItem('onboarding_completed');
```

**Test specific phase:**
Edit `useOnboardingPhase` initial state in `page.tsx`

### TypeScript

All components fully typed:
```bash
pnpm typecheck --filter aud-web
```

---

## Future Enhancements

### Planned Features
- [ ] Onboarding analytics tracking
- [ ] A/B test different operator messages
- [ ] User-submitted theme suggestions
- [ ] Voice synthesis for operator/signal messages
- [ ] Haptic feedback on mobile devices
- [ ] Theme preview before selection

### Easter Egg Ideas
- Random 1% chance of rare message
- Konami code unlocks hidden theme
- Custom ASCII art on certain dates
- Collaborative multiplayer onboarding

---

## Technical Decisions

### Why Framer Motion?
- Declarative animation API
- Built-in accessibility support
- Smooth 60fps performance
- AnimatePresence for phase transitions

### Why Web Audio API?
- Precise frequency control for ambient tones
- Sub-millisecond timing accuracy
- No external audio files required
- Crossfade and envelope support

### Why localStorage?
- Instant persistence (no server delay)
- Works offline
- Simple boolean flag
- Upgradeable to Supabase later

---

## Credits

**Design Philosophy:** Minimal, human, confident
**Language:** UK English, lowercase, no emojis
**Sound Design:** Lo-fi, musical, sub-bass presence
**Motion:** Earned reveals, not flashy transitions

**Built with:**
- Next.js 15
- React 19
- TypeScript 5
- Framer Motion 11
- Web Audio API
- Tailwind CSS 3

---

**Last Updated:** October 2025
**Status:** Production Ready ✓
