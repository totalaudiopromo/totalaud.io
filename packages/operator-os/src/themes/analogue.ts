/**
 * Analogue Theme
 * Warm, tactile, hardware-inspired aesthetic
 */

import type { ThemeTokens } from '../types';

export const analogueTheme: ThemeTokens = {
  name: 'Analogue',
  background: 'linear-gradient(180deg, #1a1410 0%, #0f0a08 100%)',

  windowChrome: {
    background: 'linear-gradient(180deg, #2a2118 0%, #1a1410 100%)',
    border: '#d4a574',
    titleBar: 'linear-gradient(90deg, #3a2d1e 0%, #2a2118 100%)',
    titleBarText: '#f5e6d3',
    buttonHover: 'rgba(212, 165, 116, 0.3)',
  },

  dock: {
    background: 'rgba(26, 20, 16, 0.95)',
    border: 'rgba(212, 165, 116, 0.3)',
    itemHover: 'rgba(212, 165, 116, 0.2)',
  },

  accent: '#d4a574',

  text: {
    primary: '#f5e6d3',
    secondary: '#c4b5a2',
    muted: '#8a7d6f',
  },

  border: 'rgba(212, 165, 116, 0.3)',
  shadow: '0 6px 24px rgba(0, 0, 0, 0.6)',
  noise: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(212, 165, 116, 0.03) 1px, rgba(212, 165, 116, 0.03) 2px)',
};
