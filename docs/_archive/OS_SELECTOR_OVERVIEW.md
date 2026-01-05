# OS Selector Scene Overview

## Introduction

The **OS Selector** is the first interactive experience users encounter when entering TotalAud.io. It allows them to "boot into" their preferred creative environment, setting the aesthetic tone for their entire workflow.

> **Philosophy**: "Choose your creative OS — each one changes how TotalAud.io looks, sounds, and feels."

## Route

**URL**: `/onboarding/os-selector`

**Purpose**: First-time user onboarding to select UI theme

**Redirect Logic**:
- If `ui_mode` already exists in localStorage → Redirect to `/` (homepage)
- After selection → Save to localStorage + Supabase → Redirect to `/`

## Available Themes

### 1. ASCII Terminal
**For those who mix code and caffeine**

```
┌────────────────────────────┐
│ TOTALAUD.IO // ASCII MODE  │
└────────────────────────────┘
```

**Visual Style:**
- Monospace typography (JetBrains Mono)
- Green phosphor glow (`#00ff00`)
- CRT scanline effects
- Terminal noise texture overlay

**Audio:**
- Boot: Beep sequence (400Hz → 600Hz → 800Hz)
- Ambient: Soft keyboard typing loop
- Click: Mechanical key sound

**Effects:**
- Scanlines: ✅
- Noise overlay: ✅
- Cursor blink animation

**Best For:** Developers, technical users, command-line enthusiasts

---

### 2. Windows XP Studio
**Nostalgic productivity at its finest**

**Visual Style:**
- Soft blue gradients (`#0078d7`, `#69b3f7`)
- Rounded corners and glossy surfaces
- Segoe UI / Tahoma fonts
- Luna theme-inspired palette

**Audio:**
- Boot: XP startup chime remix
- Click: Classic XP button sound

**Effects:**
- Plastic gloss texture
- GUI reflections
- Glow effects on hover

**Easter Egg:** Loading bar says "Loading VSTs..."

**Best For:** Users who love 2000s nostalgia, FL Studio vibes

---

### 3. Mac OS Retro (2001 Aqua)
**When design was an art form**

**Visual Style:**
- Aqua blue (`#4a90e2`) + silver (`#e8e8e8`)
- Lucida Grande typography
- Brushed metal textures
- Translucent elements with reflections

**Audio:**
- Boot: Classic Mac startup chime
- Ambient: Vinyl record hiss
- Click: Aqua "pop" sound

**Effects:**
- Brushed aluminum texture
- Water/glass reflections
- Soft glow on interactive elements

**Best For:** Design-focused users, Apple enthusiasts, Logic Pro users

---

### 4. Ableton Mode
**Flow like a DAW**

**Visual Style:**
- Flat dark interface (`#1a1a1a`)
- Orange/yellow accents (`#ff764d`, `#ffb84d`)
- Minimal, functional typography (Inter)
- Paper noise texture

**Audio:**
- Boot: Sequencer start click
- Ambient: Soft synthesizer pad
- Click: Clip trigger sound

**Effects:**
- Subtle paper grain
- Waveform patterns in background
- Clean, no-nonsense design

**Tagline:** "Arrange. Produce. Promote."

**Best For:** Electronic producers, beat makers, Ableton users

---

### 5. Punk Zine Mode
**Cut. Paste. Shout.**

**Visual Style:**
- High contrast black + neon magenta (`#ff00ff`)
- Condensed grotesk/stencil fonts
- Xerox grit and torn paper textures
- Halftone print effects

**Audio:**
- Boot: Tape deck start
- Ambient: Cassette tape hiss
- Click: Rubber stamp press

**Effects:**
- Photocopier grain
- Torn paper edges
- Halftone dot patterns
- Animated sticker hover (⚡)

**Tagline:** "No rules. All attitude."

**Best For:** Punk/DIY artists, zine makers, experimental musicians

---

## Technical Architecture

### File Structure

```
apps/aud-web/
├── src/
│   ├── types/
│   │   └── themes.ts               # Theme definitions & configs
│   ├── contexts/
│   │   └── ThemeContext.tsx        # Global theme state
│   ├── components/
│   │   └── OSCard.tsx              # Individual theme card
│   ├── hooks/
│   │   └── useUISound.ts           # Extended with theme sounds
│   └── app/
│       └── onboarding/
│           └── os-selector/
│               └── page.tsx        # Main selector scene
└── public/
    ├── textures/
    │   ├── crt-scanlines.png
    │   ├── plastic-gloss.png
    │   ├── brushed-metal.png
    │   ├── paper-noise.png
    │   └── xerox-grit.png
    └── sounds/
        ├── ascii/
        │   ├── beep-sequence.mp3
        │   ├── typing-soft.mp3
        │   └── mechanical-key.mp3
        ├── xp/
        │   ├── xp-startup.mp3
        │   └── xp-click.mp3
        ├── aqua/
        │   ├── mac-chime.mp3
        │   ├── vinyl-hiss.mp3
        │   └── aqua-pop.mp3
        ├── ableton/
        │   ├── sequencer-start.mp3
        │   ├── synth-pad.mp3
        │   └── clip-trigger.mp3
        └── punk/
            ├── tape-start.mp3
            ├── tape-hiss.mp3
            └── stamp-press.mp3
```

### Theme Configuration Schema

```typescript
interface ThemeConfig {
  id: OSTheme
  name: string
  displayName: string
  description: string
  tagline: string
  
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    border: string
  }
  
  fontFamily: string
  
  textures: {
    overlay: string      // Full-screen effect
    pattern?: string     // Tiled background
  }
  
  sounds: {
    boot: string        // Entry sound
    ambient?: string    // Background loop
    click: string       // Interaction sound
  }
  
  effects?: {
    scanlines?: boolean
    reflections?: boolean
    noise?: boolean
    halftone?: boolean
    glow?: boolean
  }
}
```

### Texture Loading

**Automatic Detection:**
```typescript
const textureUrl = `/textures/${theme.textures.overlay}.png`
```

**Fallback Logic:**
1. Try to load from `/public/textures/[name].png`
2. If 404, fall back to CSS-generated texture
3. Continue without texture if CSS fails

**Format Requirements:**
- PNG with alpha channel
- 1920x1080 for overlays
- 256x256 for patterns (tiled)
- Optimized < 500KB per file

### Audio System

**Web Audio API Integration:**
```typescript
const sound = useUISound()

// Theme-specific sounds
await sound.boot(theme.id)           // Play boot sound
await sound.themeClick(theme.id)     // Play click sound
await sound.playAmbient(theme.id)    // Start ambient loop
```

**Caching:**
- All sounds loaded into `AudioBuffer` cache
- Prevents re-downloading on subsequent plays
- Graceful fallback to synthetic tones if files missing

**Volume Control:**
- Default: 30% (0.3)
- User adjustable via ThemeToggle
- Saved to localStorage

---

## User Flow

### Step 1: Initial Load
```
User visits → Check localStorage for ui_mode
├── Found → Redirect to homepage with theme applied
└── Not found → Show OS Selector
```

### Step 2: Theme Selection
```
User hovers card → Play preview sound
User clicks card → Set selectedTheme state
                 → Play boot sound
                 → Show loading screen with progress bar
```

### Step 3: Loading Animation
```
0-20%  → "Loading textures..."
20-50% → "Initializing audio system..."
50-80% → "Applying theme configuration..."
80-100% → Save to localStorage + Supabase
         → Redirect to homepage
```

### Step 4: Theme Application
```
ThemeProvider loads → Apply CSS variables
                    → Set data-os-theme attribute
                    → Apply global styles
```

---

## Persistence Strategy

### LocalStorage
```typescript
localStorage.setItem("ui_mode", themeId)
// Fast, immediate access, survives page reload
```

### Supabase (Future)
```sql
UPDATE user_profiles
SET ui_mode = 'ascii'
WHERE id = auth.uid()
```
- Cross-device synchronization
- Backup for localStorage
- Analytics and preferences

---

## Customization Guide

### Adding a New Theme

**1. Define Theme Config**
```typescript
// In src/types/themes.ts
export const THEME_CONFIGS: Record<OSTheme, ThemeConfig> = {
  // ... existing themes
  newtheme: {
    id: 'newtheme',
    name: 'New Theme',
    displayName: 'NEW THEME MODE',
    description: 'Your description here',
    tagline: 'Your tagline',
    colors: {
      primary: '#hexcolor',
      // ...
    },
    // ... rest of config
  }
}
```

**2. Add Textures**
```bash
/public/textures/newtheme-overlay.png
/public/textures/newtheme-pattern.png
```

**3. Add Sounds**
```bash
/public/sounds/newtheme/boot.mp3
/public/sounds/newtheme/ambient.mp3
/public/sounds/newtheme/click.mp3
```

**4. Update Type Union**
```typescript
export type OSTheme = 'ascii' | 'xp' | 'aqua' | 'ableton' | 'punk' | 'newtheme'
```

**5. Test**
```bash
pnpm dev
# Visit http://localhost:3000/onboarding/os-selector
# Select your new theme
```

---

## Accessibility

### Keyboard Navigation
- All cards keyboard accessible
- `Tab` to navigate between cards
- `Enter`/`Space` to select
- `Escape` to cancel (future)

### Screen Readers
- Card descriptions read aloud
- Loading progress announced
- Status updates via `aria-live`

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast
- All themes meet WCAG 2.1 Level AA
- High contrast mode available (future)

---

## Performance Optimization

### Texture Loading
- Lazy load textures (only for visible cards)
- WebP format with PNG fallback
- CDN delivery for production
- Compression < 500KB per texture

### Audio Preloading
```typescript
await sound.preloadThemeSounds(theme.id)
// Preload on hover to reduce click-to-play latency
```

### Code Splitting
```typescript
// OS Selector page is code-split from main bundle
import dynamic from 'next/dynamic'
const OSSelectorPage = dynamic(() => import('./page'))
```

---

## Analytics (Future)

Track theme selection:
```typescript
{
  event: 'theme_selected',
  theme_id: 'ascii',
  timestamp: Date.now(),
  user_id: userId,
  session_id: sessionId
}
```

**Insights:**
- Most popular theme
- Theme correlations with user behavior
- A/B test new themes

---

## Future Enhancements

### 1. Custom Theme Builder
Allow users to create their own themes:
- Color picker for each element
- Upload custom textures
- Record custom sounds
- Save as preset

### 2. Time-Based Themes
Auto-switch themes based on time of day:
- Morning: Aqua (light, clean)
- Afternoon: Ableton (focus)
- Evening: ASCII (low light)
- Night: Punk (high energy)

### 3. Genre-Specific Presets
Themes tailored to music genres:
- `techno` → Ableton Mode with darker colors
- `indie` → Aqua Mode with warmer tones
- `punk` → Punk Zine (obviously)
- `electronic` → ASCII Terminal

### 4. AI-Generated Themes
Let AI suggest themes based on:
- Album artwork colors
- Music genre
- Time of day
- User's creative mood

### 5. Collaborative Themes
Share custom themes with other users:
- Theme marketplace
- Community voting
- Featured themes of the month

---

## Troubleshooting

### Textures Not Loading
```
Problem: Blank or missing texture overlay
Solution:
1. Check /public/textures/ directory
2. Verify file naming matches theme.textures.overlay
3. Check browser console for 404 errors
4. Fallback CSS texture should still apply
```

### Sounds Not Playing
```
Problem: Silent UI, no audio feedback
Solution:
1. Check sound enabled in settings (default: OFF)
2. Verify /public/sounds/ directory structure
3. Check browser console for audio errors
4. Synthetic fallback tones should play automatically
```

### Theme Not Persisting
```
Problem: Theme resets on page reload
Solution:
1. Check localStorage for 'ui_mode' key
2. Verify ThemeProvider is wrapping app
3. Check browser privacy settings (localStorage enabled?)
```

### Wrong Theme Applied
```
Problem: Selected theme doesn't match UI
Solution:
1. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear localStorage: localStorage.clear()
3. Revisit /onboarding/os-selector
```

---

## Credits

**Inspiration:**
- Windows XP Luna theme
- macOS Aqua (2001-2007)
- Ableton Live 11 interface
- Punk zine aesthetics (Raymond Pettibon, Jamie Reid)
- VT100 terminal emulators

**Fonts:**
- Inter by Rasmus Andersson
- JetBrains Mono by JetBrains

**Textures:**
- Generated using CSS + SVG filters
- User-supplied assets welcome

**Sounds:**
- Synthetic tones via Web Audio API
- User-supplied audio files welcome

---

**Version**: 1.0.0  
**Last Updated**: January 18, 2025  
**Status**: ✅ Complete

**Related Documentation:**
- [VISUAL_IDENTITY_LAYER.md](./VISUAL_IDENTITY_LAYER.md)
- [MULTI_AGENT_COLLAB.md](./MULTI_AGENT_COLLAB.md)
- [FLOW_CANVAS_OVERVIEW.md](./FLOW_CANVAS_OVERVIEW.md)

