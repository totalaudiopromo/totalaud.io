# Linting Issues Report

**Generated:** October 2025
**Total Issues:** 240 (179 errors, 61 warnings)

## Summary

After implementing ESLint with strict TypeScript rules, the linter has identified 240 issues across the codebase:

- **179 errors** - Must be fixed
- **61 warnings** - Should be addressed

## Issues by Category

### 1. Explicit `any` Type Usage (High Priority)

**Count:** ~80 instances
**Rule:** `@typescript-eslint/no-explicit-any`
**Severity:** Error

The codebase has approximately 80 uses of the `any` type, which defeats TypeScript's type safety. These need to be replaced with proper type definitions.

**Files with most `any` usage:**
- `apps/aud-web/src/lib/oauth.ts` - 15 instances
- `apps/aud-web/src/components/AgentChat.tsx` - 5 instances
- `apps/aud-web/src/components/FlowCanvas.tsx` - 4 instances
- `apps/aud-web/src/components/BaseWorkflow.tsx` - 2 instances
- `apps/aud-web/src/app/api/coach/*` - Multiple instances

**Recommended approach:**
1. Define proper interfaces in `packages/schemas/`
2. Import and use these types instead of `any`
3. For complex third-party types, use proper type imports

**Example fix:**
```typescript
// Before
function formatOutput(output: any): string {
  // ...
}

// After
interface ContactOutput {
  contacts: Array<{
    name: string
    email: string
    relevance: number
  }>
}

function formatOutput(output: ContactOutput): string {
  // ...
}
```

### 2. Console Statements (Medium Priority)

**Count:** 61 warnings
**Rule:** `no-console`
**Severity:** Warning

Console.log statements should not be in production code. These should be:
- Removed if not needed
- Replaced with proper logging utility
- Changed to console.warn or console.error if appropriate

**Files with most console statements:**
- `apps/aud-web/src/components/GlobalCommandPalette.tsx` - 11 instances
- `apps/aud-web/src/components/FlowCanvas.tsx` - 10 instances
- `apps/aud-web/src/components/BrokerChat.tsx` - 7 instances
- `apps/aud-web/src/components/OSTransition.tsx` - 7 instances

**Recommended approach:**
1. Create logging utility in `packages/core/logger/`
2. Replace all console.log with logger.debug/info
3. Configure logger to suppress debug logs in production

**Example fix:**
```typescript
// Before
console.log('[Command] Run campaign')

// After
import { logger } from '@total-audio/core-logger'
logger.debug('Command executed: run campaign')
```

### 3. Unused Variables (Medium Priority)

**Count:** ~40 instances
**Rule:** `@typescript-eslint/no-unused-vars`
**Severity:** Error

Variables and imports that are defined but never used. These clutter the code and should be removed or prefixed with `_` if intentionally unused.

**Common patterns:**
- Unused imports: `import { Trash2, Layout } from 'lucide-react'`
- Unused destructured variables: `const { currentTheme, setTheme } = useTheme()`
- Unused function parameters: `function Component({ sessionId, muteSounds })`

**Example fix:**
```typescript
// Before
const { currentTheme, setTheme } = useTheme()  // currentTheme never used

// After
const { setTheme } = useTheme()

// Or if needed for future:
const { currentTheme: _currentTheme, setTheme } = useTheme()
```

### 4. Unused ESLint Directives (Low Priority)

**Count:** 3 warnings
**Rule:** Unused eslint-disable directive
**Severity:** Warning

ESLint disable comments that are no longer needed because the issue was fixed.

**Files:**
- `apps/aud-web/src/components/BrokerChat.tsx`
- `apps/aud-web/src/components/BrokerIntro.tsx`
- `apps/aud-web/src/components/OSTransition.tsx`

**Fix:** Remove the unused `// eslint-disable-next-line` comments.

## Breakdown by File

### Top 20 Files by Issue Count

1. `apps/aud-web/src/lib/oauth.ts` - 15 errors
2. `apps/aud-web/src/components/GlobalCommandPalette.tsx` - 13 errors + 11 warnings
3. `apps/aud-web/src/components/FlowCanvas.tsx` - 10 errors + 10 warnings
4. `apps/aud-web/src/components/BaseWorkflow.tsx` - 10 errors + 3 warnings
5. `apps/aud-web/src/components/BrokerChat.tsx` - 4 errors + 7 warnings
6. `apps/aud-web/src/components/OSTransition.tsx` - 0 errors + 7 warnings
7. `apps/aud-web/src/components/AgentChat.tsx` - 6 errors + 0 warnings
8. `apps/aud-web/src/app/api/coach/send/route.ts` - 5 errors
9. `apps/aud-web/src/app/api/coach/generate/route.ts` - 3 errors
10. `apps/aud-web/src/app/api/oauth/google/callback/route.ts` - 3 errors

## Recommended Fix Priority

### Phase 1: High Priority (1-2 days)

1. **Fix `any` types in API routes** - These handle user data and need type safety
   - `apps/aud-web/src/app/api/**/*.ts`
   - `apps/aud-web/src/lib/oauth.ts`

2. **Remove unused variables in core components**
   - `apps/aud-web/src/components/GlobalCommandPalette.tsx`
   - `apps/aud-web/src/components/FlowCanvas.tsx`
   - `apps/aud-web/src/components/BaseWorkflow.tsx`

### Phase 2: Medium Priority (2-3 days)

3. **Replace console statements with logger**
   - Create `packages/core/logger/` package
   - Replace all console.log statements

4. **Fix `any` types in UI components**
   - `apps/aud-web/src/components/**/*.tsx`

### Phase 3: Low Priority (1 day)

5. **Clean up unused directives**
6. **Fix remaining unused variables**

## Automation Opportunities

### Pre-commit Hook

Add Husky + lint-staged to automatically lint changed files:

```bash
pnpm add -D husky lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### CI/CD Integration

Add linting to CI pipeline:

```yaml
# .github/workflows/lint.yml
name: Lint
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
```

## Progress Tracking

- [ ] Phase 1: API routes and core logic (High Priority)
- [ ] Phase 2: Console statement cleanup (Medium Priority)
- [ ] Phase 3: Final cleanup (Low Priority)
- [ ] Add pre-commit hooks
- [ ] Add CI/CD linting

## Notes

- ESLint v9 uses flat config format (eslint.config.js)
- Current config is strict but can be adjusted if needed
- Some `any` types may be legitimate (third-party library issues)
- Consider adding type definitions for missing third-party types

## Running Linter

```bash
# Check all files
pnpm lint

# Auto-fix what can be fixed
pnpm lint:fix

# Check specific package
cd apps/aud-web && pnpm lint

# Format all code
pnpm format
```

---

**Last Updated:** October 2025
**Status:** Initial audit complete, manual fixes pending
