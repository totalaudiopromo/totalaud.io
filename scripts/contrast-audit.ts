/**
 * WCAG 2.2 Contrast Audit Tool
 *
 * Analyzes all theme palettes for contrast compliance:
 * - AA: ≥ 4.5:1 for normal text, ≥ 3:1 for large text
 * - AAA: ≥ 7:1 for normal text, ≥ 4.5:1 for large text
 */

interface RGB {
  r: number
  g: number
  b: number
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`)
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

/**
 * Calculate relative luminance
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getLuminance(rgb: RGB): number {
  const { r, g, b } = rgb
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const srgb = val / 255
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hexToRgb(hex1))
  const lum2 = getLuminance(hexToRgb(hex2))
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast passes WCAG requirements
 */
function checkContrast(
  ratio: number,
  level: 'AA' | 'AAA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  if (level === 'AA') {
    return size === 'normal' ? ratio >= 4.5 : ratio >= 3.0
  } else {
    return size === 'normal' ? ratio >= 7.0 : ratio >= 4.5
  }
}

/**
 * Theme palettes to audit
 */
const palettes = {
  ascii: {
    bg: '#0C0C0C',
    bgSecondary: '#121212',
    accent: '#3AE1C2',
    text: '#E5E7EB',
    textSecondary: '#9CA3AF',
    border: '#3AE1C2',
    borderSubtle: '#2BA893',
    success: '#3AE1C2',
    error: '#FF5555',
    warning: '#FFB86C',
    info: '#8BE9FD',
  },
  xp: {
    bg: '#F2F6FF',
    bgSecondary: '#E8EFFF',
    accent: '#1D4ED8',
    text: '#1B1E24',
    textSecondary: '#374151',
    border: '#1D4ED8',
    borderSubtle: '#60A5FA',
    success: '#047857',
    error: '#B91C1C',
    warning: '#B45309',
    info: '#1D4ED8',
  },
  aqua: {
    bg: '#0E151B',
    bgSecondary: '#1A2530',
    accent: '#00B3FF',
    text: '#E2F2FF',
    textSecondary: '#9DB8CE',
    border: '#00B3FF',
    borderSubtle: '#1A4F6B',
    success: '#00D9A0',
    error: '#FF4D6D',
    warning: '#FFB020',
    info: '#00B3FF',
  },
  daw: {
    bg: '#121212',
    bgSecondary: '#1C1C1C',
    accent: '#A076F9',
    text: '#F3F3F3',
    textSecondary: '#B3B3B3',
    border: '#A076F9',
    borderSubtle: '#4A4464',
    success: '#6BCF7F',
    error: '#FF6B6B',
    warning: '#FFD93D',
    info: '#6C9CFF',
  },
  analogue: {
    bg: '#F6F1E8',
    bgSecondary: '#EDE6D8',
    accent: '#8B5A1E',
    text: '#1E1C19',
    textSecondary: '#3E3C38',
    border: '#8B5A1E',
    borderSubtle: '#B8936D',
    success: '#4D6B3A',
    error: '#993D2E',
    warning: '#A5692C',
    info: '#3D5F75',
  },
}

/**
 * Run contrast audit
 */
function auditTheme(themeName: string, palette: any) {
  console.log(`\n🎨 ${themeName.toUpperCase()} Theme Contrast Audit`)
  console.log('='.repeat(60))

  const results: Array<{
    pair: string
    ratio: number
    aa: boolean
    aaa: boolean
    status: string
  }> = []

  // Critical text contrast checks
  const textChecks = [
    { fg: palette.text, bg: palette.bg, label: 'Primary Text / Background' },
    { fg: palette.textSecondary, bg: palette.bg, label: 'Secondary Text / Background' },
    { fg: palette.accent, bg: palette.bg, label: 'Accent / Background' },
    { fg: palette.text, bg: palette.bgSecondary, label: 'Primary Text / Secondary BG' },
    { fg: palette.text, bg: palette.accent, label: 'Text / Accent (inverse)' },
    { fg: palette.success, bg: palette.bg, label: 'Success / Background' },
    { fg: palette.error, bg: palette.bg, label: 'Error / Background' },
    { fg: palette.warning, bg: palette.bg, label: 'Warning / Background' },
    { fg: palette.info, bg: palette.bg, label: 'Info / Background' },
    { fg: palette.border, bg: palette.bg, label: 'Border / Background (3:1 min)' },
  ]

  textChecks.forEach(({ fg, bg, label }) => {
    // Skip rgba colors
    if (fg.includes('rgba') || bg.includes('rgba')) return

    try {
      const ratio = getContrastRatio(fg, bg)
      const aa = checkContrast(ratio, 'AA', 'normal')
      const aaa = checkContrast(ratio, 'AAA', 'normal')

      let status = '✅'
      if (!aa) status = '❌ FAIL AA'
      else if (!aaa) status = '⚠️  AA only'

      results.push({ pair: label, ratio, aa, aaa, status })

      console.log(
        `${status.padEnd(12)} ${label.padEnd(35)} ${ratio.toFixed(2)}:1 ${
          aaa ? '(AAA)' : aa ? '(AA)' : '(FAIL)'
        }`
      )
    } catch (error) {
      console.log(`⚠️  SKIP     ${label.padEnd(35)} Invalid color format`)
    }
  })

  // Summary
  const aaPass = results.filter((r) => r.aa).length
  const aaaPass = results.filter((r) => r.aaa).length
  const total = results.length

  console.log('\n' + '─'.repeat(60))
  console.log(`AA Pass:  ${aaPass}/${total} (${((aaPass / total) * 100).toFixed(0)}%)`)
  console.log(`AAA Pass: ${aaaPass}/${total} (${((aaaPass / total) * 100).toFixed(0)}%)`)

  return { results, aaPass, aaaPass, total }
}

/**
 * Run full audit
 */
function runFullAudit() {
  console.log('\n🔍 WCAG 2.2 Contrast Audit - totalaud.io Adaptive Theme Framework')
  console.log('═'.repeat(60))

  const allResults: Record<string, any> = {}

  Object.entries(palettes).forEach(([themeName, palette]) => {
    allResults[themeName] = auditTheme(themeName, palette)
  })

  // Overall summary
  console.log('\n\n📊 Overall Summary')
  console.log('═'.repeat(60))

  Object.entries(allResults).forEach(([theme, { aaPass, aaaPass, total }]) => {
    const aaPercent = ((aaPass / total) * 100).toFixed(0)
    const aaaPercent = ((aaaPass / total) * 100).toFixed(0)
    console.log(
      `${theme.padEnd(10)} AA: ${aaPercent}% (${aaPass}/${total})  AAA: ${aaaPercent}% (${aaaPass}/${total})`
    )
  })

  console.log('\n✅ Audit Complete')
}

// Run audit
runFullAudit()
