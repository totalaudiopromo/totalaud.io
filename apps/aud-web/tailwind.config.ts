import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // TA (totalaud.io) design system colours
        'ta-black': '#0F1113',
        'ta-panel': '#161A1D',
        'ta-cyan': '#3AA9BE',
        'ta-white': '#E9EDEF',
        'ta-grey': '#9CA3AF',
        // Extended palette
        'ta-border': 'rgba(255, 255, 255, 0.08)',
        'ta-border-light': 'rgba(255, 255, 255, 0.12)',
        'ta-muted': 'rgba(255, 255, 255, 0.5)',
        'ta-success': '#10B981',
        'ta-warning': '#F59E0B',
        'ta-error': '#EF4444',
        // Tag colours
        'tag-content': '#3AA9BE',
        'tag-brand': '#A855F7',
        'tag-music': '#22C55E',
        'tag-promo': '#F97316',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        ta: '12px',
        'ta-sm': '6px',
        'ta-pill': '9999px',
      },
      transitionDuration: {
        '120': '120ms',
        '180': '180ms',
        '240': '240ms',
      },
      boxShadow: {
        ta: '0 4px 6px rgba(0, 0, 0, 0.25)',
        'ta-lg': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'ta-glow': '0 0 20px rgba(58, 169, 190, 0.15)',
      },
      backdropBlur: {
        ta: '8px',
      },
      animation: {
        'spin-slow': 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
