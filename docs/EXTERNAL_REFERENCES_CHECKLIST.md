# External References Checklist — Label-Era Copy to Update

**Purpose**: the July 2026 artist-first recommitment removes "for indie labels" positioning
from this repo, but references live outside it too. This is the manual checklist for those.
Tick items off as they're updated; suggested replacement copy at the bottom.

**Owner**: Chris
**Created**: July 2026

---

## 1. Total Audio Promo properties

- [ ] **totalaudiopromo.com — any page linking to totalaud.io** as "for indie labels" /
      "label workspace". Update descriptions to artist-first copy.
- [ ] **Blog: "TAP for AI Agents" post** (`totalaudiopromo.com/blog/tap-for-ai-agents`) —
      referenced by `docs/TAP_API_REFERENCE.md`, which notes the blog is already out of date
      versus the reference. While correcting it, update any totalaud.io description.
- [ ] **TAP email footers / signatures** mentioning totalaud.io (info@, chris@,
      hello@totalaudiopromo.com templates).
- [ ] **TAP newsletter** (`lib/newsletter.ts` cross-links between the properties) — next
      issue should mention the artist-first direction rather than labels.

## 2. Social profiles

- [ ] **Twitter/X @totalaudiopromo** (linked from `lib/seo/json-ld.ts`) — bio + pinned post
      if either mentions the label workspace.
- [ ] Any totalaud.io-specific social handles (Instagram, LinkedIn company page, Threads,
      Bluesky) — bios and pinned content.
- [ ] LinkedIn personal headline/posts announcing the label pivot, if any.

## 3. Listings & directories

- [ ] Product Hunt (if listed) — tagline and description.
- [ ] Startup directories / BetaList / indie-hackers style listings.
- [ ] Google Business profile, if one exists.
- [ ] Any podcast show-notes, guest posts or interviews from May–July 2026 that describe
      totalaud.io as a label tool — where edit access exists, update; otherwise note as
      historical.

## 4. Audiences & comms

- [ ] **Label waitlist sign-ups (May–July 2026)** — decide and send one honest note:
      the label product is parked, here's what totalaud.io is now, here's what happens to
      their data (deletion on request). Do not go quiet on them.
- [ ] Any paid ads or boosted posts still running with label copy — pause or replace.
- [ ] SEO note: label-keyword pages in this repo are being re-pointed; expect some ranking
      loss on "label" terms. Intentional.

## 5. Third-party integrations metadata

- [ ] Stripe product/price display names, if they say "Studio/Indie/Pro (label)" — align
      with artist tier names.
- [ ] Vercel/Supabase project descriptions (cosmetic, low priority).

---

## Suggested replacement copy (short form)

> **totalaud.io** — a calm second opinion for independent artists. Finish your music,
> plan the release, reach the right people, and keep the story straight — with your
> audio never leaving your device.

Long form: use the positioning in [`STRATEGY_2026.md`](STRATEGY_2026.md) §1 and §4.
Voice rules: [`VISION.md`](VISION.md) — no "AI-powered", no "revolutionary", British English.

**Last updated**: July 2026
