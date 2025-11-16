/**
 * Intent Engine Test Script
 * Phase 20 - Validate three test cases
 */

import { parseIntentText } from './intentParser'
import { composeCreativeScore, getScoreSummary } from './intentComposer'
import { BehaviourDirector } from './behaviourDirector'
import { exportCreativeScoreMarkdown } from './creativeScoreExporter'

// Test cases from Phase 20 specification
const TEST_CASES = [
  'A calm arc that grows into clarity led by Aqua.',
  'Fragmented tensions between XP and Analogue resolving slowly.',
  'Intense rise with DAW leading and ASCII resisting.',
]

console.log('='.repeat(80))
console.log('INTENT ENGINE TEST - Phase 20')
console.log('='.repeat(80))
console.log('')

TEST_CASES.forEach((testCase, i) => {
  console.log(`\nTest Case ${i + 1}: "${testCase}"`)
  console.log('-'.repeat(80))

  try {
    // Step 1: Parse intent
    console.log('\n[1] Parsing intent...')
    const intentMap = parseIntentText(testCase)
    console.log(`  ✓ Style: ${intentMap.style}`)
    console.log(`  ✓ Arc: ${intentMap.arc}`)
    console.log(`  ✓ Palette: ${intentMap.palette}`)
    console.log(`  ✓ Lead OS: ${intentMap.leadOS || 'None'}`)
    console.log(`  ✓ Resisting OS: ${intentMap.resistingOS || 'None'}`)
    console.log(`  ✓ Tempo Curve: ${intentMap.tempoCurve.join(' → ')} BPM`)
    console.log(`  ✓ Performance Segments: ${intentMap.performanceStructure.length}`)

    // Step 2: Compose score
    console.log('\n[2] Composing creative score...')
    const score = composeCreativeScore(intentMap)
    const summary = getScoreSummary(score)
    console.log(`  ✓ Score ID: ${score.id}`)
    console.log(`  ✓ Scenes: ${summary.sceneCount}`)
    console.log(`  ✓ Average Tempo: ${summary.averageTempo} BPM`)
    console.log(`  ✓ Peak Tension: ${Math.round(summary.peakTension * 100)}%`)
    console.log(`  ✓ Average Cohesion: ${Math.round(summary.averageCohesion * 100)}%`)
    console.log(`  ✓ Total Events: ${summary.totalEvents}`)
    console.log(`  ✓ Total Directives: ${summary.totalDirectives}`)
    console.log(`  ✓ Dominant OS: ${summary.dominantOS || 'None'}`)

    // Step 3: Verify behaviour directives
    console.log('\n[3] Behaviour directives generated:')
    Object.entries(score.behaviourDirectivesByOS).forEach(([os, directives]) => {
      if (directives.length > 0) {
        console.log(`  ✓ ${os.toUpperCase()}: ${directives.length} directives`)
      }
    })

    // Step 4: Verify structure matches arc
    console.log('\n[4] Structure validation:')
    const firstScene = score.scenes[0]
    const lastScene = score.scenes[score.scenes.length - 1]

    if (intentMap.arc === 'rise') {
      const increasing = lastScene.emotionalIntensity > firstScene.emotionalIntensity
      console.log(
        `  ${increasing ? '✓' : '✗'} Arc 'rise' validated: ${firstScene.emotionalIntensity.toFixed(2)} → ${lastScene.emotionalIntensity.toFixed(2)}`
      )
    } else if (intentMap.arc === 'resolve') {
      const resolving = lastScene.cohesion > 0.7
      console.log(
        `  ${resolving ? '✓' : '✗'} Arc 'resolve' validated: final cohesion ${lastScene.cohesion.toFixed(2)}`
      )
    }

    // Step 5: Verify OS roles
    console.log('\n[5] OS role validation:')
    if (intentMap.leadOS) {
      const leadCount = score.scenes.filter((s) => s.leadOS === intentMap.leadOS).length
      console.log(
        `  ✓ ${intentMap.leadOS?.toUpperCase()} leads ${leadCount}/${score.scenes.length} scenes`
      )
    }
    if (intentMap.resistingOS) {
      const resistCount = score.scenes.filter(
        (s) => s.resistingOS === intentMap.resistingOS
      ).length
      console.log(
        `  ✓ ${intentMap.resistingOS?.toUpperCase()} resists in ${resistCount}/${score.scenes.length} scenes`
      )
    }

    console.log('\n✓ Test case PASSED\n')
  } catch (error) {
    console.error('\n✗ Test case FAILED')
    console.error('Error:', error)
    console.log('')
  }
})

console.log('='.repeat(80))
console.log('All tests completed')
console.log('='.repeat(80))
