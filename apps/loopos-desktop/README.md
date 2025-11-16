# LoopOS Desktop

Native desktop application for LoopOS built with Tauri.

## Features

- 🖥️ **Native Desktop App** - Runs as a native macOS/Windows application
- 📴 **Offline-First** - Full offline support with automatic sync
- 💾 **Local Cache** - Secure local storage for moodboards, journal, nodes, scenes
- ⌨️ **Global Shortcuts** - System-wide keyboard shortcuts
- 🎯 **Native Menus** - File, Edit, View, Window, Help menus
- 🔄 **Auto-Sync** - Queues actions offline, syncs when reconnecting

## Prerequisites

- **Rust**: Install from https://rustup.rs/
- **Node.js**: v18+ with pnpm
- **LoopOS Web App**: Must be running for dev mode

## Development

### Quick Start

```bash
# Install dependencies
pnpm install

# Run in dev mode (requires LoopOS on port 3001)
pnpm tauri:dev
```

### Full Dev Setup

```bash
# Terminal 1: Run LoopOS web app
cd ../loopos
pnpm dev  # Runs on http://localhost:3001

# Terminal 2: Run desktop wrapper
pnpm tauri:dev
```

## Production Build

```bash
# Build desktop binaries
pnpm tauri:build
```

**Output**:
- **macOS**: `src-tauri/target/release/bundle/macos/LoopOS.app`
- **Windows**: `src-tauri/target/release/bundle/msi/LoopOS_1.0.0_x64.msi`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+K` | Command Palette |
| `Cmd/Ctrl+N` | New Node |
| `Cmd/Ctrl+J` | Journal |
| `Cmd/Ctrl+D` | Designer |
| `Cmd/Ctrl+Shift+E` | Export |

## Architecture

### Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Rust + Tauri
- **Cache**: JSON files in platform-specific app data directory

### How It Works

1. Desktop app loads LoopOS web app in an iframe
2. Provides native features via Tauri commands
3. Intercepts shortcuts and forwards to LoopOS
4. Manages local cache and offline queue

## Local Cache

Data stored in:
- **macOS**: `~/Library/Application Support/io.totalaud.loopos/`
- **Windows**: `C:\Users\{User}\AppData\Roaming\io.totalaud.loopos\`

**Structure**:
```
cache/
  {workspaceId}/
    moodboards.json
    journal.json
    nodes.json
    designer_scenes.json
queue/
  pending_actions.json
config/
  settings.json
```

## Scripts

```bash
pnpm dev          # Vite dev server (port 1420)
pnpm build        # Build frontend
pnpm tauri:dev    # Run desktop app in dev mode
pnpm tauri:build  # Build production binaries
```

## Documentation

- [Phase 9 Implementation](../loopos/docs/PHASE_9_DESKTOP_APP.md) - Complete technical documentation
- [Phase 9 Summary](../loopos/docs/PHASE_9_SUMMARY.md) - Feature overview

## Troubleshooting

### Desktop app shows "Loading..."

**Problem**: LoopOS web app not running on port 3001

**Solution**:
```bash
cd ../loopos
pnpm dev
```

### Rust compilation errors

**Problem**: Rust toolchain not installed or outdated

**Solution**:
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Update Rust
rustup update
```

### File permissions errors

**Problem**: Cannot read/write cache files

**Solution**: Check app data directory permissions:
- **macOS**: `~/Library/Application Support/io.totalaud.loopos/`
- **Windows**: `C:\Users\{User}\AppData\Roaming\io.totalaud.loopos\`

## License

Private - Total Audio

## Version

1.0.0
