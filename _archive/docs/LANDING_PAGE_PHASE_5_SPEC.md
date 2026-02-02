# Landing Page Phase 5 - Launch-Ready Polish

**Date**: 2025-10-26
**Status**: Planning - Ready to implement
**Previous Phase**: Phase 4.5 Complete (Cinematic Scroll Flow)
**Goal**: Transform prototype into reference-grade launch experience

---

## 🎯 Phase 5 Philosophy

**"Flow in the Details"** - Polish that turns motion into mystique

We've built the cinematic foundation. Now we add:
- **Micro-delights** that reward attention
- **Performance** that keeps 60fps
- **Depth cues** that create spatial storytelling
- **Invisible analytics** that measure without intruding
- **Typographic refinement** that matches console UI quality

**Reference Standard**: motion.dev × Linear × Ableton Live

---

## 🧩 1. Micro-Delight Layer

### 1.1 Magnetic Cursor Hotspot Grid ⭐

**Priority**: High
**Effort**: 30 min
**Description**: Low-intensity magnetic pull over CTA + video preview

**Implementation**:
```tsx
// Extend existing CursorFloatingTarget
<CursorFloatingTarget strength={0.12} radius={120}>
  <motion.button className="cta-button">
    Request Access
  </motion.button>
</CursorFloatingTarget>
```

**Areas to magnetise**:
- ✅ Console preview (already done, strength 0.08)
- 🔲 "Request Access" CTA button
- 🔲 Theme slider navigation dots
- 🔲 FAQ accordion items (subtle, strength 0.05)

---

### 1.2 Dynamic Light Sweep ⭐

**Priority**: High
**Effort**: 1 hour
**Description**: Slow cyan "light pass" across hero headline every 12s

**Implementation**:
```tsx
// Add to hero section
<motion.div
  className="absolute inset-0 pointer-events-none"
  style={{
    background: 'linear-gradient(90deg, transparent 0%, #3AA9BE 50%, transparent 100%)',
    opacity: 0.08,
  }}
  animate={{
    x: ['-100%', '200%'],
  }}
  transition={{
    duration: 12,
    repeat: Infinity,
    ease: 'linear',
  }}
/>
```

**Specs**:
- Colour: Slate Cyan (#3AA9BE) at 8% opacity
- Duration: 12s (matches pulsing glow cycle)
- Blur: 60px
- Direction: Left → Right
- Respects: `prefers-reduced-motion`

---

### 1.3 Scroll-Synced Accent Audio ⚙️

**Priority**: Medium (optional)
**Effort**: 1 hour
**Description**: Short hi-passed whoosh on section thresholds (muted by default)

**Implementation**:
- Already have `useScrollSound` hook
- Add hi-passed sine sweep (880 Hz → 220 Hz, 200ms)
- Triggers at: 0%, 25%, 50%, 75% scroll depth
- Volume: -24 LUFS (very subtle)
- Default: Muted, toggled with ⌘M

**Audio specs**:
```typescript
// Whoosh sound on section entry
const playWhoosh = () => {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  filter.type = 'highpass'
  filter.frequency.value = 400

  oscillator.frequency.setValueAtTime(880, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.2)

  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.05)
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)

  oscillator.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start()
  oscillator.stop(ctx.currentTime + 0.2)
}
```

---

### 1.4 Subtle Background Grain/Noise Layer ⚙️

**Priority**: Medium
**Effort**: 20 min
**Description**: Prevents "flatness" in large black areas

**Implementation**:
```tsx
// Add to globals.css
@layer base {
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url('/noise.png');
    opacity: 0.015;
    pointer-events: none;
    z-index: 9999;
  }
}
```

**Noise specs**:
- Size: 512×512 tileable PNG
- Opacity: 1.5% (very subtle)
- Blend mode: normal
- Generate with: Canvas API or use existing grain texture

---

## ⚡ 2. Performance & Comfort Audit

### 2.1 Performance Targets

| Metric | Desktop Target | Mobile Target | Tool |
|--------|---------------|---------------|------|
| **FPS consistency** | ≥ 60 fps | ≥ 45 fps | Chrome DevTools → Performance |
| **Memory usage** | ≤ 200 MB | ≤ 150 MB | Chrome → System |
| **LCP** | ≤ 2.5s | ≤ 3.0s | Lighthouse |
| **CLS** | ≤ 0.1 | ≤ 0.1 | Lighthouse |
| **TTI** | ≤ 3.5s | ≤ 5.0s | Lighthouse |
| **Reduced motion** | All pulses/blur off | All pulses/blur off | DevTools → Rendering |

---

### 2.2 Performance Optimisations

**If FPS dips below target**:

1. **Pre-compute transforms with useMemo**:
```tsx
const transforms = useMemo(() => ({
  y1: useTransform(scrollYProgress, [0.0, 0.15, 0.3], [0, 0, -100]),
  opacity1: useTransform(scrollYProgress, [0.0, 0.15, 0.3], [1, 1, 0]),
}), [scrollYProgress])
```

2. **Lazy-load heavy components**:
```tsx
const ThemeSlider = dynamic(() => import('@/components/sections/ThemeSlider'), {
  loading: () => <div className="h-screen" />,
  ssr: false,
})
```

3. **Reduce parallax layer complexity**:
- Remove ambient parallax if < 45fps on mobile
- Disable velocity blur on low-end devices

4. **Optimise video previews**:
- Use poster images for initial load
- Lazy-load video with IntersectionObserver
- Use webp/avif for poster images

---

### 2.3 Reduced Motion Compliance

**Current status**: ✅ Pulse animation disabled
**Required additions**:

```css
@media (prefers-reduced-motion: reduce) {
  .text-glow,
  .cursor-floating-target,
  .light-sweep,
  .velocity-blur {
    animation: none !important;
    filter: none !important;
    transition: none !important;
  }
}
```

**Test with**: Chrome DevTools → Rendering → Emulate CSS prefers-reduced-motion

---

## 🧱 3. Layout Depth & Transitions

### 3.1 Scroll Spine Line

**Concept**: SVG path connecting phrases vertically (ties narrative together)

**Implementation**:
```tsx
<svg className="absolute left-8 top-0 h-full w-1 opacity-10">
  <motion.path
    d="M 0 0 L 0 100%"
    stroke="#3AA9BE"
    strokeWidth="1"
    strokeDasharray="8 12"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 2, ease: 'easeInOut' }}
  />
</svg>
```

**Specs**:
- Position: Left edge, 2rem from edge
- Colour: Slate Cyan at 10% opacity
- Style: Dashed (8px dash, 12px gap)
- Animation: Draws from top to bottom over 2s

---

### 3.2 Fade-Through Blur Transitions

**Concept**: Replace hard fades with blur-enhanced transitions

**Implementation**:
```tsx
// Update opacity transforms to include blur
const opacity1 = useTransform(
  scrollYProgress,
  [0.0, 0.15, 0.25, 0.3],
  [1, 1, 0.3, 0]
)
const blur1 = useTransform(
  scrollYProgress,
  [0.0, 0.15, 0.25, 0.3],
  ['0px', '0px', '1px', '2px']
)

// Apply to phrase
<motion.h2
  style={{
    opacity: opacity1,
    filter: `blur(${blur1})`,
  }}
>
```

**Result**: Phrases "dissolve" rather than "fade"

---

### 3.3 Z-Depth Parallax on Headings

**Concept**: Subtle 3D perception through depth layering

**Implementation**:
```tsx
// Add z-transform to phrases
const z1 = useTransform(scrollYProgress, [0.0, 0.15], [0, -50])
const z2 = useTransform(scrollYProgress, [0.2, 0.35], [50, 0])
const z3 = useTransform(scrollYProgress, [0.4, 0.55], [50, 0])

<motion.h2
  style={{
    transform: `translateZ(${z1}px)`,
    transformStyle: 'preserve-3d',
  }}
>
```

**Specs**:
- Range: -50px to +50px (subtle depth)
- Parent: `perspective: 1000px`
- Entrance: Start at +50px (behind), move to 0 (centre)
- Exit: Move to -50px (in front), then fade

---

### 3.4 Footer CTA Animated Entry

**Concept**: CTA springs into view with glow ripple

**Implementation**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 40, scale: 0.95 }}
  whileInView={{ opacity: 1, y: 0, scale: 1 }}
  transition={{
    duration: 0.8,
    ease: [0.22, 1, 0.36, 1],
    delay: 0.2
  }}
  viewport={{ once: true, amount: 0.5 }}
>
  <motion.button
    whileHover={{
      boxShadow: '0 0 40px rgba(58, 169, 190, 0.4)',
    }}
  >
    Request Access
  </motion.button>
</motion.div>
```

---

## 🧪 4. Analytics & Feedback

### 4.1 Scroll Depth Tracking

**Events to track**:
```typescript
// Add to existing milestone tracking
if (progress > 0.25 && !scrollMilestones.depth25) {
  track('scroll_depth_25')
  setScrollMilestones(prev => ({ ...prev, depth25: true }))
}
if (progress > 0.5 && !scrollMilestones.depth50) {
  track('scroll_depth_50')
  setScrollMilestones(prev => ({ ...prev, depth50: true }))
}
if (progress > 0.75 && !scrollMilestones.depth75) {
  track('scroll_depth_75')
  setScrollMilestones(prev => ({ ...prev, depth75: true }))
}
```

---

### 4.2 Interaction Tracking

**Events**:
- `cta_click` - "Request Access" button
- `console_demo_open` - Modal opened
- `console_demo_close` - Modal closed
- `theme_slider_prev` - Previous theme
- `theme_slider_next` - Next theme
- `faq_open` - FAQ item expanded
- `sound_toggle` - ⌘M pressed

---

### 4.3 User Preferences Tracking

**Insights**:
```typescript
// Track reduced motion adoption
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  track('prefers_reduced_motion', { enabled: true })
}

// Track colour scheme preference
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  track('prefers_dark_mode', { enabled: true })
}
```

**Privacy**: No PII, fully anonymous, GDPR-compliant

---

## 🎨 5. Typography & Composition Pass

### 5.1 Typographic Refinement

| Element | Current | Refined | Reasoning |
|---------|---------|---------|-----------|
| **Hero headline** | `font-medium text-7xl tracking-tight` | `font-medium text-7xl tracking-tight leading-[1.1] tracking-[-0.01em]` | Tighter vertical rhythm, slight negative tracking |
| **Hero subheading** | `Inter 400 text-lg` | `Geist Sans 400 italic text-lg` | Adds humanity, softer feel |
| **Scroll phrases** | `font-light text-6xl tracking-tight` | Keep as-is (sentence case is calmer) | Already optimal |
| **Footer tagline** | `Geist Mono sm` | `Geist Mono 500 uppercase text-xs` | Stronger hierarchy |

---

### 5.2 Composition Updates

**Hero section**:
```tsx
<h1 className="text-[#3AA9BE] text-7xl font-medium tracking-tight leading-[1.1] tracking-[-0.01em]">
  totalaud.io
</h1>
<p className="text-[#E5E7EB] text-lg font-light italic" style={{ fontFamily: 'var(--font-geist-sans)' }}>
  Creative control for artists.
</p>
```

**Footer**:
```tsx
<p className="text-[#6B7280] text-xs font-medium uppercase tracking-wider" style={{ fontFamily: 'var(--font-geist-mono)' }}>
  Built by the team behind Total Audio Promo
</p>
```

---

## 🧠 6. Cinematic Timing Map

### Current Scroll Timeline (200vh)

| Scene | Range | Focus | Duration | Status |
|-------|-------|-------|----------|--------|
| **Intro** | 0-15% | Hero + Pulse | ~2s scroll | ✅ Complete |
| **Transition 1** | 0-30% | "plan your release" | ~2s scroll | ✅ Complete |
| **Transition 2** | 20-50% | "send with precision" | ~2.5s scroll | ✅ Complete |
| **Transition 3** | 40-70% | "see what resonates" | ~2.5s scroll | ✅ Complete |
| **Outro** | 55-100% | "your campaign, in flow." | ~3s scroll | ✅ Complete |

**Cross-fade overlaps**: ✅ Already implemented (10-15% overlap on each phrase)

---

### Enhanced Timing (Phase 5)

**Add easing offsets for cinematic continuity**:

```tsx
// Enhanced phrase 1 with overlap blur
const opacity1 = useTransform(
  scrollYProgress,
  [0.0, 0.12, 0.25, 0.3],  // Extended fade-out
  [1, 1, 0.4, 0]
)
const blur1 = useTransform(
  scrollYProgress,
  [0.0, 0.25, 0.3],
  ['0px', '1px', '3px']
)
```

**Result**: Phrases "cross-fade" with blur instead of hard replace

---

## 📦 7. Content Expansion (Optional Phase 5.2)

### 7.1 Interactive Theme Preview

**Status**: ✅ Already implemented (ThemeSlider component)

**Enhancement ideas**:
- Add keyboard navigation (arrow keys to change theme)
- Auto-play on hover (3s delay)
- Theme colour preview dots below slider

---

### 7.2 Collaborator Ticker

**Concept**: "Trusted by artists from..." infinite loop

**Implementation**:
```tsx
<motion.div
  className="flex gap-8 overflow-hidden"
  animate={{ x: [0, -1000] }}
  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
>
  {['BBC Radio 1', 'Spotify', 'NTS', 'Rinse FM'].map(name => (
    <span key={name} className="text-[#6B7280] text-sm whitespace-nowrap">
      {name}
    </span>
  ))}
</motion.div>
```

**Note**: Keep typographic (no logos) to maintain mystique

---

### 7.3 Mini FAQ Accordion

**Status**: ✅ Already implemented (FAQAccordion component)

**Current**: 4 questions
**Suggested**: Keep minimal, maximum 3 essential questions:
1. "How do I get access?"
2. "What makes this different?"
3. "Do I need technical skills?"

---

### 7.4 Contrarian Tagline

**Concept**: "Built with AI, not for AI" angle

**Placement**: Hero subheading or footer
**Example**:
```tsx
<p className="text-[#6B7280] text-sm italic">
  Built with AI. Made for artists, not algorithms.
</p>
```

---

## 🧾 8. Housekeeping & Documentation

### 8.1 Documentation Updates

- [x] Create LANDING_PAGE_PHASE_5_SPEC.md (this document)
- [ ] Update LANDING_PAGE_ALL_PHASES_SUMMARY.md with Phase 5 status
- [ ] Add performance screenshots to LANDING_PAGE_PHASE_4.5_COMPLETE.md
- [ ] Record 6-second cinematic video loop for social share previews

---

### 8.2 Video Assets Required

**Console Preview** (Primary CTA):
- Duration: 5-7 seconds
- Resolution: 1920×1080
- Format: H.264 MP4, ≤ 2MB
- Content: Real workflow (spawn agent → flow canvas → insight)
- Loop: Seamless

**Theme Videos** (ThemeSlider):
- 5 videos (ASCII, XP, Aqua, DAW, Analogue)
- Duration: 8-12 seconds each
- Resolution: 1920×1080
- Format: H.264 MP4, ≤ 2MB each
- Loop: Seamless

**Social Share Preview**:
- Duration: 6 seconds
- Resolution: 1920×1080 (cropped to 1200×630 for OG)
- Format: MP4 + WebM fallback
- Content: Hero → ScrollFlow phrases → CTA

---

### 8.3 Config Updates

**Update CLAUDE.md**:
```markdown
## Current Phase
- **Active**: Phase 5 - Launch-Ready Polish
- **Status**: In Progress
- **Previous**: Phase 4.5 Complete (Cinematic Scroll Flow)
```

---

## 🚀 Phase 5 Implementation Order

### Immediate (1-2 hours)

**Priority: Critical**
1. [ ] Wire up "Request Access" CTA (hook to waitlist API)
2. [ ] Add mobile breakpoints (test on iPhone/Android)
3. [ ] Record console preview video (or create placeholder loop)
4. [ ] Performance audit (Lighthouse + Chrome DevTools)

---

### Short-term (Phase 5.1 - 4-6 hours)

**Priority: High**
1. [ ] Magnetic CTA + cursor glow
2. [ ] Dynamic light sweep on hero
3. [ ] Typography refinement pass
4. [ ] Scroll spine line
5. [ ] Fade-through blur transitions
6. [ ] Footer CTA animated entry
7. [ ] Background grain/noise layer

---

### Medium-term (Phase 5.2 - Optional)

**Priority: Medium**
1. [ ] Z-depth parallax on headings
2. [ ] Scroll-synced accent audio (whoosh)
3. [ ] Collaborator ticker
4. [ ] Analytics implementation
5. [ ] Social share preview video

---

## ✅ Success Criteria

**Phase 5 is complete when**:

### Performance
- [x] Desktop: ≥ 60fps during scroll
- [ ] Mobile: ≥ 45fps during scroll
- [ ] Lighthouse Performance: ≥ 90
- [ ] Lighthouse Accessibility: ≥ 95
- [ ] Memory: ≤ 200 MB desktop, ≤ 150 MB mobile

### User Experience
- [ ] All CTAs wired to real endpoints
- [ ] Mobile experience polished (320px → 1920px)
- [ ] Reduced motion preferences respected
- [ ] No layout shift (CLS ≤ 0.1)

### Polish
- [ ] Micro-delights feel natural (not gimmicky)
- [ ] Typography feels cohesive
- [ ] Depth cues enhance spatial storytelling
- [ ] Analytics invisibly track key metrics

### Launch Readiness
- [ ] All videos exported and optimised
- [ ] Social share previews ready (OG image/video)
- [ ] Documentation complete
- [ ] Performance budgets met

---

**Result**: A landing page that feels like a **product from the future**, not a marketing page.

---

**Last Updated**: 2025-10-26
**Status**: Specification complete - Ready for implementation
**Next Steps**: Begin with Immediate tasks (CTA wiring + mobile breakpoints)
