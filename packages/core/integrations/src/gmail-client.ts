/**
 * Gmail Metrics Client
 *
 * Automatically tracks campaign email engagement:
 * - Sent emails count
 * - Reply detection
 * - Open rate estimation
 * - Follow-up tracking
 *
 * Design Principle: "Every number should represent something the user actually achieved."
 */

import { google } from 'googleapis'

export interface GmailMetrics {
  sent: number
  replies: number
  openRate: number
  followUpsDue: number
  lastSyncAt: string
}

export interface GmailClientOptions {
  accessToken: string
  campaignTag?: string // Optional tag to filter emails (e.g., "TotalAud.io Campaign")
  daysBack?: number // How many days to look back (default: 30)
}

export class GmailClient {
  private auth: any
  private gmail: any
  private campaignTag: string
  private daysBack: number

  constructor(options: GmailClientOptions) {
    // Create OAuth2 client
    this.auth = new google.auth.OAuth2()
    this.auth.setCredentials({ access_token: options.accessToken })

    // Initialize Gmail API
    this.gmail = google.gmail({ version: 'v1', auth: this.auth })

    // Set options
    this.campaignTag = options.campaignTag || 'TotalAud.io'
    this.daysBack = options.daysBack || 30
  }

  /**
   * Fetch campaign email metrics
   */
  async fetchMetrics(): Promise<GmailMetrics> {
    try {
      const [sentEmails, repliedEmails] = await Promise.all([
        this.getSentEmails(),
        this.getReplies(),
      ])

      const openRate = sentEmails > 0 ? Math.round((repliedEmails / sentEmails) * 100) : 0

      // Calculate follow-ups due (emails sent >3 days ago with no reply)
      const followUpsDue = await this.getFollowUpsDue()

      return {
        sent: sentEmails,
        replies: repliedEmails,
        openRate,
        followUpsDue,
        lastSyncAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error('[GmailClient] Error fetching metrics:', error)
      throw error
    }
  }

  /**
   * Get sent emails count with campaign tag
   */
  private async getSentEmails(): Promise<number> {
    try {
      // Build query: sent emails with campaign tag in subject
      const query = `in:sent subject:${this.campaignTag} newer_than:${this.daysBack}d`

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 500, // Limit to prevent quota issues
      })

      return response.data.resultSizeEstimate || 0
    } catch (error) {
      console.error('[GmailClient] Error getting sent emails:', error)
      return 0
    }
  }

  /**
   * Get replies to sent emails
   */
  private async getReplies(): Promise<number> {
    try {
      // Build query: replies to campaign emails
      const query = `in:inbox subject:${this.campaignTag} newer_than:${this.daysBack}d`

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 500,
      })

      return response.data.resultSizeEstimate || 0
    } catch (error) {
      console.error('[GmailClient] Error getting replies:', error)
      return 0
    }
  }

  /**
   * Get emails that need follow-up (sent >3 days ago, no reply)
   */
  private async getFollowUpsDue(): Promise<number> {
    try {
      // Get sent emails older than 3 days
      const query = `in:sent subject:${this.campaignTag} older_than:3d newer_than:${this.daysBack}d`

      const sentResponse = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 500,
      })

      const sentMessages = sentResponse.data.messages || []

      if (sentMessages.length === 0) {
        return 0
      }

      // For each sent message, check if there's a reply in the thread
      let followUpsNeeded = 0

      for (const message of sentMessages.slice(0, 50)) {
        // Limit to 50 to prevent quota issues
        try {
          const threadResponse = await this.gmail.users.threads.get({
            userId: 'me',
            id: message.threadId,
          })

          const thread = threadResponse.data
          const messageCount = thread.messages?.length || 0

          // If thread only has 1 message (the sent email), no reply yet
          if (messageCount === 1) {
            followUpsNeeded++
          }
        } catch (err) {
          // Skip if thread fetch fails
          console.warn('[GmailClient] Failed to fetch thread:', message.threadId)
        }
      }

      return followUpsNeeded
    } catch (error) {
      console.error('[GmailClient] Error getting follow-ups:', error)
      return 0
    }
  }

  /**
   * Track a sent email for reply detection
   */
  async trackSentEmail(options: {
    messageId: string
    threadId: string
    subject: string
    recipient: string
  }): Promise<{
    success: boolean
    trackedEmail: {
      gmail_message_id: string
      gmail_thread_id: string
      subject: string
      recipient_email: string
      sent_at: string
    }
  }> {
    try {
      return {
        success: true,
        trackedEmail: {
          gmail_message_id: options.messageId,
          gmail_thread_id: options.threadId,
          subject: options.subject,
          recipient_email: options.recipient,
          sent_at: new Date().toISOString(),
        },
      }
    } catch (error) {
      console.error('[GmailClient] Error tracking sent email:', error)
      throw error
    }
  }

  /**
   * Check for replies to tracked emails
   */
  async checkForReplies(trackedThreadIds: string[]): Promise<
    Array<{
      threadId: string
      hasReply: boolean
      replySnippet?: string
      repliedAt?: string
    }>
  > {
    const results: Array<{
      threadId: string
      hasReply: boolean
      replySnippet?: string
      repliedAt?: string
    }> = []

    for (const threadId of trackedThreadIds.slice(0, 50)) {
      // Limit to prevent quota issues
      try {
        const threadResponse = await this.gmail.users.threads.get({
          userId: 'me',
          id: threadId,
        })

        const thread = threadResponse.data
        const messages = thread.messages || []

        // Check if thread has more than 1 message (indicates reply)
        if (messages.length > 1) {
          const latestMessage = messages[messages.length - 1]
          results.push({
            threadId,
            hasReply: true,
            replySnippet: latestMessage.snippet || '',
            repliedAt: new Date(parseInt(latestMessage.internalDate || '0')).toISOString(),
          })
        } else {
          results.push({
            threadId,
            hasReply: false,
          })
        }
      } catch (error) {
        console.warn('[GmailClient] Failed to check thread:', threadId)
        results.push({
          threadId,
          hasReply: false,
        })
      }
    }

    return results
  }

  /**
   * Get Gmail user profile (email address)
   */
  async getUserProfile(): Promise<{
    email: string
    messagesTotal: number
    threadsTotal: number
  }> {
    try {
      const response = await this.gmail.users.getProfile({
        userId: 'me',
      })

      return {
        email: response.data.emailAddress || '',
        messagesTotal: response.data.messagesTotal || 0,
        threadsTotal: response.data.threadsTotal || 0,
      }
    } catch (error) {
      console.error('[GmailClient] Error getting user profile:', error)
      throw error
    }
  }

  /**
   * Send an email via Gmail API
   */
  async sendEmail(params: {
    to: string
    subject: string
    body: string
    threadId?: string
    from?: string
  }): Promise<{ messageId: string; threadId: string }> {
    try {
      // Build email in RFC 2822 format
      const from = params.from || 'me'
      const messageParts = [
        `From: ${from}`,
        `To: ${params.to}`,
        `Subject: ${params.subject}`,
        '', // Blank line separator
        params.body,
      ]

      const message = messageParts.join('\n')

      // Encode in base64url format
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

      // Send email
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
          threadId: params.threadId, // Reply to existing thread if provided
        },
      })

      return {
        messageId: response.data.id,
        threadId: response.data.threadId,
      }
    } catch (error) {
      console.error('[GmailClient] Failed to send email:', error)
      throw error
    }
  }

  /**
   * Send a follow-up email in an existing thread
   */
  async sendFollowUp(params: {
    threadId: string
    to: string
    subject: string
    body: string
  }): Promise<{ messageId: string; threadId: string }> {
    return this.sendEmail({
      threadId: params.threadId,
      to: params.to,
      subject: `Re: ${params.subject}`,
      body: params.body,
    })
  }
}

/**
 * Helper function to create Gmail client from connection
 */
export function createGmailClient(accessToken: string, options?: Partial<GmailClientOptions>): GmailClient {
  return new GmailClient({
    accessToken,
    campaignTag: options?.campaignTag,
    daysBack: options?.daysBack,
  })
}
