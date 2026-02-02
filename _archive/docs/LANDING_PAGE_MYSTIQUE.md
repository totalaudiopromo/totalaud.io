# Landing Page: "Mystique" Edition - Complete

**Date**: 2025-10-25
**URL**: `/landing`
**Status**: ✅ Complete with ambient sound + analytics hooks

## 🎭 Philosophy (3-sentence summary)

This landing page embodies **restraint as power**: it reveals just enough to spark curiosity, never enough to satisfy it. Every element—from the pulsing Slate Cyan glow to the 8-second CTA delay—is designed to make visitors **feel** the product's confidence rather than read about it. It's a transmission from the future, not a sales pitch.

**Aesthetic**: Ableton × Linear × Future Nostalgia

---

## ✅ What Was Built

**File**: [apps/aud-web/src/app/landing/page.tsx](apps/aud-web/src/app/landing/page.tsx)

A cinematic reveal landing page that feels like **a signal from the future of music tools**.

---

## 🎬 Page Structure

### 1. **Hero - The Transmission**

**What it shows**:
- Dark matte background (#0F1113)
- Pulsing Slate Cyan glow (3s loop, 0.05-0.1 opacity)
- "totalaud.io" in large Slate Cyan text
- "Creative control for artists." tagline
- "BUILT BY THE TEAM BEHIND TOTAL AUDIO PROMO" micro-caption
- Subtle ⌘K hint (bottom right, 30% opacity)

**Motion**:
- 800ms fade-in with cubic-bezier easing
- Staggered reveals (0ms → 200ms → 600ms → 1200ms)
- Parallax scroll effect (hero fades as you scroll)

**Typography**:
- Hero: Inter, 72px, light weight, Slate Cyan
- Tagline: Inter, 24px, light weight
- Caption: Geist Mono, 13px, uppercase, muted grey

---

### 2. **Scroll-Based Reveal Sequence**

**3 horizontal bands, each one sentence**:

1. **"plan your release"**
   - Reveals at 10-30% scroll
   - 60px font, light weight
   - Parallax fade-up effect

2. **"send with precision"**
   - Reveals at 25-45% scroll
   - Same styling as above

3. **"see what resonates"**
   - Reveals at 40-60% scroll
   - Plus subtitle: "your campaign, in flow."
   - Subtitle in muted grey, 30px

**Motion Grammar**:
- Fade-up: 100px → 0px
- Duration: 240ms
- Easing: cubic-bezier(0.22, 1, 0.36, 1)
- Opacity: 0 → 1

---

### 3. **Visual Proof Strip**

**Split screen layout**:

**Left**: Console preview placeholder
- Aspect ratio: 16:9
- Background: #1A1D21
- Border: 1px solid #2A3744
- Rounded corners
- Currently shows: "Console Preview" placeholder
- **TODO**: Replace with 6s looping mp4 of Console UI

**Right**: Copy + CTA
- "the creative workspace built from real promotion work."
- "NOW IN PRIVATE BETA" (Geist Mono, micro text)
- **CTA**: "Request Access →" button
  - Appears after 8 seconds
  - Slate Cyan border
  - Hover: fills with Slate Cyan
  - Geist Mono font
  - Smooth 800ms fade-in

**Motion**:
- Reveals at 55-75% scroll
- Both sides parallax together

---

### 4. **Cross-Brand Tag**

**Copy**:
```
TOTAL AUDIO PROMO → TOTALAUD.IO
from practical to poetic.
```

**Styling**:
- Geist Mono, 12px
- Uppercase, wide letter-spacing
- Muted grey (#6B7280)
- "from practical to poetic." even more muted (#4B5563)

---

### 5. **Footer**

Minimal:
```
© 2025 TOTAL AUDIO STUDIO
```

- Geist Mono, 12px
- Top border: 1px solid #1E2933
- Centered text

---

## 🎨 Motion Grammar

| Element | Type | Duration | Easing |
|---------|------|----------|--------|
| Line reveal | fade-up | 240ms | cubic-bezier(0.22, 1, 0.36, 1) |
| Section transition | parallax + opacity | smooth | same |
| CTA entrance | fade-in-delay | 800ms | same |
| Background pulse | loop | 3s | ease-in-out |
| Hero parallax | scroll-linked | instant | smooth |

---

## ✨ Enhancements (Added)

### 1. **Ambient Sound System** ✅

**Features**:
- Single sine tone (880Hz, 80ms duration, -20 LUFS)
- Plays on CTA reveal (8-second mark)
- Toggle with **⌘M** (muted by default)
- Sound indicator in footer (🔇/🔊 + ⌘M hint)
- Web Audio API implementation
- Auto-initializes on first interaction

**Why it works**:
- Subtle sonic feedback without being intrusive
- Reinforces the "transmission" metaphor
- Respects user control (muted by default)
- Professional LUFS levels (-20 LUFS)

### 2. **Scroll Analytics Tracking** ✅

**Milestones tracked**:
- 20% scroll → Reveal 1 ("plan your release")
- 35% scroll → Reveal 2 ("send with precision")
- 50% scroll → Reveal 3 ("see what resonates")
- 65% scroll → Proof section reached

**Implementation**:
```typescript
// TODO hooks ready for:
// - Supabase: INSERT INTO landing_views (milestone, timestamp)
// - Vercel Analytics: track('scroll_milestone_reveal1')
// - PostHog: posthog.capture('scroll_milestone_reveal1')
```

**Why it matters**:
- Understand where visitors drop off
- A/B test copy effectiveness
- Measure engagement depth
- Optimize scroll pacing

### 3. **Sound Toggle UI** ✅

- Bottom-left footer indicator
- Emoji: 🔇 (muted) / 🔊 (unmuted)
- ⌘M keyboard hint
- Subtle opacity (30% muted, 100% unmuted)

### 4. **Social Card OG Image** ✅

**File**: [apps/aud-web/src/app/api/og/landing/route.tsx](apps/aud-web/src/app/api/og/landing/route.tsx)

**Features**:
- Dynamic OG image generation using Vercel OG Image API
- 1200×630px (optimal for Twitter/Facebook/LinkedIn)
- Matches landing page aesthetic (Slate Cyan + dark background)
- Includes brand, tagline, and micro-caption
- Subtle radial glow effect
- Accent line (bottom-right corner)

**Meta Tags Added**:
```typescript
openGraph: {
  title: 'totalaud.io - Creative control for artists',
  description: 'The creative workspace built from real promotion work.',
  images: [{ url: '/api/og/landing', width: 1200, height: 630 }],
  locale: 'en_GB',
}
twitter: {
  card: 'summary_large_image',
  images: ['/api/og/landing'],
}
```

**Share URLs**:
- `/api/og/landing` - Auto-generated image endpoint
- Meta tags in [apps/aud-web/src/app/landing/layout.tsx](apps/aud-web/src/app/landing/layout.tsx)

**Why it works**:
- Share-ready for social media
- Maintains mystique aesthetic
- Professional 1200×630 standard
- Dynamic (can update via code)

---

## 📐 Copy Rules (Applied)

✅ **2-4 words per headline** - "plan your release", "send with precision"
✅ **No bullet lists** - All prose, no lists
✅ **No prices** - No mention of pricing
✅ **Speak in verbs** - plan, send, see (all verbs)
✅ **No "AI"** - Intelligence is implicit, not marketed
✅ **One link only** - "Request Access" (after 8 seconds)

---

## 🎯 What This Achieves

| Trait | Result |
|-------|--------|
| **Clarity** | Moderate (intentionally mysterious) |
| **Curiosity** | High (people will ask "what is this?") |
| **Conversion** | Invite-driven (not direct sales) |
| **Tone** | Studio/Brand (not product marketing) |
| **Emotion** | Inspiration + belonging |
| **Virality** | High (people will screenshot it) |

---

## 🧪 Technical Implementation

### Scroll-Linked Animations

Uses Framer Motion's `useScroll` with `useTransform`:

```typescript
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ['start start', 'end end'],
})

// Parallax hero
const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100])
const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

// Reveal sections
const reveal1Y = useTransform(scrollYProgress, [0.1, 0.3], [100, 0])
const reveal1Opacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1])
```

### Timing

- **Hero fade-in**: 0-1.2s (staggered)
- **CTA delay**: 8s (builds anticipation)
- **Scroll reveals**: Smooth parallax (0.1-0.75 scroll position)
- **Pulse**: 3s infinite loop

### Colours

- **Background**: #0F1113 (matte black)
- **Text primary**: #E5E7EB (light grey)
- **Text muted**: #6B7280 (medium grey)
- **Text extra muted**: #4B5563 (dark grey)
- **Accent**: #3AA9BE (Slate Cyan)
- **Borders**: #1E2933, #2A3744

---

## 📊 Success Metrics

**Landing page is successful when**:

- [ ] People ask "what is totalaud.io?" (curiosity)
- [ ] Screenshots shared on social media (virality)
- [ ] "Request Access" clicks > 15% (conversion)
- [ ] Average time on page > 45s (engagement)
- [ ] Bounce rate < 40% (retention)

---

## 🚀 Next Steps

### Immediate (Phase 2)

1. **Replace Console Preview Placeholder**
   - Record 6s looping mp4 of Console UI
   - Show Mission Stack → Activity Stream → Insight Panel
   - Add to `/public/videos/console-preview.mp4`
   - Update component to use `<video>` tag

2. **Add Console Previews for Each Reveal**
   - "plan your release" → Flow Studio preview
   - "send with precision" → Mission Stack preview
   - "see what resonates" → Insight Panel preview
   - Each as 6s silent loops

3. **Wire Up "Request Access" CTA**
   - Create `/api/subscribe` route
   - Connect to Mailchimp or ConvertKit
   - Collect email + name
   - Show success toast
   - Redirect to `/console?invite_pending=true`

### Optional Enhancements

**Cursor Easter Egg**:
- Type "open studio" in hidden input
- Triggers Console preview modal
- Preview shows real product without sign-up

**Invite Key Entry**:
- Click "Request Access" → modal opens
- "Enter invite code ▌" input
- Validates against collaboration_invites table
- Auto-logs in if valid

**Hover Motion**:
- Slate Cyan accent line follows cursor
- 2px delay (smooth trail effect)
- Only on desktop (touch detection)

**Sound Interaction**:
- Soft sine ping on scroll milestones
- Volume: -20 LUFS
- Frequency: 880Hz (single tone)
- Duration: 80ms
- Muted by default, toggle via ⌘M

---

## 📁 Files Created

**Created** (4 files):
- [apps/aud-web/src/app/landing/page.tsx](apps/aud-web/src/app/landing/page.tsx) - Main landing page with ambient sound
- [apps/aud-web/src/app/landing/layout.tsx](apps/aud-web/src/app/landing/layout.tsx) - Layout wrapper + OG meta tags
- [apps/aud-web/src/app/api/og/landing/route.tsx](apps/aud-web/src/app/api/og/landing/route.tsx) - OG image generation API

**Documentation**:
- `LANDING_PAGE_MYSTIQUE.md` - This file

**Lines of Code**: ~350 lines total

---

## 🎨 Visual Verification

**Screenshots captured**:
- Hero section with Slate Cyan pulse
- "plan your release" reveal
- "send with precision" reveal
- "see what resonates" + tagline
- Visual proof strip (placeholder)

**All animations smooth**: ✅
- Hero parallax working
- Scroll reveals fading correctly
- CTA delayed entrance (8s) working
- Background pulse subtle and continuous

---

## 🧭 Usage

**Development**:
```bash
cd apps/aud-web
pnpm dev

# Navigate to:
http://localhost:3000/landing
```

**Production URL** (when deployed):
```
https://totalaud.io/landing
or
https://totalaud.io/ (set as root)
```

---

## 💡 Design Philosophy

**"Mystique" Edition Principles**:

✅ **Confidence over explanation** - Show, don't tell
✅ **Emotion over features** - Feel creative control
✅ **Mystery over clarity** - Curiosity drives engagement
✅ **Minimalism over detail** - Less is more
✅ **Motion over static** - Living, breathing page
✅ **British English** - "visualise", "colour", "optimise"

**Tone**: Calm. Technical. Confident. A little mysterious.

---

## 🎯 Comparison: Before & After

| Aspect | Traditional Landing | Mystique Landing |
|--------|---------------------|------------------|
| **Headlines** | 10+ words, feature-focused | 2-4 words, verb-focused |
| **CTAs** | 3-5 buttons everywhere | 1 button (delayed 8s) |
| **Copy** | Paragraphs, bullet lists | Single sentences |
| **Imagery** | Screenshots, mockups | Looping cinematic UI |
| **Emotion** | Utility, productivity | Inspiration, belonging |
| **Conversion** | Direct sales | Invite-driven curiosity |
| **Social** | Standard sharing | Screenshot-worthy design |

---

## ✨ Final Notes

**This landing page is a statement**, not a pitch.

It says:
- "We're different."
- "We're confident."
- "We're worth your curiosity."
- "Join us, if you get it."

It's designed to create **FOMO** (fear of missing out) and **word-of-mouth buzz** ("have you seen totalaud.io?").

Perfect for:
- Private beta launches
- Brand reputation building
- Design portfolio showcase
- Viral social sharing

---

**Last Updated**: 2025-10-25
**Status**: ✅ Complete - Ready for Console video integration
**Next**: Record 6s Console UI loops and replace placeholders

