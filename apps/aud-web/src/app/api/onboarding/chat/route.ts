/**
 * Onboarding Chat API Route
 *
 * Powers the conversational onboarding with "Audio" personality.
 * Uses Claude to:
 * - Have natural conversation
 * - Extract structured data (artist name, genre, release date, etc.)
 * - Determine when onboarding is complete
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { logger } from '@/lib/logger'

const log = logger.scope('Onboarding Chat API')

const anthropic = new Anthropic()

interface ChatMessage {
  role: 'assistant' | 'user'
  content: string
}

interface CollectedData {
  artistName?: string
  genre?: string
  vibe?: string
  projectType?: 'single' | 'ep' | 'album' | 'none'
  projectTitle?: string
  releaseDate?: string
  primaryGoal?: 'discover' | 'plan' | 'pitch' | 'explore'
}

interface QuickReply {
  label: string
  value: string
}

const SYSTEM_PROMPT = `You are "Audio", a calm, friendly assistant helping independent musicians set up their workspace on totalaud.io.

Your personality:
- Warm but not over-the-top
- British casual-professional tone (use "lovely", "brilliant", "cheers" naturally)
- Genuinely interested in the artist's music
- Helpful without being pushy

Your goal is to collect the following information through natural conversation:
1. Artist/project name
2. Genre/style of music (freeform)
3. Whether they're working on something (single, EP, album, or nothing specific)
4. If they have a release, when it's coming out
5. What they want to focus on (finding contacts, planning timeline, writing pitches, or just exploring)

Conversation flow:
1. Start: Get artist name (already asked in first message)
2. After name: Ask about their music style/genre
3. After genre: Ask if they're working on anything (single/EP/album)
4. If they have a project: Ask about the release date
5. Finally: Ask what they'd like to focus on first (with quick reply options)

Important rules:
- Keep responses SHORT (1-2 sentences max)
- Be conversational, not robotic
- If they say they're just exploring or don't have a release, that's fine - skip the release date question
- Extract data from natural language (e.g., "dropping something in January" = release date around January)
- When you have enough info to complete onboarding, set isComplete to true

Response format:
Always respond with valid JSON containing:
{
  "message": "Your response text",
  "extractedData": { ... any new data extracted ... },
  "quickReplies": [ { "label": "Button text", "value": "What gets sent" } ] // optional
  "isComplete": boolean // true when ready to redirect
}`

export async function POST(request: NextRequest) {
  try {
    const { messages, collectedData } = (await request.json()) as {
      messages: ChatMessage[]
      collectedData: CollectedData
    }

    // Build context about what we've collected
    const collectedContext = Object.entries(collectedData || {})
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')

    const contextMessage = collectedContext
      ? `\n\nData collected so far:\n${collectedContext}\n\nContinue the conversation to collect remaining information.`
      : ''

    // Determine what quick replies to show based on conversation stage
    const getStageHint = (): string => {
      if (!collectedData?.artistName) {
        return 'Waiting for artist name.'
      }
      if (!collectedData?.genre) {
        return 'Need to ask about their music genre/style.'
      }
      if (!collectedData?.projectType) {
        return 'Need to ask if they are working on something (single/EP/album/nothing).'
      }
      if (
        collectedData?.projectType &&
        collectedData.projectType !== 'none' &&
        !collectedData?.releaseDate
      ) {
        return "Need to ask about release date. If they don't have one, that's fine."
      }
      if (!collectedData?.primaryGoal) {
        return 'Ready to ask what they want to focus on. MUST include quickReplies with options: [{"label": "Find contacts", "value": "discover"}, {"label": "Plan timeline", "value": "plan"}, {"label": "Write pitches", "value": "pitch"}, {"label": "Just explore", "value": "explore"}]'
      }
      return 'All data collected! Set isComplete: true and give a brief welcome message before redirecting.'
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT + contextMessage + '\n\nCurrent stage: ' + getStageHint(),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    })

    // Extract text content
    const textContent = response.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Parse JSON response
    let parsed: {
      message: string
      extractedData?: CollectedData
      quickReplies?: QuickReply[]
      isComplete?: boolean
    }

    try {
      // Try to parse as JSON first
      parsed = JSON.parse(textContent.text)
    } catch {
      // If not valid JSON, treat the whole response as a message
      // This handles cases where Claude doesn't follow the format
      parsed = {
        message: textContent.text,
        extractedData: {},
        isComplete: false,
      }
    }

    // Parse natural language for data extraction if Claude didn't extract
    const lastUserMessage = messages[messages.length - 1]?.content || ''
    const autoExtracted = extractDataFromMessage(lastUserMessage, collectedData || {})

    return NextResponse.json({
      message: parsed.message,
      extractedData: { ...autoExtracted, ...(parsed.extractedData || {}) },
      quickReplies: parsed.quickReplies,
      isComplete: parsed.isComplete || false,
    })
  } catch (error) {
    log.error('Onboarding chat error', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}

/**
 * Extract data from user message using pattern matching
 * Fallback for when Claude doesn't extract data properly
 */
function extractDataFromMessage(
  message: string,
  currentData: CollectedData
): Partial<CollectedData> {
  const extracted: Partial<CollectedData> = {}
  const lower = message.toLowerCase()

  // Extract project type from keywords
  if (!currentData.projectType) {
    if (lower.includes('single') || lower.includes('track') || lower.includes('song')) {
      extracted.projectType = 'single'
    } else if (lower.includes('ep') || lower.includes('e.p')) {
      extracted.projectType = 'ep'
    } else if (lower.includes('album') || lower.includes('lp') || lower.includes('full length')) {
      extracted.projectType = 'album'
    } else if (
      lower.includes('nothing') ||
      lower.includes('just exploring') ||
      lower.includes("don't have") ||
      lower.includes('not yet') ||
      lower.includes('no release')
    ) {
      extracted.projectType = 'none'
    }
  }

  // Extract primary goal from quick reply values
  if (!currentData.primaryGoal) {
    if (lower === 'discover' || lower.includes('find contact') || lower.includes('scout')) {
      extracted.primaryGoal = 'discover'
    } else if (lower === 'plan' || lower.includes('timeline') || lower.includes('plan')) {
      extracted.primaryGoal = 'plan'
    } else if (lower === 'pitch' || lower.includes('pitch') || lower.includes('write')) {
      extracted.primaryGoal = 'pitch'
    } else if (lower === 'explore' || lower.includes('explore') || lower.includes('look around')) {
      extracted.primaryGoal = 'explore'
    }
  }

  // Extract release date from natural language
  if (!currentData.releaseDate && currentData.projectType && currentData.projectType !== 'none') {
    const datePatterns = [
      // "January 15th" or "15 January"
      /(\d{1,2})(?:st|nd|rd|th)?\s*(january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{1,2})(?:st|nd|rd|th)?/i,
      // "in January" or "around January"
      /(?:in|around|early|mid|late|end of)\s*(january|february|march|april|may|june|july|august|september|october|november|december)/i,
      // ISO format
      /(\d{4}-\d{2}-\d{2})/,
    ]

    const monthMap: Record<string, string> = {
      january: '01',
      february: '02',
      march: '03',
      april: '04',
      may: '05',
      june: '06',
      july: '07',
      august: '08',
      september: '09',
      october: '10',
      november: '11',
      december: '12',
    }

    for (const pattern of datePatterns) {
      const match = message.match(pattern)
      if (match) {
        // Determine year (assume next occurrence of month)
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() + 1

        let month: string
        let day = '15' // Default to middle of month

        if (match[1] && monthMap[match[1].toLowerCase()]) {
          month = monthMap[match[1].toLowerCase()]
          if (match[2]) day = match[2].padStart(2, '0')
        } else if (match[2] && monthMap[match[2].toLowerCase()]) {
          month = monthMap[match[2].toLowerCase()]
          if (match[1]) day = match[1].padStart(2, '0')
        } else if (match[1] && match[1].includes('-')) {
          // ISO format
          extracted.releaseDate = match[1]
          break
        } else {
          continue
        }

        const monthNum = parseInt(month)
        const year = monthNum < currentMonth ? currentYear + 1 : currentYear

        extracted.releaseDate = `${year}-${month}-${day}`
        break
      }
    }
  }

  return extracted
}
