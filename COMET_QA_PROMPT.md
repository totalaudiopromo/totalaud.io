# Comet QA Prompt - totalaud.io Visual & Technical Audit

**Project**: totalaud.io - Cinematic AI Agent Workspace for Music Promotion
**Phase**: 10.4 - Post Design System Unification
**Brand Vision**: Professional, calm, creative-tech aesthetic with honest maker tone

---

## 🎯 Core Vision & Design Philosophy

### Brand Identity
**totalaud.io** is a cinematic workspace for music promotion powered by AI agents. The aesthetic should feel:
- **Professional but not corporate** - Like a high-end creative tool, not enterprise software
- **Calm and intentional** - Operator → Signal journey, not chaotic dashboards
- **Creative-tech fusion** - Music industry meets elegant software design
- **Honest and direct** - No marketing fluff, straight talk to makers

### Visual DNA
- **Colour**: Slate Cyan (#3AA9BE) as the singular accent - professional, calm, creative-tech
- **Background**: Matte Black (#0F1113) - deep charcoal, never pure black
- **Borders**: Sharp 2px borders, zero rounded corners (except intentional exceptions)
- **Typography**: Inter for UI, JetBrains Mono for code, EB Garamond for editorial
- **Motion**: 120ms/240ms/400ms/600ms/800ms rhythm - cinematic, never rushed
- **Copy**: Lowercase, British English, honest maker tone - "no campaigns yet — start one when you've got a plan"

---

## 📋 Visual Audit Checklist

### 1. Colour Consistency
**Check ALL pages for:**

✅ **Primary Accent - Slate Cyan (#3AA9BE)**
- [ ] All interactive elements use Slate Cyan for hover/focus states
- [ ] Active tabs/navigation items highlighted with Slate Cyan
- [ ] Border accents on focus (inputs, buttons, cards)
- [ ] CTA buttons use Slate Cyan background or border
- [ ] Icons and small accent marks use Slate Cyan
- [ ] No other blues present (no generic #0070F3, #3B82F6, etc.)

✅ **Backgrounds**
- [ ] Primary background is Matte Black (#0F1113) - NOT pure black (#000000)
- [ ] Elevated surfaces (cards, panels) use #1A1C1F
- [ ] No white backgrounds except intentional content areas
- [ ] Ambient glows use rgba(58, 169, 190, 0.08) max

✅ **Text Hierarchy**
- [ ] Primary text: #EAECEE (light grey/white)
- [ ] Secondary text: #A0A4A8 (muted grey)
- [ ] Tertiary/hints: rgba(255, 255, 255, 0.5)
- [ ] No pure white (#FFFFFF) text except headings

✅ **Borders**
- [ ] Standard borders: #2C2F33 or rgba(58, 169, 190, 0.25)
- [ ] Active/focus borders: #3AA9BE or rgba(58, 169, 190, 0.4)
- [ ] All borders are 2px solid (sharp, not 1px or soft)
- [ ] Zero border-radius (except intentional design exceptions)

❌ **Should NOT See:**
- Generic blue (#0070F3, #3B82F6, #2563EB)
- Pure black backgrounds (#000000)
- Rounded corners on panels/cards (border-radius > 0)
- American spelling in copy ("color", "behavior", "optimize")
- All-caps aggressive copy
- Emojis in UI copy (only in agent personalities if needed)

---

### 2. Typography Audit

✅ **Font Families**
- [ ] UI text uses Inter (sans-serif stack)
- [ ] Code/console uses JetBrains Mono
- [ ] Landing page hero uses EB Garamond Variable (editorial)
- [ ] No fallback to system fonts showing (check font loading)

✅ **Copy Tone - "Honest Maker"**
- [ ] All UI copy is lowercase (headings, buttons, labels)
- [ ] Direct, concise language - no marketing fluff
- [ ] British English spelling throughout:
  - "colour" not "color"
  - "behaviour" not "behavior"
  - "optimise" not "optimize"
  - "analyse" not "analyze"
  - "organise" not "organize"
- [ ] Empty states feel supportive, not scolding
  - ✅ "no campaigns yet — start one when you've got a plan"
  - ❌ "You haven't created any campaigns yet!"

✅ **Text Sizes & Weights**
- [ ] Base font size: 1rem (16px)
- [ ] Headings: 500-600 weight, not 700+
- [ ] Body text: 400 weight, #EAECEE colour
- [ ] Monospace has proper letter-spacing (0.02em)

---

### 3. Motion & Animation

✅ **Timing Rhythm - Strict Adherence**
- [ ] Fast interactions: 120ms (0.12s) - hover states, micro feedback
- [ ] Normal transitions: 240ms (0.24s) - modals, tab switches
- [ ] Slow fades: 400ms (0.4s) - ambient effects
- [ ] Editorial reveals: 600ms (0.6s) - hero sections
- [ ] Cinematic: 800ms (0.8s) - dramatic full-page transitions
- [ ] Ambient pulse: 12 seconds - background glows

✅ **Easing Curves**
- [ ] Primary easing: cubic-bezier(0.22, 1, 0.36, 1) - soft out
- [ ] Parallax: cubic-bezier(0.32, 0.72, 0, 1) - smooth
- [ ] No linear easing (except reduced motion mode)

✅ **Framer Motion Only**
- [ ] All animations use Framer Motion (NOT CSS transitions)
- [ ] useScroll + useTransform for scroll effects
- [ ] Spring physics for interactive elements
- [ ] No jQuery animations or other libraries

❌ **Should NOT See:**
- Instant transitions (0ms) except Operator theme
- Slow animations (>1s) except deliberate cinematic moments
- Linear easing curves
- Janky CSS transitions
- Motion sickness-inducing parallax (too fast/extreme)

---

### 4. Component-Specific Checks

### **ThemeSelectorV2** (Phase 10.3.5)
- [ ] No text overlapping in theme cards
- [ ] Each theme has distinct visual cue:
  - **Operator**: Cyan accent bar on left edge
  - **Guide**: Step dots (• • •) below text
  - **Map**: Grid background pattern
  - **Timeline**: Horizontal track lanes
  - **Tape**: Faint grain texture
- [ ] Keyboard navigation works (↑↓ or j/k, Enter)
- [ ] Active theme highlighted with Slate Cyan border
- [ ] Posture hints visible on hover/active
- [ ] Confirmation message appears on selection

### **CreateCampaignModal** (Phase 10.3.5)
- [ ] Modal opens with 240ms animation
- [ ] Sharp 2px borders (no rounded corners)
- [ ] Form fields have focus states with Slate Cyan
- [ ] Validation errors in British English
- [ ] Submit button uses Slate Cyan
- [ ] "⌘/ctrl + enter to submit · esc to close" hint visible
- [ ] Success sound plays on submit
- [ ] Modal backdrop is blur + black/60% opacity

### **Console Dashboard**
- [ ] CampaignProvider wraps entire console
- [ ] Plan / Do / Track / Learn tabs visible
- [ ] Active tab highlighted with Slate Cyan
- [ ] 12s ambient pulse glow visible in background
- [ ] Theme selector button in top-right
- [ ] Presence avatars show if collaborators online
- [ ] Status bar shows "session active" with pulse
- [ ] All panels use 2px Slate Cyan borders

### **Campaign Flow (Plan → Do → Track → Learn)**
- [ ] **Plan Tab**:
  - "Create Campaign" button opens modal
  - Empty state: "no campaigns yet — start one when you've got a plan"
  - Campaign cards show after creation
  - Cards use hover states with Slate Cyan border
- [ ] **Do Tab**:
  - Shows active campaign in header: "campaign: [Release] by [Artist]"
  - Empty state: "create a campaign in plan tab to start running workflows"
  - Workflow cards visible when campaign active
- [ ] **Track Tab**:
  - Active campaign info in header
  - Empty state: "create a campaign in plan tab to view metrics"
  - Metrics display with proper hierarchy
- [ ] **Learn Tab**:
  - Header shows: "insights for [Release] by [Artist]"
  - Demo insights display correctly
  - Copy uses lowercase, honest tone

### **Landing Page** (Phase 10.3)
- [ ] WisprFlow scroll animation working smoothly
- [ ] Cinematic scroll effects (useScroll + useTransform)
- [ ] Hero text uses EB Garamond editorial font
- [ ] Slate Cyan accents throughout
- [ ] No white flash on load
- [ ] Smooth parallax (not nauseating)
- [ ] CTA buttons use magnetic hover effect

---

### 5. Console Errors & Technical Issues

**Open Browser DevTools Console and check for:**

❌ **Should NOT See:**
- React hydration errors
- Missing component warnings
- Failed prop type checks
- 404 errors for assets/fonts
- CORS errors
- Unhandled promise rejections
- Memory leaks (check Performance tab)
- Layout shift warnings (CLS issues)

✅ **Expected Warnings (OK to ignore):**
- Supabase realtime connection logs
- Next.js Fast Refresh notices
- Experimental features notices

**Network Tab:**
- [ ] All fonts loading (Inter, JetBrains Mono, EB Garamond)
- [ ] No failed requests (except expected API calls)
- [ ] Images optimized (WebP where possible)
- [ ] No blocking resources

**Performance Tab:**
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No long tasks blocking main thread
- [ ] Smooth 60fps animations

---

### 6. Accessibility (WCAG AA Minimum)

✅ **Colour Contrast**
- [ ] Primary text (#EAECEE) on background (#0F1113): ≥ 4.5:1
- [ ] Secondary text (#A0A4A8) on background: ≥ 4.5:1
- [ ] Slate Cyan (#3AA9BE) against Matte Black: ≥ 3:1 (large text)
- [ ] Interactive elements have visible focus states

✅ **Keyboard Navigation**
- [ ] All interactive elements reachable via Tab
- [ ] Focus indicators visible (Slate Cyan border)
- [ ] Modal traps focus (can't Tab outside)
- [ ] Escape closes modals
- [ ] Arrow keys work in theme selector

✅ **Screen Reader**
- [ ] Alt text on images
- [ ] ARIA labels on icon-only buttons
- [ ] Semantic HTML (h1, h2, nav, main, etc.)
- [ ] Form labels associated with inputs

✅ **Reduced Motion**
- [ ] Animations respect prefers-reduced-motion
- [ ] No vestibular triggers (extreme parallax)
- [ ] Content still usable with animations off

---

### 7. Responsive Design

**Mobile (< 768px):**
- [ ] Console stacks vertically (sidebar → bottom tabs)
- [ ] Theme selector cards stack in single column
- [ ] Modals fill screen width with padding
- [ ] Text remains readable (no tiny fonts)
- [ ] Touch targets ≥ 44x44px

**Tablet (768px - 1024px):**
- [ ] Grid layouts adjust (3 columns → 2 columns)
- [ ] Sidebar remains visible
- [ ] Modals centred and max-width constrained

**Desktop (> 1024px):**
- [ ] Full 3-column grid (sidebar, main, insights)
- [ ] Theme selector shows 5 cards in optimal layout
- [ ] No content wider than 1600px (max-width constraint)

---

### 8. Browser Compatibility

**Test in:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Known Issues (Document if found):**
- Safari CSS Grid bugs
- Firefox Flexbox quirks
- Edge Web Audio API support

---

## 🐛 Common Issues to Check For

### **From Previous Phases:**
- [x] ThemeSelectorV2 text overlap → Should be fixed (Phase 10.3.5)
- [x] Theme cards all look the same → Should be fixed (distinct cues)
- [x] Campaign creation inert → Should be fixed (modal working)
- [x] Console tabs disconnected → Should be fixed (CampaignContext)
- [x] Generic copy → Should be fixed (honest maker tone)

### **New Issues to Watch For:**
- [ ] Design system imports not working (check `/design-system/` files)
- [ ] Old token imports still in use (should use new design-system)
- [ ] Colour mismatches between old/new system
- [ ] TypeScript errors in console
- [ ] Missing sound feedback on interactions
- [ ] Theme switching breaks state

---

## 📊 Scoring Rubric

### **Visual Design (40 points)**
- Colour consistency (10 pts)
- Typography adherence (10 pts)
- Border/spacing consistency (10 pts)
- Motion timing correctness (10 pts)

### **Functionality (30 points)**
- Campaign creation flow works (10 pts)
- Theme selection works (10 pts)
- Tab navigation + context sharing (10 pts)

### **Technical Quality (20 points)**
- No console errors (10 pts)
- Good performance (5 pts)
- Accessibility basics (5 pts)

### **Brand Alignment (10 points)**
- Honest maker tone (5 pts)
- British English throughout (5 pts)

**Total: 100 points**
- 90-100: Excellent - Ship it
- 75-89: Good - Minor fixes needed
- 60-74: Fair - Significant issues
- <60: Needs major work

---

## 📝 Report Template

```markdown
## totalaud.io QA Report - [Date]

**Tester**: [Name]
**Browser**: [Chrome 120 / Firefox 121 / Safari 17]
**Viewport**: [1920x1080 / 1440x900 / Mobile]
**Score**: [X/100]

### Visual Design [X/40]
- Colour consistency: [X/10] - [Notes]
- Typography: [X/10] - [Notes]
- Borders/spacing: [X/10] - [Notes]
- Motion timing: [X/10] - [Notes]

### Functionality [X/30]
- Campaign flow: [X/10] - [Notes]
- Theme selection: [X/10] - [Notes]
- Tab navigation: [X/10] - [Notes]

### Technical Quality [X/20]
- Console errors: [X/10] - [List any errors]
- Performance: [X/5] - [FCP, TTI, CLS scores]
- Accessibility: [X/5] - [Issues found]

### Brand Alignment [X/10]
- Tone: [X/5] - [Examples]
- British English: [X/5] - [Spelling errors found]

### Critical Issues
1. [Issue description + screenshot]
2. [Issue description + screenshot]

### Minor Issues
1. [Issue description]
2. [Issue description]

### Suggestions
1. [Enhancement idea]
2. [Enhancement idea]

### Screenshots
[Attach screenshots of issues]
```

---

## 🎯 Priority Checks (Start Here)

### **5-Minute Quick Audit:**
1. Open http://localhost:3000/ → Check landing page loads with Slate Cyan
2. Navigate to /console → Check all 4 tabs visible
3. Click "Create Campaign" → Modal opens, form validates
4. Submit campaign → Shows in Plan tab
5. Switch to Do/Track/Learn → Campaign info shows in header

### **15-Minute Deep Dive:**
1. Visit each theme studio → Check distinct visual cues
2. Test keyboard navigation → Tab, Enter, Escape
3. Check browser console → Note any errors
4. Test responsive → Resize window, check mobile
5. Verify copy → All lowercase, British English

### **30-Minute Full Audit:**
1. Complete all checklist items above
2. Test in 2+ browsers
3. Run Lighthouse audit
4. Check accessibility with screen reader
5. Document issues with screenshots

---

**Key Principle**: If it doesn't feel like a premium creative tool that respects the user's time and intelligence, it needs work. totalaud.io should feel like **Linear meets Ableton meets a really good terminal** - not like generic SaaS.

