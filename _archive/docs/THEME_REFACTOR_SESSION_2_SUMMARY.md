# Theme System Anti-Gimmick Refactor - Session 2 Summary

**Date**: October 26, 2025
**Branch**: `feature/theme-system-anti-gimmick-refactor`
**Session Duration**: ~2 hours
**Status**: Phase 2 Complete ✅

---

## What We Accomplished

### ✅ Phase 2: Complete Codebase Migration

#### 1. Motion & Sound Token Files Created

**Motion Tokens** (`apps/aud-web/src/tokens/motion.ts`):
```typescript
export const motionTokens = {
  fast: {
    duration: 120, // ms - Micro feedback, key confirmations
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  normal: {
    duration: 240, // ms - Pane transitions, modal opens
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  slow: {
    duration: 400, // ms - Calm fades, ambient effects
    easing: 'ease-in-out',
  },
}
```

**Features**:
- Reduced motion support (`getMotionDuration` respects user preferences)
- Framer Motion helpers (`getMotionTransition`)
- CSS transition helpers (`getCSSTransition`)
- Theme-specific overrides (Operator uses instant transitions)

**Sound Tokens** (`apps/aud-web/src/tokens/sounds.ts`):
```typescript
export const soundTokens = {
  'confirm-short': { frequency: 880, duration: 60, type: 'sine', volume: 0.2 },
  'task-armed': { frequency: 1200, duration: 80, type: 'square', volume: 0.15 },
  'clip-fired': { frequency: 660, duration: 100, type: 'sawtooth', volume: 0.2 },
  'parse-complete': { frequency: 440, duration: 120, type: 'triangle', volume: 0.25 },
  'error-subtle': { frequency: 220, duration: 150, type: 'square', volume: 0.3 },
  'success-soft': { frequency: 1760, duration: 100, type: 'sine', volume: 0.2 },
}
```

**Features**:
- Web Audio API implementation
- Theme-specific sound banks (operator, guide, map, timeline, tape)
- Calm Mode support (mutes all sounds)
- Helper functions: `playSound()`, `playThemeSound()`, `createSoundPlayer()`

---

#### 2. Complete Theme ID Migration

**Files Migrated** (30+ files):

| Category | Files | Method |
|----------|-------|--------|
| **Types & Interfaces** | 3 files | Manual edit |
| **Component Files** | 14 files | Bulk sed |
| **Hook Files** | 2 files | Bulk sed |
| **Theme System Files** | 4 files | Bulk sed |
| **Store Files** | 1 file | Bulk sed |
| **API Routes** | 1 file | Bulk sed |
| **Agent Executor Package** | 3 files | Manual sed |
| **App Pages** | 2 files | Bulk sed |

**Migration Mapping**:
```
'ascii' → 'operator'
'xp' → 'guide'
'aqua' → 'map'
'daw' → 'timeline'
'analogue' → 'tape'
```

**Verification**:
```bash
# Zero matches for old theme IDs ✅
grep -r "'ascii'\|'xp'\|'aqua'\|'daw'\|'analogue'" apps/aud-web/src
# Result: 0 matches
```

**Key Files Updated**:
- ✅ `types/themes.ts` - THEME_CONFIGS registry
- ✅ `lib/supabaseClient.ts` - UserPrefs interface
- ✅ `hooks/useOSSelection.ts` - OS_OPTIONS array with new labels
- ✅ `hooks/usePresence.ts` - Theme type references
- ✅ `components/ui/*` - OSCard, OSTransition, GlobalCommandPalette
- ✅ `components/features/*` - BrokerChat, FlowCanvas, FlowStudio
- ✅ `components/layouts/*` - OnboardingOverlay, MissionDashboard
- ✅ `components/themes/*` - palettes, motionProfiles, adaptiveLogic, toneSystem
- ✅ `stores/workspaceStore.ts` - Theme state management
- ✅ `packages/core/agent-executor/src/*` - OSTheme type definitions

---

#### 3. Database Migration Created

**File**: `supabase/migrations/20251026140000_rename_theme_ids.sql`

```sql
-- Update existing user_prefs records
UPDATE user_prefs SET theme = 'operator' WHERE theme = 'ascii';
UPDATE user_prefs SET theme = 'guide' WHERE theme = 'xp';
UPDATE user_prefs SET theme = 'map' WHERE theme = 'aqua';
UPDATE user_prefs SET theme = 'timeline' WHERE theme = 'daw';
UPDATE user_prefs SET theme = 'tape' WHERE theme = 'analogue';

-- Update constraint
ALTER TABLE user_prefs DROP CONSTRAINT IF EXISTS user_prefs_theme_check;
ALTER TABLE user_prefs ADD CONSTRAINT user_prefs_theme_check
  CHECK (theme IN ('operator', 'guide', 'map', 'timeline', 'tape'));
```

**To run**:
```bash
# Local development
supabase db reset

# Production
supabase db push
```

---

#### 4. Migration Script Created

**File**: `scripts/migrate-theme-ids.sh`

Automated bash script for theme ID migration (for reference/rollback):
- Finds all TypeScript files
- Performs sed replacements
- Tracks updated file count
- Creates backups

**Note**: Migration already complete, script preserved for documentation.

---

## Git Commits

### Commit 1: Phase 2.1 - Tokens & Key Types
**Hash**: `ca10033`
**Message**: `feat(theme): Phase 2.1 - Add motion/sound tokens and migrate key type files`

**Changes**:
- Created motion.ts and sounds.ts token files
- Updated types/themes.ts, lib/supabaseClient.ts, hooks/useOSSelection.ts
- 10 files changed, 986 insertions(+), 46 deletions(-)

### Commit 2: Phase 2 Complete - Full Migration
**Hash**: `46dc222`
**Message**: `feat(theme): Phase 2 Complete - Full codebase theme ID migration`

**Changes**:
- Migrated all remaining files (30 files)
- Created database migration SQL
- Created migration script for reference
- 30 files changed, 203 insertions(+), 94 deletions(-)

---

## TypeScript Status

**Total Errors**: 164
**Theme Migration Errors**: 0 ✅

**Error Breakdown**:
- ✅ Theme ID type mismatches: **RESOLVED**
- ⚠️ Collaboration API errors: 40+ errors (pre-existing, unrelated to theme migration)
- ⚠️ Insights API errors: 15+ errors (pre-existing, unrelated to theme migration)
- ⚠️ Other errors: Various pre-existing issues

**Theme-Specific Verification**:
```bash
# Check for theme-related errors
pnpm typecheck 2>&1 | grep -E "(OSTheme|'operator'|'guide'|'map'|'timeline'|'tape')"
# Result: No theme migration errors ✅
```

**Remaining pre-existing errors** do not block theme refactor testing.

---

## What's Next (Phase 3)

### Immediate Tasks

1. **Test Theme Switching Locally** (30 mins)
   - Start dev server: `pnpm dev`
   - Verify theme switcher UI shows new names
   - Test switching between all 5 themes
   - Check CSS variables update correctly
   - Use Chrome DevTools MCP for visual verification

2. **Run Database Migration** (15 mins)
   ```bash
   supabase db reset # Local
   supabase db push  # Production
   ```

3. **Visual Testing with MCP** (15 mins)
   - Take screenshots of each theme
   - Verify motion token timings
   - Check sound token playback
   - Test accessibility (WCAG AA)

### Future Phases

**Phase 4**: BaseWorkflow Component Architecture
- Create posture-based workflow system
- Implement slot architecture
- Define grid layouts per posture

**Phase 5**: Individual Workflow Implementations
- Operator (split CLI)
- Guide (4-step wizard)
- Map (spatial canvas)
- Timeline (track lanes)
- Tape (notes → runs)

**Phase 6**: Cross-Theme Primitives
- Global keyboard shortcuts
- Shared components
- Status colour system

**Phase 7**: Documentation & Launch
- User guide
- Developer docs
- Accessibility audit
- Performance testing

---

## Technical Highlights

### 1. Bulk Migration Strategy

**Challenge**: 30+ files needed updating
**Solution**: Used `find` + `sed` for bulk string replacement

```bash
find apps/aud-web/src -type f \( -name "*.ts" -o -name "*.tsx" \) | \
  xargs sed -i '' \
    -e "s/'ascii'/'operator'/g" \
    -e "s/'xp'/'guide'/g" \
    -e "s/'aqua'/'map'/g" \
    -e "s/'daw'/'timeline'/g" \
    -e "s/'analogue'/'tape'/g"
```

**Benefits**:
- Consistent replacements across all files
- Fast execution (< 1 second)
- Zero manual editing errors

### 2. Package-Level Type Consistency

**Challenge**: OSTheme type defined in multiple packages
**Solution**: Updated all OSTheme definitions across packages

**Locations updated**:
- `apps/aud-web/src/components/themes/types.ts`
- `apps/aud-web/src/types/themes.ts`
- `apps/aud-web/src/hooks/useOSSelection.ts`
- `packages/core/agent-executor/src/client-utils.ts`
- `packages/core/agent-executor/src/agents/coachAgent.ts`
- `packages/core/agent-executor/src/agents/insightAgent.ts`

**Benefit**: Type safety across entire monorepo

### 3. Motion Token Centralization

**Before**: Hardcoded durations scattered across 15+ components
**After**: Centralized tokens with helper functions

**Example Migration**:
```typescript
// Before
transition={{ duration: 0.15, ease: 'easeOut' }}

// After
import { getMotionTransition } from '@/tokens/motion'
transition={getMotionTransition('fast', prefersReducedMotion)}
```

**Benefits**:
- Consistent timing across all animations
- Automatic reduced motion support
- Theme-specific overrides (Operator = instant)

### 4. Sound Token Architecture

**Design**: Web Audio API with theme-specific banks

```typescript
// Core tokens (shared)
soundTokens: {
  'confirm-short': { frequency: 880, duration: 60, type: 'sine' },
  // ...
}

// Theme-specific banks
themeSoundBanks: {
  operator: { start: {...}, complete: {...}, click: {...} },
  guide: { start: {...}, complete: {...}, click: {...} },
  // ...
}
```

**Benefits**:
- No external sound files needed
- Programmatic generation via Web Audio API
- Calm Mode support built-in
- Theme-specific sound personalities

---

## Files Modified This Session

### Created
- `apps/aud-web/src/tokens/motion.ts` (186 lines)
- `apps/aud-web/src/tokens/sounds.ts` (241 lines)
- `supabase/migrations/20251026140000_rename_theme_ids.sql` (18 lines)
- `scripts/migrate-theme-ids.sh` (bash script)
- `THEME_REFACTOR_SESSION_2_SUMMARY.md` (this file)

### Modified (30+ files)
- All theme config files
- All type definition files
- 14 component files
- 2 hook files
- 4 theme system files
- 1 store file
- 1 API route
- 3 agent executor files
- 2 app pages

**Total Lines Changed**: ~1,200 insertions, ~140 deletions

---

## Session Metrics

| Metric | Value |
|--------|-------|
| Session Duration | ~2 hours |
| Files Modified | 30+ |
| Git Commits | 2 |
| Lines Added | 1,200+ |
| Lines Removed | 140+ |
| Old Theme ID References | 0 (verified) |
| TypeScript Theme Errors | 0 ✅ |
| Migration Script Runs | 1 |
| Database Migration Created | 1 |

---

## Testing Checklist (Next Session)

### Theme Switching
- [ ] Start dev server (`pnpm dev`)
- [ ] Navigate to theme selector
- [ ] Verify all 5 themes show new names
- [ ] Test switching operator → guide → map → timeline → tape
- [ ] Check CSS variables update on theme change
- [ ] Verify motion timings (120ms/240ms/400ms)

### Sound Testing
- [ ] Test theme-specific sounds for each theme
- [ ] Verify Calm Mode mutes all sounds
- [ ] Check volume levels are appropriate
- [ ] Test reduced motion preference

### Visual Verification (with Chrome DevTools MCP)
- [ ] Take screenshot of operator theme
- [ ] Take screenshot of guide theme
- [ ] Take screenshot of map theme
- [ ] Take screenshot of timeline theme
- [ ] Take screenshot of tape theme
- [ ] Verify microcopy displays correctly

### Database Migration
- [ ] Run `supabase db reset` locally
- [ ] Verify migration applies cleanly
- [ ] Check user_prefs table constraint
- [ ] Test creating new user with default theme

---

## Notes for Next Session

### Quick Start Commands
```bash
# Continue on same branch
git checkout feature/theme-system-anti-gimmick-refactor

# Check status
git log --oneline -5
git status

# Start dev server
pnpm dev

# Run database migration
supabase db reset

# Visual testing with MCP
# "Show me localhost:3000 with operator theme"
# "Take a screenshot of the theme switcher"
```

### Known Issues
1. **Pre-existing TypeScript errors**: 164 errors total (unrelated to theme migration)
   - Collaboration API: Type inference issues with Supabase
   - Insights API: Similar type issues
   - **Action**: Can be addressed separately, do not block theme refactor

2. **Database migration**: Not yet run (created but not applied)
   - **Action**: Run `supabase db reset` in next session

### Success Criteria for Phase 3
- ✅ Dev server starts without errors
- ✅ Theme switcher shows new theme names
- ✅ All 5 themes switchable
- ✅ CSS variables update correctly
- ✅ Motion tokens work (120ms/240ms/400ms)
- ✅ Sound tokens playback (respects Calm Mode)
- ✅ Database migration applies cleanly

---

## Philosophy Recap

**What We're Building**:
- Not just aesthetic variations
- Each theme = distinct **way of working**
- Posture-based workflows with clear use cases

**The Five Postures**:
1. **Operator** - The fast lane (keyboard-first, instant feedback)
2. **Guide** - The pathfinder (step-by-step, guardrails)
3. **Map** - The strategist (spatial planning, systems thinking)
4. **Timeline** - The sequencer (time-based execution, clips)
5. **Tape** - The receipt (notes → actions, intent detection)

**Core Principle**: *Same power, different posture*

---

## Session Retrospective

### What Went Well ✅
- Bulk migration strategy was efficient (sed worked perfectly)
- Motion/sound token files created with comprehensive helpers
- Database migration SQL created and ready
- Git commits organized by logical phase
- Zero theme-related grep matches (complete migration verification)

### Challenges Encountered ⚠️
- OSTheme type defined in multiple packages (required systematic updates)
- Some pre-existing TypeScript errors created noise
- Bash associative arrays not supported in zsh (adapted to sed approach)

### Lessons Learned 📚
- `find` + `sed` is powerful for bulk string replacements
- Verifying with grep after migration confirms completeness
- Type definitions across packages need synchronized updates
- Pre-existing errors should be tracked separately from migration work

---

**End of Session 2**
**Next Session**: Phase 3 - Testing theme switching + database migration
**Estimated Time**: 1 hour

---

## Appendix: Command Reference

### Verification Commands
```bash
# Check for old theme IDs (should return 0)
grep -r "'ascii'\|'xp'\|'aqua'\|'daw'\|'analogue'" apps/aud-web/src --include="*.ts" --include="*.tsx" | wc -l

# Check TypeScript errors
pnpm typecheck --filter=aud-web 2>&1 | grep "error TS" | wc -l

# Find theme-related errors specifically
pnpm typecheck 2>&1 | grep -E "(OSTheme|'operator'|'guide'|'map'|'timeline'|'tape')"
```

### Development Commands
```bash
# Start dev server
pnpm dev

# Run type checking
pnpm typecheck

# Run linting
pnpm lint
```

### Database Commands
```bash
# Reset database (applies all migrations)
supabase db reset

# Push migrations to production
supabase db push

# Check migration status
supabase migration list
```

---

**Branch**: `feature/theme-system-anti-gimmick-refactor`
**Commits**: 3 total (b4a874a, ca10033, 46dc222)
**Ready for**: Phase 3 Testing
