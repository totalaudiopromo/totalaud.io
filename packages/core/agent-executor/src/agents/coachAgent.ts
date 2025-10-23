/**
 * Coach Agent - Follow-Up Email Draft Generation
 *
 * Responsibilities:
 * - Query gmail_tracked_emails for unreplied contacts
 * - Generate personalized follow-up drafts using theme personalities
 * - Save drafts to coach_drafts table
 * - Respect user's active OS theme for tone and slang
 *
 * Design Principle: "Data should lead to dialogue."
 */

import { complete, type AIProvider } from '@total-audio/core-ai-provider'
import { getBrokerPersonality } from '../personas/brokerPersonalityRegistry'

// OSTheme type (matches broker personalities)
export type OSTheme = 'ascii' | 'xp' | 'apple' | 'quantum'

interface SupabaseClient {
  from(table: string): any
  auth: {
    getUser(): Promise<{ data: { user: any }; error: any }>
  }
}

export interface CoachAgentOptions {
  supabaseClient: SupabaseClient
  sessionId: string
  userId: string
  theme: OSTheme
  aiProvider?: AIProvider
}

export interface UnrepliedContact {
  id: string
  thread_id: string
  contact_email: string
  contact_name?: string
  subject?: string
  sent_at: string
  campaign_name?: string
}

export interface CoachDraft {
  thread_id: string
  contact_email: string
  contact_name?: string
  subject: string
  body: string
  theme: OSTheme
  metadata?: Record<string, any>
}

export interface CoachAgentResult {
  success: boolean
  drafts: CoachDraft[]
  message: string
  errors?: string[]
}

/**
 * Coach Agent Implementation
 */
export class CoachAgent {
  private supabase: SupabaseClient
  private sessionId: string
  private userId: string
  private theme: OSTheme
  private aiProvider: AIProvider

  constructor(options: CoachAgentOptions) {
    this.supabase = options.supabaseClient
    this.sessionId = options.sessionId
    this.userId = options.userId
    this.theme = options.theme
    this.aiProvider = options.aiProvider || 'anthropic' // Default to Claude
  }

  /**
   * Execute Coach agent - generate follow-up drafts
   */
  async execute(): Promise<CoachAgentResult> {
    const errors: string[] = []
    const drafts: CoachDraft[] = []

    try {
      // Get unreplied contacts from gmail_tracked_emails
      const unreplied = await this.getUnrepliedContacts()

      if (unreplied.length === 0) {
        return {
          success: true,
          drafts: [],
          message: 'No unreplied contacts found. All caught up!',
        }
      }

      // Get campaign performance summary for context
      const performanceSummary = await this.getCampaignPerformanceSummary()

      // Generate drafts for each unreplied contact
      for (const contact of unreplied) {
        try {
          const draft = await this.generateDraft(contact, performanceSummary)
          drafts.push(draft)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          errors.push(`Failed to generate draft for ${contact.contact_email}: ${errorMessage}`)
          console.error('[CoachAgent] Draft generation error:', error)
        }
      }

      // Save all drafts to database
      if (drafts.length > 0) {
        await this.saveDrafts(drafts)
      }

      return {
        success: errors.length === 0,
        drafts,
        message: this.generateSummaryMessage(drafts, errors),
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        drafts: [],
        message: `Coach agent failed: ${errorMessage}`,
        errors: [errorMessage],
      }
    }
  }

  /**
   * Get unreplied contacts from gmail_tracked_emails
   */
  private async getUnrepliedContacts(): Promise<UnrepliedContact[]> {
    const { data, error } = await this.supabase
      .from('gmail_tracked_emails')
      .select('*')
      .eq('user_id', this.userId)
      .eq('replied', false)
      .order('sent_at', { ascending: false })
      .limit(10) // Limit to most recent 10 unreplied

    if (error) {
      throw new Error(`Failed to fetch unreplied contacts: ${error.message}`)
    }

    return (data || []) as UnrepliedContact[]
  }

  /**
   * Get campaign performance summary for context
   */
  private async getCampaignPerformanceSummary(): Promise<string> {
    const { data, error } = await this.supabase
      .from('campaign_results')
      .select('metric_key, metric_value, metric_label')
      .eq('session_id', this.sessionId)
      .eq('agent_name', 'tracker')

    if (error || !data || data.length === 0) {
      return 'No campaign metrics available yet.'
    }

    const metrics = data as Array<{
      metric_key: string
      metric_value: number
      metric_label: string
    }>

    const emailsSent = metrics.find((m) => m.metric_key === 'emails_sent')?.metric_value || 0
    const replies = metrics.find((m) => m.metric_key === 'email_replies')?.metric_value || 0
    const openRate = metrics.find((m) => m.metric_key === 'open_rate')?.metric_value || 0

    return `Campaign sent ${emailsSent} emails with ${replies} replies (${openRate}% open rate).`
  }

  /**
   * Generate a follow-up draft for a contact
   */
  private async generateDraft(
    contact: UnrepliedContact,
    performanceSummary: string
  ): Promise<CoachDraft> {
    // Get personality for the active theme
    const personality = getBrokerPersonality(this.theme)

    // Build prompt with theme personality
    const prompt = `You are Coach, an AI assistant helping with music promotion follow-ups.

Your role: Write a friendly, authentic follow-up email to someone who hasn't replied to a music promotion campaign email.

Context:
- Recipient: ${contact.contact_name || contact.contact_email}
- Email: ${contact.contact_email}
- Original subject: ${contact.subject || 'Campaign email'}
- Sent: ${new Date(contact.sent_at).toLocaleDateString()}
- Campaign performance: ${performanceSummary}

Tone: ${personality.tone}
Slang: ${personality.slang.join(', ')}

Requirements:
1. Keep it under 120 words - brief and respectful
2. Acknowledge they're busy (don't be pushy)
3. Add one genuine value point (e.g., "just wanted to share...")
4. Include a soft call-to-action
5. Match the ${this.theme} theme personality
6. Be authentic and conversational
7. Do NOT apologize excessively

Write ONLY the email body. No subject line. No signature.`

    const completion = await complete(
      this.aiProvider,
      [
        {
          role: 'system',
          content: 'You are an expert email copywriter specializing in music industry follow-ups.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.7,
        max_tokens: 300,
      }
    )

    const body = completion.content.trim()

    // Generate subject line
    const subjectVariations = [
      'Quick follow-up on the track',
      'Checking in - any thoughts?',
      'Following up on our campaign',
      'Just wanted to circle back',
      'Touching base about the music',
    ]

    const subject = subjectVariations[Math.floor(Math.random() * subjectVariations.length)]

    return {
      thread_id: contact.thread_id,
      contact_email: contact.contact_email,
      contact_name: contact.contact_name,
      subject,
      body,
      theme: this.theme,
      metadata: {
        original_subject: contact.subject,
        sent_at: contact.sent_at,
        campaign_name: contact.campaign_name,
        llm_model: completion.model,
        performance_summary: performanceSummary,
      },
    }
  }

  /**
   * Save drafts to coach_drafts table
   */
  private async saveDrafts(drafts: CoachDraft[]): Promise<void> {
    const records = drafts.map((draft) => ({
      user_id: this.userId,
      session_id: this.sessionId,
      thread_id: draft.thread_id,
      contact_email: draft.contact_email,
      contact_name: draft.contact_name,
      subject: draft.subject,
      body: draft.body,
      theme: draft.theme,
      status: 'draft',
      metadata: draft.metadata || {},
    }))

    const { error } = await this.supabase.from('coach_drafts').insert(records as any)

    if (error) {
      throw new Error(`Failed to save drafts to database: ${error.message}`)
    }

    console.log(`[CoachAgent] Saved ${drafts.length} drafts to database`)
  }

  /**
   * Generate summary message for Broker narration
   */
  private generateSummaryMessage(drafts: CoachDraft[], errors: string[]): string {
    const parts: string[] = []

    if (drafts.length > 0) {
      parts.push(
        `🎯 Generated ${drafts.length} personalized follow-up${drafts.length === 1 ? '' : 's'}`
      )
      parts.push(`Theme: ${this.theme}`)
    }

    if (errors.length > 0) {
      parts.push(`⚠️ ${errors.length} error(s) occurred`)
    }

    if (parts.length === 0) {
      return 'No follow-ups needed. All contacts have replied!'
    }

    return parts.join(' | ')
  }

  /**
   * Get all drafts for current session
   */
  async getDrafts(): Promise<
    Array<{
      id: string
      contact_email: string
      contact_name?: string
      subject: string
      body: string
      status: string
      created_at: string
    }>
  > {
    const { data, error } = await this.supabase
      .from('coach_drafts')
      .select('id, contact_email, contact_name, subject, body, status, created_at')
      .eq('session_id', this.sessionId)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[CoachAgent] Error fetching drafts:', error)
      return []
    }

    return data || []
  }
}

/**
 * Helper function to create Coach agent
 */
export function createCoachAgent(options: CoachAgentOptions): CoachAgent {
  return new CoachAgent(options)
}

/**
 * Execute Coach agent (convenience function)
 */
export async function executeCoachAgent(options: CoachAgentOptions): Promise<CoachAgentResult> {
  const coach = new CoachAgent(options)
  return coach.execute()
}
