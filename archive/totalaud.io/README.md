# TotalAud.io

**Experimental creative studio** for Total Audio Platform with full OperatorOS integration.

## Overview

TotalAud.io is the experimental environment for OperatorOS — a cinematic, AI-native browser desktop environment that provides a unified interface for all Total Audio features.

## Features

- **Full OperatorOS experience** with boot sequence
- **All Total Audio apps** accessible via windows
- **Multi-theme support** (XP, Aqua, DAW, ASCII, Analogue)
- **Operator personas** (Default, Strategist, Producer, Campaign, Dev)
- **Command palette** (⌘K) for quick navigation
- **Window management** (drag, resize, minimize, maximize)

## Quick Start

### Install Dependencies

```bash
pnpm install
```

### Run Development Server

```bash
cd apps/totalaud.io
pnpm dev
```

Visit: http://localhost:3005

### Build for Production

```bash
pnpm build
pnpm start
```

## Structure

```
apps/totalaud.io/
├── app/
│   ├── layout.tsx           # Root layout with fonts
│   ├── globals.css          # Global styles
│   ├── page.tsx             # Landing (redirects to /operator)
│   └── operator/
│       ├── page.tsx         # OperatorOS entry point
│       └── components/
│           └── OperatorShell.tsx  # Boot sequence manager
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Boot Sequence

When you visit `/operator`, you'll see:

1. **Operator Phase** (~1s): ASCII boot text
2. **Signal Phase** (~3s): System checks with progress indicators
3. **Ready Phase** (~2s): "Operator ready. Signal locked in."
4. **Complete**: OperatorOS desktop mounts

## Using OperatorOS

### Opening Apps

- Click dock icons
- Press ⌘K and search for app
- Press ⌘1-9 for apps in dock positions

### Window Management

- **Drag**: Click and drag title bar
- **Resize**: Drag bottom-right corner
- **Minimize**: Click minimize button
- **Maximize**: Click maximize button or double-click title bar
- **Close**: Click close button

### Changing Themes

- Press ⌘⌥T to cycle themes
- Or press ⌘K → search "Change theme to..."

### Switching Personas

- Press ⌘⌥O to cycle personas
- Or press ⌘K → search "Switch to... persona"

## Available Apps

| App                  | Route            | Description                                  |
|----------------------|------------------|----------------------------------------------|
| Dashboard            | /dashboard       | Unified command center                       |
| Audio Intel          | /intel           | Contact enrichment                           |
| Pitch Generator      | /pitch           | Personalised pitch generation                |
| Campaign Tracker     | /tracker         | Radio submission tracking                    |
| Creative Studio      | /studio          | AI-powered creative workspace                |
| Community            | /community       | Connect with industry professionals          |
| Autopilot            | /autopilot       | Autonomous campaign orchestration            |
| Automations          | /automations     | Workflow automation                          |
| CoachOS              | /coach           | Strategic coaching                           |
| Scenes Engine        | /scenes          | Campaign scenario modeling                   |
| Mission Intel Graph  | /mig             | Mission planning                             |
| Analytics & Reports  | /anr             | Performance analytics                        |
| Settings             | /settings        | System settings                              |
| Terminal             | /terminal        | Developer console                            |

## Hotkeys

| Hotkey      | Action                          |
|-------------|---------------------------------|
| ⌘K          | Open command palette            |
| ⌘1-9        | Focus app by dock position      |
| ⌘Tab        | Cycle through windows           |
| ⌘`          | Cycle windows of same app       |
| ⌘⌥T         | Cycle themes                    |
| ⌘⌥O         | Cycle operator personas         |
| Esc         | Close palette/modals            |

## Configuration

### Port

Default port: **3005**

Change in `package.json`:
```json
"dev": "next dev -p 3006"
```

### Themes

Edit theme tokens in `packages/operator-os/src/themes/`

### Apps

Add/remove apps in `packages/operator-services/src/appsRegistry.ts`

## Deployment

### Vercel

```bash
vercel
```

### Docker

```dockerfile
# Use existing Dockerfile pattern from other apps
```

## Related Packages

- **@total-audio/operator-os**: Desktop environment components
- **@total-audio/operator-boot**: Boot sequence
- **@total-audio/operator-services**: App registry and services

## Development Notes

### TODO

- Implement actual app content embedding (replace iframes)
- Add window layout persistence per user
- Implement snap-to-edge behavior
- Add virtual desktop support
- Implement "Expose" view for all windows

## License

Private - Total Audio Platform
