# @total-audio/operator-os

**OperatorOS** — A cinematic, AI-native, browser desktop environment for Total Audio Platform.

## Overview

OperatorOS is a window manager and desktop environment that sits on top of existing Total Audio apps, providing a unified "OS" metaphor for navigating and orchestrating all platform features.

### What OperatorOS IS:

- A **window manager** with drag, resize, focus, minimize, maximize
- A **dock** for launching and switching apps
- A **boot sequence** (Operator → Signal → Ready)
- A **command palette** (⌘K) for quick actions
- A **multi-app workspace** that can run multiple apps simultaneously
- A **theme-driven OS** with 5 visual themes (XP, Aqua, DAW, ASCII, Analogue)
- A **host for AI "Operator" personas** (Default, Strategist, Producer, Campaign, Dev)

### What OperatorOS IS NOT:

- A replacement for existing apps
- A re-implementation of business logic
- An email engine, analytics layer, or automation brain

It's a **UI & UX shell** that embeds existing routes/apps in a coherent desktop environment.

## Architecture

```
┌─────────────────────────────────────────┐
│          OperatorDesktop                │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ Window 1     │  │ Window 2     │    │
│  │ (Dashboard)  │  │ (Intel)      │    │
│  └──────────────┘  └──────────────┘    │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Dock: [Apps...]                 │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Features

### Window Management

- **Create windows** for any registered app
- **Drag windows** with pointer events
- **Resize windows** (bottom-right handle)
- **Minimize, Maximize, Close** controls
- **Focus management** with z-index stacking
- **Cascade and Tile** layout modes

### Themes

5 Flow State-compliant themes:

- **XP**: Nostalgic Windows XP vibe
- **Aqua**: Mac OS X Aqua glass aesthetic
- **DAW**: Digital Audio Workstation grid lines
- **ASCII**: Terminal/retro monospace
- **Analogue**: Warm, hardware-inspired

All themes respect:
- Matte black/deep dark base
- Slate cyan (#3AA9BE) as core accent
- Inter & JetBrains Mono fonts
- Smooth 240ms transitions

### Command Palette

Press **⌘K** (or Ctrl+K) to open:

- **Search apps** and launch them
- **Change themes** instantly
- **Switch personas**
- **Fuzzy search** with keyboard navigation
- **Recent history** tracking

### Operator Personas

5 personas that adjust UI hints and suggested apps:

- **Default**: Balanced workspace
- **Strategist**: Campaign planning focus
- **Producer**: Creative production workflow
- **Campaign**: Radio campaign execution
- **Dev**: Development and system tools

### Hotkeys

- **⌘K**: Toggle command palette
- **⌘1-9**: Focus app by dock position
- **⌘Tab**: Cycle windows
- **⌘`**: Cycle windows of same app
- **⌘⌥T**: Cycle themes
- **⌘⌥O**: Cycle personas
- **Esc**: Close palette/modals

## Usage

### Install

```bash
# Already part of monorepo workspace
pnpm install
```

### Import Components

```tsx
import { OperatorDesktop } from '@total-audio/operator-os';

export default function OperatorPage() {
  return <OperatorDesktop />;
}
```

### Using with Boot Sequence

```tsx
import { BootScreen, SignalScreen, ReadyScreen } from '@total-audio/operator-boot';
import { OperatorDesktop } from '@total-audio/operator-os';

// See apps/totalaud.io/app/operator/components/OperatorShell.tsx
```

### State Management

```tsx
import { useOperatorStore } from '@total-audio/operator-os';

function MyComponent() {
  const { openApp, windows, setTheme } = useOperatorStore();

  return (
    <button onClick={() => openApp('dashboard')}>
      Open Dashboard
    </button>
  );
}
```

## Package Structure

```
packages/operator-os/
├── src/
│   ├── components/          # UI components
│   │   ├── OperatorDesktop.tsx
│   │   ├── OperatorWindow.tsx
│   │   ├── OperatorDock.tsx
│   │   ├── OperatorTopBar.tsx
│   │   ├── OperatorCommandPalette.tsx
│   │   ├── OperatorNotifications.tsx
│   │   └── OperatorStatusBar.tsx
│   ├── state/               # State management
│   │   ├── operatorStore.ts
│   │   ├── layoutStore.ts
│   │   └── themeStore.ts
│   ├── themes/              # Theme configs
│   │   ├── xp.ts
│   │   ├── aqua.ts
│   │   ├── daw.ts
│   │   ├── ascii.ts
│   │   └── analogue.ts
│   ├── hooks/               # React hooks
│   │   ├── useOperatorHotkeys.ts
│   │   └── useWindowManager.ts
│   ├── utils/               # Utilities
│   │   ├── windowLayout.ts
│   │   └── animations.ts
│   ├── types.ts             # TypeScript types
│   └── index.ts             # Package entry
├── package.json
├── tsconfig.json
└── README.md
```

## API Reference

### useOperatorStore

Main state store for OperatorOS.

```tsx
const {
  // State
  activeTheme,
  windows,
  dockApps,
  operatorPersona,
  isCommandPaletteOpen,

  // Window management
  openApp,
  closeWindow,
  focusWindow,
  minimiseWindow,
  maximiseWindow,
  moveWindow,
  resizeWindow,

  // Theme & persona
  setTheme,
  setOperatorPersona,

  // Notifications
  pushNotification,
  dismissNotification,

  // Command palette
  toggleCommandPalette,
  openCommandPalette,
  closeCommandPalette,
} = useOperatorStore();
```

### Types

```tsx
type OperatorOSTheme = 'xp' | 'aqua' | 'daw' | 'ascii' | 'analogue';

type OperatorAppID =
  | 'dashboard'
  | 'intel'
  | 'pitch'
  | 'tracker'
  | 'studio'
  | 'community'
  | 'autopilot'
  | 'automations'
  | 'coach'
  | 'scenes'
  | 'mig'
  | 'anr'
  | 'settings'
  | 'terminal';

type OperatorPersona = 'default' | 'strategist' | 'producer' | 'campaign' | 'dev';
```

## Development

### Build

```bash
pnpm typecheck
```

### Lint

```bash
pnpm lint
```

## Design Principles

### Flow State Design System

All components follow Flow State guidelines:

- **Background**: Matte deep dark (not pure black)
- **Accent**: Slate cyan (#3AA9BE)
- **Fonts**: Inter (UI), JetBrains Mono (code/data)
- **Motion**: Short, smooth, non-cheesy (240ms ease-out)
- **No**: Neon, harsh shadows, garish gradients

### Window Interactions

- Click wallpaper → Clear selection
- Drag title bar → Move window
- Double-click title bar → Toggle maximize
- Click window → Focus and bring to front
- Resize handle → Bottom-right corner

### Accessibility

- Keyboard navigation throughout
- Clear focus indicators
- Screen reader compatible structure
- ARIA labels on interactive elements

## Future Enhancements

### TODO Comments in Code

- Implement actual app content embedding (currently uses iframes)
- Add window resize handles on all edges
- Implement snap-to-edge behavior
- Add virtual desktop support
- Persist window layouts per user
- Add window tabs/grouping
- Implement "Expose" view for all windows

## Related Packages

- **@total-audio/operator-boot**: Boot sequence components
- **@total-audio/operator-services**: App registry and deep links

## License

Private - Total Audio Platform
