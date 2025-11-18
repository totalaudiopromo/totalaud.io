'use client';

import { GestureCard, type HardwareGesture } from './GestureCard';

interface GestureListProps {
  gestures: HardwareGesture[];
  onDelete: (id: string) => void;
  onInspect: (gesture: HardwareGesture) => void;
}

export function GestureList({ gestures, onDelete, onInspect }: GestureListProps) {
  if (gestures.length === 0) {
    return (
      <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-12 text-centre">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Gestures Yet</h3>
        <p className="text-gray-400">
          Create your first gesture to unlock advanced hardware control patterns.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {gestures.map((gesture) => (
        <GestureCard
          key={gesture.id}
          gesture={gesture}
          onDelete={onDelete}
          onInspect={onInspect}
        />
      ))}
    </div>
  );
}
