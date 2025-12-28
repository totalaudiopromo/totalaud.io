# Product Requirements Document (PRD) — totalaud.io

**Version**: 2025.02 — "Calm Creative Workspace" Pivot
**Audience**: Claude, engineers, designers, and future contributors

---

## 1. Product Summary

totalaud.io is a calm, minimal creative-intelligence workspace for independent artists.
Its purpose is to remove overwhelm and give artists clarity, direction, and a simple plan for releasing and promoting music.

The workspace is structured into four core modes that match the four mental states artists experience:

1. **Ideas Mode** — capture & organise creative/marketing ideas
2. **Scout Mode** — discover real opportunities (playlists, blogs, curators, radio, press)
3. **Timeline Mode** — plan release and creative actions visually
4. **Pitch Mode** — craft narratives, descriptions, and bios

(+ Optional: light analytics later)

**The value:**
Instead of using 6–10 scattered tools, artists have one clear place to sort ideas, find opportunities, craft their narrative, and build a plan.

---

## 2. Product Vision

totalaud.io is:

- Calm, not chaotic
- Minimal, not overwhelming
- Guided, not empty
- Artist-first, not "marketing-first"
- Beautifully crafted, not cluttered
- Mobile-ready, not desktop-only

It allows artists to finally feel like:

> "I know what I'm doing next, I understand my story, and I'm not lost anymore."

It is NOT:

- A CRM
- A PR automation tool
- A multi-agent OS
- A content grinder
- A complex productivity suite

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

### 4.1. Ideas Mode (Local-first creative notebook)

**Purpose:**
A calm place to capture, organise, and refine creative ideas.

**Key Requirements:**

- Canvas mode (draggable idea cards)
- List mode
- Search
- Sort (A–Z, newest, oldest)
- Export (markdown, plain text)
- Clear all (with confirmation)
- Local-first persistence (localStorage, optional Supabase sync later)
- Tags / colours

**Success metric:**
Users feel organised and return daily.

---

### 4.2. Scout Mode (Opportunity discovery)

**Purpose:**
Help artists find real, relevant opportunities matched to their genre, vibe, and goals.

**Key Requirements:**

- Curated dataset of playlists, blogs, curators, radio (start small)
- Filters:
  - genre
  - vibe/mood
  - opportunity type
  - audience size
- Real items (links, contact info if available)
- "Add to Timeline" action
- Simple card layout
- Minimal, non-dashboard UI
- Data stored in Supabase
- Lightweight edge function for filtering

**Success metric:**
Artists find at least 1 meaningful opportunity in the first session.

---

### 4.3. Timeline Mode (Simple visual release plan)

**Purpose:**
Help artists build a calm plan for their release and marketing actions.

**Key Requirements:**

- Canvas with draggable timeline blocks
- Add items from Scout or manually
- Simple toolbar (search, sort, export)
- "Next Steps" mini-view
- Very little complexity; no Gantt charts
- Local-first state
- Optional Supabase sync

**Success metric:**
Artists create a plan in under 3 minutes and understand what to do next.

---

### 4.4. Pitch Mode (Narrative-building assistant)

**Purpose:**
Help artists express their identity and story clearly.

**Key Requirements:**

- Input text area
- AI coaching sidebar
- "Improve my bio", "Help me describe my sound", "Write for this outlet"
- Stable, shallow prompts with Claude
- Export to clipboard
- Minimal design (no chatbots, no character agents)

**Success metric:**
Artists produce a pitch/bio they actually use.

---

### 4.5. (Optional later) Light Analytics

**Purpose:**
Give artists confidence, not complexity.

**Requirements:**

- Spotify basic stats
- Social follower growth (manual input acceptable)
- No dashboards
- Just "at a glance" confidence signal

(Not required for MVP.)

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

- **Uncluttered**: everything unnecessary is removed
- **Soft motion**: only subtle transitions
- **Direct**: no assistant bubbles or chat UI
- **Portable**: export always available
- **Progressive**: empty states guide, not overwhelm
- **Calm visual language**: slate neutrals, thin borders, minimal accent

---

## 9. Success Metrics

**MVP Success Indicators:**

- Users save ≥ 5 ideas
- Users add ≥ 2 opportunities to Timeline
- Users complete ≥ 1 pitch using Pitch Mode
- Users return at least 3 times per week
- Users describe the app as "calming / clear / helpful"

**Business success:**

- 5–20 paying artists in first 2 months
- Artists using Scout weekly

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

*Last Updated: December 2025*
