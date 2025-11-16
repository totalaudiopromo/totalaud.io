# Memory Integration Guide

How to integrate Artist Memory Graph into existing LoopOS features.

---

## 📋 Overview

The memory system provides contextual artist identity to AI features via the `getMemoryContext()` helpers.

**Key Files**:
- `apps/loopos/src/lib/memory/context.ts` - Memory context helpers
- `apps/loopos/src/lib/memory/extraction.ts` - Extraction pipelines

---

## 🤖 AI Coach Integration

### Step 1: Import Memory Context

```typescript
import { getCoachMemoryContext } from '@/lib/memory/context'
import { extractFromCoach } from '@/lib/memory/extraction'
```

### Step 2: Inject Context into System Prompt

```typescript
// apps/loopos/src/app/api/coach/route.ts (or wherever Coach API is)
export async function POST(req: Request) {
  const { workspaceId, userId, message, conversationId } = await req.json()

  // Get memory context
  const memoryContext = await getCoachMemoryContext(workspaceId)

  // Build system prompt with memory
  const systemPrompt = `You are an AI coach for musicians and creatives.

${memoryContext}

Your role is to provide strategic advice, creative guidance, and help artists achieve their goals.`

  // Call Anthropic with enhanced prompt
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    system: systemPrompt,
    messages: conversationHistory,
    // ...
  })

  // Return response
}
```

### Step 3: Extract Memory After Conversation

```typescript
// After successful Coach response
await extractFromCoach(workspaceId, conversationId, conversationMessages)
```

**Result**: Coach knows the artist's themes, tones, and values, and gives personalised advice.

---

## 🎨 AI Designer Integration

### Step 1: Import Memory Context

```typescript
import { getDesignerMemoryContext } from '@/lib/memory/context'
import { extractFromDesigner } from '@/lib/memory/extraction'
```

### Step 2: Inject Context into Designer Prompt

```typescript
// apps/loopos/src/app/api/designer/generate/route.ts (or similar)
export async function POST(req: Request) {
  const { workspaceId, userId, prompt, sceneId } = await req.json()

  // Get memory context
  const memoryContext = await getDesignerMemoryContext(workspaceId)

  // Build enhanced prompt
  const enhancedPrompt = `${memoryContext}

**User Request**: ${prompt}

Generate a creative scene that matches the artist's visual motifs, themes, and emotional tones.`

  // Call AI Designer with enhanced prompt
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    messages: [{ role: 'user', content: enhancedPrompt }],
    // ...
  })

  // Return generated scene
}
```

### Step 3: Extract Memory from Scene

```typescript
// After scene generation
await extractFromDesigner(workspaceId, sceneId, prompt, generatedNodes)
```

**Result**: Designer creates scenes that match the artist's visual aesthetic and themes.

---

## 📦 Packs Integration

### Step 1: Import Memory Context

```typescript
import { getPacksMemoryContext } from '@/lib/memory/context'
import { extractFromPack } from '@/lib/memory/extraction'
```

### Step 2: Inject Context into Pack Generation

```typescript
// apps/loopos/src/app/api/packs/generate/route.ts (or similar)
export async function POST(req: Request) {
  const { workspaceId, userId, packType } = await req.json()

  // Get memory context
  const memoryContext = await getPacksMemoryContext(workspaceId)

  // Build prompt
  const prompt = `${memoryContext}

Generate a ${packType} pack that aligns with the artist's creative direction, themes, and preferred techniques.`

  // Call AI to generate pack suggestions
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    messages: [{ role: 'user', content: prompt }],
    // ...
  })

  // Return pack data
}
```

### Step 3: Extract Memory from Pack

```typescript
// After pack creation
await extractFromPack(workspaceId, packId, packName, packDescription, packTags)
```

**Result**: Packs are tailored to the artist's genre, techniques, and creative values.

---

## 📝 Journal Integration

### Extract Memory from Journal Entries

```typescript
// apps/loopos/src/app/api/journal/route.ts (or similar)
import { extractFromJournal } from '@/lib/memory/extraction'

export async function POST(req: Request) {
  const { workspaceId, userId, content } = await req.json()

  // Save journal entry to database
  const entry = await journalDb.create(workspaceId, userId, content)

  // Extract memory in background (non-blocking)
  extractFromJournal(workspaceId, entry.id, content).catch((error) => {
    console.error('Background memory extraction failed:', error)
  })

  return NextResponse.json({ success: true, entry })
}
```

**Result**: Themes, values, and goals mentioned in journal entries are captured in memory.

---

## ⏱️ Timeline Integration

### Extract Memory from Milestones

```typescript
// apps/loopos/src/app/api/timeline/route.ts (or similar)
import { extractFromTimeline } from '@/lib/memory/extraction'

export async function POST(req: Request) {
  const { workspaceId, userId, title, description } = await req.json()

  // Create milestone
  const milestone = await timelineDb.create(workspaceId, userId, title, description)

  // Extract memory (non-blocking)
  extractFromTimeline(workspaceId, milestone.id, title, description).catch((error) => {
    console.error('Background memory extraction failed:', error)
  })

  return NextResponse.json({ success: true, milestone })
}
```

**Result**: Goals, collaborators, and achievements are added to memory graph.

---

## 🎨 Moodboard Integration

### Extract Memory from Moodboards

```typescript
// apps/loopos/src/app/api/moodboards/route.ts (or similar)
import { extractFromMoodboard } from '@/lib/memory/extraction'

export async function POST(req: Request) {
  const { workspaceId, userId, title, images } = await req.json()

  // Create moodboard
  const moodboard = await moodboardDb.create(workspaceId, userId, title, images)

  // Extract memory (non-blocking)
  extractFromMoodboard(workspaceId, moodboard.id, title, images).catch((error) => {
    console.error('Background memory extraction failed:', error)
  })

  return NextResponse.json({ success: true, moodboard })
}
```

**Result**: Visual motifs and aesthetic themes are learned from moodboards.

---

## 📊 Usage Analytics Integration

### Periodic Memory Extraction from Usage Patterns

```typescript
// apps/loopos/src/lib/memory/jobs/extractUsage.ts (cron job or scheduled task)
import { extractFromUsage } from '@/lib/memory/extraction'

export async function extractUsageMemory(workspaceId: string) {
  // Analyse usage data
  const summary = {
    topFeatures: ['Designer', 'Coach', 'Packs'],
    activityPattern: 'Late night creative bursts',
    focusAreas: ['Visual branding', 'AI experimentation'],
  }

  // Extract memory
  await extractFromUsage(workspaceId, summary)
}
```

**Result**: Working patterns and skill development are captured in memory.

---

## 🧪 Testing Memory Integration

### 1. Create Test Content

```bash
# Create journal entry
POST /api/journal
{ "workspaceId": "...", "userId": "...", "content": "Working on dark, nostalgic lo-fi beats" }

# Check memory extraction
GET /api/memory/nodes?workspaceId=...
```

### 2. Verify Memory Context

```bash
# Get artist identity
GET /api/memory/identity?workspaceId=...

# Expected: themes like "nostalgia", tones like "dark", genres like "lo-fi"
```

### 3. Test AI Personalisation

```bash
# Ask Coach for advice (should reference themes/tones)
POST /api/coach
{ "workspaceId": "...", "message": "What should I focus on next?" }

# Expected: Coach mentions your nostalgic themes and lo-fi direction
```

---

## 🚀 Best Practices

### Non-Blocking Extraction
Always run extraction in background (don't await):
```typescript
extractFromJournal(workspaceId, entryId, content).catch(console.error)
```

### Error Handling
Extraction failures should not break features:
```typescript
try {
  await extractFromCoach(workspaceId, conversationId, messages)
} catch (error) {
  console.error('Memory extraction failed (non-critical):', error)
  // Feature continues working
}
```

### Memory Availability
Always check if memory exists:
```typescript
const memoryContext = await getCoachMemoryContext(workspaceId)
// If no memory, memoryContext.prompt will be empty string
// AI still works, just without personalisation
```

---

## 📈 Monitoring Memory Growth

### Check Memory Stats

```typescript
const identity = await memoryDb.identity.get(workspaceId)
console.log(`Nodes: ${identity.node_count}, Edges: ${identity.edge_count}`)
```

### View Recent Nodes

```typescript
const recentNodes = await memoryDb.nodes.list(workspaceId, 20)
console.log('Recent memory:', recentNodes.map(n => `${n.kind}: ${n.label}`))
```

---

## 🎯 Summary

| Feature | Integration Point | Extraction Trigger |
|---------|------------------|-------------------|
| **Coach** | Inject context into system prompt | After conversation |
| **Designer** | Inject context into scene prompt | After scene generation |
| **Packs** | Inject context into generation prompt | After pack creation |
| **Journal** | N/A | After entry creation |
| **Timeline** | N/A | After milestone creation |
| **Moodboard** | N/A | After moodboard creation |

**Key Principle**: Memory extraction is **non-blocking** and **non-critical**. Features work with or without memory.
