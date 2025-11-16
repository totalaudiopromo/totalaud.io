import { z } from 'zod'

// Scene element types
export type ElementType = 'milestone' | 'arc' | 'cluster' | 'timeline' | 'theme' | 'metric'

export interface SceneElement {
  id: string
  type: ElementType
  position: [number, number, number] // x, y, z for depth
  title: string
  description?: string
  colour: string
  size: number
  metadata?: Record<string, unknown>
}

export interface Arc {
  id: string
  from: string // element id
  to: string // element id
  label?: string
  colour: string
  strength: number // 0-1
}

export type SceneType = 'release-strategy' | 'audience-development' | 'growth-30day' | 'epk-structure' | 'creative-identity'

export interface Scene {
  id: string
  type: SceneType
  title: string
  narrative: string
  elements: SceneElement[]
  arcs: Arc[]
  recommendations: string[]
  metadata: Record<string, unknown>
  generated_at: string
}

export const SceneTypeSchema = z.enum([
  'release-strategy',
  'audience-development',
  'growth-30day',
  'epk-structure',
  'creative-identity',
])

export interface DesignerContext {
  workspaceId: string
  workspaceName: string
  nodes?: any[]
  packs?: any[]
  journal?: any[]
  insights?: any[]
}

export interface SceneGenerationRequest {
  type: SceneType
  context: DesignerContext
  refinement?: string
}

export interface SceneGenerationResponse {
  scene: Scene
  processingTime: number
}
