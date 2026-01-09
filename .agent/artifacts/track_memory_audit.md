# Track Memory Audit — totalaud.io

**Audit Date:** 2026-01-08  
**Branch:** concept/track-memory-vault  
**Purpose:** Identify all existing "track" surfaces and document where context is lost.

---

## Overview

This audit examines how tracks (the actual musical works artists create) are currently handled across totalaud.io. The goal is to understand where and how context about a work is lost, repeated, or fragmented.

---

## 1. Current Track-Related Surfaces

### 1.1 Finish Flow (Audio Upload)

**Location:** `/finish` route  
**Components:** `FinishFlow.tsx`, `FinishStartStep.tsx`, `FinishUploadStep.tsx`, `FinishListeningStep.tsx`, `FinishPerspectivesStep.tsx`, `FinishNextStep.tsx`

**What happens:**
1. Artist uploads an audio file
2. System "listens" (runs signal extraction)
3. Surfaces perspectives (AI-generated observations)
4. Confirms readiness

**What's stored:**
- Asset record in `assets` table (file, metadata, checksum)
- Perspectives are shown, then... **lost**
- No persistent connection to the work's ongoing story

**Context Loss:**
- ❌ Perspectives are transient — surfaced once, not stored
- ❌ No connection to Ideas (intent from pre-upload)
- ❌ No connection to downstream modes (Pitch, Timeline)
- ❌ Each upload is a fresh start — no memory of versions

---

### 1.2 Asset System (useAssets, useAssetUpload)

**Hooks:** `useAssets.ts`, `useAssetUpload.ts`  
**API:** `/api/assets/*`

**What happens:**
- File upload with progress tracking
- Assets stored in Supabase Storage
- Metadata in `assets` table:
  - `kind` (audio, image, document, etc.)
  - `title`, `description`, `tags`
  - `campaign_id` (optional — but what is a campaign?)
  - `checksum` (deduplication)

**What's stored:**
- File binary
- Basic metadata

**Context Loss:**
- ❌ Assets are "files", not "works"
- ❌ No concept of versions or variants
- ❌ No connection to intent (why was this created?)
- ❌ `campaign_id` implies a one-time campaign, not a persistent work

---

### 1.3 Ideas Canvas (Intent Capture)

**Store:** `useIdeasStore.ts`  
**What happens:**
- Artists define intent, emotional core, direction
- Cards with content, tags, positions
- Syncs to Supabase for authenticated users

**What's stored:**
- Idea cards with content, tags, timestamps
- Position on canvas

**Context Loss:**
- ✅ Ideas persist
- ❌ No connection to specific tracks/works
- ❌ Intent floats freely — not anchored to a piece of music
- ❌ When a track is finished, its originating idea is not linked

---

### 1.4 Pitch Drafts

**Store:** `usePitchStore.ts`  
**What happens:**
- Artists write pitches (radio, press, playlist, custom)
- Sections: Hook, Story, Ask
- AI coaching available

**What's stored:**
- Pitch drafts with sections, type, timestamps
- Linked to user

**Context Loss:**
- ✅ Pitches persist as drafts
- ❌ No connection to specific tracks/works
- ❌ Each pitch is standalone — not anchored to a release
- ❌ No memory of what was said about a track across pitches

---

### 1.5 Timeline Events

**Store:** `useTimelineStore.ts`  
**What happens:**
- Events placed in lanes (pre-release, release, post-release)
- Can be created manually or from Scout opportunities
- Can be synced to Tracker (campaign logging)

**What's stored:**
- Events with lane, title, date, description, tags
- `opportunity_id` links to Scout
- `tracker_campaign_id` links to external system

**Context Loss:**
- ✅ Timeline events persist
- ❌ No connection to specific tracks/works
- ❌ A "release" is implied but never defined
- ❌ No concept of which track these events are about

---

### 1.6 Identity Kernel

**Store:** `useIdentityStore.ts`  
**What happens:**
- AI generates artist identity from pitch history
- Brand voice, creative profile, EPK fragments, bios

**What's stored:**
- Brand tone, themes, style, key phrases
- Generated bios (short, long)

**Context Loss:**
- ✅ Identity persists
- ❌ Identity is for the artist, not for specific works
- ❌ No per-track voice or narrative memory

---

## 2. Where Context Is Currently Lost

### 2.1 Upload Amnesia

**Problem:** Every upload starts fresh.

When an artist uploads a track in Finish Mode:
- No memory of previous versions
- No memory of why this track was created (Ideas aren't linked)
- No memory of what was said about it (Pitches aren't linked)
- Perspectives are shown once, then gone

**Example:**
> Artist uploads v3 of their single. They explained v1 six months ago. They pitched v2 three months ago. Now they have to explain v3 from scratch.

---

### 2.2 Cross-Mode Fragmentation

**Problem:** Each mode operates in isolation.

| Mode | Knows About |
|------|-------------|
| Ideas | Intent cards (free-floating) |
| Finish | Audio file (just uploaded) |
| Pitch | Draft sections (per draft, not per track) |
| Scout | Opportunities (not linked to tracks) |
| Timeline | Events (not linked to tracks) |
| Identity | Artist-level persona (not per-track) |

There is no entity that unifies:
- "This is the track called X"
- "This was the original intent"
- "These were the perspectives when we finished it"
- "These are the pitches we wrote for it"
- "These are the timeline events for its release"

---

### 2.3 Version Blindness

**Problem:** No concept of versions.

Artists frequently:
- Create multiple versions of a track
- Have instrumental vs vocal versions
- Have radio edits, extended mixes
- Revisit old work for remasters

Currently:
- Each upload is a separate asset
- No connection between versions
- No way to compare what was said about v1 vs v3

---

### 2.4 Return Friction

**Problem:** Coming back after months is disorienting.

Artist returns to a project after 6 months:
- "What was I doing with this track?"
- "What did I say about it?"
- "Who did I pitch it to?"
- "What was the story?"

Currently:
- Must search through separate Ideas, Pitches, Timeline
- No central place that says "here is this work and everything you've said about it"

---

## 3. What Resets Unnecessarily

| Surface | What Resets | Should It? |
|---------|------------|------------|
| Finish Flow | After completion, perspectives are gone | ❌ Should persist as "first impressions" |
| Pitch sections | Each new pitch starts blank | ⚠️ Could carry context from previous pitches |
| Ideas | Nothing resets (good!) | ✅ |
| Timeline | Nothing resets (good!) | ✅ |
| Identity | Regeneration replaces previous | ⚠️ History might be valuable |

---

## 4. Anti-Patterns Found

### 4.1 File-First Thinking

The `assets` table treats everything as files:
- `kind: 'audio' | 'image' | 'document' | ...`
- `byte_size`, `mime_type`, `checksum`

This is a **storage** model, not a **memory** model.

A track is not a file. A track is:
- An idea that became a recording
- Multiple versions over time
- A collection of things said about it
- A network of decisions and contexts

---

### 4.2 Campaign Confusion

The `campaign_id` field on assets suggests:
- A "campaign" is a unit of work
- Tracks belong to campaigns

But in the current product:
- "Campaign" is never surfaced to users
- Timeline has no concept of campaigns
- It's an orphaned field

---

### 4.3 One-Shot Perspectives

The Finish flow surfaces perspectives once:
- "The tempo feels contemplative..."
- "The production has a lo-fi aesthetic..."

These are valuable observations. But they're shown once and discarded.

No memory. No history.

---

## 5. Surfaces Not Yet Built

The following surfaces would be expected in a "track-aware" system but don't exist:

| Missing Surface | Purpose |
|----------------|---------|
| Track library | Browse all works, see status |
| Version history | See how a track evolved |
| Track profile | All context about a single work |
| Release picker | Select which track a pitch/timeline is for |
| Context carryover | Finish → Pitch pre-filled with perspectives |
| Intent linking | Ideas that became this track |

---

## Summary

### What Works
- Ideas persist ✅
- Pitch drafts persist ✅
- Timeline events persist ✅
- Identity persists ✅
- Assets are stored ✅

### What's Missing
- **Track as a persistent entity** with memory
- **Cross-mode linking** (Ideas → Finish → Pitch → Timeline)
- **Version awareness** (v1, v2, v3 of same work)
- **Perspective memory** (what was observed about the track)
- **Decision history** (choices made over time)

### The Core Problem
> **Tracks are treated as one-off uploads, not as works with ongoing stories.**

Every upload is a fresh start. Every pitch is disconnected. Every timeline event floats in a void. The artist must re-explain, re-remember, and re-contextualize everything, every time.

---

*End of Audit*
