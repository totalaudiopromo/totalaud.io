# totalaud.io

**A calm, opinionated system for independent artists to finish their music, understand what matters, and release with confidence.**

---

## What is totalaud.io?

Most music doesn't fail because it's bad. It fails because artists lack clear, trusted feedback and prioritisation before release. They are often overwhelmed by fragmented tools and contradictory advice.

totalaud.io is a **second opinion** before release — a **finishing mirror** for both music and strategy. It is a decision-support system designed to reduce cognitive, emotional, and creative friction.

### The Four Product Pillars

1.  **Finish** — Receive human-framed finishing notes from multiple perspectives (Producer, Mix, Listener, Industry). No quality scores, just insights to help you finish with confidence.
2.  **Release (Timeline)** — Model your release as a multi-week narrative rather than a single drop. Focus on sequencing, momentum, and timing.
3.  **Leverage (Intel)** — Treat relationships as creative capital. Uses structured data reasoning to turn messy contact lists into actionable memory and insight.
4.  **Pitch** — A single source of narrative truth for your bios, pitches, and social copy. Ensure consistency and maintain your unique voice across all channels.

---

## Architecture & Tech Stack

totalaud.io is built as a modern, high-performance monorepo focused on stability and a premium user experience.

### Technical Foundation
- **Core Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a curated Slate Cyan & Matte Black palette.
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for lightweight, reactive workspace state.
- **Database / Auth**: [Supabase](https://supabase.com/) for PostgreSQL, Auth, and Edge Functions.
- **Motion**: [Framer Motion](https://www.framer.com/motion/) for calm, cinematic transitions.
- **Monorepo Tooling**: [Turborepo](https://turbo.build/) + [pnpm](https://pnpm.io/) workspaces.
- **Deployment**: [Railway](https://railway.app/) for robust infrastructure.

### Project Structure
```text
totalaud.io/
├── apps/
│   └── aud-web/              # Main workspace application
│       ├── src/app/          # Next.js 15 App Router
│       ├── src/components/   # Mode-specific components (Ideas, Scout, Timeline, Pitch)
│       └── src/stores/       # Zustand state slices
├── packages/
│   └── core/
│       ├── ai-provider/      # LLM abstraction (Claude 3.5/4.5)
│       ├── supabase/         # Typed database client & RLS
│       ├── logger/           # Structured, level-based logging
│       └── integrations/     # External API connectors
└── supabase/                # Database migrations & seed data
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase CLI (for local development)

### Installation
```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

Visit:
- **Workspace**: `http://localhost:3000`
- **Supabase Studio**: `http://localhost:54323`

### Environment Setup
Copy the example environment file and add your keys (Supabase, Anthropic):
```bash
cp .env.example .env.local
```

---

## Code Quality & Standards

totalaud.io maintains high standards for code health and maintainability.

- **Current Audit Score**: **70/100** (February 2026 Audit)
- **British English**: Mandatory for all UI copy, comments, and documentation (`colour`, `optimise`, `behaviour`).
- **Validated Config**: Runtime environment variable validation via Zod.
- **Structured Logging**: Level-based logging (debug, info, warn, error) using the `@total-audio/logger` package.
- **Type Safety**: strict TypeScript enforcement and Zod validation for all API inputs.

### Development Commands
```bash
pnpm lint              # Run ESLint across all packages
pnpm format            # Format code with Prettier
pnpm typecheck        # Verify TypeScript across the monorepo
pnpm build             # Production build (Turborepo)
pnpm test              # Run Vitest suite
```

---

## Roadmap

- [x] **Phase 1: Foundation** (Monorepo, Supabase, Auth)
- [x] **Phase 2: Workspace Core** (Ideas Mode, Workspace Routing)
- [x] **Phase 3: Scout & Intel** (Contact Management & Discovery)
- [x] **Phase 4: Finish & Perspectives** (Finishing Notes system)
- [ ] **Phase 5: Release Multi-Week Timeline** (Advanced Sequencing)
- [ ] **Phase 6: Pitch Coach & Storytelling** (Narrative consistency system)
- [ ] **Phase 7: Public Beta** (Target: April 2026)

---

## Documentation
- [PRD.md](PRD.md) — Product Requirements & Specifications
- [VISION.md](docs/VISION.md) — Canonical source of project truth
- [CODEBASE_AUDIT_2026.md](CODEBASE_AUDIT_2026.md) — Latest technical audit and status
- [CLAUDE.md](CLAUDE.md) — Configuration and development rules for AI assistants

---

## Part of Total Audio

Tools I build for music PR, by [Chris Schofield](https://x.com/chrisschouk).

| Project | Description |
|---------|-------------|
| [TAP](https://totalaudiopromo.com) | Campaign management for music PR agencies |
| [totalaud.io](https://totalaud.io) | Release planning for emerging artists |
| [SpotCheck](https://spotcheck.cc) | Spotify playlist validation |
| [Newsjack](https://newsjack.cc) | Music industry newsjacking |
| [Podflow](https://github.com/totalaudiopromo/podflow) | Podcast intelligence for music PR |
| [Sink](https://github.com/totalaudiopromo/sink-cli) | Contact data hygiene CLI |

Questions? Reach me on [X/@chrisschouk](https://x.com/chrisschouk) or [info@totalaudiopromo.com](mailto:info@totalaudiopromo.com).

## License

Proprietary — © 2026 Total Audio

