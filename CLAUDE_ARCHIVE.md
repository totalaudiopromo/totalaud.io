# Claude Code Archive - Historical Content

> **Note**: This file contains historical content archived from CLAUDE.md on 2026-01-08.
> These sections document completed features, migrations, and configurations that are no longer actively needed for day-to-day development.

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

## 🤖 BROWSER AUTOMATION & VISUAL CONTEXT (October 2025)

**Status**: ✅ **DUAL MCP SETUP COMPLETE**

> **Current docs**: See [BROWSER_AUTOMATION_GUIDE.md](BROWSER_AUTOMATION_GUIDE.md) and [VISUAL_CONTEXT_WORKFLOW.md](VISUAL_CONTEXT_WORKFLOW.md)

### Two MCP Servers for Different Purposes

#### 1. Chrome DevTools MCP - Visual Context ⭐
**Purpose**: Let Claude Code **SEE** what it's building in real-time

**When to use:**
- Building UI components (need visual feedback)
- Debugging CSS/layout issues (see the page)
- Performance analysis (profiling tools)
- Console debugging (JavaScript errors)
- Network inspection (API requests)

**Available tools:**
- `take_screenshot` - Screenshot of localhost during development
- `take_snapshot` - DOM structure with CSS
- `record_trace` - Performance profiling
- `get_console_logs` - JavaScript console output
- `get_network_activity` - Network requests inspection

**Example workflow:**
```
User: "Add a new ConsolePanel component to the app"
Claude: [Writes component code]
Claude: [Takes screenshot of localhost:3000]
Claude: "I can see the panel is rendering but the border is too thick, let me adjust..."
Claude: [Fixes styling]
Claude: [Takes screenshot to confirm]
Claude: "Perfect! The console panel now matches the theme."
```

**Configuration:**
```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": ["chrome-devtools-mcp@latest"]
  }
}
```

#### 2. Puppeteer MCP - Background Automation 🤖
**Purpose**: Automate tasks that don't need visual feedback

**When to use:**
- Web scraping (radio contacts, playlists)
- Form automation (login, submissions)
- Dialog auto-handling (alerts/confirms)
- Data extraction (emails, contact info)
- Background workflows (no visual needed)

**Available tools:**
- `puppeteer_navigate` - Navigate to URLs
- `puppeteer_screenshot` - Take screenshots
- `puppeteer_click` - Click elements
- `puppeteer_fill` - Fill form inputs
- `puppeteer_evaluate` - Execute JavaScript
- `puppeteer_select` - Select dropdown options
- `puppeteer_hover` - Hover elements

**Key feature:** Auto-dialog handling
```javascript
// Automatically injected to handle popups
window.alert = (msg) => console.log('[AUTO-HANDLED] Alert:', msg);
window.confirm = (msg) => { console.log('[AUTO-HANDLED] Confirm:', msg); return true; };
window.prompt = (msg, def) => { console.log('[AUTO-HANDLED] Prompt:', msg); return def || ''; };
```

**Example workflow:**
```
User: "Get all BBC Radio 1 DJ email addresses"
Claude: [Navigates to BBC Radio 1 contacts page]
Claude: [Auto-handles any dialog popups]
Claude: [Extracts all email addresses]
Claude: "Found 15 DJ contacts with emails"
```

**Configuration:**
```json
{
  "puppeteer": {
    "command": "npx",
    "args": ["@modelcontextprotocol/server-puppeteer"]
  }
}
```

### When to Use Which?

| Task | Use This | Why |
|------|----------|-----|
| Building UI components | **Chrome DevTools** | Need to see visual result |
| Debugging CSS/layout | **Chrome DevTools** | Visual feedback required |
| Performance profiling | **Chrome DevTools** | Built-in trace viewer |
| JavaScript debugging | **Chrome DevTools** | Console logs + snapshots |
| Scraping contact info | **Puppeteer** | Background task |
| Form automation | **Puppeteer** | No visual needed |
| Login workflows | **Puppeteer** | Dialog handling + automation |
| Data extraction | **Puppeteer** | Headless efficiency |

### Verify Setup

```bash
claude mcp list

# Should show:
# ✓ chrome-devtools: npx chrome-devtools-mcp@latest - Connected
# ✓ puppeteer: npx @modelcontextprotocol/server-puppeteer - Connected
```

### Auto-Approval Configuration

**Status**: ✅ Configured in `~/.claude/settings.json`

All Chrome DevTools MCP tools are pre-approved for automatic execution without confirmation prompts:
- `take_screenshot` - Capture visual state
- `take_snapshot` - DOM structure analysis
- `list_pages` - Browser tab management
- `navigate_page` - Page navigation
- `click`, `fill`, `hover` - UI interactions
- `list_console_messages`, `get_console_message` - Console debugging
- `list_network_requests`, `get_network_request` - Network inspection
- `performance_*` - Performance profiling

This enables **seamless visual context workflow** without interruptions during UI development.

### Default Behavior for Claude Code

**When building UI:**
1. Write component code
2. Take screenshot of localhost:3000 (Chrome DevTools MCP)
3. Visually verify the result
4. Make adjustments based on what you see
5. Take screenshot to confirm

**When automating tasks:**
1. Navigate to target URL (Puppeteer MCP)
2. Auto-inject dialog handler
3. Execute automation workflow
4. Return structured data

**Key advantage:** Claude Code can now SEE what it's building (visual context) AND automate background tasks (no manual clicking). Best of both worlds!

---

## ✅ CODE QUALITY INFRASTRUCTURE - DETAILED (October 2025)

**Status**: ✅ **COMPLETE** - All critical audit recommendations implemented
**Test Results**: 15/15 passing tests

> **Current docs**: See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) and [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

### Detailed Implementation Notes

#### 1. ESLint & Prettier (Automated Code Quality)
- **ESLint**: TypeScript + React + Next.js + Web Audio API support
- **Prettier**: Consistent code formatting
- **Config Files**: `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`

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

---

## 🚨 HISTORICAL NOTES (Completed Migrations)

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

## 📊 CODE QUALITY STATUS (Snapshot October 2025)

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

## 🤖 DAN + THE CREATIVE CREW - DETAILED (Agent System)

**Status**: Active - 11 specialised agents coordinated by Dan

> **Current location**: All skills are in `.claude/skills/` with their own SKILL.md files

### The Orchestrator

**Dan** coordinates all work across the Creative Crew. Describe what you need in plain English, Dan automatically delegates to the right specialist agents, runs them in parallel, and synthesises results.

**Invoke Dan when**:
- Task requires 2+ specialist agents
- Multiple independent subtasks can run parallel
- Deep specialised knowledge needed
- Task will take >15 minutes

### Core Mode Agents

| Agent | Mode | Specialty | Triggers |
|-------|------|-----------|----------|
| **Ideas Curator** | Ideas | Organisation, tagging, canvas layouts | "organise", "ideas", "canvas" |
| **Scout Navigator** | Scout | Opportunity discovery, filtering | "find", "opportunities", "playlists" |
| **Timeline Planner** | Timeline | Release planning, scheduling | "plan", "release", "schedule" |
| **Pitch Coach** | Pitch | Narrative crafting, bio writing | "bio", "pitch", "describe" |

### Technical Specialists

| Agent | Specialty | Triggers |
|-------|-----------|----------|
| **Quality Lead** | Testing, mobile UX, accessibility | "test", "mobile", "QA" |
| **State Architect** | Zustand stores, sync patterns | "store", "state", "zustand" |
| **Route Builder** | API routes, Zod validation | "api", "route", "endpoint" |
| **Motion Director** | Framer Motion, animation tokens | "animation", "motion" |
| **Discovery Specialist** | Contact classification, GDPR | "contacts", "enrich", "verify" |
| **Supabase Engineer** | RLS policies, migrations | "database", "supabase", "rls" |

### Global Skills (Available Across All Projects)

These skills work in any project directory:

- `systematic-debugging` - Bug investigation framework
- `brainstorming` - Idea refinement before implementation
- `test-runner` - Test suite execution
- `mobile-first-validator` - Mobile UX standards
- `accessibility-validator` - WCAG compliance
- `changelog-generator` - Release notes generation

### Skill Files Location

All Creative Crew skills are in `.claude/skills/`:

```text
.claude/skills/
├── dan/                    # Orchestrator
├── ideas-curator/          # Ideas Mode
├── scout-navigator/        # Scout Mode
├── timeline-planner/       # Timeline Mode
├── pitch-coach/            # Pitch Mode
├── quality-lead/           # Testing & QA
├── state-architect/        # Zustand stores
├── route-builder/          # API routes
├── motion-director/        # Animations
├── discovery-specialist/   # Contact enrichment
└── supabase-engineer/      # Database
```

### Example Usage

**Feature development**:
```
"Build the Scout Mode filter panel"
→ Dan activates: Scout Navigator, State Architect, Route Builder, Supabase Engineer
→ All run in parallel
→ Total time = slowest task (not sum of all)
```

**Pre-deployment**:
```
"Prepare for deployment"
→ Dan activates: Quality Lead, Motion Director, State Architect
→ Parallel QA checks
→ 3-4x faster than sequential
```

---

## 💬 QUICK START PROMPTS FOR USERS

### Starting a Development Session

| Goal | Example Prompt |
|------|----------------|
| Start dev session | "Ready to work on ScrollFlow improvements" |
| Add feature | "Add magnetic CTA button to landing page" |
| Fix issue | "Fix text blur timing in ScrollFlow animation" |
| Review code | "Audit all Framer Motion transitions for consistency" |
| Test | "Run UI lint and check for a11y compliance" |

### What Happens Automatically

**User says:** "Ready to work on [feature]"

**Claude Code does:**
1. Checks git status
2. Pulls latest if needed
3. Creates feature branch (if not on one)
4. Implements changes using design system
5. Commits following conventions
6. Formats everything with Prettier/ESLint
7. Pushes when ready

**No terminal needed** - Claude + Cursor handle everything

---

## 🧩 CURSOR-SPECIFIC INTEGRATION

### For Cursor IDE Users

- **Framer Motion** for all cinematic motion (not CSS transitions)
- **useScroll + useTransform** for scroll-based animations
- **Never hardcode media queries** - Tailwind responsive utilities only
- **Component prefix convention** - Studio/Flow for `/components/ui`
- **Motion tokens location** - `/packages/ui/tokens/motion.ts`

### Safety & Linting

Claude automatically:
- ✅ Checks git before editing
- ✅ Warns if behind remote
- ✅ Creates feature branches
- ✅ Runs Prettier + ESLint fix on save
- ✅ Removes console logs (unless in debug mode)
- ✅ Uses `logger.ts` from `/packages/utils` for debug output

---

## 🪄 MULTI-AGENT HANDOFF NOTES

If GPT-5, Claude, or another model edits this project:

- **Respect this CLAUDE.md** as canonical workflow
- **Preserve animation + colour tokens** - Do not modify design system
- **Never rewrite working Framer Motion logic** unless explicitly requested
- **Check active phase before refactoring** - Respect current status
- **Use clear commit messages** with British spelling
- **Follow all style conventions** - This maintains consistency

---

**Archived**: 2026-01-08
**Reason**: CLAUDE.md optimisation - moved historical/detailed content to reduce context size
