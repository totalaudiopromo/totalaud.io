/**
 * ShowreelScriptEngine
 * Generates showreel scripts from campaign data
 */

import type { ShowreelScript, ShowreelScene, ShowreelCaption } from './showreelTypes';
import { nanoid } from 'nanoid';

export interface CampaignData {
  id: string;
  title: string;
  goal?: string;
  // Add more campaign properties as needed
}

export class ShowreelScriptEngine {
  /**
   * Generate a showreel script from campaign data
   */
  static generateScript(campaign: CampaignData): ShowreelScript {
    const scenes: ShowreelScene[] = [
      // Intro scene
      {
        id: nanoid(),
        type: 'intro',
        title: 'Intelligence Briefing',
        subtitle: campaign.title,
        durationSeconds: 4,
        emphasisMode: 'constellation',
        captions: [
          {
            text: `Campaign: ${campaign.title}`,
            startTime: 0.5,
            durationSeconds: 3,
          },
        ],
      },

      // Social graph scene
      {
        id: nanoid(),
        type: 'social_graph',
        title: 'Network Analysis',
        subtitle: 'Mapping relationships',
        durationSeconds: 6,
        emphasisMode: 'graph',
        performanceSnapshot: {
          cohesion: 0.6,
          tension: 0.3,
        },
        captions: [
          {
            text: 'Building social connections across platforms',
            startTime: 1,
            durationSeconds: 4,
          },
        ],
      },

      // Cohesion arc scene
      {
        id: nanoid(),
        type: 'cohesion_arc',
        title: 'Team Cohesion',
        subtitle: 'Operating systems align',
        durationSeconds: 5,
        emphasisMode: 'full',
        performanceSnapshot: {
          cohesion: 0.85,
          tension: 0.2,
          momentum: 0.7,
        },
        captions: [
          {
            text: 'Agents synchronise strategy',
            startTime: 0.5,
            durationSeconds: 4,
          },
        ],
      },

      // Tension peak scene
      {
        id: nanoid(),
        type: 'tension_peak',
        title: 'Challenge Response',
        subtitle: 'Adapting to obstacles',
        durationSeconds: 5,
        emphasisMode: 'leader',
        performanceSnapshot: {
          cohesion: 0.5,
          tension: 0.8,
          momentum: 0.6,
        },
        captions: [
          {
            text: 'Navigating complexity with intelligence',
            startTime: 0.5,
            durationSeconds: 4,
          },
        ],
      },

      // Evolution spark scene
      {
        id: nanoid(),
        type: 'evolution_spark',
        title: 'Breakthrough',
        subtitle: 'New patterns emerge',
        durationSeconds: 5,
        emphasisMode: 'evolution',
        performanceSnapshot: {
          cohesion: 0.9,
          tension: 0.1,
          momentum: 0.95,
        },
        captions: [
          {
            text: 'Innovation through collaboration',
            startTime: 0.5,
            durationSeconds: 4,
          },
        ],
      },

      // Resolution scene
      {
        id: nanoid(),
        type: 'resolution',
        title: 'Mission Complete',
        subtitle: 'Goals achieved',
        durationSeconds: 4,
        emphasisMode: 'full',
        performanceSnapshot: {
          cohesion: 1.0,
          tension: 0.0,
          momentum: 1.0,
        },
        captions: [
          {
            text: campaign.goal || 'Campaign objectives met',
            startTime: 0.5,
            durationSeconds: 3,
          },
        ],
      },

      // Outro scene
      {
        id: nanoid(),
        type: 'outro',
        title: 'totalaud.io',
        subtitle: 'Intelligence-driven music promotion',
        durationSeconds: 3,
        emphasisMode: 'constellation',
        captions: [
          {
            text: 'Powered by multi-agent intelligence',
            startTime: 0.5,
            durationSeconds: 2,
          },
        ],
      },
    ];

    const totalDurationSeconds = scenes.reduce(
      (sum, scene) => sum + scene.durationSeconds,
      0
    );

    return {
      id: nanoid(),
      campaignId: campaign.id,
      title: `${campaign.title} - Showreel`,
      totalDurationSeconds,
      scenes,
      createdAt: new Date(),
    };
  }
}
