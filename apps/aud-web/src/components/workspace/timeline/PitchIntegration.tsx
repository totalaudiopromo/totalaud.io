interface PitchIntegrationProps {
  onCreatePitch: () => void
}

export function PitchIntegration({ onCreatePitch }: PitchIntegrationProps) {
  return (
    <div className="mb-4">
      <button
        onClick={onCreatePitch}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium text-purple-400 bg-purple-500/10 border border-purple-500/25 rounded-lg hover:bg-purple-500/15 hover:text-purple-300 transition-all"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
        Create Pitch from Event
      </button>
    </div>
  )
}
