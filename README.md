# totalaud.io

A calm creative workspace for independent artists. Minimal, not overwhelming. Artist-first.

**Live**: https://aud-web-production.up.railway.app

## What It Does

totalaud.io gives independent artists one clear place to:

- **Ideas Mode** — Capture and organise creative/marketing ideas
- **Scout Mode** — Discover real opportunities (playlists, blogs, radio, press)
- **Timeline Mode** — Plan release actions visually
- **Pitch Mode** — Craft narratives and bios with AI coaching

## Tech Stack

- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Supabase (auth + database)
- Framer Motion
- Turborepo + pnpm workspace

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
pnpm install
pnpm dev
```

Visit http://localhost:3000

### Environment Variables

Copy `.env.example` to `.env.local` and add your keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## Project Structure

```
totalaud.io/
├── apps/
│   └── aud-web/              # Main workspace app
│       └── src/
│           ├── app/          # Next.js app router
│           │   └── workspace/  # 4-mode workspace
│           ├── components/   # React components
│           ├── lib/          # Utilities
│           ├── hooks/        # Custom hooks
│           └── stores/       # Zustand state
├── packages/
│   └── core/
│       ├── supabase/         # Database client
│       ├── schemas/          # TypeScript types
│       └── ai-provider/      # AI integration
└── _archive/                 # Archived packages
```

## Development

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm lint         # Lint code
pnpm typecheck    # Type check
pnpm test         # Run tests
```

## Deployment

Deployed on Railway. See `railway.json` for configuration.

```bash
railway up        # Deploy
railway logs      # View logs
```

## Documentation

Project documentation is in the repository root:

- `CLAUDE.md` — Development guide and conventions
- `PRD.md` — Product requirements

## Licence

Proprietary — 2025 Total Audio
