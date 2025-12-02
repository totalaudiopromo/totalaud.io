# @total-audio/operator-boot

**Boot sequence components** for OperatorOS.

## Overview

Provides the cinematic boot flow: **Operator → Signal → Ready** before mounting OperatorOS desktop.

## Boot Phases

### 1. Operator Phase

Initial boot screen with ASCII-style animation.

- Shows "OPERATOROS v0.1.0"
- Displays initialization messages
- Text appears line-by-line
- Duration: ~1 second

### 2. Signal Phase

Loading of core systems with progress indicators.

- Displays boot checks grid
- Shows each system coming online
- Visual indicators (pending, checking, success, error)
- Systems checked:
  - Network connectivity
  - Authentication
  - Fusion Layer
  - CMG
  - All registered apps (Intel, Pitch, Tracker, Studio, etc.)
- Duration: ~3 seconds

### 3. Ready Phase

Short transitional screen.

- "Operator ready. Signal locked in."
- Pulse animation effect
- Prepares for desktop mount
- Duration: ~2 seconds

## Usage

### Basic Integration

```tsx
import { BootScreen, SignalScreen, ReadyScreen } from '@total-audio/operator-boot';
import { OperatorDesktop } from '@total-audio/operator-os';
import { useState } from 'react';

type BootPhase = 'operator' | 'signal' | 'ready' | 'complete';

function OperatorShell() {
  const [phase, setPhase] = useState<BootPhase>('operator');

  return (
    <>
      {phase === 'operator' && (
        <BootScreen onComplete={() => setPhase('signal')} />
      )}
      {phase === 'signal' && (
        <SignalScreen onComplete={() => setPhase('ready')} />
      )}
      {phase === 'ready' && (
        <ReadyScreen onComplete={() => setPhase('complete')} />
      )}
      {phase === 'complete' && <OperatorDesktop />}
    </>
  );
}
```

## Components

### BootScreen

```tsx
interface BootScreenProps {
  onComplete: () => void;
}

<BootScreen onComplete={handleComplete} />
```

### SignalScreen

```tsx
interface SignalScreenProps {
  onComplete: () => void;
}

<SignalScreen onComplete={handleComplete} />
```

### ReadyScreen

```tsx
interface ReadyScreenProps {
  onComplete: () => void;
}

<ReadyScreen onComplete={handleComplete} />
```

## Boot Checks

The Signal phase runs these checks:

```tsx
export const BOOT_CHECKS = [
  { id: 'network', name: 'Network connectivity' },
  { id: 'auth', name: 'Authentication' },
  { id: 'fusion', name: 'Fusion Layer' },
  { id: 'cmg', name: 'CMG accessible' },
  { id: 'intel', name: 'Audio Intel' },
  { id: 'pitch', name: 'Pitch Generator' },
  { id: 'tracker', name: 'Campaign Tracker' },
  { id: 'studio', name: 'Creative Studio' },
  { id: 'community', name: 'Community' },
  { id: 'autopilot', name: 'Autopilot' },
  { id: 'coach', name: 'CoachOS' },
  { id: 'scenes', name: 'Scenes Engine' },
];
```

### Customizing Boot Checks

```tsx
import { executeBootChecks } from '@total-audio/operator-boot';

// Run checks with custom progress handler
const result = await executeBootChecks((checks) => {
  console.log('Boot progress:', checks);
});

if (result.success) {
  console.log('Boot complete!');
} else {
  console.error('Boot failed:', result.error);
}
```

## Design

All boot screens follow Flow State design:

- **Background**: Pure black to deep dark gradients
- **Text**: Slate cyan (#3AA9BE)
- **Font**: JetBrains Mono for technical aesthetic
- **Animations**: Smooth fade-ins and transitions
- **Duration**: Total ~6 seconds for complete boot

## Types

```tsx
export type BootPhase = 'operator' | 'signal' | 'ready' | 'complete';

export interface BootCheck {
  id: string;
  name: string;
  status: 'pending' | 'checking' | 'success' | 'error';
  message?: string;
}

export interface BootState {
  phase: BootPhase;
  checks: BootCheck[];
  error?: string;
}
```

## Related Packages

- **@total-audio/operator-os**: Main desktop environment
- **@total-audio/operator-services**: App registry

## License

Private - Total Audio Platform
