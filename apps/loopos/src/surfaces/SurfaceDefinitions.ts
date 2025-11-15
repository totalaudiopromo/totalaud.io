import type { SurfaceDefinition } from '@/types'

/**
 * Cross-App Surface Definitions
 *
 * These define the data structures and interfaces that LoopOS will use
 * to communicate with other apps in the totalaud.io ecosystem.
 *
 * NOTE: These are preview-only. No actual API calls are made to other apps.
 */

export const consoleSurface: SurfaceDefinition = {
  id: 'console-surface',
  name: 'Console Integration',
  targetApp: 'console',
  dataSchema: {
    type: 'object',
    properties: {
      nodeId: { type: 'string' },
      nodeType: { type: 'string', enum: ['create', 'promote', 'analyse', 'refine'] },
      title: { type: 'string' },
      description: { type: 'string' },
      priority: { type: 'number' },
      createdAt: { type: 'string' },
    },
  },
  previewData: {
    nodeId: 'node-123',
    nodeType: 'promote',
    title: 'Radio promo campaign for new single',
    description: 'Target BBC Radio 1, 6 Music, and regional stations',
    priority: 85,
    createdAt: new Date().toISOString(),
  },
}

export const audioIntelSurface: SurfaceDefinition = {
  id: 'audio-intel-surface',
  name: 'Audio Intel Integration',
  targetApp: 'audio-intel',
  dataSchema: {
    type: 'object',
    properties: {
      analysisType: { type: 'string', enum: ['audience', 'trends', 'competitors'] },
      query: { type: 'string' },
      dateRange: {
        type: 'object',
        properties: {
          start: { type: 'string' },
          end: { type: 'string' },
        },
      },
      sourceNodes: { type: 'array', items: { type: 'string' } },
    },
  },
  previewData: {
    analysisType: 'audience',
    query: 'Electronic music listeners UK 18-35',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    },
    sourceNodes: ['node-456', 'node-789'],
  },
}

/**
 * Example pipelines showing how data flows between apps
 */
export const examplePipelines = {
  'loopos-to-console': {
    name: 'LoopOS → Console',
    description: 'Send promotional nodes to Console for radio campaign execution',
    steps: [
      {
        step: 1,
        action: 'User selects "promote" node in LoopOS',
        app: 'loopos',
      },
      {
        step: 2,
        action: 'Clicks "Export to Console" in Node Inspector',
        app: 'loopos',
      },
      {
        step: 3,
        action: 'Node data sent to Console API',
        app: 'bridge',
      },
      {
        step: 4,
        action: 'Console creates campaign from node data',
        app: 'console',
      },
      {
        step: 5,
        action: 'User manages campaign in Console',
        app: 'console',
      },
    ],
  },
  'loopos-to-audio-intel': {
    name: 'LoopOS → Audio Intel',
    description: 'Request audience analysis based on creative loop themes',
    steps: [
      {
        step: 1,
        action: 'LoopOS Auto-Looper identifies emerging themes',
        app: 'loopos',
      },
      {
        step: 2,
        action: 'User requests audience analysis',
        app: 'loopos',
      },
      {
        step: 3,
        action: 'Analysis request sent to Audio Intel API',
        app: 'bridge',
      },
      {
        step: 4,
        action: 'Audio Intel runs audience research',
        app: 'audio-intel',
      },
      {
        step: 5,
        action: 'Results returned to LoopOS for loop refinement',
        app: 'loopos',
      },
    ],
  },
}
