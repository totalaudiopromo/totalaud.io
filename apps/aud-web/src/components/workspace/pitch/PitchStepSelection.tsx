import { motion } from 'framer-motion'
import { StaggeredEntrance, StaggerItem } from '@/components/ui/StaggeredEntrance'
import { CrossModePrompt } from '@/components/workspace/CrossModePrompt'
import { PITCH_TYPES } from './PitchUtils'
import { PitchType } from '@/stores/usePitchStore'

interface PitchStepSelectionProps {
  onSelect: (type: PitchType) => void
}

export function PitchStepSelection({ onSelect }: PitchStepSelectionProps) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[500px] h-full p-6 overflow-y-auto"
      role="region"
      aria-label="Pitch type selection"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl font-semibold text-ta-white mb-2 tracking-tight">
          No pitches yet.
        </h2>
        <p className="text-sm text-ta-grey max-w-md mx-auto">
          Choose an opportunity to write a pitch.
        </p>
      </motion.div>

      <div role="radiogroup" aria-label="Pitch type options">
        <StaggeredEntrance className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-2xl w-full">
          {PITCH_TYPES.map((type) => (
            <StaggerItem key={type.key} className="h-full">
              <motion.button
                onClick={() => onSelect(type.key)}
                aria-label={`${type.label}: ${type.description}`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group w-full h-full flex flex-col items-start text-left p-6 rounded-xl bg-[#161A1D] border border-white/5 hover:border-ta-cyan/30 hover:shadow-[0_4px_20px_-10px_rgba(58,169,190,0.3)] transition-all duration-300 relative overflow-hidden"
              >
                {/* Hover Gradient */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-ta-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  aria-hidden="true"
                />

                <span className="relative z-10 text-base font-semibold text-ta-white group-hover:text-white mb-2 block">
                  {type.label}
                </span>
                <span className="relative z-10 text-xs text-ta-grey leading-relaxed">
                  {type.description}
                </span>
              </motion.button>
            </StaggerItem>
          ))}
        </StaggeredEntrance>
      </div>

      {/* Cross-mode prompt */}
      <CrossModePrompt currentMode="pitch" />
    </div>
  )
}
