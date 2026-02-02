## Phase 24 – LoopOS Engines v1 (Momentum + Sequence)

LoopOS now has a real internal engine layer – still fully client-side and pure TypeScript – that turns the `/os/loopos` surface into a simple but real sequencing environment with momentum scoring and “next actions”.

---

### Engine Modules

- **`sequenceEngine.ts`**
  - Input: `LoopOSClipData[]`
  - Output: `SequencedClip[]` where:
    - `end`: `start + length`
    - `conflicts`: `true` when clips in the same lane overlap in time
    - `blockedBy`: string IDs for simple dependency violations
  - Core functions:
    - `computeSequencedClips(clips)`:
      - Per-lane conflict detection (overlapping ranges mark both clips as `conflicts`).
      - Dependency heuristics:
        - `promo` clips require at least one preceding `creative` or `action` clip.
        - `analysis` clips require at least one preceding `promo` or `creative` clip.
    - `getNextActionClips(sequenced, playhead)`:
      - Returns clips where:
        - `start >= playhead`
        - `!conflicts`
        - `blockedBy.length === 0`
      - Sorted by `start` ascending and truncated to a small list.
    - `validateClipChange(oldClips, updatedClip)`:
      - Ensures `length > 0`.
      - Flags overlaps in the same lane greater than a threshold (0.5 units) for UI messaging.

- **`momentumEngine.ts`**
  - Input: `SequencedClip[]`
  - Output: `MomentumResult`:
    - `score: number` – 0–1 overall momentum
    - `label: 'low' | 'medium' | 'high'`
    - `reasons: string[]` – human-readable explanations
    - `laneWeights: Record<LoopOSLane, number>` – relative contribution by lane
  - Heuristics:
    - **Base score** from clip count:
      - 0 clips → 0 (with `"No clips yet"` reason).
      - ≥ 8 clips → base ~0.6, 1–7 ramp up towards 0.6.
    - **Diversity** bonus:
      - More unique lanes used → +0.1 each, up to +0.3.
    - **Balance** penalty:
      - If one lane exceeds 60% of total length → −0.2 and a reason:
        - `"Promo dominating loop"` when promo is dominant.
        - `"One lane dominating timeline"` otherwise.
    - **Ready clips** bonus:
      - Uses `getNextActionClips(sequenced, 0)` as a readiness proxy.
      - 1–3 ready → +0.1 with `"Multiple clips ready to run"`.
      - >3 ready → +0.2 with `"Several clips ready to run"`.
    - **Conflicts** penalty:
      - Each conflicting clip → −0.05 (capped).
      - `"Several conflicts detected"` reason when any conflicts exist.
    - Label mapping:
      - `< 0.3` → `low`
      - `0.3–0.7` → `medium`
      - `> 0.7` → `high`

- **`timelineMath.ts`**
  - Constants:
    - `BASE_UNIT_WIDTH = 40` – px per unit at 1x zoom.
    - `DEFAULT_TIMELINE_UNITS = 64` – baseline loop length.
  - Functions:
    - `unitToPosition(unit, zoom)` → pixel X.
    - `positionToUnit(pixelX, zoom)` → timeline units.
    - `computePlayheadAdvance(bpm, deltaMs)`:
      - Converts BPM + elapsed milliseconds into timeline units:
        - Uses a simple beats-per-bar / units-per-bar mapping.

All three modules are **pure TypeScript** – no React, no Zustand, no DOM access.

---

### Store Shape & Engine Integration

`useLoopOSLocalStore` now exposes both raw clip data and engine-derived state.

```ts
{
  tracks: LoopOSLane[]
  clips: LoopOSClipData[]
  sequencedClips: SequencedClip[]
  momentum: MomentumResult | null
  nextActionClips: SequencedClip[]

  selectedClipId: string | null
  playhead: number
  isPlaying: boolean
  bpm: number
  zoom: number
  lastTickTimestamp: number | null

  setBpm(bpm: number): void
  addClip(lane: LoopOSLane, partial?: Partial<Omit<LoopOSClipData, 'id' | 'lane'>>): void
  updateClip(id: string, partial: Partial<LoopOSClipData>): void
  deleteClip(id: string): void
  setSelectedClipId(id: string | null): void
  toggleLoopOSReady(id: string): void
  setPlayhead(value: number): void
  setZoom(zoom: number): void
  startPlayback(): void
  stopPlayback(): void
  engineTick(now: number): void

  addIncomingClip(payload: Extract<OSBridgePayload, { kind: 'daw-to-loopos' }>): void
  consumeIncoming(payloads: OSBridgePayload[]): void
  resetAll(): void
}
```

**Recomputation rules:**

- On any clip mutation (`addClip`, `updateClip`, `deleteClip`, `toggleLoopOSReady`, `addIncomingClip`):
  - Recompute `sequencedClips` via `computeSequencedClips(clips)`.
  - Recompute `momentum` via `computeMomentum(sequencedClips)` (or `null` when no clips).
  - Recompute `nextActionClips` via `getNextActionClips(sequencedClips, playhead)`.
- On `setPlayhead(value)`:
  - Clamp playhead within `[0, maxTimelineUnits]`, where:
    - `maxTimelineUnits = max(DEFAULT_TIMELINE_UNITS, maxClipEnd + 4)`.
  - Recompute `nextActionClips` using the new playhead.
- On `engineTick(now)`:
  - If `!isPlaying`:
    - No-op except updating `lastTickTimestamp` to `now` (so playback resumes smoothly).
  - If `isPlaying`:
    - Compute `deltaMs` from `lastTickTimestamp`.
    - Use `computePlayheadAdvance(bpm, deltaMs)` to advance the playhead.
    - Loop the playhead when it passes the current timeline span.
    - Recompute `nextActionClips` against the updated playhead.
    - Update `lastTickTimestamp` to `now`.

All engine calls are **centralised in the store** so components stay relatively dumb.

---

### Playhead Movement & Timeline Integration

- The top-level page (`page.tsx`) now uses:
  - `DEFAULT_TIMELINE_UNITS` from `timelineMath` as the canonical loop length.
  - Store actions:
    - `startPlayback` / `stopPlayback`
    - `engineTick(now)`
    - `setPlayhead(value)` for manual scrubbing
- `LoopOSPlayhead`:
  - Receives `isPlaying`, `playhead`, `zoom`, `height`, `onSeek`, `onEngineTick`.
  - Uses `requestAnimationFrame` to call `onEngineTick(now)` while:
    - `isPlaying === true`
    - `prefersReducedMotion === false`
  - Respecting reduced motion:
    - If the user prefers reduced motion, the playhead does **not** animate continuously.
    - The only updates happen via manual scrubbing (`onSeek`) or explicit state changes.
  - Uses `unitToPosition` / `positionToUnit` for unit↔pixel mapping.

The result: the playhead position is now an **engine-driven timeline value**, not just a cosmetic animation.

---

### UI Surfaces Driven by Engines

- **Timeline / Tracks / Clips**
  - `LoopOSTimeline` now consumes `sequencedClips` instead of raw clips:
    - Per-lane filtering still happens in the component.
    - `LoopOSTrack` receives both per-lane clips and the current `playhead`.
  - `LoopOSClip`:
    - Accepts a `SequencedClip` and a boolean `isActive`.
    - Visuals:
      - Conflicts: red border + glow and a small `"Conflict"` pill.
      - Active clips at the playhead:
        - Subtle ring highlight around the block.

- **Momentum Bar**
  - `LoopOSMomentumBar` now receives `MomentumResult | null`.
  - Uses `momentum.score` and `momentum.label` to:
    - Set bar fill and colour:
      - `low` → red-ish
      - `medium` → amber
      - `high` → green/cyan
    - Render a small numeric badge showing score to 2 decimal places.
  - Adds a **lane breakdown micro-bar**:
    - Segmented mini-bar using `laneWeights`:
      - colours shared with the rest of LoopOS (creative = cyan, action = emerald, etc.).

- **Inspector – Momentum & Next Actions**
  - New sections at the top of `LoopOSInspector`:
    - **Momentum snapshot:**
      - Shows percentage score, label, and any `reasons` from `MomentumResult`.
      - Encourages users to diversify lanes, resolve conflicts, and add ready clips.
    - **Next actions:**
      - Reads `nextActionClips` from the store.
      - Renders clips with lane, name, and start time.
      - Marks clips as:
        - `"Ready now"` when `clip.start <= playhead + ε`.
        - `"Queued"` otherwise.
  - Existing clip editing and bridge buttons (Aqua / Analogue / XP) remain unchanged.

- **MiniMap**
  - `LoopOSMiniMap` now uses `sequencedClips` for its overview:
    - Still displays lane-coloured bars, playhead marker, and viewport window.
    - Scrubbing behaviour is unchanged but now acts over the engine-driven timeline.

---

### Bridges & Engines

- **Incoming – `daw-to-loopos`**
  - `addIncomingClip(payload)` still:
    - Maps `lane`, `name`, `notes` into a new `LoopOSClipData`.
    - Sets `start = 0`, `length = 4`, `loopOSReady = false`.
  - After insertion, the store:
    - Recomputes `sequencedClips`, `momentum`, and `nextActionClips`.
    - Auto-selects the newest clip, as before.

- **Outgoing – `loopos-to-aqua` / `-analogue` / `-xp`**
  - Unchanged in Phase 24:
    - Inspector still fires bridge payloads based purely on the selected clip.
  - Note: momentum and sequencing are **not yet encoded** into outgoing payloads – that’s Phase 25 territory.

---

### Phase 25 Hooks – AI & Backend

This engine layer is designed so Phase 25 can slot in AI and persistence without reshaping the UI again.

Some natural extension points:

- **Persistence**
  - Store `LoopOSClipData` and derived `SequencedClip` snapshots in Supabase:
    - Use `LoopOSClipData` as the authoritative input model.
    - Derive `SequencedClip` server-side for cross-device playback or analytics.
  - Persist:
    - loop definitions (clips per project/release)
    - engine settings (BPM, zoom, lane weights, rule toggles)

- **AI Over `SequencedClip`**
  - Run AI on `SequencedClip[]` to:
    - Suggest new clips to add (filling gaps in lanes or time).
    - Detect unhealthy patterns (promo-heavy loops, no analysis windows, etc.).
    - Auto-generate “next actions” beyond the simple local heuristics.

- **Advanced Momentum Rules**
  - Replace the simple rule-based engine with:
    - Behaviour-driven scoring from historical completion data.
    - Separate sub-scores:
      - Reach / promo intensity
      - Consistency / cadence
      - Depth / analysis + refine balance
    - Per-artist tuning based on their workflows.

The key constraint remains: **keep engine logic modular, pure, and unit-testable**, so it can be shared between client and server (and eventually AI-powered planning) without dragging in UI concerns.


