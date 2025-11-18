/**
 * Layout Store
 * Manages window layout persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OperatorWindow } from '../types';

interface LayoutState {
  savedLayouts: Record<string, OperatorWindow[]>;
  saveLayout: (name: string, windows: OperatorWindow[]) => void;
  loadLayout: (name: string) => OperatorWindow[] | null;
  deleteLayout: (name: string) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      savedLayouts: {},

      saveLayout: (name, windows) => {
        set(state => ({
          savedLayouts: {
            ...state.savedLayouts,
            [name]: windows,
          },
        }));
      },

      loadLayout: (name) => {
        return get().savedLayouts[name] || null;
      },

      deleteLayout: (name) => {
        set(state => {
          const { [name]: _, ...rest } = state.savedLayouts;
          return { savedLayouts: rest };
        });
      },
    }),
    {
      name: 'operator-os-layouts',
    }
  )
);
