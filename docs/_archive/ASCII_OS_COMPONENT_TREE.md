# ASCII OS Component Tree

Visual hierarchy and structure of the ASCII OS theme components.

```text
/os/ascii (Route)
│
└─── <AsciiOSContainer>                          [Full-screen container]
     │
     ├─── Background Effects
     │    ├─── Noise Texture Overlay             (15% opacity)
     │    └─── Scanline Effect                   (15% opacity, 4px repeat)
     │
     ├─── Header
     │    ├─── System Info                       (SYSTEM v1.0.0)
     │    └─── Status Indicator                  (● ONLINE)
     │
     ├─── Main Workspace (Two-column layout)
     │    │
     │    ├─── Left Panel
     │    │    └─── <AsciiWindow title="WORKSPACE">
     │    │         ├─── Title Bar
     │    │         │    ├─── Border (╔═══╗)
     │    │         │    ├─── Title Text
     │    │         │    ├─── Minimize Button (▬)
     │    │         │    └─── Close Button (×)
     │    │         │
     │    │         └─── Content
     │    │              ├─── Welcome Text
     │    │              ├─── Description Text
     │    │              └─── Action Buttons
     │    │                   ├─── <AsciiButton variant="primary">
     │    │                   │    START SESSION
     │    │                   │    </AsciiButton>
     │    │                   │
     │    │                   └─── <AsciiButton variant="secondary">
     │    │                        SETTINGS
     │    │                        </AsciiButton>
     │    │
     │    └─── Right Sidebar
     │         └─── <AsciiWindow title="STATUS">
     │              ├─── Title Bar (same as above)
     │              └─── Content
     │                   ├─── CPU Metric
     │                   ├─── Memory Metric
     │                   ├─── Uptime Metric
     │                   └─── Process List
     │
     └─── Footer
          └─── <AsciiCommandBar>
               ├─── Prompt Symbol (>)
               ├─── Input Field
               ├─── <AsciiCursor /> (when focused)
               └─── Status (READY)
```

---

## Component Relationships

### Parent → Child
```
AsciiOSContainer
├── AsciiWindow (multiple instances)
│   └── AsciiButton (multiple instances)
│       └── Sound feedback (useThemeAudio)
│
└── AsciiCommandBar
    └── AsciiCursor
        └── Animation (Framer Motion)
```

### Shared Dependencies
```
All Components
├── useTheme() from @total-audio/core-theme-engine
├── useThemeAudio() from @/hooks/useThemeAudio
├── useReducedMotion() from framer-motion
└── Framer Motion for animations
```

---

## Component Size Reference

| Component | Lines | Complexity | Reusability |
|-----------|-------|------------|-------------|
| AsciiOSContainer | ~200 | High | Low (layout-specific) |
| AsciiWindow | ~100 | Medium | High (reusable panel) |
| AsciiCommandBar | ~80 | Medium | Medium (specific use) |
| AsciiButton | ~120 | Low | High (general widget) |
| AsciiToggle | ~80 | Low | High (general widget) |
| AsciiCursor | ~40 | Low | High (visual element) |

---

## Widget Gallery

### AsciiButton
```
Primary:   [ START SESSION ]
Secondary: [ SETTINGS ]
Disabled:  [ LOADING... ]  (50% opacity)
```

### AsciiToggle
```
ON State:   AUDIO [ ON ]   (glowing)
OFF State:  AUDIO [ OFF ]  (muted)
```

### AsciiWindow
```
╔════════════════════════════════════▬×╗
│                                      │
│  Window Content Goes Here            │
│                                      │
╚══════════════════════════════════════╝
```

### AsciiCommandBar
```
> enter command..._                READY
```

---

## State Management

### Local State (useState)
- **AsciiOSContainer:** `isBooted` (boot sequence)
- **AsciiWindow:** `isHovered` (glow effect)
- **AsciiCommandBar:** `input` (command text), `isFocused` (cursor visibility)

### Theme Context (useTheme)
- All components access theme colors, typography, and effects
- CSS variables applied to root element

### Audio Context (useThemeAudio)
- All interactive components play sound feedback
- Click, success, and error sounds available

---

## Animation Layers

### Layer 1: Container Entry
- Opacity: 0 → 1
- Duration: 800ms
- Timing: On mount

### Layer 2: Window Appearance
- Opacity: 0 → 1
- Transform: translateY(20px) → translateY(0)
- Duration: 400ms
- Timing: After boot

### Layer 3: Micro-interactions
- Button hover: scale(1.02)
- Button click: scale(0.98)
- Duration: 200ms
- Timing: On interaction

### Layer 4: Cursor Blink
- Opacity: 1 ↔ 0
- Duration: 500ms per cycle
- Timing: Infinite when focused

---

## Theme Integration

### Colors from Theme Engine
```typescript
theme.palette.background   → #000000
theme.palette.foreground   → #00ff99
theme.palette.accent       → #1affb2
theme.palette.border       → #00ff9933
```

### Typography from Theme Engine
```typescript
theme.typography.monoFamily → "JetBrains Mono", "Courier New", monospace
theme.typography.bodyWeight → 400
```

### Effects from Theme Engine
```typescript
theme.effects.scanlines → true
theme.effects.noise     → true
theme.effects.glow      → true
```

---

## Extensibility Points

### 1. Add New Window
```typescript
<AsciiWindow title="CUSTOM">
  {/* Your content */}
</AsciiWindow>
```

### 2. Add New Widget
```typescript
<AsciiButton onClick={handler}>
  CUSTOM ACTION
</AsciiButton>

<AsciiToggle 
  label="OPTION"
  value={state}
  onChange={setState}
/>
```

### 3. Extend Command System
```typescript
// In AsciiCommandBar.tsx
const handleCommand = (cmd: string) => {
  switch(cmd) {
    case 'theme': // Change theme
    case 'help':  // Show commands
    case 'clear': // Clear workspace
    default:      // Custom handling
  }
}
```

### 4. Add Status Metrics
```typescript
// In AsciiOSContainer.tsx
<AsciiWindow title="STATUS">
  <StatusMetric label="CPU" value="12%" />
  <StatusMetric label="MEM" value="4.2GB" />
  {/* Add more metrics */}
</AsciiWindow>
```

---

**Visual Design:** Terminal-inspired, monochromatic with terminal green  
**Interaction Model:** Command-line interface + clickable widgets  
**Motion Language:** Subtle fades and scales, cursor blink  
**Audio Language:** Sharp beeps and clicks (synthesized)

