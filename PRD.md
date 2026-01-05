# Product Requirements Document (PRD) — totalaud.io

**Version**: 2026.01 — Vision Alignment  
**Canonical Source**: [`docs/VISION.md`](docs/VISION.md)  
**Pillars Reference**: [`docs/PRODUCT_PILLARS.md`](docs/PRODUCT_PILLARS.md)  
**Audience**: Claude, engineers, designers, and future contributors

---

## 1. Product Summary

totalaud.io is a calm, opinionated system that helps independent artists finish their music, understand what matters, and release with confidence.

**The core problem we solve:**

Indie artists don't lack tools. They lack clear, trusted feedback and prioritisation before release. Most music doesn't fail because it's bad — it fails because no one explains what matters, feedback comes too late, and artists are overwhelmed by fragmented tools and advice.

**totalaud.io reduces cognitive, emotional, and creative friction.**

The product is structured around four pillars:

1. **Finish** — Finishing notes from multiple perspectives (producer, mix, listener, industry)
2. **Release** — Multi-week narrative planning, not just scheduling
3. **Leverage** — Relationships as creative capital, memory not scraping
4. **Pitch** — Single source of narrative truth, consistency across all copy

**The value:**

Instead of guessing whether they're ready, artists get a trusted second opinion. Instead of scattering notes and contacts, they have context and memory. Instead of inconsistent pitches, they have a coherent story.

---

## 2. Product Vision

totalaud.io is:

- A **second opinion** before release
- A **finishing mirror** for music and strategy
- A **decision-support system**, not an automation machine
- A **calm, respectful space** for artists to think clearly

It allows artists to finally feel like:

> "This understands how much I care about my music."

It is NOT:

- ❌ An "AI music critic"
- ❌ An auto-producer or mastering replacement
- ❌ A generic all-in-one SaaS dashboard
- ❌ A CRM or PR automation tool
- ❌ Hype-driven or growth-hack oriented

---

## 3. Target User

### Primary user

Independent artists releasing music without a full team.

### Secondary users (future)

- Music managers
- Boutique PR agencies
- Artist development coaches

### User pains

- Don't know what to do next
- Don't know where to send their music
- Don't know how to describe themselves
- Feel overwhelmed by promotion
- Scatter notes across apps
- Lose ideas and lose momentum

totalaud.io solves these pains through clarity, structure, and strategic guidance.

---

## 4. Core Product Pillars

> **Detailed specifications**: See [`docs/PRODUCT_PILLARS.md`](docs/PRODUCT_PILLARS.md) for full pillar definitions, boundaries, and language rules.

### 4.1. Finish (Finishing Notes & Perspectives)

**Purpose:**  
Help artists finish songs and releases with confidence.

**Key Requirements:**

- Accept track upload or reference
- Return human-framed finishing notes from multiple perspectives:
  - Producer perspective (arrangement, energy, structure)
  - Mix / translation perspective (clarity, balance, mono, dynamics)
  - Listener first-impression (emotional arc, hooks)
  - Industry / release context (readiness, timing)
- Surface release readiness indicators (not scores)
- No quality judgements or ratings
- No auto-fixing, auto-mastering, or auto-production

**Success metric:**  
Artists feel confident about what to address before release.

---

### 4.2. Release Planning (Multi-Week Narrative)

**Purpose:**  
Help artists model a release as a multi-week narrative, not a single drop.

**Key Requirements:**

- Visual timeline for release planning
- Phases: pre-release, release, post-release
- Surface timing considerations (playlist lead times, press deadlines)
- Connect creative decisions to release outcomes
- Simple toolbar (search, sort, export)
- No Gantt chart complexity
- Local-first state with optional Supabase sync

**Success metric:**  
Artists create a plan in under 3 minutes and understand what to do next.

---

### 4.3. Leverage & Relationships (Intel)

**Purpose:**  
Help artists understand relationships as creative capital, not data entries.

**Key Requirements:**

- Store and enrich contact data over time
- Surface relationship context (last pitch, response, engagement)
- Use structured data reasoning to:
  - Clean and enrich messy contact data
  - Spot patterns in engagement across releases
  - Summarise relationship signals in plain English
- Prioritise depth over volume
- No scraping, no mass-email, no automation
- Data stored in Supabase with proper GDPR handling

**Success metric:**  
Artists understand who actually matters and why.

---

### 4.4. Storytelling & Pitch

**Purpose:**  
Help artists maintain a single source of narrative truth.

**Key Requirements:**

- Store core narrative elements (story, sound, positioning)
- Generate pitch drafts tailored to context (playlist, press, social)
- Ensure consistency across all outputs
- Act as editor and tone guardian, not ghostwriter
- Export to clipboard
- Minimal design (no chatbots, no character personas)

**Success metric:**  
Artists produce pitches and bios they actually use.

---

### 4.5. (Future Consideration) Confidence Signals

**Purpose:**  
Give artists confidence, not complexity.

**Requirements (if implemented):**

- Simple at-a-glance indicators
- No dashboards or analytics overwhelm
- Focus on progress and learning, not vanity metrics

(Not required for initial release.)

---

## 5. Non-Goals

The product will NOT:

- Attempt full PR automation
- Use complex multi-agent workflows
- Include OS themes (XP/Aqua/ASCII/etc.)
- Build elaborate dashboards
- Replace full CRMs
- Integrate deeply with socials at MVP
- Attempt scraping at scale

Keep the product calm, small, premium.

---

## 6. Functional Requirements (High-Level)

| Area | Requirement |
|------|-------------|
| Architecture | Single-page workspace with mode tabs |
| Persistence | Local-first + Supabase sync for Scout/Timeline |
| UI System | Tailwind + ShadCN + slate neutrals |
| Motion | Framer Motion subtle animations |
| Mobile | First-class responsive behaviours |
| Auth | Simple Supabase email-native login |
| Deployment | Railway + Turborepo |
| AI | Prompt-based Claude functions for Pitch & Scout reasoning |
| Data | Supabase table for opportunities |

---

## 7. Technical Requirements

**Frontend:**

- Next.js App Router
- Zustand for state
- Tailwind CSS
- Radix/ShadCN components
- LocalStorage persistence
- Framer Motion transitions

**Backend:**

- Supabase (auth, DB)
- Edge functions for Scout filtering
- Minimal REST endpoints
- No websockets needed
- No agents
- No expensive workflows

---

## 8. UX Principles

- **Calm**: Everything reduces cognitive load
- **Soft motion**: Only subtle Framer Motion transitions
- **Direct**: No assistant bubbles, no chat UI, no character personas
- **Portable**: Export always available
- **Human language**: At every interface boundary
- **Calm visual language**: Slate neutrals, thin borders, minimal accent

---

## 9. Success Metrics

**Confidence & Clarity Indicators:**

- Artists report feeling more confident about release decisions
- Artists describe the experience as "calm", "clear", or "helpful"
- Artists complete a release plan and understand what to do next
- Artists produce pitches and bios they actually use
- Artists return because they trust the product, not because of reminders

**Learning Indicators:**

- Artists understand what matters about their track after using Finish
- Artists know who to reach out to and why after using Leverage
- Artists have a coherent story after using Pitch

**Business success:**

- 5–20 paying artists in first 2 months
- Artists recommend totalaud.io to other artists (word of mouth)

---

## 10. Risks / Mitigations

| Risk | Mitigation |
|------|------------|
| Scout feels empty | Start with curated dataset |
| Value unclear | Build landing page messaging early |
| Tools feel generic | Maintain brand identity and UX polish |
| Mobile poor | Prioritise mobile from day one |
| Overcomplexity creeps back | Strict scope control |

---

## 11. Release Plan / Deliverables

The final product should include:

- /workspace with 4 modes
- Fully implemented Ideas Mode
- Functional Scout with curated opportunity dataset
- Timeline with drag-drop and add-from-Scout
- Pitch coach
- Basic auth
- Landing page with clear product value

---

## 12. Roadmap to Implementation (6 Weeks Total)

### PHASE 1 — Foundation (Week 1)

**Goal:** Prepare workspace + remove old complexity

**Tasks:**

- Clean repository of old OS/agents code
- Ensure /workspace routing + tabs are stable
- Finalise colour system (slate neutrals)
- Setup Supabase schema for opportunities
- Clean up state architecture (Zustand slices)

**Deliverables:**

- Clean, slim codebase
- Solid base for the 4-mode workspace

---

### PHASE 2 — Ideas Mode Finalisation (Week 1–2)

(Already 90% complete)

**Tasks:**

- Final UI polish
- Mobile testing
- Export and sort optimisation
- UX improvements to empty state

**Deliverables:**

- Completed Ideas Mode (production ready)

---

### PHASE 3 — Scout Mode MVP (Week 2–3)

Highest leverage area.

**Tasks:**

- Build Supabase table(s) for opportunities
- Create curated dataset of 50–100 items
- Build filtering UI
- Build card grid list
- Add "Add to Timeline" action
- Basic edge function for search/filter
- UI polish (calm, minimal)

**Deliverables:**

- Fully functional Scout Mode
- Opportunities → Timeline flow working

---

### PHASE 4 — Timeline Mode MVP (Week 3–4)

**Tasks:**

- Draggable blocks
- Add-from-Scout component
- Sort, export, clear
- "Next 3 steps" mini-widget
- Local-first persistence
- Mobile adjustments

**Deliverables:**

- Artists leave with a real plan
- The core emotional win-state

---

### PHASE 5 — Pitch Mode (Week 4–5)

**Tasks:**

- Coach panel UI
- Prompt templates (bio, pitch, description, mood, genre clarity)
- Export actions
- Local persistence
- Anticipatory suggestions

**Deliverables:**

- Artists produce a narrative they actually use
- A calm, simple writing experience

---

### PHASE 6 — Auth + Landing Page (Week 5–6)

**Tasks:**

- Email/password auth with Supabase
- Save workspace state (optional)
- Build marketing site:
  - What it is
  - Why it helps
  - Screenshots
  - Personal story
- Minimal pricing page
- CTA: "Start Your Workspace"

**Deliverables:**

- Public-facing product
- Ready for beta testers

---

### PHASE 7 — Polish + Beta Release (Week 6)

**Tasks:**

- Fix mobile rough edges
- Improve transitions
- Add keyboard shortcuts later (optional)
- QA pass
- Invite first 10–20 users

**Deliverables:**

- totalaud.io public beta
- Scout + Timeline momentum loop live

---

## 13. Pricing Strategy

### Philosophy

No free tier — we want committed artists, not tyre-kickers. The Starter tier is accessible (less than a Spotify subscription) while filtering out time-wasters. We're here to help indie artists on a budget, not extract maximum revenue.

### Tiers

**Starter — £5/month ($6 USD, €6 EUR)**

- Ideas Mode (full access)
- Scout Mode (10 opportunities/day view limit)
- Timeline Mode (1 active project)
- Pitch Mode (3 AI coach requests/month)
- No export

**Pro — £19/month ($24 USD, €22 EUR)**

- Everything unlimited
- Unlimited Scout access
- Unlimited projects
- Unlimited AI coaching
- Export everywhere (markdown, PDF)
- Priority new features

**Pro Annual — £149/year ($189 USD, €179 EUR)**

- ~35% discount (effective £12.40/month)
- All Pro features
- Locks in pricing

### International Pricing

Display local currency prices for trust:

| Region | Starter | Pro Monthly | Pro Annual |
|--------|---------|-------------|------------|
| UK | £5 | £19 | £149 |
| US | $6 | $24 | $189 |
| EU | €6 | €22 | €179 |

### Landing Page CTA

"Start for £5/month →" (or localised equivalent)

### Value Positioning

- Starter: "Less than a coffee a week"
- Pro: "Less than one Groover campaign — and you get it every month"
- Annual: "Best value — save 35%"

---

*Last Updated: January 2026*  
*Aligned with: [`docs/VISION.md`](docs/VISION.md) | [`docs/PRODUCT_PILLARS.md`](docs/PRODUCT_PILLARS.md)*
