# Theme System Anti-Gimmick Refactor - Session 1 Summary

**Date**: October 26, 2025
**Branch**: `feature/theme-system-anti-gimmick-refactor`
**Session Duration**: ~90 minutes
**Status**: Phase 1 Complete ✅

---

## What We Accomplished

### ✅ Phase 1: Foundation Complete

#### 1. Type System Refactor
**File**: `apps/aud-web/src/components/themes/types.ts`

- Renamed `OSTheme` type from old IDs to new posture-based IDs:
  ```typescript
  // Before
  type OSTheme = 'ascii' | 'xp' | 'aqua' | 'daw' | 'analogue'

  // After
  type OSTheme = 'operator' | 'guide' | 'map' | 'timeline' | 'tape'
  ```

- Added new interfaces:
  - `ThemePosture` - Alias for clarity in workflow contexts
  - `ThemeWorkflow` - Defines posture, layout, actions, input model, feedback style
  - `ThemeMicrocopy` - Defines tagline, empty state, primary CTA, onboarding hint

- Extended `ThemeConfig` to include:
  - `workflow: ThemeWorkflow`
  - `microcopy: ThemeMicrocopy`

#### 2. Theme Config Files Renamed & Updated

All five theme configuration files renamed and enhanced with new workflow/microcopy:

| Old Name | New Name | Posture | Use Case |
|----------|----------|---------|----------|
| ascii.theme.ts | **operator.theme.ts** | The Fast Lane | Sprinting tasks, late-night bursts, power users |
| xp.theme.ts | **guide.theme.ts** | The Pathfinder | Starting a release, hand-holding, onboarding |
| aqua.theme.ts | **map.theme.ts** | The Strategist | Plotting quarters, coordinating drops, seeing whole |
| daw.theme.ts | **timeline.theme.ts** | The Sequencer | Release week, day-by-day outreach, time-boxed pushes |
| analogue.theme.ts | **tape.theme.ts** | The Receipt | Capturing ideas, turning thoughts into runs |

**Each theme now includes:**
- **Workflow definition**: posture, primaryLayout, coreActions, inputModel, feedbackStyle
- **Microcopy**: tagline, emptyState, primaryCTA, onboardingHint
- **Updated descriptions**: Focus on use case, not just aesthetics

#### 3. Core System Files Updated

**ThemeResolver.tsx**:
- Updated imports to use new theme names (operatorTheme, guideTheme, etc.)
- Updated THEME_REGISTRY with new theme IDs
- Changed default theme from 'ascii' to 'operator'

**useUserPrefs.ts**:
- Changed default theme in new user preferences from 'ascii' to 'operator'
- Added comment explaining the choice (keyboard-first, fast lane)

**index.ts**:
- Updated all theme exports to use new file names

#### 4. Implementation Plan Created

**File**: `THEME_REFACTOR_IMPLEMENTATION_PLAN.md`

Comprehensive 600+ line implementation guide covering:
- All 9 phases of the refactor
- Per-theme specifications (Operator, Guide, Map, Timeline, Tape)
- Posture-specific layouts and grid configurations
- Cross-theme consistency patterns
- Microcopy deck (British English)
- Acceptance criteria per theme
- Timeline and success metrics

---

## Git Commit

**Commit Hash**: `b4a874a`
**Message**: `feat(theme): Phase 1 - Rename themes to posture-based workflow IDs`

**Stats**:
- 86 files changed
- 22,143 insertions(+)
- 427 deletions(-)

**Key Changes**:
- 5 theme files renamed and updated
- Theme types extended with workflow/microcopy interfaces
- ThemeResolver registry updated
- Default theme changed to 'operator'

---

## What's Next (Phase 2)

### Immediate Priorities

1. **Motion & Sound Tokens** (30 mins)
   - Create `apps/aud-web/src/tokens/motion.ts`
   - Create `apps/aud-web/src/tokens/sounds.ts`
   - Centralize all motion durations (120ms/240ms/400ms)
   - Centralize sound definitions with Calm Mode support

2. **Codebase Migration** (2-3 hours)
   - Update 30 files with old theme ID references
   - Files identified via Grep:
     - Component files (OSTransition, OSCard, studios, etc.)
     - Hook files (usePresence, useOSSelection, useAmbientAudio)
     - Store files (workspaceStore)
     - Theme system files (palettes, motionProfiles, adaptiveLogic, toneSystem)
     - Type files (types/themes.ts, lib/supabaseClient.ts)
     - API routes (api/coach/generate)

3. **Database Migration** (30 mins)
   - Create Supabase migration: `supabase/migrations/YYYYMMDD_rename_theme_values.sql`
   - Update existing user_prefs records:
     ```sql
     UPDATE user_prefs SET theme = 'operator' WHERE theme = 'ascii';
     UPDATE user_prefs SET theme = 'guide' WHERE theme = 'xp';
     UPDATE user_prefs SET theme = 'map' WHERE theme = 'aqua';
     UPDATE user_prefs SET theme = 'timeline' WHERE theme = 'daw';
     UPDATE user_prefs SET theme = 'tape' WHERE theme = 'analogue';
     ```
   - Update constraint to use new theme IDs

4. **TypeScript Validation** (30 mins)
   - Run `pnpm typecheck`
   - Fix any remaining type errors
   - Verify all imports resolve correctly

5. **Development Testing** (30 mins)
   - Start dev server: `pnpm dev`
   - Test theme switching UI
   - Verify CSS variables update
   - Check console for errors

---

## Phase 2 Success Criteria

- ✅ All 30 files updated with new theme IDs
- ✅ Zero TypeScript errors
- ✅ Database migration runs successfully
- ✅ Dev server starts without errors
- ✅ Theme switching works in browser
- ✅ Motion/sound tokens centralized

---

## Later Phases (Phase 3+)

### Phase 3: BaseWorkflow Component
- Create posture-based workflow architecture
- Implement slot system (primary, secondary, composer, metrics, activity)
- Define grid layouts per posture

### Phase 4: Individual Workflows
- Operator (CLI)
- Guide (Wizard)
- Map (Canvas)
- Timeline (Clips)
- Tape (Notes→Runs)

### Phase 5: Cross-Theme Primitives
- CommandPalette
- Shared keyboard map (⌘K, 1-5 theme switch, etc.)
- Status colour system

### Phase 6: Documentation & Testing
- User-facing docs
- Accessibility audit
- Performance testing

---

## Key Decisions Made

1. **Motion Token Standardization**
   - Fast: 120ms (micro-interactions)
   - Normal: 240ms (pane transitions)
   - Slow: 400ms (ambient effects)
   - Easing: `cubic-bezier(0.22, 1, 0.36, 1)` for fast/normal
   - Easing: `ease-in-out` for slow

2. **Theme Naming Philosophy**
   - **Before**: Aesthetic-based (ascii, xp, aqua, daw, analogue)
   - **After**: Purpose-based (operator, guide, map, timeline, tape)
   - **Rationale**: Names answer "When would I choose this?"

3. **Microcopy Strategy**
   - Tagline format: "when [use case]."
   - Examples:
     - Operator: "when you need speed."
     - Guide: "when you want a path."
     - Map: "when you think in systems."
     - Timeline: "when time is the instrument."
     - Tape: "when notes become runs."

4. **Default Theme**
   - Changed from 'ascii' to 'operator'
   - Rationale: Operator is the "fast lane" - keyboard-first, power user default

5. **British English Enforcement**
   - All copy uses British spelling (colour, behaviour, centre, etc.)
   - Kept in framework conventions (backgroundColor for React props)
   - Applied to documentation, UI strings, comments

---

## Technical Debt Identified

### Medium Priority
- Need to update 30 files with theme reference migrations
- Database migration needs to run on production (user_prefs table)
- Old theme-specific studio components may need deprecation (ASCIIStudio.tsx, etc.)

### Low Priority
- Consider consolidating theme system files (palettes, motionProfiles, adaptiveLogic) under new architecture
- AsciiFlowCanvas/AsciiMissionPanel components may need renaming to OperatorFlowCanvas/OperatorMissionPanel

---

## Files Modified This Session

### Created
- `THEME_REFACTOR_IMPLEMENTATION_PLAN.md` (comprehensive guide)
- `apps/aud-web/src/components/themes/operator.theme.ts`
- `apps/aud-web/src/components/themes/guide.theme.ts`
- `apps/aud-web/src/components/themes/map.theme.ts`
- `apps/aud-web/src/components/themes/timeline.theme.ts`
- `apps/aud-web/src/components/themes/tape.theme.ts`

### Modified
- `apps/aud-web/src/components/themes/types.ts`
- `apps/aud-web/src/components/themes/index.ts`
- `apps/aud-web/src/components/themes/ThemeResolver.tsx`
- `apps/aud-web/src/hooks/useUserPrefs.ts`

### Deleted
- `apps/aud-web/src/components/themes/ascii.theme.ts`
- `apps/aud-web/src/components/themes/xp.theme.ts`
- `apps/aud-web/src/components/themes/aqua.theme.ts`
- `apps/aud-web/src/components/themes/daw.theme.ts`
- `apps/aud-web/src/components/themes/analogue.theme.ts`

---

## Notes for Next Session

### Quick Start Commands
```bash
# Continue on same branch
git checkout feature/theme-system-anti-gimmick-refactor

# Check current status
git log --oneline -5
git status

# Start Phase 2
# 1. Create motion/sound token files
# 2. Update 30 files with theme references
# 3. Create database migration
# 4. Run typecheck
```

### Search Pattern for Migrations
```bash
# Find all old theme ID references
grep -r "'ascii'\|'xp'\|'aqua'\|'daw'\|'analogue'" apps/aud-web/src --include="*.ts" --include="*.tsx"
```

### Testing Checklist
- [ ] Dev server starts (`pnpm dev`)
- [ ] Theme switcher UI shows new names
- [ ] Theme switching works without errors
- [ ] CSS variables update on theme change
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] All imports resolve correctly

---

## Philosophy Recap

**North-Star Principles:**
1. Same power, different posture
2. One core use case each
3. Zero clutter
4. Feel before features

**What Changed:**
- Themes are no longer just aesthetic variations
- Each theme represents a distinct **way of working**
- Names answer "When would I choose this?"
- Workflow, microcopy, and narrative are first-class concerns

**What Stayed the Same:**
- All themes run identical workflows under the hood
- Visual theming (colours, typography, effects) preserved
- Motion profiles and sound palettes still per-theme
- Adaptive logic and tone system still functional

---

## Session Retrospective

### What Went Well ✅
- Comprehensive implementation plan created first (prevents scope creep)
- Type system refactored cleanly
- All 5 theme configs updated with workflow/microcopy
- Git commit with clear message and stats
- Todo list kept updated throughout

### Challenges Encountered ⚠️
- 30 files need migration (discovered via Grep)
- Motion tokens still hardcoded in many places
- Some theme files have interdependencies (palettes, motionProfiles)

### Lessons Learned 📚
- Creating implementation plan first saved time
- Git operations helpful for tracking renamed files
- Todo list tool useful for managing multi-phase refactor
- Grep tool essential for finding all theme references

---

**End of Session 1**
**Next Session**: Phase 2 - Motion/Sound Tokens + Codebase Migration
**Estimated Time**: 3-4 hours
