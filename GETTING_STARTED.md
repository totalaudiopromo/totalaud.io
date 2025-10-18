# Getting Started with TotalAud.io

This guide will help you set up the TotalAud.io monorepo for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **pnpm** 8.0.0 or higher
- **Docker Desktop** (for local Supabase)
- **Supabase CLI** (optional but recommended)

### Installing Prerequisites

```bash
# Install Node.js (if not already installed)
# Visit https://nodejs.org or use nvm:
nvm install 18

# Install pnpm
npm install -g pnpm

# Install Supabase CLI (macOS)
brew install supabase/tap/supabase

# Or using npm
npm install -g supabase
```

## Installation Steps

### 1. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install
```

This will install dependencies for all packages and apps in the monorepo.

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your actual keys
# You can start with the defaults for local development
```

**Important Environment Variables:**

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase instance URL (defaults to localhost:54321)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (get from Supabase Studio)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (get from Supabase Studio)
- `OPENAI_API_KEY` - Your OpenAI API key (required for AI features)
- `ANTHROPIC_API_KEY` - Your Anthropic API key (optional)

### 3. Start Supabase

```bash
# Start local Supabase instance
pnpm db:start
```

This will start:
- PostgreSQL database on port 54322
- API server on port 54321
- Studio (web interface) on port 54323

**First time setup:** The first run will download Docker images, which may take a few minutes.

### 4. Run Database Migrations

```bash
# Apply database migrations
pnpm db:migrate
```

This creates all necessary tables for the agent system.

### 5. Generate TypeScript Types

```bash
# Generate types from Supabase schema
pnpm db:types
```

This creates TypeScript types in `packages/schemas/database/types.ts`.

### 6. Start Development Servers

```bash
# Start all development servers
pnpm dev
```

This starts:
- **aud-web** on http://localhost:3000
- Any other apps in the workspace

## Verify Installation

### Check aud-web

Visit http://localhost:3000 - you should see the TotalAud.io landing page.

### Check Supabase Studio

Visit http://localhost:54323 - you should see the Supabase Studio interface.

### Check API Health

```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-01-18T...",
  "service": "aud-web"
}
```

### Get Supabase Keys

In Supabase Studio (http://localhost:54323):

1. Go to **Settings** → **API**
2. Copy the **anon** key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Copy the **service_role** key to `SUPABASE_SERVICE_ROLE_KEY`

## Common Commands

### Development

```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all packages and apps
pnpm typecheck    # Type check all packages
pnpm clean        # Clean all build artifacts
```

### Database

```bash
pnpm db:start     # Start Supabase
pnpm db:stop      # Stop Supabase
pnpm db:migrate   # Run migrations
pnpm db:reset     # Reset database (WARNING: deletes all data)
pnpm db:types     # Generate TypeScript types
```

### Individual Apps

```bash
# Run commands for specific app
pnpm --filter aud-web dev
pnpm --filter @total-audio/core-skills-engine typecheck
```

## Troubleshooting

### Port Already in Use

If you see port conflicts:

```bash
# Stop Supabase
pnpm db:stop

# Check what's using the port
lsof -i :3000   # or :54321, :54322, :54323

# Kill the process if needed
kill -9 <PID>
```

### Docker Not Running

Supabase requires Docker. Make sure Docker Desktop is running:

```bash
docker ps
```

If this fails, start Docker Desktop.

### pnpm Install Fails

Clear cache and try again:

```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

### Type Errors

Regenerate types:

```bash
pnpm db:types
pnpm typecheck
```

### Migration Errors

Reset and reapply:

```bash
pnpm db:reset
pnpm db:migrate
```

**⚠️ WARNING:** This deletes all data!

## Next Steps

Once everything is running:

1. **Explore the codebase:**
   - `packages/core/skills-engine` - Skill execution system
   - `packages/core/ai-provider` - AI abstraction layer
   - `apps/aud-web` - Next.js frontend

2. **Create your first skill:**
   - See `skills/scout/research-contacts.yml` for an example
   - Add new skills in `skills/` directory

3. **Test the API:**
   ```bash
   curl -X POST http://localhost:3000/api/skills/research-contacts/invoke \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"query": "indie rock playlists", "type": "playlist", "genres": ["indie"], "regions": ["UK"], "max_results": 10}'
   ```

4. **Read the documentation:**
   - `ARCHITECTURE_MERGE_PLAN.md` - Migration strategy
   - `README.md` - Project overview

## Getting Help

- Check existing [documentation](./README.md)
- Review [architecture plan](./ARCHITECTURE_MERGE_PLAN.md)
- Look at example implementations in `packages/core/`

## Development Workflow

### Adding a New Package

```bash
mkdir -p packages/core/my-package
cd packages/core/my-package
pnpm init
```

Then add to `pnpm-workspace.yaml` if not already covered by globs.

### Adding a New Skill

1. Create YAML definition in `skills/<category>/`
2. Skills are auto-loaded on app start
3. Implement custom logic in `packages/core/skills-engine/src/executor.ts`

### Running Tests

```bash
# Once tests are set up
pnpm test
pnpm test --filter @total-audio/core-skills-engine
```

## Success! 🎉

You should now have:
- ✅ All dependencies installed
- ✅ Supabase running locally
- ✅ Database migrated
- ✅ Types generated
- ✅ Development server running

You're ready to start building!

