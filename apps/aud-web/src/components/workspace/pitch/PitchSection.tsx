import { StaggerItem } from '@/components/ui/StaggeredEntrance'
import { CopyButton } from '@/components/ui/CopyButton'
import { CoachAction } from '@/stores/usePitchStore'

interface PitchSectionProps {
  section: {
    id: string
    title: string
    content: string
    placeholder: string
  }
  isSelected: boolean
  isCoachLoading: boolean
  onSelect: () => void
  onUpdate: (val: string) => void
  onCoachAction: (action: CoachAction) => void
  onCopy: () => void
}

export function PitchSection({
  section,
  isSelected,
  isCoachLoading,
  onSelect,
  onUpdate,
  onCoachAction,
  onCopy,
}: PitchSectionProps) {
  return (
    <StaggerItem
      className={`
        group rounded-xl border transition-all duration-300 overflow-hidden
        ${
          isSelected
            ? 'bg-[#161A1D]/80 border-ta-cyan/30 shadow-[0_0_20px_-10px_rgba(58,169,190,0.2)]'
            : 'bg-transparent border-white/5 hover:border-white/10'
        }
      `}
    >
      {/* Section header with coach actions */}
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-ta-cyan">{section.title}</span>
        </div>

        {/* Coach action buttons */}
        <div
          className="flex flex-wrap items-center gap-2 transition-opacity duration-200"
          role="group"
          aria-label="Pitch refinement actions"
        >
          {section.content && (
            <CopyButton
              text={section.content}
              onCopy={onCopy}
              className="text-[10px] py-1 px-2 h-auto"
            />
          )}
          {(['improve', 'suggest', 'rewrite'] as CoachAction[]).map((action) => (
            <button
              key={action}
              onClick={() => onCoachAction(action)}
              disabled={isCoachLoading}
              aria-label={`${action} ${section.title}`}
              className="px-2.5 py-1 text-[10px] font-medium text-ta-grey hover:text-white hover:bg-white/10 rounded transition-colors capitalize disabled:opacity-50 disabled:cursor-wait"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Placeholder hint (only when empty) */}
      {!section.content && (
        <div
          id={`${section.id}-hint`}
          className="px-5 py-3 bg-ta-cyan/[0.03] border-b border-ta-cyan/5"
        >
          <span className="text-xs text-ta-cyan/70 italic leading-relaxed">
            {section.placeholder}
          </span>
        </div>
      )}

      {/* Content textarea */}
      <textarea
        value={section.content}
        onChange={(e) => onUpdate(e.target.value)}
        onFocus={onSelect}
        placeholder="Start writing..."
        aria-label={`${section.title} content`}
        aria-describedby={!section.content ? `${section.id}-hint` : undefined}
        className="w-full min-h-[120px] p-5 text-sm leading-relaxed text-ta-white bg-transparent border-none outline-none resize-none placeholder:text-ta-grey/30 focus:bg-white/[0.01] transition-colors"
        style={{ resize: 'vertical' }}
      />
    </StaggerItem>
  )
}
