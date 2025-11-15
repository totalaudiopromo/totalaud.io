# Phase 14 – UI Audit Report
**Date**: 1 November 2025
**Auditor**: Claude Code
**Status**: Initial Audit Complete

---

## 🎯 Executive Summary

**Purpose**: Perform rapid visual/UX audit across console and landing page to identify gaps, inconsistencies, and opportunities for polish before closed beta.

**Overall Assessment**: The application has a solid foundation with FlowCore theming partially implemented. Key issues identified:
- Landing page currently shows onboarding flow (no standalone marketing page)
- Console UI exists within FlowStudio but lacks dedicated layout
- Command Palette has FlowCore styling but needs refinement
- Insight Panel using mock data (needs Supabase connection)
- Global styling inconsistencies (colours, spacing, typography)

**Priority Level**: HIGH - Required for closed beta readiness

---

## 📋 Detailed Audit Findings

### 1. Landing Page (`/apps/aud-web/src/app/page.tsx`)

#### Current State
- ✅ **EXISTS**: Component renders onboarding flow (OperatorTerminal → OSSelector → TransitionSequence → FlowStudio)
- ⚠️ **ISSUE**: No standalone landing page - users immediately enter onboarding
- ⚠️ **ISSUE**: No clear marketing message or value proposition
- ⚠️ **ISSUE**: No CTA for "Launch Console" or "Sign Up"
- ❌ **MISSING**: Hero section with brand messaging
- ❌ **MISSING**: Feature showcase
- ❌ **MISSING**: ConvertKit email capture

#### Recommendations
1. Create dedicated landing page component (`LandingPage.tsx`)
2. Add hero section: "The Campaign OS for Indie Artists & Music PRs"
3. Subtext: "Plan, Pitch and Track every release in one Flow-state workspace"
4. Single CTA: "Launch Console" → /console route
5. Add ConvertKit subscribe form in footer
6. Use FlowCore colour tokens (Slate Cyan #3AA9BE, Ice Cyan #89DFF3, Onyx #0F1113)

---

### 2. Console Layout

#### Current State
- ✅ **EXISTS**: FlowStudio component with canvas and agent status
- ⚠️ **ISSUE**: No dedicated console layout component
- ⚠️ **ISSUE**: Title is static gradient text ("totalaud.io flow studio")
- ❌ **MISSING**: Editable campaign title with inline rename
- ❌ **MISSING**: Save button (persist scene to Supabase)
- ❌ **MISSING**: Share button (copy URL with campaign ID)
- ❌ **MISSING**: Breadcrumb navigation
- ❌ **MISSING**: User menu/settings

#### Current Styling Issues
- Uses gradient colours (blue-400, purple-400, green-400) - not FlowCore palette
- Header padding/spacing inconsistent
- No clear visual hierarchy

#### Recommendations
1. Create `ConsoleLayout.tsx` wrapper component
2. Add `ConsoleHeader.tsx` with:
   - Editable campaign title (click to edit, auto-save)
   - Save button with toast feedback ("campaign saved")
   - Share button with URL copy functionality
   - Replace gradient with FlowCore Slate Cyan
3. Update spacing to 16px grid system
4. Add proper header/content/sidebar layout

---

### 3. FlowCanvas Placement UX

#### Current State
- ✅ **EXISTS**: Canvas renders with React Flow
- ⚠️ **ISSUE**: No visual feedback during agent placement
- ⚠️ **ISSUE**: No tooltip guidance ("click to place agent")
- ⚠️ **ISSUE**: Cursor doesn't change to crosshair
- ❌ **MISSING**: Ghost node preview on hover
- ❌ **MISSING**: ESC key to cancel placement

#### Recommendations
1. Add ghost node preview with 50% opacity
2. Change cursor to crosshair during placement mode
3. Add floating tooltip: "click to place [agent name]"
4. Implement ESC key handler to cancel placement
5. Add placement sound effect (optional)

---

### 4. Command Palette (`CommandPalette.tsx`)

#### Current State
- ✅ **EXCELLENT**: FlowCore theme integration complete
- ✅ **GOOD**: Keyboard navigation functional (↑↓, Enter, ESC)
- ✅ **GOOD**: Fuzzy search working
- ✅ **GOOD**: Responsive to ⌘K / Ctrl+K
- ⚠️ **MINOR**: 2px accent line could be more prominent
- ⚠️ **MINOR**: Entry animation could use FlowCore motion tokens

#### Current Implementation
```typescript
// Already using FlowCore atmosphere theming
const { atmosphere, colours, motion: themeMotion } = useFlowTheme()
```

#### Recommendations
1. ✅ Design mostly complete - minor refinements only
2. Increase accent line from 2px to 3px for better visibility
3. Use FlowCore `motion.smooth` (240ms) for open animation
4. Add UI hover sound (optional)
5. Ensure matte background matches FlowCore surface colour

---

### 5. Insight Panel (`InsightPanel.tsx`)

#### Current State
- ✅ **EXISTS**: Component structure complete
- ✅ **GOOD**: Using `useCampaignInsights` hook for data
- ✅ **GOOD**: 30-second auto-refresh configured
- ⚠️ **ISSUE**: Hook may be returning mock/placeholder data
- ⚠️ **ISSUE**: No "last updated" microcopy
- ❌ **MISSING**: Supabase connection verification

#### Current Metrics Displayed
- Active Agents
- Tasks Completed
- Contacts Enriched
- Open Rate

#### Recommendations
1. Verify `useCampaignInsights` hook connects to Supabase
2. Add real campaign metrics queries
3. Add "last updated 30s ago" timestamp
4. Implement SWR for data fetching if not already present
5. Add loading skeleton states
6. Add error boundary for API failures

---

### 6. Global Styling

#### Current State
- ⚠️ **MIXED**: Some FlowCore tokens used, some custom colours
- ⚠️ **INCONSISTENT**: Mix of gradient colours and FlowCore palette
- ❌ **MISSING**: Unified spacing system (should be 16px grid)
- ❌ **MISSING**: Custom favicon
- ❌ **MISSING**: Proper document title

#### Colour Audit
| Location | Current Colour | Should Be (FlowCore) |
|----------|---------------|---------------------|
| FlowStudio title | blue-400, purple-400, green-400 | Slate Cyan #3AA9BE |
| Status dots | green-400, blue-400, purple-400 | Theme-specific |
| Command Palette | ✅ FlowCore colours | ✅ Correct |
| Insight Panel | ✅ CSS variables | ✅ Correct |

#### Typography Audit
| Component | Current | Should Be |
|-----------|---------|-----------|
| FlowStudio header | font-mono | ✅ Correct |
| Command Palette | font-mono lowercase | ✅ Correct |
| Insight Panel | Mixed | Standardise to FlowCore scale |

#### Recommendations
1. Create `/constants/flowCoreColours.ts` with colour tokens
2. Replace all gradient/mixed colours with FlowCore palette
3. Update `public/favicon.ico` with brand icon
4. Set document title: `"TotalAud.io Console"` in layout
5. Implement 16px grid spacing system
6. Add CSS custom properties for FlowCore tokens

---

### 7. Motion & Accessibility

#### Current State
- ✅ **GOOD**: Framer Motion used throughout
- ✅ **GOOD**: AnimatePresence for phase transitions
- ⚠️ **ISSUE**: No `prefers-reduced-motion` detection
- ⚠️ **ISSUE**: Inconsistent animation durations

#### Motion Token Audit
| Component | Current Duration | FlowCore Standard |
|-----------|-----------------|-------------------|
| Command Palette entry | spring (damping: 25, stiffness: 300) | ⚠️ Should use motion.smooth (240ms) |
| Phase transitions | Default | ✅ Likely correct |
| Agent cards | transition-all | ⚠️ Should specify duration |

#### Recommendations
1. Add `prefers-reduced-motion` media query detection
2. Standardise all transitions to FlowCore motion tokens:
   - Fast: 120ms (micro-interactions)
   - Normal: 240ms (component transitions)
   - Slow: 400ms (ambient effects)
3. Disable/reduce animations when user prefers reduced motion

---

## 🎨 Brand Hierarchy Clarification

#### Current Confusion
- **TotalAud.io** = Experimental product (this codebase)
- **Total Audio Promo** = Parent brand/marketing site
- Not clearly sign-posted in UI

#### Recommendation
Add footer note:
```
"TotalAud.io — Experimental campaign OS by Total Audio Promo"
```

---

## ✅ Verification Checklist

Use this checklist during implementation:

### Landing Page
- [ ] Hero section text: "The Campaign OS for Indie Artists & Music PRs"
- [ ] Subtext: "Plan, Pitch and Track every release in one Flow-state workspace"
- [ ] "Launch Console" CTA functional
- [ ] FlowCore colours only (Slate Cyan + Ice Cyan + Onyx)
- [ ] ConvertKit form tested and working
- [ ] Meta tags updated for social sharing

### Console
- [ ] Campaign title editable (inline rename)
- [ ] Save button functional + toast feedback
- [ ] Share button copies URL successfully
- [ ] All colours match FlowCore palette
- [ ] 16px grid spacing applied
- [ ] Document title: "TotalAud.io Console"
- [ ] Favicon updated

### FlowCanvas
- [ ] Ghost node preview visible during placement
- [ ] Crosshair cursor active in placement mode
- [ ] Tooltip: "click to place [agent name]"
- [ ] ESC key cancels placement
- [ ] Visual feedback on successful placement

### Command Palette
- [ ] Accent line 3px and prominent
- [ ] Entry animation uses FlowCore motion.smooth
- [ ] Matte background matches theme
- [ ] UI hover sound (optional)

### Insight Panel
- [ ] Connected to real Supabase queries
- [ ] Displays actual campaign metrics
- [ ] "last updated Xs ago" timestamp visible
- [ ] Auto-refresh every 30s working
- [ ] Error states handled gracefully

### Motion & Accessibility
- [ ] `prefers-reduced-motion` respected
- [ ] All transitions use FlowCore durations (120/240/400ms)
- [ ] No motion when user requests reduced motion

---

## 📊 Priority Matrix

### Critical (Must-Have for Beta)
1. ✅ Console header with save/share functionality
2. ✅ Landing page with clear value proposition
3. ✅ FlowCore colour unification
4. ✅ Insight Panel Supabase connection
5. ✅ Document title + favicon

### High (Should-Have)
6. ✅ FlowCanvas placement UX improvements
7. ✅ Command Palette refinements
8. ✅ `prefers-reduced-motion` support
9. ✅ 16px grid spacing system
10. ✅ ConvertKit form integration

### Medium (Nice-to-Have)
11. ⚠️ UI sound effects
12. ⚠️ Advanced placement animations
13. ⚠️ Breadcrumb navigation
14. ⚠️ User settings menu

---

## 🧪 Testing Strategy

### Manual Testing
1. Navigate to `/` → Should see landing page (not onboarding)
2. Click "Launch Console" → Should redirect to `/console`
3. In console, click campaign title → Should allow inline edit
4. Click Save → Should show toast "campaign saved"
5. Click Share → Should copy URL to clipboard
6. Open Command Palette (⌘K) → Should have FlowCore styling
7. Check Insight Panel → Should show real metrics

### Automated Testing
- Run `pnpm --filter aud-web dev` → No console errors
- Run `pnpm --filter aud-web build` → Clean build
- Test on mobile viewport → Responsive layout
- Test with reduced motion preference → Animations disabled

---

## 📈 Expected Outcomes

After Phase 14 implementation:

✅ **Unified Brand Experience**
- Single design language across landing + console
- FlowCore colours, typography, and motion throughout
- Professional, cohesive aesthetic

✅ **Improved User Journey**
- Clear landing page → value proposition → CTA
- Intuitive console with functional header
- Better canvas interaction feedback

✅ **Production Readiness**
- Real data in Insight Panel
- Proper document metadata
- Accessibility compliance
- Clean build process

✅ **Beta Launch Ready**
- Marketing page ready for traffic
- Console stable for user testing
- Brand hierarchy clear
- Foundation for iteration

---

## 📝 Implementation Notes

**Files to Modify:**
- `apps/aud-web/src/app/page.tsx` (landing page)
- `apps/aud-web/src/app/console/page.tsx` (NEW - console route)
- `apps/aud-web/src/components/layouts/ConsoleLayout.tsx` (NEW)
- `apps/aud-web/src/components/console/ConsoleHeader.tsx` (NEW)
- `apps/aud-web/src/components/ui/CommandPalette.tsx` (refinements)
- `apps/aud-web/src/components/console/InsightPanel.tsx` (Supabase connection)
- `apps/aud-web/src/components/features/flow/FlowCanvas.tsx` (placement UX)
- `apps/aud-web/src/app/layout.tsx` (document title, favicon)
- `apps/aud-web/src/constants/flowCoreColours.ts` (NEW)
- `apps/aud-web/public/favicon.ico` (update)

**New Components to Create:**
1. `LandingPage.tsx` - Marketing hero + CTA
2. `ConsoleLayout.tsx` - Console wrapper
3. `ConsoleHeader.tsx` - Editable title + actions
4. `ConvertKitForm.tsx` - Email capture

**Constraints:**
- No new packages unless essential (SWR allowed for caching)
- British spelling throughout
- Must build cleanly (`pnpm build`)
- Use existing FlowCore design system

---

**Status**: ✅ Audit Complete → Ready for Implementation

**Next Step**: Begin implementation with console header fixes (highest priority)
