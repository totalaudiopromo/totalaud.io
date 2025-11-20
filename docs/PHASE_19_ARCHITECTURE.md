# Phase 19 - Creative OS Architecture

**Overview:** How the Creative OS surfaces integrate with the existing TotalAud.io architecture

---

## Layout Hierarchy

```
/apps/aud-web/src/app/
│
├── layout.tsx                          [Root Layout]
│   └── <FlowCoreThemeProvider>         (CSS variables only)
│       └── {children}
│
├── console/
│   ├── layout.tsx
│   └── page.tsx                        (Main console)
│
└── os/                                 [OS ROUTES]
    ├── layout.tsx                      [OS Layout - NEW]
    │   └── <ThemeProvider>             (React context for useTheme)
    │       └── {children}
    │
    ├── ascii/
    │   └── page.tsx                    → AsciiOSContainer
    │
    ├── xp/                             (Coming soon)
    │   └── page.tsx
    │
    ├── aqua/                           (Coming soon)
    │   └── page.tsx
    │
    ├── daw/                            (Coming soon)
    │   └── page.tsx
    │
    └── analogue/                       (Coming soon)
        └── page.tsx
```

---

## Theme Provider Strategy

### Root Layout (`/app/layout.tsx`)
**Provider:** `FlowCoreThemeProvider`  
**Purpose:** Sets CSS variables for main app  
**Scope:** Entire application

**What it provides:**
- CSS custom properties (--fc-bg, --fc-fg, etc.)
- Legacy FlowCore tokens
- Reduced motion detection
- Global styles

**What it DOESN'T provide:**
- React context for `useTheme()` hook
- Theme switching functionality
- Theme manifests

### OS Layout (`/app/os/layout.tsx`)
**Provider:** `ThemeProvider` from `@total-audio/core-theme-engine`  
**Purpose:** React context for Creative OS surfaces  
**Scope:** All `/os/*` routes

**What it provides:**
- ✅ React context for `useTheme()` hook
- ✅ Access to full theme manifests
- ✅ Theme switching via `setTheme()`
- ✅ Current theme state
- ✅ All themes registry

---

## Why Two Providers?

### Separation of Concerns

1. **Main App** (Console, Dashboard, etc.)
   - Uses CSS variables from FlowCoreThemeProvider
   - No need for theme context
   - Lighter bundle size
   - Backward compatible

2. **Creative OS Surfaces** (/os/*)
   - Full theme engine integration
   - Dynamic theme access
   - Component-level theme awareness
   - Advanced theming features

### Benefits

- ✅ **Isolation:** OS surfaces don't affect main app
- ✅ **Performance:** Main app doesn't load theme context
- ✅ **Flexibility:** OS can use advanced theme features
- ✅ **Backwards Compatibility:** Existing code unchanged
- ✅ **Clean Separation:** Clear boundary between systems

---

## Using Themes in Components

### In Main App (Console, etc.)

Use CSS variables:

```typescript
// ❌ DON'T - useTheme not available
const { theme } = useTheme()

// ✅ DO - Use CSS variables
<div style={{ color: 'var(--fc-fg)' }}>Text</div>
<div className="text-[var(--fc-accent)]">Text</div>
```

### In OS Surfaces (/os/*)

Use `useTheme()` hook:

```typescript
// ✅ Available - ThemeProvider in layout
import { useTheme } from '@total-audio/core-theme-engine'

function Component() {
  const { theme, currentTheme, setTheme } = useTheme()
  
  return (
    <div style={{ 
      backgroundColor: theme.palette.background,
      color: theme.palette.foreground 
    }}>
      Current: {currentTheme}
    </div>
  )
}
```

---

## Component Integration

### OS Components Structure

```
/components/os/
├── ascii/
│   ├── AsciiOSContainer.tsx    ← Uses useTheme()
│   ├── AsciiWindow.tsx         ← Uses useTheme()
│   ├── AsciiButton.tsx         ← Uses useThemeAudio()
│   └── ...
│
├── xp/                         (Coming soon)
├── aqua/                       (Coming soon)
├── daw/                        (Coming soon)
└── analogue/                   (Coming soon)
```

### Shared Hooks

All OS components can use:

```typescript
// Theme context (from OS layout)
import { useTheme } from '@total-audio/core-theme-engine'
const { theme, currentTheme, setTheme, cycleTheme } = useTheme()

// Audio synthesis
import { useThemeAudio } from '@/hooks/useThemeAudio'
const { play, playAgent, setVolume } = useThemeAudio()

// Motion detection
import { useReducedMotion } from 'framer-motion'
const prefersReducedMotion = useReducedMotion()
```

---

## Data Flow

### Theme Selection → Application

```
User selects theme
      ↓
ThemeProvider state updates
      ↓
useTheme() returns new theme
      ↓
Components re-render with new colors
      ↓
CSS variables updated
      ↓
localStorage persists choice
```

### Audio Playback

```
User interaction (click, keypress)
      ↓
Component calls play('click')
      ↓
useThemeAudio → audioEngine
      ↓
Theme-specific sound synthesized
      ↓
Web Audio API playback
```

### Motion Animation

```
Component mounts/interacts
      ↓
Framer Motion triggered
      ↓
useReducedMotion() check
      ↓
If reduced motion: duration = 0
If normal: full animation
```

---

## File Organization

### Routes
```
/app/os/[theme]/page.tsx
```
Each theme gets its own route.

### Components
```
/components/os/[theme]/
  - [Theme]OSContainer.tsx   (Main container)
  - [Theme]Window.tsx        (Panel/window system)
  - [Theme]CommandBar.tsx    (Interaction surface)
  - [Theme]Button.tsx        (Button widget)
  - [Theme]Toggle.tsx        (Toggle widget)
  - [Theme]Cursor.tsx        (Visual elements)
  - index.ts                 (Exports)
```

### Documentation
```
/docs/
  - [THEME]_OS_THEME.md           (Full specification)
  - [THEME]_OS_COMPONENT_TREE.md  (Visual hierarchy)
```

---

## Integration Points

### 1. Theme Engine Package
```
@total-audio/core-theme-engine
├── ThemeProvider (React context)
├── useTheme() hook
├── Theme registry (THEMES object)
├── Audio synthesis (sounds object)
└── Texture utilities
```

### 2. App-Level Hooks
```
/apps/aud-web/src/hooks/
└── useThemeAudio.ts    (Wrapper around theme-engine audio)
```

### 3. Framer Motion
```
npm: framer-motion
├── motion components
├── useReducedMotion()
├── AnimatePresence
└── Variants system
```

---

## Adding a New OS Theme

### Step 1: Create Route
```bash
/app/os/[theme-name]/page.tsx
```

### Step 2: Create Container
```bash
/components/os/[theme-name]/
  - [Theme]OSContainer.tsx
```

### Step 3: Create Components
```bash
- [Theme]Window.tsx
- [Theme]Button.tsx
- [Theme]Toggle.tsx
- etc.
```

### Step 4: Use Hooks
```typescript
import { useTheme } from '@total-audio/core-theme-engine'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import { useReducedMotion } from 'framer-motion'
```

### Step 5: Document
```bash
/docs/[THEME]_OS_THEME.md
```

---

## Key Decisions

### Why Client Components?

All OS surfaces use `'use client'` because:
- Need React hooks (useState, useEffect)
- Framer Motion requires client
- Theme context is client-side
- Audio playback requires browser APIs
- User interactions need event handlers

### Why Separate Layout?

OS layout is separate because:
- Isolates theme context from main app
- Reduces bundle size for main app
- Provides clean migration path
- Allows different provider strategies
- Clear architectural boundary

### Why Theme Engine Package?

Theme engine is a package because:
- Reusable across apps
- Testable in isolation
- Versioned independently
- Clear API boundary
- Shareable types

---

## Performance Considerations

### Bundle Size
- Main app: ~10KB (CSS variables only)
- OS surfaces: ~50KB (full theme context)
- Loaded on-demand per route

### Audio
- Synthesized sounds (no samples)
- Web Audio API (native)
- No external dependencies
- Respects mute settings

### Animations
- CSS-based where possible
- Framer Motion for complex
- GPU-accelerated transforms
- Reduced motion support

### Theme Switching
- Instant (CSS variables)
- Preload textures
- 300ms transition buffer
- localStorage caching

---

## Testing Strategy

### Unit Tests
- Component rendering
- Hook functionality
- Audio synthesis
- Theme switching

### Integration Tests
- Route navigation
- Theme context
- Audio playback
- Motion animations

### E2E Tests
- Full user flows
- Cross-browser
- Mobile devices
- Accessibility

---

## Future Enhancements

### Phase 19.1 - Multi-Window
- Draggable windows
- Z-index management
- Window state persistence
- Snap-to-grid

### Phase 19.2 - Command System
- Built-in commands
- History navigation
- Auto-complete
- Script execution

### Phase 19.3 - Customization
- Theme variants
- User preferences
- Custom shortcuts
- Saved layouts

---

**Architecture:** Layered, isolated, extensible  
**Strategy:** Progressive enhancement  
**Philosophy:** Separation of concerns  
**Goal:** 5 unique creative OS surfaces

