# Passive Track Memory v0 — Track Anchor

**Date:** 2026-01-08  
**Branch:** concept/track-memory-vault  
**Status:** Phase 0 complete (anchor identified)

---

## Question

**What is the closest current concept of a "track" in the system?**

A "track" in the Track Memory sense is a single musical work — not a file, but a work with continuity over time.

---

## Audit of Existing Entities

### 1. `artist_assets` table

**Fields:**
- `id` (uuid) — Stable identifier
- `user_id` — Owner
- `kind` — Type of asset (includes 'audio')
- `title` — User-provided name
- `description` — Optional description
- `tags` — User-defined tags
- `checksum` — For deduplication
- `campaign_id` — Orphaned field (never surfaced)
- `path`, `url` — Storage location
- `created_at`, `updated_at`, `deleted_at`

**Analysis:**
- This is the closest thing to a "track" record in the system
- For `kind = 'audio'`, this represents an uploaded audio file
- The `id` is a stable UUID
- **Problem:** This is storage-oriented, not memory-oriented
- **Problem:** No concept of versions (each upload = new asset)
- **Benefit:** Already exists, already has RLS

---

### 2. `user_ideas` table

**Fields:**
- `id`
- `user_id`
- `content`
- `tag`
- `position_x`
- `position_y`
- `is_starter`
- `created_at`
- `updated_at`

**Analysis:**
- Ideas are upstream of tracks (intent before audio exists)
- No `track_id` field — ideas are free-floating
- **Problem:** No way to link an idea to a finished track

---

### 3. `user_pitch_drafts` table

**Fields:**
- `id`
- `user_id`
- `name`
- `pitch_type`
- `sections`
- `created_at`
- `updated_at`

**Analysis:**
- Pitches should be linked to tracks (what track is this pitch for?)
- No `track_id` field — pitches are free-floating
- **Problem:** No way to link a pitch to a specific work

---

### 4. `user_timeline_events` table

**Fields:**
- `id`, `user_id`, `lane`, `title`, `event_date`, `description`, `tags`
- `opportunity_id` — Links to Scout (exists)
- `tracker_campaign_id` — Links to external tracker (exists)
- `thread_id` — Links to signal threads (exists)
- No `track_id` field

**Analysis:**
- Timeline events should belong to a release (track)
- Currently events are free-floating per user
- **Problem:** No way to scope timeline to a specific work

---

### 5. `artist_identities` table

**Fields:**
- `id`, `user_id`, brand voice, creative profile, EPK fragments, bios
- `last_generated_at`, `created_at`, `updated_at`

**Analysis:**
- This is artist-level, not track-level
- Track Memory is track-level
- **Not a candidate for track anchor**

---

## Decision: v0 Track Anchor

### Primary Anchor: `artist_assets.id` (where `kind = 'audio'`)

**Rationale:**

1. **Already exists** — No new table needed for the anchor itself
2. **Stable UUID** — Each audio asset has a unique, persistent ID
3. **User-owned** — RLS already enforces ownership
4. **Natural point of creation** — When audio is uploaded, that's when a "track" begins to exist

**Limitations (acceptable for v0):**

- v0 treats each audio asset as a separate track (no version grouping)
- v0 does not create a "track" before audio is uploaded
- v0 does not link ideas to tracks yet (requires opt-in field later)

---

### Why Not Create a New `tracks` Table?

We could create a dedicated `tracks` table that:
- Has a canonical ID
- Groups versions
- Links to ideas, pitches, timeline events

**But for v0:**
- That's over-engineering
- The audio asset ID is sufficient
- We want to prove the concept before adding schema complexity

**For v1:**
- A dedicated `tracks` table may make sense
- It could reference multiple `artist_assets` (versions)
- It could have an `origin_idea_id` pointing back to Ideas

---

## v0 Anchor Specification

| Field | Value |
|-------|-------|
| Anchor Name | `track_id` |
| Anchor Source | `artist_assets.id` where `kind = 'audio'` |
| Stability | UUID, immutable after creation |
| Ownership | `artist_assets.user_id` |
| Deletion | When `artist_assets` is deleted, track memory is deleted |

---

## Future Linking (Not v0, Just Documenting)

To link Ideas → Tracks:
- Add optional `track_id` column to `user_ideas`
- Populated when an artist "anchors" an idea to a track

To link Pitches → Tracks:
- Add optional `track_id` column to `user_pitch_drafts`
- Populated when an artist writes a pitch "for" a specific track

To link Timeline → Tracks:
- Add optional `track_id` column to `user_timeline_events`
- Populated when an event is placed "for" a specific release

**All optional in v0. Memory can exist without these links.**

---

## Summary

**v0 Track Anchor = `artist_assets.id` (audio kind only)**

This is:
- Simple
- Already exists
- Sufficiently stable
- Compatible with future expansion

Track Memory entries will be keyed by `(user_id, track_id)` where `track_id` comes from `artist_assets.id`.

---

*End of Anchor Document*
