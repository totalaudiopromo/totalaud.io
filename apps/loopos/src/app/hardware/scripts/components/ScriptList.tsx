'use client';

import { ScriptCard, type HardwareScript } from './ScriptCard';

interface ScriptListProps {
  scripts: HardwareScript[];
  onDelete: (id: string) => void;
  onRun: (script: HardwareScript) => void;
  onEdit: (script: HardwareScript) => void;
}

export function ScriptList({ scripts, onDelete, onRun, onEdit }: ScriptListProps) {
  if (scripts.length === 0) {
    return (
      <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-12 text-centre">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Scripts Yet</h3>
        <p className="text-gray-400">
          Create your first script to automate multi-step hardware workflows.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {scripts.map((script) => (
        <ScriptCard
          key={script.id}
          script={script}
          onDelete={onDelete}
          onRun={onRun}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
