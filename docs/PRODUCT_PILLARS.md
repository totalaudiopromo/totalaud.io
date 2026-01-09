# Product Pillars — totalaud.io

**Canonical Source**: This document translates [`docs/VISION.md`](VISION.md) into product structure.  
**Last Updated**: January 2026

---

## Overview

totalaud.io is built around four pillars that express how we help artists think, finish, and release with confidence.

These pillars are not features. They are perspectives on a single problem: **the gap between finishing music and feeling ready to release it**.

Each pillar reduces a specific type of uncertainty:

| Pillar | Uncertainty Reduced |
|--------|---------------------|
| **Finish** | "Is this actually ready?" |
| **Release** | "What should I do, and when?" |
| **Leverage** | "Who should I reach out to, and why?" |
| **Pitch** | "How do I talk about this consistently?" |

The product succeeds when artists feel less alone in their decisions — not when they've automated their way past them.

---

## 1. Finish

### Intent

Help artists finish songs and releases with confidence.

Finish exists because the hardest moment in a release cycle is knowing when something is done. Artists often lack a trusted second opinion — someone who isn't a friend, isn't a fan, and isn't trying to sell them something.

Finish provides that perspective.

### What It Does

- Accepts a track upload (or reference)
- Returns human-framed finishing notes from multiple perspectives:
  - **Producer perspective** — arrangement, energy, structure
  - **Mix / translation perspective** — clarity, balance, mono compatibility, dynamics
  - **Listener first-impression** — emotional arc, hooks, attention
  - **Industry / release context** — commercial readiness, playlist fit, timing considerations
- Highlights release readiness indicators (not scores)
- Surfaces what matters most for *this* track, not generic advice

### What It Explicitly Does NOT Do

- ❌ Provide quality scores or ratings
- ❌ Make absolute judgements ("this is good/bad")
- ❌ Auto-fix, auto-master, or auto-produce
- ❌ Replace professional mixing or mastering
- ❌ Claim to know "what will succeed"

### User-Facing Language Rules

| ✅ Use | ❌ Avoid |
|--------|----------|
| "finishing notes" | "AI analysis" |
| "perspectives" | "agents" |
| "release readiness" | "quality score" |
| "what to consider" | "what's wrong" |
| "a second opinion" | "AI-powered feedback" |

### Internal Notes (Claude Usage Boundaries)

- Claude provides the reasoning layer for generating perspective-based feedback
- Claude must never present itself as the product or the source of judgement
- DSP / audio analysis is a separate technical layer — Claude interprets and frames the output
- Claude should never use first-person ("I think...") in user-facing feedback
- Feedback should feel like it came from an experienced human, not a system

---

## 2. Release Planning (Timeline)

### Intent

Help artists model a release as a multi-week narrative, not a single drop.

Most artists treat release day as the finish line. In reality, the weeks before and after are where momentum is built or lost. Release Planning helps artists think in sequences, not events.

### What It Does

- Provides a visual timeline for release planning
- Encourages thinking in phases: pre-release, release, post-release
- Surfaces timing considerations (e.g., playlist lead times, press deadlines)
- Connects creative decisions to release outcomes
- Encourages fewer, better releases over volume

### What It Explicitly Does NOT Do

- ❌ Auto-schedule social posts
- ❌ Generate content calendars
- ❌ Integrate with distribution platforms
- ❌ Promise algorithmic success
- ❌ Replace human judgement about timing

### User-Facing Language Rules

| ✅ Use | ❌ Avoid |
|--------|----------|
| "release narrative" | "content calendar" |
| "sequencing" | "automation" |
| "momentum" | "growth hacking" |
| "think in phases" | "optimise your drop" |

### Internal Notes (Claude Usage Boundaries)

- Claude may assist with surfacing timing considerations based on context
- Claude should not promise outcomes ("if you do X, you'll get Y")
- Release Planning is about structure and clarity, not prediction
- Keep Claude's role invisible — the timeline should feel like the artist's plan, not Claude's plan

---

## 3. Leverage & Relationships (Intel / Scout)

### Intent

Help artists understand relationships as creative capital, not data entries.

The music industry runs on relationships. But most artists don't have a system for remembering who they've worked with, who responded, who matters. Intel exists to provide that memory.

### What It Does

- Stores and enriches contact data over time
- Surfaces relationship context: "You last pitched this person in October. They opened but didn't reply."
- Uses Claude's **Excel / spreadsheet reasoning skill** to:
  - Clean and enrich messy contact data
  - Spot patterns in engagement across releases
  - Summarise relationship signals in plain English
  - Help artists understand who actually matters
- Prioritises depth over volume — fewer contacts, better context
- Protects artists from burning bridges through carelessness

### What It Explicitly Does NOT Do

- ❌ Scrape contacts from the web
- ❌ Mass-email or automate outreach
- ❌ Promise "leads" or "opportunities"
- ❌ Replace genuine relationship-building
- ❌ Score or rank people

### User-Facing Language Rules

| ✅ Use | ❌ Avoid |
|--------|----------|
| "relationship memory" | "CRM" |
| "who matters" | "leads" |
| "context" | "data points" |
| "patterns over time" | "AI automation" |
| "intelligence and recall" | "AI-powered insights" |

### Internal Notes (Claude Usage Boundaries)

- Claude's Excel skill is explicitly used here for structured data reasoning
- Frame Claude's role as **memory and pattern recognition**, not automation
- Claude should never auto-send messages or take action on behalf of the artist
- Claude may summarise, suggest, and surface — but the artist always decides
- This pillar is about reducing cognitive load around relationships, not replacing relationships

---

## 4. Storytelling & Pitch

### Intent

Help artists maintain a single source of narrative truth.

Artists often write their bio once, then copy-paste fragments across platforms. Over time, the story fragments. Pitch exists to keep the narrative coherent — across playlist pitches, press emails, social bios, and website copy.

### What It Does

- Stores the artist's core narrative elements (story, sound, positioning)
- Generates pitch drafts tailored to context (playlist, press, social)
- Ensures consistency across all outputs
- Acts as an editor and tone guardian, not a ghostwriter
- Helps artists refine how they describe themselves over time

### What It Explicitly Does NOT Do

- ❌ Replace the artist's voice
- ❌ Generate generic AI slop
- ❌ Produce final copy without artist review
- ❌ Claim to know what "works" for algorithms
- ❌ Auto-submit pitches to platforms

### User-Facing Language Rules

| ✅ Use | ❌ Avoid |
|--------|----------|
| "narrative truth" | "AI copywriting" |
| "editor" | "generator" |
| "consistency" | "optimisation" |
| "your voice, refined" | "AI-powered content" |
| "tone guardian" | "auto-pitch" |

### Internal Notes (Claude Usage Boundaries)

- Claude acts as an editor and consistency checker
- Claude should reflect the artist's voice back to them, not impose a new one
- Claude may suggest improvements, but should not override the artist's intent
- All outputs require artist review and approval
- The goal is coherence, not volume

---

## Boundary Summary

| Pillar | Claude's Role | Claude is NOT |
|--------|---------------|---------------|
| **Finish** | Interprets analysis, frames as perspectives | The judge |
| **Release** | Surfaces considerations, structures narrative | The scheduler |
| **Leverage** | Memory, pattern reasoning, plain-English summaries | The outreach automator |
| **Pitch** | Editor, consistency checker, tone guardian | The ghostwriter |

---

## Preventing Scope Creep

As totalaud.io evolves, these questions should gate any new feature:

1. **Does this reduce cognitive load?** — If not, why add it?
2. **Does this help artists think, or think for them?** — We do the former.
3. **Does this require new "AI agent" framing?** — If so, stop and reconsider.
4. **Does this serve finishing, releasing, leverage, or storytelling?** — If not, it doesn't belong.
5. **Would a thoughtful artist trust this?** — If uncertain, the answer is no.

---

**This document defines product scope. All features must align with these pillars.**
