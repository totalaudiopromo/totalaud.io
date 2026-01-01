/**
 * PDF Export Utility
 *
 * Generates PDFs for Timeline release plans and other exportable content.
 */

import jsPDF from 'jspdf'
import { logger } from '@/lib/logger'

const log = logger.scope('PDFExport')
const PDF_MARGINS = { top: 25, left: 20 }
const PDF_PAGE_BREAK_Y = 260
const PDF_SECTION_BREAK_Y = 250
const PDF_FOOTER_Y = 285

interface TimelineEvent {
  id: string
  title: string
  date: string
  description?: string
  category?: string
  completed?: boolean
}

interface ExportOptions {
  title?: string
  subtitle?: string
  includeCompleted?: boolean
}

/**
 * Export a timeline/release plan to PDF
 */
export async function exportTimelineToPDF(
  events: TimelineEvent[],
  options: ExportOptions = {}
): Promise<void> {
  const { title = 'Release Timeline', subtitle, includeCompleted = true } = options

  try {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Filter events if needed
    const filteredEvents = includeCompleted ? events : events.filter((e) => !e.completed)

    // Header
    doc.setFontSize(24)
    doc.setTextColor(15, 17, 19) // #0F1113
    doc.text(title, PDF_MARGINS.left, PDF_MARGINS.top)

    // Subtitle if provided
    let yPos = PDF_MARGINS.top + 10
    if (subtitle) {
      doc.setFontSize(12)
      doc.setTextColor(107, 114, 128) // #6B7280
      doc.text(subtitle, PDF_MARGINS.left, yPos)
      yPos += 10
    }

    // Generation date
    doc.setFontSize(10)
    doc.setTextColor(156, 163, 175) // #9CA3AF
    doc.text(
      `Generated ${new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`,
      PDF_MARGINS.left,
      yPos
    )
    yPos += 15

    // Divider line
    doc.setDrawColor(229, 231, 235) // #E5E7EB
    doc.setLineWidth(0.5)
    doc.line(PDF_MARGINS.left, yPos, pageWidth - PDF_MARGINS.left, yPos)
    yPos += 15

    // Events
    if (filteredEvents.length === 0) {
      doc.setFontSize(12)
      doc.setTextColor(107, 114, 128)
      doc.text('No events to display', PDF_MARGINS.left, yPos)
    } else {
      filteredEvents.forEach((event, index) => {
        // Check if we need a new page
        if (yPos > PDF_PAGE_BREAK_Y) {
          doc.addPage()
          yPos = PDF_MARGINS.top
        }

        // Event number and title
        doc.setFontSize(14)
        doc.setTextColor(15, 17, 19)
        doc.setFont('helvetica', 'bold')

        const checkbox = event.completed ? '☑' : '☐'
        const titleText = `${checkbox} ${index + 1}. ${event.title}`
        doc.text(titleText, PDF_MARGINS.left, yPos)
        yPos += 7

        // Date
        doc.setFontSize(11)
        doc.setTextColor(58, 169, 190) // #3AA9BE
        doc.setFont('helvetica', 'normal')
        doc.text(event.date, PDF_MARGINS.left, yPos)
        yPos += 6

        // Category badge (if present)
        if (event.category) {
          doc.setFontSize(9)
          doc.setTextColor(107, 114, 128)
          doc.text(`Category: ${event.category}`, PDF_MARGINS.left, yPos)
          yPos += 5
        }

        // Description
        if (event.description) {
          doc.setFontSize(10)
          doc.setTextColor(75, 85, 99) // #4B5563
          const maxWidth = pageWidth - 45
          const lines = doc.splitTextToSize(event.description, maxWidth)
          doc.text(lines, PDF_MARGINS.left, yPos)
          yPos += lines.length * 5 + 2
        }

        yPos += 10 // Space between events
      })
    }

    // Footer on last page
    const pageCount = doc.getNumberOfPages()
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.text(`totalaud.io • Page ${i} of ${pageCount}`, pageWidth / 2, PDF_FOOTER_Y, {
        align: 'center',
      })
    }

    // Generate filename
    const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `${safeName}-${dateStr}.pdf`

    // Save
    doc.save(filename)

    log.info('PDF exported successfully', {
      title,
      eventCount: filteredEvents.length,
      filename,
    })
  } catch (error) {
    log.error('PDF export failed', error as Error)
    throw new Error('Failed to generate PDF. Please try again.')
  }
}

/**
 * Export pitch content to PDF
 */
export async function exportPitchToPDF(
  content: {
    bio?: string
    pressRelease?: string
    socialBio?: string
    epk?: string
  },
  artistName: string = 'Artist'
): Promise<void> {
  try {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let yPos = PDF_MARGINS.top

    // Header
    doc.setFontSize(24)
    doc.setTextColor(15, 17, 19)
    doc.text(`${artistName} - Press Kit`, PDF_MARGINS.left, yPos)
    yPos += 15

    // Generation date
    doc.setFontSize(10)
    doc.setTextColor(156, 163, 175)
    doc.text(`Generated ${new Date().toLocaleDateString('en-GB')}`, PDF_MARGINS.left, yPos)
    yPos += 15

    // Sections
    const sections = [
      { title: 'Bio', content: content.bio },
      { title: 'Press Release', content: content.pressRelease },
      { title: 'Social Bio', content: content.socialBio },
      { title: 'EPK Description', content: content.epk },
    ].filter((s) => s.content)

    sections.forEach((section) => {
      if (yPos > PDF_SECTION_BREAK_Y) {
        doc.addPage()
        yPos = PDF_MARGINS.top
      }

      // Section title
      doc.setFontSize(14)
      doc.setTextColor(58, 169, 190)
      doc.setFont('helvetica', 'bold')
      doc.text(section.title, PDF_MARGINS.left, yPos)
      yPos += 8

      // Section content
      doc.setFontSize(11)
      doc.setTextColor(55, 65, 81) // #374151
      doc.setFont('helvetica', 'normal')
      const maxWidth = pageWidth - 40
      const lines = doc.splitTextToSize(section.content!, maxWidth)
      doc.text(lines, PDF_MARGINS.left, yPos)
      yPos += lines.length * 5 + 15
    })

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text('totalaud.io', pageWidth / 2, PDF_FOOTER_Y, { align: 'center' })

    // Save
    const safeName = artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const filename = `${safeName}-press-kit.pdf`
    doc.save(filename)

    log.info('Pitch PDF exported', { artistName, sections: sections.length })
  } catch (error) {
    log.error('Pitch PDF export failed', error as Error)
    throw new Error('Failed to generate PDF. Please try again.')
  }
}
