# totalaud.io Brand Guidelines

**Canonical Source**: Aligns with [`docs/VISION.md`](VISION.md)  
**Voice Reference**: See [`docs/BRAND_VOICE.md`](BRAND_VOICE.md) for tone and copy rules  
**Last Updated**: January 2026

This document defines the visual design system for totalaud.io — a calm, premium aesthetic that supports the product's purpose: helping independent artists finish their music, understand what matters, and release with confidence.

---

## Brand Personality

**Core Attributes:**

- Calm, trustworthy, intelligent
- Minimal but warm
- Creative, not corporate
- Helpful, not hypey
- Innovative but invisible (design supports, never shouts)

**What it should feel like:**

- The opposite of loud neon music startups
- The opposite of cluttered dashboards
- The opposite of gimmicky AI apps

**Think:** "The creative tool an indie artist actually wants to open every day."

---

## Colour Palette

### Primary Colours

| Name | Value | Usage |
|------|-------|-------|
| Off-black | `#0F1113` | Background |
| Slate Cyan | `#3AA9BE` | **THE ONLY accent colour** |
| Text Primary | `#F7F8F9` | Headings, primary text |
| Text Secondary | `rgba(255, 255, 255, 0.6)` | Body text |
| Text Muted | `rgba(255, 255, 255, 0.4)` | Subtle text, hints |
| Border | `rgba(255, 255, 255, 0.06)` | Subtle borders |

### Colour Philosophy

- 90% dark neutrals
- 8% white text
- 2% accent

**Use accent ONLY for:**

- Primary CTA button
- Active tab highlight
- Progress indicators
- Important labels

**Never use accent as background blocks or large surfaces.**

### Retired Colours

- ALL neon greens, pinks, purples
- ALL OS theme colours (XP blue, ASCII green, Analogue orange)
- ALL gradients from the OS surfaces

---

## Typography

**Primary Font:** Inter or Geist Sans

**Weights:**

- 700 for headings
- 500 for UI labels
- 400 for body text

**Spacing:**

- Minimum 12-16px spacing rhythm
- Line-height: 1.5-1.7
- Maximum width: 70ch for body text

**Tone:**

- No emojis in UI
- No hyperbole ("game-changing", "insane", etc.)
- Calm, thoughtful, precise
- British English spelling (colour, organisation, programme)

---

## Motion

**Duration:**

- 180-240ms for standard transitions
- Fade/opacity transitions only

**Easing:**

- `ease-out` or `ease-in-out`

**Rules:**

- NO bouncing animations
- NO springy physics
- NO retro animations
- NO decorative motion

---

## UI Design Principles

### A. Radical Simplicity

- Keep UI quiet, like Craft.do, Linear, Read.cv
- Remove decorative visuals
- Remove retro-OS tropes

### B. Consistency

- Consistent spacing (12-16px grid)
- Consistent border radius (8-12px)
- Consistent shadow softness
- Consistent tab behaviour

### C. Calm Motion

- Fade/opacity transitions only
- Duration: 180-240ms
- Easing: ease-out / ease-in-out

### D. Clear Hierarchy

- One focal point per screen
- Secondary actions minimal
- Heavy reduction in element count

---

## Product Structure

The product consists of a single, unified workspace:

```text
/workspace
  - Scout (discovery)
  - Ideas (canvas)
  - Timeline (planner)
  - Pitch (story builder)
  - Analytics (dashboard)
```

Each mode has:

- Header
- Content area
- Side panel where needed
- Light boundaries (1px borders)
- Soft shadows or faint borders

---

## Design References

### Primary Inspiration (Modern)

- Linear.app - minimal, confident, muted palette
- Craft.do - calm, spacious, delightful
- Notion (but less bland)
- Pitch.com - sleek, high-design presentation
- Read.cv - elegant simplicity
- Arc Browser - futuristic without being loud

### Secondary Inspiration (Music)

- Ableton.com (their redesign is very clean)
- Splice (modern but not overly loud)

**Aesthetic Target:** "A smart, calm tool for creativity. Something that would feel at home on a 2025 MacBook in a studio."

---

## UX Philosophy

**Totalaud.io must feel like:**

- A personal creative workspace
- A trusted music ally
- A mix between a journal, planning tool, and smart assistant

**Should NOT feel like:**

- A marketing dashboard
- A CRM
- A productivity bro app
- A toy/novelty product

---

## Brand Behaviours

- Agents appear quietly, never dominate the UI
- AI suggestions come as small, helpful nudges
- Export options are clean, elegant text outputs
- Everything is focused on actual traction:
  - Playlists
  - Press
  - Content ideas
  - Release planning

---

## Brand Mission

> Totalaud.io helps independent artists get heard - through intelligent tools that simplify discovery, planning, pitching and creative direction. It's a quiet powerhouse, built with care.

---

## What to Archive (Vault Features)

These stay in the codebase but are inaccessible to MVP users:

- ASCII OS
- XP OS
- Aqua OS
- LoopOS (full engine)
- DAWOS
- Personas
- Companions
- Rituals
- Ambient engine
- Director Demo
- Narrative engine
- Multi-agent teams
- OS bridges
- Showreels

---

## CSS Variables Reference

```css
:root {
  --flowcore-colour-bg: #0F1113;
  --flowcore-colour-fg: #ECEFF1;
  --flowcore-colour-accent: #3AA9BE;
  --flowcore-colour-accent-hover: #56BFD4;
  --flowcore-colour-border: #263238;
  --flowcore-motion-fast: 120ms;
  --flowcore-motion-normal: 240ms;
  --flowcore-motion-slow: 400ms;
}
```

---

**Last Updated:** November 2025
**Status:** Active - MVP Pivot
