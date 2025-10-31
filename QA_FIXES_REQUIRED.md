# QA Fixes Required - totalaud.io

**Based on**: QA Report 27 October 2025 (Score: 62/100)
**Target Score**: 90/100
**Priority**: Critical issues first, then visual/brand alignment

---

## 🚨 Critical Issues (MUST FIX)

### 1. ThemeSelectorV2 Not Accessible ❌
**Issue**: No visible theme selection panel or theme card selector on console or studio pages

**Root Cause Investigation Needed:**
- Check if theme selector button in console header is visible
- Verify ThemeSelectorV2 modal opens when clicking theme button
- Check if theme studios (/studio/[theme]) have selector UI
- Verify ThemeSelectorV2 component is correctly imported in ConsoleDashboard

**Files to Check:**
- `/apps/aud-web/src/components/layouts/ConsoleDashboard.tsx` (lines 273-300, 528-569)
- `/apps/aud-web/src/components/ui/ThemeSelectorV2.tsx`
- `/apps/aud-web/src/app/studio/[theme]/page.tsx`

**Expected Behaviour:**
- Console header (top-right) should have "Theme" button
- Clicking opens modal with 5 theme cards
- Each card shows distinct visual cue (bar, dots, grid, tracks, grain)
- Keyboard nav works (↑↓ or j/k, Enter)

**Quick Test:**
1. Navigate to http://localhost:3000/console
2. Look for "Theme" button with Settings icon (top-right)
3. Click it → Modal should open with theme selector
4. If button missing: Check ConsoleDashboard line 273-300

---

### 2. Create Campaign Button Not Found ❌
**Issue**: No "Create Campaign" button visible, campaign flow stuck at "Untitled Campaign"

**Root Cause Investigation Needed:**
- Button exists in code (PlanTab.tsx line 131-133)
- Possible UI component library issue (Button import from @/ui/index)
- May be hidden by CSS or conditional rendering
- Check if Button component is properly styled/visible

**Files to Check:**
- `/apps/aud-web/src/components/features/workspace/PlanTab.tsx` (line 131-133)
- `/apps/aud-web/src/components/ui/Button.tsx` (verify component works)
- `/apps/aud-web/src/components/ui/index.ts` (verify export)

**Expected Behaviour:**
- Plan tab should show "Create Campaign" button above campaigns section
- Button should be Slate Cyan with Plus icon
- Clicking opens CreateCampaignModal
- Empty state also has "Create Campaign" CTA

**Quick Test:**
1. Navigate to http://localhost:3000/console (Plan tab)
2. Look for "Create Campaign" button with Plus icon
3. Should be visible in section header above "Campaigns"
4. If missing: Check browser inspector for hidden elements

**Potential Fixes:**
```typescript
// Check if Button component has proper styling
// File: apps/aud-web/src/components/ui/Button.tsx
// Ensure it's not display:none or opacity:0

// Verify import path is correct
import { Button } from '@/ui/index' // or '@/components/ui/Button'
```

---

### 3. Landing Page Agent Error 🐛
**Issue**: "Agent Error: TypeError: Failed to fetchPending" on landing page

**Root Cause Investigation Needed:**
- Check landing page API calls
- Verify fetch requests in browser Network tab
- Check if Supabase/API endpoints are accessible
- May be related to agent system initialization

**Files to Check:**
- `/apps/aud-web/src/app/landing/page.tsx`
- `/apps/aud-web/src/app/api/agents/[name]/stream/route.ts`
- Browser console for full error stack trace

**Expected Behaviour:**
- Landing page loads without errors
- No failed fetch requests
- Agent system optional (not critical for landing)

**Quick Fix:**
- Wrap agent calls in try-catch
- Add null checks for agent responses
- Consider removing agent system from landing if not needed

---

## ⚠️ High Priority Issues (Typography & Brand)

### 4. Guide Studio Copy Not Lowercase ⚠️
**Issue**: Guide studio uses capitalized, exclamatory copy ("Welcome to your Campaign Wizard!")

**Files to Fix:**
- `/apps/aud-web/src/components/studios/` or theme-specific components
- Search for "Welcome to your Campaign Wizard" in codebase
- Check Guide theme configuration

**Required Changes:**
```typescript
// ❌ Current (incorrect)
"Welcome to your Campaign Wizard!"

// ✅ Fixed (correct)
"welcome to your campaign wizard"

// Better (honest maker tone):
"let's plan your campaign step by step"
```

**Pattern to Apply:**
- All headings → lowercase
- Remove exclamation marks
- Remove emojis from UI copy (🎯, etc.)
- Use British English ("organise" not "organize")

---

### 5. Remove Emojis from Guide Studio 🚫
**Issue**: Emojis in UI copy ("🎯 Set Goals", etc.) violate brand specs

**Files to Fix:**
- Guide studio component files
- Theme configuration for Guide theme

**Required Changes:**
```typescript
// ❌ Current
"🎯 Set Goals"
"✨ Define Strategy"

// ✅ Fixed
"set goals"
"define strategy"
```

**Rule**: Emojis ONLY in agent personalities, never in UI labels/buttons

---

### 6. Typography Inconsistencies ⚠️
**Issues**:
- Some headings not lowercase ("Plan Your Campaign" should be "plan your campaign")
- Weights too heavy (700 instead of 500-600)
- JetBrains Mono not visible in code/console areas

**Files to Fix:**
- `/apps/aud-web/src/components/features/workspace/PlanTab.tsx` (line 48)
- All workspace tab headers
- Console components that should use monospace

**Required Changes:**
```typescript
// ❌ Current
<h1 className="text-3xl font-bold mb-2">Plan Your Campaign</h1>

// ✅ Fixed
<h1 className="text-3xl font-semibold mb-2 lowercase">plan your campaign</h1>

// Or using design system:
<h1 style={{
  fontSize: typography.sizes['3xl'],
  fontWeight: typography.weights.semibold,
  textTransform: 'lowercase'
}}>
  plan your campaign
</h1>
```

---

## 🎨 Visual Polish (Medium Priority)

### 7. Active Tab Border Not Prominent 🎨
**Issue**: Active tab Slate Cyan border not always visible

**Files to Fix:**
- `/apps/aud-web/src/components/layouts/ConsoleDashboard.tsx` (line 346-377)

**Required Changes:**
```typescript
// Make active border more visible
border: `2px solid ${isActive ? '#3AA9BE' : 'transparent'}`,
borderLeft: isActive ? '3px solid #3AA9BE' : '3px solid transparent', // ✅ Good
// Add box-shadow for extra emphasis
boxShadow: isActive ? '0 0 0 1px rgba(58, 169, 190, 0.4)' : 'none',
```

---

### 8. British English Verification ✍️
**Issue**: Some American spelling may remain ("behavior", "color", "optimize")

**Quick Fix Script:**
```bash
# Find American spellings
grep -r "color:" apps/aud-web/src/components --include="*.tsx" --include="*.ts"
grep -r "behavior" apps/aud-web/src/components --include="*.tsx" --include="*.ts"
grep -r "optimize" apps/aud-web/src/components --include="*.tsx" --include="*.ts"

# Replace with British
# color → colour (in comments/strings, NOT CSS properties)
# behavior → behaviour
# optimize → optimise
# analyze → analyse
# organize → organise
```

**Note**: Keep React/CSS property names as-is (backgroundColor, etc.)

---

## 📊 Impact Assessment

### Critical Fixes (Must Have for 90/100):
1. **ThemeSelectorV2 visible** (+10 pts) → Theme selection: 4/10 → 10/10
2. **Create Campaign button works** (+8 pts) → Campaign flow: 6/10 → 10/10
3. **Fix landing error** (+4 pts) → Console errors: 6/10 → 10/10

**Subtotal**: +22 pts → 84/100

### High Priority (Get to 90+):
4. **Fix Guide studio copy** (+3 pts) → Tone: 3/5 → 5/5
5. **Remove emojis** (+2 pts) → Brand alignment
6. **Fix typography** (+3 pts) → Typography: 6/10 → 9/10

**Subtotal**: +8 pts → 92/100 ✅

### Polish (Nice to Have):
7. **Active tab borders** (+2 pts) → Visual consistency
8. **British English audit** (+1 pt) → British English: 4/5 → 5/5

**Final Score**: 95/100 🎯

---

## 🔍 Investigation Checklist

**Before fixing, verify:**
- [ ] Theme button visible in console header (top-right)?
- [ ] Create Campaign button visible in Plan tab?
- [ ] Landing page loads without console errors?
- [ ] Guide studio accessible at /studio/guide?
- [ ] Browser: Chrome, viewport: 1920x1080 (same as QA tester)

**If issues not reproducible:**
- Clear browser cache
- Hard reload (Cmd+Shift+R)
- Check if user logged in (some features may require auth)
- Test in incognito mode

---

## 🛠️ Quick Fix Priority

### Immediate (Today):
1. **Verify** ThemeSelectorV2 button exists and works
2. **Verify** Create Campaign button visible
3. **Fix** landing page error (wrap in try-catch)

### Next Session:
4. **Fix** Guide studio copy → all lowercase
5. **Remove** all emojis from UI copy
6. **Update** PlanTab heading to lowercase

### Polish Pass:
7. **Enhance** active tab borders
8. **Audit** British English throughout
9. **Add** JetBrains Mono to console areas

---

## ✅ Definition of Done

**All Critical Issues Resolved When:**
- ✅ Theme selector modal opens from console header
- ✅ Create Campaign button visible and functional
- ✅ Landing page loads with zero console errors
- ✅ All UI copy is lowercase (except proper nouns)
- ✅ No emojis in UI labels/buttons
- ✅ British English throughout
- ✅ Active tabs have visible Slate Cyan borders
- ✅ JetBrains Mono used in code/console areas

**Target**: 90/100 score on re-test with same browser/viewport

---

## 🎯 Test After Fixes

**Quick Smoke Test:**
1. Load http://localhost:3000/ → No errors ✅
2. Navigate to /console → Theme button visible ✅
3. Click Theme button → Modal opens with 5 cards ✅
4. Look at Plan tab → "Create Campaign" button visible ✅
5. Click button → Modal opens ✅
6. Check Guide studio → All copy lowercase ✅
7. Check all tabs → British spelling throughout ✅

**Expected Result**: Score jumps from 62/100 → 90+/100 🎉
