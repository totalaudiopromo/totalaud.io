#!/usr/bin/env node
/**
 * Architecture Review Orchestration
 *
 * Live demonstration of 3-agent architectural review
 * Run: pnpm tsx archReview.tsx
 */

import React from 'react'
import { render } from 'ink'
import CrewConsole, { AgentStatus, AgentId } from './crewConsole.js'

async function* architecturalReview(): AsyncGenerator<AgentStatus> {
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  // Orchestrator kicks off
  yield { id: 'orchestrator', progress: 10, state: 'running', message: 'Parsing review request...' }
  await sleep(800)
  yield { id: 'orchestrator', progress: 30, state: 'running', message: 'Delegating to 3 agents...' }
  await sleep(600)
  yield { id: 'orchestrator', progress: 50, state: 'done', message: 'Review plan ready' }

  // ========================================
  // 1️⃣ FLOW ARCHITECT — Structure Audit
  // ========================================
  await sleep(500)
  yield {
    id: 'flow_architect',
    progress: 0,
    state: 'running',
    message: 'Reading workspaceStore.ts',
  }
  await sleep(1200)
  yield {
    id: 'flow_architect',
    progress: 20,
    state: 'running',
    message: 'Analyzing 30+ actions...',
  }
  await sleep(1000)
  yield {
    id: 'flow_architect',
    progress: 40,
    state: 'running',
    message: 'Validating TypeScript interfaces',
  }
  await sleep(1100)
  yield {
    id: 'flow_architect',
    progress: 60,
    state: 'running',
    message: 'Checking cascade delete logic',
  }
  await sleep(900)
  yield {
    id: 'flow_architect',
    progress: 80,
    state: 'running',
    message: 'Auditing derived state getters',
  }
  await sleep(800)
  yield { id: 'flow_architect', progress: 95, state: 'running', message: 'Writing findings...' }
  await sleep(700)
  yield { id: 'flow_architect', progress: 100, state: 'done', message: 'Score: 95/100 ✓' }

  // ========================================
  // 2️⃣ REALTIME ENGINEER — Performance Test
  // ========================================
  await sleep(500)
  yield {
    id: 'realtime_engineer',
    progress: 0,
    state: 'running',
    message: 'Analyzing re-render patterns',
  }
  await sleep(1000)
  yield {
    id: 'realtime_engineer',
    progress: 25,
    state: 'running',
    message: 'Benchmarking 200 campaigns...',
  }
  await sleep(1500)
  yield {
    id: 'realtime_engineer',
    progress: 50,
    state: 'running',
    message: '60fps confirmed at 200 items',
  }
  await sleep(1200)
  yield {
    id: 'realtime_engineer',
    progress: 70,
    state: 'running',
    message: 'Testing 1000 targets...',
  }
  await sleep(1300)
  yield {
    id: 'realtime_engineer',
    progress: 85,
    state: 'running',
    message: '⚠️  45fps at 1000 items (needs memo)',
  }
  await sleep(900)
  yield { id: 'realtime_engineer', progress: 100, state: 'done', message: 'Score: 88/100 ✓' }

  // ========================================
  // 3️⃣ AESTHETIC CURATOR — Visual Audit
  // ========================================
  await sleep(500)
  yield {
    id: 'aesthetic_curator',
    progress: 0,
    state: 'running',
    message: 'Scanning 4 tab components',
  }
  await sleep(1000)
  yield {
    id: 'aesthetic_curator',
    progress: 30,
    state: 'running',
    message: 'Validating responsive grid',
  }
  await sleep(1100)
  yield {
    id: 'aesthetic_curator',
    progress: 50,
    state: 'running',
    message: 'Checking color consistency',
  }
  await sleep(1000)
  yield {
    id: 'aesthetic_curator',
    progress: 70,
    state: 'running',
    message: 'Measuring spacing tokens',
  }
  await sleep(900)
  yield {
    id: 'aesthetic_curator',
    progress: 90,
    state: 'running',
    message: 'Finding duplicated patterns',
  }
  await sleep(800)
  yield { id: 'aesthetic_curator', progress: 100, state: 'done', message: 'Score: 93/100 ✓' }

  // ========================================
  // ORCHESTRATOR — Aggregate Results
  // ========================================
  await sleep(600)
  yield {
    id: 'orchestrator',
    progress: 60,
    state: 'running',
    message: 'Aggregating 3 agent reports...',
  }
  await sleep(1000)
  yield {
    id: 'orchestrator',
    progress: 80,
    state: 'running',
    message: 'Generating ARCH_REVIEW_REPORT.md',
  }
  await sleep(1200)
  yield { id: 'orchestrator', progress: 100, state: 'done', message: 'Overall: A- (92/100) 🚀' }

  // Final summary
  await sleep(800)
  yield {
    id: 'orchestrator',
    progress: 100,
    state: 'done',
    message: '✅ Stage 1 APPROVED for Stage 2',
  }
}

// Run the orchestration
const feed = architecturalReview()
render(<CrewConsole feed={feed} />)
