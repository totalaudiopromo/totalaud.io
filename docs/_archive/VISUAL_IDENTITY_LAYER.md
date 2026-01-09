# TotalAud.io Visual Identity Layer

## Philosophy

> **"Marketing your music should feel like performing it."**

The TotalAud.io visual identity combines futuristic creative-studio polish with ASCII-inspired terminal aesthetics and sound-design cues. This hybrid approach creates a unique experience that feels both professional and experimental—reflecting the dual nature of music marketing: business strategy meets artistic expression.

## Design Principles

### 1. Dual Mode System

The platform operates in two visual modes that users can toggle instantly:

#### **Creative Mode** ✨
- Polished gradients and smooth transitions
- Modern UI components with soft shadows
- Vibrant accent colors
- Perfect for client-facing work and presentations
- Inter font family for clean readability

#### **Console Mode** ⌨️
- ASCII-inspired framing and borders
- Monospace typography (JetBrains Mono)
- Terminal-like aesthetic with scanline effects
- Subtle green phosphor glow
- Perfect for focused workflow and technical work
- Cursor blink animations

### 2. Color as Communication

Each AI agent has a signature color that follows them across the interface:

| Agent | Emoji | Color | Hex | Purpose |
|-------|-------|-------|-----|---------|
| **Scout** | 🧭 | Green | `#10b981` | Finding opportunities, research |
| **Coach** | 🎙️ | Indigo | `#6366f1` | Crafting pitches, communication |
| **Tracker** | 📊 | Amber | `#f59e0b` | Monitoring campaigns, analytics |
| **Insight** | 💡 | Purple | `#8b5cf6` | Analysis, recommendations |

These colors appear consistently in:
- Agent avatars and badges
- Message bubbles in multi-agent chat
- Flow Canvas node borders
- Glow effects and shadows
- Status indicators

### 3. Typography Hierarchy

```css
/* Creative Mode */
body {
  font-family: 'Inter', system-ui, sans-serif;
  letter-spacing: 0.01em;
}

/* Console Mode */
body[data-theme="console"] {
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.02em;
}

/* Monospace Elements (both modes) */
pre, code, kbd, .font-mono {
  font-family: 'JetBrains Mono', monospace;
}
```

**Font Choices:**
- **Inter**: Modern, highly legible sans-serif for UI text
- **JetBrains Mono**: Developer-friendly monospace with excellent ligatures
- Both fonts support extensive Unicode for ASCII art and special characters

### 4. Motion & Animation

Animations serve functional purposes and reinforce the "live" feeling of the platform:

**Micro-interactions:**
- Button presses: Scale 0.95 on tap
- Panel reveals: Fade + slide (0.3s duration)
- Status changes: Color transitions (0.2s)

**Active States:**
- Running workflows: Shimmer overlay animation
- Agent thinking: Rotating spinner icon
- Message arrival: Slide in from left
- Success/error: Pulse + color change

**Performance:**
- All animations use `transform` and `opacity` for GPU acceleration
- Respect `prefers-reduced-motion` media query
- Frame rate target: 60fps

### 5. Sound Design (Optional)

UI sounds provide subtle auditory feedback without being intrusive:

**Sound Types:**
```typescript
{
  click: "800Hz sine, 50ms",        // Button clicks
  bleep: "1200Hz square, 80ms",     // Notifications
  success: "600Hz → 900Hz, 140ms",  // Task completion
  error: "200Hz sawtooth, 150ms",   // Errors
  agentStart: "400 → 600 → 800Hz",  // Workflow begins
  messageReceived: "900Hz sine"      // New message
}
```

**User Control:**
- Sounds disabled by default
- Toggle button in bottom-left corner
- Volume control (30% default)
- Preference saved to localStorage
- Built with Web Audio API for reliability

## Component Library

### ConsoleShell

Wraps content with ASCII-inspired framing:

```tsx
<ConsoleShell 
  title="AGENT WORKFLOW ORCHESTRATOR"
  accentColor="#6366f1"
  showCursor={true}
>
  {/* Your content */}
</ConsoleShell>
```

**Features:**
- Auto-generated ASCII borders
- Live timestamp display
- Session status indicator
- Blinking cursor animation
- Ambient glow effect

### ConsolePanel

Smaller variant for nested sections:

```tsx
<ConsolePanel title="agent_messages" accentColor="#10b981">
  {/* Content */}
</ConsolePanel>
```

### FlowNode

Custom React Flow node with ASCII styling:

```
┌─ research-contacts ─┐
│ ▶ Research Contacts  │
│ status: running      │
│ time: 1245ms         │
└──────────────────────┘
```

**Status Colors:**
- Pending: Gray `#6b7280`
- Running: Blue `#3b82f6` (animated)
- Completed: Green `#10b981`
- Failed: Red `#ef4444`

### ThemeToggle

Keyboard-accessible theme switcher:

```tsx
<ThemeToggle />
```

**Keyboard Shortcut:**
- Mac: `⌘ + backtick`
- Windows/Linux: `Ctrl + backtick`

**Features:**
- Instant theme switching
- Toast notification on change
- Preference persistence
- Visual indicator of current mode

## Layout Patterns

### Dashboard Layout

```text
┌─────────────────────────────────────────┐
│  Header (Title + Quick Stats)           │
├─────────────────────────────────────────┤
│  ┌─ Console Shell ──────────────────┐   │
│  │  Main Canvas (Flow, Chat, etc.)  │   │
│  │                                   │   │
│  └───────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Agent Status Cards (4-column grid)     │
└─────────────────────────────────────────┘
```

### Flow Canvas Layout

```text
┌────────┐                        ┌──────────┐
│ Skills │  Main Canvas Area      │ Execution│
│ Palette│                        │  Status  │
│        │    [Nodes & Edges]     │          │
└────────┘                        └──────────┘
                                  ┌──────────┐
                                  │  Legend  │
                                  └──────────┘
```

### Multi-Agent Chat Layout

```text
┌─ agent_messages ──────────────────┐
│  🧭 Scout → Coach: Found 12 ...   │
│  🎙️ Coach → Tracker: Generated ..│
│  📊 Tracker → Insight: Sent 12 ...│
└────────────────────────────────────┘
┌─ compose ──────────────────────────┐
│  [Scout] [Coach] [Tracker] [...]   │
│  ┌─────────────────────────────┐   │
│  │ Message input...            │   │
│  └─────────────────────────────┘   │
└────────────────────────────────────┘
```

## ASCII Art Reference

### Box Drawing Characters

```text
┌ ┐ └ ┘  Corners
─ │      Lines
├ ┤ ┬ ┴  T-junctions
┼         Cross
```

### Block Elements

```text
█ ▓ ▒ ░  Filled blocks
▀ ▄ ▌ ▐  Half blocks
● ○      Circles
◆ ◇      Diamonds
▶ ▷ ▸    Triangles
```

### Common Patterns

```typescript
// Header
`┌${"─".repeat(title.length + 4)}┐`
`│  ${title}  │`
`└${"─".repeat(title.length + 4)}┘`

// Progress bar
`[${"█".repeat(progress)}${"░".repeat(10 - progress)}]`

// Status line
`⟩ ${label} ${status ? "✓" : "⏸"}`
```

## Accessibility

### Color Contrast

All color combinations meet WCAG 2.1 Level AA standards:

- **Text on dark backgrounds**: Minimum 4.5:1 ratio
- **Interactive elements**: Minimum 3:1 ratio
- **Status indicators**: Use icons + color, never color alone

### Keyboard Navigation

All interactive elements are keyboard accessible:

- `Tab` / `Shift+Tab`: Navigate between elements
- `Enter` / `Space`: Activate buttons
- `Escape`: Close modals/panels
- `⌘/Ctrl + backtick`: Toggle theme
- `⌘/Ctrl + K`: Open command palette (future)

### Screen Readers

- All ASCII art is marked `aria-hidden="true"`
- Semantic HTML structure (`<main>`, `<nav>`, `<section>`)
- Descriptive labels for all interactive elements
- Status updates announced via `aria-live` regions

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Implementation Checklist

### Phase 1: Foundation ✅
- [x] ConsoleShell component
- [x] Enhanced typography (globals.css)
- [x] Agent color system
- [x] Base animations

### Phase 2: Components ✅
- [x] FlowNode with ASCII accents
- [x] ThemeToggle with keyboard shortcut
- [x] useUISound hook
- [x] Theme persistence

### Phase 3: Integration ✅
- [x] Update homepage with new aesthetic
- [x] Multi-agent chat styling
- [x] Flow Canvas enhancement
- [x] Documentation

### Phase 4: Polish (Future)
- [ ] Advanced ASCII animations (typewriter effect)
- [ ] Theme-aware component variants
- [ ] Expanded sound library
- [ ] Custom cursors for each theme
- [ ] Ambient particle effects (subtle)
- [ ] VT100-style terminal emulator mode

## File Structure

```txt
apps/aud-web/
├── src/
│   ├── app/
│   │   ├── globals.css          # Enhanced typography & themes
│   │   └── page.tsx             # Homepage with new aesthetic
│   ├── components/
│   │   ├── ConsoleShell.tsx     # ASCII-framed container
│   │   ├── FlowNode.tsx         # Custom React Flow node
│   │   ├── FlowCanvas.tsx       # Canvas with custom nodes
│   │   ├── MultiAgentPanel.tsx  # Chat interface
│   │   └── ThemeToggle.tsx      # Theme switcher
│   └── hooks/
│       └── useUISound.ts        # Audio feedback system
```

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Largest Contentful Paint**: < 2.5s
- **Frame Rate**: 60fps sustained
- **Animation Budget**: < 16ms per frame
- **Font Loading**: Preload critical fonts
- **Sound Loading**: Lazy load audio context

## Browser Support

- **Chrome/Edge**: 100+
- **Firefox**: 100+
- **Safari**: 15.4+
- **Mobile Safari**: iOS 15.4+
- **Mobile Chrome**: Android 100+

**Progressive Enhancement:**
- ASCII art: Falls back to plain text
- Animations: Respects reduced motion
- Sounds: Gracefully disabled if unavailable
- Fonts: System fonts as fallback

## Future Enhancements

### VR/AR Integration
Explore WebXR for immersive workflow visualization:
- 3D node graphs
- Spatial audio for agent activity
- Gesture-based node manipulation

### AI-Generated Aesthetics
Let agents suggest color palettes and layouts:
- Genre-specific themes (indie, electronic, hip-hop)
- Brand color extraction from album artwork
- Dynamic lighting based on time of day

### Collaborative Cursors
Show other users' cursors in shared workflows:
- Real-time collaboration indicators
- User avatars and status
- Activity feed and presence

### Performance Mode
Ultra-lightweight mode for low-end devices:
- Disable all animations
- Simplify shadows and effects
- Text-only interface option
- Reduced font loading

## Credits & Inspiration

- **Terminal Aesthetics**: VT100, Cyberpunk 2077 UI
- **Color Science**: IBM Carbon Design System
- **Typography**: Inter by Rasmus Andersson, JetBrains Mono
- **Motion**: Material Design Motion System
- **Sound**: [Sonification.org](https://sonification.org)
- **ASCII Art**: Paul Bourke's ASCII Art Library

---

**Version**: 1.0.0  
**Last Updated**: January 18, 2026  
**Maintained by**: TotalAud.io Design System Team

**Related Documentation:**
- [Multi-Agent Collaboration](./MULTI_AGENT_COLLAB.md)
- [Flow Canvas Overview](./FLOW_CANVAS_OVERVIEW.md)
- [Agent System Overview](./AGENT_SYSTEM_OVERVIEW.md)

