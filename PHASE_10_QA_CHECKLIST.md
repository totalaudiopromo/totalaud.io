# Phase 10 QA Checklist - Page Links

**Project**: totalaud.io
**Live URL**: https://aud-web-production.up.railway.app
**Local Dev**: http://localhost:3000

---

## 🏠 Main Pages

### Landing & Marketing
- **Landing Page**: [/](https://aud-web-production.up.railway.app/)
  - Check: Cinematic scroll flow, WisprFlow integration
  - Check: Slate Cyan (#3AA9BE) accent throughout
  - Check: Phase 10.3 scroll animations working

- **Landing Alt**: [/landing](https://aud-web-production.up.railway.app/landing)
  - Check: Same as above (may be duplicate route)

---

## 🎨 Theme Selector & Onboarding

### OS Selector (Theme Selection)
- **Theme Selection Page**: [/studio/operator](https://aud-web-production.up.railway.app/studio/operator)
  - Check: ThemeSelectorV2 with distinct visual cues
  - Check: Operator theme - Cyan accent bar
  - Check: No text overlapping
  - Check: Keyboard navigation (↑↓ or j/k, Enter to confirm)

### Individual Theme Studios
- **Operator Theme**: [/studio/operator](https://aud-web-production.up.railway.app/studio/operator)
  - Check: Instant transitions (0ms)
  - Check: Square wave sounds
  - Check: Sharp, snappy feel

- **Guide Theme**: [/studio/guide](https://aud-web-production.up.railway.app/studio/guide)
  - Check: Step dots visual cue
  - Check: 400ms ease-in transitions
  - Check: Sine wave sounds

- **Map Theme**: [/studio/map](https://aud-web-production.up.railway.app/studio/map)
  - Check: Grid background lines
  - Check: 600ms parallax transitions
  - Check: Triangle wave sounds

- **Timeline Theme**: [/studio/timeline](https://aud-web-production.up.railway.app/studio/timeline)
  - Check: Horizontal track lanes
  - Check: 240ms slide-in transitions
  - Check: Sawtooth wave sounds

- **Tape Theme**: [/studio/tape](https://aud-web-production.up.railway.app/studio/tape)
  - Check: Faint grain texture
  - Check: 800ms fade transitions
  - Check: Gentle sine wave sounds

---

## 🎛️ Console / Workspace

### Main Console
- **Console Dashboard**: [/console](https://aud-web-production.up.railway.app/console)
  - Check: CampaignProvider wrapping the layout
  - Check: Theme selector button (top-right)
  - Check: Plan / Do / Track / Learn tabs
  - Check: Matte Black background (#0F1113)
  - Check: Slate Cyan borders and accents
  - Check: 12s ambient pulse cycle

### Console Tabs (must be logged in)
- **Plan Tab**: `/console` (default tab: Plan)
  - Check: "Create Campaign" button opens modal
  - Check: CreateCampaignModal with form validation
  - Check: Empty state: "no campaigns yet — start one when you've got a plan"
  - Check: Campaign cards display after creation
  - Check: British English copy (lowercase, direct tone)

- **Do Tab**: `/console` (switch to Do tab)
  - Check: Shows active campaign info
  - Check: "campaign: [Release] by [Artist]" header
  - Check: Empty state: "create a campaign in plan tab to start running workflows"
  - Check: Workflow cards visible when campaign active

- **Track Tab**: `/console` (switch to Track tab)
  - Check: Active campaign metrics display
  - Check: "track performance" header
  - Check: Empty state: "create a campaign in plan tab to view metrics"
  - Check: Campaign context visible in header

- **Learn Tab**: `/console` (switch to Learn tab)
  - Check: Insights scoped to active campaign
  - Check: "insights for [Release] by [Artist]" when campaign active
  - Check: Demo insights display
  - Check: Copy uses lowercase, honest maker tone

---

## 🎨 Theme Demo
- **Theme Demo Page**: [/theme-demo](https://aud-web-production.up.railway.app/theme-demo)
  - Check: All 5 themes switch correctly
  - Check: Visual differences between themes
  - Check: Sound feedback on theme changes

---

## ✅ Visual Parity Checks (Phase 10.3.5)

### Campaign Creation Flow
1. **Open Console** → `/console`
2. **Click "Create Campaign"** → Modal opens
3. **Fill form**:
   - Release: "New Single"
   - Artist: "Test Artist"
   - Genre: "Electronic"
   - Goals: "BBC Radio 1, Spotify"
4. **Submit** → Success sound plays
5. **Check Plan tab** → Campaign card appears
6. **Switch to Do tab** → Campaign info shows in header
7. **Switch to Track tab** → Campaign info shows in header
8. **Switch to Learn tab** → Campaign info shows in header

### Theme Selector Visual Checks
1. **Open any theme page** → e.g., `/studio/operator`
2. **Check theme cards** → No overlapping text
3. **Hover over each theme** → Distinct visual cues appear:
   - Operator: Cyan bar on left
   - Guide: Step dots below
   - Map: Grid lines visible
   - Timeline: Horizontal track
   - Tape: Grain texture
4. **Use keyboard navigation** → ↑↓ or j/k to move, Enter to select
5. **Check confirmation** → "[Theme] selected — initialising environment..."

---

## 🎨 Design System Verification

### Colour Consistency
Check these elements use Slate Cyan (#3AA9BE):
- [ ] Console header border
- [ ] Active tab highlight
- [ ] Button hover states
- [ ] Focus borders on inputs
- [ ] Theme selector active indicator
- [ ] Campaign card hover borders
- [ ] Accent text throughout

### Motion Timing
Check these animations follow the rhythm:
- [ ] Modal open/close: 240ms (0.24s)
- [ ] Hover effects: 120ms (0.12s)
- [ ] Tab switching: 240ms (0.24s)
- [ ] Theme selection: 240ms (0.24s)
- [ ] Ambient pulse: 12s cycle

### Typography
Check British English spelling in:
- [ ] Empty states ("colour" not "color")
- [ ] Button labels (lowercase, direct)
- [ ] Modal copy ("behaviour" not "behavior")
- [ ] Error messages ("optimise" not "optimize")

---

## 🐛 Known Issues to Verify Fixed

### Phase 10.3.5 Fixes
- [x] ThemeSelectorV2 text overlap → Fixed with min-height
- [x] Theme cards all look the same → Fixed with distinct visual cues
- [x] Campaign creation inert → Fixed with working modal
- [x] Console tabs disconnected → Fixed with CampaignContext
- [x] Generic copy → Fixed with honest maker tone

### Phase 10.4 Additions
- [x] Design system centralised → `/src/design-system/` created
- [x] All tokens unified → colors, motion, sounds, typography
- [x] Import pattern ready → `import { colors } from '@/design-system'`

---

## 📱 Mobile Testing (Optional)

### Responsive Breakpoints
- **Mobile (< 768px)**:
  - [/](https://aud-web-production.up.railway.app/) - Landing responsive
  - [/console](https://aud-web-production.up.railway.app/console) - Console stacks vertically

- **Tablet (768px - 1024px)**:
  - Check: Grid layouts adjust
  - Check: Theme selector modal remains centred

---

## 🎯 Critical Path Test

**Complete User Journey:**
1. **Visit landing page** → [/](https://aud-web-production.up.railway.app/)
2. **Navigate to console** → [/console](https://aud-web-production.up.railway.app/console)
3. **Select theme** → Click theme button, choose theme
4. **Create campaign** → Fill modal, submit
5. **Navigate tabs** → Plan → Do → Track → Learn
6. **Verify campaign context** → Shows in Do/Track/Learn headers
7. **Check visual consistency** → Slate Cyan throughout, no colour mismatches

---

## 🔍 Quick Visual Audit

### Should See Everywhere:
✅ Matte Black background (#0F1113)
✅ Slate Cyan accent (#3AA9BE)
✅ Sharp 2px borders (no rounded corners)
✅ Inter font for UI text
✅ JetBrains Mono for code/technical UI
✅ Lowercase copy (honest maker tone)
✅ British English spelling

### Should NOT See:
❌ Generic blue accents
❌ Rounded corners (except where intentional)
❌ American English spelling ("color", "behavior")
❌ All-caps aggressive copy
❌ White flash on page load
❌ Overlapping text in theme selector

---

## 📝 Test Results Template

```markdown
## Test Session: [Date]

**Tester**: [Your Name]
**Environment**: [Production / Local]
**Browser**: [Chrome/Firefox/Safari]

### Pages Tested:
- [ ] Landing page
- [ ] Console (all tabs)
- [ ] Theme selector
- [ ] All 5 theme studios

### Campaign Flow:
- [ ] Modal opens correctly
- [ ] Form validation works
- [ ] Campaign creation succeeds
- [ ] Context shows in all tabs

### Visual Consistency:
- [ ] Slate Cyan everywhere
- [ ] Matte Black background
- [ ] Sharp borders
- [ ] British English
- [ ] Lowercase copy

### Issues Found:
1. [Description]
2. [Description]

### Notes:
[Any observations]
```

---

**Last Updated**: Phase 10.4 Completion
**Status**: All Phase 10.3.5 + 10.4 features ready for QA
**Next**: Incremental component refactoring to use `/design-system/` imports
