# Developer Quick Reference

Fast reference for common development tasks. For detailed info, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 🚀 Quick Start

```bash
# First time setup
git clone https://github.com/totalaudiopromo/totalaud.io.git
cd totalaud.io
pnpm install

# Start everything
pnpm dev

# Start just the web app
pnpm dev:web
```

---

## 📝 Common Commands

### Development

```bash
pnpm dev              # Start all apps in monorepo
pnpm dev:web          # Start only aud-web (faster)
pnpm dev:clean        # Clean install + dev (when things break)
```

### Building

```bash
pnpm build            # Build all apps
pnpm build:web        # Build only aud-web
```

### Code Quality

```bash
pnpm typecheck        # Check all TypeScript
pnpm typecheck:web    # Check only aud-web (faster)
pnpm lint             # Run ESLint
pnpm lint:fix         # Auto-fix lint issues
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting only
```

### Pre-commit Checks

```bash
pnpm check            # Full check (typecheck + lint + format)
pnpm check:fast       # Fast check (typecheck web + lint)
```

### Database

```bash
pnpm db:start         # Start Supabase locally
pnpm db:stop          # Stop Supabase
pnpm db:restart       # Restart Supabase
pnpm db:studio        # Open Supabase Studio in browser
pnpm db:types         # Generate TypeScript types from schema
pnpm db:migrate       # Push local migrations
pnpm db:reset         # Reset database (deletes data!)
```

### Deployment

```bash
pnpm silver:check [url]         # Check deployment health
pnpm silver:rollback [args]     # Rollback Railway deployment
```

### Troubleshooting

```bash
pnpm clean            # Clean all build artifacts
pnpm port:kill        # Kill process on port 3000
```

---

## 🔑 Key URLs (Local Dev)

- **App**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **API Health**: http://localhost:3000/api/health

---

## 📂 Project Structure

```
totalaud.io/
├── apps/
│   └── aud-web/              # Main Next.js app
│       ├── src/app/          # Pages & API routes
│       ├── src/components/   # React components
│       ├── src/hooks/        # Custom hooks
│       └── src/lib/          # Utilities
├── packages/
│   ├── core/                 # Business logic
│   │   ├── agent-executor/   # Agent orchestration
│   │   ├── ai-provider/      # AI abstraction
│   │   ├── skills-engine/    # YAML skills
│   │   ├── theme-engine/     # Theme system
│   │   └── supabase/         # DB client
│   ├── schemas/              # TypeScript types
│   └── ui/                   # Shared components
├── supabase/
│   └── migrations/           # Database migrations
├── scripts/                  # Dev & deployment scripts
└── docs/                     # Documentation
```

---

## 🎯 Where to Add Code

| Task | Location |
|------|----------|
| New page | `apps/aud-web/src/app/page-name/page.tsx` |
| API route | `apps/aud-web/src/app/api/route-name/route.ts` |
| Component | `apps/aud-web/src/components/YourComponent.tsx` |
| Hook | `apps/aud-web/src/hooks/useYourHook.ts` |
| Shared logic | `packages/core/your-package/src/index.ts` |
| DB migration | `supabase/migrations/YYYYMMDDHHMMSS_name.sql` |
| Script | `scripts/your-script.ts` |

---

## ✅ Commit Message Format

```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

**UK Spelling**: optimise, colour, behaviour, organise

**Rules**: Lowercase, no emojis, imperative mood

---

## 🐛 Common Issues

### Port 3000 already in use
```bash
pnpm port:kill
```

### Type errors after schema change
```bash
pnpm db:types
pnpm typecheck
```

### Build fails mysteriously
```bash
pnpm dev:clean
```

### Supabase won't start
```bash
pnpm db:restart
```

---

## 📚 Documentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Full contribution guide
- **[README.md](README.md)** - Project overview
- **[CURSOR_QUICK_START.md](CURSOR_QUICK_START.md)** - Cursor IDE setup
- **[COMMIT_CONVENTIONS.md](COMMIT_CONVENTIONS.md)** - Detailed commit rules
- **[docs/](docs/)** - Technical documentation

---

## 🆘 Need Help?

1. Check [CONTRIBUTING.md](CONTRIBUTING.md)
2. Search [GitHub issues](https://github.com/totalaudiopromo/totalaud.io/issues)
3. Ask in team chat
4. Create a new issue

---

**Last Updated**: November 2025 (Phase 18)

