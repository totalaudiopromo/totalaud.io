# totalaud.io — Strategy 2026: Artist-First, Agent-Native

**Status**: Canonical strategy. Subordinate to [`VISION.md`](VISION.md).
**Supersedes**: the May–July 2026 small-label pivot (homepage waitlist, label pricing, Label OS launch framing).
**Effective**: July 2026

---

## 1. The Decision

totalaud.io recommits to **independent artists**.

The label pivot built useful multi-tenant infrastructure (now parked, see §8), but it pointed
the product at a crowded, unwon market while our actual differentiators — finishing
perspectives, relationship memory, calm decision support — are artist-shaped and have **no
credible incumbent**.

The north star:

> Help independent artists finish their releases and get heard in a noisy industry.
> One less thing to think about. Always on the artist's side.

The bar for every feature: **you could send totalaud.io to any artist, at any stage of their
independent career, and they would get real value from it.**

---

## 2. Market Landscape (July 2026)

Research conducted July 2026 across pricing pages, reviews, Trustpilot, Reddit and trade
press. Full detail lives in the session research; headlines below.

### The pay-per-pitch treadmill is losing trust

- Indie artists spent an estimated **$400M on playlist promotion in 2025 with fewer than 18%
  reporting measurable ROI**; the median indie playlist placement lasted **11 days**
  (Chartlex, citing Water & Music — directionally credible, treat the precision with caution).
- SubmitHub ($1–3/credit), Groover (~€2/contact), Musosoup (subscription), PlaylistPush
  ($285–1,500/campaign) are all **transactional**: pay, pitch, forget. Documented complaints
  recur — generic feedback, inactive playlists, short-lived placements, cost that compounds
  per release.
- Spend is shifting toward **owned relationships and direct-to-fan** — which favours memory
  and context over volume.

### Price anchors for artist tooling

| Tool | Price | What it is |
|---|---|---|
| DISCO | from $10/mo | Catalogue/sync sharing |
| Songstats | ~$13/mo | Streaming alerts |
| Viberate | $19.90/mo | Analytics |
| PlaylistSupply | $19.99/mo | Curator contact scraping |
| Haulix | from $22/mo | Promo delivery |
| Soundcharts | $10–49/mo | Analytics + team features |

Our planned **£5 Starter / £19 Pro** tiers (see [`ICP_PERSONAS.md`](ICP_PERSONAS.md)) sit
comfortably in this band. Contact enrichment remains pay-per-use via credits; core value is
never metered per action.

### The label market (context for the parked pivot)

Crowded new entrants — ReleaseLoop ($299 lifetime label tier), Labelcaster (10% commission),
LabelBase, VIRPP, Beatport/LabelRadar (free) — with **no category winner**. Sweet spot
£40–130/mo flat. The market exists, but winning it means competing on ops features rather
than on our differentiators. Parked, not abandoned (§8).

### Consolidation anxiety is real

UMG completed its **$775M acquisition of Downtown** (Feb 2026): CD Baby, FUGA and Songtrust
are now major-owned; Curve was divested as an EU remedy precisely because regulators worried
about **who sees independent labels' commercial data**. "Independent-owned, neutral,
non-extractive" is now a genuine differentiator, not marketing fluff.

---

## 3. The White-Space Thesis

Three gaps, all of which we already point at:

### #1 — Relationship memory (the moat)

There is **no purpose-built music-relationship tool**. The "music CRM" category is contact
scrapers (PlaylistSupply, artist.tools) selling volume, not context. Every artist and
promoter runs on spreadsheets and memory. Our Leverage/Intel pillar — *memory, not scraping;
context, not volume; people, not lists* — has the lane to itself.

### #2 — Finishing perspectives (the flagship)

**Nobody does decision-support for finishing music.** AI in music marketing tools is shallow
(auto-tagging, press-release generation) or generative (making music — which most independent
artists distrust or resent). A calm second opinion — producer, mix, listener and industry
perspectives on a track you made — has no incumbent.

### #3 — Agent-native architecture (the structural advantage)

Legacy tools are **bolting AI onto old interfaces**. totalaud.io and TAP are agent-native
from the ground up: typed resources, idempotent operations, scoped access, an action queue.
This means manual steps genuinely disappear (with consent), and artists will eventually be
able to bring their own assistant to their workspace — rather than getting a chatbot bolted
onto a dashboard.

These compound as **the release loop**: finish with confidence → plan the release → reach
the right people → remember what happened → start the next release smarter.

---

## 4. Trust Is the Brand

Independent artists are rightly sceptical — of AI making music, of pay-to-play promo, of
platforms harvesting their data. Every product decision must survive the question: *"is this
on the artist's side?"*

Commitments (product-enforced, not just copy):

1. **Your audio never leaves your device.** Track analysis runs in the browser; only the
   numbers travel. (See §6, Finish.)
2. **We never make or touch the music.** No generation, no auto-mastering by default, no
   quality scores. Perspectives, not judgement.
3. **Nothing sends without you.** No auto-emails, no auto-pitches. The artist always presses
   send.
4. **No training on artist data.** Ever. Stated plainly in the privacy policy.
5. **Export everything.** Your ideas, plans, contacts and notes are yours to take.
6. **Real value before sign-up.** Guest mode delivers something useful in the first session.
7. **Independent-owned.** No major-label parent, no data pipeline to one.

Language rules remain as [`VISION.md`](VISION.md): perspectives not agents, finishing notes
not scores, second opinion not judgement. British English throughout.

---

## 5. What We Will NOT Build

| Not building | Why |
|---|---|
| Royalty accounting | Curve Lite (£20/mo) and Royalti.io own the low end; wrong shape for us |
| Distribution | Commodity with entrenched players; integrate, don't compete |
| Mass outreach automation | Antithetical to trust; nothing auto-sends |
| Contact scraping as a product | The category we're differentiating *against* |
| Pay-per-pitch marketplace | The treadmill artists are trying to escape |
| Quality scores | Hard rule in VISION.md |
| Generative music AI | Artists don't want it from us; trust-fatal |
| Streaming stats via the Spotify Web API | Locked down for commercial third parties: Nov 2024 endpoint removals, May 2025 extended-access criteria (registered business + 250k MAU), Feb 2026 deprecation of artist followers/popularity/top-tracks and non-commercial-only Dev Mode. Route: aggregator APIs (Songstats/Soundcharts) or Spotify for Artists CSV import instead |

---

## 6. The Pillars, Multiplied

Each pillar's "5×" is depth on the existing promise, not feature sprawl.

### Finish — the flagship
Current truth: the external DSP engine (Railway) is **dead** (verified July 2026 — 404), so
Finish is broken in production. Direction:
- **Client-side analysis** (Web Audio API): LUFS, true peak, dynamics, stereo, spectral —
  computed in the browser. *Your audio never leaves your device.*
- **Perspectives layer** (Claude, invisible): the metrics plus the artist's own context
  ("what are you unsure about?") become finishing notes from producer, mix-translation,
  listener and industry perspectives. No scores. No first person. No judgement.
- Server-side mastering/processing is parked until an engine decision is made; it may return
  as a premium add-on.

### Release (Timeline)
Multi-week narrative planning stays the core. Additions: post-release follow-up phases
(thank curators, log outcomes), calendar subscription (ICS feed into Google/Apple Calendar),
smart links (Odesli) per release, and hand-offs from Finish ("plan this release").

### Leverage (Intel) — the moat
Powered by **TAP as the engine room** (live API integration, see §7): contact enrichment,
outcome tracking (pitched → replied → added → declined), and the action queue ("worth a
follow-up", "this contact has gone quiet"). Claude reasons over the history in plain English
— *who actually matters across your releases* — never ranking people, never scoring.

### Pitch
Already the strongest pillar (coach, identity, bios). Additions: consistency checker (every
pitch, bio and caption tells the same story), outcome logging on send, and eventually
send-from-your-own-inbox (Gmail OAuth — the artist's address, never ours).

### Analytics — "What worked"
A calm read on the release loop, not a Chartmetric clone: reply and placement rates per
release, placement lifespan, which relationships produced results, momentum across releases.
Plain English first, charts second. Streaming stats arrive later via aggregator or CSV
import (see §5).

---

## 7. TAP as the Engine Room

Total Audio Promo's platform ([`TAP_API_REFERENCE.md`](TAP_API_REFERENCE.md)) is agent-native
and already runs the machinery Intel needs:

- **Contact enrichment** (up to 14 data points per contact)
- **Outcome tracking** (closed enum: pending/replied/added/declined/no_response)
- **Action queue** (follow_up, stale_contact, pending_pitch)
- Conventions worth adopting house-wide: prefixed resource IDs, `object` discriminators,
  cursor pagination, idempotency keys, dry-run mode, scoped keys.

**Integration principle**: totalaud.io calls TAP server-side (`TAP_API_KEY`, never exposed
client-side). TAP supplies the engine; totalaud.io supplies calm interpretation. The same
pattern as the finisher engine, but with an API we own. totalaud.io must degrade gracefully
when TAP is unreachable — never block the workspace on an engine.

---

## 8. Label OS: Parked, Not Deleted

The label pivot built a real multi-tenant system (`app/label/*`, migration
`20260710000000_label_os.sql`, role-based RLS). It is parked behind
`NEXT_PUBLIC_ENABLE_LABEL_OS` (default off): routes redirect, APIs 404, code keeps compiling,
tables stay in place. Pre-park state: commit `68c2cf4`.

**Revival criteria** (any two of):
1. Organic inbound label interest reaching a meaningful monthly rate
2. Clear artist-product PMF signal (retention + paid conversion targets hit)
3. A design-partner label willing to pay £40–130/mo
4. The missing invite flow designed (it was never built — no multi-user label ever existed
   in production, so parking strands nobody)

Revival cost: flip the flag, build the invite flow, regenerate types. Days, not months.

---

## 9. Experience Principles

Borrowed deliberately from the best of SaaS, in service of calm:

- **Command palette (⌘K)** and keyboard-first flows (Linear) — revive the archived spec
- **Optimistic UI with undo everywhere** (never confirm-dialog spam)
- **Calm empty states with starter content** — the product teaches by example
- **Progressive disclosure** — simple for a first release, deep for a full-timer
- **Skeletons, not spinners; plain English, not jargon** (Stripe's docs tone, British)
- **Mobile-first always** — ideas get captured on the bus

And the agent-native rule for all new work: **every capability is a typed, documented server
route first, UI second** — Zod-validated, idempotent where mutating, resource-shaped. Claude
calls go through `@total-audio/core-ai-provider`. Artist-safety guardrails live in code:
banned-vocabulary tests on every perspective prompt, and nothing sends externally without an
explicit artist action.

---

## 10. Open Questions (owner: Chris)

1. Un-pause public sign-ups now, or keep the waitlist (with artist copy) until Finish
   perspectives ship?
2. What to tell the label waitlist audience collected since May?
3. Songstats vs Soundcharts (vs neither, for now) for streaming data — needs API pricing
   check at the Analytics phase.
4. Label OS flag: fully off, or founder-only allowlist for demos?
5. Mastering engine: redeploy eventually as a premium add-on, or retire the processing flow?

---

**Companion docs**: [`ROADMAP_2026.md`](ROADMAP_2026.md) (phases and sequencing),
[`ICP_PERSONAS.md`](ICP_PERSONAS.md) (who we build for),
[`EXTERNAL_REFERENCES_CHECKLIST.md`](EXTERNAL_REFERENCES_CHECKLIST.md) (label-era copy to
update outside this repo).

**Last updated**: July 2026
