# ASCII OS Theme Documentation

**Phase 19 - Creative OS Surfaces**  
**Theme:** ASCII Terminal  
**Route:** `/os/ascii`  
**Status:** ✅ Complete

---

## Overview

The ASCII OS theme is a terminal-inspired creative workspace that channels the aesthetic of 1980s hacker workstations with modern usability. It features a low-fi, monochromatic design with terminal green accent colors, scanline effects, and subtle noise textures.

---

## Visual Design

### Color Palette
- **Background:** `#0F1113` (Matte black)
- **Foreground:** `#00ff99` (Terminal green)
- **Accent:** `#1affb2` (Bright cyan-green)
- **Secondary:** `#00cc77` (Muted green)
- **Border:** `#00ff9933` (Transparent green)
- **Error:** `#ff0066` (Hot pink)

### Typography
- **Font Family:** JetBrains Mono, Courier New, monospace
- **Style:** Monospace throughout
- **Weight:** 400 (body), 700 (headings)
- **Line Height:** 1.5

### Effects
- **Scanlines:** Horizontal lines overlay (4px repeat, 15% opacity)
- **Noise Texture:** Dark noise pattern (15% opacity, overlay blend)
- **Glow:** Text shadow on interactive elements (0 0 8px rgba(0, 255, 153, 0.6))
- **Vignette:** None
- **Grain:** None

---

## Component Architecture

### 1. AsciiOSContainer
**Purpose:** Full-screen container with background effects and layout structure

**Features:**
- Matte black background (#0F1113)
- Scanline texture overlay
- Noise texture overlay
- Fade-in entrance animation
- Boot sequence with delay
- Header with system info
- Two-column layout (main + sidebar)
- Command bar at bottom

**Props:** None (root container)

**Key Interactions:**
- Plays click sound on boot
- Respects reduced motion preferences
- Provides theme context to children

---

### 2. AsciiWindow
**Purpose:** Terminal-style window with monospace borders and title bar

**Features:**
- Box-drawing character borders (╔╗╚╝)
- Title in center of top border
- Minimize (▬) and Close (×) buttons
- Hover glow effect
- Fade-in + slide-up animation

**Props:**
```typescript
{
  title: string
  children: React.ReactNode
  className?: string
}
```

**Key Interactions:**
- Hover triggers glow effect
- Click minimize/close plays sound
- Window appears with subtle animation

---

### 3. AsciiCommandBar
**Purpose:** Bottom command prompt with blinking cursor

**Features:**
- Terminal prompt symbol (>)
- Text input with transparent background
- Blinking cursor when focused
- Status indicator (READY)
- Sound feedback on keypress

**Props:** None

**Key Interactions:**
- Keypress plays click sound
- Enter key triggers command handler
- Success sound on command execution
- Focus shows blinking cursor

**Command System:**
Currently logs to console, extensible for:
- Theme switching
- System commands
- Workflow shortcuts
- Settings changes

---

### 4. AsciiCursor
**Purpose:** Blinking terminal cursor animation

**Features:**
- Underscore character (_)
- Smooth blink animation (0.5s cycle)
- Respects reduced motion

**Props:** None

**Animation:**
- Opacity: 1 → 0 → 1
- Duration: 500ms per cycle
- Easing: easeInOut
- Infinite repeat

---

### 5. AsciiButton
**Purpose:** Terminal-style button with bracket styling

**Features:**
- Bracket appearance: `[ BUTTON ]`
- Primary and secondary variants
- Hover glow effect
- Click scale animation
- Sound feedback

**Props:**
```typescript
{
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  className?: string
}
```

**Variants:**
- **Primary:** Bright green (#00ff99)
- **Secondary:** Muted green (#00ff9966)

**Key Interactions:**
- Hover: Scale 1.02, glow effect, color brightens
- Click: Scale 0.98, plays click sound
- Disabled: 50% opacity, no interactions

---

### 6. AsciiToggle
**Purpose:** Terminal-style ON/OFF toggle switch

**Features:**
- Bracket appearance: `[ ON ]` or `[ OFF ]`
- Label text
- Glow when ON
- Click animation

**Props:**
```typescript
{
  label: string
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}
```

**Key Interactions:**
- Click toggles state
- Plays click sound
- Glow effect when ON
- Scale animation on interaction

---

## Sound Design

All sounds are synthesized via the theme engine's Web Audio API system.

### Click Sound
- **Waveform:** Sine
- **Frequency:** 1200 Hz
- **Duration:** 50ms
- **Envelope:** Attack 1ms, Decay 20ms, Release 10ms
- **Use:** Button clicks, keypress feedback

### Success Sound
- **Waveform:** Sine
- **Frequency:** 660 Hz
- **Duration:** 200ms
- **Envelope:** Attack 10ms, Decay 100ms, Sustain 0.1, Release 100ms
- **Use:** Command execution, task completion

### Boot Sound
- **Waveform:** Square
- **Frequency:** 880 Hz
- **Duration:** 150ms
- **Use:** OS entrance, system start

---

## Motion & Animation

All animations respect `prefers-reduced-motion` settings.

### Container Entrance
- **Type:** Fade in
- **Duration:** 800ms (0ms if reduced motion)
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1)

### Window Appearance
- **Type:** Fade + slide up
- **Duration:** 400ms (0ms if reduced motion)
- **Distance:** 20px vertical
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1)

### Cursor Blink
- **Type:** Opacity toggle
- **Duration:** 500ms per cycle
- **Easing:** easeInOut
- **Behavior:** Infinite, reversing
- **Reduced Motion:** Static (no blink)

### Button/Toggle Interactions
- **Hover Scale:** 1.02 (disabled if reduced motion)
- **Click Scale:** 0.98 (disabled if reduced motion)
- **Duration:** 200ms
- **Easing:** Default

---

## Visual Metaphor

**Concept:** 1980s terminal computing meets modern dark mode

**Inspiration:**
- Early UNIX terminals
- Hacker/coder workspaces
- Green phosphor CRT monitors
- Command-line interfaces
- Low-fi aesthetic

**User Experience:**
- Focus on text and data
- Minimal distractions
- Clean, grid-aligned layout
- Everything is precise and intentional
- Nostalgic yet modern

---

## Use Cases

1. **Focused Writing Sessions**
   - Command bar for quick inputs
   - Minimal visual noise
   - Distraction-free environment

2. **Code/Technical Work**
   - Familiar terminal aesthetic
   - Monospace typography
   - Clean data display

3. **System Monitoring**
   - Status panel for real-time info
   - Process list display
   - CPU/Memory metrics

4. **Creative Flow Sessions**
   - Low-stimulation environment
   - Terminal-style prompts
   - Clean workspace

---

## Technical Implementation

### Dependencies
- `framer-motion` - Animations and gestures
- `@total-audio/core-theme-engine` - Theme context and colors
- `useThemeAudio` - Sound synthesis
- `useReducedMotion` - Accessibility support

### File Structure
```txt
/apps/aud-web/src/
  app/os/ascii/
    page.tsx              # Route definition
  components/os/ascii/
    AsciiOSContainer.tsx  # Main container
    AsciiWindow.tsx       # Window component
    AsciiCommandBar.tsx   # Command prompt
    AsciiCursor.tsx       # Blinking cursor
    AsciiButton.tsx       # Button widget
    AsciiToggle.tsx       # Toggle widget
    index.ts              # Exports
```

### Integration Points
- **Theme Engine:** Uses ASCII theme colors and typography from `@total-audio/core-theme-engine`
- **Audio System:** Integrates `useThemeAudio` hook for sound feedback
- **Motion System:** Uses Framer Motion with reduced motion checks
- **Layout:** Server Component route with Client Component UI

---

## Accessibility

✅ **Reduced Motion Support**
- All animations disabled when `prefers-reduced-motion` is set
- Cursor becomes static instead of blinking
- No scale/transform animations

✅ **Keyboard Navigation**
- Command bar is keyboard-accessible
- Enter key triggers commands
- Focus states clearly visible

✅ **Screen Reader Support**
- Semantic HTML structure
- ARIA labels on icon buttons
- Descriptive button text

✅ **Color Contrast**
- Terminal green (#00ff99) on black (#0F1113) exceeds WCAG AAA
- All text meets contrast requirements
- Focus indicators clearly visible

---

## Future Enhancements

### Potential Additions
1. **Multiple Windows**
   - Draggable window positioning
   - Z-index management
   - Window minimize/restore

2. **Command System**
   - Built-in commands (help, clear, theme, etc.)
   - History navigation (up/down arrows)
   - Auto-complete suggestions

3. **Status Panel**
   - Real-time CPU/Memory from API
   - Active agent list
   - Network status

4. **Terminal Emulator Mode**
   - Full shell emulation
   - File system navigation
   - Script execution

5. **Customization**
   - Color scheme variants
   - Font size adjustments
   - Scanline intensity control

---

## Notes

- **Performance:** All textures are static PNGs, no runtime generation
- **Bundle Size:** Minimal overhead, uses existing theme system
- **Browser Support:** Modern browsers with CSS Grid and Framer Motion support
- **Mobile:** Designed for desktop first, touch-friendly buttons
- **Testing:** Manual testing completed, no automated tests yet

---

**Created:** 2026-01-15  
**Last Updated:** 2026-01-15  
**Author:** Claude (Lead Creative OS Architect)  
**Phase:** 19 - Creative OS Surfaces

