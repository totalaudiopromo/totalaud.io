# Landing Page - Quick Reference Card

**One-page reference for the totalaud.io landing page**

---

## 🚀 Quick Start

```bash
# Dev server
pnpm dev

# Access
http://localhost:3002/landing

# Test build
pnpm build --filter=aud-web
```

---

## 📐 Page Structure (Top to Bottom)

1. **Hero** (Phase 1)
   - Cinematic title: "totalaud.io"
   - Staggered tagline: "Creative control for artists."
   - Slate Cyan breathing pulse

2. **Scroll Reveals** (Phase 1)
   - "plan your release"
   - "send with precision"
   - "see what resonates"

3. **Console Preview + CTA** (Phase 1)
   - Video placeholder (ready for `/public/videos/console-preview.mp4`)
   - Magnetic CTA button (appears after 8s)

4. **Social Proof** (Phase 3) ← NEW
   - "Trusted by" + 4 partners

5. **Testimonials** (Phase 3) ← NEW
   - 2 field notes (staggered)

6. **FAQ Accordion** (Phase 3) ← NEW
   - 4 questions (one-at-a-time open)

7. **Scroll Narrative** (Phase 3) ← NEW
   - "Built by artists who still send their own emails."

8. **Footer** (Phase 3) ← NEW
   - Copyright + links + sound toggle

---

## 🎨 Design Tokens

**Colours**:
```css
Background:   #0F1113
Text:         #E5E7EB
Muted:        #6B7280
Accent:       #3AA9BE
Border:       #2A2F33/80
```

**Fonts**:
```css
Headings:     var(--font-inter)
Monospace:    var(--font-geist-mono)
```

**Motion**:
```typescript
easing:       [0.22, 1, 0.36, 1]
spring:       { damping: 15, stiffness: 150 }
```

**Spacing**:
```css
Desktop:      py-24 (96px), py-32 (128px)
Mobile:       py-16 (64px), py-24 (96px)
```

---

## 📊 Analytics Events

| Event | Trigger | Tool |
|-------|---------|------|
| `landing_view` | Page load | `track('landing_view')` |
| `scroll_milestone_reveal1` | 20% scroll | Auto-tracked |
| `scroll_milestone_reveal2` | 35% scroll | Auto-tracked |
| `scroll_milestone_reveal3` | 50% scroll | Auto-tracked |
| `scroll_milestone_proof_section` | 65% scroll | Auto-tracked |

---

## 🧩 Components Reference

| Component | Location | Purpose |
|-----------|----------|---------|
| `LandingPage` | `app/landing/page.tsx` | Main page |
| `SocialProof` | `components/sections/SocialProof.tsx` | Trusted partners |
| `Testimonials` | `components/sections/Testimonials.tsx` | Field notes |
| `FAQAccordion` | `components/ui/FAQAccordion.tsx` | Questions |
| `ScrollNarrative` | `components/sections/ScrollNarrative.tsx` | Emotional beat |
| `LandingFooter` | `components/layout/LandingFooter.tsx` | Footer |

---

## 🛠️ Common Edits

### Change Testimonials

**File**: `components/sections/Testimonials.tsx`
```tsx
const quotes = [
  {
    quote: "Your quote here",
    name: "Name",
    role: "Role",
  },
  // ...
]
```

### Change Social Proof Partners

**File**: `components/sections/SocialProof.tsx`
```tsx
const partners = [
  { name: 'Partner Name', type: 'Type' },
  // ...
]
```

### Add FAQ Question

**File**: `components/ui/FAQAccordion.tsx`
```tsx
const faqs = [
  {
    q: 'Question?',
    a: 'Answer.',
  },
  // ...
]
```

### Replace Console Video

1. Export 5-7s screen recording (1920×1080, < 2 MB)
2. Save as `/public/videos/console-preview.mp4`
3. Uncomment lines 291-300 in `app/landing/page.tsx`

---

## ✅ Pre-Deploy Checklist

- [ ] Export Console preview video
- [ ] Replace placeholder testimonials
- [ ] Update Social Proof partners
- [ ] Test on mobile (real device)
- [ ] Run Lighthouse (target: Perf > 95, A11y ≥ 95)
- [ ] Verify analytics events fire
- [ ] Check all links work
- [ ] Test keyboard navigation
- [ ] Verify reduced motion works

---

## 🔧 Troubleshooting

**Animations not firing?**
→ Check Framer Motion import, verify `whileInView` set

**FAQ not opening?**
→ Check `AnimatePresence` wrapper, verify `openIndex` state

**Analytics not tracking?**
→ Verify `@vercel/analytics` installed, check browser console

**Mobile overflow?**
→ Add `px-4` padding, check `max-w-*` classes

**Video not showing?**
→ Check file exists at `/public/videos/console-preview.mp4`

---

## 📚 Full Documentation

- **All Phases Summary**: [LANDING_PAGE_ALL_PHASES_SUMMARY.md](LANDING_PAGE_ALL_PHASES_SUMMARY.md)
- **Phase 1 Complete**: [LANDING_PAGE_PHASE_1_COMPLETE.md](LANDING_PAGE_PHASE_1_COMPLETE.md)
- **Phase 3 Complete**: [LANDING_PAGE_PHASE_3_COMPLETE.md](LANDING_PAGE_PHASE_3_COMPLETE.md)
- **Testing Guide**: [LANDING_PAGE_TESTING_GUIDE.md](LANDING_PAGE_TESTING_GUIDE.md)

---

**Last Updated**: 2025-10-26
**Status**: Ready for testing
**URL**: http://localhost:3002/landing
