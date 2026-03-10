## Phase 28C – Artist Journey v2 — Lana Glass Narrative Expansion

**Goal:** evolve the existing LANA GLASS demo at `/demo/artist` into a lightly branching story with beats and choices, without changing engines, persistence, or non-demo behaviour.

### Narrative model

- **Files:**
  - `apps/aud-web/src/components/narrative/narrativeBeats.ts`
  - `apps/aud-web/src/components/narrative/NarrativeEngine.tsx`
  - `apps/aud-web/src/components/narrative/useNarrative.ts`
- **Types:**
  - `NarrativeBeatId`
    - `lana_intro`
    - `idea_fork`
    - `agent_insight`
    - `loop_momentum`
    - `pitch_choice`
    - `epilogue`
  - `NarrativeChoice`
    - `id: string`
    - `label: string` – button text
    - `nextBeatId: NarrativeBeatId`
    - `tag?: 'short_pitch' | 'long_story' | 'campaign_focus' | 'creative_focus'`
  - `NarrativeBeat`
    - `id: NarrativeBeatId`
    - `title: string`
    - `body: string`
    - `os: OSSlug` – `'analogue' | 'ascii' | 'xp' | 'loopos' | 'aqua'`
    - `stepId: DemoStepId` – links beats to existing `DEMO_STEPS`
    - `choices?: NarrativeChoice[]`
    - Optional hints:
      - `highlightCardTitle?: string`
      - `preferAgentRole?: 'scout' | 'coach' | 'insight'`
      - `emphasiseMomentum?: boolean`
  - `NarrativeState`
    - `activeBeatId: NarrativeBeatId`
    - `lastChoiceTags: string[]`
  - `NarrativeFlags`
    - `shortPitch: boolean`
    - `longStory: boolean`
    - `creativeFocus: boolean`
    - `campaignFocus: boolean`

#### Beats for the Lana Glass journey

- **`lana_intro`** – Analogue / `analogue_ideas`
  - Intro to Lana, the “Midnight Signals” EP, and the notebook as the honest first pass.
  - No choices; acts as the opening beat.
- **`idea_fork`** – Analogue / `analogue_send_to_daw`
  - Body: “Do we zoom in on the creative idea or the campaign plan?”
  - Choices:
    - `creative_focus` → “Focus on the creative spark”
    - `campaign_focus` → “Focus on the campaign path”
- **`agent_insight`** – ASCII / `ascii_agent_run`
  - Body: “We’ll ask an agent to crystallise the plan.”
  - `preferAgentRole: 'coach'`.
- **`loop_momentum`** – LoopOS / `loopos_build`
  - Body: “Here’s the loop of creative / promo / analysis / refine.”
  - `emphasiseMomentum: true` to hint at the momentum UI accent.
- **`pitch_choice`** – Aqua / `aqua_pitch`
  - Body: “Now we turn all this into a way of talking about Lana.”
  - Choices:
    - `short_pitch` → “Short, punchy pitch”
    - `long_story` → “Long, narrative story”
- **`epilogue`** – Aqua / `end`
  - Wraps the experience: notebook → agents → loop → pitch.

### Narrative engine & hooks

- **Context + provider:** `NarrativeEngine.tsx`
  - `NarrativeProvider` owns `NarrativeState`:
    - Initial state: `activeBeatId = 'lana_intro'`, `lastChoiceTags = []`.
  - Derived `flags` are computed from `lastChoiceTags`:
    - `shortPitch`, `longStory`, `creativeFocus`, `campaignFocus`.
  - Actions:
    - `goToBeat(id)` – manually set the active beat.
    - `chooseChoice(choice)` – push `choice.tag` into `lastChoiceTags` (if present) and advance to `choice.nextBeatId`.
- **Hooks:** `useNarrative.ts`
  - `useNarrative()` – strict hook, returns:
    - `activeBeat`
    - `flags`
    - `goToBeat`
    - `chooseChoice`
  - `useOptionalNarrative()` – safe variant returning the same shape or `null` when no provider is present.
  - No persistence: state resets when `/demo/artist` unmounts.

### Overlay behaviour – demo copy + choices

- **File:** `apps/aud-web/src/components/demo/DemoOverlay.tsx`
- When `useOptionalNarrative()` is available:
  - The primary title and body in the bottom panel come from the active beat:
    - `beat.title`
    - `beat.body`
  - The existing `DemoStep.helpText` is still rendered underneath as a small “hint” line so the original script remains visible.
  - If `beat.choices` exist:
    - Renders buttons for each choice:
      - Label: `choice.label`
      - `onClick` → `narrative.chooseChoice(choice)`
    - These do **not** interfere with:
      - `Next` / `Back`
      - Director controls (Play / Pause / Skip / Stop)
- If narrative is not present, the overlay falls back to the previous behaviour:
  - Title: `activeStep.title`
  - Body: `activeStep.description`
  - Hint: `activeStep.helpText`

### Narrative influence on existing flows

The narrative layer tweaks prompts and UI accents without changing engines or persistence.

#### ASCII coach command – `agent_insight`

- **File:** `apps/aud-web/src/components/os/ascii/AsciiCommandBar.tsx`
- Helper:
  - `buildLanaCoachCommand(flags: NarrativeFlags | null): string`
    - If `flags.creativeFocus`:
      - `agent run coach "Suggest 3 creative moves for how Lana Glass should announce the 'Midnight Signals' EP."`
    - Else if `flags.campaignFocus`:
      - `agent run coach "Suggest 3 campaign steps to launch Lana Glass's 'Midnight Signals' EP."`
    - Else:
      - `agent run coach "Suggest how to announce Lana Glass's 'Midnight Signals' EP."`
- Uses `useOptionalNarrative()` to read `flags`:
  - **Demo hint text**:
    - The system log intro now prints:
      - “Welcome to the LANA GLASS demo session.”
      - `Try: ${buildLanaCoachCommand(flags)}`
  - **Director’s `TYPE_ASCII` action**:
    - The registered ASCII controller’s `typeCommand` ignores the script payload when narrative is present and instead types `buildLanaCoachCommand(flags)`.
    - Outside demo, or without narrative, it falls back to the original payload string.
- If narrative is absent, ASCII behaves exactly as before.

#### LoopOS momentum emphasis – `loop_momentum`

- **File:** `apps/aud-web/src/components/os/loopos/LoopOSInspector.tsx`
- Imports `useOptionalDemo()` and `useOptionalNarrative()`:
  - `isDemoMode` uses the existing demo context + `window.__TA_DEMO__` flag.
  - `emphasiseMomentum` is `true` when:
    - `isDemoMode === true`, and
    - `narrative.activeBeat.emphasiseMomentum === true` (i.e. on `loop_momentum`).
- When `emphasiseMomentum` is true:
  - The **Momentum snapshot** panel switches to a cyan accent:
    - Cyan border
    - Slight glow ring
  - No behaviour changes:
    - Engines, AI suggestions, and routing to other OS surfaces are unchanged.
- On normal `/os/loopos` usage (non-demo), there is no visual change.

#### Aqua pitch tone – `pitch_choice`

- **File:** `apps/aud-web/src/app/os/aqua/page.tsx`
- Helper:
  - `buildAquaCoachPrompt({ artistName, releaseName, elevatorPitch, story, flags })`
    - Builds a summary block:
      - `Artist`, `Release`, `Pitch`, and `Story` lines.
    - Then tunes the ask based on `flags`:
      - `flags.shortPitch`:
        - Asks for a **tight 1–2 sentence media-friendly pitch** Lana could send to press/playlists.
      - `flags.longStory`:
        - Asks for a **more narrative, paragraph-style** story about the EP that’s still grounded and real.
      - Default:
        - Falls back to the original “Suggest sharper structure and phrasing” wording.
- Uses `useOptionalNarrative()` to read `flags`:
  - **Manual “Ask Coach about this pitch”**:
    - The button now calls `askCoachAboutPitch`, which uses `buildAquaCoachPrompt` with the current narrative flags.
  - **Director’s `OPEN_AQUA_AGENT` action**:
    - Director calls `registerAquaController({ askCoachAboutPitch })` as before, so the same prompt helper is used in auto-demo.
- If narrative / flags are absent, Aqua reverts to the previous single-prompt behaviour.

### Director defaults – narrative branch selection

- **File:** `apps/aud-web/src/components/demo/director/DirectorProvider.tsx`
- Imports `useOptionalNarrative()` and `getNarrativeBeatByStepId(stepId)`.
- During playback, inside `runNextAction()`:
  - For each `DirectorAction`, the provider:
    - Looks up a narrative beat via `stepId`.
    - If the beat has choices and no choice has been recorded for that beat yet, it auto-selects the first choice:
      - For `idea_fork`:
        - Checks `flags.creativeFocus` / `flags.campaignFocus`.
      - For `pitch_choice`:
        - Checks `flags.shortPitch` / `flags.longStory`.
      - If both flags are false for that beat:
        - Calls `narrative.chooseChoice(beat.choices[0])`.
  - This runs before `executeDirectorAction` so ASCIII/Aqua prompts see the chosen branch.
- Behaviour:
  - **Manual demo**:
    - Users can click choices in the overlay at any time; director will detect flags and not override them.
  - **Auto demo**:
    - When the script reaches a beat with choices and no choice has been made yet, Director automatically picks the first option:
      - Default path:
        - `idea_fork` → “Focus on the creative spark” (`creative_focus`).
        - `pitch_choice` → “Short, punchy pitch” (`short_pitch`).

### Wiring into `/demo/artist`

- **File:** `apps/aud-web/src/app/demo/artist/page.tsx`
- Stack:
  - `ArtistDemoPage` now wraps the existing demo shell with `NarrativeProvider`:
    - `<NarrativeProvider>`
      - `<DemoOrchestrator>`
        - `<DemoOSShell />`
      - `</DemoOrchestrator>`
    - `</NarrativeProvider>`
- `DemoOrchestrator` still:
  - Owns the demo step state and context (`useDemo`, `useOptionalDemo`).
  - Wraps children with `DirectorProvider` and always renders `DemoOverlay`.
- Because `NarrativeProvider` sits above `DemoOrchestrator`, both `DirectorProvider` and `DemoOverlay` can safely consume `useOptionalNarrative()`.

### Light copy polish

- **File:** `apps/aud-web/src/components/demo/DemoScript.ts`
- Updated a few descriptions to be shorter and more story-like:
  - `analogue_ideas`:
    - Description → “This is Lana’s notebook for the ‘Midnight Signals’ EP.”
  - `ascii_agent_run`:
    - Description → “Now we bring in a coach agent to help shape the release.”
  - `loopos_build`:
    - Description → “Here we turn ideas into a looping workflow.”
  - `aqua_pitch`:
    - Description → “Then we turn the loop into something you can actually send.”
- Help texts and core behaviour of the demo steps remain unchanged.

### What narrative influences (and what it doesn’t)

- **Influenced by narrative:**
  - ASCII:
    - Demo hint text and the auto-typed coach command use `creative_focus` vs `campaign_focus`.
  - LoopOS:
    - Momentum panel can glow / highlight when the `loop_momentum` beat is active in demo mode.
  - Aqua:
    - “Ask Coach about this pitch” prompt tilts towards:
      - Short, media-ready punchy pitch (`short_pitch`), or
      - Longer narrative story (`long_story`).
  - Director:
    - Auto-chooses default branches when the user doesn’t click choices.
- **Not influenced / unchanged:**
  - LoopOS engines, AgentKernel, AmbientEngine.
  - All `/os/*` routes outside `/demo/artist`.
  - Real data, Supabase persistence, and agent execution behaviour.

### How to test

#### Manual branch – `/demo/artist`

1. Run the web app:
   - `pnpm dev:web`
2. Open the demo:
   - `http://localhost:3000/demo/artist`
3. Without using Director (don’t hit Play demo):
   - Step through using **Next / Back**.
   - Watch the bottom overlay copy come from Narrative beats (title/body) with the original help text as a hint line.
   - Make choices when they appear:
     - At the Analogue fork: pick creative vs campaign focus.
     - At Aqua: pick short vs long pitch.
   - Then:
     - In ASCII, note how the suggested coach command matches your Analogue fork choice.
     - In LoopOS, when you’re on the loop beat, look at the highlighted Momentum panel.
     - In Aqua, click “Ask Coach about this pitch” and check the tone: short snappy vs longer narrative.

#### Auto branch – Director mode

1. On `/demo/artist`, click **Play demo** in the overlay.
2. Let the Director run the script:
   - Analogue → ASCII → XP → LoopOS → Aqua.
3. Watch for:
   - Default branch at the Analogue fork:
     - Director picks the “creative spark” path by default.
   - Default branch at the pitch choice:
     - Director asks for the short, press-style pitch by default.
   - ASCII and Aqua prompts reflecting those defaults.
4. You can still pause, skip, or stop at any point; the narrative layer never blocks manual control.


