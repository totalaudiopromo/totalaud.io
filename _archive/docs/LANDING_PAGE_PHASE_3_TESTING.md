# Landing Page Phase 3 - Testing Guide

**Quick reference for testing the Content & Trust Layer**

---

## 🚀 Quick Start

```bash
# Server is running on:
http://localhost:3002/landing
```

**Recommended browser**: Chrome (for DevTools testing)

---

## 📋 Visual Checklist

### 1. Social Proof Section

**Scroll to**: Just below Console preview section

**What to check**:
- [ ] "Trusted by" label is visible (uppercase, small, Geist Mono)
- [ ] Four partners displayed in a row (desktop) or wrapped (mobile)
- [ ] Fades in smoothly when scrolling into view
- [ ] Border-top is subtle (not too harsh)
- [ ] Typography is clean and readable
- [ ] Spacing feels calm (py-24 = 96px)

**Expected layout**:
```
      Trusted by

Warm FM          Echo Agency          Reverb Club          Lisa D
Radio Network    Promo Agency         Artist Collective     Producer
```

---

### 2. Testimonials Section

**Scroll to**: Below Social Proof

**What to check**:
- [ ] Two testimonials appear sequentially (0.2s delay)
- [ ] Quotes are centre-aligned
- [ ] Text is large enough to read comfortably (text-lg md:text-xl)
- [ ] Attribution is below quote (smaller, muted)
- [ ] Max-width prevents line length exceeding readability (32rem)
- [ ] British quotation marks ("curved" not "straight")
- [ ] Spacing between testimonials is comfortable (space-y-16)

**Expected text**:
1. "totalaud.io feels like a creative DAW for promotion — fast, musical, and strangely calming." — Lisa D, Artist / DJ
2. "This changes how we pitch radio. It's the first tool that feels designed by someone who's done it." — Tom R, Radio Plugger

---

### 3. FAQ Accordion

**Scroll to**: Below Testimonials

**What to check**:
- [ ] "Before you ask —" header is centred
- [ ] Four FAQ items are visible
- [ ] Click first question → opens smoothly (0.3s animation)
- [ ] Arrow rotates 180° when open
- [ ] Answer text fades in (opacity animation)
- [ ] Click same question → closes smoothly
- [ ] Click different question → first closes, second opens
- [ ] Border-bottom on each item is subtle

**Interactive test**:
```bash
1. Click "What is totalaud.io?"
   → Should open with smooth height animation
   → Arrow should point up

2. Click "Who's it for?"
   → First question should close
   → Second question should open
   → Only one open at a time

3. Press Tab key repeatedly
   → Should cycle through all questions
   → Focus outline visible

4. Press Enter on focused question
   → Should toggle open/close
```

**Questions**:
1. What is totalaud.io?
2. Who's it for?
3. Is it AI-driven?
4. When can I access it?

---

### 4. Scroll Narrative

**Scroll to**: Below FAQ, before footer

**What to check**:
- [ ] Single sentence fades in when in view
- [ ] Text is large (text-xl md:text-2xl)
- [ ] Centred and readable
- [ ] Feels like a natural pause before footer
- [ ] Doesn't feel like marketing copy

**Expected text**:
> "Built by artists who still send their own emails."

---

### 5. Footer

**Scroll to**: Bottom of page

**What to check**:
- [ ] Copyright notice is centred
- [ ] Links are on second line
- [ ] "total audio promo ↗" opens in new tab
- [ ] Privacy and Terms links are styled consistently
- [ ] Hover states work (Slate Cyan colour)
- [ ] Sound toggle indicator is visible (bottom-left corner)
- [ ] ⌘M shortcut hint is shown

**Links to verify**:
- [ ] total audio promo → https://totalaudiopromo.com (new tab)
- [ ] Privacy → /privacy
- [ ] Terms → /terms

---

## 📱 Mobile Testing

### iPhone 15 Pro (393×852)

```bash
# Chrome DevTools → Device Toolbar → iPhone 15 Pro
```

**What to check**:
- [ ] Social Proof partners stack/wrap neatly
- [ ] Testimonials are readable (not too wide)
- [ ] FAQ touch targets are large enough (44×44px minimum)
- [ ] Scroll Narrative text wraps correctly
- [ ] Footer links don't overflow
- [ ] Sound toggle doesn't overlap content
- [ ] No horizontal scroll anywhere

### iPad (768×1024)

**What to check**:
- [ ] Layout transitions smoothly from mobile to tablet
- [ ] FAQ questions are comfortable to read
- [ ] Testimonials use increased font size (md: breakpoint)

---

## ♿ Accessibility Testing

### Keyboard Navigation

```bash
# Use Tab key to navigate, Enter/Space to activate
```

**Test sequence**:
1. Tab to FAQ section
2. Tab through all four questions
3. Press Enter on first question → Should open
4. Press Enter again → Should close
5. Tab to footer links
6. Press Enter on "total audio promo" → Should open in new tab

**Expected**:
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] No keyboard traps
- [ ] Logical tab order

### Screen Reader (macOS VoiceOver)

```bash
# Enable: ⌘F5
# Navigate: VO + Right Arrow
```

**What to check**:
- [ ] FAQ questions announce current state ("collapsed" / "expanded")
- [ ] Testimonial attributions are read correctly
- [ ] Footer links announce "opens in new tab" for external link
- [ ] Landmarks are properly announced (section, footer)

### Colour Contrast

**Tool**: Chrome DevTools → Lighthouse → Accessibility

**Minimum ratios** (WCAG AA):
- Normal text: 4.5:1
- Large text: 3:1

**Check**:
- [ ] All text meets contrast requirements
- [ ] Muted text (#6B7280 on #0F1113) is readable
- [ ] Hover states maintain contrast

---

## 🎬 Animation Testing

### Scroll Trigger Test

```bash
# Scroll slowly from top to bottom
```

**Expected sequence**:
1. Hero fades in (Phase 1)
2. Scroll reveals appear (Phase 1)
3. Console preview section (Phase 1)
4. **Social Proof fades in** (Phase 3)
5. **First testimonial fades in** (Phase 3)
6. **Second testimonial fades in** (0.2s after first) (Phase 3)
7. **FAQ section appears** (Phase 3)
8. **Scroll Narrative fades in** (Phase 3)

**What to check**:
- [ ] No animations fire too early
- [ ] No layout shift as elements appear
- [ ] Animations feel calm (not aggressive)
- [ ] All animations use cubic-bezier(0.22, 1, 0.36, 1)

### Reduced Motion Test

```bash
# macOS: System Settings → Accessibility → Display → Reduce motion
```

**What to check**:
- [ ] Framer Motion automatically reduces animation intensity
- [ ] Content still appears (just with less motion)
- [ ] No jarring instant transitions
- [ ] Page remains usable

---

## 🔍 Visual Regression Checks

### Spacing & Rhythm

**Desktop**:
- [ ] Sections have consistent vertical spacing (py-24 or py-32)
- [ ] No cramped areas
- [ ] Testimonials have comfortable space between them
- [ ] FAQ items have balanced padding

**Mobile**:
- [ ] Reduced spacing still feels comfortable
- [ ] No content touching screen edges
- [ ] Sound toggle has margin from edge

### Typography

**Consistency**:
- [ ] All headings use Inter
- [ ] All labels/small text use Geist Mono
- [ ] All body text uses Inter font-light
- [ ] Line heights are comfortable (leading-relaxed)

**Hierarchy**:
- [ ] "Trusted by" is smaller than testimonial quotes
- [ ] FAQ questions are larger than answers
- [ ] Scroll Narrative is prominent but not overpowering

---

## 🐛 Common Issues & Fixes

### Issue: Social Proof doesn't fade in

**Check**:
- [ ] Scrolled far enough down page
- [ ] `whileInView` viewport margin set correctly
- [ ] Framer Motion imported properly

**Fix**: Viewport margin is `-100px` (triggers 100px before element is visible)

### Issue: FAQ animation is jerky

**Check**:
- [ ] Using `AnimatePresence` for enter/exit animations
- [ ] `height: 'auto'` is set (not fixed height)
- [ ] `overflow: hidden` on animation container

**Fix**: Ensure smooth height transition with `easeInOut`

### Issue: Testimonials overlap on mobile

**Check**:
- [ ] `space-y-16` is applied to container
- [ ] `max-w-2xl` is limiting width correctly
- [ ] Padding is present (`px-4`)

**Fix**: Increase spacing or reduce text size on smaller screens

### Issue: Footer links not clickable on mobile

**Check**:
- [ ] Touch targets are at least 44×44px
- [ ] Links are not overlapping
- [ ] Sound toggle not covering links

**Fix**: Adjust sound toggle position or increase link padding

---

## 📊 Performance Testing

### Lighthouse Audit

```bash
# Chrome DevTools → Lighthouse → Run audit
```

**Target scores**:
- Performance: > 95
- Accessibility: ≥ 95
- Best Practices: 100
- SEO: > 90

**What to check**:
- [ ] No layout shift (CLS = 0)
- [ ] All images optimised (if any added)
- [ ] No render-blocking resources
- [ ] Text remains visible during webfont load

### Animation FPS

```bash
# Chrome DevTools → Performance
# Record while scrolling through page
```

**What to check**:
- [ ] Frames stay green (60fps)
- [ ] No red drops (janky frames)
- [ ] Smooth scrolling throughout

---

## ✅ Acceptance Criteria

Before considering Phase 3 complete:

**Visual**:
- [ ] All sections look cohesive with Phase 1 design
- [ ] Spacing feels intentional and calm
- [ ] Typography hierarchy is clear
- [ ] Colour palette is consistent

**Functional**:
- [ ] All animations work smoothly
- [ ] FAQ accordion opens/closes correctly
- [ ] All links work (footer)
- [ ] Keyboard navigation works

**Accessible**:
- [ ] Lighthouse accessibility ≥ 95
- [ ] Keyboard users can access everything
- [ ] Screen readers announce content correctly
- [ ] Colour contrast meets WCAG AA

**Performance**:
- [ ] Lighthouse performance > 95
- [ ] No layout shift
- [ ] Animations run at 60fps
- [ ] Page weight increase < 250 KB

**Mobile**:
- [ ] Works on iPhone 15 Pro (375px)
- [ ] Works on iPad (768px)
- [ ] No horizontal scroll
- [ ] Touch targets are large enough

---

## 🎯 Next Actions

Once testing is complete:

1. **Fix any issues found**
2. **Replace placeholder content** (testimonials, partners)
3. **A/B test** testimonial copy
4. **Monitor analytics** (scroll depth, FAQ engagement)
5. **Move to Phase 4** (if planned)

---

**Last Updated**: 2025-10-26
**Server**: http://localhost:3002/landing
**Status**: Ready for comprehensive testing
