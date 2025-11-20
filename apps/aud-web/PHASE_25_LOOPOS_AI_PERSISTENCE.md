## Phase 25 – LoopOS AI + Persistence Engine v1

### 1. Persistence model

- **Tables**
  - `loopos_loops`: top-level loop per user
    - `id`, `user_id`, `name`, `bpm`, `zoom`, `created_at`, `updated_at`
  - `loopos_clips`: timeline clips inside a loop
    - `id`, `loop_id`, `lane`, `start`, `length`, `name`, `notes`, `loopos_ready`, timestamps
  - `loopos_insights` (optional, v1 created but not yet used in UI)
    - `id`, `loop_id`, `generated_at`, `insights_json`
- **RLS**
  - `loopos_loops`: `auth.uid() = user_id` for select/insert/update/delete
  - `loopos_clips`: access only allowed if `loopos_loops.user_id = auth.uid()`
  - `loopos_insights`: access only allowed if `loopos_loops.user_id = auth.uid()`
- **Active loop selection**
  - On LoopOS mount:
    - Cookie-aware `supabase.auth.getSession()` via `createClientComponentClient<Database>()`
    - If no session → LoopOS stays fully client-side (no persistence)
    - If session:
      - Query `loopos_loops` for `user_id = session.user.id` ordered by `created_at` asc limit 1
      - If none → auto-create loop with `name = 'My Loop'`
      - Load `loopos_clips` for that loop ordered by `start`
      - Hydrate `useLoopOSLocalStore.loadFromPersisted()` with loop meta + clip rows

### 2. Sync strategy

- **Local-first**
  - All clip and meta changes apply instantly to the local `useLoopOSLocalStore` via:
    - `addClip`, `updateClip`, `deleteClip`
    - `setBpm`, `setZoom`
  - Engines (`sequence`, `momentum`, `timeline`) recompute purely in memory.
- **Debounced persistence**
  - `LoopOSPage` watches `clips`, `bpm`, `zoom`, `loopId`
  - Any change schedules a save with a `250ms` debounce (previous save timeout cleared)
  - Save routine:
    - Re-check session, bail if unauth with a `console.warn`
    - Update `loopos_loops` meta: `bpm`, `zoom`
    - Fetch existing clip ids for the loop
    - Compute:
      - `clipsToInsert`: local ids not in DB
      - `clipsToUpdate`: intersection of local + DB ids
      - `idsToDelete`: DB ids missing locally
    - Apply changes:
      - `insert` new clips
      - `update` existing clips row-by-row
      - `delete` removed clips via `.in('id', idsToDelete)`
- **Error handling**
  - All Supabase calls are wrapped in `try/catch`
  - Failures log via `console.warn('[LoopOS] ...', error)` and **never** block the UI
  - No toasts or blocking modals; the timeline stays playable even if persistence fails
- **Saving indicator**
  - Store tracks `pendingSaves: number`
    - `markSaving()` increments (`pendingSaves + 1`)
    - `markSaved()` decrements and clamps at `>= 0`
  - Toolbar receives `isSaving={pendingSaves > 0}`
    - Shows a tiny pulsing dot + `saving` label while saves are in flight

### 3. AI usage

- **Module**
  - `apps/aud-web/src/components/os/loopos/ai/looposAI.ts`
  - Uses `@total-audio/core-ai-provider` with Anthropic (Haiku) as the small model
- **Functions**
  - `suggestNextClips(sequencedClips, momentum)`
    - System prompt: treat LoopOS as a marketing loop brain across lanes (creative, action, promo, analysis, refine)
    - Input: JSON `{ clips, momentum }`
    - Output (expected): `{ "clips": [{ lane, start, length, name, notes }] }`
    - Returns normalised `SuggestedClipData[]` matching `LoopOSClipData` shape (without id)
  - `suggestMomentumFixes(sequencedClips, momentum)`
    - System prompt: coach-style explanation of why momentum is low / uneven
    - Input: JSON `{ clips, momentum }`
    - Output: `{ "fixes": [string, ...] }`
    - Returns an array of short, concrete tips
  - `summariseLoop({ clips, momentum, nextActionClips?, selectedClip? })`
    - System prompt: high-level loop summary, UK spelling, < 200 words
    - Input: JSON including clips, current momentum, optional next actions and selected clip
    - Output: plain text summary string
- **Guard rails**
  - All AI calls live in `looposAI.ts` – the store never calls AI directly
  - Errors are logged with `console.warn('[LoopOS AI] ...', error)` and return safe fallbacks:
    - `[]` for suggestions/fixes
    - `''` for summaries

### 4. Inspector UX

- **Store shape**
  - `SuggestedClip = Omit<LoopOSClipData, 'id'> & { id: string; source: 'ai' }`
  - `LoopOSState.aiSuggestions`:
    - `{ clips: SuggestedClip[]; fixes: string[] }`
  - Actions:
    - `setAISuggestions({ clips, fixes })`
    - `clearAISuggestions()`
    - `applyAISuggestionClip(id)`
    - `applyAllAISuggestions()`
  - Behaviour:
    - `applyAISuggestionClip(id)`:
      - Find suggestion, call `addClip` with its fields
      - Remove that suggestion from `aiSuggestions.clips`
    - `applyAllAISuggestions()`:
      - Call `addClip` for each suggestion
      - Clear `aiSuggestions.clips` but keep `fixes`
- **AI suggestions block**
  - Lives at the top of `LoopOSInspector`, above warnings/momentum/next actions
  - UI:
    - Header: `🤖 AI suggestions` (tiny uppercase, cyan-accent block with subtle glow)
    - Buttons:
      - `Generate` → `handleGenerateSuggestions`
      - `Apply all` → `handleApplyAllAISuggestions`, disabled when `clips.length === 0`
    - While generating:
      - Shows `thinking...` label
    - Suggestions list:
      - Per clip:
        - Lane pill (colour-coded like the tracks)
        - Name (truncated)
        - Start/end display (`start → start+length` in units)
        - Notes preview (line-clamped)
        - Buttons:
          - `Accept` → `applyAISuggestionClip(id)`
          - `Dismiss` → filters it out of `aiSuggestions.clips`
    - Momentum fixes:
      - If any `aiSuggestions.fixes` exist:
        - "Momentum tips" sub-panel with bullet list of short tips
  - Error handling:
    - If AI fails, a small inline message appears: e.g. `AI unavailable right now. Try again in a minute.`
    - Existing clips and engines are unaffected.
- **Export bridges**
  - New "Export loop summary" section in inspector:
    - Buttons:
      - `Send summary to Aqua`
      - `Send summary to Analogue`
      - `Send summary to XP`
  - Implementation:
    - Each handler calls `summariseLoop({ clips, momentum, nextActionClips, selectedClip })`
    - Falls back to a deterministic summary if AI returns empty:
      - E.g. `LoopOS loop summary: Clips: N, Momentum: 72% (strong)` etc.
    - Bridges:
      - Aqua (`loopos-to-aqua`):
        - `name`: selected clip name or `LoopOS loop summary`
        - `notes`: summary/fallback text
        - `lane`: selected lane or `analysis`
        - Extra (optional): `summaryText`, `momentumLabel`, `source: 'loopos'`
      - Analogue (`loopos-to-analogue`):
        - `title`: `LoopOS loop overview`
        - `body`: summary/fallback text
        - `lane`: selected lane or `analysis`
        - `tag`: `'campaign'` when momentum score > 0.6, otherwise `'idea'`
        - Extra: `summaryText`, `momentumLabel`, `source: 'loopos'`
      - XP (`loopos-to-xp`):
        - `clipboardText`: summary/fallback text
        - Extra: `summaryText`, `momentumLabel`, `source: 'loopos'`
    - All bridges use `queueOSBridge(target, payload)` then `setOS(target)` to switch OS.

### 5. Future hooks / extensions

- **Multi-loop support**
  - Add a loop selector in the LoopOS toolbar:
    - List or dropdown of `loopos_loops` for the user
    - Choose active loop by `loop.id`, then re-run the current bootstrap + hydrate path
  - Add `name` editing for the loop and surface it in the UI.
- **Server-side AI + insights**
  - Move some AI workloads server-side for:
    - Lower client CPU usage
    - Centralised prompt + cost handling
  - Persist `summariseLoop` / suggestion outputs into `loopos_insights`:
    - Enrich with metadata (model, tokens, cost, created_by)
    - Allow users to browse past "reads" of their loop
- **Caching + performance**
  - Cache recent AI suggestions keyed by:
    - Loop id, hash of sequenced clips, and current momentum label
  - Short-circuit AI calls when the same state is requested repeatedly within a short window.
- **Deeper OS bridges**
  - Aqua:
    - Use LoopOS summary to pre-seed campaign briefs or EPK sections.
  - Analogue:
    - Auto-create "loop insight" notebooks with history of summaries.
  - XP:
    - Generate templated tasks from LoopOS tips for quick copy/paste into external tools.


