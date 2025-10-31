# Phase 13.0 – FlowCore Studio Aesthetics (In Progress)

**Status**: 🔄 Foundation Complete - UX Polish Remaining
**Date Started**: October 31, 2025
**Branch**: `feature/phase-13-0-flowcore-studio-aesthetics`

---

## 🎯 Objective

Convert the five themes from colour presets into cinematic studio personas that feel purposeful, tactile, and valuable — while fixing key UX gaps in the console.

---

## ✅ Completed (Foundation Layer)

### 1. Atmosphere System ✅
**Created**: Complete environmental and sensory characteristics for each theme

**Files Created**:
- `apps/aud-web/src/design/core/themes/atmospheres/types.ts` - Atmosphere type definitions
- `apps/aud-web/src/design/core/themes/atmospheres/operator.atmosphere.ts` - Operator theme atmosphere
- `apps/aud-web/src/design/core/themes/atmospheres/guide.atmosphere.ts` - Guide theme atmosphere
- `apps/aud-web/src/design/core/themes/atmospheres/map.atmosphere.ts` - Map theme atmosphere
- `apps/aud-web/src/design/core/themes/atmospheres/timeline.atmosphere.ts` - Timeline theme atmosphere
- `apps/aud-web/src/design/core/themes/atmospheres/tape.atmosphere.ts` - Tape theme atmosphere
- `apps/aud-web/src/design/core/themes/atmospheres/index.ts` - Atmosphere registry

**Features**:
- Background gradients (radial/linear with animation support)
- Grain overlays (scanline, paper, grid, ruler, film)
- Depth system (shadows, glows, parallax)
- Motion signatures (fast-linear, smooth, snappy, elastic, slow-spring)
- Soundscape keys (ambient, UI click, hover)
- Typography tweaks (family, weight, tracking)
- Microcopy tone (terse, friendly, strategic, rhythmic, reflective)

**Integration**:
- Added `atmosphere: Atmosphere` property to `ThemePersonality` interface
- Updated all 5 theme definitions in `themes.ts` with `atmosphere: getAtmosphere(themeId)`
- Extended `useFlowTheme()` hook to expose `atmosphere` property

### 2. Colour Harmony - Ice Cyan ✅
**Updated**: `apps/aud-web/src/tokens/colors.ts`

**Changes**:
- Replaced success colour from `#63C69C` (mint green) to `#89DFF3` (Ice Cyan)
- Added `successCyan: '#89DFF3'` alias for clarity
- Harmonizes with Slate Cyan (`#3AA9BE`) brand colour
- Map theme green (`#7DD87D`) retained as intentional personality accent

### 3. Ambient Soundscapes Infrastructure ✅
**Created**: Web Audio API player with cross-fade support

**Files Created**:
- `apps/aud-web/src/design/core/sounds/ambient.ts` - AmbientPlayer class
- `apps/aud-web/public/assets/sound/ambient/README.md` - Audio specifications

**Features**:
- Per-theme ambient audio configurations (operator, guide, map, timeline, tape)
- Seamless looping with 600-800ms cross-fades
- Respects `prefers-reduced-motion` (auto-disable)
- Global mute toggle support (⌘M)
- Preloads all audio buffers on init
- Singleton pattern for app-wide usage

**Audio Specs** (to be created by audio designer):
- **operator.ogg**: 8s square wave loop, -20 LUFS (terminal atmosphere)
- **guide.ogg**: 12s soft sine pad, -18 LUFS (warm studio)
- **map.ogg**: 10s triangle sonar, -22 LUFS (strategic precision)
- **timeline.ogg**: 4s sawtooth at 120 BPM, -19 LUFS (rhythmic pulse)
- **tape.ogg**: 16s warm sine with vinyl crackle, -20 LUFS (nostalgic warmth)

### 4. Theme Personality Microcopy ✅
**Created**: `apps/aud-web/src/design/core/themes/tone.ts`

**Tone Variations** (all lower-case):
- **Operator**: `{ confirm: 'confirmed.', hint: 'ready.' }` (terse)
- **Guide**: `{ confirm: 'all set.', hint: 'try this.' }` (friendly)
- **Map**: `{ confirm: 'locked in.', hint: 'next step.' }` (strategic)
- **Timeline**: `{ confirm: 'in sync.', hint: 'cue set.' }` (rhythmic)
- **Tape**: `{ confirm: 'noted.', hint: 'replay that.' }` (reflective)

**Usage**: Toasts, hints, inline feedback

---

## 🚧 Remaining Work (UX Polish)

### Priority 1: Console UX Fixes

#### A. Dynamic Studio Switch Animation
**Status**: ⏳ Not Started
**Files to Modify**:
- `apps/aud-web/src/layouts/ConsoleLayout.tsx` (or ConsoleDashboard.tsx)

**Requirements**:
- 600-800ms ambient lighting crossfade (radial gradient overlay)
- Cross-fade ambient audio loop (using AmbientPlayer)
- 120-240ms panel Z-depth breathe (scale 1.0 → 1.01 → 1.0)
- Use `flowCore.motion.transitions.smooth` for easing
- All values tokenised

#### B. Command Palette Restyle
**Status**: ⏳ Not Started
**File**: `apps/aud-web/src/components/command/CommandPalette.tsx`

**Requirements**:
- Backdrop blur + panel border from FlowCore textures
- Per-theme accent line (2px) on left edge
- Typography tweak from `personality.atmosphere.typographyTweak`
- Empty state helper: "click anywhere on the canvas to place this node"
- Subtle chevron arrow pointing to canvas area

#### C. Canvas Placement Affordance
**Status**: ⏳ Not Started
**File**: `apps/aud-web/src/components/features/flow/FlowCanvas.tsx`

**Requirements**:
- Ghost node follows cursor within canvas bounds
- Cyan crosshair indicator
- Left-click places node
- Esc cancels placement
- One-time tooltip: "click to place on canvas — press esc to cancel"

#### D. Tabs Behaviour Fix (Plan/Do/Track/Learn)
**Status**: ⏳ Not Started
**Files**: `apps/aud-web/src/components/features/workspace/*Tab.tsx`

**Requirements**:
- All tabs use `CampaignContext.activeCampaign`
- **Plan**: create/list campaigns + quick actions
- **Do**: workflows tied to active campaign
- **Track**: metrics table from `agent_results` (fallback sample if empty)
- **Learn**: latest insight result (with "regenerate" button)

#### E. Save & Share Buttons
**Status**: ⏳ Not Started
**File**: `apps/aud-web/src/layouts/ConsoleLayout.tsx`

**Requirements**:
- **Share**: Open modal with scene export, copy link to clipboard
- **Save**: Persist canvas scene (active campaign ID + timestamp)
- Both show toast with theme-appropriate microcopy (using `themeTone`)

### Priority 2: Developer Experience

#### F. Theme Developer Playground Enhancement
**Status**: ⏳ Not Started
**File**: `apps/aud-web/src/app/dev/theme/page.tsx`

**Requirements**:
- Ambient toggle (play/pause per theme)
- Live switch crossfade showcase
- Ghost placement demo (mini canvas)
- Display motion timings per theme
- Ambient changeover visualization

### Priority 3: Accessibility & Performance

#### G. Accessibility Guards
**Status**: ⏳ Not Started

**Requirements**:
- All overlays ≤ 6% opacity cumulative
- Text contrast meets WCAG AA minimum
- Disable ambient + heavy motion if `prefers-reduced-motion: reduce`
- All canvas animations use `requestAnimationFrame`
- Target: 60 FPS (bail to 30 FPS if tab not focused via Visibility API)

---

## 📊 Foundation Metrics

**Lines of Code Created**: ~850
**Files Created**: 9
**Files Modified**: 3

**Code Breakdown**:
- Atmosphere system: ~400 lines
- Ambient player: ~240 lines
- Theme tone: ~70 lines
- Integration updates: ~140 lines

---

## ⚠️ Known Issues

1. **Texture Assets Missing**: Atmosphere grain overlays reference SVG/JPG files that need creation:
   - `/assets/textures/scanline-grain.svg`
   - `/assets/textures/paper-grain.svg`
   - `/assets/textures/grid-overlay.svg`
   - `/assets/textures/ruler-marks.svg`
   - `/assets/textures/film-grain.jpg`

2. **Audio Files Missing**: Ambient .ogg files need professional audio production (see `/public/assets/sound/ambient/README.md`)

3. **Runtime Error**: Fast Refresh warning in dev server (likely due to missing texture assets)

---

## 🎓 Design Philosophy Achievements

### Atmosphere System
- **Environmental Depth**: Each theme now has background gradients, grain overlays, shadow/glow systems
- **Sensory Cohesion**: Motion signatures paired with soundscape keys create unified experiences
- **Personality Voice**: Microcopy tone system gives each theme a distinct communication style

### Ice Cyan Harmony
- **Visual Coherence**: Success states now complement Slate Cyan brand instead of competing with green
- **Agent Activity**: Ice Cyan (`#89DFF3`) used for positive indicators, badges, up-trending metrics

### Ambient Audio Architecture
- **Seamless Transitions**: 600-800ms cross-fades prevent jarring theme switches
- **Accessibility First**: Respects reduced motion preferences automatically
- **Performance**: Preloads all buffers, uses Web Audio API for efficient playback

---

## 📋 Next Session Checklist

When resuming Phase 13.0:

1. **Create missing texture assets** (or mock placeholder PNGs/SVGs)
2. **Implement studio switch animation** in ConsoleLayout
3. **Restyle Command Palette** with atmosphere styling
4. **Add canvas placement affordance** in FlowCanvas
5. **Fix tabs behaviour** (Plan/Do/Track/Learn integration)
6. **Wire Save & Share buttons** with toast feedback
7. **Enhance /dev/theme playground** for developer testing
8. **Run accessibility audit** (contrast, reduced motion, FPS)
9. **Run QA checklist** (14 items from Phase 13.0 spec)
10. **Create PHASE_13_0_COMPLETE.md** with before/after screenshots

---

## 🔗 Related Documentation

- **Phase 12.3.5 Complete**: [PHASE_12_3_5_COMPLETE.md](PHASE_12_3_5_COMPLETE.md) - Campaign title edit, Insight Panel hook
- **Phase 12.4**: Theme Fusion & FlowCore Personality Mapping (foundation for this phase)
- **FlowCore Design System**: [apps/aud-web/src/design/core/README.md](apps/aud-web/src/design/core/README.md)

---

**Estimated Completion**: 60% foundation complete, 40% UX polish remaining

**Next Priority**: Create placeholder texture assets → Implement studio switch animation → Polish Command Palette UX
