# Quick Start Guide

Get up and running in 5 minutes.

## Prerequisites

Make sure you have these installed:
- Node.js 18+
- Docker Desktop (running)
- pnpm (`npm install -g pnpm`)

## Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Start Supabase (first time downloads ~500MB)
pnpm db:start

# 4. Run migrations
pnpm db:migrate

# 5. Generate types
pnpm db:types

# 6. Start dev server
pnpm dev
```

## Access Points

- **App:** http://localhost:3000
- **Supabase Studio:** http://localhost:54323
- **API Health:** http://localhost:3000/api/health

## Get Supabase Keys

1. Open http://localhost:54323
2. Go to **Settings** → **API**
3. Copy keys to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key

## Add Your OpenAI Key

Edit `.env.local`:
```bash
OPENAI_API_KEY=sk-...
```

## Verify Everything Works

```bash
# Type check
pnpm typecheck
# Should output: Tasks: 5 successful

# Test health endpoint
curl http://localhost:3000/api/health
# Should output: {"status":"ok",...}
```

## What's Next?

See [GETTING_STARTED.md](./GETTING_STARTED.md) for detailed information or [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) for what was created.

## Common Commands

```bash
pnpm dev              # Start development
pnpm db:start         # Start Supabase
pnpm typecheck        # Check types
pnpm clean            # Clean builds
```

## Troubleshooting

**Port in use?** Stop Supabase: `pnpm db:stop`  
**Type errors?** Regenerate: `pnpm db:types`  
**Docker issues?** Check: `docker ps`  

---

**Ready to build!** 🎵

