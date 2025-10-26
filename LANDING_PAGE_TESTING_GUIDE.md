# Landing Page Testing Guide

**Quick reference for testing Phase 1 implementation**

---

## 🚀 Quick Start

```bash
cd /Users/chrisschofield/workspace/active/totalaud.io
pnpm dev
# Open http://localhost:3000/landing
```

---

## 🧪 Test Scenarios

### 1. Hero Animation (First 2 seconds)

**What to check**:
- [x] Page loads with dark background (#0F1113)
- [x] Slate Cyan pulse breathes behind title (subtle but visible)
- [x] "totalaud.io" title fades in from bottom
- [x] Tagline words appear one-by-one ("Creative" → "control" → "for" → "artists.")
- [x] "built by..." credit fades in below
- [x] ⌘K hint appears bottom-right (faded)

**Expected timing**:
- 0s: Title starts fading in
- 0.2s: First word of tagline
- 0.45s: All words visible
- 0.6s: Credit appears
- 1.2s: ⌘K hint appears

---

### 2. Magnetic CTA (After 8 seconds)

**What to check**:
- [x] Wait 8 seconds → "Request Access" button fades in
- [x] Hover cursor over button → button smoothly follows cursor
- [x] Move cursor quickly → button spring animation is smooth
- [x] Leave button area → button smoothly returns to center
- [x] Click button → console logs "Request Access clicked"
- [x] Click button (with sound enabled) → hear subtle tone

**Magnetic strength**: 0.25x cursor offset (gentle pull, not aggressive)

---

### 3. Scroll Milestones

**What to check** (scroll down slowly):

| Scroll % | What appears | Analytics event |
|----------|--------------|-----------------|
| 0-20% | Hero visible | `landing_view` (on load) |
| 20% | "plan your release" | `scroll_milestone_reveal1` |
| 35% | "send with precision" | `scroll_milestone_reveal2` |
| 50% | "see what resonates" | `scroll_milestone_reveal3` |
| 65% | Video preview + CTA | `scroll_milestone_proof_section` |

**Check console** for analytics events being tracked.

---

### 4. Responsive Layout

#### Mobile (375px - iPhone 15 Pro)

```bash
# Chrome DevTools → Device Toolbar → iPhone 15 Pro
```

**What to check**:
- [x] Title is readable (smaller size: text-5xl)
- [x] Tagline wraps nicely (text-lg)
- [x] No horizontal scroll
- [x] Video preview stacks above copy (single column)
- [x] CTA button is full-width or centered
- [x] Padding prevents text from touching edges
- [x] All animations still work smoothly

#### Tablet (768px - iPad)

**What to check**:
- [x] Text scales up (md: breakpoints active)
- [x] Grid still single column below 1024px
- [x] Everything readable without zooming

#### Desktop (1440px+)

**What to check**:
- [x] Full cinematic experience
- [x] Video preview and copy side-by-side (2 columns)
- [x] Title is large (text-7xl)
- [x] Magnetic CTA works smoothly
- [x] Pulse effect visible but not distracting

---

### 5. Performance Checks

```bash
# Open Chrome DevTools → Lighthouse
# Run audit on: http://localhost:3000/landing
```

**Target scores**:
- Performance: > 95
- Accessibility: 100
- Best Practices: 100

**Core Web Vitals**:
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): 0 (no layout shifts)
- FID (First Input Delay): < 100ms

**Animation FPS**:
```bash
# Chrome DevTools → Performance
# Record 10 seconds of scrolling + CTA hover
# Check: Frames should stay green (60fps)
```

---

### 6. Accessibility

#### Reduced Motion

**How to test**:
```bash
# macOS: System Settings → Accessibility → Display → Reduce motion
```

**What to check**:
- [x] Animations still work but respect system preference
- [x] Framer Motion automatically reduces animation intensity
- [x] No jarring instant transitions

#### Keyboard Navigation

**What to check**:
- [x] Tab key focuses CTA button
- [x] Enter/Space activates button
- [x] Focus outline is visible
- [x] Scroll with keyboard (arrow keys, space) works

---

### 7. Analytics Verification

#### Local Testing

```javascript
// Open browser console while on landing page

// Should see on page load:
track('landing_view')

// Should see when scrolling to each section:
track('scroll_milestone_reveal1')  // ~20% scroll
track('scroll_milestone_reveal2')  // ~35% scroll
track('scroll_milestone_reveal3')  // ~50% scroll
track('scroll_milestone_proof_section')  // ~65% scroll
```

#### Production (Railway)

1. Deploy to Railway
2. Visit landing page
3. Open Vercel Analytics dashboard
4. Check for events appearing in real-time

---

## 🎥 Adding the Console Preview Video

### 1. Record Screen

**Using macOS QuickTime**:
```bash
# QuickTime Player → File → New Screen Recording
# Select Console window area
# Record 5-7 seconds of workflow:
#   - Create new flow
#   - Spawn agent
#   - Add mission
#   - Watch agent work
# Stop recording → Save
```

### 2. Optimize Video

```bash
# Use HandBrake or ffmpeg to optimize

# With ffmpeg:
ffmpeg -i input.mov \
  -vf scale=1920:1080 \
  -c:v libx264 \
  -crf 28 \
  -preset fast \
  -an \
  apps/aud-web/public/videos/console-preview.mp4

# Target: < 2 MB file size
```

### 3. Enable Video

**File**: `apps/aud-web/src/app/landing/page.tsx`

```tsx
// Find lines 291-300 and uncomment:

<video
  autoPlay
  loop
  muted
  playsInline
  preload="auto"
  className="w-full h-full object-cover"
>
  <source src="/videos/console-preview.mp4" type="video/mp4" />
</video>
```

### 4. Test Video

```bash
pnpm dev
# Visit http://localhost:3000/landing
# Scroll to proof section
# Check: Video plays automatically, loops smoothly
```

---

## 🐛 Troubleshooting

### Video doesn't play

**Check**:
1. File exists at `/public/videos/console-preview.mp4`
2. File size < 2 MB
3. Format is MP4 (H.264 codec)
4. Video element is uncommented
5. Browser console for errors

### Magnetic CTA doesn't follow cursor

**Check**:
1. Browser console for errors
2. Cursor is hovering directly over button
3. JavaScript is enabled
4. Framer Motion loaded successfully

### Analytics not firing

**Check**:
1. `@vercel/analytics` package installed
2. `<Analytics />` component in layout.tsx
3. `track()` function imported correctly
4. Browser console for network requests
5. Ad blocker not blocking analytics

### Mobile layout breaks

**Check**:
1. No fixed widths (use max-width instead)
2. Tailwind responsive classes applied
3. No horizontal overflow (check with DevTools)
4. Text uses responsive sizing (text-lg md:text-2xl)

---

## ✅ Acceptance Criteria

Before moving to Phase 2, verify:

- [x] All 7 test scenarios pass
- [x] Lighthouse Performance > 95
- [x] No console errors
- [x] Works on iPhone, iPad, Desktop
- [x] Analytics events tracked
- [x] Video plays smoothly (once added)
- [x] Magnetic CTA feels natural (not too strong)
- [x] Maintains Mystique minimalism

---

## 🎯 Phase 1 Success

**You'll know Phase 1 is successful when**:

1. Landing page loads in < 2s
2. Animations feel cinematic (not janky)
3. Magnetic CTA makes you want to click it
4. Mobile experience is as good as desktop
5. Analytics dashboard shows real data
6. Console preview video demonstrates value

**Then**: Move to Phase 2 (polish features)

---

**Last Updated**: 2025-10-26
**Questions?** Check [LANDING_PAGE_PHASE_1_COMPLETE.md](LANDING_PAGE_PHASE_1_COMPLETE.md)
