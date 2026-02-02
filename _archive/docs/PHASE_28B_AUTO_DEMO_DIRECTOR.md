## Phase 28B – Auto Demo Director Mode

**Goal:** add an optional “Director Mode” that auto-drives the existing Lana Glass demo at `/demo/artist` as a short, cinematic playback – without changing engines, persistence, or normal usage.

### Director script model

- **File:** `apps/aud-web/src/components/demo/director/directorScript.ts`
- **Types:**
  - `DirectorActionKind`:
    - `WAIT`
    - `SET_OS`
    - `TYPE_ASCII`
    - `RUN_ASCII_COMMAND`
    - `HIGHLIGHT_ANALOGUE_CARD`
    - `FOCUS_XP_AGENT_RUN`
    - `PAN_CAMERA`
    - `PLAY_LOOPOS`
    - `STOP_LOOPOS`
    - `OPEN_AQUA_AGENT`
    - `SET_AMBIENT_INTENSITY`
    - `SHOW_NOTE`
  - `DirectorAction`:
    - `id: string`
    - `stepId: DemoStepId` – links each action to the existing `DEMO_STEPS` script.
    - `kind: DirectorActionKind`
    - `delayMs?: number` – delay before running the action.
    - `durationMs?: number` – duration for camera pans / loop playback.
    - `payload?: unknown` – per-kind data (command text, card title, etc.).
- **Script:** `DIRECTOR_SCRIPT`
  - A single, linear sequence (~60–90s) that:
    - Highlights the **Analogue** concept card and introduces Lana’s notebook.
    - Switches to **ASCII**, types a `coach` agent command and runs it.
    - Lets the agent respond, then jumps to **XP** and focuses the last completed run.
    - Moves into **LoopOS**, pans across the timeline, and plays the loop briefly.
    - Lands in **Aqua**, asks Coach about the pitch, and shows a closing note.
  - Each action’s `stepId` keeps the demo overlay and OS selection aligned with the story.

### Director engine & controllers

- **File:** `apps/aud-web/src/components/demo/director/DirectorEngine.ts`

Provides a small execution layer and registration points for OS surfaces:

- **Controllers** (module-level, demo-only):
  - `registerAsciiController({ typeCommand, submitCommand })`
  - `registerAnalogueController({ highlightCardByTitle })`
  - `registerXpController({ focusLastCompletedRun })`
  - `registerLoopOSController({ playFor, stop })`
  - `registerAquaController({ askCoachAboutPitch })`
  - `registerCameraController({ panTo, reset })`
- **Execution deps:**

```ts
export interface DirectorExecutionDeps {
  goToStep: (id: string) => void
  setNote: (note: string | null) => void
  setAmbientIntensityOverride?: (value: number | null) => void
}
```

- **Action executor:**
  - `executeDirectorAction(action, deps)`:
    - Calls `deps.goToStep(stepId)` to keep `DemoOrchestrator` in sync.
    - For each `kind`, calls the appropriate registered controller, e.g.:
      - `TYPE_ASCII` → `asciiController.typeCommand(text)`
      - `RUN_ASCII_COMMAND` → `asciiController.submitCommand()`
      - `HIGHLIGHT_ANALOGUE_CARD` → `analogueController.highlightCardByTitle(title)`
      - `FOCUS_XP_AGENT_RUN` → `xpController.focusLastCompletedRun()`
      - `PAN_CAMERA` → `cameraController.panTo(target, durationMs)`
      - `PLAY_LOOPOS` / `STOP_LOOPOS` → `looposController.playFor()` / `.stop()`
      - `OPEN_AQUA_AGENT` → `aquaController.askCoachAboutPitch()`
      - `SHOW_NOTE` → `deps.setNote(text)` (demo overlay note line).
      - `SET_AMBIENT_INTENSITY` → `deps.setAmbientIntensityOverride(value)`.

The engine itself is stateless; state and timing live in `DirectorProvider`.

### DirectorProvider & useDirector

- **File:** `apps/aud-web/src/components/demo/director/DirectorProvider.tsx`

Provides the director runtime as a React context:

```ts
interface DirectorState {
  isEnabled: boolean
  isPlaying: boolean
  currentIndex: number
  currentActionId: string | null
  note: string | null
}

interface DirectorControls {
  start(): void
  pause(): void
  resume(): void
  stop(): void
  skipToNext(): void
  skipToPrevious(): void
}
```

- Hooks:
  - `useDirector()` – strict hook, throws if used outside provider.
  - `useOptionalDirector()` – returns `DirectorContextValue | null` (used in `DemoOverlay`).
- Playback loop:
  - Tracks `currentIndex` into `DIRECTOR_SCRIPT` and `currentActionId` for debugging / UX.
  - `runNextAction()`:
    - Clears any existing timeout.
    - Reads the current action; if none → stops, clears note, and removes any ambient override.
    - Sets `currentActionId`.
    - Applies `delayMs` by `setTimeout`, then calls `executeDirectorAction`.
    - Increments `currentIndex` afterwards.
  - `useEffect` starts sequencing whenever `isEnabled && isPlaying` becomes `true`.
- Controls:
  - `start()`:
    - Resets state and note.
    - Captures `baselineAmbient` once (from `useOptionalAmbient()`).
    - Bumps ambient intensity slightly (0.7 or 0.5 with reduced motion) without losing the baseline.
    - Sets `isEnabled = true`, `isPlaying = true`.
  - `pause()`/`resume()` pause and restart playback without resetting.
  - `stop()`:
    - Clears timeouts, disables the director, resets index, and note.
    - Restores ambient intensity towards the baseline via `setAmbientIntensityOverride(null)`.
  - `skipToNext()` / `skipToPrevious()`:
    - Clear any pending timeout.
    - Adjust `currentIndex` forward/backward (bounded to [0, script length]).
    - Sequencing `useEffect` takes care of running the next action if still playing.
- Hotkeys (demo-only):
  - Global `keydown` listener:
    - `space` → start / pause / resume.
    - `→` → `skipToNext()`.
    - `←` → `skipToPrevious()`.
  - Ignores events originating from `INPUT` / `TEXTAREA` elements.

### Wiring into /demo/artist

- **File:** `apps/aud-web/src/app/demo/artist/page.tsx`

`ArtistDemoPage` now wraps the demo in both director and demo contexts:

```tsx
export default function ArtistDemoPage() {
  return (
    <DirectorProvider>
      <DemoOrchestrator>
        <DemoOSShell />
      </DemoOrchestrator>
    </DirectorProvider>
  )
}
```

`DemoOSShell` still chooses OS surfaces based on `activeStep.os`, but now wraps them with `DemoCameraContainer` inside `OSLayout`:

- `DemoCameraContainer` uses Framer Motion to apply subtle pans/scale.
- Registers a `CameraDirectorController` via `registerCameraController`, implementing:
  - `panTo(target: 'timeline' | 'inspector' | 'minimap', durationMs)` – recentres the OS view.
  - `reset()` – returns to neutral framing.

This keeps camera effects scoped to the demo route while leaving core OS layout untouched.

### OS surface hooks (demo-only)

All hooks are guarded by `useOptionalDemo()` and `window.__TA_DEMO__` so they remain inert outside demo mode.

- **ASCII – typing and running commands**
  - **File:** `AsciiCommandBar.tsx`
  - Adds `inputRef` to mirror the current command buffer.
  - When `isDemoMode`:
    - Registers an ASCII controller via `registerAsciiController`:
      - `typeCommand(text)` → sets the `input` state/ref to the given text.
      - `submitCommand()` → runs `runCommand()` with the buffered text and clears it.
  - Director actions:
    - `TYPE_ASCII` → injects the coach command.
    - `RUN_ASCII_COMMAND` → simulates pressing Enter.

- **Analogue – highlight card**
  - **File:** `os/analogue/page.tsx`
  - When in demo mode:
    - Seeds Lana cards (Phase 27).
    - Registers an Analogue controller via `registerAnalogueController`:
      - `highlightCardByTitle(title)` → toggles `highlighted: true` on the matching card (case-insensitive).
  - Director action `HIGHLIGHT_ANALOGUE_CARD` uses this to glow the “midnight signals — concept” card.

- **XP – focus last agent run**
  - **File:** `XPProcessViewer.tsx`
  - When in demo mode:
    - Registers an XP controller via `registerXpController`:
      - `focusLastCompletedRun()` → finds the most recent `run.status === 'done'` and calls `setActiveRun(id)`.
  - Director action `FOCUS_XP_AGENT_RUN` pulls the camera to the latest agent output after the ASCII run.

- **LoopOS – playback**
  - **File:** `os/loopos/page.tsx`
  - Already demo-safe from Phase 27 (no Supabase when `isDemoMode`).
  - Registers a LoopOS controller via `registerLoopOSController`:
    - `playFor(durationMs)` → `startPlayback()` then `setTimeout(stopPlayback, durationMs)`.
    - `stop()` → calls `stopPlayback()` directly.
  - Director actions:
    - `PAN_CAMERA` targets `'timeline'` to glide across the loop using `DemoCameraContainer`.
    - `PLAY_LOOPOS` / `STOP_LOOPOS` play the loop for a couple of seconds to show movement.

- **Aqua – “Ask Coach about this pitch”**
  - **File:** `os/aqua/page.tsx`
  - Extracts the previous inline button handler into:

```ts
const askCoachAboutPitch = () => {
  const summary = buildSummary()
  const prompt = [
    'Here is an EPK / pitch draft. Suggest sharper structure and phrasing.',
    '',
    summary,
  ].join('\n')

  spawnAgentRun({ role: 'coach', originOS: 'aqua', input: prompt })
}
```

  - Button now calls `askCoachAboutPitch`.
  - In demo mode, registers an Aqua controller via `registerAquaController({ askCoachAboutPitch })`.
  - Director action `OPEN_AQUA_AGENT` uses this to fire the refinement agent automatically.

### Demo overlay controls & progress

- **File:** `apps/aud-web/src/components/demo/DemoOverlay.tsx`

Enhancements:

- Imports `useOptionalDirector` and `DIRECTOR_SCRIPT`.
- Shows director note text as an extra narrative line under the main description when present.
- Adds controls in the bottom-right of the overlay when director context is available:
  - **Play demo / Pause**:
    - Calls `director.start()` when first triggered.
    - Toggles `director.pause()` / `director.resume()` thereafter.
  - **Skip** → `director.skipToNext()`.
  - **Stop** → `director.stop()`, which resets state and ambient override.
  - Existing **Back / Next / Exit demo** buttons from Phase 27 remain and still work.
- Progress bar:
  - A thin bar under the panel when director is available.
  - Width is `currentIndex / DIRECTOR_SCRIPT.length`, giving a quick sense of where you are in the auto-demo.

### Ambient & director interplay

- Uses `useOptionalAmbient()` inside `DirectorProvider`:
  - On `start()`:
    - Captures the user’s current ambient intensity once in `baselineAmbientRef`.
    - Bumps the level to at least ~0.7 (0.5 with reduced motion) for a richer but still subtle atmosphere.
  - On `stop()` and on provider unmount:
    - Calls `setAmbientIntensityOverride(null)` which restores the baseline.
  - Individual actions can also call `SET_AMBIENT_INTENSITY` to temporarily nudge intensity, but current script keeps this minimal and tasteful.

All ambient changes feed back into the existing `AmbientEngineProvider` so the same scaling, idle behaviour, and reduced-motion rules apply.

### How to run Director Mode

1. Start the web app:

```bash
pnpm dev:web
```

2. Open the Lana Glass demo route:

```text
http://localhost:3000/demo/artist
```

3. Use the overlay:
   - You’ll see the existing narrative overlay plus:
     - **Play demo** / Pause / Skip / Stop controls.
     - A slim progress bar when Director Mode is active.

4. Click **Play demo**:
   - The demo auto-steps through:
     - Analogue → ASCII → XP → LoopOS → Aqua.
   - It:
     - Highlights a card and explains Lana’s notebook.
     - Types and runs an ASCII `coach` agent command.
     - Focuses the resulting agent run in XP.
     - Pans across LoopOS and plays the loop briefly.
     - Opens Aqua and asks Coach about the pitch.
   - You can pause/resume/skip at any time, or stop to go back to manual control.

### Extending the director later

- To add more beats:
  - Append new `DirectorAction`s to `DIRECTOR_SCRIPT`.
  - Prefer small `delayMs` values (400–1200ms) to keep the pacing snappy but readable.
  - Use `SHOW_NOTE` to add director-only narration lines without changing the core demo copy.
- To support multiple artists or paths:
  - Parameterise the script by artist ID and step mapping.
  - Consider adding a `trackId` or `sceneId` to `DirectorAction` for alternative sequences.
  - Keep DirectorEngine and surface controllers generic so scripts can be swapped without code changes.


