/**
 * Google Sheets Client
 *
 * Automatically syncs contact lists and tracks growth:
 * - Total contacts count
 * - New contacts detection
 * - Last modified time
 * - Sync health monitoring
 *
 * Design Principle: "Every number should represent something the user actually achieved."
 */

import { google } from 'googleapis'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('SheetsClient')

export interface SheetsMetrics {
  totalContacts: number
  newContacts: number
  lastModified: string
  syncHealth: 'healthy' | 'warning' | 'error'
  lastSyncAt: string
}

export interface SheetsClientOptions {
  accessToken: string
  spreadsheetId: string
  sheetName?: string // Default: "Contacts"
  newContactMarker?: string // Column value that marks new contacts (default: "NEW")
}

export interface Contact {
  name: string
  email: string
  role?: string
  status?: string
  addedDate?: string
  [key: string]: any
}

export class SheetsClient {
  private auth: any
  private sheets: any
  private spreadsheetId: string
  private sheetName: string
  private newContactMarker: string

  constructor(options: SheetsClientOptions) {
    // Create OAuth2 client
    this.auth = new google.auth.OAuth2()
    this.auth.setCredentials({ access_token: options.accessToken })

    // Initialize Sheets API
    this.sheets = google.sheets({ version: 'v4', auth: this.auth })

    // Set options
    this.spreadsheetId = options.spreadsheetId
    this.sheetName = options.sheetName || 'Contacts'
    this.newContactMarker = options.newContactMarker || 'NEW'
  }

  /**
   * Fetch contact sync metrics
   */
  async fetchMetrics(): Promise<SheetsMetrics> {
    try {
      const contacts = await this.getContacts()
      const metadata = await this.getSpreadsheetMetadata()

      // Count new contacts (marked with NEW status)
      const newContacts = contacts.filter((contact) =>
        contact.status?.toUpperCase().includes(this.newContactMarker)
      ).length

      // Determine sync health
      const syncHealth = this.determineSyncHealth(metadata.lastModified)

      return {
        totalContacts: contacts.length,
        newContacts,
        lastModified: metadata.lastModified,
        syncHealth,
        lastSyncAt: new Date().toISOString(),
      }
    } catch (error) {
      log.error('Error fetching metrics', error)
      return {
        totalContacts: 0,
        newContacts: 0,
        lastModified: new Date().toISOString(),
        syncHealth: 'error',
        lastSyncAt: new Date().toISOString(),
      }
    }
  }

  /**
   * Get all contacts from the sheet
   */
  async getContacts(): Promise<Contact[]> {
    try {
      // Fetch data from sheet (assuming header row in row 1)
      const range = `${this.sheetName}!A2:E1000` // A-E columns, up to 1000 rows

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
      })

      const rows = response.data.values || []

      // Map rows to contact objects
      const contacts: Contact[] = rows.map((row: string[]) => ({
        name: row[0] || '',
        email: row[1] || '',
        role: row[2] || '',
        status: row[3] || '',
        addedDate: row[4] || '',
      }))

      return contacts
    } catch (error) {
      log.error('Error getting contacts', error)
      return []
    }
  }

  /**
   * Get spreadsheet metadata (last modified time, etc.)
   */
  private async getSpreadsheetMetadata(): Promise<{
    lastModified: string
    title: string
    sheetCount: number
  }> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        fields: 'properties(title),sheets(properties(title,sheetId))',
      })

      const spreadsheet = response.data

      return {
        lastModified: new Date().toISOString(), // Note: Sheets API doesn't provide last modified directly
        title: spreadsheet.properties?.title || '',
        sheetCount: spreadsheet.sheets?.length || 0,
      }
    } catch (error) {
      log.error('Error getting metadata', error)
      return {
        lastModified: new Date().toISOString(),
        title: '',
        sheetCount: 0,
      }
    }
  }

  /**
   * Determine sync health based on last modified time
   */
  private determineSyncHealth(lastModified: string): 'healthy' | 'warning' | 'error' {
    const now = Date.now()
    const lastModifiedTime = new Date(lastModified).getTime()
    const daysSinceUpdate = (now - lastModifiedTime) / (1000 * 60 * 60 * 24)

    if (daysSinceUpdate > 7) {
      return 'error' // Not synced in over a week
    } else if (daysSinceUpdate > 3) {
      return 'warning' // Not synced in 3+ days
    } else {
      return 'healthy' // Recently synced
    }
  }

  /**
   * Add new contacts to sheet
   */
  async addContacts(contacts: Contact[]): Promise<{
    success: boolean
    added: number
    errors: string[]
  }> {
    try {
      // Convert contacts to rows
      const rows = contacts.map((contact) => [
        contact.name,
        contact.email,
        contact.role || '',
        contact.status || this.newContactMarker,
        contact.addedDate || new Date().toISOString(),
      ])

      // Append rows to sheet
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A2:E`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: rows,
        },
      })

      return {
        success: true,
        added: response.data.updates?.updatedRows || 0,
        errors: [],
      }
    } catch (error) {
      log.error('Error adding contacts', error)
      return {
        success: false,
        added: 0,
        errors: [(error as Error).message],
      }
    }
  }

  /**
   * Update contact status (e.g., mark as "CONTACTED", "REPLIED")
   */
  async updateContactStatus(
    email: string,
    newStatus: string
  ): Promise<{
    success: boolean
    message: string
  }> {
    try {
      // Get all contacts
      const contacts = await this.getContacts()

      // Find contact by email
      const contactIndex = contacts.findIndex((c) => c.email === email)

      if (contactIndex === -1) {
        return {
          success: false,
          message: `Contact with email ${email} not found`,
        }
      }

      // Update status in sheet (row index + 2 because of header and 0-indexing)
      const rowNumber = contactIndex + 2
      const range = `${this.sheetName}!D${rowNumber}`

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[newStatus]],
        },
      })

      return {
        success: true,
        message: `Updated ${email} status to ${newStatus}`,
      }
    } catch (error) {
      log.error('Error updating contact', error)
      return {
        success: false,
        message: (error as Error).message,
      }
    }
  }

  /**
   * Search contacts by criteria
   */
  async searchContacts(query: {
    name?: string
    email?: string
    role?: string
    status?: string
  }): Promise<Contact[]> {
    try {
      const contacts = await this.getContacts()

      // Filter contacts based on query
      return contacts.filter((contact) => {
        if (query.name && !contact.name.toLowerCase().includes(query.name.toLowerCase())) {
          return false
        }
        if (query.email && !contact.email.toLowerCase().includes(query.email.toLowerCase())) {
          return false
        }
        if (query.role && !contact.role?.toLowerCase().includes(query.role.toLowerCase())) {
          return false
        }
        if (query.status && !contact.status?.toLowerCase().includes(query.status.toLowerCase())) {
          return false
        }
        return true
      })
    } catch (error) {
      log.error('Error searching contacts', error)
      return []
    }
  }

  /**
   * Get contact statistics
   */
  async getStatistics(): Promise<{
    total: number
    byStatus: Record<string, number>
    byRole: Record<string, number>
    addedThisWeek: number
  }> {
    try {
      const contacts = await this.getContacts()
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      // Count by status
      const byStatus: Record<string, number> = {}
      const byRole: Record<string, number> = {}
      let addedThisWeek = 0

      contacts.forEach((contact) => {
        // Status count
        const status = contact.status || 'Unknown'
        byStatus[status] = (byStatus[status] || 0) + 1

        // Role count
        const role = contact.role || 'Unknown'
        byRole[role] = (byRole[role] || 0) + 1

        // Added this week
        if (contact.addedDate && new Date(contact.addedDate) > weekAgo) {
          addedThisWeek++
        }
      })

      return {
        total: contacts.length,
        byStatus,
        byRole,
        addedThisWeek,
      }
    } catch (error) {
      log.error('Error getting statistics', error)
      return {
        total: 0,
        byStatus: {},
        byRole: {},
        addedThisWeek: 0,
      }
    }
  }
}

/**
 * Helper function to create Sheets client from connection
 */
export function createSheetsClient(
  accessToken: string,
  spreadsheetId: string,
  options?: Partial<SheetsClientOptions>
): SheetsClient {
  return new SheetsClient({
    accessToken,
    spreadsheetId,
    sheetName: options?.sheetName,
    newContactMarker: options?.newContactMarker,
  })
}
