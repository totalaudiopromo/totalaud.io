/**
 * ASCII Theme
 * Terminal / retro aesthetic with monospace heavy design
 */

import type { ThemeTokens } from '../types';

export const asciiTheme: ThemeTokens = {
  name: 'ASCII',
  background: '#000000',

  windowChrome: {
    background: '#0a0a0a',
    border: '#3AA9BE',
    titleBar: '#0f0f0f',
    titleBarText: '#3AA9BE',
    buttonHover: 'rgba(58, 169, 190, 0.2)',
  },

  dock: {
    background: '#0a0a0a',
    border: '#3AA9BE',
    itemHover: 'rgba(58, 169, 190, 0.15)',
  },

  accent: '#3AA9BE',

  text: {
    primary: '#3AA9BE',
    secondary: '#7ec8d3',
    muted: '#4a7882',
  },

  border: '#3AA9BE',
  shadow: 'none',
};
