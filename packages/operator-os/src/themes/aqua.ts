/**
 * Mac OS Aqua Theme
 * Subtle glass-like theme reminiscent of Mac OS X Aqua
 */

import type { ThemeTokens } from '../types';

export const aquaTheme: ThemeTokens = {
  name: 'Aqua',
  background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',

  windowChrome: {
    background: 'rgba(22, 27, 34, 0.85)',
    border: 'rgba(58, 169, 190, 0.4)',
    titleBar: 'linear-gradient(180deg, rgba(58, 169, 190, 0.15) 0%, rgba(58, 169, 190, 0.05) 100%)',
    titleBarText: '#E0F2F7',
    buttonHover: 'rgba(58, 169, 190, 0.3)',
  },

  dock: {
    background: 'rgba(22, 27, 34, 0.8)',
    border: 'rgba(58, 169, 190, 0.2)',
    itemHover: 'rgba(58, 169, 190, 0.15)',
  },

  accent: '#3AA9BE',

  text: {
    primary: '#E0F2F7',
    secondary: '#A0B8C0',
    muted: '#6B7C86',
  },

  border: 'rgba(58, 169, 190, 0.25)',
  shadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 64px rgba(58, 169, 190, 0.05)',
};
