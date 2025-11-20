/**
 * Theme System Index
 * Exports all theme configurations
 */

import { xpTheme } from './xp';
import { aquaTheme } from './aqua';
import { dawTheme } from './daw';
import { asciiTheme } from './ascii';
import { analogueTheme } from './analogue';
import type { OperatorOSTheme } from '../types';

export const themes = {
  xp: xpTheme,
  aqua: aquaTheme,
  daw: dawTheme,
  ascii: asciiTheme,
  analogue: analogueTheme,
} as const;

export type { OperatorOSTheme };

export { xpTheme, aquaTheme, dawTheme, asciiTheme, analogueTheme };
