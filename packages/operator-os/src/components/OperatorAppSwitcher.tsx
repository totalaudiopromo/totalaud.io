/**
 * OperatorAppSwitcher
 * Optional component for switching between apps (can be used in future iterations)
 */

'use client';

import React from 'react';
import { useOperatorStore } from '../state/operatorStore';

export function OperatorAppSwitcher() {
  const { windows, focusWindow } = useOperatorStore();

  // This is a placeholder for future app switcher UI
  // Could be triggered with ⌘Tab or similar

  return null;
}
