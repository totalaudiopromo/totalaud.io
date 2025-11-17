# Hardware Control Layer (HCL)

The **Hardware Control Layer** enables totalaud.io to be controlled via hardware MIDI controllers like Ableton Push 2, Novation Launchpad, AKAI MPK Mini, and generic MIDI devices.

## Supported Hardware

- ✅ Ableton Push 2 (8x8 RGB pads, 8 encoders, touch strip, full LED feedback)
- ✅ Ableton Push 3 (standalone mode stub)
- ✅ Novation Launchpad Pro (8x8 RGB grid, programmer mode)
- ✅ AKAI MPK Mini (8 pads, 8 knobs, 25 keys)
- ✅ Generic MIDI (universal compatibility)

## Architecture

```
┌─────────────────┐
│  MIDI Hardware  │
└────────┬────────┘
         │ Web MIDI API
┌────────▼────────┐
│   MIDI Server   │  Detects and connects to devices
└────────┬────────┘
         │
┌────────▼────────┐
│   MIDI Router   │  Routes messages to correct driver
└────────┬────────┘
         │
┌────────▼────────┐
│  Device Driver  │  Normalizes device-specific messages
└────────┬────────┘
         │
┌────────▼────────┐
│ Mapping Engine  │  Maps inputs to actions
└────────┬────────┘
         │
┌────────▼────────┐
│Action Executors │  Execute totalaud.io actions
└─────────────────┘
```

## Core Components

### 1. MIDI Server (`src/midi/midiServer.ts`)
- Initializes Web MIDI API
- Detects connected hardware devices
- Manages device hot-swapping
- Creates MIDI router instances

### 2. MIDI Router (`src/midi/midiRouter.ts`)
- Routes MIDI messages to appropriate driver
- Manages input event callbacks
- Handles LED feedback transmission

### 3. Device Drivers (`src/midi/*Driver.ts`)
- **Push2Driver**: Ableton Push 2 support
- **Push3Driver**: Ableton Push 3 support (extends Push2)
- **LaunchpadDriver**: Novation Launchpad Pro support
- **MPKDriver**: AKAI MPK Mini support
- **GenericMIDIDriver**: Fallback for unknown devices

### 4. Mapping Engine (`src/mappingEngine.ts`)
- Loads hardware profiles and mappings from database
- Routes normalized input events to actions
- Logs action execution for analytics

### 5. Action Executors (`src/actions/`)
- **OperatorActions**: OperatorOS window management
- **CISActions**: Creative Intelligence Studio parameter control
- **SceneActions**: Scenes engine navigation
- **AgentActions**: Agent executor triggers

### 6. Session Manager (`src/sessionManager.ts`)
- Tracks hardware sessions
- Manages flow mode state
- Provides session statistics

### 7. Feedback Engine (`src/feedbackEngine.ts`)
- Controls LED feedback on hardware
- Manages feedback patterns (static, pulse, blink, flow)
- Flow mode cyan glow patterns

## Database Schema

### `hardware_profiles`
Stores device configuration for each user.

```sql
- id: uuid
- user_id: uuid (references auth.users)
- device_type: text (push2, push3, launchpad, mpk, generic_midi)
- midi_in_port: text
- midi_out_port: text
- layout: jsonb
```

### `hardware_mappings`
Maps hardware inputs to totalaud.io actions.

```sql
- id: uuid
- profile_id: uuid (references hardware_profiles)
- input_type: text (pad, encoder, button, fader, strip, key, knob)
- input_id: text
- action: text (open_window, control_param, trigger_scene, etc.)
- param: jsonb
- feedback: text (colour-mode, e.g., "cyan-pulse")
```

### `hardware_sessions`
Logs hardware control sessions.

```sql
- id: uuid
- user_id: uuid
- device_type: text
- started_at: timestamptz
- ended_at: timestamptz
- total_actions: integer
- flow_mode_enabled: boolean
```

### `hardware_action_log`
Tracks every hardware action executed.

```sql
- id: uuid
- session_id: uuid
- input_type: text
- input_id: text
- action: text
- status: text (success, error, skipped)
```

## Usage

### Basic Setup

```typescript
import { MIDIServer, MappingEngine, SessionManager } from '@total-audio/hardware';
import { createClient } from '@supabase/supabase-js';

// Initialize components
const supabase = createClient(url, key);
const midiServer = new MIDIServer();
const mappingEngine = new MappingEngine(supabase);
const sessionManager = new SessionManager(supabase);

// Initialize Web MIDI
await midiServer.initialize();

// Detect devices
const devices = await midiServer.detectDevices();
console.log('Detected devices:', devices);

// Connect to first device
if (devices.length > 0) {
  const router = await midiServer.connect(devices[0].name);

  // Load profile and mappings
  await mappingEngine.loadProfile(profileId);

  // Set up action executor
  mappingEngine.setActionExecutor({
    execute: async (action) => {
      console.log('Executing action:', action);
      // Handle action execution
    },
  });

  // Listen to input events
  router?.onInput(async (event) => {
    await mappingEngine.processInput(event);
  });

  // Start session
  await sessionManager.startSession(userId, devices[0].type, profileId);
}
```

### Creating Mappings

```typescript
// Map pad-0-0 to open studio window
await mappingEngine.saveMapping({
  inputId: 'pad-0-0',
  inputType: 'pad',
  action: 'open_window',
  param: { window: 'studio' },
  feedback: 'cyan-static',
  enabled: true,
});

// Map encoder-0 to adjust CIS intensity parameter
await mappingEngine.saveMapping({
  inputId: 'encoder-0',
  inputType: 'encoder',
  action: 'adjust_param',
  param: { param: 'intensity' },
  feedback: 'cyan-pulse',
  enabled: true,
});
```

### Flow Mode

```typescript
import { FeedbackEngine } from '@total-audio/hardware';

const feedbackEngine = new FeedbackEngine();
feedbackEngine.setRouter(router);

// Enable flow mode
await sessionManager.enableFlowMode();

// Apply flow mode cyan glow pattern
await feedbackEngine.applyFlowModePattern();

// Disable flow mode
await sessionManager.disableFlowMode();
```

## API Routes

### `POST /api/hardware/connect`
Creates or updates hardware profile.

**Request:**
```json
{
  "deviceType": "push2",
  "deviceId": "push2-1234",
  "midiInPort": "Ableton Push 2 Live Port",
  "midiOutPort": "Ableton Push 2 Live Port"
}
```

**Response:**
```json
{
  "success": true,
  "profileId": "uuid",
  "mappings": []
}
```

### `GET /api/hardware/mappings?profileId=uuid`
Returns all mappings for a profile.

### `POST /api/hardware/mappings`
Creates or updates a mapping.

### `POST /api/hardware/sessions`
Starts a new hardware session.

### `GET /api/hardware/sessions?active=true`
Returns active or historical sessions.

## Frontend UI

### `/hardware`
Overview dashboard with connection status and navigation.

### `/hardware/devices`
Device selection and connection.

### `/hardware/mappings`
Mapping editor with learn mode.

### `/hardware/flow-mode`
Flow mode toggle and explanation.

### `/hardware/sessions`
Session history and statistics.

## Supported Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `open_window` | Open OperatorOS window | `{ window: 'studio' }` |
| `focus_window` | Focus OperatorOS window | `{ window: 'studio' }` |
| `close_window` | Close OperatorOS window | `{ window: 'studio' }` |
| `cycle_window` | Cycle through windows | `{ window: 'studio' }` |
| `trigger_scene` | Trigger scene | `{ scene: 'scene-id' }` |
| `switch_scene` | Switch to scene | `{ scene: 'scene-id' }` |
| `run_agent` | Run agent | `{ agent: 'agent-id' }` |
| `spawn_agent` | Spawn new agent | `{ config: {...} }` |
| `run_skill` | Run skill | `{ skill: 'skill-id' }` |
| `control_param` | Control CIS parameter | `{ param: 'intensity' }` |
| `adjust_param` | Adjust CIS parameter | `{ param: 'intensity' }` |
| `toggle_mode` | Toggle CIS mode | `{ mode: 'creative' }` |
| `save_snapshot` | Save creative snapshot | `{}` |
| `trigger_command` | Trigger command | `{ command: 'palette' }` |
| `navigate` | Navigate UI | `{ direction: 'up' }` |
| `cycle_theme` | Cycle through themes | `{}` |
| `toggle_flow_mode` | Toggle flow mode | `{}` |
| `trigger_boot` | Trigger boot animation | `{}` |

## Example Mappings

### Push 2 Creative Studio Control

```json
{
  "pad-0-0": { "action": "open_window", "param": { "window": "studio" } },
  "pad-0-1": { "action": "save_snapshot", "param": {} },
  "encoder-0": { "action": "adjust_param", "param": { "param": "intensity" } },
  "encoder-1": { "action": "adjust_param", "param": { "param": "creativity" } },
  "encoder-2": { "action": "adjust_param", "param": { "param": "randomness" } },
  "button-play": { "action": "trigger_command", "param": { "command": "inspire" } }
}
```

### Launchpad Scene Navigation

```json
{
  "pad-0-0": { "action": "trigger_scene", "param": { "scene": "scene-1" } },
  "pad-0-1": { "action": "trigger_scene", "param": { "scene": "scene-2" } },
  "pad-0-2": { "action": "trigger_scene", "param": { "scene": "scene-3" } },
  "scene-0": { "action": "navigate", "param": { "direction": "up" } },
  "scene-1": { "action": "navigate", "param": { "direction": "down" } }
}
```

## Testing

```bash
cd packages/hardware
pnpm test              # Run tests
pnpm test:ui           # Visual test UI
pnpm test:coverage     # Coverage report
```

## Future Enhancements

- [ ] Push 3 standalone mode
- [ ] MIDI mapping import/export
- [ ] Foot pedal integration
- [ ] Hardware-driven agent debugging
- [ ] Multi-controller support
- [ ] Custom LED colour palettes
- [ ] Macro recording with hardware triggers

## Browser Compatibility

HCL requires the Web MIDI API, supported in:
- ✅ Chrome 43+
- ✅ Edge 79+
- ✅ Opera 30+
- ❌ Firefox (requires flag)
- ❌ Safari (not supported)

## License

Part of the totalaud.io monorepo.
