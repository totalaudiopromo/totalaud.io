# totalaud.io Claude Sub-Agents

## Overview

This directory contains specialized Claude agent templates for the totalaud.io project. Each agent has a specific domain of expertise and can be invoked by the **Orchestrator** to handle focused tasks.

## Architecture

```
Developer Request
       ↓
   Orchestrator (reads request, decomposes into tasks)
       ↓
   Sub-Agents (execute domain-specific work)
       ↓
   Orchestrator (summarizes results, merges changes)
       ↓
   Changelog + Summary
```

## Available Sub-Agents

| Agent | Role | Key Files |
|-------|------|-----------|
| **Flow Architect** | BaseWorkflow consistency, Studio variants | `BaseWorkflow.tsx`, `Studios/*.tsx` |
| **Sound Director** | Audio asset organization, Web Audio integration | `AmbientSoundLayer.tsx`, `/public/sounds/` |
| **Motion Choreographer** | Animation curves, timing, micro-interactions | `/lib/motion.ts`, theme configs |
| **Experience Composer** | UX flow, friction analysis, onboarding | `Onboarding/*.tsx`, `/specs/` |
| **Signal Writer** | Narrative tone, signal> messages | Theme configs, Studio components |
| **Realtime Engineer** | Supabase Realtime, event batching | `/hooks/useRealtimeAgents.ts` |
| **Analytics Analyst** | Event tracking, privacy-respecting telemetry | `/lib/analytics.ts` |
| **Aesthetic Curator** | Design tokens, visual consistency | Theme configs, `/specs/STYLE_GUIDE.md` |
| **Orchestrator** | Task decomposition, coordination | All sub-agents |

## Usage

### Invoking Sub-Agents Directly
You can invoke a sub-agent by referencing its `.claude` file:

```
"Act as the Flow Architect. Review all Studio workflows for prop duplication and unify the interface."
```

### Invoking via Orchestrator
The recommended approach is to let the Orchestrator decompose tasks:

```
"Claude, improve motion across Studios and update signal prompt tone."
→ Orchestrator activates Motion Choreographer + Signal Writer
```

## Agent Communication Protocol

Each sub-agent follows this structure:

1. **Read context files** listed in their template
2. **Execute tasks** within their domain
3. **Output report** in standardized format
4. **Return to Orchestrator** for integration

## File Structure

```
/agents/
├── README.md                    # This file
├── orchestrator.claude          # Central coordinator
├── flowArchitect.claude         # BaseWorkflow & Studio consistency
├── soundDirector.claude         # Audio asset management
├── motionChoreographer.claude   # Animation & timing
├── experienceComposer.claude    # UX flow & onboarding
├── signalWriter.claude          # Narrative & tone
├── realtimeEngineer.claude      # Supabase Realtime integration
├── analyticsAnalyst.claude      # Event tracking & telemetry
└── aestheticCurator.claude      # Design tokens & visual consistency
```

## Example Workflows

### 1. Visual Consistency Audit
```
User: "Audit visual consistency across all Studios"
Orchestrator:
  → Activates: Aesthetic Curator
  → Reviews theme configs, components, CSS
  → Generates STYLE_GUIDE.md
  → Reports inconsistencies + fixes
```

### 2. First-Hour UX Improvement
```
User: "Improve first-hour experience for new users"
Orchestrator:
  → Activates: Experience Composer, Signal Writer, Analytics Analyst
  → Experience Composer: Maps user journey, finds friction
  → Signal Writer: Rewrites onboarding messages
  → Analytics Analyst: Adds telemetry events
  → Reports combined improvements
```

### 3. Realtime Agent Integration
```
User: "Add live agent updates to all Studios"
Orchestrator:
  → Activates: Realtime Engineer, Flow Architect, Motion Choreographer
  → Realtime Engineer: Builds useRealtimeAgents hook
  → Flow Architect: Wires to BaseWorkflow
  → Motion Choreographer: Adds smooth update animations
  → Reports integrated system
```

## Success Metrics

Each sub-agent reports:
- **Files changed**: Explicit list of modified files
- **Success criteria met**: Checkmarks for requirements
- **Performance impact**: Metrics where applicable
- **Documentation updated**: Links to generated docs

## Orchestrator Changelog

All AI commits are logged in `/changelog/AI_COMMITS.md` with:
- Timestamp
- Sub-agents activated
- Files changed
- Summary of work

## Developer Experience

Benefits:
- **Focus**: Each agent specializes in one domain
- **Clarity**: Standardized output format
- **Context**: Agents read relevant files automatically
- **Coordination**: Orchestrator handles task decomposition
- **Transparency**: Changelog tracks all AI changes

## Next Steps

To use these agents:
1. Read the Orchestrator template to understand coordination
2. Invoke sub-agents via natural language requests
3. Review output reports and changed files
4. Check `/changelog/AI_COMMITS.md` for audit trail

---

**Last Updated**: January 2025
**Status**: All 9 sub-agents defined + Orchestrator ready
**Philosophy**: Specialized roles, clear communication, automated coordination
