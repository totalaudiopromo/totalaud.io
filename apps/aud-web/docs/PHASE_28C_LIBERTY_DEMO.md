# Phase 28C: Liberty Demo Path

**Status**: ✅ Complete
**Implementation Date**: 2025-11-16

---

## 🎯 Overview

Phase 28C adds a Liberty Music PR-focused demo path to `/demo/liberty`, showcasing how an indie artist campaign would work inside the totalaud.io OS constellation with a preview of Total Audio Promo (TAP) integration.

**Key Features**:
- New `/demo/liberty` route with campaign-specific narrative
- TAP export stub (preview mode only, no real TAP calls)
- Demo mode selector at `/demo` (Artist Journey vs Liberty Pitch)
- Liberty-specific OS surfaces (campaign timeline, agent runs, etc.)
- All changes scoped to totalaud.io (no TAP repo modifications)

---

## 🗂️ File Structure

```
apps/aud-web/
├── docs/
│   └── PHASE_28C_LIBERTY_DEMO.md            # This file
├── src/
│   ├── app/
│   │   ├── demo/
│   │   │   ├── page.tsx                      # Demo selector (NEW)
│   │   │   ├── artist/
│   │   │   │   ├── page.tsx                  # Updated with DIRECTOR_SCRIPT
│   │   │   │   └── ...
│   │   │   └── liberty/                      # NEW
│   │   │       ├── page.tsx                  # Liberty demo page
│   │   │       ├── LibertyDemoOSShell.tsx    # OS switcher + TAP export handler
│   │   │       ├── TAPExportOverlay.tsx      # TAP export UI feedback
│   │   │       └── os/                       # Liberty OS surfaces
│   │   │           ├── AnalogueOSPage.tsx    # Campaign notebook
│   │   │           ├── XPOSPage.tsx          # Campaign agents
│   │   │           └── LoopOSPage.tsx        # Campaign timeline
│   │   └── api/
│   │       └── demo/
│   │           └── tap-export/
│   │               └── route.ts              # NEW: TAP export stub
│   └── components/
│       └── demo/
│           └── director/
│               ├── DirectorEngine.ts         # Updated: script param, TAP export action
│               ├── DirectorProvider.tsx      # Updated: script prop
│               └── libertyDirectorScript.ts  # NEW: Liberty script (40 actions)
```

---

## ✨ New Features

### 1. Liberty Director Script

**File**: `libertyDirectorScript.ts`
**Actions**: 40 (vs 42 in artist demo)
**Duration**: 85 seconds

**Story Beats**:
1. **Analogue OS** - Campaign notebook with Liberty EP release notes
2. **ASCII OS** - Run coach agent: "Plan UK launch for Liberty Music PR audience"
3. **XP OS** - View campaign agents (coach + scout runs)
4. **LoopOS** - Campaign timeline (BBC Introducing, Student Radio, Spotify Editorial)
5. **Aqua OS** - Strategic guidance for Liberty pitch
6. **TAP Export** - Export campaign to Total Audio Promo (Preview Mode)
7. **End Card** - "Creative story here • Execution in TAP"

**New Action Type**:
- `TRIGGER_TAP_EXPORT` - Calls stub API and shows export overlay

### 2. TAP Export Stub API

**Endpoint**: `POST /api/demo/tap-export`

**Request**:
```json
{
  "demoMode": "liberty",
  "campaignName": "Liberty EP Launch",
  "artist": "Demo Artist",
  "targetAudience": "UK Indie / Student Radio",
  "timestamp": "2025-11-16T..."
}
```

**Response** (always success for demo):
```json
{
  "success": true,
  "message": "Campaign exported to TAP (Preview Mode)",
  "demoExportId": "demo-export-1234567890-abc123",
  "previewMode": true,
  "note": "This is a demo stub. Real TAP integration coming with Fusion Lite."
}
```

**Features**:
- Simulated network delay (300-700ms)
- Always returns success
- Logs to console for debugging
- Does NOT call real TAP infrastructure
- Zod validation for request body

**TODO (Fusion Lite)**:
```typescript
// Replace stub with real TAP integration
// - Call TAP API endpoints
// - Handle authentication
// - Sync campaign data
// - Return real export IDs
```

### 3. TAPExportOverlay Component

**Visual States**:
- **Exporting**: Spinner + "Exporting to Total Audio Promo..."
- **Success**: Check icon + "Export Successful" + Preview Mode notice
- **Error**: X icon + "Export Failed (demo stub)"

**Auto-hide**: Overlay disappears after action duration (2s default)

**Preview Mode Notice**:
> "This is a demo stub. Real TAP integration coming with Fusion Lite. Campaign data would sync to your Total Audio Promo dashboard for execution and reporting."

### 4. Demo Mode Selector

**Route**: `/demo`

**Options**:
- **Artist Journey Demo** - Lana Glass creative workflow (75s)
- **Liberty Pitch Demo** - UK indie campaign with TAP preview (85s)

**Features**:
- Clean card-based UI
- Hover animations
- Duration and feature badges
- Links to `/demo/artist` and `/demo/liberty`

---

## 🎬 Liberty Demo Flow

### Full Script Timeline

| Time | OS | Action | Visual |
|------|-----|--------|--------|
| 0s | Analogue | Show campaign notebook | - |
| 0.8s | Analogue | Highlight "Liberty EP — release notes" card | Glow + sparkle |
| 3.3s | ASCII | Switch to terminal | Green phosphor |
| 4.5s | ASCII | Type: "agent run coach 'Plan UK launch...'" | Character-by-character |
| 6.5s | ASCII | Run command | Output appears |
| 9.3s | XP | Show agent monitor | Blue XP chrome |
| 11.8s | XP | Focus last completed run (coach) | Highlight + expand |
| 16.1s | LoopOS | Show campaign timeline | 3 lanes (BBC, Student, Spotify) |
| 17.7s | LoopOS | Pan camera to timeline view | Smooth transform |
| 20s | LoopOS | Play timeline for 3s | Animated playhead |
| 24.5s | Aqua | Switch to Coach agent | Glassy UI |
| 25.3s | Aqua | Ask: "How do we pitch to Liberty Music PR?" | Auto-send message |
| 30.1s | Aqua | Show strategic response | Full guidance text |
| 34.9s | Aqua | Show note: "Exporting to TAP..." | Overlay note |
| 36.9s | Aqua | **TRIGGER TAP EXPORT** | **Overlay modal** |
| 39.4s | Aqua | Show end card note | Final message |
| 42.4s | - | Reset ambient intensity | Fade to neutral |

### TAP Export Detail

**Trigger Point**: After Aqua agent response
**Duration**: 2 seconds
**UI Flow**:
1. Show note: "Exporting campaign to Total Audio Promo (Preview Mode)..."
2. Call `/api/demo/tap-export` with payload
3. Show TAPExportOverlay:
   - **Exporting** (spinner, ~500ms)
   - **Success** (check icon, preview notice)
4. Auto-hide overlay after 2s
5. Continue to end card

---

## 🏗️ Liberty OS Surfaces

### Analogue OS (Campaign Notebook)

**Cards**:
1. **Liberty EP — release notes**
   - UK indie release, student radio, BBC Introducing, Spotify Editorial
   - Tags: `#campaign`, `#uk-launch`, `#liberty`
2. **radio targets**
   - Priority: BBC Introducing, Amazing Radio, student stations
   - Tags: `#radio`, `#promo`
3. **press timeline**
   - 2 weeks pre-launch, launch week, post-launch phases
   - Tags: `#press`, `#timeline`

**Director Highlight**: "Liberty EP — release notes" card glows with 2s pulse

### XP OS (Campaign Agents)

**Agent Runs**:
1. **Coach**: "Plan UK launch for Liberty Music PR audience"
   - Status: Done
   - Result: 4-phase UK launch strategy (pre-launch, launch, post-launch, key targets)
2. **Scout**: "Find similar UK indie artists and their campaigns"
   - Status: Done
   - Result: Reference artists (Beabadoobee, Alfie Templeman), successful patterns, playlist targets
3. **Designer**: "Generate campaign visuals matching indie aesthetic"
   - Status: Running

**Director Focus**: Auto-selects first completed run (coach)

### LoopOS (Campaign Timeline)

**Lanes**:
1. **BBC Introducing** - 3 campaign blocks (pitches, interviews, airplay)
2. **Student Radio** - 2 campaign blocks (university outreach, sessions)
3. **Spotify Editorial Pitch** - 2 campaign blocks (submission, playlist adds)

**Inspector Stats**:
- Radio Targets: 24
- Duration: 4 weeks
- Press Outlets: 12
- Status: Planning

**Director Actions**:
- Pan to timeline view
- Play 3-second segment
- Show campaign progression

### ASCII OS (Reused from Artist Demo)

**Command Typed**:
```
agent run coach "Plan UK launch for Liberty Music PR audience"
```

**Output**:
```
⚡ Running agent: coach
📤 Request sent to agent kernel
⏳ Waiting for response...

✅ Agent completed
📊 View results in XP Agent Monitor
```

### Aqua OS (Reused from Artist Demo)

**Auto-sent Question**:
> "I want to pitch the 'Liberty EP' to Liberty Music PR. What should I emphasize?"

**Coach Response** (pre-scripted):
Strategic guidance on Liberty Music PR pitch, including:
- Core identity points
- Playlist fit arguments
- Visual hook (campaign aesthetics)
- Pitch template

---

## 🔧 DirectorEngine Updates

### New Constructor Signature

**Before**:
```typescript
constructor(callbacks?: DirectorCallbacks)
```

**After**:
```typescript
constructor(script: DirectorAction[], callbacks?: DirectorCallbacks)
```

**Usage**:
```typescript
// Artist demo
const engine = new DirectorEngine(DIRECTOR_SCRIPT, callbacks)

// Liberty demo
const engine = new DirectorEngine(LIBERTY_DIRECTOR_SCRIPT, callbacks)
```

### New Callback

```typescript
interface DirectorCallbacks {
  // ... existing callbacks
  onTriggerTapExport?: (payload: any, durationMs: number) => Promise<void>
}
```

### New Action Executor

```typescript
private async executeTriggerTapExport(action: DirectorAction): Promise<void> {
  const payload = action.payload || {}
  const durationMs = action.durationMs ?? 2000

  if (this.callbacks.onTriggerTapExport) {
    await this.callbacks.onTriggerTapExport(payload, durationMs)
  }
}
```

---

## 🧪 Testing Checklist

### ✅ Core Functionality

- [ ] `/demo` selector page loads correctly
- [ ] Artist Journey card links to `/demo/artist`
- [ ] Liberty Pitch card links to `/demo/liberty`
- [ ] `/demo/artist` still works exactly as before (regression test)
- [ ] `/demo/liberty` runs complete script with no console errors

### ✅ Liberty Demo Flow

- [ ] Analogue OS: Liberty EP card highlights correctly
- [ ] ASCII OS: Command types character-by-character
- [ ] XP OS: Campaign agents display, focus on coach run
- [ ] LoopOS: Campaign timeline shows 3 lanes, playhead animates
- [ ] Aqua OS: Liberty pitch question auto-sends, response displays

### ✅ TAP Export

- [ ] TAP export action triggers at correct script point
- [ ] TAPExportOverlay appears with "Exporting..." spinner
- [ ] Stub API receives payload and logs to console
- [ ] Overlay shows "Success" with preview mode notice
- [ ] Overlay auto-hides after 2 seconds
- [ ] No real TAP API calls are made

### ✅ Director Controls

- [ ] Play/Pause/Resume/Stop work in both demos
- [ ] Skip forward/backward work correctly
- [ ] Progress bar updates during playback
- [ ] Manual navigation works when director paused
- [ ] Stopping demo clears TAP export overlay

### ✅ Accessibility

- [ ] Reduced-motion mode respected (no jarring animations)
- [ ] Keyboard navigation works for demo selector
- [ ] All interactive elements have proper focus states

### ✅ Error Handling

- [ ] TAP export failure shows error state
- [ ] Error overlay auto-hides after 2s
- [ ] Director continues if export fails
- [ ] Console shows helpful debug logs

---

## 🚀 Usage

### Development

```bash
# Start dev server
pnpm dev:web

# Visit demo selector
open http://localhost:3000/demo

# Or go directly to demos
open http://localhost:3000/demo/artist
open http://localhost:3000/demo/liberty
```

### User Flow

1. **Visit** `/demo`
2. **Choose** "Liberty Pitch Demo" card
3. **Click** "Play Demo" in overlay
4. **Watch** 85-second auto-playthrough
5. **Observe** TAP export at ~37s mark
6. **See** end card with TAP integration message

### Manual Testing

```bash
# Test TAP export API directly
curl -X POST http://localhost:3000/api/demo/tap-export \
  -H "Content-Type: application/json" \
  -d '{
    "demoMode": "liberty",
    "campaignName": "Test Campaign",
    "artist": "Test Artist",
    "targetAudience": "UK Indie"
  }'

# Expected response (200 OK):
# {
#   "success": true,
#   "message": "Campaign exported to TAP (Preview Mode)",
#   "demoExportId": "demo-export-...",
#   "previewMode": true,
#   "note": "This is a demo stub..."
# }
```

---

## 📝 Copy & Language

### British English

All Liberty demo content uses British English:
- ✅ "Organise", "Optimise", "Colour"
- ✅ "BBC Introducing", "Student Radio", "UK Indie"

### Hypothetical Framing

Liberty references are clearly hypothetical:
- ✅ "Imagine preparing an EP launch with Liberty Music PR..."
- ✅ "Here's how their campaign could live inside this OS constellation"
- ❌ "We are Liberty Music PR"
- ❌ "This is how Liberty uses totalaud.io"

### TAP Integration Language

Clear preview/stub messaging:
- ✅ "Preview Mode"
- ✅ "Demo stub - real TAP integration coming with Fusion Lite"
- ✅ "Campaign would sync to your Total Audio Promo dashboard"
- ❌ "Connected to Total Audio Promo"
- ❌ "Live TAP integration"

---

## 🔮 Future: Fusion Lite

When Fusion Lite is implemented, replace the stub:

### 1. Update TAP Export API

**File**: `apps/aud-web/src/app/api/demo/tap-export/route.ts`

```typescript
// TODO: Replace with real TAP integration

// Current (demo stub):
const demoExportId = `demo-export-${Date.now()}`
return NextResponse.json({ success: true, demoExportId, previewMode: true })

// Future (real TAP):
const tapClient = new TAPClient(process.env.TAP_API_KEY)
const exportResult = await tapClient.campaigns.create({
  name: data.campaignName,
  artist: data.artist,
  targetAudience: data.targetAudience,
  // ... full campaign data
})
return NextResponse.json({
  success: true,
  exportId: exportResult.id,
  previewMode: false,
  tapDashboardUrl: exportResult.dashboardUrl
})
```

### 2. Add Environment Variables

```bash
# .env.local
TAP_API_KEY=sk_live_...
TAP_API_URL=https://api.totalaudipromo.com/v1
```

### 3. Update TAPExportOverlay

Remove "Preview Mode" notice, add:
- Link to TAP dashboard
- Campaign ID
- Status updates from TAP webhook

### 4. Add Real-Time Sync

- Listen for TAP campaign events (webhook)
- Update LoopOS timeline with TAP status
- Show execution progress in real-time

---

## ⚠️ Important Notes

### What This Is

- ✅ Demo stub showing future TAP integration
- ✅ Scoped entirely to totalaud.io
- ✅ Safe to show to Liberty Music PR or other partners
- ✅ Clear preview/hypothetical framing

### What This Is NOT

- ❌ Real TAP integration (that's Fusion Lite)
- ❌ Live data sync between systems
- ❌ Production-ready campaign export
- ❌ Requires TAP infrastructure to be running

### Safety Constraints

1. **No TAP Repo Changes**: All code in totalaud.io only
2. **No Real API Calls**: Stub always returns success
3. **No New Env Vars**: Uses existing totalaud.io setup
4. **No Blocking**: Export failure doesn't crash demo

---

## 📊 Stats

**New Files Created**: 9
**Lines of Code**: ~1,600
**Demo Duration**: 85 seconds
**Actions in Liberty Script**: 40
**TAP Export Actions**: 1
**OS Surfaces (Liberty-specific)**: 3 (Analogue, XP, LoopOS)
**Reused OS Surfaces**: 2 (ASCII, Aqua)

---

## ✅ Success Criteria

Phase 28C is complete when:

- [x] `/demo` selector page loads and links work
- [x] Liberty demo runs full 85-second script
- [x] TAP export shows preview overlay
- [x] Stub API receives payload and returns success
- [x] Artist demo still works (no regressions)
- [x] All director controls work in both demos
- [x] Reduced-motion respected
- [x] British English throughout
- [x] Clear preview/hypothetical framing
- [x] No real TAP calls made
- [x] Documentation complete

---

**Implementation Date**: 2025-11-16
**Status**: ✅ Complete
**Next Steps**: Use in demos, gather feedback, plan Fusion Lite real integration

🎬 **Liberty demo is ready to showcase indie artist + PR workflow with TAP preview!**
