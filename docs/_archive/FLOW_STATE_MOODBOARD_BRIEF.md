# Flow State Moodboard Brief

**Project**: totalaud.io flow studio
**Theme**: Creative Intelligence meets Studio Minimalism
**Goal**: To make users feel like producers orchestrating living agents — not managing data.
**Location**: Brighton, UK
**Last Updated**: 19 October 2026

---

## 🪶 1️⃣ Brand Essence

| Attribute | Description |
|-----------|-------------|
| **Tone** | calm, precise, creative, human |
| **Mood** | late-night studio focus, deep work |
| **Personality** | professional yet expressive; confident without corporate polish |
| **Emotion to evoke** | flow, control, curiosity, quiet mastery |
| **Tagline** | "marketing your music should feel like making it." |

---

## 🧠 2️⃣ Concept Metaphor

> Imagine if Ableton Live, Superhuman, and Obsidian had a child —
> but it worked for music promotion instead of music production.

**The Flow Studio is your DAW for campaigns.**
- Agents are your plugins
- The dashboard is your mixdown
- You don't manage — you perform

---

## 💡 3️⃣ Visual Language

### 🎚️ Palette (Core)

| Colour | Use | Hex | Notes |
|--------|-----|-----|-------|
| **Deep Navy** | Primary background | `#0a0d10` | Matte, non-reflective |
| **Soft Graphite** | Grid + secondary surfaces | `#14171b` | Subtle depth |
| **Agent Green** | Progress + success | `#45ff7c` | Desaturated: `#0ea271` |
| **Electric Indigo** | Highlight / selection | `#4a52ff` | Desaturated: `#5a5de1` |
| **Amber Accent** | Errors / warmth | `#ffb347` | Desaturated: `#e58f0a` |
| **Slate Grey** | Text muted | `#a0a4a8` | Secondary text |
| **Pure White** | High contrast | `#ffffff` | Primary text |

**Design Principles:**
- Subtle use of neon hues only as functional feedback (not decoration)
- Avoid gradients — use matte fills and inner glows
- All colours slightly desaturated for timeless feel

---

### 🔡 Typography

| Use | Font | Weight | Notes |
|-----|------|--------|-------|
| **Primary** | Inter | 400–600 | Clean sans for headings + UI |
| **Secondary** | JetBrains Mono | 400–500 | Status text, timecodes, metrics |
| **Optional Accent** | PP Neue Machina | 600 | Logo or key wordmarks |

**Typography Rules:**
- All lowercase
- Tracking slightly expanded (+1–2%) for readability
- Hierarchy through contrast, not size
- Line height: 1.4–1.6 for body, 1.2–1.3 for headings

---

### 🧱 Layout & Composition

- Use **asymmetric grid** (like Ableton's clip view)
- Margins generous — **32–48px** breathing room
- Rounded corners radius **8–12px**
- Light grid texture overlay (opacity **0.04**)
- Elements float gently — no harsh borders
- Align everything to the rhythm of **8px increments** (feels musical)

---

### 🌫️ Motion

| Animation | Timing | Description |
|-----------|--------|-------------|
| **Fade in/out** | 120–200ms | Gentle ease-in-out |
| **Pulse** | 1.2s loop | Used for active nodes |
| **Hover scale** | 1 → 1.05 | On buttons, slow |
| **Parallax grid** | 10s loop | Subtle 2px drift |
| **Canvas transition** | 300ms crossfade | Flow ↔ mixdown views |

**Rule**: Motion should guide focus, not show off.

---

### 💡 Lighting

Treat the interface like a dark control room:

- Light is functional — highlights data and focus
- Node borders emit light when active (soft neon inner glow)
- Global ambient lighting shifts slightly with agent activity
  - Example: greenish tint when Tracker is running
- **No pure black** — always textured deep navy
- Glow effects: `box-shadow: 0 0 16px [color]`

---

## 🎧 4️⃣ Sound Texture

Design your UI sound palette like a minimalist synth rack:

| Action | Sound | Quality |
|--------|-------|---------|
| **Start agent** | Percussive pluck | 200Hz sine + short decay |
| **Complete** | Harmonic resolution | Major 3rd interval, 440Hz base |
| **Error** | Low detuned tone | 220Hz, short reverb tail |
| **UI hover** | Click + soft pad tail | 5–10ms attack |
| **Flow Mode active** | Ambient hum | -24dB C minor drone |

**Audio Rules:**
- All sounds under 300ms
- Always fade in/out — no harsh cuts
- Master bus volume capped to -12 LUFS
- Respect `mute_sounds` and `reduced_motion` preferences

---

## 🧩 5️⃣ Interface Personality

Each OS "theme" (ascii, xp, aqua, ableton, punk) should express its tone through micro-styling, not colour explosion.

| Theme | Visual flavour | Tone of copy |
|-------|---------------|-------------|
| **ascii** | Black + white terminal, gridless | Minimalist, no fluff |
| **xp** | Glossy minimal blue, gentle drop shadows | Nostalgic, warm |
| **aqua** | Soft translucence, motion blur | Relaxed, fluid |
| **ableton** | Monochrome + pastel accent lines | Rhythmic, creative |
| **punk** | Raw contrast, monospace + overscan | Direct, anarchic |

---

## 🪞 6️⃣ Lighting Reference (Moodboard Keywords)

Search or generate using these:

```plaintext
"dark studio interface, glowing panels, matte finish, soft light grid"
"late-night DAW aesthetic, neon control room, dark UI with green highlights"
"superhuman email client meets ableton live interface"
"creative software, ambient glow, minimal dashboard, cinematic lighting"
```

---

## 🔈 7️⃣ Sound Reference (for AI Audio Tools or Sound Designer)

- **Brian Eno** – Music for Airports (texture reference)
- **Jon Hopkins** – Immunity (rhythmic ambient pulse)
- **Ableton Live** – Click & metronome tones
- **Superhuman** – UI feedback sounds (muted, tactile)
- **BBC Radiophonic Workshop** – For personality themes

---

## 🧩 8️⃣ Deliverables for Designer / AI Tool

Generate:

1. **3 hero screens** — Flow View, Focus Mode, Mixdown View
2. **1 brand poster** — "marketing your music should feel like making it"
3. **1 UI texture set** — Matte grid + ambient overlay
4. **1 sound kit mockup** — Agent sound waveform visualisation

---

## ⚙️ Midjourney / Runway / v0.dev Prompt

```plaintext
dark ui studio aesthetic, creative dashboard, minimal grid, matte navy background,
glowing green accents, monochrome typography, cinematic lighting, focus-state environment,
subtle ambient glow, ableton live meets superhuman aesthetic, 8px grid, smooth parallax,
synth control panel style, ultra-clean ux, lowercase headings, british design minimalism
```

---

## 🎨 CSS Variables for Implementation

```css
:root {
  /* Colours */
  --color-deep-navy: #0a0d10;
  --color-soft-graphite: #14171b;
  --color-agent-green: #45ff7c;
  --color-agent-green-muted: #0ea271;
  --color-electric-indigo: #4a52ff;
  --color-electric-indigo-muted: #5a5de1;
  --color-amber-accent: #ffb347;
  --color-amber-accent-muted: #e58f0a;
  --color-slate-grey: #a0a4a8;
  --color-pure-white: #ffffff;

  /* Typography */
  --font-primary: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing (8px rhythm) */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-6: 48px;

  /* Border radius */
  --radius-sm: 8px;
  --radius-md: 12px;

  /* Motion */
  --duration-fast: 120ms;
  --duration-medium: 200ms;
  --duration-slow: 300ms;
  --ease: cubic-bezier(0.4, 0, 0.2, 1);

  /* Grid texture */
  --grid-opacity: 0.04;
}
```

---

## 📚 Related Documentation

- [FLOW_STATE_DESIGN_SPEC.md](./FLOW_STATE_DESIGN_SPEC.md) - Technical implementation spec
- [TOTALAUDIO_MICROCOPY_TONE_SHEET.md](./TOTALAUDIO_MICROCOPY_TONE_SHEET.md) - Copy guidelines
- [UX_FLOW_STUDIO_GUIDE.md](./UX_FLOW_STUDIO_GUIDE.md) - UX patterns

---

**Last Updated**: 19 October 2026
**Status**: Active Design System
**Location**: Brighton, UK
**Contributors**: Claude Code, Total Audio Team
