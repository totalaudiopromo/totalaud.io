# Track Memory Integration Map

**Date:** 2026-01-08  
**Branch:** concept/track-memory-vault  
**Status:** Conceptual wiring (no implementation)

---

## Purpose

This document maps how Track Memory integrates with existing modes.

Track Memory is not surfaced. It is not a feature. It is not visible as a concept.

It is the **reason things remember each other**.

When an artist writes a pitch and the system already knows what this track is about — that's Track Memory. When they return after six months and pick up where they left off — that's Track Memory.

The artist never says "add to memory." They just work. Memory happens.

---

## Per-Mode Memory Mapping

### Ideas Mode

**Role in Continuity Arc:** Intent

**Reads from Track Memory:**
- Nothing. Ideas is upstream of everything.
- (Future: could read unassigned memory fragments if returning to an old work)

**Writes to Track Memory:**
- **Intent anchor:** The statement of why this work exists
- **Emotional core:** What the artist is trying to say
- **Reference fragments:** Influences, comparisons, vibes
- **Direction notes:** Where this is headed

**Must never overwrite:**
- Nothing yet exists to overwrite — Ideas is the origin.

**Must not know about:**
- Pitch drafts (downstream)
- Timeline events (downstream)
- Perspectives (generated later)

**Attachment moment:**  
When an idea card is marked as "anchored" to a Track (implicit or explicit), its content becomes foundational memory.

---

### Finish Mode

**Role in Continuity Arc:** Confidence

**Reads from Track Memory:**
- **Intent anchor** (if connected): Surfaces as "This release began with..." context
- **Previous versions** (if any): Knows this is v2 or v3

**Writes to Track Memory:**
- **First impressions:** System-generated perspectives on the audio
- **Confidence gate:** Timestamp of when the work was marked "ready"
- **Audio reference:** Which version was uploaded, when
- **Version notes:** Artist's own observations at finish time

**Must never overwrite:**
- **Intent anchor:** Finish doesn't change why the work was made
- **Previous perspectives:** Earlier observations remain; new ones are added

**Must not know about:**
- Pitch drafts (not its concern)
- Timeline events (not its concern)
- Scout contacts (not its concern)

**Attachment moment:**  
When `FinishPerspectivesStep` completes, perspectives are written to Track Memory automatically. No prompt. No confirmation. They just persist.

---

### Story Mode (Pitch)

**Role in Continuity Arc:** Meaning

**Reads from Track Memory:**
- **Intent anchor:** Pre-fills "why this work exists"
- **First impressions:** Perspectives from Finish mode
- **Previous pitch fragments:** What was said before about this track
- **Version context:** Which version is being pitched

**Writes to Track Memory:**
- **Narrative fragments:** Key phrases the artist uses to describe the work
- **Story evolution:** How the description has changed over time
- **Pitch-specific notes:** Per-draft context that may be valuable later

**Must never overwrite:**
- **Intent anchor:** Pitch doesn't change origin
- **First impressions:** Perspectives are observations, not editable
- **Earlier narrative fragments:** Previous descriptions are history

**Must not know about:**
- Scout contacts (that's outreach, not meaning)
- Timeline events (that's scheduling, not meaning)
- Identity-level data (that's artist, not track)

**Attachment moment:**  
When a draft is saved, narrative fragments are extracted and added to Track Memory. Silent. Cumulative. Non-destructive.

---

### Scout Mode

**Role in Continuity Arc:** Audience context

**Reads from Track Memory:**
- **Genre/vibe signals:** From intent or perspectives (for filtering opportunities)
- **Story fragments:** To understand fit (if ever shown)

**Writes to Track Memory:**
- **Considered opportunities:** Which contacts were viewed for this track
- **Rejected opportunities:** What was passed (optional, configurable)
- (Does NOT write pitch outcomes — that's Tracker, externally)

**Must never overwrite:**
- **Intent anchor**
- **Story fragments**
- **Perspectives**

**Must not know about:**
- Pitch content (that's Story mode)
- Timeline details (that's Timeline mode)
- Finish observations (not relevant to Scout's job)

**Attachment moment:**  
When an opportunity is added to Timeline for a specific Track, that connection is noted. Silent association.

---

### Timeline Mode

**Role in Continuity Arc:** Unfolding over time

**Reads from Track Memory:**
- **Intent anchor:** Surfaced as context ("This release began with...")
- **Story fragments:** Surfaced as context ("The story we're telling...")
- **Version info:** Which version these events relate to

**Writes to Track Memory:**
- **Sequence decisions:** What events were placed and when
- **Pacing notes:** Artist's adjustments to the unfolding
- **Milestone markers:** Key moments (release day, first pitch, etc.)

**Must never overwrite:**
- **Intent anchor**
- **First impressions**
- **Story fragments**

**Must not know about:**
- Scout opportunity details (irrelevant to timeline)
- Pitch draft content (irrelevant to timeline)
- Identity data (artist-level, not track-level)

**Attachment moment:**  
When an event is placed or moved, the timeline state is recorded. No prompt. It's just what happened.

---

### Content Mode (Conceptual)

**Role in Continuity Arc:** Expressions of story

**Reads from Track Memory:**
- **Story fragments:** The narrative to be expressed
- **Intent anchor:** The core meaning to preserve
- **Perspectives:** Observations that might inspire expressions
- **Decided pacing:** From Timeline (what content is needed when)

**Writes to Track Memory:**
- **Content decisions:** What was created, what format, when
- **Expression notes:** Why this content approach was chosen
- **Asset connections:** Links between content pieces and the Track

**Must never overwrite:**
- **Intent anchor**
- **Story fragments** (expressions reference them, don't replace them)
- **Perspectives**

**Must not know about:**
- Scout contacts
- Timeline mechanics (only receives what content is needed, when)
- Pitch drafts (separate from content expressions)

**Attachment moment:**  
When content is created or planned, the decision is noted. Content Mode is downstream; it consumes memory and adds to it, but doesn't alter substance.

---

## Attachment Moments

Memory updates happen at natural moments, without prompts or confirmations.

| Moment | What is Written | Visible to Artist? |
|--------|----------------|-------------------|
| Idea card anchored to Track | Intent, emotional core | No — it's just saved |
| Finish flow completes | Perspectives, confidence gate | No — they're just shown |
| Pitch draft saved | Narrative fragments | No — it's just a draft |
| Timeline event placed | Sequence decision | No — it's just moved |
| Scout opportunity added | Considered contact | No — it's just added |
| Content piece created | Expression decision | No — it's just made |

**The pattern:** Every "just doing my work" action quietly deposits context. Nothing extra to do. Nothing to confirm.

---

## Memory Boundaries & Safety

### What Track Memory Stores Long-Term

| Category | Examples | Retention |
|----------|----------|-----------|
| **Intent** | Why the work exists, emotional core | Forever (origin) |
| **Versions** | Which audio was uploaded, when | Forever (history) |
| **Perspectives** | System-generated observations | Forever (cumulative) |
| **Narrative fragments** | Key phrases from pitches | Forever (cumulative) |
| **Sequence decisions** | Timeline events placed | Forever (history) |
| **Considered contacts** | What Scout opportunities were viewed | Configurable |

### What is Ephemeral

| Category | Examples | Why Not Stored |
|----------|----------|---------------|
| **Draft edits** | Typing in a pitch section | Noise; only saves on explicit save |
| **Filter states** | Scout genre filter, Timeline view scale | UI state, not memory |
| **Undo history** | Previous positions of cards | Session-only |
| **Loading states** | Pending uploads, processing | Transient |

### What is Never Stored

| Category | Why Not |
|----------|---------|
| **Keystrokes** | Surveillance energy; anti-trust |
| **Hesitation patterns** | Creepy; no value |
| **Rejected content** | Artist freedom; right to change mind |
| **Abandoned drafts** | Only saved = memory; unsaved = forgotten |
| **Comparison to others** | No competitive metrics; no judgement |
| **"Performance"** | No quality scores; no optimisation signals |

---

### Trust Principles

**1. Memory is cumulative, never retroactive.**

Past observations are not edited. New ones are added. The artist can see how their understanding evolved.

**2. Revision without judgement.**

If an artist changes the story of their track, both versions exist. The new one is current; the old one is history. No "you said something different before" energy.

**3. Nothing is inferred about intent.**

The system stores what the artist *said* about intent, not what it *thinks* they meant. Memory is a mirror, not an analyst.

**4. Deletion is possible.**

If an artist deletes a Track, its memory is gone. If they delete a pitch draft, its fragments are gone. No ghosts.

**5. Memory is private.**

Track Memory is never shared, exported with "intelligence," or used to train models. It belongs to the artist.

---

## Failure Modes

### What Breaks If Memory Is Too Visible

| Symptom | Cause | Effect |
|---------|-------|--------|
| Artist feels surveilled | Memory shown too prominently | Anxiety, self-censorship |
| Artist feels judged | Memory implies "you said X before" | Shame, avoidance |
| Artist feels locked in | Memory feels like commitment | Reluctance to explore |
| Artist feels paralysed | Too much context shown at once | Cognitive overload |

**Resolution:** Memory is referenced, not displayed. It flows into contexts subtly. "This release began with..." is not a memory feature — it's just context.

---

### What Breaks If Memory Is Overwritten

| Symptom | Cause | Effect |
|---------|-------|--------|
| Context vanishes | New save replaces old | Artist loses history |
| Story becomes inconsistent | Fragments erased | Pitches don't connect |
| Timeline orphaned | Intent deleted | Events lose meaning |
| Return friction increases | Memory reset | Artists must start over |

**Resolution:** Memory is append-only. Updates add; they don't replace. The exception: explicit deletion.

---

### What Breaks If Helpers/Agents Act Without Memory

| Symptom | Cause | Effect |
|---------|-------|--------|
| Suggestions feel generic | No context to work with | Artist ignores them |
| Suggestions contradict intent | Helper doesn't know origin | Artist loses trust |
| Suggestions repeat effort | Helper doesn't know what was done | Artist wastes time |
| Suggestions feel invasive | Helper guesses instead of recalls | Surveillance energy |

**Resolution:** Any future helper reads Track Memory first. No guessing. No inference. Just: "what does the artist already know about this work?"

---

## Summary

Track Memory integrates with existing modes by:

1. **Reading** — Modes receive context from memory (intent, perspectives, fragments) without asking
2. **Writing** — Modes deposit context to memory (narrative, decisions, observations) without prompting
3. **Accumulating** — Memory grows over time; nothing is lost
4. **Staying invisible** — Artists never interact with "memory"; they just benefit from continuity

**Why this reduces cognitive load:**

When an artist returns to a track after six months, they don't have to remember what they said, what they observed, or what they decided. The system already knows. It flows context into the right places — a subtle phrase in Pitch, a gentle anchor in Timeline, a quiet reference in Finish. The artist just works. The continuity is there.

No prompts. No confirmations. No "memory management."

> **The system remembers so the artist doesn't have to.**

---

*End of Integration Map*
