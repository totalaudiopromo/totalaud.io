/**
 * Hero Demo Script
 * Phase 13E: 7-Chapter Cinematic Demo
 *
 * Apple Event meets Ableton Session View
 */

import { DemoScriptBuilder } from '@totalaud/demo'

export function getDemoScript() {
  return new DemoScriptBuilder(
    'totalaud.io — The Living Creative Collaborator',
    'A cinematic journey through multi-OS agent intelligence for music promotion'
  )
    // ========================================================================
    // CHAPTER 1: INTRODUCTION
    // ========================================================================
    .chapter(
      'Welcome',
      'Where operator becomes signal'
    )
    .fadeIn()
    .wait(1000)
    .caption('This is totalaud.io', 3000)
    .wait(3500)
    .caption('A workspace where five operating systems collaborate', 4000)
    .wait(4500)
    .caption('Each with its own personality, memory, and evolution', 4000)
    .wait(4500)
    .caption('Let\'s explore how they work together', 3000)
    .wait(3500)
    .fadeOut()

    // ========================================================================
    // CHAPTER 2: AGENTS
    // ========================================================================
    .chapter(
      'Agents',
      'Autonomous intelligence running in the background'
    )
    .fadeIn()
    .wait(1000)
    .caption('Meet your agents: Scout, Coach, Tracker, and Insight', 4000)
    .wait(4500)
    .caption('They work autonomously, scanning for opportunities', 4000)
    .wait(4500)
    .showTimeline()
    .wait(1000)
    .caption('Scout finds new radio contacts and playlist opportunities', 4000)
    .addClip({
      id: 'demo-clip-1',
      trackId: 'track-1',
      name: 'BBC Radio 1 - Annie Mac',
      startTime: 0,
      duration: 4,
      colour: '#00ff99',
      agentSource: 'scout',
      cardLinks: [],
      metadata: { demo: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .wait(5000)
    .caption('Coach guides your campaign strategy and timing', 4000)
    .addClip({
      id: 'demo-clip-2',
      trackId: 'track-1',
      name: 'Follow-up: Annie Mac',
      startTime: 8,
      duration: 3,
      colour: '#3478f6',
      agentSource: 'coach',
      cardLinks: [],
      metadata: { demo: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .wait(5000)
    .caption('Together, they build your promotional timeline', 3000)
    .wait(3500)
    .fadeOut()

    // ========================================================================
    // CHAPTER 3: LOOPS
    // ========================================================================
    .chapter(
      'Loops',
      'Continuous improvement through autonomous execution'
    )
    .fadeIn()
    .wait(1000)
    .caption('Loops run every 5 minutes, 15 minutes, or hourly', 4000)
    .wait(4500)
    .caption('They analyze your campaign and suggest improvements', 4000)
    .wait(4500)
    .caption('Scout: "I noticed a gap in your radio outreach"', 3500)
    .wait(4000)
    .caption('Coach: "Your follow-up timing could be tighter"', 3500)
    .wait(4000)
    .caption('These suggestions become new timeline clips', 3000)
    .wait(3500)
    .caption('The system learns and adapts as you work', 3000)
    .wait(3500)
    .fadeOut()

    // ========================================================================
    // CHAPTER 4: FUSION
    // ========================================================================
    .chapter(
      'Fusion Mode',
      'Five OS perspectives, one decision'
    )
    .fadeIn()
    .wait(1000)
    .caption('Sometimes you need all five perspectives at once', 4000)
    .wait(4500)
    .enableLiveFusion()
    .showFusion('campaign', 'demo-campaign')
    .wait(2000)
    .caption('ASCII: Fast, minimal, logical', 2500)
    .wait(3000)
    .caption('XP: Enthusiastic, helpful, nostalgic', 2500)
    .wait(3000)
    .caption('Aqua: Thoughtful, refined, perfectionist', 2500)
    .wait(3000)
    .caption('DAW: Rhythmic, experimental, creative', 2500)
    .wait(3000)
    .caption('Analogue: Warm, empathetic, human', 2500)
    .wait(3000)
    .caption('They debate, agree, and sometimes disagree', 3500)
    .wait(4000)
    .caption('Consensus creates shared memory', 3000)
    .wait(3500)
    .caption('Tension creates learning opportunities', 3000)
    .wait(3500)
    .hideFusion()
    .disableLiveFusion()
    .fadeOut()

    // ========================================================================
    // CHAPTER 5: MEMORY
    // ========================================================================
    .chapter(
      'Memory',
      'Context that persists across sessions'
    )
    .fadeIn()
    .wait(1000)
    .caption('Every important decision becomes a memory', 3500)
    .wait(4000)
    .caption('Each OS remembers differently', 3000)
    .wait(3500)
    .caption('ASCII: "Radio 1 Annie Mac confirmed interest"', 3000)
    .wait(3500)
    .caption('Analogue: "User felt excited about this opportunity"', 3500)
    .wait(4000)
    .caption('These memories inform future decisions', 3000)
    .wait(3500)
    .caption('Creating a living, evolving knowledge base', 3500)
    .wait(4000)
    .fadeOut()

    // ========================================================================
    // CHAPTER 6: EVOLUTION
    // ========================================================================
    .chapter(
      'Evolution',
      'OS personalities drift over time'
    )
    .fadeIn()
    .wait(1000)
    .caption('Each OS personality changes based on your campaign', 4500)
    .wait(5000)
    .caption('Success makes them more confident', 3000)
    .triggerEvolution('xp', 'agent_success')
    .wait(3500)
    .caption('Warnings make them more cautious', 3000)
    .triggerEvolution('aqua', 'agent_warning')
    .wait(3500)
    .caption('Consensus makes them more hopeful', 3000)
    .triggerEvolution('daw', 'fusion_agreement')
    .wait(3500)
    .showEvolutionPanel('xp')
    .wait(2000)
    .caption('XP has become 15% more confident and talkative', 4000)
    .wait(4500)
    .hideEvolutionPanel()
    .wait(500)
    .caption('Your OSs become uniquely yours', 3500)
    .wait(4000)
    .fadeOut()

    // ========================================================================
    // CHAPTER 7: SOCIAL GRAPH
    // ========================================================================
    .chapter(
      'Social Graph',
      'OS relationships form a living social system'
    )
    .fadeIn()
    .wait(1000)
    .caption('As OSs interact, they form relationships with each other', 4500)
    .wait(5000)
    .caption('Fusion agreement builds trust and synergy', 3500)
    .wait(4000)
    .caption('Fusion tension creates challenges and learning', 3500)
    .wait(4000)
    .caption('Over time, clear social roles emerge', 3000)
    .wait(3500)
    .showSocialGraph()
    .wait(2000)
    .caption('The Creative Intelligence Board reveals the social dynamics', 4000)
    .wait(4500)
    .caption('Leader OS: Guides most decisions with high trust', 3500)
    .wait(4000)
    .caption('Support OSs: Collaborate and reinforce the direction', 3500)
    .wait(4000)
    .caption('Challenger OSs: Push back, question, and explore alternatives', 4000)
    .wait(4500)
    .caption('Trust, synergy, and tension shape the collective intelligence', 4000)
    .wait(4500)
    .hideSocialGraph()
    .wait(500)
    .caption('An emergent identity unique to your campaign', 3500)
    .wait(4000)
    .fadeOut()

    // ========================================================================
    // CHAPTER 8: INTELLIGENCE TIME TRAVEL
    // ========================================================================
    .chapter(
      'Intelligence Time Travel',
      'They don\'t just react. They remember and change together.'
    )
    .fadeIn()
    .wait(1000)
    .caption('The Creative Intelligence Board tracks everything', 3500)
    .wait(4000)
    .caption('Trust building over time', 2500)
    .wait(3000)
    .caption('Tension resolving through collaboration', 3000)
    .wait(3500)
    .caption('Cohesion rising as OSs learn to work together', 3500)
    .wait(4000)
    .caption('Scrub through time to see how your collective evolved', 4000)
    .wait(4500)
    .caption('Point-in-time snapshots capture identity at key moments', 4000)
    .wait(4500)
    .caption('Analytics reveal trust/tension arcs and leadership shifts', 4000)
    .wait(4500)
    .caption('Intelligence stories narrate the journey automatically', 4000)
    .wait(4500)
    .caption('A living record of your campaign\'s creative intelligence', 4000)
    .wait(4500)
    .fadeOut()

    // ========================================================================
    // CHAPTER 9: FINALE
    // ========================================================================
    .chapter(
      'The Living Collaborator',
      'All systems. One vision.'
    )
    .fadeIn()
    .wait(1000)
    .caption('Agents running autonomous loops', 2500)
    .wait(3000)
    .caption('Five OSs debating in fusion mode', 2500)
    .wait(3000)
    .caption('Memories informing every decision', 2500)
    .wait(3000)
    .caption('Personalities evolving with every interaction', 3000)
    .wait(3500)
    .caption('This is totalaud.io', 2500)
    .wait(3000)
    .caption('Your cinematic creative collaborator', 3000)
    .wait(3500)
    .caption('Built for music promotion', 2500)
    .wait(3000)
    .caption('Designed for innovation', 2500)
    .wait(3000)
    .fadeOut(1000)
    .wait(2000)
    .build()
}
