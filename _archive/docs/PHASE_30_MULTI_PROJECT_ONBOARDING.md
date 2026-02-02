PHASE 30 — Multi-Project + Multi-Loop + Real Onboarding
=======================================================

Scope implemented (client-side only, under `apps/aud-web`):

- Project engine (`ProjectEngineProvider`, `useProjectEngine`)
  - LocalStorage persistence for projects + current project
  - Demo mode uses an in-memory "Lana Glass Demo Project" that never hits storage
  - First-load redirect to `/onboarding` when no project exists (non-demo)

- Project quick switch
  - ⌘⇧P opens a global project switcher overlay
  - Grid of existing projects + "New project…" card
  - Disabled in demo mode

- OS project awareness (read-only)
  - Analogue: notebook header displays current project name
  - Aqua: pitch panel shows current project beneath the main heading
  - XP: window header renders `Agent Monitor — <project name>`
  - ASCII: `projects` commands for list/use/new (no Supabase side effects)
  - LoopOS: loop selector shows `<project name> · <loop name>` in the context pill

- LoopOS multi-loop support
  - `useLoopOSLocalStore` extended with:
    - `activeLoopId`, `availableLoops`
    - helpers to track / rename / soft-delete loops locally
  - `/os/loopos` uses:
    - Supabase to list all `loopos_loops` for the user
    - A new `LoopSelector` UI above the toolbar
    - Per-loop loading of clips on active loop change
  - Demo mode:
    - Still initialises a local demo loop only
    - Skips all Supabase reads/writes

- Onboarding flow (`/onboarding`)
  - Step 1: who we’re helping
    - Project name, optional artist name
    - Tone (neutral / energetic / introspective)
    - Accent colour (brand-aligned presets)
  - Step 2: current focus
    - Writing the EP / Launching a single / Album cycle / Campaign planning / Creative development
  - Step 3: where to start
    - OS cards for Analogue, LoopOS, Aqua (ASCII/XP called out as “Advanced”)
  - Completion:
    - Creates a project via `ProjectEngine` (colour seeded from accent choice)
    - Stores a lightweight onboarding summary in `localStorage`
    - Redirects to `/os/<slug>` for the chosen surface
  - Demo mode:
    - Onboarding is disabled and steers back to the Lana Glass demo instead of creating projects

- Route safety + cross-system behaviour
  - `/os/*` effectively protected by:
    - Project engine redirect to `/onboarding` when no project exists and not in demo
  - Demo / Director / Narrative / Persona / Mood / Ambient / Agent systems:
    - Not modified beyond consuming project context where safe
    - All demo-specific Supabase writes remain short-circuited

Notes / limitations:

- No backend schema changes were made; loop-to-project association is intentionally client-side.
- Loops are still stored per user in `loopos_loops`; projects act as a UX layer for context/switching.
- All new behaviour is additive and isolated to `apps/aud-web` client components.

30.5 – Project Loop Preferences
-------------------------------

- Project→loop preferences live entirely in the browser via `ta_project_loop_prefs_v1`.
- A small utility (`projectLoopPrefs.ts`) plus `useProjectLoopPrefs` hook track, per project id:
  - `lastLoopId` = the last active LoopOS loop for that project.
- `LoopOS` integration:
  - On project or loop list changes, LoopOS attempts to restore:
    - the preferred loop for the current project if it still exists,
    - otherwise the current `activeLoopId` if valid,
    - otherwise the first available loop.
  - When a user switches loops or creates a new loop, the current project’s `lastLoopId` is updated.
  - When a loop is deleted, any matching preference for the current project is cleared and LoopOS falls back to a valid loop without schema changes.
- Demo safety:
  - `useProjectLoopPrefs` is demo-aware and behaves as a no-op while the Lana Glass demo is active.
  - No project→loop preferences are written for demo sessions and the demo loop remains purely local.


