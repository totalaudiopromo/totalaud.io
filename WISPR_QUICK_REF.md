# Wispr Flow Quick Reference Card

**Purpose**: One-page lookup for developers during implementation
**Print This**: Keep next to your keyboard

---

## 🎯 Recommended Hero Copy

```
totalaud.io

For people who still send their own emails.

The promotion workspace built by someone who actually uses it.
```

---

## 📁 Key Files to Edit

### Phase 1 (2 hours)

```
apps/aud-web/src/app/landing/page.tsx
├─ Line 163: Add sticky header CTA
├─ Line 196: Rewrite hero copy
├─ Line 345: Add CTA micro-glow
└─ (after components): Import WaitlistModal

apps/aud-web/src/components/layout/LandingFooter.tsx
└─ (before </footer>): Add privacy badge
```

### Phase 2 (4 hours)

```
apps/aud-web/src/app/layout.tsx
└─ Line 5: Import @fontsource-variable/eb-garamond

apps/aud-web/src/app/globals.css
└─ :root section: Add --font-editorial

apps/aud-web/src/packages/ui/tokens/motion.ts
└─ Line 1-5: Update motion tokens

apps/aud-web/src/components/sections/ScrollFlow.tsx
├─ Line 38-51: Slow down opacity transforms
└─ Line 133: Add mid-scroll testimonial

apps/aud-web/src/components/sections/IntegrationProof.tsx
└─ NEW FILE: Create component

apps/aud-web/src/components/sections/Testimonials.tsx
└─ Line 39: Change duration 0.6 → 0.8
```

---

## 🎨 Design Tokens Quick Copy

### Typography
```css
--font-editorial: 'EB Garamond Variable', Georgia, serif;
--font-inter: 'Inter', sans-serif;
--font-geist-mono: 'JetBrains Mono', monospace;
```

**Use serif for**: Hero headline, section headlines, emotional quotes
**Use sans for**: Body, CTAs, navigation, UI

---

### Motion Durations
```typescript
const motionTokens = {
  fast: '120ms cubic-bezier(0.22, 1, 0.36, 1)',
  normal: '400ms cubic-bezier(0.22, 1, 0.36, 1)',    // Was 240ms
  slow: '600ms ease-in-out',                          // Was 400ms
  editorial: '800ms cubic-bezier(0.22, 1, 0.36, 1)', // NEW
  glow: 'text-shadow: 0 0 40px rgba(58, 169, 190, 0.15)',
}
```

---

### Colours (Additions Only)
```typescript
accentHover: '#52B8CC'                    // Lighter Slate Cyan
accentGlow: 'rgba(58, 169, 190, 0.25)'   // Hover glow
serifWhite: '#F9FAFB'                     // Warmer white for serif
```

---

## 🔧 Code Snippets

### Sticky Header CTA
```typescript
<motion.header
  className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0F1113]/90 border-b border-[#2A2F33]/50"
  initial={{ y: -100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 1, duration: 0.4, ease: easeCubic }}
>
  <div className="flex justify-between items-center px-8 py-3 max-w-7xl mx-auto">
    <span className="text-[#3AA9BE] text-sm font-medium">totalaud.io</span>
    <motion.button
      onClick={() => {
        setIsWaitlistOpen(true)
        playCTATone()
        track('cta_click', { location: 'sticky_header' })
      }}
      className="text-sm text-[#3AA9BE] border border-[#3AA9BE]/60 px-4 py-2 rounded-md"
      whileHover={{
        boxShadow: '0 0 20px rgba(58, 169, 190, 0.2)',
        borderColor: 'rgba(58, 169, 190, 1)',
      }}
    >
      Request Access →
    </motion.button>
  </div>
</motion.header>
```

---

### CTA Micro-Glow
```typescript
whileHover={{
  backgroundColor: 'rgba(58, 169, 190, 0.12)',
  borderColor: 'rgba(58, 169, 190, 1)',
  boxShadow: '0 0 24px rgba(58, 169, 190, 0.25)',
}}
whileTap={{ scale: 0.98 }}
transition={{ duration: 0.24, ease: easeCubic }}
```

---

### Privacy Badge
```typescript
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
  className="border-t border-[#2A2F33]/50 pt-8 mt-8 text-center"
>
  <p className="text-[#6B7280] text-sm mb-2">
    🔒 Your data stays yours. We don't sell contact lists.
  </p>
  <p className="text-[#4B5563] text-xs opacity-60">
    Built for creators, by creators since 2019.
  </p>
</motion.div>
```

---

### Mid-Scroll Testimonial
```typescript
<motion.blockquote
  style={{
    opacity: useTransform(scrollYProgress, [0.32, 0.38, 0.45, 0.52], [0, 1, 1, 0]),
    y: useTransform(scrollYProgress, [0.32, 0.38], [20, 0]),
  }}
  className="fixed bottom-16 left-1/2 -translate-x-1/2 text-center max-w-xl px-4 z-20"
>
  <p className="text-[#A0A4A8] text-sm italic">
    "This changes how we pitch radio. It's the first tool that feels designed by someone who's done it."
  </p>
  <footer className="text-[#6B7280] text-xs">— Tom R, Radio Plugger</footer>
</motion.blockquote>
```

---

## 📊 Analytics Events to Add

```typescript
// Sticky header
track('cta_click', { location: 'sticky_header' })

// Testimonial rotation
track('testimonial_rotate', { index: 0-2 })

// Integration hover
track('integration_hover', { name: 'Spotify' })

// Mid-scroll proof
track('scroll_milestone_mid_testimonial')
```

---

## ✅ Testing Checklist

### Before Commit
- [ ] British spelling verified (colour, behaviour, optimise)
- [ ] No console errors or warnings
- [ ] Sticky header doesn't cover hero text
- [ ] CTA glow appears on hover (240ms fade)
- [ ] Privacy badge text readable on Matte Black
- [ ] Analytics events fire correctly

### Mobile Testing
- [ ] iPhone SE (375px width)
- [ ] iPhone 12/13/14 (390px width)
- [ ] iPad (768px width)
- [ ] Sticky header CTA doesn't wrap
- [ ] ScrollFlow phrases centred
- [ ] Integration badges wrap to 2-3 per row

### Performance
- [ ] Lighthouse score: 90+ Performance
- [ ] Lighthouse score: 100 Accessibility
- [ ] No FOIT (Flash of Invisible Text) for serif font
- [ ] Motion respects `prefers-reduced-motion`

---

## 🚀 Deployment Commands

```bash
# Create feature branch
git checkout -b feature/wispr-flow-landing-enhancements

# Install serif font (Phase 2)
cd apps/aud-web
pnpm add @fontsource-variable/eb-garamond

# Run dev server
pnpm dev

# Type check
pnpm typecheck

# Lint + format
pnpm lint:fix
pnpm format

# Commit Phase 1
git add .
git commit -m "feat(landing): Phase 1 - Wispr Flow quick wins (sticky header, hero copy, CTA glow, privacy badge)"

# Push to staging
git push origin feature/wispr-flow-landing-enhancements
```

---

## 🎯 Success Metrics Targets

```
BEFORE → AFTER

Scroll Depth:        40% → 60%    (+50%)
CTA Click Rate:      5-8% → 12-15% (+87%)
Time to First CTA:   8s → <3s     (-62%)
Testimonial Views:   Low → High   (+200%)
```

---

## 📚 Full Documentation

- [WISPR_FLOW_SUMMARY.md](WISPR_FLOW_SUMMARY.md) - Start here
- [WISPR_FLOW_ANALYSIS.md](WISPR_FLOW_ANALYSIS.md) - Strategic overview
- [WISPR_IMPLEMENTATION_CHECKLIST.md](WISPR_IMPLEMENTATION_CHECKLIST.md) - Task by task
- [WISPR_VISUAL_REFERENCE.md](WISPR_VISUAL_REFERENCE.md) - Before/after diagrams

---

## 🤝 Questions?

**Hero Copy**: Use Option 3 ("For people who still send their own emails.")
**Editorial Font**: EB Garamond Variable (free, variable, modern)
**Motion Speed**: Slow down 240ms → 400ms, 400ms → 600ms
**Privacy Wording**: "We don't sell contact lists." (approve with Chris)

**Start with Phase 1** (2 hours) → Ship to staging → A/B test hero copy → Continue to Phase 2

---

**Last Updated**: 26 October 2025
**Print This**: Keep next to keyboard during implementation
