import { ai } from '../ai'
import type { Scene, SceneType, DesignerContext, SceneElement, Arc } from './types'
import { nanoid } from 'nanoid'

export const sceneGenerator = {
  async generateScene(
    type: SceneType,
    context: DesignerContext,
    refinement?: string
  ): Promise<Scene> {
    if (!ai.isConfigured()) {
      throw new Error('AI is not configured. Please add your Anthropic API key.')
    }

    const prompt = buildPrompt(type, context, refinement)
    const startTime = Date.now()

    try {
      const response = await ai.chat([{ role: 'user', content: prompt }])

      // Parse AI response (expecting JSON)
      const sceneData = parseSceneResponse(response, type)

      return {
        id: nanoid(),
        type,
        ...sceneData,
        generated_at: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Scene generation error:', error)

      // Fallback to template-based scene
      return generateTemplateScene(type, context)
    }
  },
}

function buildPrompt(type: SceneType, context: DesignerContext, refinement?: string): string {
  let basePrompt = `You are a creative campaign visualisation designer. Generate a visual scene for a "${type}" campaign strategy.

Workspace: ${context.workspaceName}
Nodes: ${context.nodes?.length || 0} campaign elements
Packs: ${context.packs?.length || 0} creative packs
Journal entries: ${context.journal?.length || 0} reflections

Create a visual scene with:
1. Scene elements (milestones, clusters, themes, metrics)
2. Arcs connecting related elements
3. A narrative summary
4. Strategic recommendations

Return JSON in this format:
{
  "title": "Scene title",
  "narrative": "2-3 sentence story of the campaign",
  "elements": [
    {
      "id": "unique-id",
      "type": "milestone|cluster|theme|metric",
      "position": [x, y, z],
      "title": "Element title",
      "description": "Brief description",
      "colour": "#HEX",
      "size": 1-5,
      "metadata": {}
    }
  ],
  "arcs": [
    {
      "id": "arc-id",
      "from": "element-id",
      "to": "element-id",
      "label": "Connection label",
      "colour": "#HEX",
      "strength": 0.5-1.0
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "metadata": {}
}`

  if (refinement) {
    basePrompt += `\n\nUser refinement request: ${refinement}`
  }

  return basePrompt
}

function parseSceneResponse(response: string, type: SceneType): Omit<Scene, 'id' | 'type' | 'generated_at'> {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')

    const data = JSON.parse(jsonMatch[0])

    return {
      title: data.title || 'Untitled Scene',
      narrative: data.narrative || 'Campaign visualisation',
      elements: data.elements || [],
      arcs: data.arcs || [],
      recommendations: data.recommendations || [],
      metadata: data.metadata || {},
    }
  } catch (error) {
    throw new Error('Failed to parse scene response')
  }
}

function generateTemplateScene(type: SceneType, context: DesignerContext): Scene {
  const templates: Record<SceneType, () => Omit<Scene, 'id' | 'generated_at'>> = {
    'release-strategy': () => releaseStrategyTemplate(context),
    'audience-development': () => audienceDevelopmentTemplate(context),
    'growth-30day': () => growth30DayTemplate(context),
    'epk-structure': () => epkStructureTemplate(context),
    'creative-identity': () => creativeIdentityTemplate(context),
  }

  const sceneData = templates[type]()

  return {
    id: nanoid(),
    ...sceneData,
    generated_at: new Date().toISOString(),
  }
}

// Template generators
function releaseStrategyTemplate(context: DesignerContext): Omit<Scene, 'id' | 'generated_at'> {
  const elements: SceneElement[] = [
    {
      id: 'pre-release',
      type: 'milestone',
      position: [-200, 0, 0],
      title: 'Pre-Release Build',
      description: '8 weeks of audience warming',
      colour: '#FFB800',
      size: 3,
    },
    {
      id: 'release-week',
      type: 'milestone',
      position: [0, 0, 10],
      title: 'Release Week',
      description: 'Launch + first-week push',
      colour: '#3AA9BE',
      size: 5,
    },
    {
      id: 'post-release',
      type: 'milestone',
      position: [200, 0, 0],
      title: 'Post-Release',
      description: 'Sustained promotion',
      colour: '#06FFA5',
      size: 3,
    },
  ]

  const arcs: Arc[] = [
    {
      id: 'arc-1',
      from: 'pre-release',
      to: 'release-week',
      label: 'Momentum builds',
      colour: '#3AA9BE',
      strength: 0.8,
    },
    {
      id: 'arc-2',
      from: 'release-week',
      to: 'post-release',
      label: 'Maintain energy',
      colour: '#06FFA5',
      strength: 0.7,
    },
  ]

  return {
    type: 'release-strategy',
    title: 'Three-Act Release Strategy',
    narrative: 'Your campaign follows a three-act structure: building anticipation, launching with impact, and sustaining momentum through strategic follow-through.',
    elements,
    arcs,
    recommendations: [
      'Start content drops 8 weeks before release',
      'Plan a coordinated push for release week',
      'Schedule follow-up content for weeks 2-6',
    ],
    metadata: { template: true },
  }
}

function audienceDevelopmentTemplate(context: DesignerContext): Omit<Scene, 'id' | 'generated_at'> {
  const elements: SceneElement[] = [
    {
      id: 'awareness',
      type: 'cluster',
      position: [-150, 100, 0],
      title: 'Awareness',
      description: 'Discovery channels',
      colour: '#FFB800',
      size: 4,
    },
    {
      id: 'engagement',
      type: 'cluster',
      position: [0, 0, 5],
      title: 'Engagement',
      description: 'Active listeners',
      colour: '#3AA9BE',
      size: 5,
    },
    {
      id: 'advocacy',
      type: 'cluster',
      position: [150, -100, 0],
      title: 'Advocacy',
      description: 'Super fans',
      colour: '#9D4EDD',
      size: 3,
    },
  ]

  const arcs: Arc[] = [
    {
      id: 'arc-1',
      from: 'awareness',
      to: 'engagement',
      label: 'Convert',
      colour: '#3AA9BE',
      strength: 0.6,
    },
    {
      id: 'arc-2',
      from: 'engagement',
      to: 'advocacy',
      label: 'Nurture',
      colour: '#9D4EDD',
      strength: 0.5,
    },
  ]

  return {
    type: 'audience-development',
    title: 'Audience Funnel',
    narrative: 'Build your audience through a three-stage funnel: attract attention, deepen engagement, and cultivate advocacy.',
    elements,
    arcs,
    recommendations: [
      'Focus on awareness through playlist placement',
      'Drive engagement with consistent content',
      'Reward advocates with exclusive access',
    ],
    metadata: { template: true },
  }
}

function growth30DayTemplate(context: DesignerContext): Omit<Scene, 'id' | 'generated_at'> {
  const elements: SceneElement[] = Array.from({ length: 4 }, (_, i) => ({
    id: `week-${i + 1}`,
    type: 'timeline' as const,
    position: [i * 100 - 150, 0, 0],
    title: `Week ${i + 1}`,
    description: `Focus area ${i + 1}`,
    colour: i === 0 ? '#FFB800' : i === 1 ? '#3AA9BE' : i === 2 ? '#06FFA5' : '#9D4EDD',
    size: 3,
  }))

  return {
    type: 'growth-30day',
    title: '30-Day Growth Sprint',
    narrative: 'A focused 4-week sprint to accelerate growth through coordinated weekly themes.',
    elements,
    arcs: [],
    recommendations: [
      'Week 1: Content creation sprint',
      'Week 2: Outreach to blogs and radio',
      'Week 3: Playlist pitching',
      'Week 4: Community engagement',
    ],
    metadata: { template: true },
  }
}

function epkStructureTemplate(context: DesignerContext): Omit<Scene, 'id' | 'generated_at'> {
  const elements: SceneElement[] = [
    {
      id: 'bio',
      type: 'theme',
      position: [-100, 50, 0],
      title: 'Artist Bio',
      colour: '#3AA9BE',
      size: 3,
    },
    {
      id: 'music',
      type: 'theme',
      position: [0, -50, 5],
      title: 'Music & Videos',
      colour: '#FFB800',
      size: 4,
    },
    {
      id: 'press',
      type: 'theme',
      position: [100, 50, 0],
      title: 'Press & Quotes',
      colour: '#9D4EDD',
      size: 3,
    },
  ]

  return {
    type: 'epk-structure',
    title: 'EPK Core Structure',
    narrative: 'Your electronic press kit centres on three pillars: compelling story, strong music, and social proof.',
    elements,
    arcs: [],
    recommendations: [
      'Lead with your strongest single',
      'Include 3-5 press quotes',
      'Keep bio under 200 words',
    ],
    metadata: { template: true },
  }
}

function creativeIdentityTemplate(context: DesignerContext): Omit<Scene, 'id' | 'generated_at'> {
  const elements: SceneElement[] = [
    {
      id: 'sound',
      type: 'theme',
      position: [0, 100, 0],
      title: 'Sonic Identity',
      description: 'Genre, influences, unique sound',
      colour: '#3AA9BE',
      size: 4,
    },
    {
      id: 'visual',
      type: 'theme',
      position: [-100, -50, 0],
      title: 'Visual Language',
      description: 'Artwork, photography, colour palette',
      colour: '#FFB800',
      size: 3,
    },
    {
      id: 'narrative',
      type: 'theme',
      position: [100, -50, 0],
      title: 'Story & Values',
      description: 'What you stand for',
      colour: '#9D4EDD',
      size: 3,
    },
  ]

  return {
    type: 'creative-identity',
    title: 'Brand Identity Map',
    narrative: 'Your creative identity emerges from the intersection of sonic, visual, and narrative elements.',
    elements,
    arcs: [],
    recommendations: [
      'Define your sonic signature',
      'Develop a consistent visual language',
      'Articulate your core values',
    ],
    metadata: { template: true },
  }
}
