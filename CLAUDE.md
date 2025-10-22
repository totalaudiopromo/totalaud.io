# Claude Code Configuration - totalaud.io (Experimental Project)

## 🎯 PROJECT OVERVIEW

**Project**: totalaud.io (Experimental Multi-Agent System)
**Location**: `/Users/chrisschofield/workspace/active/totalaud.io`
**Status**: Experimental - Learning & Innovation Sandbox (Phase 4/5 Implementation Complete)
**Purpose**: Cinematic AI agent workspace for music promotion - "operator → signal journey"
**Live URL**: https://aud-web-production.up.railway.app

**Key Distinction**: This is NOT the customer acquisition project (total-audio-platform). This is an experimental sandbox for innovation and learning.

**Tech Stack**:
- **Framework**: Next.js 15.0.3 (App Router)
- **React**: 18.3.1
- **TypeScript**: 5.6.3 (strict mode)
- **Styling**: Tailwind CSS 3.4.1
- **State**: Zustand 5.0.2
- **Database**: Supabase (shared with main platform)
- **Animation**: Framer Motion 11.11.17
- **Flow Canvas**: React Flow 11.11.4
- **Build**: Turborepo + pnpm workspace
- **Deployment**: Railway (replaced Vercel due to monorepo detection issues)
- **UI Sound**: Web Audio API

---

## 🏗️ PROJECT STRUCTURE

```
totalaud.io/
├── apps/
│   └── aud-web/              # Main experimental app
│       ├── src/
│       │   ├── app/          # Next.js 15 app router
│       │   ├── components/   # React components
│       │   ├── lib/          # Utilities and helpers
│       │   ├── hooks/        # Custom React hooks
│       │   └── stores/       # Zustand state management
│       └── package.json
├── packages/
│   └── core/
│       ├── agent-executor/   # Multi-agent execution engine
│       ├── supabase/         # Supabase client & utilities
│       ├── schemas/          # Shared TypeScript types
│       ├── skills-engine/    # Skills-based agent system
│       ├── theme-engine/     # Dynamic theming system
│       └── integrations/     # External API integrations
└── package.json              # Monorepo root
```

---

## ✅ CODE QUALITY INFRASTRUCTURE (October 2025)

**Status**: ✅ **COMPLETE** - All critical audit recommendations implemented
**Test Results**: 15/15 passing tests
**Purpose**: Production-ready quality tooling for experimental project

### 🎯 What's Been Implemented

#### 1. ESLint & Prettier (Automated Code Quality)
- **ESLint**: TypeScript + React + Next.js + Web Audio API support
- **Prettier**: Consistent code formatting
- **Config Files**: `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`

**Commands:**
```bash
pnpm lint              # Check for code quality issues
pnpm lint:fix          # Auto-fix linting issues
pnpm format            # Format all code with Prettier
pnpm format:check      # Check formatting without modifying
```

#### 2. Environment Variable Validation (Type-Safe Config)
- **File**: `apps/aud-web/src/lib/env.ts`
- **Purpose**: Validates all required environment variables on startup
- **Prevents**: Runtime crashes from missing env vars

**Usage Pattern:**
```typescript
// ❌ DON'T: Unsafe, could be undefined
const apiKey = process.env.ANTHROPIC_API_KEY;

// ✅ DO: Type-safe, validated at startup
import { env } from '@/lib/env';
const apiKey = env.ANTHROPIC_API_KEY;
```

**Required Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional (Google OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/oauth/google/callback
```

#### 3. Structured Logging (Production-Ready Debugging)
- **File**: `apps/aud-web/src/lib/logger.ts`
- **Purpose**: Replace console.log with structured, level-based logging
- **Tested**: 7 passing tests

**Usage Pattern:**
```typescript
// ❌ DON'T: Unstructured console logging
console.log('User logged in:', userId);
console.error('Error:', error);

// ✅ DO: Structured logging with context
import { logger } from '@/lib/logger';

logger.debug('Detailed debug info', { userId, sessionId });  // Dev only
logger.info('User logged in', { userId });                   // Dev only
logger.warn('Rate limit approaching', { requests: 95 });     // Always shown
logger.error('Authentication failed', error, { userId });    // Always shown

// Scoped logger for components/modules
const log = logger.scope('BrokerChat');
log.debug('Message sent', { messageId: '123' });
log.warn('Connection unstable');
```

**Log Levels:**
- `debug`: Development only, detailed debugging
- `info`: General information (development only)
- `warn`: Warnings (always shown)
- `error`: Errors (always shown)

#### 4. API Input Validation (Type-Safe APIs)
- **File**: `apps/aud-web/src/lib/api-validation.ts`
- **Purpose**: Validate API request bodies and params with Zod
- **Tested**: 8 passing tests

**Usage Pattern:**
```typescript
// ❌ DON'T: No validation
export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = body.name; // Could be anything!
}

// ✅ DO: Validated and type-safe
import { z } from 'zod';
import { validateRequestBody } from '@/lib/api-validation';
import { logger } from '@/lib/logger';

const log = logger.scope('MyAPI');

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await validateRequestBody(req, schema);
    log.info('Request validated', { name: body.name });
    // ... your logic
  } catch (error) {
    log.error('Validation failed', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// OR use the handler wrapper for cleaner code
import { createApiHandler } from '@/lib/api-validation';

export const POST = createApiHandler({
  bodySchema: schema,
  handler: async ({ body }) => {
    return { success: true, data: body };
  },
});
```

**Common Validation Schemas:**
```typescript
import { commonSchemas } from '@/lib/api-validation';

// Pagination
commonSchemas.pagination.parse({ page: '2', limit: '10' });

// UUID validation
commonSchemas.id.parse({ id: 'uuid-string' });

// Message validation
commonSchemas.message.parse({ content: 'Hello world' });

// Flow creation
commonSchemas.flowCreate.parse({
  goal: 'Release single',
  flowType: 'radio-promo'
});
```

**Example Migration**: See `apps/aud-web/src/app/api/flows/route.ts`

#### 5. Local Fonts (GDPR Compliant)
- **Changed**: Removed Google Fonts CDN
- **Using**: @fontsource packages (local fonts)
- **File**: `apps/aud-web/src/app/globals.css`
- **Fonts**: Inter (300, 400, 500, 600, 700), JetBrains Mono (400, 500, 600)

**Benefits:**
- ✅ GDPR compliant (no data sent to Google)
- ✅ Faster loading (no external requests)
- ✅ Works offline
- ✅ Better privacy

#### 6. Testing Infrastructure (Vitest + React Testing Library)
- **Config**: `apps/aud-web/vitest.config.ts`
- **Setup**: `apps/aud-web/src/test/setup.ts`
- **Test Files**: `apps/aud-web/src/lib/__tests__/`

**Commands (from apps/aud-web):**
```bash
pnpm test              # Run tests once
pnpm vitest            # Watch mode
pnpm test:ui           # Visual test UI
pnpm test:coverage     # Coverage report
```

**Writing Tests:**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

**Test Status**: 15/15 passing tests

---

## 📚 DOCUMENTATION

All detailed documentation is in the project root:

- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Step-by-step migration instructions
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete implementation details
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Command and pattern quick reference
- **[AUDIT_IMPLEMENTATION_COMPLETE.md](AUDIT_IMPLEMENTATION_COMPLETE.md)** - Final status report

---

## 🎯 DEVELOPMENT WORKFLOW

### For New Code (Mandatory Patterns)

1. **Use structured logging**:
   ```typescript
   import { logger } from '@/lib/logger';
   const log = logger.scope('ComponentName');
   ```

2. **Use validated environment variables**:
   ```typescript
   import { env } from '@/lib/env';
   const apiKey = env.ANTHROPIC_API_KEY;
   ```

3. **Validate API inputs**:
   ```typescript
   import { validateRequestBody } from '@/lib/api-validation';
   const body = await validateRequestBody(req, schema);
   ```

4. **Write tests for new features**:
   ```bash
   # Create __tests__ folder next to your component/utility
   ```

5. **Format before committing**:
   ```bash
   pnpm format && pnpm lint:fix
   ```

### For Existing Code (Gradual Migration)

Migrate as you touch files (no rush):

- Replace `console.log` with `logger` (110+ instances)
- Add Zod validation to API routes (12 routes remaining)
- Replace `any` types with proper TypeScript types (58 instances)
- Add tests for critical features

**Rule**: Improve code quality in files you're already modifying

---

## 🚨 PRE-COMMIT CHECKLIST

Before committing code changes:
```bash
pnpm format           # Format code
pnpm lint             # Check for issues
pnpm typecheck        # Verify TypeScript
cd apps/aud-web && pnpm test  # Run tests
```

---

## 📊 CODE QUALITY STATUS

| Item | Status | Progress |
|------|--------|----------|
| ESLint/Prettier | ✅ Configured | 100% |
| Env Validation | ✅ Complete | 100% |
| Logger Utility | ✅ Complete + Tested | 100% |
| API Validation | ✅ Utilities Ready | 8% (1/13 routes) |
| Local Fonts | ✅ GDPR Compliant | 100% |
| Test Infrastructure | ✅ 15 Tests Passing | Foundation |
| console.log migration | 🔄 Gradual | 0% (110+ instances) |
| any type fixes | 🔄 Gradual | 0% (58 instances) |

---

## 🎓 KEY PRINCIPLES

1. **Use new patterns in ALL new code** (mandatory)
2. **Migrate existing code gradually** (as you touch files)
3. **Run format + lint before committing** (prevents issues)
4. **Write tests for new features** (builds confidence)
5. **Document complex logic** (helps future you)
6. **Experiment freely** (this is a sandbox!)

---

## 🧪 IMPLEMENTED FEATURES (October 2025)

### Phase 4: Cinematic Onboarding System ✅
**Status**: Complete - 4-phase component-based onboarding
**Location**: [apps/aud-web/ONBOARDING.md](apps/aud-web/ONBOARDING.md)

**Components**:
- `OperatorTerminal` - Phase 1: Boot sequence and operator name input
- `OSSelector` - Phase 2: Theme selection with arrow key navigation
- `TransitionSequence` - Phase 3: Animated boot sequence
- `FlowStudio` - Phase 4: Main workspace with theme integration

**Hooks**:
- `useOnboardingPhase()` - State machine for phase transitions
- `useOperatorInput()` - Terminal boot sequence logic
- `useOSSelection()` - Arrow key theme selection

**Flow**:
```
operator (boot) → selection (theme) → transition (boot) → signal (workspace)
```

**Persistence**: localStorage tracks completion, can skip with `?skip_onboarding=true`

### Phase 5: Agent Spawning System ✅
**Status**: Complete - Modal-based agent spawning with database persistence
**Database**: `agent_manifests` table in Supabase

**Components**:
- `AgentSpawnModal` - Full-featured modal with name, role, personality, colour
- `GlobalCommandPalette` - Command palette integration (⌘K → spawn agent)

**Hook**:
- `useAgentSpawner()` - Supabase integration for spawn/list/remove operations

**Agent Roles**: scout, coach, tracker, insight, custom

**Spawning Flow**:
1. Open modal via ⌘K → "spawn agent scout/coach/tracker/insight/custom"
2. Configure name, role, personality, colour
3. Validate + spawn to Supabase
4. Modal closes with success sound

**Command Palette Integration**:
- 5 spawn commands (one per role)
- 1 list agents command
- Full keyboard navigation

**Database Schema**:
```sql
CREATE TABLE agent_manifests (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  name text UNIQUE,
  role text,
  personality text,
  colour text,
  created_at timestamptz,
  updated_at timestamptz
);
```

### Theme System ✅
**Status**: Complete - 5 themes with layout/narrative/ambient configs
**Themes**: ascii, xp, aqua, daw, analogue

**Architecture**:
- `ThemeResolver` - Manages theme selection and CSS variable injection
- `ThemeContext` - Provides currentTheme, themeConfig, setTheme
- `themes/` directory - Individual theme configs (ascii.theme.ts, xp.theme.ts, etc.)

**Theme Configs** (type `ThemeConfig`):
- `colors`: background, foreground, accent, border
- `typography`: fontFamily, fontSize, letterSpacing, textTransform
- `motion`: duration, easing, reducedMotion
- `sound`: oscillator, frequencies, durations
- `layout`: borderStyle, borderRadius, shadow, depth, glow, padding
- `narrative`: tagline, personality descriptors
- `ambient`: gridMotion, gridSpeed, hoverScale, hapticsEnabled

**Theme Personalities**:
- **ascii**: "type. test. repeat." - minimalist producer, green terminal
- **xp**: "click. bounce. smile." - nostalgic optimist, spring bounce
- **aqua**: "craft with clarity." - perfectionist designer, glassy blur
- **daw**: "sync. sequence. create." - experimental creator, 120 BPM tempo-synced
- **analogue**: "touch the signal." - human hands, warm lo-fi studio

**Integration**:
- `MissionPanel` - Uses theme layout for borders, shadows, glows
- `FlowCanvas` - Theme-aware grid background and motion
- `AmbientSoundLayer` - Per-theme sound banks (Web Audio API)
- `GlobalCommandPalette` - Theme switching commands

**UI Sounds** (per theme):
- ascii: square waves (880Hz/1760Hz/220Hz)
- xp: sine waves (nostalgic, soft)
- aqua: triangle waves (smooth, designer)
- daw: sawtooth waves (producer, experimental)
- analogue: gentle sine waves (280Hz/120Hz/260Hz, 0.4-0.6s durations)

### Multi-Agent System
- Agent executor with skill-based architecture
- Dynamic agent spawning and orchestration
- Real-time agent communication via Supabase

### Skills Engine
- Extensible skill registration system
- Skills can be invoked by agents dynamically
- Integration with external APIs

---

## 🔧 DEVELOPMENT COMMANDS

```bash
# Start development server (from root)
pnpm dev                    # Runs all apps in workspace

# Build for production
pnpm build                  # Build all apps
pnpm turbo build --filter=aud-web  # Build specific app

# Run tests
cd apps/aud-web && pnpm test
pnpm test:ui                # Visual test UI
pnpm test:coverage          # Coverage report

# Type checking
pnpm typecheck              # Check all packages
pnpm typecheck --filter=aud-web  # Check specific app

# Linting and formatting
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check

# Railway deployment (from root)
railway up                  # Deploy to Railway
railway status              # Check deployment status
railway logs                # View deployment logs
railway domain              # Generate/view public domain
railway open                # Open project in Railway dashboard
```

### Railway Configuration
**Build Command**: `pnpm install --no-frozen-lockfile && cd apps/aud-web && pnpm run build`
**Start Command**: `cd apps/aud-web && pnpm start`
**Config File**: `railway.json` (in repository root)
**Project ID**: `43846fc7-5c12-4285-a5e0-14275f0e4857`
**Live URL**: https://aud-web-production.up.railway.app

**Why Railway Over Vercel**:
- Vercel had persistent monorepo detection issues (70+ failed deployments)
- Railway's Nixpacks builder handles pnpm workspaces correctly
- First deployment succeeded without configuration tweaking
- Better support for Next.js 15 + Turborepo + pnpm workspace structure

**Environment Variables** (Production):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ucncbighzqudaszewjrv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
ANTHROPIC_API_KEY=<anthropic-key>
NEXT_PUBLIC_APP_URL=https://aud-web-production.up.railway.app
NODE_ENV=production
```

---

## 🎯 PROJECT PHILOSOPHY

This is an **experimental sandbox** for:
- Learning new patterns and technologies
- Testing innovative multi-agent workflows
- Building prototypes without customer pressure
- Exploring AI-powered music industry automation

**Remember**: This is separate from the customer acquisition project (total-audio-platform). Here you can experiment, break things, and learn!

---

## 🚨 NOTES FOR CLAUDE CODE

### Deployment Platform: Railway (October 2025)
**Decision**: Switched from Vercel to Railway after 70+ failed Vercel deployments
**Root Cause**: Vercel's Build Output API v3 detection system doesn't properly register Next.js 15 + pnpm workspace + Turborepo builds
**Railway Status**: ✅ Working perfectly - first deployment succeeded

**Vercel Issues Summary** (documented in `VERCEL_DEPLOYMENT_COMPLETE_SUMMARY.md`):
- Build completed successfully (55s, all routes generated)
- But Vercel showed `[0ms]` build time in inspect
- All routes returned 404 NOT_FOUND
- Issue is with Vercel's infrastructure, not the code
- Comprehensive documentation provided for Vercel support ticket if needed

**Railway Advantages**:
- Nixpacks builder understands pnpm workspaces natively
- No special configuration needed for monorepo structure
- Handles `workspace:*` dependencies correctly
- Fast deployment times
- Easy domain generation via `railway domain` command

### Theme System Migration (Completed)
**Changed**: Renamed themes from 'ableton'/'punk' to 'daw'/'analogue'
**Files Updated**: 6 files (OnboardingOverlay, MissionDashboard, BrokerChat, OSTransition, OSCard, os-selector/page.tsx)
**Status**: ✅ Complete - All TypeScript errors resolved

### Agent Spawning System
**Database**: `agent_manifests` table requires RLS policies
**Migration**: `supabase/migrations/20251022000000_add_agent_manifests.sql`
**Status**: ✅ Complete - Modal + database integration working

---

**Last Updated**: October 2025
**Status**: Phase 4/5 Complete - Onboarding + Agent Spawning implemented + Railway deployment live
**Recent Work**: Successfully deployed to Railway after resolving Vercel monorepo issues
**Live URL**: https://aud-web-production.up.railway.app
**Next**: Phase 6 - Supabase Realtime integration for live agent rendering
