/**
 * DAW Theme
 * Digital Audio Workstation vibe with tracks and grid lines
 */

import type { ThemeTokens } from '../types';

export const dawTheme: ThemeTokens = {
  name: 'DAW',
  background: 'linear-gradient(180deg, #0a0e12 0%, #12171d 100%)',

  windowChrome: {
    background: '#0f1419',
    border: '#3AA9BE',
    titleBar: 'linear-gradient(90deg, #1a1f26 0%, #0f1419 100%)',
    titleBarText: '#3AA9BE',
    buttonHover: 'rgba(58, 169, 190, 0.3)',
  },

  dock: {
    background: 'rgba(15, 20, 25, 0.95)',
    border: 'rgba(58, 169, 190, 0.4)',
    itemHover: 'rgba(58, 169, 190, 0.25)',
  },

  accent: '#3AA9BE',

  text: {
    primary: '#E0F2F7',
    secondary: '#A0B8C0',
    muted: '#6B7C86',
  },

  border: 'rgba(58, 169, 190, 0.4)',
  shadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
  noise: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(58, 169, 190, 0.02) 2px, rgba(58, 169, 190, 0.02) 4px)',
};
