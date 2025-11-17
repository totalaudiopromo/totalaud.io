## Phase 23 – LoopOS Timeline UI (Engine v1)

LoopOS is a new, UI-first timeline surface mounted at `/os/loopos`. It is fully local (no backend, no agents) and designed so Phase 24 can drop real engines in without reshaping the UI.

---

### Component Map

- **Route**
  - `apps/aud-web/src/app/os/loopos/page.tsx`
    - Top-level LoopOS surface (client component)
    - Wires the local store, timeline, inspector, momentum bar, and minimap

- **Container & Shell (`apps/aud-web/src/components/os/loopos/`)**
  - `LoopOSContainer`
    - Matte black, Slate Cyan (#3AA9BE)–accented OS surface
    - Provides atmospheric grid + glow, wraps the entire LoopOS UI
  - `LoopOSToolbar`
    - Top toolbar: Play/Stop, BPM slider (UI-only), Zoom controls, Add Clip, Clear Selection, Toggle Grid
    - Uses `useThemeAudio` for click/success sounds
  - `LoopOSTimeline`
    - Scrollable horizontal canvas of `LoopOSTrack` rows
    - Renders grid (bars × tracks), `LoopOSPlayhead`, and tracks
    - Reports scroll position for the minimap
  - `LoopOSTrack`
    - Single lane row (`creative | action | promo | analysis | refine`)
    - Left label panel (~160px) + lane area rendering `LoopOSClip` blocks
  - `LoopOSClip`
    - Individual clip block (rounded, lane-coloured)
    - Horizontal drag to move; left/right handles to resize
    - Click to select; double-click toggles LoopOS-ready (shows “▣ LoopOS ∞” badge)
    - Uses `useThemeAudio` on click
  - `LoopOSPlayhead`
    - Vertical cyan playhead line spanning all tracks
    - Position driven by `playhead` units; drag/seeking via pointer on the timeline
  - `LoopOSInspector`
    - Right-hand inspector for the selected clip
    - Fields: Name, Lane (select), Notes, LoopOS-ready toggle
    - Buttons: Send to Aqua / Analogue / XP, Mark for LoopOS, Delete clip
    - Bridges out via OSBridges (see below)
  - `LoopOSMomentumBar`
    - Bottom fake “momentum” indicator (0–1)
    - Renders a colour-coded bar: green (high), yellow (steady), red (low)
  - `LoopOSMiniMap`
    - Top-right minimap showing an overview of the entire loop
    - Displays clip blocks by lane, the playhead marker, and current viewport window
    - Drag/click scrubs the main timeline via scroll changes
  - `useLoopOSLocalStore`
    - Local Zustand store that powers LoopOS (no persistence)
  - `index.ts`
    - Barrel file exporting all of the above

---

### Store Schema – `useLoopOSLocalStore` (Phase 24 updated)

```ts
export type LoopOSLane = 'creative' | 'action' | 'promo' | 'analysis' | 'refine'

export interface LoopOSClipData {
  id: string
  lane: LoopOSLane
  start: number    // timeline units
  length: number   // timeline units
  name: string
  notes: string
  loopOSReady: boolean
}
```

Store shape (Phase 23):

```ts
{
  tracks: LoopOSLane[]           // ['creative','action','promo','analysis','refine']
  clips: LoopOSClipData[]
  selectedClipId: string | null
  playhead: number               // timeline units
  isPlaying: boolean
  bpm: number                    // 60–180, UI-only
  zoom: number                   // 0.5–2, affects unit width
  momentum: number               // 0–1, fake momentum for Phase 23

  // Core actions
  setBpm(bpm: number)
  addClip(lane: LoopOSLane, partial?: Partial<Omit<LoopOSClipData, 'id' | 'lane'>>)
  updateClip(id: string, partial: Partial<LoopOSClipData>)
  deleteClip(id: string)
  setSelectedClipId(id: string | null)
  toggleLoopOSReady(id: string)
  setPlayhead(updater: number | ((prev: number) => number))
  togglePlay()
  setZoom(zoom: number)

  // Momentum
  computeMomentum()

  // Bridge helpers (incoming from OSBridges)
  addIncomingClip(payload: Extract<OSBridgePayload, { kind: 'daw-to-loopos' }>)
  consumeIncoming(payloads: OSBridgePayload[])

  // Dev / reset
  resetAll()
}
```

**Momentum heuristic (Phase 23 only – now replaced in Phase 24):**

- Calculates clip counts per lane and total clip count.
- Computes:
  - **balanceScore** = higher when clips are spread evenly across lanes.
  - **densityScore** = higher as total clips approach a rough threshold (~16).
- Produces a final 0–1 `momentum` value:
  - `0.2 + 0.6 * balanceScore + 0.2 * densityScore`, clamped to `[0, 1]`.
- This function was isolated so Phase 24 could replace it with a real engine without touching the UI.

In **Phase 24**, the store has been extended with a real engine layer:

```ts
{
  tracks: LoopOSLane[]
  clips: LoopOSClipData[]
  sequencedClips: SequencedClip[]      // clips with end/conflicts/blockedBy
  momentum: MomentumResult | null      // engine-computed 0–1 score + label/reasons
  nextActionClips: SequencedClip[]     // derived “ready” clips ahead of playhead
  selectedClipId: string | null
  playhead: number
  isPlaying: boolean
  bpm: number
  zoom: number
  lastTickTimestamp: number | null

  setBpm(bpm: number)
  addClip(lane: LoopOSLane, partial?: Partial<Omit<LoopOSClipData, 'id' | 'lane'>>)
  updateClip(id: string, partial: Partial<LoopOSClipData>)
  deleteClip(id: string)
  setSelectedClipId(id: string | null)
  toggleLoopOSReady(id: string)
  setPlayhead(value: number)
  setZoom(zoom: number)
  startPlayback()
  stopPlayback()
  engineTick(now: number)

  addIncomingClip(payload: Extract<OSBridgePayload, { kind: 'daw-to-loopos' }>)
  consumeIncoming(payloads: OSBridgePayload[])
  resetAll()
}
```

The old `computeMomentum()` helper is no longer used – momentum is now provided by the pure `momentumEngine`.

---

### Bridge Hooks & Flow

LoopOS uses the existing OSBridges pattern (no backend, in-memory only).

#### Bridge Types (OSBridges)

New bridge payloads added in `OSBridges.ts`:

- **Incoming to LoopOS**
  - `daw-to-loopos`
    - `lane: LoopOSLane`
    - `name: string`
    - `notes: string`

- **Outgoing from LoopOS**
  - `loopos-to-aqua`
    - `name: string`
    - `notes: string`
    - `lane: LoopOSLane`
  - `loopos-to-analogue`
    - `title: string`
    - `body: string`
    - `lane: LoopOSLane`
  - `loopos-to-xp`
    - `clipboardText: string`

LoopOS is also added as a valid bridge target key (in-memory only, not a full OS slug):

- `BridgeTarget = OSSlug | 'loopos'`

#### Incoming Flow – DAW → LoopOS

- When LoopOS mounts (`/os/loopos`):
  - `consumeOSBridges('loopos')` retrieves any queued payloads.
  - `useLoopOSLocalStore().consumeIncoming(payloads)`:
    - Filters to `daw-to-loopos` payloads.
    - For each, calls `addIncomingClip(payload)` to create a new `LoopOSClipData`.
      - Lane, name, notes mapped directly.
      - `start = 0`, `length = 4`, `loopOSReady = false`.
    - Auto-selects the newest clip.
  - `computeMomentum()` recomputes the fake momentum score after ingestion.

> Phase 23 only wires the **consumer** side; producers like DAW can start queueing `daw-to-loopos` payloads without changes to LoopOS.

#### Outgoing Flow – LoopOS Inspector → Other OSes

In `LoopOSInspector`, the selected clip can be sent to other OS surfaces:

- **Send to Aqua**
  - Queues:
    - `queueOSBridge('aqua', { kind: 'loopos-to-aqua', name, notes, lane })`
  - Calls `setOS('aqua')`.
- **Send to Analogue**
  - Queues:
    - `queueOSBridge('analogue', { kind: 'loopos-to-analogue', title: name, body: notes, lane })`
  - Calls `setOS('analogue')`.
- **Send to XP**
  - Builds a clipboard-friendly summary of the clip and queues:
    - `queueOSBridge('xp', { kind: 'loopos-to-xp', clipboardText })`
  - Calls `setOS('xp')`.

These are pure UI-side moves – no scheduling or engine semantics yet.

---

### Future Extension Notes (Phase 25 and beyond)

- **Scheduling & Execution**
  - Attach timestamps / cycles to `LoopOSClipData`:
    - Fields like `cycleIndex`, `startAt`, `repeatEvery`, `status`.
  - Add engine state (e.g. `scheduledTasks`, `activeCycle`) either to:
    - A separate engine store that reads from LoopOS clips, or
    - Extended `useLoopOSLocalStore` with clearly separated `engine` keys.
  - Keep the timeline UI mostly presentational: interpret engine state via derived selectors.

- **Bridges: DAW / Aqua / Analogue / XP**
  - **DAW → LoopOS**:
    - Expand `daw-to-loopos` payloads to include more structured metadata:
      - e.g. `duration`, `channel`, `intensity`, `phase`.
    - Use this metadata to pre-classify clips into lanes or tag them for engines.
  - **LoopOS → Aqua / Analogue / XP**:
    - Layer in “engine hints” on outgoing bridged payloads:
      - e.g. `priority`, `cycleId`, `momentumScore`.
    - Allow receiving OS surfaces to push edited content back into LoopOS clips.

- **Timeline UX Enhancements**
  - Snap dragging/resizing to a configurable grid (bars / beats or arbitrary units).
  - Add inline badges for:
    - Engine status (e.g. queued, running, complete).
    - Dependencies between clips (arrows, links).
  - Allow multi-select + batch operations (mark multiple clips LoopOS-ready, move groups).

- **Accessibility & Motion**
  - The current implementation already respects reduced-motion via Framer Motion.
  - Phase 24 can:
    - Add keyboard controls for playhead and clip selection/movement.
    - Expose a per-OS reduced-motion switch that ties into the theme engine.

---

### Quick Usage Notes

- Visit `/os/loopos` to open the LoopOS surface.
- Use the **toolbar** to:
  - Play/Stop the timeline (UI-only playhead movement).
  - Adjust BPM and zoom.
  - Add clips in the currently visible region.
  - Toggle the visual grid and clear clip selection.
- **Drag clips** horizontally to re-sequence, and resize from either side to adjust length.
- **Inspector**:
  - Edit lane, name, and notes.
  - Toggle “LoopOS-ready” (purely visual for Phase 23).
  - Send clips to Aqua / Analogue / XP via OSBridges.
- **Momentum bar** and **minimap** are fake-but-functional:
  - Momentum reflects clip count + lane balance only.
  - Minimap lets you scrub the main timeline without changing any real scheduling yet.


