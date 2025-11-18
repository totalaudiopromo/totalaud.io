/**
 * Theme Store
 * Manages theme persistence and provides theme tokens
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OperatorOSTheme } from '../types';
import { themes } from '../themes';

interface ThemeState {
  currentTheme: OperatorOSTheme;
  setTheme: (theme: OperatorOSTheme) => void;
  getThemeTokens: () => ReturnType<typeof themes[OperatorOSTheme]>;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: 'daw',

      setTheme: (theme) => {
        set({ currentTheme: theme });
      },

      getThemeTokens: () => {
        const theme = get().currentTheme;
        return themes[theme];
      },
    }),
    {
      name: 'operator-os-theme',
    }
  )
);
