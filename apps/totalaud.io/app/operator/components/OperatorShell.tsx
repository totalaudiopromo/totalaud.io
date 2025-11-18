/**
 * OperatorShell
 * Manages boot sequence and OperatorOS mounting
 */

'use client';

import React, { useState } from 'react';
import { BootScreen, SignalScreen, ReadyScreen } from '@total-audio/operator-boot';
import { OperatorDesktop } from '@total-audio/operator-os';

type BootPhase = 'operator' | 'signal' | 'ready' | 'complete';

export function OperatorShell() {
  const [phase, setPhase] = useState<BootPhase>('operator');

  const handleOperatorComplete = () => {
    setPhase('signal');
  };

  const handleSignalComplete = () => {
    setPhase('ready');
  };

  const handleReadyComplete = () => {
    setPhase('complete');
  };

  return (
    <>
      {phase === 'operator' && <BootScreen onComplete={handleOperatorComplete} />}
      {phase === 'signal' && <SignalScreen onComplete={handleSignalComplete} />}
      {phase === 'ready' && <ReadyScreen onComplete={handleReadyComplete} />}
      {phase === 'complete' && <OperatorDesktop />}
    </>
  );
}
