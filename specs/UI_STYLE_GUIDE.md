# totalaud.io — UI Style Guide

**Version**: 1.0
**Design System**: Cursor-Inspired Minimal
**Last Updated**: 2025-10-24
**Status**: Production Standard

---

## 🎯 Purpose

To ensure a unified, minimal, professional look and feel across all apps in the totalaud.io ecosystem.
This guide defines the visual DNA — fonts, colours, motion, spacing, and component rhythm — so every screen feels calm, fast, and deliberate.

---

## 🧠 Design Philosophy

| Principle | Description |
|-----------|-------------|
| **Intentional Minimalism** | Every element must earn its pixel. Remove anything decorative without functional meaning. |
| **Composed Motion** | Motion confirms interaction, never distracts. |
| **Tactile Precision** | Soft shadows, crisp edges, 8px rhythm. |
| **Warm Neutrality** | Colour accent supports creativity without shouting. |
| **Flow Over Chrome** | UI recedes; content and collaboration stay in focus. |

---

## 🅰️ Typography

| Role | Font | Weight | Size | Line Height | Notes |
|------|------|--------|------|-------------|-------|
| **Primary / UI** | Geist Sans → fallback Inter | 400 / 500 | 14–18px | 1.4–1.6 | Clean geometric sans; used for all labels, buttons, navigation. |
| **Body / Paragraphs** | Inter | 400 | 15–16px | 1.6–1.8 | Excellent legibility at small sizes. |
| **Mono / Code / Metrics** | Geist Mono or IBM Plex Mono | 400 | 13–14px | 1.5 | Used for analytics, IDs, and terminal-style areas. |
| **Display / Headings** | Geist Sans SemiBold | 600 | 20–28px | 1.3 | Restrained; never heavier than 600. |

### Rules
- Only two weights per family
- Font smoothing: `-webkit-font-smoothing: antialiased`
- `font-display: swap` for performance

---

## 🎨 Colour System

### Base Palette

| Token | HEX | Usage |
|-------|-----|-------|
| `--bg` | `#0F1113` | Console background |
| `--surface` | `#1A1C1F` | Cards / panels |
| `--text-primary` | `#EAECEE` | Main text |
| `--text-secondary` | `#A0A4A8` | Muted text |
| `--accent` | `#3AA9BE` | Brand / interactive elements (Slate Cyan - professional, calm) |
| `--accent-alt` | `#4FC8B5` | Hover / focus states (gentle depth) |
| `--accent-warm` | `#D4A574` | Analogue comfort tone |
| `--border` | `#2C2F33` | Dividers, outlines |
| `--success` | `#3ED598` | Positive |
| `--error` | `#FF6B6B` | Negative |
| `--warning` | `#FFC857` | Warnings |

### Contrast Targets
- Text ≥ 4.5:1 (WCAG AA)
- Non-text UI ≥ 3:1

---

## 🧮 Spacing & Layout

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Micro-padding |
| `--space-2` | 8px | Base grid unit |
| `--space-3` | 16px | Compact gaps |
| `--space-4` | 24px | Medium gaps |
| `--space-5` | 32px | Large section gaps |

### Rules
- All margins/paddings multiply of 8px
- Content width: 1200px max
- Panels: 16px inner padding, 24px outer margin
- Use CSS logical properties (`margin-inline`, `padding-block`) for RTL support

---

## 💫 Motion System

| Type | Duration | Easing | Purpose |
|------|----------|--------|---------|
| **Fast** | 120ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Button hover, micro feedback |
| **Normal** | 240ms | same | Pane transitions |
| **Slow** | 400ms | same | Calm fades, modals |
| **Spring** | 0.6 mass / 30 damping | Natural recoil | Drag/drop |

### Reduced Motion
- Honour `prefers-reduced-motion: reduce`
- In Calm Mode: convert all transforms → opacity fades

---

## 🎧 Sound Guidelines

| Event | Tone | Duration | LUFS | Notes |
|-------|------|----------|------|-------|
| **Click / Confirm** | Sine 440Hz | 100ms | –18 | Short & clean |
| **Error** | Square 220Hz | 150ms | –16 | Slight buzz, no harshness |
| **Success** | Tri 880Hz | 300ms | –12 | Gentle uplift |
| **Join / Leave** | Sweep 440→880Hz | 250ms | –18 | Collaboration cue |

---

## 🪞 Component Standards

| Component | Style Notes |
|-----------|-------------|
| **Button** | 32px height, 8px × 16px padding, 4px radius, accent background + white text |
| **Input** | 36px height, 1px border, focus ring accent @ 50% opacity |
| **Card / Panel** | 8px radius, shadow `0 2px 8px rgba(0,0,0,0.2)` |
| **Modal** | Fade/scale (240ms), blurred backdrop (6px) |
| **Tooltip** | 12px text, 6px × 8px padding, opacity 0.95 background |

---

## ♿ Accessibility Checklist

- ✅ Keyboard nav: Tab / Shift+Tab / Enter / Esc for all modals
- ✅ Focus visible: 2px accent outline
- ✅ Button target ≥ 24×24px
- ✅ Respect system colour scheme + reduced motion
- ✅ Use semantic HTML + ARIA roles on complex components

---

## 📈 Performance Targets

| Metric | Target |
|--------|--------|
| Theme switch | < 100ms |
| Page transition | < 200ms |
| FPS under interaction | ≥ 60fps |
| Input latency | < 50ms |
| Font loading | < 300ms (swap) |

---

## 🧩 Implementation Notes

```typescript
// Example token usage
const theme = {
  font: {
    family: "var(--font-geist), var(--font-inter), system-ui",
    size: 14,
    lineHeight: 1.5,
  },
  color: {
    bg: "var(--bg)",
    text: "var(--text-primary)",
    accent: "var(--accent)",
  },
  motion: {
    fast: "120ms cubic-bezier(0.22,1,0.36,1)",
  },
}
```

### CSS Variables Setup

```css
:root {
  /* Typography */
  --font-geist: 'Geist Sans', system-ui;
  --font-inter: 'Inter', system-ui;
  --font-mono: 'Geist Mono', 'IBM Plex Mono', monospace;

  /* Colors */
  --bg: #0F1113;
  --surface: #1A1C1F;
  --text-primary: #EAECEE;
  --text-secondary: #A0A4A8;
  --accent: #3AA9BE;          /* Slate Cyan - professional, calm, creative-tech */
  --accent-alt: #4FC8B5;      /* Hover/focus states - gentle depth */
  --accent-warm: #D4A574;
  --border: #2C2F33;
  --success: #3ED598;
  --error: #FF6B6B;
  --warning: #FFC857;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;

  /* Motion */
  --motion-fast: 120ms cubic-bezier(0.22, 1, 0.36, 1);
  --motion-normal: 240ms cubic-bezier(0.22, 1, 0.36, 1);
  --motion-slow: 400ms cubic-bezier(0.22, 1, 0.36, 1);
}
```

---

## 🧭 Testing & QA

1. `/theme-demo` route shows all components in every theme
2. Use axe-core and Playwright visual diff for regression
3. Validate contrast ratios via `scripts/contrast-audit.ts`
4. Re-run Stage 7.5 accessibility tests after any visual change

---

## 🌍 Future Enhancements

- Variable font weight transitions (optical sizing)
- High-Contrast / Dark Mode toggle
- Custom accent selection per workspace
- Theme export/import (white-label support)

---

## 📚 Related Documentation

- [ADAPTIVE_THEME_SPEC.md](./ADAPTIVE_THEME_SPEC.md) - Theme system architecture
- [MOTION_SOUND_PERSONALITY_SPEC.md](./MOTION_SOUND_PERSONALITY_SPEC.md) - Motion/sound profiles
- [STUDIO_COLLAB_SPEC.md](./STUDIO_COLLAB_SPEC.md) - Collaboration visual language
- [COLLAB_UX_GUIDE.md](./COLLAB_UX_GUIDE.md) - Multi-user UX patterns

---

**End of UI Style Guide**

*Keep it calm. Keep it clear. Let the creativity shine, not the chrome.*
