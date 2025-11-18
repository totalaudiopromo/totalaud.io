'use client';

interface JSONViewerProps {
  data: unknown;
  collapsed?: boolean;
}

export function JSONViewer({ data, collapsed = false }: JSONViewerProps) {
  return (
    <pre className="bg-[#0B0E11] text-[#3AA9BE] p-4 rounded-lg border border-[#2A2C30] overflow-x-auto font-mono text-sm">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
