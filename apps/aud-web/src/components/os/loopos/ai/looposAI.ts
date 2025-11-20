import { complete, type AIMessage } from '@total-audio/core-ai-provider'
import type { LoopOSClipData } from '../useLoopOSLocalStore'
import type { MomentumResult } from '../engines/momentumEngine'

export interface SuggestedClipData extends Omit<LoopOSClipData, 'id'> {
  id?: string
}

interface SuggestNextClipsInput {
  sequencedClips: LoopOSClipData[]
  momentum: MomentumResult | null
}

export async function suggestNextClips(
  sequencedClips: LoopOSClipData[],
  momentum: MomentumResult | null,
): Promise<SuggestedClipData[]> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content:
        'You are LoopOS, an AI assistant helping independent artists design repeating marketing loops across lanes like creative, action, promo, analysis, and refine.\n' +
        'Given the current loop clips and momentum, propose 1–3 next clips to add.\n' +
        'Each clip must include: lane, start, length, name, and notes.\n' +
        'Return ONLY valid JSON matching this schema: { "clips": [{ "lane": "creative|action|promo|analysis|refine", "start": number, "length": number, "name": string, "notes": string }] }.',
    },
    {
      role: 'user',
      content: JSON.stringify({
        clips: sequencedClips,
        momentum,
      }),
    },
  ]

  try {
    const result = await complete('anthropic', messages, {
      model: 'claude-3-haiku-20240307',
      temperature: 0.6,
      max_tokens: 800,
    })

    const parsed = JSON.parse(result.content) as { clips?: SuggestedClipData[] }
    if (!parsed.clips || !Array.isArray(parsed.clips)) return []

    return parsed.clips
      .filter((clip) => clip && clip.lane && typeof clip.start === 'number')
      .map((clip) => ({
        lane: clip.lane,
        start: clip.start,
        length: clip.length ?? 4,
        name: clip.name || 'AI suggested block',
        notes:
          clip.notes ||
          'AI-suggested step to keep the loop moving – tweak this so it matches your real workflow.',
        loopOSReady: Boolean((clip as any).loopOSReady),
      }))
  } catch (error) {
    console.warn('[LoopOS AI] suggestNextClips failed', error)
    return []
  }
}

export async function suggestMomentumFixes(
  sequencedClips: LoopOSClipData[],
  momentum: MomentumResult | null,
): Promise<string[]> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content:
        'You are LoopOS, an AI coach for marketing loops.\n' +
        'Explain why the momentum score might be low or uneven, and give concrete suggestions like extending clips, shifting promo earlier, adding analysis, or tightening refine passes.\n' +
        'Return ONLY valid JSON: { "fixes": [string, ...] } with short, punchy tips.',
    },
    {
      role: 'user',
      content: JSON.stringify({
        clips: sequencedClips,
        momentum,
      }),
    },
  ]

  try {
    const result = await complete('anthropic', messages, {
      model: 'claude-3-haiku-20240307',
      temperature: 0.7,
      max_tokens: 600,
    })

    const parsed = JSON.parse(result.content) as { fixes?: string[] }
    if (!parsed.fixes || !Array.isArray(parsed.fixes)) return []
    return parsed.fixes.filter((fix) => typeof fix === 'string' && fix.trim().length > 0)
  } catch (error) {
    console.warn('[LoopOS AI] suggestMomentumFixes failed', error)
    return []
  }
}

interface SummariseLoopInput {
  clips: LoopOSClipData[]
  momentum: MomentumResult | null
  nextActionClips?: LoopOSClipData[]
  selectedClip?: LoopOSClipData | null
}

export async function summariseLoop({
  clips,
  momentum,
  nextActionClips,
  selectedClip,
}: SummariseLoopInput): Promise<string> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content:
        'You are LoopOS, summarising a marketing loop for indie artists, PR teams, and labels.\n' +
        'Write a short, clear summary that could be pasted into another OS (Aqua, Analogue, or XP).\n' +
        'Focus on: overall loop structure, what happens in each lane, and how momentum currently feels.\n' +
        'Keep it under 200 words and use UK spelling.',
    },
    {
      role: 'user',
      content: JSON.stringify({
        clips,
        momentum,
        nextActionClips,
        selectedClip,
      }),
    },
  ]

  try {
    const result = await complete('anthropic', messages, {
      model: 'claude-3-haiku-20240307',
      temperature: 0.65,
      max_tokens: 500,
    })

    return result.content.trim()
  } catch (error) {
    console.warn('[LoopOS AI] summariseLoop failed', error)
    return ''
  }
}


