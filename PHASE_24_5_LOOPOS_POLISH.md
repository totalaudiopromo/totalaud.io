## Phase 24.5 – LoopOS UX Polish (Conflicts, Blocking & Validation)

LoopOS now surfaces the sequencing engine’s signals in the UI so artists can actually *see* where their loop is clashing, blocked, or a bit messy – without blocking any edits.

---

### What Changed

- **Clip-level tooling**
  - `LoopOSClip`:
    - Now receives `conflict`, `conflictReasons`, and `blockedByReasons` derived from `SequencedClip`.
    - Highlights conflicting clips with a subtle red ring and glow, while keeping the existing active-playhead cyan ring.
    - Renders a tiny cyan “blocked” dot when `blockedBy` contains any reasons.
    - Shows a matte black tooltip on hover that combines:
      - `⚠ Conflicts with: <clip names>` (when overlapping in the same lane).
      - `🔒 Blocked by: <friendly reasons>` (when dependencies are missing).
    - Tooltip disappears cleanly while dragging or resizing and never captures pointer events, so drag/resize remain smooth.
- **Lane-level conflict context**
  - `LoopOSTrack`:
    - Computes `conflictReasons` by looking at other conflicting clips in the same lane and overlapping time window.
    - Maps engine `blockedBy` codes into human-readable phrases:
      - `prereq:creative-or-action` → “Creative or action work earlier in the loop”.
      - `prereq:promo-or-creative` → “Promo or creative work before analysis”.

---

### Validation Flow

- **Store shape** (additions only – existing engine state untouched):
  - `validationWarnings: string[]`
  - `setValidationWarnings(reasons: string[]): void`
  - `clearValidationWarnings(): void`
- **Validation mechanics**
  - `useLoopOSLocalStore.updateClip` now:
    - Takes a snapshot of the previous `clips`.
    - Applies the partial update.
    - Calls `validateClipChange(previousClips, updatedClip)` from `sequenceEngine`.
    - Updates:
      - `sequencedClips`, `momentum`, `nextActionClips` (as before).
      - `validationWarnings`:
        - `[]` when valid.
        - `reasons[]` when invalid.
  - `deleteClip`, `toggleLoopOSReady`, `addIncomingClip`, and `resetAll` clear `validationWarnings` to avoid stale messages.
  - Validation is **non-blocking**:
    - Clip moves/resizes are always applied.
    - Warnings are purely informational.

---

### Inspector Warning Panel

- `LoopOSInspector` now consumes:
  - `validationWarnings`
  - `clearValidationWarnings`
- **Warning UI**
  - New top panel:
    - Matte black background: `bg-[#1a1d1f]`.
    - Amber left border: `border-l-2 border-amber-400`.
    - Text: `text-amber-300` with small bullet list for reasons.
    - Label: `⚠ Timeline issue`.
  - Behaviour:
    - Uses `framer-motion` + `useReducedMotion`:
      - If reduced-motion → simple opacity fade.
      - Else → light fade + vertical slide.
    - Auto-clears after **6 seconds** via `clearValidationWarnings()` (managed with `useEffect` in the inspector).
- This panel sits **above** the Momentum snapshot, so health warnings are the first thing you see when something looks off.

---

### Tooltip Behaviour

- **Visual spec**
  - Tooltip design (conflicts / blocked-by):
    - `rounded-sm`
    - `bg-[#0F1113]`
    - `border border-[#3AA9BE]`
    - `text-slate-100/90`
    - Shadow: `0 0 8px rgba(58,169,190,0.3)`
  - Renders near the top-left of the clip, with whitespace-nowrap text so it stays compact.
- **Interaction rules**
  - Appears on hover only when:
    - The clip is not currently dragging or resizing.
    - There is at least one conflict or blocked-by reason.
  - Disappears immediately when:
    - Dragging begins.
    - Resizing begins.
    - The pointer leaves the clip.
  - Reduced-motion:
    - If `prefers-reduced-motion` is enabled:
      - Tooltip uses a simple fade (`opacity` only).
    - Otherwise:
      - Tiny scale/position animation (`scale(0.97→1)`, small y-offset) for a subtle “pop”.

---

### UX Improvements Summary

- Conflicts are now **visible and understandable**:
  - You can see which clips are clashing in the same lane, not just that a conflict exists.
- Dependencies are **called out, not hidden**:
  - Blocked-by markers show when promo or analysis work is scheduled before their prerequisites.
- Validation is **supportive, not restrictive**:
  - The system warns you about overlaps and bad shapes without ever blocking your flow.
- Inspector becomes a **health dashboard**:
  - Momentum snapshot + next actions + timeline issues all live in one place, driven by the same engines.

---

### Future Notes for Phase 25

- **Richer validation**
  - Use `SequencedClip` + historical completion data to drive smarter warnings:
    - e.g. “Too much promo back-to-back”, “No analysis window for this campaign”.
  - Persist validation events to Supabase for longitudinal loop health tracking.
- **AI suggestions**
  - When validation warnings appear, offer AI-suggested fixes:
    - Auto-reschedule a clip to the nearest clean slot.
    - Propose new “bridge” clips to satisfy blocked-by requirements.
- **Bridge-aware warnings**
  - Use upcoming backend/AI layers so that:
    - Clips sent to Aqua/Analogue/XP can feed validation (e.g. “this promo never shipped”).
    - Warnings can reference external state (campaign status, content readiness, etc.).


