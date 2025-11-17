## Phase 26 – LoopOS Agent Kernel

### Overview

Phase 26 introduces a frontend AgentKernel in `aud-web` that makes the existing agent system visible and controllable across the OS constellation without adding new backend tables. Agents stay ephemeral on the client while still running through the shared AI stack via a thin `/api/agents/run` wrapper.

### AgentKernel architecture

- **Location**: `apps/aud-web/src/components/agents/*`
- **Context provider**: `AgentKernelProvider` wraps `RootLayoutClient` **inside** `OSProvider` so all OS surfaces can access it.
- **Hook**: `useAgentKernel()` exposes state and actions.
- **State shape** (`AgentKernelState`):
  - `runs: AgentRun[]`
  - `activeRunId: string | null`
- **AgentRun**:
  - `id: string`
  - `role: 'scout' | 'coach' | 'tracker' | 'insight' | 'custom'`
  - `status: 'idle' | 'queued' | 'running' | 'done' | 'error'`
  - `originOS: OSSlug | 'loopos'`
  - `target?: { loopId?: string; clipId?: string; osSlug?: OSSlug | 'loopos' }`
  - `input: string`
  - `output?: string`
  - `errorMessage?: string`
  - `createdAt: string`
  - `startedAt?: string`
  - `finishedAt?: string`
- **Actions** (`AgentKernelActions`):
  - `spawnAgentRun({ role, originOS, target?, input }): Promise<void>`
    - Creates a run with status `queued`, then `running`, then `done` / `error`.
    - Calls `POST /api/agents/run`.
    - Stores `output` or `errorMessage` on completion.
  - `setActiveRun(id | null)`
  - `updateRun(id, patch)`
  - `clearCompletedRuns()` – drops `done` / `error` runs but keeps queued/running.

Runs are kept entirely in-memory on the client for this phase. They are not persisted to the app database.

### `/api/agents/run` interface

- **Route**: `POST /api/agents/run`
- **Location**: `apps/aud-web/src/app/api/agents/run/route.ts`
- **Request body**:
  - `role`: `'scout' | 'coach' | 'tracker' | 'insight' | 'custom'`
  - `input`: `string` – user instruction / context
  - `originOS?`: `string` – optional origin label
  - `loopContext?`: `{ loopId?: string; clipId?: string; osSlug?: string }`
- **Auth**:
  - Uses `createRouteSupabaseClient().auth.getSession()`.
  - Returns `401` if not authenticated, `500` if session verification fails.
- **Behaviour**:
  - Logs a lightweight event via `logger.scope('AgentRunAPI')`.
  - Uses the `@total-audio/core-ai-provider` `complete()` helper with a role-specific system prompt to generate plain-text output.
  - No new tables are created; this is intentionally a thin, non-persistent wrapper for Phase 26.
- **Response**:
  - `200 { output: string }` on success.
  - `400 { error: 'Invalid request', details: ZodError[] }` on validation failure.
  - `4xx/5xx { error: string, message?: string }` on auth/other errors.

### ASCII OS – Agent CLI

- **File**: `AsciiCommandBar.tsx`
- **Hook**: `useAgentKernel()` is used inside the command bar.
- **New commands**:
  - `agent run <role> "<instruction>"`
    - Roles: `scout | coach | tracker | insight`.
    - Example:
      - `agent run coach "Suggest a better structure for this loop."`
      - `agent run scout "Research 3 ideas for TikTok content this week."`
    - Behaviour:
      - Calls `spawnAgentRun({ role, originOS: 'ascii', input })`.
      - Logs `Spawned <role> agent: <preview>`.
  - `agent status`
    - Summarises kernel state:
      - `Agent kernel: N runs · X running · Y done · Z errors.`
  - `agent last`
    - Prints the last completed run’s output (truncated) with role + origin.
  - `loop suggest`
    - Shortcut for:
      - `spawnAgentRun({ role: 'coach', originOS: 'ascii', input: "Look at the current promotion loop and suggest the next few clips or actions to keep momentum going." })`.
- All commands log feedback into the ASCII log so nothing feels like a black box.

### XP OS – Agent Monitor

- **Files**:
  - `XPProcessViewer.tsx`
  - `XPClipboardApp.tsx` (unchanged, but used by Agent details)
  - `xpWindowStore.ts` / `XPStartMenu.tsx`
- **Window**:
  - The existing “Process Viewer” window has been upgraded into an **Agent Monitor**.
  - `XPWindowType.processes` now uses title `Agent Monitor`.
  - Start menu entry label changed to “Agent Monitor”.
- **Layout**:
  - Left panel: core XP processes list (`audio.engine`, `xp.window.manager`, etc).
  - Right panel:
    - `AgentRunList`:
      - Shows runs (most recent first) with role badge, origin OS, status pill, created time, and input preview.
      - Includes a “Clear completed” button wired to `clearCompletedRuns()`.
    - `AgentRunDetails`:
      - Shows role, origin, timestamps.
      - Full input and output panes (scrollable).
      - Error message if status is `error`.
      - Buttons:
        - **Copy output** – uses `navigator.clipboard.writeText` with graceful error handling.
        - **Send to XP Clipboard** – uses `pushXPClipboardUpdate(output, 'append')` so agent replies flow into the existing clipboard window.

This makes XP the central “Multi-Agent Brain (Lite)” dashboard while staying lightweight.

### LoopOS Inspector → Agent wiring

- **File**: `LoopOSInspector.tsx`
- **Props extended**:
  - New `loopId: string | null` prop, passed from `LoopOSPage`.
- **Hook**:
  - Uses `useAgentKernel()` to spawn runs with `originOS: 'loopos'`.
- **New “Ask an agent” section**:
  - Sits beneath AI suggestions and above the momentum snapshot.
  - **Role select**:
    - Roles: `Coach` (default), `Scout`, `Tracker`, `Insight`.
  - **Buttons**:
    - “Ask about selected clip”
      - Requires a selected clip; otherwise shows a small warning.
      - Builds an input string with:
        - Clip name, lane, notes.
        - Current momentum label/score if available.
        - A short question about next moves for this clip.
      - Calls:
        - `spawnAgentRun({ role, originOS: 'loopos', target: { loopId, clipId, osSlug: 'loopos' }, input })`.
    - “Ask about the whole loop”
      - Uses `summariseLoop({ clips, momentum, nextActionClips: sequencedClips, selectedClip })`.
      - Falls back to a simple stats summary if summariser is unavailable.
      - Calls:
        - `spawnAgentRun({ role, originOS: 'loopos', target: { loopId, osSlug: 'loopos' }, input: "<loop summary + question>" })`.
- Errors in agent calls show a small, non-blocking message in the inspector; the main loop UI is never blocked.

*(Note: For Phase 26, agent responses are not auto-written back into LoopOS clips; all agent output is surfaced via the XP Agent Monitor and clipboard.)*

### Aqua OS – Coach hook

- **File**: `apps/aud-web/src/app/os/aqua/page.tsx`
- **Hook**: `useAgentKernel()`.
- **UI**:
  - Adds a small inline action in the main EPK workbench window:
    - “Ask Coach about this pitch”
- **Behaviour**:
  - Builds a summary from the current Aqua fields:
    - Artist, release, elevator pitch, story.
  - Calls:
    - `spawnAgentRun({ role: 'coach', originOS: 'aqua', input: "<summary + request for sharper structure/phrasing>" })`.
  - Output is inspected via XP’s Agent Monitor / clipboard; Aqua itself stays write-only in this phase.

### Analogue OS – Scout hook

- **Files**:
  - `AnalogueCard.tsx`
  - `apps/aud-web/src/app/os/analogue/page.tsx`
- **UI**:
  - Each card gains an extra inline action:
    - “ask scout for ideas”
- **Behaviour**:
  - From `AnalogueOSPage`, each card’s button:
    - Builds a prompt:
      - `Title: <card.title>`
      - `Body: <card.body>`
      - Instruction: “Suggest 3 concrete, actionable ideas.”
    - Calls:
      - `spawnAgentRun({ role: 'scout', originOS: 'analogue', input })`.
    - Logs a local activity line: `Asked Scout for ideas on "<title>".`
  - Again, results are inspected in XP; Analogue doesn’t auto-insert agent text yet.

### UX, safety, and motion

- All agent errors are converted into user-friendly `errorMessage` strings on the run; UI never throws.
- ASCII and LoopOS log / display failures textually instead of blocking.
- `AgentKernelProvider` plays:
  - `click` sound on spawn.
  - `success` sound on successful completion.
- Reduced motion:
  - Existing motion in OS surfaces is respected; new components don’t add heavy animation.
- No new database tables are created; AgentKernel state lives purely in the client.

### Future directions

- **Persistence**:
  - Store agent runs in Supabase (per user, per session) so XP Agent Monitor can show history and replay.
- **Deeper agent-executor integration**:
  - Route `/api/agents/run` through `runAgentWorkflow` and skill flows per role.
  - Use skills-engine YAML to define loop-specific and Aqua/Analogue-specific skills.
- **LoopOS feedback loop**:
  - Let LoopOS append “Agent notes” back onto clips and loops with explicit user approval.
  - Provide suggested clips / edits as structured data instead of plain text.
- **Analogue + Aqua upgrades**:
  - Let users send chosen agent outputs directly back into cards, pitches, or DAW lanes.
  - Add lightweight “Agent traces” in the Analogue activity log for long-running sessions.


