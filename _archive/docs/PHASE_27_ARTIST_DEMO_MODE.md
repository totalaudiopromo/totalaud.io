## Phase 27 – Cinematic Artist Journey / Demo Mode

**Goal:** turn the OS constellation into a guided, scripted story for a fictional artist, LANA GLASS, that can be replayed on demand via `/demo/artist` without touching real user data.

### Demo script model

- **File:** `apps/aud-web/src/components/demo/DemoScript.ts`
- **Types:**
  - `DemoStepId` – union of step identifiers:
    - `analogue_ideas`
    - `analogue_send_to_daw`
    - `ascii_agent_run`
    - `xp_monitor`
    - `loopos_build`
    - `loopos_ai`
    - `aqua_pitch`
    - `end`
  - `DemoStep` – step metadata:
    - `id: DemoStepId`
    - `title: string`
    - `description: string`
    - `os: OSSlug`
    - `helpText?: string`
    - `ctaLabel?: string`
    - `autoAdvance?: boolean`
- **Constants:**
  - `DEMO_STEPS` – ordered list of steps mapping the story arc across OS surfaces.
  - `DEMO_ACTIVE_STEPS` – `DEMO_STEPS` without the terminal `end` step (used for the indicator).

Each step is tagged with an OS slug and human-readable copy that explains what’s happening for the LANA GLASS / “Midnight Signals” storyline.

### DemoOrchestrator and context

- **File:** `apps/aud-web/src/components/demo/DemoOrchestrator.tsx`

`DemoOrchestrator` owns the current demo step and exposes a context so any surface can detect demo mode:

```ts
interface DemoContextValue {
  activeStep: DemoStep
  nextStep: () => void
  prevStep: () => void
  goToStep: (id: DemoStepId) => void
  isDemoMode: boolean
  exitDemo: () => void
}
```

- Hooks:
  - `useDemo()` – strict hook, throws if used outside the provider.
  - `useOptionalDemo()` – safe, returns `DemoContextValue | null` and is used by OS surfaces.
- Behaviour:
  - Internally tracks `activeStepIndex` over `DEMO_STEPS`.
  - `nextStep` advances through the script. When the `end` step is active, `nextStep` and `exitDemo` both `router.push('/os')` to drop you back at the launcher.
  - `prevStep` steps backwards but never before index `0`.
  - `goToStep(id)` jumps to a specific step, used by the step indicator.
  - On mount, sets a global flag `window.__TA_DEMO__ = true` and clears it on unmount so non-demo routes can cheaply detect demo context without wiring props.
  - Optional `autoAdvance` support is wired in (not heavily used yet) so future steps can advance automatically after a delay.

The provider renders children and always includes the overlay:

```tsx
<DemoContext.Provider value={value}>
  {children}
  <DemoOverlay />
</DemoContext.Provider>
```

### Demo overlay and step indicator

- **Files:**
  - `apps/aud-web/src/components/demo/DemoOverlay.tsx`
  - `apps/aud-web/src/components/demo/DemoStepIndicator.tsx`

**DemoOverlay**

- Reads `activeStep`, `nextStep`, `prevStep`, and `exitDemo` from `useDemo()`.
- UI:
  - Top-left rounded pill: `totalaud.io — Artist journey: LANA GLASS`.
  - Bottom-centre glass panel (`bg-black/70`, `border-white/10`, `backdrop-blur-sm`) containing:
    - Step title.
    - Description.
    - Optional `helpText` for scripted hints.
    - Right-hand small status block on larger screens: step number and “demo mode” label.
    - Controls:
      - **Back** – calls `prevStep`, disabled on the first step.
      - **Next / custom CTA** – label derives from `ctaLabel` or defaults to “Next”, calls `nextStep`.
      - **Exit demo** – explicit button on the right that calls `exitDemo` and returns to `/os`.
- Uses `pointer-events-none` on the full-screen wrapper and `pointer-events-auto` only on the panel so the underlying OS surfaces remain interactive.

**DemoStepIndicator**

- Renders a small row of dots showing all “active” steps.
- Highlights the current step and allows clicking a dot to `goToStep(id)`.
- Also shows a compact `step X/Y` label on larger screens.

### Demo entry route and shell

- **File:** `apps/aud-web/src/app/demo/artist/page.tsx`

This is the single entry point for the cinematic demo:

- Declared as a client component.
- Renders all OS surfaces inside `DemoOrchestrator` using a small shell:

```tsx
export default function ArtistDemoPage() {
  return (
    <DemoOrchestrator>
      <DemoOSShell />
    </DemoOrchestrator>
  )
}
```

**DemoOSShell**

- Reads the current step from `useDemo()`, and switches which OS surface to render based on `activeStep.os`.
- Reuses the OS layout pattern from `app/os/layout.tsx` by wrapping the chosen surface in `OSLayout` so it inherits the full-screen, black background creative container.
- Imported surfaces:
  - `AnalogueOSPage`
  - `AsciiOSPage`
  - `XPOSPage`
  - `LoopOSPage`
  - `AquaOSPage`

This means the same OS implementations are used for both the demo and the real `/os/*` routes – the demo just orchestrates which one is currently visible and adds narrative on top.

### How demo mode is exposed to OS surfaces

**Primary mechanism:** `useOptionalDemo()` from `DemoOrchestrator`.

- Any OS surface can call:

```ts
const demo = useOptionalDemo()
const isDemoMode =
  demo?.isDemoMode ||
  (typeof window !== 'undefined' && (window as any).__TA_DEMO__ === true)
```

- When running under `/demo/artist`, both the context and the global flag are present.
- On normal routes (`/os/*`), `useOptionalDemo()` returns `null` and the global flag is unset, so `isDemoMode` is `false`.

This gives us:

- A React-first way for components rendered inside `DemoOrchestrator` to behave differently.
- A safe global escape hatch (`window.__TA_DEMO__`) for any other code that needs a cheap check without pulling in React context.

### Demo data seeding – Analogue

- **File:** `apps/aud-web/src/app/os/analogue/page.tsx`

Analogue OS seeds LANA GLASS notebook data for the demo:

- Imports `useOptionalDemo` and derives `isDemoMode`.
- On mount, when `isDemoMode` is true, it replaces the default cards with a curated set:
  - **Ideas**
    - `midnight signals — concept`
    - Left-field electronic pop description with neon/glass textures.
  - **Ideas / Notes**
    - `visual mood / colours`
    - Palette and visual language for the EP.
  - **Campaigns**
    - `campaign idea: pirate radio signals`
    - Concept around “lost broadcast” / intercepted transmissions.
  - **Notes**
    - `lana glass – profile snapshot`
    - Short bio anchored in the actual target audience and scene.

This lives purely in React state – no Supabase reads or writes – and only activates in demo mode.

### Demo data seeding – ASCII

- **File:** `apps/aud-web/src/components/os/ascii/AsciiCommandBar.tsx`

ASCII OS pre-fills the log with demo-friendly system messages:

- Imports `useOptionalDemo` and derives `isDemoMode`.
- On mount, when in demo mode, calls `appendLog` with:
  - “Welcome to the LANA GLASS demo session.”
  - “Try: agent run coach "Suggest how to announce the ‘Midnight Signals’ EP."”

The rest of the command bar is unchanged:

- `agent run`, `agent status`, and `agent last` all behave as normal, so agents can actually fire during the demo.
- `os`, `sendnote`, `logxp`, and other commands still work, but they don’t touch persistent data.

### Demo data seeding – LoopOS

- **Store file:** `apps/aud-web/src/components/os/loopos/useLoopOSLocalStore.ts`
- **Surface file:** `apps/aud-web/src/app/os/loopos/page.tsx`

LoopOS has a dedicated, demo-safe initialiser inside the local store:

- Added to `LoopOSState`:

```ts
initialiseDemoLoopIfNeeded: (payload: {
  bpm?: number
  zoom?: number
  clips: Array<{
    lane: LoopOSLane
    start: number
    length: number
    name: string
    notes: string
    loopOSReady?: boolean
  }>
}) => void
```

- Implementation:
  - If `state.clips.length > 0`, it returns the existing state unchanged.
  - Otherwise it:
    - Generates new clip IDs via the existing `nextClipId` helper.
    - Seeds `clips` from the payload.
    - Recomputes `sequencedClips`, `momentum`, and `nextActionClips`.
    - Resets transient state and optionally updates `bpm` / `zoom`.

LoopOS page wiring:

- Imports `useOptionalDemo` and calculates `isDemoMode`.
- **Supabase bootstrap (`bootstrapLoop`)**
  - Short-circuits entirely when `isDemoMode` is true, so no `loopos_loops` row is created or loaded.
- **Supabase save effect**
  - Immediately returns when `isDemoMode` is true, so no `loopos_clips` rows are written or synced.
- **Demo initialisation effect**
  - When `isDemoMode` is true, calls `initialiseDemoLoopIfNeeded` with a LANA-specific loop:
    - **Creative lane**
      - `write lead single – midnight signals`
      - `record vocals – lana glass`
    - **Promo lane**
      - `send to key blogs`
      - `tiktok teaser run`
    - **Analysis lane**
      - `check stats & refine pitch`

In demo mode, LoopOS is now purely local state – no Supabase reads/writes – so the demo can’t corrupt or overwrite a real user’s loop.

### Demo data seeding – Aqua

- **File:** `apps/aud-web/src/app/os/aqua/page.tsx`

Aqua EPK / pitch workbench pre-fills the core fields for LANA GLASS:

- Imports `useOptionalDemo` and calculates `isDemoMode`.
- On mount, when in demo mode:
  - `artistName` → `LANA GLASS`
  - `releaseName` → `MIDNIGHT SIGNALS`
  - `elevatorPitch` → one-line description of the sound and use case.
  - `story` → short paragraph about the EP’s theme and positioning.

From here, the usual flows are still available:

- `Ask Coach about this pitch` spawns a real `coach` agent run.
- Bridges out to XP, DAW, and back to Analogue all function as normal – they just operate on demo data.

### XP behaviour

- **Files:**
  - `apps/aud-web/src/app/os/xp/page.tsx`
  - `apps/aud-web/src/components/os/xp/apps/XPProcessViewer.tsx`
  - `apps/aud-web/src/components/os/xp/apps/XPClipboardApp.tsx`

XP OS is left intentionally “real”:

- It already:
  - Watches the agent kernel and renders runs in `XPProcessViewer`.
  - Shows clipboard updates from ASCII and other bridges inside `XPClipboardApp`.
- No additional seeding is required:
  - In the demo flow, agents spawned from ASCII and Aqua naturally show up here, which matches the narrative of “XP as Agent Monitor”.

### Read-only and reversible behaviour

- All demo-specific state lives in:
  - React component state (Analogue cards, Aqua fields).
  - In-memory Zustand store (LoopOS local store).
  - AgentKernel in-memory runs.
- Supabase-related behaviour:
  - LoopOS:
    - **Demo:** no fetches, no inserts, no updates, no deletes.
    - **Real OS routes:** unchanged and still use the persistence logic.
  - Other OS surfaces don’t persist anything by default, so demo mode doesn’t alter their storage behaviour.
- Global flag:
  - `window.__TA_DEMO__` is set only while `/demo/artist` is mounted and cleared on unmount.
  - If you refresh or navigate away, you’re back to normal behaviour.

### How to run the demo

1. Start the web app:

```bash
pnpm dev:web
```

2. Visit the artist demo route:

```text
http://localhost:3000/demo/artist
```

3. Drive the demo:
   - Use **Next / Back / Exit demo** in the overlay to move between steps.
   - Interact with the OS surfaces underneath:
     - Analogue – click into LANA’s cards, imagine sending ideas downstream.
     - ASCII – run a `coach` agent against the EP.
     - XP – watch the Agent Monitor and clipboard windows.
     - LoopOS – scroll the loop, inspect clips, try AI suggestions.
     - Aqua – tweak the EPK copy and ask Coach about the pitch.

The result should feel like a short, cinematic tour of the constellation rather than “just a dev console”.

### Future ideas

- **Multi-artist demos**
  - Parameterise the script and seeding so you can switch between LANA GLASS and other archetypes (band, label, PR agency).
  - Add a simple selector on `/demo` to choose a storyline.
- **TAP-integrated demos**
  - Wire demo mode into TAP-specific flows so you can show how external campaigns plug into Audio Intel and Playlist Pulse.
  - Add skippable beats that jump straight into TAP surfaces for deeper dives.
- **Recording / screenshot helpers**
  - Lightweight “record script” mode that:
    - Hides the overlay chrome.
    - Nudges the UI into a clean framing for Loom or promo reels.
  - One-click capture of key beats as screenshots for decks and landing pages.


