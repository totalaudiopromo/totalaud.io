/**
 * Windows XP Theme
 * Nostalgic Windows XP vibe with modern Flow State aesthetics
 */

import type { ThemeTokens } from '../types';

export const xpTheme: ThemeTokens = {
  name: 'Windows XP',
  background: 'linear-gradient(180deg, #0a0e12 0%, #141b24 100%)',

  windowChrome: {
    background: 'linear-gradient(180deg, #1a2332 0%, #0f1419 100%)',
    border: '#3AA9BE',
    titleBar: 'linear-gradient(90deg, #2a3f5f 0%, #1a2f4f 100%)',
    titleBarText: '#E0F2F7',
    buttonHover: '#3AA9BE',
  },

  dock: {
    background: 'rgba(20, 27, 36, 0.95)',
    border: 'rgba(58, 169, 190, 0.3)',
    itemHover: 'rgba(58, 169, 190, 0.2)',
  },

  accent: '#3AA9BE',

  text: {
    primary: '#E0F2F7',
    secondary: '#A0B8C0',
    muted: '#6B7C86',
  },

  border: 'rgba(58, 169, 190, 0.3)',
  shadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
};
