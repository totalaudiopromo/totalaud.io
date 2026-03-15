# Stage 7: Adaptive Theme Framework - Progress Report

**Date**: October 24, 2025
**Status**: In Progress (2/7 tasks complete)
**Goal**: Transform themes into living studio personalities with adaptive behavior

---

## ✅ Completed Tasks

### 1. Aesthetic Curator - Palettes System ✅

**File Created**: [`apps/aud-web/src/components/themes/palettes.ts`](../apps/aud-web/src/components/themes/palettes.ts)

**What Was Built**:
- Consolidated color system for all 5 themes
- CSS variable mapping for instant theme switching
- `applyPalette()` function for dynamic theme application
- `adjustBrightness()` utility for adaptive logic
- Complete color tokens per theme:
  - `ascii`: Black terminal + teal accent (#3AE1C2)
  - `xp`: Bright blue + white (#3870FF)
  - `aqua`: Deep blue glass (#00B3FF)
  - `daw`: Dark purple studio (#A076F9)
  - `analogue`: Warm sepia + amber (#C47E34)

**Integration Points**:
- Applied via `data-theme` attribute on `<html>`
- CSS variables: `--theme-bg`, `--theme-accent`, `--theme-text`, etc.
- Hot-swappable without layout shift

### 2. Motion Choreographer - Motion Profiles ✅

**File Created**: [`apps/aud-web/src/components/themes/motionProfiles.ts`](../apps/aud-web/src/components/themes/motionProfiles.ts)

**What Was Built**:
- 5 distinct motion personalities:
  - `ascii`: Instant (120ms linear, no easing)
  - `xp`: Bouncy (240ms cubic-bezier spring)
  - `aqua`: Elastic (400ms gentle spring)
  - `daw`: Rhythmic (500ms @ 120 BPM, quantized steps)
  - `analogue`: Drift (600ms soft S-curve)
- Framer Motion spring configs
- CSS transition generators
- BPM sync for DAW theme (120 BPM tempo-locked)
- Reduced motion support

**Integration Points**:
- `getMotionProfile(themeName)` - Get full profile
- `getFramerSpring(themeName)` - For Framer Motion components
- `getCSSTransition(themeName, property, speed)` - For CSS transitions
- `syncToBPM(themeName, beats)` - Tempo sync utility

---

## ⏳ Remaining Tasks

### 3. Sound Director - Sound Palettes + Integration

**To Create**: `apps/aud-web/src/components/themes/soundPalettes.ts`

**Requirements**:
```typescript
export const soundPalettes = {
  ascii: {
    ambient: 'low-hum',
    interact: 'type-click',
    success: 'beep-up',
    error: 'beep-down',
    focus: 'click-soft',
  },
  xp: {
    ambient: 'soft-pad',
    interact: 'pop',
    success: 'chime-up',
    error: 'error-pop',
    focus: 'bubble',
  },
  aqua: {
    ambient: 'wave-pad',
    interact: 'ping',
    success: 'sonar-ping',
    error: 'warning-tone',
    focus: 'ripple',
  },
  daw: {
    ambient: 'click-loop',
    interact: 'tock',
    success: 'punch-in',
    error: 'off-beat',
    focus: 'click-sharp',
  },
  analogue: {
    ambient: 'tape-hiss',
    interact: 'paper-tap',
    success: 'tape-start',
    error: 'tape-jam',
    focus: 'pencil-tap',
  },
}
```

**Integration**:
- Update `useStudioSound()` hook to load theme-specific sounds
- Web Audio API procedural generation (no audio files needed)
- Sound profiles defined in existing theme configs

### 4. Experience Composer - Tone System

**To Create**: `apps/aud-web/src/components/themes/toneSystem.ts`

**Requirements**:
```typescript
export const toneSystem = {
  ascii: {
    confirm: 'executed.',
    error: 'syntax error.',
    loading: 'processing...',
    complete: 'done.',
    empty: 'no data.',
  },
  xp: {
    confirm: 'done!',
    error: 'oops…',
    loading: 'working on it...',
    complete: 'all done!',
    empty: 'nothing here yet',
  },
  aqua: {
    confirm: 'all clear.',
    error: 'distorted signal.',
    loading: 'rendering...',
    complete: 'rendered.',
    empty: 'signal lost.',
  },
  daw: {
    confirm: 'track armed.',
    error: 'off-beat.',
    loading: 'buffering...',
    complete: 'exported.',
    empty: 'silence.',
  },
  analogue: {
    confirm: 'recorded.',
    error: 'jammed tape.',
    loading: 'warming up...',
    complete: 'pressed.',
    empty: 'blank reel.',
  },
}
```

**Integration**:
- Inject into notification system
- Replace generic messages with theme-specific tone
- Apply in Console feedback (Plan/Do/Track/Learn modes)

### 5. Realtime Engineer - Adaptive Logic Triggers

**To Create**: `apps/aud-web/src/components/themes/adaptiveLogic.ts`

**Requirements**:
```typescript
export interface AdaptiveState {
  activityIntensity: 'low' | 'medium' | 'high'
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  dataVolume: number
}

export function getAdaptiveAdjustments(state: AdaptiveState) {
  // High activity → boost accent brightness + faster motion
  // Low activity → dim accent + slow ambient sound
  // Night mode (after 20:00) → suggest Analogue theme
}
```

**Integration**:
- Monitor `consoleStore.events` length for activity intensity
- Watch system time for time-of-day triggers
- Adjust palette brightness dynamically
- Suggest theme switches based on context

### 6. Visual Systems Designer - ThemeResolver Integration

**To Update**: `apps/aud-web/src/components/themes/ThemeResolver.tsx`

**Requirements**:
```typescript
export function resolveTheme(theme, intensity, time) {
  return {
    ...palettes[theme],
    motion: motionProfiles[theme],
    sound: soundPalettes[theme],
    tone: toneSystem[theme],
    adaptive: getAdaptiveAdjustments({ activityIntensity: intensity, timeOfDay: time })
  }
}
```

**Changes**:
- Import new palette, motion, sound, tone modules
- Merge into single theme object
- Apply adaptive adjustments
- Ensure hot-switching < 150ms
- Add theme preview in Command Palette

### 7. QA Coordinator - Performance Validation

**To Create**: `specs/ADAPTIVE_THEME_SPEC.md`

**Requirements**:
- Document all design tokens per theme
- Motion curves + timing charts
- Sound palette specifications
- Tone system examples
- Adaptive logic flowcharts
- Performance benchmarks:
  - Theme switch < 150ms
  - No layout shift
  - FPS >= 55 during transitions
  - AAA contrast ratios

---

## Implementation Plan (Remaining Work)

### Phase 1: Sound System (30 min)
1. Create `soundPalettes.ts` with Web Audio API profiles
2. Create `useStudioSound.ts` hook (if doesn't exist)
3. Integrate with theme switching

### Phase 2: Tone System (20 min)
1. Create `toneSystem.ts` with micro-copy variants
2. Update Console feedback points to use tone
3. Test all 5 themes for personality differences

### Phase 3: Adaptive Logic (40 min)
1. Create `adaptiveLogic.ts` with state monitoring
2. Connect to `consoleStore.events` for activity tracking
3. Implement time-of-day detection
4. Add brightness adjustment triggers
5. Test intensity changes in real-time

### Phase 4: ThemeResolver Integration (30 min)
1. Update `ThemeResolver.tsx` to merge all systems
2. Add `resolveTheme()` unified function
3. Test hot-switching between all themes
4. Measure transition performance

### Phase 5: Testing & Documentation (45 min)
1. Test theme switching via Command Palette
2. Validate AAA contrast ratios
3. Measure FPS during transitions
4. Create comprehensive `ADAPTIVE_THEME_SPEC.md`
5. Update `PERFORMANCE_REPORT.md` with Stage 7 metrics

---

## Files Structure

```
apps/aud-web/src/components/themes/
├── palettes.ts              ✅ Complete
├── motionProfiles.ts        ✅ Complete
├── soundPalettes.ts         ⏳ To Create
├── toneSystem.ts            ⏳ To Create
├── adaptiveLogic.ts         ⏳ To Create
├── ThemeResolver.tsx        ⏳ To Update
├── ascii.theme.ts           ✅ Exists (legacy)
├── xp.theme.ts              ✅ Exists (legacy)
├── aqua.theme.ts            ✅ Exists (legacy)
├── daw.theme.ts             ✅ Exists (legacy)
├── analogue.theme.ts        ✅ Exists (legacy)
└── types.ts                 ✅ Exists

apps/aud-web/src/hooks/
├── useStudioSound.ts        ⏳ To Create/Update

specs/
├── ADAPTIVE_THEME_SPEC.md   ⏳ To Create
└── PERFORMANCE_REPORT.md    ⏳ To Update
```

---

## Design Tokens Summary

### Color Palettes (✅ Complete)
| Theme | Primary BG | Accent | Text | Personality |
|-------|-----------|--------|------|-------------|
| ASCII | #0C0C0C | #3AE1C2 | #E5E7EB | Terminal minimalism |
| XP | #F2F6FF | #3870FF | #1B1E24 | Nostalgic brightness |
| Aqua | #0E151B | #00B3FF | #E2F2FF | Glass transparency |
| DAW | #121212 | #A076F9 | #F3F3F3 | Studio darkness |
| Analogue | #F6F1E8 | #C47E34 | #1E1C19 | Warm paper |

### Motion Profiles (✅ Complete)
| Theme | Duration | Easing | Personality |
|-------|----------|--------|-------------|
| ASCII | 120ms | linear | Instant snap |
| XP | 240ms | spring bounce | Playful overshoot |
| Aqua | 400ms | gentle spring | Fluid glass |
| DAW | 500ms | quantized steps | 120 BPM tempo |
| Analogue | 600ms | soft S-curve | Lazy drift |

### Sound Palettes (⏳ Pending)
| Theme | Ambient | Interact | Success | Error |
|-------|---------|----------|---------|-------|
| ASCII | Low hum | Type click | Beep up | Beep down |
| XP | Soft pad | Pop | Chime | Error pop |
| Aqua | Wave pad | Ping | Sonar | Warning |
| DAW | Click loop | Tock | Punch in | Off-beat |
| Analogue | Tape hiss | Paper tap | Tape start | Tape jam |

### Tone System (⏳ Pending)
| Theme | Confirm | Error | Loading | Complete |
|-------|---------|-------|---------|----------|
| ASCII | executed. | syntax error. | processing... | done. |
| XP | done! | oops… | working on it... | all done! |
| Aqua | all clear. | distorted signal. | rendering... | rendered. |
| DAW | track armed. | off-beat. | buffering... | exported. |
| Analogue | recorded. | jammed tape. | warming up... | pressed. |

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Theme Switch Time | < 150ms | No layout shift |
| FPS During Transition | >= 55 fps | Smooth animation |
| Color Contrast | AAA (7:1) | Accessibility |
| Memory Overhead | < 5MB | Minimal footprint |
| Sound Latency | < 50ms | Instant feedback |

---

## Next Steps

**Immediate**: Continue with Sound Director task (Task 3)
**Timeline**: ~2.5 hours remaining for full Stage 7 completion
**Blocker**: None - all dependencies in place

**After Stage 7 Complete**:
- Stage 8: Comprehensive testing + Performance Report update
- Final demo: Theme switching via Command Palette
- Capture baseline screenshots for all 5 themes

---

**Progress**: 2/7 tasks complete (28%)
**Estimated Completion**: 2.5 hours
**Ready for Handoff**: Partially - Core systems in place
