## Phase 29 – Multi-Agent Brain, Personas, Mood, Export, Core OS

This document summarises the full implementation of Phases 29A–29E inside `aud-web`. All work is client-side, OS surfaces remain visually intact, LoopOS persistence is unchanged, and `/api/agents/run` stays the single agent entrypoint.

---

## 29A – Multi-Agent Brain (Teams)

- **New directory**
  - `apps/aud-web/src/components/agents/teams/`
- **New modules**
  - `agentTeamPresets.ts`
    - Defines `AgentTeamId` (`creative_team`, `promo_team`, `analysis_team`, `loopos_team`).
    - Each preset contains `sequence: AgentRole[]` plus optional `when` conditions: `{ os?: AgentOriginOS[]; loopMomentumMin?: number }`.
  - `AgentTeamOrchestrator.tsx`
    - Provides `AgentTeamOrchestratorProvider` and `useAgentTeams()`.
    - Tracks `teamRuns` with ordered steps and statuses.
    - Sequentially calls `spawnAgentRun` for each role, attaching `meta` (`teamRunId`, `teamId`, `teamStepIndex`, `personaId`).
    - Auto-bridges outputs via `queueOSBridge`:
      - **Scout** → Analogue (`loopos-to-analogue` cards).
      - **Coach** → Aqua (`loopos-to-aqua` pitch extensions).
      - **Insight** → LoopOS (`daw-to-loopos` analysis clips).
      - **Tracker** → XP (`loopos-to-xp` clipboard summaries).
- **Agent kernel integration**
  - `AgentRun` extended with `meta` field and optional team metadata.
  - `SpawnAgentRunParams` extended with optional `meta`.
  - `spawnAgentRun` now returns `{ id, output?: string | null } | null` while remaining backwards compatible for existing callers.
- **UI extensions**
  - **Analogue OS**
    - `AnalogueCard` gains optional `onAskCreativeTeam`.
    - `AnalogueOSPage` wires a new per-card action: **“ask creative team”** → runs `creative_team` with the card title/body as context and logs to the activity log.
  - **ASCII OS**
    - `AsciiCommandBar` now supports:
      - `agent team <id> "<instruction>"` to trigger a team (`creative_team`, `promo_team`, `analysis_team`, `loopos_team`) with `originOS: 'ascii'`.
      - Help text updated to list the new team command.
  - **XP Agent Monitor**
    - `XPProcessViewer` consumes `useAgentTeams()` and shows a **“Team runs”** panel summarising step completion and status per `teamRunId`.
  - **LoopOS Inspector**
    - New block **“Ask team about clip”**:
      - Runs `loopos_team` with `originOS: 'loopos'`, passing loop/clip target and `loopMomentum` (for `when.loopMomentumMin`).
      - Results flow into XP / LoopOS via existing bridges.
  - **Aqua OS**
    - `Aqua` adds a text action: **“Run Promo Team on pitch draft”**.
      - Uses `promo_team` with the same prompt used by the existing Coach helper.
- **Demo & narrative safety**
  - Teams are only invoked via explicit user actions (Analogue, ASCII, LoopOS, Aqua).
  - Demo auto-director does not call `runTeam`, so teams bypass the demo unless future beats explicitly wire them in.

---

## 29B – Artist Personas Engine

- **New directory**
  - `apps/aud-web/src/components/persona/`
- **New modules**
  - `personaPresets.ts`
    - Defines `PersonaId` and `PersonaPreset`.
    - Ships the **Lana Glass** preset:
      - `tone`: “late-night neon melancholy with hopeful edges”.
      - `traits`: `['introspective', 'etherial', 'urban ghost stories']`.
      - `aesthetic`: `{ color: '#A0E4FF', accent: '#5FF1CE' }`.
      - `agentBias`: bias map across `scout`, `coach`, `insight`, `tracker`.
  - `usePersona.ts`
    - Exposes `PersonaContext`, `usePersona()`, and `useOptionalPersona()`.
  - `PersonaEngine.tsx`
    - `PersonaEngineProvider` stores:
      - `activePersonaId`, `persona`, `personaBias`, `personaTone`, `personaTraits`.
      - `setPersona(id: PersonaId | null)`.
    - Auto-activates `lana_glass` whenever the pathname starts with `/demo/artist`.
- **Agent prompt injection**
  - `AgentKernelProvider` now:
    - Reads persona context via `useOptionalPersona()`.
    - Merges persona metadata into `run.meta` (`personaId`).
    - Wraps each `input` sent to `/api/agents/run` with a persona header:
      - Persona name, tone, traits.
      - A bias line that hints how strongly to lean into or dial back the role.
    - Sends the persona-augmented `input` to `/api/agents/run` without changing the API contract.
- **Persona-aware OS surfaces**
  - **Analogue**
    - `AnalogueCard` tints card borders using the active persona accent colour, keeping the underlying card palette intact.
  - **ASCII**
    - New commands in `AsciiCommandBar`:
      - `persona` → lists all personas and usage.
      - `persona <id>` → activates a persona (e.g. `persona lana_glass`) and logs tone/traits.
  - **XP Agent Monitor**
    - `AgentRunList` and `AgentRunDetails` surface persona tags per run based on `run.meta.personaId` and presets.
  - **LoopOS**
    - `LoopOSMomentumBar` uses persona tone for Lana to remap momentum labels to “Midnight signal” phrasing while preserving numeric behaviour.
  - **Aqua**
    - `AquaContainer` now tints the main glow using the persona accent colour, blending with existing cyan gradients.
- **Demo**
  - The Lana Glass demo (`/demo/artist`) auto-activates `lana_glass`, so all agent prompts and OS tinting inherit her tone by default.

---

## 29C – Global Mood Engine

- **New directory**
  - `apps/aud-web/src/components/mood/`
- **New modules**
  - `moodPresets.ts`
    - Defines `GlobalMood` union: `'calm' | 'focused' | 'charged' | 'chaotic' | 'idle'`.
    - Provides human-readable labels and descriptions.
  - `useMood.ts`
    - Exposes `MoodContext`, `useMood()`, and `useOptionalMood()`.
  - `MoodEngineProvider.tsx`
    - Global mood model with state:
      - `mood`, `score`, `recentAgentSuccessRate`, `loopMomentum`, `ambientIntensity`, `interactionRate`.
    - Integrations:
      - Reads agent runs via `useAgentKernel()` to compute a rolling success rate.
      - Uses `useAmbient()` for `effectiveIntensity`.
      - `setLoopMomentum(value)` is called from `LoopOSPage` whenever loop momentum changes.
      - Tracks interaction rate from user input via global `click`/`keydown` listeners with decay over time.
    - Mood score:
      - Weighted sum:
        - `0.4 * loopMomentum`
        - `0.3 * agentSuccess`
        - `0.2 * ambientIntensity`
        - `0.1 * interactionRate`
      - Resolves to a `GlobalMood` label via simple thresholds and edge cases for idle/chaotic.
    - Exposes controller:
      - `setLoopMomentum`, `registerInteraction`, `updateMood`.
- **Influence layer (subtle <20% adjustments)**
  - **ASCII**
    - Cursor blink speed in `AsciiCommandBar` varies by mood:
      - Faster for `charged` / `chaotic`, slower for `idle`.
  - **XP**
    - `XPWindow` header glow uses mood to modulate cyan halo intensity (without changing layout).
  - **Aqua**
    - `AquaContainer` blob opacity scales with combined ambient and mood, clamped to keep within subtle bounds.
  - **DAW**
    - `DawGrid` grid brightness is driven by mood, making the grid feel slightly more alive under high-momentum conditions.
  - **Analogue**
    - `AnalogueContainer` adds a soft, mood-driven warmth overlay on the desk background.
  - **Launcher**
    - `OSCard` hover scale subtly increases when the system is more “charged/chaotic”, stays calmer otherwise.
- **Mood panel**
  - Mood debug HUD implemented in `MoodEngineProvider`:
    - Toggle with **Ctrl + Shift + M**.
    - Only active on dev/demo/console routes.
    - Shows live values for mood, score, agent success, loop momentum, ambient, and interaction.

---

## 29D – Export Engine

- **New directory**
  - `apps/aud-web/src/components/export/`
- **New modules**
  - `exportPresets.ts`
    - Defines `ExportArtifactType` and `ExportArtifact` structure: `{ kind, title, body, tags, lane? }`.
  - `exportBuilders.ts`
    - `buildBaseExport` to normalise artefacts.
    - `buildLoopSummaryBody` to generate loop summary text from generic loop/momentum + optional agent insights.
  - `ExportPipeline.ts`
    - `buildPitchDraft(loop, momentum, agentOutput?)`
    - `buildCreativeBrief(analogueCards, loop)`
    - `buildLoopSummary(loop, agentInsights)`
    - `buildCampaignSnapshot(loop, xpClipboard)`
    - `buildStoryFragment(aquaStory, loop, agents?)`
- **OS integrations**
  - **LoopOS Inspector**
    - Existing **“Export loop summary”** actions now call `buildLoopSummary` to generate structured loop artefacts before routing via OSBridges:
      - To Aqua (`loopos-to-aqua`) → pitch-style summary card.
      - To Analogue (`loopos-to-analogue`) → campaign card.
      - To XP (`loopos-to-xp`) → clipboard summary.
  - **Analogue**
    - `AnalogueOSPage` now consumes `loopos-to-analogue` payloads and turns them into new Analogue cards under “Campaigns”.
  - **Aqua**
    - Aqua imports LoopOS exports via existing `loopos-to-aqua` bridges; artefacts now come from `ExportPipeline` titles/bodies.
  - **XP**
    - `XPOSPage` now also listens for `loopos-to-xp` bridge payloads and appends exported summaries into the XP clipboard window.
  - **ASCII**
    - New command `export loop summary` in ASCII logs guidance for using LoopOS inspector’s export actions, keeping the ASCII side stubby but discoverable.
  - **Demo / director**
    - Demo director continues to drive LoopOS and Aqua as before; exports feed into XP / Analogue without any changes to director scripts.

---

## 29E – Core OS (Mission Control)

- **New route**
  - `/os/core`
  - `apps/aud-web/src/app/os/core/page.tsx`
- **New directory**
  - `apps/aud-web/src/components/os/core/`
- **New components**
  - `CoreContainer.tsx`
    - Full-screen mission-control shell that is ambient-, persona-, and mood-aware.
    - Dark “deep space” background with persona-tinted halo and animated vignette.
  - `CoreMap.tsx`
    - Node map for **ASCII, XP, Aqua, DAW, Analogue, LoopOS**.
    - Uses new `subscribeOSBridgeEvents` in `OSBridges` to:
      - Watch bridge events in real time.
      - Highlight edges when bridges fire in the last few seconds.
  - `CorePanels.tsx`
    - Left/right panel cluster:
      - Left: full `AgentRunList` with ordering, using the shared agent kernel.
      - Right: persona traits card + `AgentRunDetails` for the selected run.
  - `CoreMiniFeed.tsx`
    - Mixed feed of:
      - Agent runs (status updates).
      - OS bridges (kinds + targets).
      - Narrative beats (active beat IDs).
      - Mood updates (label + score).
      - Persona changes.
  - `CoreStats.tsx`
    - Aggregate stats:
      - Momentum proxy via mood.
      - Active agent count.
      - Conflicts (errored agent runs).
      - Ambient score.
      - Mood label.
      - OS activity counters derived from `OSProvider` history.
- **Launcher integration**
  - `OSMetadata` extended with new `OSSlug: 'core'`.
  - `OSProvider` updated to parse `/os/core`.
  - `OSLauncher` (`/os`) adds **Core OS card first** in the grid, with a dedicated preview and emerald theme.
- **Demo crescendo**
  - `DemoOrchestrator` now routes the final demo step (`end`) to `/os/core` instead of `/os`, so the Lana Glass demo ends with a Core OS “mission control” view.

---

## New Global Providers & Hooks

- **Providers (Root)**
  - `PersonaEngineProvider` (personas).
  - `AgentKernelProvider` (ephemeral agent kernel).
  - `MoodEngineProvider` (global mood).
  - `AgentTeamOrchestratorProvider` (team runs).
- **Hooks**
  - `usePersona` / `useOptionalPersona`.
  - `useMood` / `useOptionalMood`.
  - `useAgentTeams`.

All providers sit entirely in the client-side tree under `aud-web`’s root layout; the agent kernel remains ephemeral, and no persistence behaviour or LoopOS database wiring was touched.

---

## UX Notes & Constraints

- **Global constraints honoured**
  - All changes are **aud-web only**.
  - No database migrations or new tables.
  - `/api/agents/run` is untouched; all new agent flows still route through this endpoint.
  - LoopOS persistence and Supabase integration remain exactly as before.
  - Ambient engine, demo engine, narrative engine, and OS surfaces continue to work with unchanged routes/layouts.
- **OS surfaces**
  - ASCII, XP, Aqua, DAW, Analogue, and LoopOS all retain their existing visual language and interactions.
  - New mood/persona/team hooks are additive and subtle; no core workflows were removed or significantly altered.
- **Agents & teams**
  - Multi-agent teams are entirely optional, built on top of the existing agent kernel.
  - All team outputs are bridged via `OSBridges`, never by direct component-to-component calls.
- **Demo & narrative**
  - Existing demo beats and director actions still run; only the final redirect now lands in Core OS.
  - Teams are never triggered automatically by the director in this phase.

---

## Future Extensions

- **Teams**
  - Add richer team presets per persona and per tool (e.g. playlist-specific promo teams).
  - Visualise team progress in Core OS with per-step timelines and output previews.
- **Personas**
  - Extend presets beyond Lana (labels, PR agencies, managers) and surface persona selectors in XP / Core OS.
  - Let personas inform LoopOS momentum reasoning more deeply (different momentum heuristics per persona).
- **Mood engine**
  - Bring in more signals (LoopOS validation warnings, ambient audio state, telemetry) to refine mood score.
  - Expose mood to the narrative engine for beat-aware visual flourishes.
- **Export pipeline**
  - Persist artefacts to EPK / campaign entities once server-side export targets are introduced.
  - Add export history views in XP and Core OS to browse past artefacts.
- **Core OS**
  - Add per-node micro-previews that reuse the full OSCard visual language.
  - Wire director actions to Core OS so future demos can orchestrate cross-OS crescendos live.


