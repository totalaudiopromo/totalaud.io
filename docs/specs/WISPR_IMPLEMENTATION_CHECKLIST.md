# Wispr Flow Implementation Checklist

**Based on**: [WISPR_FLOW_ANALYSIS.md](WISPR_FLOW_ANALYSIS.md)
**Purpose**: Actionable code changes with file paths and line numbers
**Status**: Ready to implement

---

## Phase 1: Quick Wins (2 hours) 🚀

**Priority**: Immediate conversion improvements

---

### ✅ 1. Add Sticky Header CTA (1 hour)

**File**: `apps/aud-web/src/app/landing/page.tsx`
**Location**: After line 163 (before hero section)

**Code to Add**:
```typescript
{/* Sticky Header - Persistent CTA */}
<motion.header
  className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0F1113]/90 border-b border-[#2A2F33]/50"
  initial={{ y: -100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 1, duration: 0.4, ease: easeCubic }}
>
  <div className="flex justify-between items-center px-8 py-3 max-w-7xl mx-auto">
    <motion.span
      className="text-[#3AA9BE] text-sm font-medium tracking-wide"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      totalaud.io
    </motion.span>
    <motion.button
      onClick={() => {
        setIsWaitlistOpen(true)
        playCTATone()
        track('cta_click', { location: 'sticky_header' })
      }}
      className="text-sm text-[#3AA9BE] border border-[#3AA9BE]/60 px-4 py-2 rounded-md
        hover:bg-[#3AA9BE]/10 transition-colors duration-120"
      style={{ fontFamily: 'var(--font-geist-mono)' }}
      whileHover={{
        boxShadow: '0 0 20px rgba(58, 169, 190, 0.2)',
        borderColor: 'rgba(58, 169, 190, 1)',
      }}
      whileTap={{ scale: 0.98 }}
    >
      Request Access →
    </motion.button>
  </div>
</motion.header>
```

**Testing**:
- [ ] Header fades in after 1 second
- [ ] Backdrop blur works on scroll
- [ ] CTA click opens waitlist modal
- [ ] Analytics tracking fires with `location: 'sticky_header'`
- [ ] Mobile responsive (test on 375px width)

---

### ✅ 2. Rewrite Hero Copy (30 min)

**File**: `apps/aud-web/src/app/landing/page.tsx`
**Location**: Lines 190-260 (hero section)

**Current Code** (line 196-200):
```typescript
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: easeCubic }}
  className="text-[#3AA9BE] text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-6"
  style={{ fontFamily: 'var(--font-inter)', letterSpacing: '-0.01em' }}
>
  totalaud.io
</motion.h1>
```

**New Code** (replace lines 222-250):
```typescript
{/* Main headline */}
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: easeCubic }}
  className="text-[#3AA9BE] text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-4"
  style={{ fontFamily: 'var(--font-inter)', letterSpacing: '-0.01em' }}
>
  totalaud.io
</motion.h1>

{/* Subheadline - Wispr Flow style */}
<motion.p
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.2, ease: easeCubic }}
  className="text-[#E5E7EB] text-2xl md:text-3xl font-light tracking-wide mb-3"
  style={{ fontFamily: 'var(--font-inter)' }}
>
  For people who still send their own emails.
</motion.p>

{/* Supporting copy */}
<motion.p
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8, delay: 0.4, ease: easeCubic }}
  className="text-[#A0A4A8] text-base md:text-lg font-light italic"
  style={{ fontFamily: 'var(--font-inter)' }}
>
  The promotion workspace built by someone who actually uses it.
</motion.p>
```

**Testing**:
- [ ] Text renders with correct stagger delays
- [ ] British spelling: "optimise" not "optimize" (check all copy)
- [ ] Mobile text sizes scale correctly
- [ ] Light sweep animation still works (line 203-219)

---

### ✅ 3. Add Micro-Glow to CTA (15 min)

**File**: `apps/aud-web/src/app/landing/page.tsx`
**Location**: Line 345 (magnetic CTA button)

**Current Code**:
```typescript
<motion.button
  style={{
    x: ctaXSpring,
    y: ctaYSpring,
    fontFamily: 'var(--font-geist-mono)',
  }}
  className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-[#3AA9BE]/60 text-[#3AA9BE] rounded-md
    hover:bg-[#3AA9BE]/10 transition-colors
    text-sm font-medium tracking-wide"
  // ... (mouse move handlers)
>
```

**New Code** (add whileHover):
```typescript
<motion.button
  style={{
    x: ctaXSpring,
    y: ctaYSpring,
    fontFamily: 'var(--font-geist-mono)',
  }}
  className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-[#3AA9BE]/60 text-[#3AA9BE] rounded-md
    text-sm font-medium tracking-wide"
  whileHover={{
    backgroundColor: 'rgba(58, 169, 190, 0.12)',
    borderColor: 'rgba(58, 169, 190, 1)',
    boxShadow: '0 0 24px rgba(58, 169, 190, 0.25)',
  }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.24, ease: easeCubic }}
  // ... (mouse move handlers)
>
```

**Testing**:
- [ ] Glow appears on hover (240ms fade)
- [ ] Magnetic effect still works (spring physics)
- [ ] Border brightens to full opacity
- [ ] Background tint subtle (0.12 opacity)

---

### ✅ 4. Add Privacy Badge to Footer (15 min)

**File**: `apps/aud-web/src/components/layout/LandingFooter.tsx`
**Location**: Before final closing `</footer>` tag

**Code to Add**:
```typescript
{/* Privacy & Trust Signal */}
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
  className="border-t border-[#2A2F33]/50 pt-8 mt-8 text-center"
>
  <p className="text-[#6B7280] text-sm mb-2 flex items-center justify-center gap-2">
    <span>🔒</span>
    <span>Your data stays yours. We don't sell contact lists.</span>
  </p>
  <p className="text-[#4B5563] text-xs opacity-60">
    Built for creators, by creators since 2019.
  </p>
</motion.div>
```

**Testing**:
- [ ] Fades in on scroll into view
- [ ] Lock emoji renders correctly
- [ ] Text legible on Matte Black background
- [ ] Mobile text wraps properly

---

## Phase 2: Medium Effort (4 hours) 🎨

**Priority**: High-impact UX/emotion improvements

---

### ✅ 5. Add Editorial Serif Font (1 hour)

**Step 1**: Install font package
```bash
cd apps/aud-web
pnpm add @fontsource/playfair-display
# OR for more editorial feel:
pnpm add @fontsource-variable/eb-garamond
```

**Step 2**: Import in layout
**File**: `apps/aud-web/src/app/layout.tsx`
**Location**: After line 5 (Inter import)

```typescript
import '@fontsource-variable/eb-garamond'
// OR
import '@fontsource/playfair-display/400.css'
import '@fontsource/playfair-display/700.css'
```

**Step 3**: Add to CSS variables
**File**: `apps/aud-web/src/app/globals.css`
**Location**: In `:root` section

```css
:root {
  --font-inter: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-geist-mono: 'JetBrains Mono', 'Geist Mono', monospace;
  --font-editorial: 'EB Garamond Variable', 'Playfair Display', Georgia, serif; /* NEW */
}
```

**Step 4**: Apply to hero headline only
**File**: `apps/aud-web/src/app/landing/page.tsx`
**Location**: Line 196 (hero h1)

```typescript
<motion.h1
  // ... (motion props)
  className="text-[#F9FAFB] text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-4"
  style={{ fontFamily: 'var(--font-editorial)', letterSpacing: '-0.02em' }}
>
  totalaud.io
</motion.h1>
```

**Testing**:
- [ ] Serif font loads correctly
- [ ] Headline feels editorial (not corporate)
- [ ] Line height adjusted for serif (1.1 → 1.15 if needed)
- [ ] Mobile rendering smooth (check iOS Safari)

**Note**: Only use serif for:
- Hero headline
- Section headlines (Testimonials, SocialProof)
- Emotional quotes

Keep Inter for:
- Body copy
- CTAs
- Navigation
- All UI elements

---

### ✅ 6. Slow Down Motion Durations (1 hour)

**File 1**: `apps/aud-web/src/packages/ui/tokens/motion.ts`

**Current Code**:
```typescript
export const motionTokens = {
  fast: '120ms cubic-bezier(0.22, 1, 0.36, 1)',
  normal: '240ms cubic-bezier(0.22, 1, 0.36, 1)',
  slow: '400ms ease-in-out',
  glow: 'text-shadow: 0 0 40px rgba(58, 169, 190, 0.15)',
}
```

**New Code**:
```typescript
export const motionTokens = {
  fast: '120ms cubic-bezier(0.22, 1, 0.36, 1)',    // Keep for micro-interactions
  normal: '400ms cubic-bezier(0.22, 1, 0.36, 1)',  // Was 240ms - slow down
  slow: '600ms ease-in-out',                        // Was 400ms - slow down
  editorial: '800ms cubic-bezier(0.22, 1, 0.36, 1)', // NEW - for hero/testimonials
  glow: 'text-shadow: 0 0 40px rgba(58, 169, 190, 0.15)',
}
```

**File 2**: `apps/aud-web/src/components/sections/ScrollFlow.tsx`
**Location**: Lines 38-51 (phrase transitions)

**Current Code** (phrase 1):
```typescript
const opacity1 = useTransform(scrollYProgress, [0.0, 0.1, 0.25, 0.35], [0, 1, 1, 0])
```

**New Code** (slower fade-in):
```typescript
const opacity1 = useTransform(scrollYProgress, [0.0, 0.15, 0.25, 0.35], [0, 1, 1, 0])
// Fade takes 15% of scroll instead of 10% - feels more breathing
```

**Apply to all 3 phrases**:
```typescript
// Phrase 1
const opacity1 = useTransform(scrollYProgress, [0.0, 0.15, 0.25, 0.35], [0, 1, 1, 0])

// Phrase 2
const opacity2 = useTransform(scrollYProgress, [0.3, 0.45, 0.6, 0.7], [0, 1, 1, 0])

// Phrase 3
const opacity3 = useTransform(scrollYProgress, [0.65, 0.8, 0.9, 0.98, 1.0], [0, 1, 1, 0, 0])
```

**File 3**: `apps/aud-web/src/components/sections/Testimonials.tsx`
**Location**: Line 39 (transition duration)

**Current**:
```typescript
transition={{ delay: index * 0.2, duration: 0.6, ease: easeCubic }}
```

**New**:
```typescript
transition={{ delay: index * 0.2, duration: 0.8, ease: easeCubic }}
```

**Testing**:
- [ ] ScrollFlow phrases feel more "breathing" (not rushed)
- [ ] Testimonials fade in with editorial grace
- [ ] No jarring speed changes between sections
- [ ] Reduced motion preference still respected

---

### ✅ 7. Create IntegrationProof Component (1.5 hours)

**Step 1**: Create new component
**File**: `apps/aud-web/src/components/sections/IntegrationProof.tsx` (NEW)

```typescript
/**
 * IntegrationProof - Ecosystem Trust Signals
 *
 * Shows integration breadth (Wispr Flow pattern: "Works with Slack, Notion...")
 * Reduces friction for agency clients who need workflow compatibility.
 */

'use client'

import { motion } from 'framer-motion'

const integrations = [
  { name: 'Spotify for Artists', category: 'Analytics' },
  { name: 'Fuga', category: 'Distribution' },
  { name: 'Notion', category: 'Workspace' },
  { name: 'Gmail', category: 'Email' },
  { name: 'Google Calendar', category: 'Scheduling' },
  { name: 'Claude AI', category: 'Automation' },
]

const easeCubic = [0.22, 1, 0.36, 1] as const

export function IntegrationProof() {
  return (
    <section className="py-16 border-t border-[#2A2F33]/80">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: easeCubic }}
        className="text-center text-[#6B7280] text-xs uppercase tracking-wider mb-10"
        style={{ fontFamily: 'var(--font-geist-mono)' }}
      >
        Works with your workflow
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: easeCubic }}
        className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto px-4"
      >
        {integrations.map((integration, index) => (
          <motion.div
            key={integration.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.4, ease: easeCubic }}
            whileHover={{
              borderColor: 'rgba(58, 169, 190, 0.4)',
              backgroundColor: 'rgba(58, 169, 190, 0.05)',
            }}
            className="px-5 py-3 border border-[#2A2F33] text-[#A0A4A8] text-sm rounded-md
              transition-colors duration-240 cursor-default flex flex-col items-center gap-1"
          >
            <span className="font-medium">{integration.name}</span>
            <span className="text-xs text-[#6B7280] opacity-60">{integration.category}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Optional: "See all integrations →" link */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-center mt-8"
      >
        <a
          href="/integrations" // TODO: Create integrations page
          className="text-[#3AA9BE] text-sm hover:underline"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          See all integrations →
        </a>
      </motion.div>
    </section>
  )
}
```

**Step 2**: Add to landing page
**File**: `apps/aud-web/src/app/landing/page.tsx`
**Location**: After line 383 (after ThemeSlider, before Testimonials)

```typescript
import { IntegrationProof } from '@aud-web/components/sections/IntegrationProof'

// ...

{/* Phase 4: Interactive Showcase */}
<ThemeSlider />

{/* NEW: Integration Ecosystem Proof */}
<IntegrationProof />

<Testimonials />
```

**Testing**:
- [ ] Badges stagger on scroll into view
- [ ] Hover states work (border glow)
- [ ] Mobile wrapping handles 2-3 badges per row
- [ ] "See all integrations →" link styles correctly

---

### ✅ 8. Add Mid-Scroll Testimonial Overlay (30 min)

**File**: `apps/aud-web/src/components/sections/ScrollFlow.tsx`
**Location**: Inside sticky viewport (after phrase 3, before closing div)

**Code to Add** (line 133, before `</div>` at line 147):
```typescript
{/* Mid-scroll testimonial - appears at 0.35 progress */}
<motion.blockquote
  style={{
    opacity: useTransform(scrollYProgress, [0.32, 0.38, 0.45, 0.52], [0, 1, 1, 0]),
    y: useTransform(scrollYProgress, [0.32, 0.38], [20, 0]),
  }}
  className="fixed bottom-16 left-1/2 -translate-x-1/2 text-center max-w-xl px-4 z-20 will-change-transform"
>
  <p
    className="text-[#A0A4A8] text-sm md:text-base italic leading-relaxed mb-2"
    style={{ fontFamily: 'var(--font-inter)' }}
  >
    "This changes how we pitch radio. It's the first tool that feels designed by someone who's done it."
  </p>
  <footer
    className="text-[#6B7280] text-xs"
    style={{ fontFamily: 'var(--font-geist-mono)' }}
  >
    — Tom R, Radio Plugger
  </footer>
</motion.blockquote>
```

**Testing**:
- [ ] Quote fades in at 32% scroll progress
- [ ] Fades out completely before phrase 2 appears
- [ ] Readable on Matte Black background
- [ ] Mobile positioning works (bottom-16, px-4)

---

## Phase 3: Polish (2 hours) ✨

**Priority**: Refinement for maximum emotional impact

---

### ✅ 9. Hero Testimonial Rotation (1 hour)

**File**: `apps/aud-web/src/app/landing/page.tsx`
**Location**: After hero subline (new section)

**Step 1**: Add testimonial quotes array (top of component)
```typescript
const heroTestimonials = [
  { quote: 'The first tool that feels designed by someone who's done it.', author: 'Tom R' },
  { quote: 'Feels like a creative DAW for promotion — fast and strangely calming.', author: 'Lisa D' },
  { quote: 'This changes how we pitch radio.', author: 'Chris S' },
]
```

**Step 2**: Add rotation state
```typescript
const [testimonialIndex, setTestimonialIndex] = useState(0)

useEffect(() => {
  const interval = setInterval(() => {
    setTestimonialIndex((prev) => (prev + 1) % heroTestimonials.length)
  }, 8000) // Rotate every 8 seconds
  return () => clearInterval(interval)
}, [])
```

**Step 3**: Add AnimatePresence quote component (after hero copy, line 260)
```typescript
{/* Rotating testimonial quote */}
<AnimatePresence mode="wait">
  <motion.blockquote
    key={testimonialIndex}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.6, ease: easeCubic }}
    className="mt-12 max-w-md mx-auto text-center"
  >
    <p
      className="text-[#A0A4A8] text-sm italic leading-relaxed"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      "{heroTestimonials[testimonialIndex].quote}"
    </p>
    <footer
      className="mt-2 text-[#6B7280] text-xs"
      style={{ fontFamily: 'var(--font-geist-mono)' }}
    >
      — {heroTestimonials[testimonialIndex].author}
    </footer>
  </motion.blockquote>
</AnimatePresence>
```

**Testing**:
- [ ] Quote rotates every 8 seconds
- [ ] Fade transition smooth (600ms)
- [ ] No layout shift on rotation
- [ ] Mobile readable (max-w-md constrains width)

---

### ✅ 10. Microcopy Tone Audit (30 min)

**Goal**: Replace tech jargon with calm confidence

**Files to Update**:

#### File 1: `apps/aud-web/src/components/sections/SocialProof.tsx`
**Line 28**: Change "Trusted by" → "Used by real creators"

**Before**:
```typescript
<p className="text-sm uppercase tracking-widest text-neutral-500 mb-6">
  Trusted by
</p>
```

**After**:
```typescript
<p className="text-sm uppercase tracking-widest text-neutral-500 mb-6">
  Used by real creators
</p>
```

---

#### File 2: `apps/aud-web/src/components/layout/LandingFooter.tsx`
**Location**: Footer text section

**Before** (if generic):
```typescript
<p>© 2025 Totalaud.io. All rights reserved.</p>
```

**After** (calm confidence):
```typescript
<p className="text-[#6B7280] text-sm">
  Ready when you are. Built with care since 2019.
</p>
```

---

#### File 3: `apps/aud-web/src/components/ui/FAQAccordion.tsx`
**Location**: FAQ answers (check for jargon)

**Replace**:
- "Leverage our platform" → "Use the workspace"
- "Optimise your workflow" → "Simplify your workflow"
- "Utilise advanced features" → "Use the tools you need"

---

#### File 4: `apps/aud-web/src/app/landing/page.tsx`
**Line 336**: Change "now in private beta" → "ready for real campaigns"

**Before**:
```typescript
<p className="text-[#6B7280] text-xs tracking-wider uppercase">
  now in private beta
</p>
```

**After**:
```typescript
<p className="text-[#6B7280] text-xs tracking-wider uppercase">
  ready for real campaigns
</p>
```

**Testing**:
- [ ] All copy uses British spelling
- [ ] No corporate jargon ("leverage", "utilise", "optimise")
- [ ] Tone feels honest and grounded
- [ ] CTAs still clear and actionable

---

### ✅ 11. Mobile Responsiveness Check (30 min)

**Devices to Test**:
- iPhone 12/13/14 (390px width)
- iPhone SE (375px width)
- iPad (768px width)

**Checklist**:

#### Sticky Header
- [ ] CTA button doesn't wrap text
- [ ] Logo + CTA fit on 375px width
- [ ] Backdrop blur works on iOS Safari
- [ ] Header doesn't cover hero text

#### Hero Section
- [ ] Serif headline scales correctly (text-5xl → text-3xl on mobile)
- [ ] "For people who..." subline readable (text-2xl → text-xl)
- [ ] Rotating testimonial fits within viewport
- [ ] Light sweep animation doesn't cause horizontal scroll

#### ScrollFlow
- [ ] Phrases centred on all devices
- [ ] Mid-scroll testimonial readable (bottom-16 → bottom-8 if needed)
- [ ] Velocity blur doesn't impact performance

#### Console Preview Section
- [ ] Video aspect ratio preserved
- [ ] Magnetic CTA doesn't jump on mobile (reduce spring strength)
- [ ] Two-column layout stacks on mobile (lg:grid-cols-2)

#### Integration Badges
- [ ] Badges wrap to 2-3 per row on mobile
- [ ] Text doesn't truncate (integration names)
- [ ] Hover states disabled on touch (pointer-fine media query)

#### Footer
- [ ] Privacy badge text wraps correctly
- [ ] Sound toggle (⌘M) positioned correctly on mobile

**File**: `apps/aud-web/src/app/landing/page.tsx`
**Mobile-Specific Adjustments**:
```typescript
// Example: Reduce magnetic strength on mobile
const springConfig = useMediaQuery('(pointer: fine)')
  ? { damping: 15, stiffness: 150 }
  : { damping: 25, stiffness: 100 } // Less aggressive on touch
```

---

## Analytics Tracking Updates

**File**: `apps/aud-web/src/app/landing/page.tsx`

**New Tracking Events to Add**:
```typescript
// Sticky header CTA
track('cta_click', { location: 'sticky_header' })

// Integration badges hover (optional)
track('integration_hover', { name: integration.name })

// Testimonial rotation view
track('testimonial_rotate', { index: testimonialIndex })

// Mid-scroll testimonial view
track('scroll_milestone_mid_testimonial') // at 0.35 progress
```

**Existing Events** (verify still working):
```typescript
track('landing_view')                      // On mount
track('scroll_milestone_reveal1')          // 0.2 progress
track('scroll_milestone_reveal2')          // 0.35 progress
track('scroll_milestone_reveal3')          // 0.5 progress
track('scroll_milestone_proof_section')    // 0.65 progress
track('cta_click', { location: 'hero' })
track('cta_click', { location: 'footer' })
track('waitlist_signup_success')
```

---

## Final Pre-Launch Checklist

### Before Pushing to Production

- [ ] All British spelling verified (colour, behaviour, optimise, etc.)
- [ ] No console errors or warnings
- [ ] Lighthouse score: 90+ Performance, 100 Accessibility
- [ ] Mobile tested on real devices (not just DevTools)
- [ ] Analytics events firing correctly (check Vercel Analytics)
- [ ] Waitlist modal opens from all 3 CTAs (sticky, hero, footer)
- [ ] Sound toggle (⌘M) works correctly
- [ ] Serif font loads without FOIT (Flash of Invisible Text)
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Privacy badge wording approved by legal/Chris
- [ ] Integration names accurate (Spotify for Artists vs. Spotify)

### A/B Test Setup (Optional)

**Test 1: Hero Copy**
- Variant A: "For people who still send their own emails."
- Variant B: "Marketing that moves like music."
- Metric: CTA click rate (sticky header + hero)

**Test 2: Testimonial Placement**
- Variant A: Rotating quote in hero
- Variant B: Static quote after ScrollFlow
- Metric: Scroll depth to proof section

**Test 3: Integration Badges**
- Variant A: With integration badges
- Variant B: Without integration badges
- Metric: Waitlist signup conversion rate

**File**: Use Vercel Edge Config or custom feature flags

---

## Success Metrics Tracking

### Before Wispr Flow (Baseline)
- **Scroll depth**: 40% reach proof section
- **CTA click rate**: 5-8%
- **Time to first CTA**: 8 seconds (delayed reveal)
- **Testimonial engagement**: Low (too far down page)

### After Wispr Flow (Target)
- **Scroll depth**: 60% reach proof section (+50%)
- **CTA click rate**: 12-15% (+87%)
- **Time to first CTA**: <3 seconds (sticky header)
- **Testimonial engagement**: High (above fold rotation)

### How to Track
```typescript
// Add to landing page analytics
useEffect(() => {
  const unsubscribe = scrollYProgress.on('change', (progress) => {
    // Existing milestones
    if (progress > 0.2 && !scrollMilestones.reveal1) {
      setScrollMilestones((prev) => ({ ...prev, reveal1: true }))
      track('scroll_milestone_reveal1')
    }

    // NEW: Track proof section engagement
    if (progress > 0.65 && !scrollMilestones.proof) {
      setScrollMilestones((prev) => ({ ...prev, proof: true }))
      track('scroll_milestone_proof_section', {
        time_on_page: Date.now() - pageLoadTime,
        testimonial_views: testimonialIndex + 1,
      })
    }
  })

  return () => unsubscribe()
}, [scrollYProgress, scrollMilestones, testimonialIndex])
```

---

## Implementation Timeline

| Phase | Task | Time | Priority |
|-------|------|------|----------|
| 1 | Sticky header CTA | 1h | 🔥 Critical |
| 1 | Hero copy rewrite | 30m | 🔥 Critical |
| 1 | CTA micro-glow | 15m | 🔥 Critical |
| 1 | Privacy badge | 15m | 🔥 Critical |
| 2 | Editorial serif font | 1h | 🎨 High |
| 2 | Motion duration slowdown | 1h | 🎨 High |
| 2 | IntegrationProof component | 1.5h | 🎨 High |
| 2 | Mid-scroll testimonial | 30m | 🎨 High |
| 3 | Hero testimonial rotation | 1h | ✨ Polish |
| 3 | Microcopy tone audit | 30m | ✨ Polish |
| 3 | Mobile responsiveness | 30m | ✨ Polish |
| **Total** | | **8 hours** | |

**Recommended Approach**:
1. Complete Phase 1 in one session (2h)
2. Ship to staging, gather feedback
3. Complete Phase 2 over 2 sessions (2h each)
4. Complete Phase 3 for final polish (2h)
5. A/B test hero copy variants

---

## Next Steps

1. **Review this checklist** with team/Chris
2. **Prioritise Phase 1** (sticky header + copy rewrite)
3. **Create feature branch**: `feature/wispr-flow-landing-enhancements`
4. **Implement systematically** (don't skip testing steps)
5. **Track metrics** before/after each phase
6. **Iterate based on data** (A/B test hero variants)

**Questions?** See [WISPR_FLOW_ANALYSIS.md](WISPR_FLOW_ANALYSIS.md) for strategic context.

---

**Document Status**: Ready for implementation
**Last Updated**: 26 October 2025
**Total Estimated Time**: 8 hours across 3 phases
