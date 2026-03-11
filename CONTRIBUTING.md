# Contributing to totalaud.io

Thank you for contributing! This guide will help you get started quickly.

---

## Quick Start

1. **Open your IDE in this directory**
2. **Follow the rules in [CLAUDE.md](CLAUDE.md)**
3. **Use the project's British English standards**


### Using Terminal

1. **Clone and setup:**
   ```bash
   git clone https://github.com/totalaudiopromo/totalaud.io.git

   cd totalaud.io
   pnpm install
   ```

2. **Start development:**
   ```bash
   ./start-work.sh
   # Or manually:
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature
   ```

3. **Run the app:**
   ```bash
   pnpm dev
   ```

---

## Development Workflow

### 1. Before Starting Work

**Option A: Automatic (Cursor)**
```
Say: "Ready to work on [feature]"
Claude Code handles git automatically.
```

**Option B: Manual (Terminal)**
```bash
./start-work.sh
# Creates branch, pulls latest, ready to work
```

### 2. During Development

**Run locally:**
```bash
pnpm dev              # Start all apps
```

**Open in browser:**
- **aud-web**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323

**Check your work:**
```bash
pnpm lint             # Check for linting issues
pnpm typecheck        # Check TypeScript types
pnpm format           # Format code with Prettier
```

### 3. Before Committing

**Run health check:**
```bash
./check-health.sh
# Or manually:
pnpm typecheck && pnpm lint && pnpm build --filter=aud-web
```

**If checks pass:**
```bash
git add .
git commit -m "your message"
git push origin your-branch
```

### 4. Create Pull Request

1. Go to GitHub
2. Click "Compare & pull request"
3. Fill in description
4. Request review
5. Merge when approved

---

## Code Standards

### TypeScript

- **Strict mode enabled** - No implicit any
- **No `any` types** - ESLint will error
- **Proper type definitions** - Use interfaces/types

**Example:**
```typescript
// ❌ Bad
function processData(data: any) {
  return data.map((item: any) => item.name)
}

// ✅ Good
interface DataItem {
  name: string
  id: string
}

function processData(data: DataItem[]): string[] {
  return data.map((item) => item.name)
}
```

### Formatting

- **100 character line width**
- **Single quotes**
- **No semicolons**
- **Trailing commas in ES5 contexts**

**Automatic with Prettier:**
```bash
pnpm format
```

### Linting

- **No console.log** - Use logger utility
- **No unused variables** - Remove or prefix with `_`
- **React hooks rules** - Follow eslint-plugin-react-hooks

**Check:**
```bash
pnpm lint
```

**Auto-fix:**
```bash
pnpm lint:fix
```

---

## Commit Messages (MANDATORY)

### UK Spelling ONLY

- **optimise** (not optimize)
- **colour** (not color)
- **behaviour** (not behavior)
- **organise** (not organize)
- **analyse** (not analyze)

### Format

```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Rules

- **No emojis** - Keep it professional
- **Lowercase subject** - "add feature" not "Add feature"
- **Imperative mood** - "add" not "added" or "adds"
- **No period at end** - "add feature" not "add feature."
- **Max 72 characters** - For subject line

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

### Examples

**Good:**
```
feat(api): add user authentication with JWT

Implemented JWT-based authentication for API routes.
Users can now register and login securely with email/password.
Tokens expire after 24 hours.

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Bad:**
```
Added auth
```

See [COMMIT_CONVENTIONS.md](COMMIT_CONVENTIONS.md) for full details.

---

## Project Structure

### Monorepo Layout

```
totalaud.io/
├── apps/
│   └── aud-web/              # Main Next.js app
│       ├── src/
│       │   ├── app/          # App router (pages, API routes)
│       │   ├── components/   # React components
│       │   ├── hooks/        # Custom React hooks
│       │   ├── lib/          # Utilities
│       │   └── stores/       # Zustand state
│       └── package.json
├── packages/
│   └── core/                 # Core shared logic
│       ├── ai-provider/      # AI abstraction (perspectives)
│       ├── integrations/     # External APIs
│       ├── logger/           # Structured logging
│       └── supabase/         # Database client
├── packages/
│   ├── schemas/              # Shared TypeScript types
│   └── ui/                   # Shared React components (Design System)
└── supabase/                 # Database migrations
```

### Where to Put Code

**New React component:**
```
apps/aud-web/src/components/YourComponent.tsx
```

**New API route:**
```
apps/aud-web/src/app/api/your-route/route.ts
```

**Shared business logic:**
```
packages/core/your-package/src/index.ts
```

**Database schema change:**
```
supabase/migrations/YYYYMMDDHHMMSS_description.sql
```

**Custom React hook:**
```
apps/aud-web/src/hooks/useYourHook.ts
```

---

## Common Tasks

### Adding a New API Route

1. **Create route file:**
   ```
   apps/aud-web/src/app/api/users/route.ts
   ```

2. **Add Zod validation:**
   ```typescript
   import { z } from 'zod'

   const schema = z.object({
     name: z.string().min(1),
     email: z.string().email(),
   })

   export async function POST(req: NextRequest) {
     const body = await req.json()
     const validated = schema.parse(body)
     // ...
   }
   ```

3. **Test it:**
   ```bash
   curl -X POST http://localhost:3000/api/users \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com"}'
   ```

### Adding a Database Migration

1. **Create migration:**
   ```bash
   pnpm db:migrate
   # Creates timestamped file in supabase/migrations/
   ```

2. **Write SQL:**
   ```sql
   -- Add a new column
   ALTER TABLE users ADD COLUMN avatar_url TEXT;
   ```

3. **Generate TypeScript types:**
   ```bash
   pnpm db:types
   ```

4. **Use in code:**
   ```typescript
   import type { Database } from '@total-audio/schemas-database'

   const supabase = createClient<Database>(url, key)
   ```

### Creating a Shared Package

1. **Create package directory:**
   ```bash
   mkdir -p packages/core/your-package/src
   ```

2. **Add package.json:**
   ```json
   {
     "name": "@total-audio/core-your-package",
     "version": "1.0.0",
     "main": "./src/index.ts",
     "types": "./src/index.ts"
   }
   ```

3. **Add tsconfig.json:**
   ```json
   {
     "extends": "../../../tsconfig.json"
   }
   ```

4. **Use in apps:**
   ```typescript
   import { something } from '@total-audio/core-your-package'
   ```

---

## Testing

### Running Tests

```bash
# Not yet implemented - coming soon!
pnpm test
```

### Writing Tests

Place test files next to the code they test:
```
src/hooks/useUserPrefs.ts
src/hooks/useUserPrefs.test.ts
```

---

## Debugging

### Check Logs

**Development:**
```bash
pnpm dev
# Watch console output
```

**Supabase logs:**
```bash
pnpm db:start
# Open http://localhost:54323
# View logs in Supabase Studio
```

**Railway logs:**
```bash
railway logs
```

### Common Issues

**Build fails:**
```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

**Type errors:**
```bash
# Regenerate database types
pnpm db:types
pnpm typecheck
```

**Lint errors:**
```bash
# Auto-fix what's possible
pnpm lint:fix
# See remaining issues
pnpm lint
```

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## Key Documentation

- **[CLAUDE.md](CLAUDE.md)** - Complete project documentation
- **[VISION.md](docs/VISION.md)** - Canonical product vision
- **[COMMIT_CONVENTIONS.md](COMMIT_CONVENTIONS.md)** - Commit message rules
- **[CODEBASE_AUDIT_2026.md](CODEBASE_AUDIT_2026.md)** - Latest technical audit

---

## Code Review

### Before Requesting Review

- [ ] Code follows style guide (Prettier, ESLint)
- [ ] No `any` types used
- [ ] No console.log statements
- [ ] TypeScript check passes (`pnpm typecheck`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Commit messages use UK spelling
- [ ] No emojis in commits

### What Reviewers Look For

- **Type safety** - Proper TypeScript usage
- **Code organisation** - Logical structure
- **Performance** - No obvious bottlenecks
- **Security** - No exposed secrets, proper validation
- **Documentation** - Complex logic explained
- **Tests** - Critical paths covered

### Responding to Feedback

- **Be open** - Feedback helps everyone
- **Ask questions** - If unclear, ask for clarification
- **Make changes** - Address feedback promptly
- **Learn** - Apply feedback to future work

---

## Learning Resources

### Project-Specific

- **Monorepo:** [Turborepo docs](https://turbo.build/repo/docs)
- **Package Manager:** [pnpm docs](https://pnpm.io/)
- **Framework:** [Next.js 15 docs](https://nextjs.org/docs)
- **Database:** [Supabase docs](https://supabase.com/docs)
- **State:** [Zustand docs](https://zustand-demo.pmnd.rs/)

### Technologies

- **TypeScript:** [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- **React:** [React docs](https://react.dev/)
- **Tailwind CSS:** [Tailwind docs](https://tailwindcss.com/docs)
- **Zod:** [Zod docs](https://zod.dev/)

---

## Getting Help

### Before Asking

1. **Check documentation** - Read CLAUDE.md, WORKFLOW_GUIDE.md
2. **Search issues** - GitHub issues might have answers
3. **Check logs** - Error messages often point to the problem
4. **Try debugging** - Add console.error to narrow down issue

### How to Ask

**Good question:**
```
I'm trying to add authentication to /api/users but getting
"Missing required field: token" even though I'm sending it.

Here's my code: [paste code]
Here's the error: [paste error]
Here's what I tried: [list attempts]
```

**Bad question:**
```
It doesn't work, help!
```

### Where to Ask

- **GitHub Issues** - Bug reports, feature requests
- **Pull Request Comments** - Code-specific questions
- **Team Chat** - Quick questions, discussions

---

## Advanced Topics

### Pre-commit Hooks

Coming soon - will auto-run linting and formatting.

### CI/CD Pipeline

Coming soon - will auto-check PRs before merge.

### Performance Optimisation

See [TECHNICAL_AUDIT_2025.md](TECHNICAL_AUDIT_2025.md) for current status.

---

## License

Proprietary - © 2025 Total Audio Promo

---

## 🙏 Thank You

Your contributions make this project better! Questions? Check CLAUDE.md or ask on GitHub.

---

**Last Updated:** March 2026
**Status:** Alpha refinement
**Maintainers:** totalaud.io team
